import {
  Allocation,
  DeliveryPartner,
  FoodListing,
  AllocationStatus,
  AuditRecord,
  NotificationItem,
  TrustScoreEvent
} from '../types';
import { calculateDistanceKm } from './matchingEngine';

export interface FailoverResult {
  updatedAllocation: Allocation;
  replacementDriver?: DeliveryPartner;
  isEligibleForReassignment: boolean;
  rejectionReason?: string;
  auditRecord: AuditRecord;
  notification: NotificationItem;
  trustScoreEvent?: TrustScoreEvent;
}

export function triggerDeliveryFailover(
  allocation: Allocation,
  listing: FoodListing,
  drivers: DeliveryPartner[],
  reason: string,
  currentSimulatedTime: string,
  actorName: string
): FailoverResult {
  const currentTime = new Date(currentSimulatedTime).getTime();
  const deadlineTime = new Date(listing.collectionDeadline).getTime();
  const minutesRemaining = Math.round((deadlineTime - currentTime) / (60 * 1000));

  // Check if food has already spoiled or passed deadline
  if (minutesRemaining <= 10) {
    const expiredTimeline = [
      ...allocation.timeline,
      {
        timestamp: currentSimulatedTime,
        status: 'cancelled' as AllocationStatus,
        actor: 'Logistics Failover Arbiter',
        note: `Failover rejected: only ${minutesRemaining} mins remain before collection deadline. Food declared ineligible for re-dispatch to prevent safety compromise.`
      }
    ];

    const failedAllocation: Allocation = {
      ...allocation,
      status: 'cancelled',
      failureReason: reason,
      updatedAt: currentSimulatedTime,
      timeline: expiredTimeline
    };

    return {
      updatedAllocation: failedAllocation,
      isEligibleForReassignment: false,
      rejectionReason: `Perishability deadline exceeded (${minutesRemaining} mins left). Automatic safety lockout applied.`,
      auditRecord: {
        id: `aud-${Date.now().toString().slice(-4)}`,
        entityId: allocation.id,
        entityType: 'allocation',
        action: 'FAILOVER_SAFETY_TERMINATED',
        previousState: allocation.status,
        newState: 'cancelled',
        actor: 'Logistics Safety Sentinel',
        role: 'admin',
        reason: `Collection window closed (${minutesRemaining} mins). Food safety cannot be guaranteed.`,
        timestamp: currentSimulatedTime
      },
      notification: {
        id: `notif-${Date.now().toString().slice(-4)}`,
        title: 'Delivery Aborted — Expiry Protection',
        message: `Task ${allocation.id} could not be reassigned: deadline window passed. Batch scheduled for safety compost review.`,
        category: 'safety',
        unread: true,
        timestamp: currentSimulatedTime,
        linkToTab: 'perishability'
      }
    };
  }

  // Find candidate replacement drivers excluding the failed driver
  const eligibleDrivers = drivers.filter(d => {
    if (d.id === allocation.deliveryPartnerId) return false;
    if (d.status !== 'available') return false;
    if (listing.storageRequirement === 'refrigerated' && !d.hasCooling) return false;
    if (listing.storageRequirement === 'hot_insulated' && !d.hasHotInsulation) return false;
    return true;
  });

  if (eligibleDrivers.length === 0) {
    const stalledTimeline = [
      ...allocation.timeline,
      {
        timestamp: currentSimulatedTime,
        status: 'pickup_failed' as AllocationStatus,
        actor: actorName,
        note: `Pickup failed: ${reason}. System queued for priority driver standby (no qualified courier currently free).`
      }
    ];

    return {
      updatedAllocation: {
        ...allocation,
        status: 'pickup_failed',
        failureReason: reason,
        updatedAt: currentSimulatedTime,
        timeline: stalledTimeline
      },
      isEligibleForReassignment: false,
      rejectionReason: 'No qualified delivery partner with required thermal gear currently available in the zone.',
      auditRecord: {
        id: `aud-${Date.now().toString().slice(-4)}`,
        entityId: allocation.id,
        entityType: 'allocation',
        action: 'PICKUP_FAILED_NO_STANDBY',
        previousState: allocation.status,
        newState: 'pickup_failed',
        actor: actorName,
        role: 'driver',
        reason,
        timestamp: currentSimulatedTime
      },
      notification: {
        id: `notif-${Date.now().toString().slice(-4)}`,
        title: 'Courier Alert: Standby Dispatch Needed',
        message: `Driver reported failure on ${allocation.id}. Manual courier allocation requested by operations.`,
        category: 'delivery',
        unread: true,
        timestamp: currentSimulatedTime,
        linkToTab: 'logistics'
      }
    };
  }

  // Select the closest qualified driver to the pickup address
  const replacement = [...eligibleDrivers].sort((a, b) => {
    const distA = calculateDistanceKm(a.currentLocation.lat, a.currentLocation.lng, listing.pickupLocation.lat, listing.pickupLocation.lng);
    const distB = calculateDistanceKm(b.currentLocation.lat, b.currentLocation.lng, listing.pickupLocation.lat, listing.pickupLocation.lng);
    return distA - distB;
  })[0];

  const travelKm = calculateDistanceKm(replacement.currentLocation.lat, replacement.currentLocation.lng, listing.pickupLocation.lat, listing.pickupLocation.lng);
  const etaMins = Math.round(travelKm * 3 + 4);

  const newTimeline = [
    ...allocation.timeline,
    {
      timestamp: currentSimulatedTime,
      status: 'pickup_failed' as AllocationStatus,
      actor: actorName,
      note: `Courier exception logged: ${reason}`
    },
    {
      timestamp: currentSimulatedTime,
      status: 'reassigned' as AllocationStatus,
      actor: 'Logistics Optimization Engine',
      note: `Dynamic Failover: Auto-reassigned to ${replacement.name} (${replacement.vehicleType}, ${travelKm}km away). ETA: ${etaMins} mins. Remaining shelf-life: ${minutesRemaining}m.`
    }
  ];

  const updatedAllocation: Allocation = {
    ...allocation,
    status: 'reassigned',
    originalPartnerId: allocation.originalPartnerId || allocation.deliveryPartnerId,
    deliveryPartnerId: replacement.id,
    failureReason: reason,
    reassignmentReason: `Dynamic Failover: Reassigned to ${replacement.name} due to: ${reason}`,
    updatedAt: currentSimulatedTime,
    timeline: newTimeline
  };

  const auditRecord: AuditRecord = {
    id: `aud-${Date.now().toString().slice(-4)}`,
    entityId: allocation.id,
    entityType: 'allocation',
    action: 'DYNAMIC_REASSIGNMENT',
    previousState: 'pickup_failed',
    newState: 'reassigned',
    actor: 'Logistics Optimization Engine',
    role: 'admin',
    reason: `Original driver failed (${reason}). Reassigned to ${replacement.name} within ${minutesRemaining}m safety deadline.`,
    timestamp: currentSimulatedTime
  };

  const notification: NotificationItem = {
    id: `notif-${Date.now().toString().slice(-4)}`,
    title: 'Dynamic Failover Activated',
    message: `Run ${allocation.id} reassigned to ${replacement.name} (${replacement.vehicleType}). Pickup ETA: ${etaMins} mins.`,
    category: 'delivery',
    unread: true,
    timestamp: currentSimulatedTime,
    linkToTab: 'logistics'
  };

  return {
    updatedAllocation,
    replacementDriver: replacement,
    isEligibleForReassignment: true,
    auditRecord,
    notification
  };
}

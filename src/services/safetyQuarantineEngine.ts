import {
  SafetyIncident,
  FoodListing,
  Allocation,
  AuditRecord,
  NotificationItem,
  TrustScoreEvent
} from '../types';

export interface QuarantineExecutionResult {
  incident: SafetyIncident;
  updatedListing: FoodListing;
  affectedAllocations: Allocation[];
  auditRecords: AuditRecord[];
  notifications: NotificationItem[];
}

export function executeSafetyQuarantine(
  incidentData: Omit<SafetyIncident, 'id' | 'status' | 'createdAt'>,
  listing: FoodListing,
  allocations: Allocation[],
  currentSimulatedTime: string
): QuarantineExecutionResult {
  const incidentId = `inc-${Date.now().toString().slice(-4)}`;
  const fullIncident: SafetyIncident = {
    ...incidentData,
    id: incidentId,
    status: 'quarantined',
    createdAt: currentSimulatedTime
  };

  // Lock the listing immediately
  const updatedListing: FoodListing = {
    ...listing,
    quarantined: true,
    quarantineReason: `Safety Quarantine (${fullIncident.severity.toUpperCase()}): ${fullIncident.description}`,
    status: 'quarantined'
  };

  // Flag or halt any non-delivered allocations linked to this listing
  const updatedAllocations = allocations.map(alloc => {
    if (alloc.listingId === listing.id && alloc.status !== 'delivered') {
      return {
        ...alloc,
        status: 'quarantined' as const,
        failureReason: `Safety Quarantine Order ${incidentId}: ${fullIncident.incidentCategory}`,
        updatedAt: currentSimulatedTime,
        timeline: [
          ...alloc.timeline,
          {
            timestamp: currentSimulatedTime,
            status: 'quarantined' as const,
            actor: 'Automated Food-Safety Sentinel',
            note: `Halted: Safety complaint filed by ${fullIncident.reporterName}. Batch locked pending inspection.`
          }
        ]
      };
    }
    return alloc;
  });

  const auditRecords: AuditRecord[] = [
    {
      id: `aud-${Date.now().toString().slice(-4)}-1`,
      entityId: listing.id,
      entityType: 'listing',
      action: 'QUARANTINE_LOCKED',
      previousState: listing.status,
      newState: 'quarantined',
      actor: fullIncident.reporterName,
      role: fullIncident.reporterRole,
      reason: `Safety report: ${fullIncident.description}`,
      timestamp: currentSimulatedTime
    },
    {
      id: `aud-${Date.now().toString().slice(-4)}-2`,
      entityId: incidentId,
      entityType: 'incident',
      action: 'INCIDENT_RECORDED',
      actor: 'Safety Subsystem',
      role: 'admin',
      reason: `Severity: ${fullIncident.severity}. Category: ${fullIncident.incidentCategory}`,
      timestamp: currentSimulatedTime
    }
  ];

  const notifications: NotificationItem[] = [
    {
      id: `notif-${Date.now().toString().slice(-4)}-1`,
      title: 'CRITICAL: Safety Quarantine Active',
      message: `Batch "${listing.foodName}" locked due to ${fullIncident.incidentCategory.replace('_', ' ')}. All pending allocations frozen.`,
      category: 'safety',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'safety'
    },
    {
      id: `notif-${Date.now().toString().slice(-4)}-2`,
      title: 'Incident Under Review',
      message: `New safety ticket ${incidentId} logged by ${fullIncident.reporterName}. Action required by Central Admin.`,
      category: 'safety',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'safety'
    }
  ];

  return {
    incident: fullIncident,
    updatedListing,
    affectedAllocations: updatedAllocations,
    auditRecords,
    notifications
  };
}

export function resolveSafetyIncident(
  incident: SafetyIncident,
  decision: 'resolved_cleared' | 'resolved_penalized',
  resolutionNotes: string,
  reviewerName: string,
  listing: FoodListing,
  currentSimulatedTime: string
): {
  updatedIncident: SafetyIncident;
  updatedListing: FoodListing;
  trustScoreEvent?: TrustScoreEvent;
  auditRecord: AuditRecord;
  notification: NotificationItem;
} {
  const updatedIncident: SafetyIncident = {
    ...incident,
    status: decision,
    resolutionNotes,
    resolvedBy: reviewerName,
    resolvedAt: currentSimulatedTime
  };

  let trustScoreEvent: TrustScoreEvent | undefined = undefined;
  let updatedListing: FoodListing = { ...listing };

  if (decision === 'resolved_penalized') {
    // Penalty applied according to transparent safety policy
    trustScoreEvent = {
      id: `tr-${Date.now().toString().slice(-4)}`,
      entityId: listing.donorId,
      entityName: `Donor (Batch: ${listing.foodName})`,
      entityType: 'donor',
      scoreDelta: -8,
      newScore: 82, // adjusted in context
      reason: `Verified food-safety non-conformance (${incident.incidentCategory}): ${resolutionNotes}`,
      verifiedOutcome: true,
      timestamp: currentSimulatedTime
    };
    // Listing remains permanently archived/quarantined
    updatedListing.status = 'quarantined';
  } else {
    // False alarm or cleared by temperature probe check
    updatedListing.quarantined = false;
    updatedListing.quarantineReason = undefined;
    updatedListing.status = updatedListing.remainingQuantity > 0 ? 'active' : 'fully_allocated';
  }

  const auditRecord: AuditRecord = {
    id: `aud-${Date.now().toString().slice(-4)}`,
    entityId: incident.id,
    entityType: 'incident',
    action: decision === 'resolved_cleared' ? 'INCIDENT_CLEARED' : 'INCIDENT_PENALIZED',
    previousState: 'quarantined',
    newState: decision,
    actor: reviewerName,
    role: 'admin',
    reason: resolutionNotes,
    timestamp: currentSimulatedTime
  };

  const notification: NotificationItem = {
    id: `notif-${Date.now().toString().slice(-4)}`,
    title: decision === 'resolved_cleared' ? 'Quarantine Lifted' : 'Safety Violation Confirmed',
    message: `Incident ${incident.id} reviewed by ${reviewerName}: ${resolutionNotes}`,
    category: 'safety',
    unread: true,
    timestamp: currentSimulatedTime,
    linkToTab: 'safety'
  };

  return {
    updatedIncident,
    updatedListing,
    trustScoreEvent,
    auditRecord,
    notification
  };
}

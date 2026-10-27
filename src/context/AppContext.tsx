import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  UserProfile,
  FoodListing,
  Recipient,
  Donor,
  DeliveryPartner,
  RecipientRequest,
  Allocation,
  SafetyIncident,
  TrustScoreEvent,
  AuditRecord,
  NotificationItem,
  AllocationStatus
} from '../types';
import {
  INITIAL_DEMO_TIME,
  SEED_DONORS,
  SEED_RECIPIENTS,
  SEED_DRIVERS,
  SEED_LISTINGS,
  SEED_REQUESTS,
  SEED_ALLOCATIONS,
  SEED_INCIDENTS,
  SEED_TRUST_EVENTS,
  SEED_AUDIT_LOGS,
  SEED_NOTIFICATIONS
} from '../data/seedData';
import { evaluateListingMatches } from '../services/matchingEngine';
import { triggerDeliveryFailover } from '../services/logisticsEngine';
import { executeSafetyQuarantine, resolveSafetyIncident } from '../services/safetyQuarantineEngine';

interface AppContextType {
  currentUser: UserProfile | null;
  login: (profile: Omit<UserProfile, 'isLoggedIn'>) => void;
  logout: () => void;
  isRealTimeActive: boolean;
  setIsRealTimeActive: (active: boolean) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentSimulatedTime: string;
  advanceSimulatedTime: (minutes: number) => void;
  resetSimulatedTime: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  donors: Donor[];
  recipients: Recipient[];
  drivers: DeliveryPartner[];
  listings: FoodListing[];
  requests: RecipientRequest[];
  allocations: Allocation[];
  incidents: SafetyIncident[];
  trustEvents: TrustScoreEvent[];
  auditLogs: AuditRecord[];
  notifications: NotificationItem[];

  // Mutations
  addListing: (listing: FoodListing) => void;
  updateListing: (id: string, updates: Partial<FoodListing>) => void;
  addRequest: (request: RecipientRequest) => void;
  createAllocation: (listingId: string, recipientId: string, quantity: number, driverId?: string) => Allocation | null;
  updateAllocationStatus: (allocationId: string, newStatus: AllocationStatus, actor: string, note: string) => void;
  verifyPickup: (allocationId: string, token: string, notes?: string) => { success: boolean; message: string };
  verifyDropoff: (allocationId: string, token: string, receivedQty: number, notes?: string) => { success: boolean; message: string };
  reportIncident: (data: Omit<SafetyIncident, 'id' | 'status' | 'createdAt'>) => void;
  resolveIncident: (incidentId: string, decision: 'resolved_cleared' | 'resolved_penalized', notes: string) => void;
  failoverDelivery: (allocationId: string, reason: string) => boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetToDefaultData: () => void;

  // Signature Live Simulation Scenarios
  isSimulationRunning: boolean;
  simulationStep: number;
  simulationMessage: string;
  runRescueMissionSimulation: () => Promise<void>;
  runSafetyQuarantineSimulation: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'foodbridge_demo_state_v1';

const DEFAULT_USER: UserProfile = {
  id: 'usr-101',
  name: 'Marcus Sterling',
  email: 'marcus@grandamber.com',
  phone: '+1 (555) 234-8900',
  organizationName: 'Grand Amber Hotel & Banquet',
  role: 'donor',
  address: '450 Lexington Ave, Metro Central',
  city: 'Metro Central',
  isLoggedIn: true,
  avatar: 'MS',
  joinedDate: 'Oct 2026'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });

  const [role, setRole] = useState<UserRole>(() => {
    return currentUser?.role || 'donor';
  });

  const [isRealTimeActive, setIsRealTimeActive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentSimulatedTime, setCurrentSimulatedTime] = useState<string>(INITIAL_DEMO_TIME);

  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_donors');
    return saved ? JSON.parse(saved) : SEED_DONORS;
  });

  const [recipients, setRecipients] = useState<Recipient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_recipients');
    return saved ? JSON.parse(saved) : SEED_RECIPIENTS;
  });

  const [drivers, setDrivers] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_drivers');
    return saved ? JSON.parse(saved) : SEED_DRIVERS;
  });

  const [listings, setListings] = useState<FoodListing[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_listings');
    return saved ? JSON.parse(saved) : SEED_LISTINGS;
  });

  const [requests, setRequests] = useState<RecipientRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_requests');
    return saved ? JSON.parse(saved) : SEED_REQUESTS;
  });

  const [allocations, setAllocations] = useState<Allocation[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_allocations');
    return saved ? JSON.parse(saved) : SEED_ALLOCATIONS;
  });

  const [incidents, setIncidents] = useState<SafetyIncident[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_incidents');
    return saved ? JSON.parse(saved) : SEED_INCIDENTS;
  });

  const [trustEvents, setTrustEvents] = useState<TrustScoreEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_trust');
    return saved ? JSON.parse(saved) : SEED_TRUST_EVENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_audit');
    return saved ? JSON.parse(saved) : SEED_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY + '_notifs');
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  // Simulation states
  const [isSimulationRunning, setIsSimulationRunning] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulationMessage, setSimulationMessage] = useState<string>('');

  // Persist state updates
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + '_listings', JSON.stringify(listings));
    localStorage.setItem(STORAGE_KEY + '_allocations', JSON.stringify(allocations));
    localStorage.setItem(STORAGE_KEY + '_incidents', JSON.stringify(incidents));
    localStorage.setItem(STORAGE_KEY + '_trust', JSON.stringify(trustEvents));
    localStorage.setItem(STORAGE_KEY + '_audit', JSON.stringify(auditLogs));
    localStorage.setItem(STORAGE_KEY + '_notifs', JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEY + '_requests', JSON.stringify(requests));
  }, [listings, allocations, incidents, trustEvents, auditLogs, notifications, requests]);

  const advanceSimulatedTime = (minutes: number) => {
    const cur = new Date(currentSimulatedTime).getTime();
    const updated = new Date(cur + minutes * 60 * 1000).toISOString();
    setCurrentSimulatedTime(updated);

    // Add audit log for demo clock
    const newAudit: AuditRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      entityId: 'SYSTEM_CLOCK',
      entityType: 'system',
      action: 'CLOCK_ADVANCED',
      actor: 'Demo Controller',
      role,
      reason: `Simulated clock advanced by +${minutes} minutes.`,
      timestamp: updated
    };
    setAuditLogs(prev => [newAudit, ...prev]);

    // Check for newly expired listings
    setListings(prev =>
      prev.map(item => {
        if (item.status === 'active' || item.status === 'partially_allocated') {
          if (new Date(item.collectionDeadline).getTime() <= new Date(updated).getTime()) {
            return { ...item, status: 'expired' };
          }
        }
        return item;
      })
    );
  };

  const resetSimulatedTime = () => {
    setCurrentSimulatedTime(INITIAL_DEMO_TIME);
  };

  const addListing = (listing: FoodListing) => {
    setListings(prev => [listing, ...prev]);
    const audit: AuditRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      entityId: listing.id,
      entityType: 'listing',
      action: 'LISTING_PUBLISHED',
      previousState: 'draft',
      newState: 'active',
      actor: donors.find(d => d.id === listing.donorId)?.name || 'Food Donor',
      role: 'donor',
      reason: `Registered ${listing.quantity} ${listing.unit} of "${listing.foodName}".`,
      timestamp: currentSimulatedTime
    };
    const notif: NotificationItem = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      title: 'New Surplus Food Available',
      message: `"${listing.foodName}" (${listing.quantity} ${listing.unit}) available for matching.`,
      category: 'match',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'matching'
    };
    setAuditLogs(prev => [audit, ...prev]);
    setNotifications(prev => [notif, ...prev]);
  };

  const updateListing = (id: string, updates: Partial<FoodListing>) => {
    setListings(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
  };

  const addRequest = (req: RecipientRequest) => {
    setRequests(prev => [req, ...prev]);
    const notif: NotificationItem = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      title: 'New Recipient Hunger Request',
      message: `Need registered for ${req.quantityNeeded} ${req.unit} (${req.category.replace('_', ' ')}).`,
      category: 'match',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'requests'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const createAllocation = (
    listingId: string,
    recipientId: string,
    quantity: number,
    driverId?: string
  ): Allocation | null => {
    const listing = listings.find(l => l.id === listingId);
    const recipient = recipients.find(r => r.id === recipientId);
    if (!listing || !recipient) return null;

    if (listing.quarantined || listing.status === 'quarantined') {
      alert('Allocation Blocked: This food batch is under quarantine hold.');
      return null;
    }

    if (quantity > listing.remainingQuantity) {
      alert(`Cannot allocate ${quantity} ${listing.unit}: Only ${listing.remainingQuantity} available.`);
      return null;
    }

    // Evaluate matching engine scores
    const matchScores = evaluateListingMatches(listing, [recipient], requests, drivers, currentSimulatedTime);
    const evaluated = matchScores[0];

    const chosenDriver = driverId
      ? drivers.find(d => d.id === driverId)
      : evaluated?.recommendedDriver || drivers.find(d => d.status === 'available');

    const allocId = `alloc-${Date.now().toString().slice(-4)}`;
    const pickupToken = `PKUP-${listing.id.slice(-3)}-${Math.floor(100 + Math.random() * 900)}`;
    const dropoffToken = `DROP-${recipient.id.slice(-3)}-${Math.floor(100 + Math.random() * 900)}`;

    const newAllocation: Allocation = {
      id: allocId,
      listingId,
      recipientId,
      deliveryPartnerId: chosenDriver?.id,
      quantityAllocated: quantity,
      unit: listing.unit,
      matchScore: evaluated ? evaluated.matchScore : 90,
      matchExplanation: evaluated
        ? evaluated.explanation
        : {
            matchScore: 90,
            passedHardConstraints: true,
            safetyChecks: [],
            positiveFactors: ['Manual allocation authorized by coordinator'],
            tradeOffs: [],
            estimatedDistanceKm: 2.0,
            estimatedTravelMinutes: 10,
            capacityFitPercentage: 100,
            urgencyBonus: 10,
            fairnessAdjustment: 0
          },
      status: 'accepted',
      pickupToken,
      dropoffToken,
      timeline: [
        {
          timestamp: currentSimulatedTime,
          status: 'proposed',
          actor: 'AI Matching Engine',
          note: `Matched ${quantity} ${listing.unit} to ${recipient.name} with score ${evaluated?.matchScore || 90}/100.`
        },
        {
          timestamp: currentSimulatedTime,
          status: 'accepted',
          actor: `${recipient.name} Coordinator`,
          note: `Confirmed acceptance of ${quantity} ${listing.unit}. Assigned courier: ${chosenDriver?.name || 'Pending'}.`
        }
      ],
      createdAt: currentSimulatedTime,
      updatedAt: currentSimulatedTime
    };

    // Update remaining quantity
    const newRemaining = listing.remainingQuantity - quantity;
    const newStatus = newRemaining === 0 ? 'fully_allocated' : 'partially_allocated';

    setListings(prev =>
      prev.map(l => (l.id === listingId ? { ...l, remainingQuantity: newRemaining, status: newStatus } : l))
    );

    setAllocations(prev => [newAllocation, ...prev]);

    // Audit and notification
    const audit: AuditRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      entityId: allocId,
      entityType: 'allocation',
      action: 'ALLOCATION_CREATED',
      previousState: 'none',
      newState: 'accepted',
      actor: 'AI Match Engine',
      role: 'admin',
      reason: `Allocated ${quantity} ${listing.unit} to ${recipient.name}. Remaining in batch: ${newRemaining}.`,
      timestamp: currentSimulatedTime
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      title: 'Allocation Confirmed',
      message: `${quantity} ${listing.unit} of "${listing.foodName}" routed to ${recipient.name}.`,
      category: 'match',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'logistics'
    };

    setAuditLogs(prev => [audit, ...prev]);
    setNotifications(prev => [notif, ...prev]);

    return newAllocation;
  };

  const updateAllocationStatus = (
    allocationId: string,
    newStatus: AllocationStatus,
    actor: string,
    note: string
  ) => {
    setAllocations(prev =>
      prev.map(alloc => {
        if (alloc.id === allocationId) {
          return {
            ...alloc,
            status: newStatus,
            updatedAt: currentSimulatedTime,
            timeline: [
              ...alloc.timeline,
              {
                timestamp: currentSimulatedTime,
                status: newStatus,
                actor,
                note
              }
            ]
          };
        }
        return alloc;
      })
    );

    const audit: AuditRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      entityId: allocationId,
      entityType: 'allocation',
      action: `STATUS_CHANGE_TO_${newStatus.toUpperCase()}`,
      newState: newStatus,
      actor,
      role,
      reason: note,
      timestamp: currentSimulatedTime
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const verifyPickup = (
    allocationId: string,
    token: string,
    notes?: string
  ): { success: boolean; message: string } => {
    const alloc = allocations.find(a => a.id === allocationId);
    if (!alloc) return { success: false, message: 'Allocation not found.' };

    if (alloc.pickupVerifiedAt) {
      return { success: false, message: 'Error: Pickup token has already been consumed and cannot be reused.' };
    }

    if (alloc.pickupToken !== token.trim().toUpperCase()) {
      return {
        success: false,
        message: `Invalid token "${token}". Verification failed. Expected active pickup code.`
      };
    }

    const updatedTimeline = [
      ...alloc.timeline,
      {
        timestamp: currentSimulatedTime,
        status: 'in_transit' as AllocationStatus,
        actor: 'Delivery Partner (Verified)',
        note: `Simulated QR/OTP Pickup Verified with token ${token}. ${notes || 'Food package inspected and secured.'}`
      }
    ];

    setAllocations(prev =>
      prev.map(a =>
        a.id === allocationId
          ? {
              ...a,
              status: 'in_transit',
              pickupVerifiedAt: currentSimulatedTime,
              updatedAt: currentSimulatedTime,
              timeline: updatedTimeline
            }
          : a
      )
    );

    const audit: AuditRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      entityId: allocationId,
      entityType: 'allocation',
      action: 'PICKUP_VERIFIED',
      previousState: alloc.status,
      newState: 'in_transit',
      actor: 'Delivery Courier',
      role: 'driver',
      reason: `QR token ${token} verified. Courier took custody of cargo.`,
      timestamp: currentSimulatedTime
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      title: 'Food In Transit',
      message: `Pickup confirmed for ${alloc.quantityAllocated} ${alloc.unit}. Courier is en route.`,
      category: 'delivery',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'logistics'
    };

    setAuditLogs(prev => [audit, ...prev]);
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: `Pickup successfully verified! Courier is now in transit.` };
  };

  const verifyDropoff = (
    allocationId: string,
    token: string,
    receivedQty: number,
    notes?: string
  ): { success: boolean; message: string } => {
    const alloc = allocations.find(a => a.id === allocationId);
    if (!alloc) return { success: false, message: 'Allocation not found.' };

    if (alloc.status !== 'in_transit' && alloc.status !== 'reassigned') {
      return { success: false, message: `Cannot verify drop-off while status is "${alloc.status}". Must be In Transit.` };
    }

    if (alloc.dropoffVerifiedAt) {
      return { success: false, message: 'Error: Drop-off token has already been validated.' };
    }

    if (alloc.dropoffToken !== token.trim().toUpperCase()) {
      return {
        success: false,
        message: `Invalid drop-off token "${token}". Verification rejected.`
      };
    }

    const updatedTimeline = [
      ...alloc.timeline,
      {
        timestamp: currentSimulatedTime,
        status: 'delivered' as AllocationStatus,
        actor: 'Recipient Receiving Desk',
        note: `Drop-off verified with token ${token}. Received ${receivedQty} ${alloc.unit}. ${notes || 'Condition verified good.'}`
      }
    ];

    setAllocations(prev =>
      prev.map(a =>
        a.id === allocationId
          ? {
              ...a,
              status: 'delivered',
              dropoffVerifiedAt: currentSimulatedTime,
              updatedAt: currentSimulatedTime,
              timeline: updatedTimeline
            }
          : a
      )
    );

    // Reward recipient and driver trust score
    const trustEvent: TrustScoreEvent = {
      id: `tr-${Date.now().toString().slice(-4)}`,
      entityId: alloc.recipientId,
      entityName: recipients.find(r => r.id === alloc.recipientId)?.name || 'Recipient',
      entityType: 'recipient',
      scoreDelta: 1,
      newScore: 98,
      reason: `Completed on-time receipt verification for allocation ${alloc.id}.`,
      verifiedOutcome: true,
      timestamp: currentSimulatedTime
    };

    const audit: AuditRecord = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      entityId: allocationId,
      entityType: 'allocation',
      action: 'DROPOFF_CONFIRMED',
      previousState: alloc.status,
      newState: 'delivered',
      actor: 'Recipient Receiving Manager',
      role: 'shelter',
      reason: `Drop-off token confirmed. Cargo received: ${receivedQty} ${alloc.unit}.`,
      timestamp: currentSimulatedTime
    };

    const notif: NotificationItem = {
      id: `notif-${Date.now().toString().slice(-4)}`,
      title: 'Delivery Mission Completed!',
      message: `Delivered ${receivedQty} ${alloc.unit} safely to ${recipients.find(r => r.id === alloc.recipientId)?.name}. Meals rescued!`,
      category: 'delivery',
      unread: true,
      timestamp: currentSimulatedTime,
      linkToTab: 'analytics'
    };

    setTrustEvents(prev => [trustEvent, ...prev]);
    setAuditLogs(prev => [audit, ...prev]);
    setNotifications(prev => [notif, ...prev]);

    return { success: true, message: `Handoff completed! ${receivedQty} ${alloc.unit} logged as delivered.` };
  };

  const reportIncident = (data: Omit<SafetyIncident, 'id' | 'status' | 'createdAt'>) => {
    const listing = listings.find(l => l.id === data.listingId);
    if (!listing) return;

    const res = executeSafetyQuarantine(data, listing, allocations, currentSimulatedTime);

    setIncidents(prev => [res.incident, ...prev]);
    setListings(prev => prev.map(l => (l.id === listing.id ? res.updatedListing : l)));
    setAllocations(res.affectedAllocations);
    setAuditLogs(prev => [...res.auditRecords, ...prev]);
    setNotifications(prev => [...res.notifications, ...prev]);
  };

  const resolveIncident = (
    incidentId: string,
    decision: 'resolved_cleared' | 'resolved_penalized',
    notes: string
  ) => {
    const incident = incidents.find(i => i.id === incidentId);
    if (!incident) return;
    const listing = listings.find(l => l.id === incident.listingId);
    if (!listing) return;

    const res = resolveSafetyIncident(
      incident,
      decision,
      notes,
      'Operations Admin',
      listing,
      currentSimulatedTime
    );

    setIncidents(prev => prev.map(i => (i.id === incidentId ? res.updatedIncident : i)));
    setListings(prev => prev.map(l => (l.id === listing.id ? res.updatedListing : l)));
    if (res.trustScoreEvent) {
      setTrustEvents(prev => [res.trustScoreEvent!, ...prev]);
    }
    setAuditLogs(prev => [res.auditRecord, ...prev]);
    setNotifications(prev => [res.notification, ...prev]);
  };

  const failoverDelivery = (allocationId: string, reason: string): boolean => {
    const alloc = allocations.find(a => a.id === allocationId);
    if (!alloc) return false;
    const listing = listings.find(l => l.id === alloc.listingId);
    if (!listing) return false;

    const res = triggerDeliveryFailover(
      alloc,
      listing,
      drivers,
      reason,
      currentSimulatedTime,
      drivers.find(d => d.id === alloc.deliveryPartnerId)?.name || 'Original Driver'
    );

    setAllocations(prev => prev.map(a => (a.id === allocationId ? res.updatedAllocation : a)));
    setAuditLogs(prev => [res.auditRecord, ...prev]);
    setNotifications(prev => [res.notification, ...prev]);
    return res.isEligibleForReassignment;
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEY + '_listings');
    localStorage.removeItem(STORAGE_KEY + '_allocations');
    localStorage.removeItem(STORAGE_KEY + '_incidents');
    localStorage.removeItem(STORAGE_KEY + '_trust');
    localStorage.removeItem(STORAGE_KEY + '_audit');
    localStorage.removeItem(STORAGE_KEY + '_notifs');
    localStorage.removeItem(STORAGE_KEY + '_requests');

    setDonors(SEED_DONORS);
    setRecipients(SEED_RECIPIENTS);
    setDrivers(SEED_DRIVERS);
    setListings(SEED_LISTINGS);
    setRequests(SEED_REQUESTS);
    setAllocations(SEED_ALLOCATIONS);
    setIncidents(SEED_INCIDENTS);
    setTrustEvents(SEED_TRUST_EVENTS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setNotifications(SEED_NOTIFICATIONS);
    setCurrentSimulatedTime(INITIAL_DEMO_TIME);
  };

  // SIGNATURE FEATURE 17: Live "Rescue Mission" End-to-End Orchestrated Simulation
  const runRescueMissionSimulation = async () => {
    setIsSimulationRunning(true);
    setSimulationStep(1);
    setSimulationMessage('Phase 1/6: Running AI Surplus Forecast for The Grand Amber Hotel...');
    setActiveTab('prediction');

    await new Promise(r => setTimeout(r, 1600));

    // Step 2: Auto-publish listing
    setSimulationStep(2);
    setSimulationMessage('Phase 2/6: Forecast verified! Publishing surplus listing (50 portions Chef Gourmet Salmon)...');
    const newListingId = `list-sim-${Date.now().toString().slice(-3)}`;
    const simListing: FoodListing = {
      id: newListingId,
      donorId: 'donor-1',
      foodName: 'Live Rescue Mission: Steamed Atlantic Salmon & Quinoa Pilaf',
      category: 'cooked_meals',
      quantity: 50,
      remainingQuantity: 50,
      unit: 'portions',
      preparationTime: currentSimulatedTime,
      useByDeadline: new Date(new Date(currentSimulatedTime).getTime() + 4 * 3600 * 1000).toISOString(),
      collectionDeadline: new Date(new Date(currentSimulatedTime).getTime() + 1.5 * 3600 * 1000).toISOString(),
      storageRequirement: 'hot_insulated',
      packaging: 'sealed_containers',
      allergens: ['Fish'],
      isVegetarian: false,
      isVegan: false,
      isHalal: true,
      pickupAddress: '250 Grand Plaza Boulevard, Service Bay #1',
      pickupLocation: {
        lat: 40.7128,
        lng: -74.0060,
        address: '250 Grand Plaza Boulevard',
        zone: 'Downtown Corridor'
      },
      pickupWindowStart: currentSimulatedTime,
      pickupWindowEnd: new Date(new Date(currentSimulatedTime).getTime() + 1.5 * 3600 * 1000).toISOString(),
      donorInstructions: 'Packed in thermal container at 68°C. Priority live rescue mission.',
      safetyVerified: true,
      quarantined: false,
      status: 'active',
      createdAt: currentSimulatedTime
    };
    addListing(simListing);
    setActiveTab('matching');

    await new Promise(r => setTimeout(r, 2000));

    // Step 3: Match evaluated
    setSimulationStep(3);
    setSimulationMessage('Phase 3/6: AI Matching Engine scored candidate recipients. Hard constraints passed! Allocating to Hope Harbor...');
    const alloc = createAllocation(newListingId, 'rec-1', 50, 'driver-3'); // Assign to Marcus Brody (driver-3)
    setActiveTab('deliveries');

    await new Promise(r => setTimeout(r, 2200));

    // Step 4: Driver failure & dynamic failover
    setSimulationStep(4);
    setSimulationMessage('Phase 4/6: Driver Marcus Brody reports unexpected vehicle tire puncture! Triggering Dynamic Logistics Failover...');
    if (alloc) {
      failoverDelivery(alloc.id, 'Vehicle tire puncture on 34th St. Immediate dispatch reassignment requested.');
    }

    await new Promise(r => setTimeout(r, 2400));

    // Step 5: Pickup verification
    setSimulationStep(5);
    setSimulationMessage('Phase 5/6: Replacement courier Alex Chen arrived! Verifying pickup with scannable QR code...');
    setActiveTab('deliveries');
    if (alloc) {
      verifyPickup(alloc.id, alloc.pickupToken, 'Alex Chen confirmed package integrity and temperature probe reading (66°C).');
    }

    await new Promise(r => setTimeout(r, 2200));

    // Step 6: Drop-off verification & impact update
    setSimulationStep(6);
    setSimulationMessage('Phase 6/6: Food safely arrived at Hope Harbor! Pastor Michael confirmed drop-off token. 50 meals saved!');
    if (alloc) {
      verifyDropoff(alloc.id, alloc.dropoffToken, 50, 'All 50 portions received hot and served immediately in the dinner line.');
    }
    setActiveTab('impact');

    await new Promise(r => setTimeout(r, 1800));
    setSimulationMessage('Live Rescue Mission completed with 100% data integrity!');
    setIsSimulationRunning(false);
  };

  const runSafetyQuarantineSimulation = async () => {
    setIsSimulationRunning(true);
    setSimulationStep(1);
    setSimulationMessage('Safety Scenario: Recipient logs temperature abuse complaint for active batch...');
    setActiveTab('safety');

    await new Promise(r => setTimeout(r, 1500));

    // Pick first active listing
    const activeList = listings.find(l => l.status === 'active' && !l.quarantined);
    if (activeList) {
      reportIncident({
        listingId: activeList.id,
        reporterId: 'rec-6',
        reporterRole: 'shelter',
        reporterName: 'Thomas Vance (City Mission Inspector)',
        incidentCategory: 'temperature_abuse',
        description: 'Simulated Demo Alarm: Holding unit temperature dropped below 52°C during holding.',
        severity: 'critical'
      });
    }

    setSimulationStep(2);
    setSimulationMessage('Safety Sentinel activated: Batch immediately quarantined! Downstream allocations halted.');
    await new Promise(r => setTimeout(r, 2000));
    setIsSimulationRunning(false);
  };

  const login = (profile: Omit<UserProfile, 'isLoggedIn'>) => {
    const user: UserProfile = { ...profile, isLoggedIn: true };
    setCurrentUser(user);
    setRole(user.role);
    localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(user));
  };

  const logout = () => {
    if (currentUser) {
      const loggedOutUser: UserProfile = { ...currentUser, isLoggedIn: false };
      setCurrentUser(loggedOutUser);
      localStorage.setItem(STORAGE_KEY + '_user', JSON.stringify(loggedOutUser));
    } else {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEY + '_user');
    }
  };

  // Live real-time clock ticker
  useEffect(() => {
    if (!isRealTimeActive) return;
    const interval = setInterval(() => {
      setCurrentSimulatedTime(prev => {
        const cur = new Date(prev).getTime();
        return new Date(cur + 60 * 1000).toISOString();
      });
    }, 15000); // Advances 1 simulated min every 15 seconds
    return () => clearInterval(interval);
  }, [isRealTimeActive]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isRealTimeActive,
        setIsRealTimeActive,
        role,
        setRole,
        currentSimulatedTime,
        advanceSimulatedTime,
        resetSimulatedTime,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        donors,
        recipients,
        drivers,
        listings,
        requests,
        allocations,
        incidents,
        trustEvents,
        auditLogs,
        notifications,
        addListing,
        updateListing,
        addRequest,
        createAllocation,
        updateAllocationStatus,
        verifyPickup,
        verifyDropoff,
        reportIncident,
        resolveIncident,
        failoverDelivery,
        markNotificationRead,
        markAllNotificationsRead,
        resetToDefaultData,
        isSimulationRunning,
        simulationStep,
        simulationMessage,
        runRescueMissionSimulation,
        runSafetyQuarantineSimulation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

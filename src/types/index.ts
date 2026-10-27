export type UserRole = 'donor' | 'ngo' | 'driver' | 'shelter' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  organizationName: string;
  role: UserRole;
  address: string;
  city: string;
  isLoggedIn: boolean;
  avatar?: string;
  joinedDate?: string;
}

export type FoodCategory =
  | 'cooked_meals'
  | 'fresh_produce'
  | 'bakery_dairy'
  | 'packaged_staples'
  | 'catered_buffet';

export type StorageRequirement =
  | 'room_temp'
  | 'refrigerated'
  | 'frozen'
  | 'hot_insulated';

export type PackagingStatus =
  | 'sealed_containers'
  | 'individual_boxes'
  | 'bulk_pans'
  | 'reusable_crates';

export type FoodUnit = 'portions' | 'kg' | 'boxes' | 'meals';

export type PerishabilityRisk = 'normal' | 'warning' | 'critical' | 'ineligible';

export type ListingStatus =
  | 'active'
  | 'partially_allocated'
  | 'fully_allocated'
  | 'quarantined'
  | 'expired'
  | 'cancelled';

export type AllocationStatus =
  | 'proposed'
  | 'accepted'
  | 'pickup_assigned'
  | 'in_transit'
  | 'delivered'
  | 'rejected'
  | 'pickup_failed'
  | 'reassigned'
  | 'quarantined'
  | 'cancelled';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
  zone: string;
}

export interface Donor {
  id: string;
  name: string;
  type: 'Restaurant' | 'Hotel' | 'Hostel Mess' | 'Supermarket' | 'Catering Company';
  contactPerson: string;
  phone: string;
  location: LocationCoordinates;
  trustScore: number;
  verified: boolean;
  activeListingIds: string[];
}

export interface Recipient {
  id: string;
  name: string;
  type: 'ngo' | 'shelter' | 'community_kitchen';
  contactPerson: string;
  phone: string;
  location: LocationCoordinates;
  capacityKg: number;
  maxPeopleServing: number;
  storageCapabilities: StorageRequirement[];
  acceptedCategories: FoodCategory[];
  dietaryRules: string[];
  trustScore: number;
  verified: boolean;
  operatingHours: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  vehicleType: 'EV Van' | 'Refrigerated Van' | 'Insulated Bike' | 'Cargo Bike';
  phone: string;
  capacityKg: number;
  hasCooling: boolean;
  hasHotInsulation: boolean;
  status: 'available' | 'on_mission' | 'offline';
  rating: number;
  trustScore: number;
  currentLocation: LocationCoordinates;
  completedRuns: number;
}

export interface FoodListing {
  id: string;
  donorId: string;
  foodName: string;
  category: FoodCategory;
  quantity: number;
  remainingQuantity: number;
  unit: FoodUnit;
  preparationTime: string; // ISO
  useByDeadline: string; // ISO
  collectionDeadline: string; // ISO
  storageRequirement: StorageRequirement;
  packaging: PackagingStatus;
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isHalal: boolean;
  pickupAddress: string;
  pickupLocation: LocationCoordinates;
  pickupWindowStart: string; // ISO
  pickupWindowEnd: string; // ISO
  donorInstructions: string;
  safetyVerified: boolean;
  quarantined: boolean;
  quarantineReason?: string;
  status: ListingStatus;
  createdAt: string; // ISO
}

export interface RecipientRequest {
  id: string;
  recipientId: string;
  category: FoodCategory;
  quantityNeeded: number;
  unit: FoodUnit;
  peopleToServe: number;
  urgency: 'urgent' | 'high' | 'medium';
  neededBy: string; // ISO
  dietaryRestrictions: string[];
  acceptedStorage: StorageRequirement[];
  fulfilledQuantity: number;
  status: 'open' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';
}

export interface MatchSafetyCheck {
  constraint: string;
  passed: boolean;
  details: string;
}

export interface MatchExplanation {
  matchScore: number; // 0-100
  passedHardConstraints: boolean;
  safetyChecks: MatchSafetyCheck[];
  positiveFactors: string[];
  tradeOffs: string[];
  estimatedDistanceKm: number;
  estimatedTravelMinutes: number;
  capacityFitPercentage: number;
  urgencyBonus: number;
  fairnessAdjustment: number;
}

export interface AllocationTimelineEvent {
  timestamp: string; // ISO
  status: AllocationStatus;
  actor: string;
  note: string;
}

export interface Allocation {
  id: string;
  listingId: string;
  recipientId: string;
  requestId?: string;
  deliveryPartnerId?: string;
  originalPartnerId?: string;
  quantityAllocated: number;
  unit: FoodUnit;
  matchScore: number;
  matchExplanation: MatchExplanation;
  status: AllocationStatus;
  pickupToken: string;
  dropoffToken: string;
  pickupVerifiedAt?: string;
  dropoffVerifiedAt?: string;
  failureReason?: string;
  reassignmentReason?: string;
  exceptionNotes?: string;
  timeline: AllocationTimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface SafetyIncident {
  id: string;
  listingId: string;
  allocationId?: string;
  reporterId: string;
  reporterRole: UserRole;
  reporterName: string;
  incidentCategory:
    | 'suspected_spoilage'
    | 'damaged_packaging'
    | 'temperature_abuse'
    | 'allergen_mismatch'
    | 'wrong_quantity'
    | 'other';
  description: string;
  severity: 'critical' | 'major' | 'minor';
  evidenceUrl?: string;
  status: 'under_investigation' | 'quarantined' | 'resolved_cleared' | 'resolved_penalized';
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface TrustScoreEvent {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'donor' | 'recipient' | 'driver';
  scoreDelta: number;
  newScore: number;
  reason: string;
  verifiedOutcome: boolean;
  timestamp: string;
}

export interface AuditRecord {
  id: string;
  entityId: string;
  entityType: 'listing' | 'allocation' | 'incident' | 'system' | 'partner';
  action: string;
  previousState?: string;
  newState?: string;
  actor: string;
  role: UserRole;
  reason?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'match' | 'safety' | 'delivery' | 'expiry' | 'system';
  unread: boolean;
  timestamp: string;
  linkToTab?: string;
  actionPayload?: Record<string, any>;
}

export interface SurplusPredictionScenario {
  id: string;
  donorId: string;
  donorName: string;
  dayOfWeek: string;
  expectedFootfall: number;
  remainingInventoryKg: number;
  eventBufferPercentage: number;
  foodCategory: FoodCategory;
  predictedSurplusPortions: number;
  uncertaintyMargin: number;
  factors: { factor: string; impact: string }[];
  explanation: string;
  historicalActualSurplus: number;
  accuracyRate: number;
}

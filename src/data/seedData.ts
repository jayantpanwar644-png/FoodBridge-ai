import {
  Donor,
  Recipient,
  DeliveryPartner,
  FoodListing,
  RecipientRequest,
  Allocation,
  SafetyIncident,
  TrustScoreEvent,
  AuditRecord,
  NotificationItem,
  SurplusPredictionScenario
} from '../types';

export const INITIAL_DEMO_TIME = '2026-10-27T19:00:00.000Z';

export const SEED_DONORS: Donor[] = [
  {
    id: 'donor-1',
    name: 'The Grand Amber Hotel & Suites',
    type: 'Hotel',
    contactPerson: 'Chef Marcus Sterling',
    phone: '+1 (555) 234-8901',
    location: {
      lat: 40.7128,
      lng: -74.0060,
      address: '250 Grand Plaza Boulevard, Central City',
      zone: 'Downtown Corridor'
    },
    trustScore: 94,
    verified: true,
    activeListingIds: ['list-101', 'list-102']
  },
  {
    id: 'donor-2',
    name: 'GreenLeaf Organics Supermarket',
    type: 'Supermarket',
    contactPerson: 'Elena Rostova',
    phone: '+1 (555) 345-9012',
    location: {
      lat: 40.7306,
      lng: -73.9352,
      address: '144 Green Market Avenue, Northside',
      zone: 'North District'
    },
    trustScore: 98,
    verified: true,
    activeListingIds: ['list-103']
  },
  {
    id: 'donor-3',
    name: 'Sunrise University Hostel Dining Hall',
    type: 'Hostel Mess',
    contactPerson: 'Rajiv Patel',
    phone: '+1 (555) 456-0123',
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: '88 Campus West Way, University District',
      zone: 'Midtown East'
    },
    trustScore: 88,
    verified: true,
    activeListingIds: ['list-104', 'list-105']
  },
  {
    id: 'donor-4',
    name: 'Olive & Thyme Bistro',
    type: 'Restaurant',
    contactPerson: 'Sarah Jenkins',
    phone: '+1 (555) 567-1234',
    location: {
      lat: 40.7484,
      lng: -73.9857,
      address: '42 Culinary Row, West Quarter',
      zone: 'South Harbor'
    },
    trustScore: 91,
    verified: true,
    activeListingIds: ['list-106']
  },
  {
    id: 'donor-5',
    name: 'Metro Summit Catering & Events',
    type: 'Catering Company',
    contactPerson: 'David Kincaid',
    phone: '+1 (555) 678-2345',
    location: {
      lat: 40.7282,
      lng: -73.9942,
      address: '700 Exposition Center Drive, Bayfront',
      zone: 'West Bay'
    },
    trustScore: 82,
    verified: true,
    activeListingIds: ['list-107', 'list-108']
  }
];

export const SEED_RECIPIENTS: Recipient[] = [
  {
    id: 'rec-1',
    name: 'Hope Harbor Emergency Shelter',
    type: 'shelter',
    contactPerson: 'Pastor Michael Ross',
    phone: '+1 (555) 111-2233',
    location: {
      lat: 40.7180,
      lng: -74.0010,
      address: '12 Charity Way, Downtown Core',
      zone: 'Downtown Corridor'
    },
    capacityKg: 350,
    maxPeopleServing: 180,
    storageCapabilities: ['refrigerated', 'room_temp', 'hot_insulated'],
    acceptedCategories: ['cooked_meals', 'fresh_produce', 'bakery_dairy', 'packaged_staples', 'catered_buffet'],
    dietaryRules: ['General Community Meals', 'Halal options marked'],
    trustScore: 97,
    verified: true,
    operatingHours: '06:00 - 22:30 Daily'
  },
  {
    id: 'rec-2',
    name: 'Seva Community Kitchen & Pantry',
    type: 'community_kitchen',
    contactPerson: 'Amara Ndiaye',
    phone: '+1 (555) 222-3344',
    location: {
      lat: 40.7420,
      lng: -73.9780,
      address: '415 Unity Street, Midtown Central',
      zone: 'Midtown East'
    },
    capacityKg: 450,
    maxPeopleServing: 250,
    storageCapabilities: ['refrigerated', 'hot_insulated', 'room_temp'],
    acceptedCategories: ['cooked_meals', 'catered_buffet', 'fresh_produce', 'packaged_staples'],
    dietaryRules: ['Vegetarian preferred', 'Nut-free designated area'],
    trustScore: 99,
    verified: true,
    operatingHours: '07:00 - 21:00 Daily'
  },
  {
    id: 'rec-3',
    name: 'St. Jude Youth & Family Resource Shelter',
    type: 'shelter',
    contactPerson: 'Sister Beatrice Vance',
    phone: '+1 (555) 333-4455',
    location: {
      lat: 40.7510,
      lng: -73.9920,
      address: '89 Haven Lane, West District',
      zone: 'West Bay'
    },
    capacityKg: 200,
    maxPeopleServing: 90,
    storageCapabilities: ['refrigerated', 'room_temp'],
    acceptedCategories: ['fresh_produce', 'bakery_dairy', 'packaged_staples'],
    dietaryRules: ['Strict Nut Allergen Free', 'Children Friendly'],
    trustScore: 95,
    verified: true,
    operatingHours: '08:00 - 20:00 Daily'
  },
  {
    id: 'rec-4',
    name: 'Annapurna Regional Food Rescue Bank',
    type: 'ngo',
    contactPerson: 'Vikram Joshi',
    phone: '+1 (555) 444-5566',
    location: {
      lat: 40.7320,
      lng: -73.9400,
      address: '10 Logistics Boulevard, North Logistics Hub',
      zone: 'North District'
    },
    capacityKg: 1200,
    maxPeopleServing: 800,
    storageCapabilities: ['refrigerated', 'frozen', 'room_temp', 'hot_insulated'],
    acceptedCategories: ['cooked_meals', 'fresh_produce', 'bakery_dairy', 'packaged_staples', 'catered_buffet'],
    dietaryRules: ['All categories accepted with proper batch labeling'],
    trustScore: 98,
    verified: true,
    operatingHours: '24/7 Receiving Dock'
  },
  {
    id: 'rec-5',
    name: 'Oasis Mother & Child Center',
    type: 'shelter',
    contactPerson: 'Clara Oswald',
    phone: '+1 (555) 555-6677',
    location: {
      lat: 40.7600,
      lng: -73.9680,
      address: '77 Garden Grove Park, Eastside',
      zone: 'Midtown East'
    },
    capacityKg: 150,
    maxPeopleServing: 65,
    storageCapabilities: ['refrigerated', 'room_temp'],
    acceptedCategories: ['fresh_produce', 'bakery_dairy', 'cooked_meals'],
    dietaryRules: ['Mild seasoning', 'No raw seafood or unpasteurized dairy'],
    trustScore: 96,
    verified: true,
    operatingHours: '08:00 - 19:30 Daily'
  },
  {
    id: 'rec-6',
    name: 'City Mission Outreach Dining Hall',
    type: 'community_kitchen',
    contactPerson: 'Thomas Vance',
    phone: '+1 (555) 666-7788',
    location: {
      lat: 40.7080,
      lng: -74.0120,
      address: '303 Riverfront Street, Harbor View',
      zone: 'South Harbor'
    },
    capacityKg: 300,
    maxPeopleServing: 160,
    storageCapabilities: ['hot_insulated', 'room_temp'],
    acceptedCategories: ['cooked_meals', 'catered_buffet', 'packaged_staples'],
    dietaryRules: ['Ready to serve dinner line'],
    trustScore: 92,
    verified: true,
    operatingHours: '16:00 - 22:00 Daily'
  }
];

export const SEED_DRIVERS: DeliveryPartner[] = [
  {
    id: 'driver-1',
    name: 'Alex Chen',
    vehicleType: 'EV Van',
    phone: '+1 (555) 777-1001',
    capacityKg: 350,
    hasCooling: true,
    hasHotInsulation: true,
    status: 'available',
    rating: 4.95,
    trustScore: 98,
    currentLocation: {
      lat: 40.7200,
      lng: -74.0020,
      address: 'Standby at Tribeca Hub',
      zone: 'Downtown Corridor'
    },
    completedRuns: 142
  },
  {
    id: 'driver-2',
    name: 'Priya Sharma',
    vehicleType: 'Refrigerated Van',
    phone: '+1 (555) 777-1002',
    capacityKg: 500,
    hasCooling: true,
    hasHotInsulation: false,
    status: 'on_mission',
    rating: 4.92,
    trustScore: 96,
    currentLocation: {
      lat: 40.7380,
      lng: -73.9600,
      address: 'En route on FDR Expressway',
      zone: 'Midtown East'
    },
    completedRuns: 198
  },
  {
    id: 'driver-3',
    name: 'Marcus Brody',
    vehicleType: 'Insulated Bike',
    phone: '+1 (555) 777-1003',
    capacityKg: 60,
    hasCooling: false,
    hasHotInsulation: true,
    status: 'available',
    rating: 4.88,
    trustScore: 84, // Lower score due to 1 prior missed pickup
    currentLocation: {
      lat: 40.7500,
      lng: -73.9850,
      address: 'Standby near 34th Street',
      zone: 'West Bay'
    },
    completedRuns: 89
  },
  {
    id: 'driver-4',
    name: 'Dev Patel',
    vehicleType: 'EV Van',
    phone: '+1 (555) 777-1004',
    capacityKg: 400,
    hasCooling: true,
    hasHotInsulation: true,
    status: 'available',
    rating: 4.98,
    trustScore: 99,
    currentLocation: {
      lat: 40.7310,
      lng: -73.9450,
      address: 'Standby at North Distribution Lot',
      zone: 'North District'
    },
    completedRuns: 215
  },
  {
    id: 'driver-5',
    name: 'Sarah Jenkins',
    vehicleType: 'Cargo Bike',
    phone: '+1 (555) 777-1005',
    capacityKg: 80,
    hasCooling: false,
    hasHotInsulation: true,
    status: 'available',
    rating: 4.91,
    trustScore: 95,
    currentLocation: {
      lat: 40.7130,
      lng: -74.0090,
      address: 'Standby Battery Park Plaza',
      zone: 'South Harbor'
    },
    completedRuns: 114
  }
];

export const SEED_LISTINGS: FoodListing[] = [
  {
    id: 'list-101',
    donorId: 'donor-1',
    foodName: 'Artisan Gourmet Dinner Buffet Surplus (Steamed Salmon & Rice Pilaf)',
    category: 'cooked_meals',
    quantity: 60,
    remainingQuantity: 20, // 40 allocated to Hope Harbor (alloc-201)
    unit: 'portions',
    preparationTime: '2026-10-27T16:30:00.000Z',
    useByDeadline: '2026-10-27T22:30:00.000Z',
    collectionDeadline: '2026-10-27T20:15:00.000Z', // approaching within 1h15m of initial demo time
    storageRequirement: 'hot_insulated',
    packaging: 'bulk_pans',
    allergens: ['Fish'],
    isVegetarian: false,
    isVegan: false,
    isHalal: true,
    pickupAddress: '250 Grand Plaza Boulevard, Service Bay #2',
    pickupLocation: {
      lat: 40.7128,
      lng: -74.0060,
      address: '250 Grand Plaza Boulevard, Central City',
      zone: 'Downtown Corridor'
    },
    pickupWindowStart: '2026-10-27T18:00:00.000Z',
    pickupWindowEnd: '2026-10-27T20:15:00.000Z',
    donorInstructions: 'Report to Kitchen Receiving Dock behind the east fountain. Food kept hot in commercial warmers at 65°C.',
    safetyVerified: true,
    quarantined: false,
    status: 'partially_allocated',
    createdAt: '2026-10-27T17:00:00.000Z'
  },
  {
    id: 'list-102',
    donorId: 'donor-1',
    foodName: 'Executive Pastry & Croissant Selection',
    category: 'bakery_dairy',
    quantity: 45,
    remainingQuantity: 45,
    unit: 'portions',
    preparationTime: '2026-10-27T12:00:00.000Z',
    useByDeadline: '2026-10-28T14:00:00.000Z',
    collectionDeadline: '2026-10-27T21:00:00.000Z',
    storageRequirement: 'room_temp',
    packaging: 'individual_boxes',
    allergens: ['Wheat', 'Dairy', 'Eggs'],
    isVegetarian: true,
    isVegan: false,
    isHalal: true,
    pickupAddress: '250 Grand Plaza Boulevard, Bakery Counter',
    pickupLocation: {
      lat: 40.7128,
      lng: -74.0060,
      address: '250 Grand Plaza Boulevard, Central City',
      zone: 'Downtown Corridor'
    },
    pickupWindowStart: '2026-10-27T18:30:00.000Z',
    pickupWindowEnd: '2026-10-27T21:00:00.000Z',
    donorInstructions: 'Individually boxed in eco-kraft boxes, ready for immediate handover.',
    safetyVerified: true,
    quarantined: false,
    status: 'active',
    createdAt: '2026-10-27T17:30:00.000Z'
  },
  {
    id: 'list-103',
    donorId: 'donor-2',
    foodName: 'Organic Bell Peppers, Heirloom Tomatoes & Crisp Greens Crate',
    category: 'fresh_produce',
    quantity: 85,
    remainingQuantity: 0, // Fully allocated and delivered (alloc-202)
    unit: 'kg',
    preparationTime: '2026-10-27T10:00:00.000Z',
    useByDeadline: '2026-10-29T18:00:00.000Z',
    collectionDeadline: '2026-10-27T21:30:00.000Z',
    storageRequirement: 'refrigerated',
    packaging: 'reusable_crates',
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    pickupAddress: '144 Green Market Avenue, Back Loading Bay',
    pickupLocation: {
      lat: 40.7306,
      lng: -73.9352,
      address: '144 Green Market Avenue, Northside',
      zone: 'North District'
    },
    pickupWindowStart: '2026-10-27T16:00:00.000Z',
    pickupWindowEnd: '2026-10-27T21:30:00.000Z',
    donorInstructions: 'Crates are sanitized and stacked on pallet B-4. Requires refrigerated transport.',
    safetyVerified: true,
    quarantined: false,
    status: 'fully_allocated',
    createdAt: '2026-10-27T15:00:00.000Z'
  },
  {
    id: 'list-104',
    donorId: 'donor-3',
    foodName: 'Homestyle Lentil Curry (Dal Makhani) & Steamed Basmati Rice',
    category: 'cooked_meals',
    quantity: 90,
    remainingQuantity: 90,
    unit: 'portions',
    preparationTime: '2026-10-27T17:00:00.000Z',
    useByDeadline: '2026-10-27T23:00:00.000Z',
    collectionDeadline: '2026-10-27T19:45:00.000Z', // CRITICAL: 45 min deadline!
    storageRequirement: 'hot_insulated',
    packaging: 'sealed_containers',
    allergens: ['Dairy'],
    isVegetarian: true,
    isVegan: false,
    isHalal: true,
    pickupAddress: '88 Campus West Way, Mess Gate #4',
    pickupLocation: {
      lat: 40.7589,
      lng: -73.9851,
      address: '88 Campus West Way, University District',
      zone: 'Midtown East'
    },
    pickupWindowStart: '2026-10-27T18:30:00.000Z',
    pickupWindowEnd: '2026-10-27T19:45:00.000Z',
    donorInstructions: 'High urgency surplus from evening student meal. Packed in food-grade thermal barrels.',
    safetyVerified: true,
    quarantined: false,
    status: 'active',
    createdAt: '2026-10-27T18:00:00.000Z'
  },
  {
    id: 'list-105',
    donorId: 'donor-3',
    foodName: 'Bulk Whole Wheat Flatbreads & Buns',
    category: 'bakery_dairy',
    quantity: 120,
    remainingQuantity: 120,
    unit: 'portions',
    preparationTime: '2026-10-27T14:00:00.000Z',
    useByDeadline: '2026-10-28T20:00:00.000Z',
    collectionDeadline: '2026-10-27T22:00:00.000Z',
    storageRequirement: 'room_temp',
    packaging: 'sealed_containers',
    allergens: ['Wheat'],
    isVegetarian: true,
    isVegan: true,
    isHalal: true,
    pickupAddress: '88 Campus West Way, Mess Gate #4',
    pickupLocation: {
      lat: 40.7589,
      lng: -73.9851,
      address: '88 Campus West Way, University District',
      zone: 'Midtown East'
    },
    pickupWindowStart: '2026-10-27T18:00:00.000Z',
    pickupWindowEnd: '2026-10-27T22:00:00.000Z',
    donorInstructions: 'Freshly baked today at 2 PM, bagged in clean food wraps of 10.',
    safetyVerified: true,
    quarantined: false,
    status: 'active',
    createdAt: '2026-10-27T17:15:00.000Z'
  },
  {
    id: 'list-106',
    donorId: 'donor-4',
    foodName: 'Herb Roasted Free-Range Chicken & Roasted Root Vegetables',
    category: 'cooked_meals',
    quantity: 35,
    remainingQuantity: 35,
    unit: 'portions',
    preparationTime: '2026-10-27T16:00:00.000Z',
    useByDeadline: '2026-10-27T22:00:00.000Z',
    collectionDeadline: '2026-10-27T20:30:00.000Z',
    storageRequirement: 'hot_insulated',
    packaging: 'individual_boxes',
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isHalal: false,
    pickupAddress: '42 Culinary Row, West Quarter',
    pickupLocation: {
      lat: 40.7484,
      lng: -73.9857,
      address: '42 Culinary Row, West Quarter',
      zone: 'South Harbor'
    },
    pickupWindowStart: '2026-10-27T18:30:00.000Z',
    pickupWindowEnd: '2026-10-27T20:30:00.000Z',
    donorInstructions: 'Ring alley bell #3. Packed in individual biodegradable thermal containers.',
    safetyVerified: true,
    quarantined: false,
    status: 'active',
    createdAt: '2026-10-27T17:45:00.000Z'
  },
  {
    id: 'list-107',
    donorId: 'donor-5',
    foodName: 'Catered Summit Cream Soup & Brioche Rolls',
    category: 'catered_buffet',
    quantity: 50,
    remainingQuantity: 50,
    unit: 'portions',
    preparationTime: '2026-10-27T11:00:00.000Z',
    useByDeadline: '2026-10-27T20:00:00.000Z',
    collectionDeadline: '2026-10-27T18:45:00.000Z',
    storageRequirement: 'hot_insulated',
    packaging: 'bulk_pans',
    allergens: ['Dairy', 'Wheat'],
    isVegetarian: true,
    isVegan: false,
    isHalal: true,
    pickupAddress: '700 Exposition Center Drive, Bayfront',
    pickupLocation: {
      lat: 40.7282,
      lng: -73.9942,
      address: '700 Exposition Center Drive, Bayfront',
      zone: 'West Bay'
    },
    pickupWindowStart: '2026-10-27T14:00:00.000Z',
    pickupWindowEnd: '2026-10-27T18:45:00.000Z',
    donorInstructions: 'Report to security gate A.',
    safetyVerified: false,
    quarantined: true, // QUARANTINED CASE! Reported temperature abuse
    quarantineReason: 'Safety complaint INC-901: reported storage below 55°C during afternoon holding.',
    status: 'quarantined',
    createdAt: '2026-10-27T14:30:00.000Z'
  },
  {
    id: 'list-108',
    donorId: 'donor-5',
    foodName: 'Artisan Deep-Freeze Seafood Trays (-18°C Deep Freeze Required)',
    category: 'catered_buffet',
    quantity: 40,
    remainingQuantity: 40,
    unit: 'portions',
    preparationTime: '2026-10-27T09:00:00.000Z',
    useByDeadline: '2026-10-30T18:00:00.000Z',
    collectionDeadline: '2026-10-27T23:00:00.000Z',
    storageRequirement: 'frozen',
    packaging: 'sealed_containers',
    allergens: ['Shellfish', 'Fish'],
    isVegetarian: false,
    isVegan: false,
    isHalal: false,
    pickupAddress: '700 Exposition Center Drive, Cold Storage Bay #1',
    pickupLocation: {
      lat: 40.7282,
      lng: -73.9942,
      address: '700 Exposition Center Drive, Bayfront',
      zone: 'West Bay'
    },
    pickupWindowStart: '2026-10-27T17:00:00.000Z',
    pickupWindowEnd: '2026-10-27T23:00:00.000Z',
    donorInstructions: 'Strict deep-freeze requirement. Shelters without commercial freezers will be rejected by constraints.',
    safetyVerified: true,
    quarantined: false,
    status: 'active', // Unmatched or matched only with Annapurna Regional Hub which has frozen storage
    createdAt: '2026-10-27T16:00:00.000Z'
  }
];

export const SEED_REQUESTS: RecipientRequest[] = [
  {
    id: 'req-301',
    recipientId: 'rec-1',
    category: 'cooked_meals',
    quantityNeeded: 60,
    unit: 'portions',
    peopleToServe: 60,
    urgency: 'urgent',
    neededBy: '2026-10-27T21:00:00.000Z',
    dietaryRestrictions: ['Halal options requested'],
    acceptedStorage: ['hot_insulated', 'refrigerated', 'room_temp'],
    fulfilledQuantity: 40, // 40 received from list-101
    status: 'partially_fulfilled'
  },
  {
    id: 'req-302',
    recipientId: 'rec-2',
    category: 'cooked_meals',
    quantityNeeded: 100,
    unit: 'portions',
    peopleToServe: 100,
    urgency: 'urgent',
    neededBy: '2026-10-27T20:30:00.000Z',
    dietaryRestrictions: ['Vegetarian preferred'],
    acceptedStorage: ['hot_insulated', 'refrigerated'],
    fulfilledQuantity: 0,
    status: 'open'
  },
  {
    id: 'req-303',
    recipientId: 'rec-3',
    category: 'fresh_produce',
    quantityNeeded: 50,
    unit: 'kg',
    peopleToServe: 75,
    urgency: 'high',
    neededBy: '2026-10-27T22:00:00.000Z',
    dietaryRestrictions: ['Strict Nut Allergen Free'],
    acceptedStorage: ['refrigerated', 'room_temp'],
    fulfilledQuantity: 0,
    status: 'open'
  },
  {
    id: 'req-304',
    recipientId: 'rec-4',
    category: 'fresh_produce',
    quantityNeeded: 150,
    unit: 'kg',
    peopleToServe: 300,
    urgency: 'medium',
    neededBy: '2026-10-28T02:00:00.000Z',
    dietaryRestrictions: [],
    acceptedStorage: ['refrigerated', 'frozen', 'room_temp'],
    fulfilledQuantity: 85,
    status: 'partially_fulfilled'
  },
  {
    id: 'req-305',
    recipientId: 'rec-6',
    category: 'cooked_meals',
    quantityNeeded: 50,
    unit: 'portions',
    peopleToServe: 50,
    urgency: 'high',
    neededBy: '2026-10-27T21:30:00.000Z',
    dietaryRestrictions: [],
    acceptedStorage: ['hot_insulated'],
    fulfilledQuantity: 0,
    status: 'open'
  }
];

export const SEED_ALLOCATIONS: Allocation[] = [
  {
    id: 'alloc-201',
    listingId: 'list-101',
    recipientId: 'rec-1',
    requestId: 'req-301',
    deliveryPartnerId: 'driver-1',
    quantityAllocated: 40,
    unit: 'portions',
    matchScore: 94,
    matchExplanation: {
      matchScore: 94,
      passedHardConstraints: true,
      safetyChecks: [
        { constraint: 'Perishability & Expiry', passed: true, details: 'Collection window open for 1h15m, shelf life valid until 22:30.' },
        { constraint: 'Storage Compatibility', passed: true, details: 'Recipient has hot_insulated receiving dock; Driver EV Van has thermal warming.' },
        { constraint: 'Dietary Compatibility', passed: true, details: 'Halal certified, fish allergen disclosed and accepted by Hope Harbor.' },
        { constraint: 'Capacity Verification', passed: true, details: '40 portions fits within 180 person facility capacity.' }
      ],
      positiveFactors: [
        'Close geographic proximity (1.2 km, ~7 mins drive)',
        'Urgent dinner hunger window at Hope Harbor',
        'Partial allocation allows donor to fulfill second community request',
        'High trust driver (Alex Chen, 98% reliability)'
      ],
      tradeOffs: [
        'Requires thermal container handling within 45 minutes'
      ],
      estimatedDistanceKm: 1.2,
      estimatedTravelMinutes: 7,
      capacityFitPercentage: 100,
      urgencyBonus: 15,
      fairnessAdjustment: 0
    },
    status: 'in_transit',
    pickupToken: 'PKUP-101-782',
    dropoffToken: 'DROP-101-943',
    pickupVerifiedAt: '2026-10-27T18:45:00.000Z',
    timeline: [
      { timestamp: '2026-10-27T17:10:00.000Z', status: 'proposed', actor: 'AI Matching Engine', note: 'AI matched listing 101 to Hope Harbor with score 94/100.' },
      { timestamp: '2026-10-27T17:15:00.000Z', status: 'accepted', actor: 'Hope Harbor Coordinator', note: 'Accepted partial allocation of 40 portions for evening dinner line.' },
      { timestamp: '2026-10-27T17:20:00.000Z', status: 'pickup_assigned', actor: 'System Dispatcher', note: 'Assigned to Alex Chen (EV Van).' },
      { timestamp: '2026-10-27T18:45:00.000Z', status: 'in_transit', actor: 'Alex Chen', note: 'Simulated QR Pickup Verified at Grand Amber loading dock. Food temperature logged at 68°C.' }
    ],
    createdAt: '2026-10-27T17:10:00.000Z',
    updatedAt: '2026-10-27T18:45:00.000Z'
  },
  {
    id: 'alloc-202',
    listingId: 'list-103',
    recipientId: 'rec-4',
    requestId: 'req-304',
    deliveryPartnerId: 'driver-2',
    quantityAllocated: 85,
    unit: 'kg',
    matchScore: 98,
    matchExplanation: {
      matchScore: 98,
      passedHardConstraints: true,
      safetyChecks: [
        { constraint: 'Perishability & Expiry', passed: true, details: 'Fresh produce shelf-life 48 hours.' },
        { constraint: 'Storage Compatibility', passed: true, details: 'Both driver and recipient possess certified cold-chain refrigeration.' },
        { constraint: 'Dietary Compatibility', passed: true, details: 'Vegan organic vegetables meet all pantry standards.' },
        { constraint: 'Capacity Verification', passed: true, details: '85 kg easily handled by 1200 kg warehouse capacity.' }
      ],
      positiveFactors: [
        'Optimal cold-chain match with Priya Sharma refrigerated van',
        'Large bulk absorption avoids food splitting overhead',
        'High recipient trust score (98)'
      ],
      tradeOffs: [],
      estimatedDistanceKm: 2.1,
      estimatedTravelMinutes: 11,
      capacityFitPercentage: 100,
      urgencyBonus: 10,
      fairnessAdjustment: 0
    },
    status: 'delivered',
    pickupToken: 'PKUP-103-319',
    dropoffToken: 'DROP-103-684',
    pickupVerifiedAt: '2026-10-27T16:45:00.000Z',
    dropoffVerifiedAt: '2026-10-27T17:35:00.000Z',
    timeline: [
      { timestamp: '2026-10-27T15:15:00.000Z', status: 'proposed', actor: 'AI Matching Engine', note: 'Matched 85 kg produce to Annapurna Regional Hub.' },
      { timestamp: '2026-10-27T15:20:00.000Z', status: 'accepted', actor: 'Annapurna Coordinator', note: 'Accepted full crate delivery.' },
      { timestamp: '2026-10-27T15:25:00.000Z', status: 'pickup_assigned', actor: 'System Dispatcher', note: 'Assigned to Priya Sharma (Refrigerated Van).' },
      { timestamp: '2026-10-27T16:45:00.000Z', status: 'in_transit', actor: 'Priya Sharma', note: 'Pickup verified at GreenLeaf loading dock. Temperature checked at 4°C.' },
      { timestamp: '2026-10-27T17:35:00.000Z', status: 'delivered', actor: 'Annapurna Receiving Lead', note: 'Drop-off verified using QR code DROP-103-684. 85 kg produce received intact.' }
    ],
    createdAt: '2026-10-27T15:15:00.000Z',
    updatedAt: '2026-10-27T17:35:00.000Z'
  },
  {
    id: 'alloc-203',
    listingId: 'list-104',
    recipientId: 'rec-2',
    requestId: 'req-302',
    deliveryPartnerId: 'driver-4', // Reassigned partner
    originalPartnerId: 'driver-3', // Failed partner (Marcus Brody)
    quantityAllocated: 90,
    unit: 'portions',
    matchScore: 91,
    matchExplanation: {
      matchScore: 91,
      passedHardConstraints: true,
      safetyChecks: [
        { constraint: 'Perishability & Expiry', passed: true, details: 'Urgent: Must deliver before 20:30 serving window.' },
        { constraint: 'Storage Compatibility', passed: true, details: 'Hot insulated thermal transit confirmed.' },
        { constraint: 'Dietary Compatibility', passed: true, details: 'Vegetarian Dal Makhani matches Seva Kitchen dietary rule.' },
        { constraint: 'Capacity Verification', passed: true, details: '90 portions well within 250 capacity.' }
      ],
      positiveFactors: [
        'Perfect dietary alignment (Vegetarian Indian Cuisine)',
        'Rapid failover dispatch ensured mission was not lost',
        'Dev Patel EV van equipped with rapid food warmers'
      ],
      tradeOffs: [
        'Marcus Brody reported flat tire, causing 18-minute delay before reassignment'
      ],
      estimatedDistanceKm: 2.8,
      estimatedTravelMinutes: 14,
      capacityFitPercentage: 90,
      urgencyBonus: 20,
      fairnessAdjustment: 5
    },
    status: 'reassigned', // Ready for immediate pickup
    pickupToken: 'PKUP-104-512',
    dropoffToken: 'DROP-104-899',
    failureReason: 'Driver Marcus Brody reported mechanical puncture on 34th St at 18:32. Task auto-escalated.',
    reassignmentReason: 'Dynamic Logistics Failover triggered: System calculated 38 minutes shelf-life remaining, selected nearest available driver Dev Patel (4 mins away).',
    timeline: [
      { timestamp: '2026-10-27T18:05:00.000Z', status: 'proposed', actor: 'AI Matching Engine', note: 'Matched 90 portions to Seva Community Kitchen.' },
      { timestamp: '2026-10-27T18:10:00.000Z', status: 'accepted', actor: 'Seva Kitchen Coordinator', note: 'Accepted for evening langar distribution.' },
      { timestamp: '2026-10-27T18:15:00.000Z', status: 'pickup_assigned', actor: 'System Dispatcher', note: 'Assigned to Marcus Brody (Insulated Bike).' },
      { timestamp: '2026-10-27T18:32:00.000Z', status: 'pickup_failed', actor: 'Marcus Brody', note: 'Reported mechanical failure (rear tire puncture). Unable to complete run.' },
      { timestamp: '2026-10-27T18:33:00.000Z', status: 'reassigned', actor: 'Logistics Failover Engine', note: 'Failover activated: Dev Patel (EV Van) auto-assigned. ETA to donor: 6 mins.' }
    ],
    createdAt: '2026-10-27T18:05:00.000Z',
    updatedAt: '2026-10-27T18:33:00.000Z'
  },
  {
    id: 'alloc-204',
    listingId: 'list-107',
    recipientId: 'rec-6',
    requestId: 'req-305',
    deliveryPartnerId: 'driver-5',
    quantityAllocated: 50,
    unit: 'portions',
    matchScore: 0,
    matchExplanation: {
      matchScore: 0,
      passedHardConstraints: false,
      safetyChecks: [
        { constraint: 'Perishability & Expiry', passed: false, details: 'Batch under quarantine for suspected holding temperature failure.' },
        { constraint: 'Safety Verification', passed: false, details: 'Quarantine order INC-901 active.' }
      ],
      positiveFactors: [],
      tradeOffs: ['SAFETY LOCK: Unsafe batch blocked from allocation.'],
      estimatedDistanceKm: 0,
      estimatedTravelMinutes: 0,
      capacityFitPercentage: 0,
      urgencyBonus: 0,
      fairnessAdjustment: 0
    },
    status: 'quarantined',
    pickupToken: 'PKUP-107-000',
    dropoffToken: 'DROP-107-000',
    failureReason: 'Safety Quarantine: Complaint filed by City Mission inspector during pre-dispatch verification.',
    timeline: [
      { timestamp: '2026-10-27T14:40:00.000Z', status: 'proposed', actor: 'AI Matching Engine', note: 'Tentative match to City Mission.' },
      { timestamp: '2026-10-27T15:05:00.000Z', status: 'quarantined', actor: 'Safety Engine', note: 'Incident INC-901 logged. Allocation revoked and locked.' }
    ],
    createdAt: '2026-10-27T14:40:00.000Z',
    updatedAt: '2026-10-27T15:05:00.000Z'
  }
];

export const SEED_INCIDENTS: SafetyIncident[] = [
  {
    id: 'inc-901',
    listingId: 'list-107',
    allocationId: 'alloc-204',
    reporterId: 'rec-6',
    reporterRole: 'shelter',
    reporterName: 'Thomas Vance (City Mission)',
    incidentCategory: 'temperature_abuse',
    description: 'During pre-pickup inspection at Metro Summit kitchen, soup holding kettle was found at 48°C (guideline minimum is 60°C). Food had been sitting over 2.5 hours.',
    severity: 'critical',
    evidenceUrl: 'temp_log_photo_simulated.jpg',
    status: 'quarantined',
    createdAt: '2026-10-27T15:00:00.000Z'
  },
  {
    id: 'inc-902',
    listingId: 'list-101',
    reporterId: 'rec-1',
    reporterRole: 'shelter',
    reporterName: 'Pastor Michael Ross (Hope Harbor)',
    incidentCategory: 'damaged_packaging',
    description: 'Lid on container #3 had loose clip seal upon arrival. Inner thermal liner intact and temperature was 67°C. Documented for minor packaging review.',
    severity: 'minor',
    status: 'resolved_cleared',
    resolutionNotes: 'Packaging issue noted; food core temperature verified safe by digital probe. No biological compromise.',
    resolvedBy: 'Admin Ops Lead',
    resolvedAt: '2026-10-27T17:50:00.000Z',
    createdAt: '2026-10-27T17:40:00.000Z'
  }
];

export const SEED_TRUST_EVENTS: TrustScoreEvent[] = [
  {
    id: 'tr-01',
    entityId: 'donor-1',
    entityName: 'The Grand Amber Hotel',
    entityType: 'donor',
    scoreDelta: 2,
    newScore: 94,
    reason: 'Consistent on-time packaging and accurate allergen labeling across 15 donations.',
    verifiedOutcome: true,
    timestamp: '2026-10-27T14:00:00.000Z'
  },
  {
    id: 'tr-02',
    entityId: 'driver-3',
    entityName: 'Marcus Brody',
    entityType: 'driver',
    scoreDelta: -6,
    newScore: 84,
    reason: 'Reported transit breakdown; prompt notice prevented food spoilage, but punctuality score adjusted.',
    verifiedOutcome: true,
    timestamp: '2026-10-27T18:35:00.000Z'
  },
  {
    id: 'tr-03',
    entityId: 'donor-5',
    entityName: 'Metro Summit Catering',
    entityType: 'donor',
    scoreDelta: -10,
    newScore: 82,
    reason: 'Safety incident INC-901: soup holding temperature fell below safe threshold.',
    verifiedOutcome: true,
    timestamp: '2026-10-27T15:10:00.000Z'
  },
  {
    id: 'tr-04',
    entityId: 'rec-2',
    entityName: 'Seva Community Kitchen',
    entityType: 'recipient',
    scoreDelta: 3,
    newScore: 99,
    reason: 'Zero waste verified: 100% of delivered meals distributed to verified beneficiaries within 2 hours.',
    verifiedOutcome: true,
    timestamp: '2026-10-27T12:00:00.000Z'
  }
];

export const SEED_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-501',
    entityId: 'list-107',
    entityType: 'listing',
    action: 'QUARANTINE_APPLIED',
    previousState: 'active',
    newState: 'quarantined',
    actor: 'Automated Safety Sentinel',
    role: 'admin',
    reason: 'Immediate safety hold triggered by critical temperature report INC-901.',
    timestamp: '2026-10-27T15:05:00.000Z'
  },
  {
    id: 'aud-502',
    entityId: 'alloc-203',
    entityType: 'allocation',
    action: 'DYNAMIC_REASSIGNMENT',
    previousState: 'pickup_failed',
    newState: 'reassigned',
    actor: 'Logistics Optimization Engine',
    role: 'admin',
    reason: 'Replacement partner Dev Patel dispatched following Marcus Brody vehicle puncture. Remaining shelf life 38m.',
    timestamp: '2026-10-27T18:33:00.000Z'
  },
  {
    id: 'aud-503',
    entityId: 'alloc-202',
    entityType: 'allocation',
    action: 'DROPOFF_VERIFIED',
    previousState: 'in_transit',
    newState: 'delivered',
    actor: 'Annapurna Receiving Lead',
    role: 'ngo',
    reason: 'Cryptographic token DROP-103-684 verified at loading dock with digital signature.',
    timestamp: '2026-10-27T17:35:00.000Z'
  },
  {
    id: 'aud-504',
    entityId: 'list-101',
    entityType: 'listing',
    action: 'PARTIAL_ALLOCATION_APPROVED',
    previousState: 'active (60 portions)',
    newState: 'partially_allocated (40 allocated, 20 remaining)',
    actor: 'AI Match Arbiter',
    role: 'admin',
    reason: 'Split enforced by fairness algorithm to prevent single-hub monopoly and serve immediate Hope Harbor dinner line.',
    timestamp: '2026-10-27T17:15:00.000Z'
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical Expiry Alert',
    message: 'Hostel Mess Dal Makhani (90 portions) has only 45 minutes remaining in collection window!',
    category: 'expiry',
    unread: true,
    timestamp: '2026-10-27T18:40:00.000Z',
    linkToTab: 'perishability'
  },
  {
    id: 'notif-2',
    title: 'Logistics Failover Completed',
    message: 'Task alloc-203 smoothly reassigned to Dev Patel (EV Van). ETA to pickup: 6 minutes.',
    category: 'delivery',
    unread: true,
    timestamp: '2026-10-27T18:33:30.000Z',
    linkToTab: 'logistics'
  },
  {
    id: 'notif-3',
    title: 'Automated Quarantine Order',
    message: 'Batch list-107 quarantined following temperature violation report. Downstream allocations halted.',
    category: 'safety',
    unread: false,
    timestamp: '2026-10-27T15:06:00.000Z',
    linkToTab: 'safety'
  },
  {
    id: 'notif-4',
    title: 'Donation Successfully Delivered',
    message: 'Annapurna Regional Hub confirmed receipt of 85 kg organic produce from GreenLeaf Organics.',
    category: 'delivery',
    unread: false,
    timestamp: '2026-10-27T17:36:00.000Z',
    linkToTab: 'analytics'
  }
];

export const SEED_PREDICTION_SCENARIOS: SurplusPredictionScenario[] = [
  {
    id: 'scen-1',
    donorId: 'donor-1',
    donorName: 'The Grand Amber Hotel & Suites',
    dayOfWeek: 'Tuesday',
    expectedFootfall: 220,
    remainingInventoryKg: 42,
    eventBufferPercentage: 15,
    foodCategory: 'cooked_meals',
    predictedSurplusPortions: 38,
    uncertaintyMargin: 4,
    factors: [
      { factor: 'Inclement Rain Forecast', impact: '+18% banquet guest no-show rate' },
      { factor: 'Historical Tuesday Dinner Surplus', impact: 'Averages 24-32 portions over last 6 weeks' },
      { factor: 'Preparation Buffer', impact: 'Chef prep target exceeded reservation count by 12%' }
    ],
    explanation: 'Estimated surplus: 38 portions (±4). Based on current banquet footfall pace and rainy weather reducing walk-in dining.',
    historicalActualSurplus: 35,
    accuracyRate: 92.5
  },
  {
    id: 'scen-2',
    donorId: 'donor-3',
    donorName: 'Sunrise University Hostel Dining Hall',
    dayOfWeek: 'Tuesday',
    expectedFootfall: 580,
    remainingInventoryKg: 65,
    eventBufferPercentage: 10,
    foodCategory: 'cooked_meals',
    predictedSurplusPortions: 75,
    uncertaintyMargin: 8,
    factors: [
      { factor: 'Exam Week Evening Departures', impact: '-14% student dining attendance' },
      { factor: 'Batch Cook Minimum Threshold', impact: 'Standard steam kettles produce fixed 200L increments' },
      { factor: 'Historical Tuesday Trend', impact: 'Consistent 60-80 portion overage' }
    ],
    explanation: 'Estimated surplus: 75 portions (±8). High confidence surplus driven by midterm examination week departures.',
    historicalActualSurplus: 72,
    accuracyRate: 94.2
  },
  {
    id: 'scen-3',
    donorId: 'donor-2',
    donorName: 'GreenLeaf Organics Supermarket',
    dayOfWeek: 'Tuesday',
    expectedFootfall: 850,
    remainingInventoryKg: 110,
    eventBufferPercentage: 20,
    foodCategory: 'fresh_produce',
    predictedSurplusPortions: 55, // portions/kg equiv
    uncertaintyMargin: 6,
    factors: [
      { factor: 'Incoming Supplier Delivery', impact: 'Warehouse restocking requires clear display shelves by 21:00' },
      { factor: 'Perishability Window (48h)', impact: 'Tomatoes & greens reach cosmetic threshold tomorrow' }
    ],
    explanation: 'Estimated surplus: 55 kg fresh produce. Rapid turnover required prior to Wednesday 07:00 cold-dock delivery.',
    historicalActualSurplus: 50,
    accuracyRate: 91.0
  }
];

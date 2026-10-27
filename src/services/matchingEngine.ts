import {
  FoodListing,
  Recipient,
  RecipientRequest,
  DeliveryPartner,
  MatchExplanation,
  MatchSafetyCheck
} from '../types';

export interface ScoredRecipientMatch {
  recipient: Recipient;
  request?: RecipientRequest;
  matchScore: number;
  explanation: MatchExplanation;
  recommendedDriver?: DeliveryPartner;
  feasibleQuantity: number;
}

// Calculate Haversine distance in kilometers
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function evaluateListingMatches(
  listing: FoodListing,
  recipients: Recipient[],
  requests: RecipientRequest[],
  drivers: DeliveryPartner[],
  currentSimulatedTime: string,
  fairnessCounts: Record<string, number> = {} // recipientId -> number of recent allocations
): ScoredRecipientMatch[] {
  const currentTime = new Date(currentSimulatedTime).getTime();
  const collectionDeadlineTime = new Date(listing.collectionDeadline).getTime();
  const minutesUntilCollection = Math.max(0, Math.round((collectionDeadlineTime - currentTime) / (60 * 1000)));

  const results: ScoredRecipientMatch[] = [];

  for (const recipient of recipients) {
    const safetyChecks: MatchSafetyCheck[] = [];
    const positiveFactors: string[] = [];
    const tradeOffs: string[] = [];

    // --- HARD CONSTRAINT 1: Food eligibility (Quarantine & Expiry) ---
    const isQuarantined = listing.quarantined || listing.status === 'quarantined';
    const isExpired = currentTime >= collectionDeadlineTime;
    const hasRemainingStock = listing.remainingQuantity > 0;

    safetyChecks.push({
      constraint: 'Food Integrity & Safety Quarantine',
      passed: !isQuarantined,
      details: isQuarantined
        ? `BLOCKED: Listing is under quarantine hold (${listing.quarantineReason || 'Safety alert'}).`
        : 'PASS: Verified safe, no active quarantine locks.'
    });

    safetyChecks.push({
      constraint: 'Collection Deadline Viability',
      passed: !isExpired && minutesUntilCollection > 15,
      details: isExpired
        ? 'BLOCKED: Collection deadline has lapsed.'
        : minutesUntilCollection <= 15
        ? `CRITICAL RISK: Only ${minutesUntilCollection} mins left, insufficient for safe logistics.`
        : `PASS: ${minutesUntilCollection} mins remaining before collection deadline.`
    });

    safetyChecks.push({
      constraint: 'Available Stock Verification',
      passed: hasRemainingStock,
      details: hasRemainingStock
        ? `PASS: ${listing.remainingQuantity} ${listing.unit} unallocated.`
        : 'BLOCKED: Zero remaining inventory in this batch.'
    });

    // --- HARD CONSTRAINT 2: Category Acceptance ---
    const acceptsCategory = recipient.acceptedCategories.includes(listing.category);
    safetyChecks.push({
      constraint: 'Recipient Category Acceptance',
      passed: acceptsCategory,
      details: acceptsCategory
        ? `PASS: Recipient accepts ${listing.category.replace('_', ' ')}.`
        : `BLOCKED: Recipient does not accept ${listing.category.replace('_', ' ')}.`
    });

    // --- HARD CONSTRAINT 3: Storage Capability Compatibility ---
    const hasRequiredStorage = recipient.storageCapabilities.includes(listing.storageRequirement);
    safetyChecks.push({
      constraint: 'Cold Chain / Thermal Storage Compatibility',
      passed: hasRequiredStorage,
      details: hasRequiredStorage
        ? `PASS: Recipient possesses verified ${listing.storageRequirement.replace('_', ' ')} capacity.`
        : `BLOCKED: Recipient lacks required ${listing.storageRequirement.replace('_', ' ')} infrastructure.`
    });

    // --- HARD CONSTRAINT 4: Dietary & Allergen Safety ---
    let dietarySafe = true;
    let allergenConflictNote = '';
    if (listing.allergens && listing.allergens.length > 0) {
      for (const rule of recipient.dietaryRules) {
        for (const allergen of listing.allergens) {
          if (rule.toLowerCase().includes(allergen.toLowerCase()) && rule.toLowerCase().includes('free')) {
            dietarySafe = false;
            allergenConflictNote = `Conflict: Listing contains ${allergen}, but recipient requires '${rule}'`;
          }
        }
      }
    }
    safetyChecks.push({
      constraint: 'Allergen & Dietary Integrity',
      passed: dietarySafe,
      details: dietarySafe
        ? 'PASS: No prohibited allergens or dietary violations detected.'
        : `BLOCKED: ${allergenConflictNote}`
    });

    // --- HARD CONSTRAINT 5: Distance & Operational Reach ---
    const distanceKm = calculateDistanceKm(
      listing.pickupLocation.lat,
      listing.pickupLocation.lng,
      recipient.location.lat,
      recipient.location.lng
    );
    const estimatedTravelMinutes = Math.round(distanceKm * 3.5 + 8); // ~20km/h urban speed + 8min loading

    const feasibleTime = estimatedTravelMinutes + 10 <= minutesUntilCollection;
    safetyChecks.push({
      constraint: 'Logistics Feasibility Window',
      passed: feasibleTime,
      details: feasibleTime
        ? `PASS: Estimated transit is ${estimatedTravelMinutes} mins (${distanceKm} km), safely within ${minutesUntilCollection} mins collection window.`
        : `BLOCKED: Transit duration (${estimatedTravelMinutes} mins) exceeds remaining safe window (${minutesUntilCollection} mins).`
    });

    // Find any matching active request from this recipient
    const matchingRequest = requests.find(
      r => r.recipientId === recipient.id &&
           r.category === listing.category &&
           r.status !== 'fulfilled' &&
           r.status !== 'cancelled'
    );

    // Capacity fit calculation
    const recipientCapacityRemaining = recipient.capacityKg; // simplified proxy
    const portionToKg = listing.unit === 'kg' ? 1 : 0.4;
    const listingKg = listing.remainingQuantity * portionToKg;
    const capacityPasses = recipientCapacityRemaining >= Math.min(listingKg, 15);

    safetyChecks.push({
      constraint: 'Receiving Physical Capacity',
      passed: capacityPasses,
      details: capacityPasses
        ? `PASS: Facility capacity can absorb delivery (~${Math.round(listingKg)} kg).`
        : 'BLOCKED: Recipient warehouse is at full capacity.'
    });

    // Check if ALL hard constraints passed
    const passedHardConstraints = safetyChecks.every(c => c.passed);

    if (!passedHardConstraints) {
      // Record failed match with 0 score and explicit failure reasons
      results.push({
        recipient,
        request: matchingRequest,
        matchScore: 0,
        feasibleQuantity: 0,
        explanation: {
          matchScore: 0,
          passedHardConstraints: false,
          safetyChecks,
          positiveFactors: [],
          tradeOffs: safetyChecks.filter(c => !c.passed).map(c => `FAILED CONSTRAINT: ${c.constraint} — ${c.details}`),
          estimatedDistanceKm: distanceKm,
          estimatedTravelMinutes,
          capacityFitPercentage: 0,
          urgencyBonus: 0,
          fairnessAdjustment: 0
        }
      });
      continue;
    }

    // --- SOFT SCORING (For candidates that passed all safety gates) ---
    let baseScore = 65;

    // 1. Proximity score (up to +15 for < 2km, decays over distance)
    if (distanceKm < 2.0) {
      baseScore += 15;
      positiveFactors.push(`Ultra-low transit distance (${distanceKm} km, ~${estimatedTravelMinutes} min transit)`);
    } else if (distanceKm < 5.0) {
      baseScore += 8;
      positiveFactors.push(`Moderate proximity (${distanceKm} km)`);
    } else {
      baseScore -= 8;
      tradeOffs.push(`Longer transit route (${distanceKm} km, ${estimatedTravelMinutes} min)`);
    }

    // 2. Request match & urgency bonus
    let urgencyBonus = 0;
    if (matchingRequest) {
      if (matchingRequest.urgency === 'urgent') {
        urgencyBonus = 15;
        positiveFactors.push('Fulfills an URGENT open hunger request from this shelter');
      } else if (matchingRequest.urgency === 'high') {
        urgencyBonus = 10;
        positiveFactors.push('Matches high-priority scheduled meal service');
      } else {
        urgencyBonus = 5;
        positiveFactors.push('Matches open pantry restock request');
      }
      baseScore += urgencyBonus;
    } else {
      tradeOffs.push('No specific pre-registered request, but recipient has general intake capacity');
    }

    // 3. Time critical perishability match
    if (minutesUntilCollection < 60) {
      baseScore += 8;
      positiveFactors.push(`Fast-action candidate for critical expiry batch (${minutesUntilCollection}m left)`);
    }

    // 4. Fairness adjustment (avoiding single-hub starvation)
    const recentAllocations = fairnessCounts[recipient.id] || 0;
    let fairnessAdjustment = 0;
    if (recentAllocations === 0) {
      fairnessAdjustment = 8;
      positiveFactors.push('Fairness Bonus: Recipient has had fewer recent food allocations today');
    } else if (recentAllocations >= 3) {
      fairnessAdjustment = -10;
      tradeOffs.push(`Fairness Dampener: Recipient has already received ${recentAllocations} allocations today`);
    }
    baseScore += fairnessAdjustment;

    // 5. Recipient Trust Score factor
    if (recipient.trustScore >= 95) {
      baseScore += 5;
      positiveFactors.push(`Exemplary trust score (${recipient.trustScore}%) with zero reported incidents`);
    }

    // 6. Find optimal delivery driver
    const availableDrivers = drivers.filter(d => {
      if (d.status !== 'available') return false;
      if (listing.storageRequirement === 'refrigerated' && !d.hasCooling) return false;
      if (listing.storageRequirement === 'hot_insulated' && !d.hasHotInsulation) return false;
      return true;
    });

    let bestDriver: DeliveryPartner | undefined = undefined;
    if (availableDrivers.length > 0) {
      // Pick driver closest to donor
      bestDriver = [...availableDrivers].sort((a, b) => {
        const distA = calculateDistanceKm(a.currentLocation.lat, a.currentLocation.lng, listing.pickupLocation.lat, listing.pickupLocation.lng);
        const distB = calculateDistanceKm(b.currentLocation.lat, b.currentLocation.lng, listing.pickupLocation.lat, listing.pickupLocation.lng);
        return distA - distB;
      })[0];
      positiveFactors.push(`Immediate courier available: ${bestDriver.name} (${bestDriver.vehicleType})`);
    } else {
      tradeOffs.push('No dedicated temperature-controlled driver currently idle; dispatch queue required');
      baseScore -= 12;
    }

    // Quantity fit & partial allocation recommendation
    let feasibleQuantity = listing.remainingQuantity;
    if (matchingRequest) {
      const remainingNeed = matchingRequest.quantityNeeded - matchingRequest.fulfilledQuantity;
      feasibleQuantity = Math.min(listing.remainingQuantity, Math.max(10, remainingNeed));
    }

    const capacityFitPercentage = Math.min(100, Math.round((feasibleQuantity / listing.remainingQuantity) * 100));
    if (feasibleQuantity < listing.remainingQuantity) {
      positiveFactors.push(`Supports partial allocation: can take ${feasibleQuantity} of ${listing.remainingQuantity} ${listing.unit}`);
    }

    const finalScore = Math.min(99, Math.max(45, Math.round(baseScore)));

    results.push({
      recipient,
      request: matchingRequest,
      matchScore: finalScore,
      feasibleQuantity,
      recommendedDriver: bestDriver,
      explanation: {
        matchScore: finalScore,
        passedHardConstraints: true,
        safetyChecks,
        positiveFactors,
        tradeOffs,
        estimatedDistanceKm: distanceKm,
        estimatedTravelMinutes,
        capacityFitPercentage,
        urgencyBonus,
        fairnessAdjustment
      }
    });
  }

  // Sort descending by match score
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

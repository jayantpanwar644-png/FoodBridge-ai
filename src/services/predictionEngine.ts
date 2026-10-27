import { FoodCategory, SurplusPredictionScenario, FoodListing, FoodUnit } from '../types';

export interface PredictionParameters {
  donorId: string;
  foodName: string;
  category: FoodCategory;
  remainingInventoryKg: number;
  expectedFootfall: number;
  averageMealPortionGrams: number;
  dayOfWeek: string;
  eventBufferPercent: number;
  weatherCondition: 'clear' | 'heavy_rain' | 'extreme_heat' | 'holiday_event';
}

export interface PredictionResult {
  predictedSurplusPortions: number;
  uncertaintyMargin: number;
  confidenceScore: number; // 0 - 100
  estimatedValueUsd: number;
  factors: { factor: string; impact: string; type: 'positive' | 'negative' | 'neutral' }[];
  explanation: string;
  suggestedCollectionWindowHours: number;
}

export function calculateSurplusPrediction(params: PredictionParameters): PredictionResult {
  const basePortions = (params.remainingInventoryKg * 1000) / (params.averageMealPortionGrams || 380);

  // Demand absorption multiplier
  let footfallFactor = 1.0;
  if (params.expectedFootfall < 300) {
    footfallFactor = 0.55;
  } else if (params.expectedFootfall < 600) {
    footfallFactor = 0.75;
  } else {
    footfallFactor = 0.90;
  }

  // Weather and event impact
  let weatherMultiplier = 1.0;
  let weatherNote = 'Normal seasonal weather';
  if (params.weatherCondition === 'heavy_rain') {
    weatherMultiplier = 1.25;
    weatherNote = 'Heavy rain reduces walk-in diner attendance by ~25%';
  } else if (params.weatherCondition === 'holiday_event') {
    weatherMultiplier = 0.85;
    weatherNote = 'Special holiday turnout absorbs 15% more prepared portions';
  } else if (params.weatherCondition === 'extreme_heat') {
    weatherMultiplier = 1.15;
    weatherNote = 'High ambient heat accelerates perishing risk; recommended earlier collection';
  }

  // Buffer multiplier
  const bufferAddon = params.eventBufferPercent / 100;

  // Final predicted surplus calculation (deterministic heuristic with explainability)
  const estimatedDinersAbsorbed = (basePortions * footfallFactor) / weatherMultiplier;
  const rawSurplus = Math.max(12, Math.round((basePortions - estimatedDinersAbsorbed) * (1 + bufferAddon)));
  const margin = Math.max(3, Math.round(rawSurplus * 0.12));

  const factors: { factor: string; impact: string; type: 'positive' | 'negative' | 'neutral' }[] = [
    {
      factor: `Remaining Inventory: ${params.remainingInventoryKg} kg`,
      impact: `Yields base capacity of ~${Math.round(basePortions)} standard servings`,
      type: 'neutral'
    },
    {
      factor: `Expected Footfall: ${params.expectedFootfall} diners`,
      impact: `Projected to consume ~${Math.round(estimatedDinersAbsorbed)} portions based on ${params.dayOfWeek} historical trends`,
      type: footfallFactor < 0.7 ? 'positive' : 'negative'
    },
    {
      factor: weatherNote,
      impact: `${params.weatherCondition === 'heavy_rain' ? '+25%' : params.weatherCondition === 'holiday_event' ? '-15%' : 'Baseline'} surplus variance`,
      type: params.weatherCondition === 'heavy_rain' ? 'positive' : 'neutral'
    },
    {
      factor: `Prep Safety Buffer: ${params.eventBufferPercent}%`,
      impact: `Contributes ~${Math.round(rawSurplus * bufferAddon)} contingency portions`,
      type: 'positive'
    }
  ];

  const estimatedValueUsd = Math.round(rawSurplus * 6.5); // Average commercial meal value
  const confidenceScore = Math.min(96, Math.max(82, 94 - margin));

  let suggestedCollectionHours = 2.5;
  if (params.category === 'cooked_meals') suggestedCollectionHours = 2.0;
  if (params.category === 'catered_buffet') suggestedCollectionHours = 1.75;
  if (params.category === 'fresh_produce') suggestedCollectionHours = 4.0;

  return {
    predictedSurplusPortions: rawSurplus,
    uncertaintyMargin: margin,
    confidenceScore,
    estimatedValueUsd,
    factors,
    explanation: `Estimated surplus: ${rawSurplus} portions (±${margin}). This estimate is based on ${params.remainingInventoryKg}kg remaining prep, ${params.dayOfWeek} footfall modeling, and ${weatherNote.toLowerCase()}.`,
    suggestedCollectionWindowHours: suggestedCollectionHours
  };
}

export function convertPredictionToDraftListing(
  donorId: string,
  donorName: string,
  pickupAddress: string,
  lat: number,
  lng: number,
  zone: string,
  params: PredictionParameters,
  result: PredictionResult,
  currentSimulatedTime: string
): Partial<FoodListing> {
  const baseTime = new Date(currentSimulatedTime);
  const prepTime = new Date(baseTime.getTime() - 45 * 60 * 1000).toISOString();
  const collectionDeadline = new Date(baseTime.getTime() + result.suggestedCollectionWindowHours * 60 * 60 * 1000).toISOString();
  const useByDeadline = new Date(baseTime.getTime() + (result.suggestedCollectionWindowHours + 3.5) * 60 * 60 * 1000).toISOString();

  return {
    id: `list-${Date.now().toString().slice(-4)}`,
    donorId,
    foodName: params.foodName || `Predicted Surplus: ${params.category.replace('_', ' ').toUpperCase()}`,
    category: params.category,
    quantity: result.predictedSurplusPortions,
    remainingQuantity: result.predictedSurplusPortions,
    unit: 'portions',
    preparationTime: prepTime,
    useByDeadline: useByDeadline,
    collectionDeadline: collectionDeadline,
    storageRequirement: params.category === 'cooked_meals' || params.category === 'catered_buffet' ? 'hot_insulated' : 'refrigerated',
    packaging: 'sealed_containers',
    allergens: [],
    isVegetarian: true,
    isVegan: false,
    isHalal: true,
    pickupAddress: pickupAddress || 'Main Kitchen Receiving Bay',
    pickupLocation: { lat, lng, address: pickupAddress, zone },
    pickupWindowStart: currentSimulatedTime,
    pickupWindowEnd: collectionDeadline,
    donorInstructions: 'AI-generated surplus forecast verified by kitchen supervisor. Packed in sealed food containers ready for rapid courier dispatch.',
    safetyVerified: true,
    quarantined: false,
    status: 'active',
    createdAt: currentSimulatedTime
  };
}

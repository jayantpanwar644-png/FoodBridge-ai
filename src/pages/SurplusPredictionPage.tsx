import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodCategory } from '../types';
import {
  calculateSurplusPrediction,
  convertPredictionToDraftListing,
  PredictionParameters
} from '../services/predictionEngine';
import {
  BrainCircuit,
  Sparkles,
  Sliders,
  CloudRain,
  Sun,
  Flame,
  CheckCircle2,
  PackagePlus
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';

export const SurplusPredictionPage: React.FC = () => {
  const { donors, addListing, currentSimulatedTime, setActiveTab } = useApp();

  const [selectedDonorId, setSelectedDonorId] = useState(donors[0]?.id || 'donor-1');
  const [foodName, setFoodName] = useState('Executive Salmon Pilaf & Roasted Veggies');
  const [category, setCategory] = useState<FoodCategory>('cooked_meals');
  const [remainingInventoryKg, setRemainingInventoryKg] = useState<number>(35);
  const [expectedFootfall, setExpectedFootfall] = useState<number>(240);
  const [dayOfWeek, setDayOfWeek] = useState<string>('Tuesday');
  const [eventBufferPercent, setEventBufferPercent] = useState<number>(15);
  const [weatherCondition, setWeatherCondition] = useState<
    'clear' | 'heavy_rain' | 'extreme_heat' | 'holiday_event'
  >('heavy_rain');

  const [publishedSuccess, setPublishedSuccess] = useState(false);

  const selectedDonor = donors.find(d => d.id === selectedDonorId) || donors[0];

  const params: PredictionParameters = {
    donorId: selectedDonorId,
    foodName,
    category,
    remainingInventoryKg,
    expectedFootfall,
    averageMealPortionGrams: 380,
    dayOfWeek,
    eventBufferPercent,
    weatherCondition
  };

  const prediction = calculateSurplusPrediction(params);

  const comparisonData = [
    { period: 'Last Tue', historicalActual: 32, predicted: 30 },
    { period: '2 Wks Ago', historicalActual: 28, predicted: 29 },
    { period: '3 Wks Ago', historicalActual: 36, predicted: 34 },
    { period: 'Today (Live)', historicalActual: 0, predicted: prediction.predictedSurplusPortions }
  ];

  const handlePublishListing = () => {
    const draft = convertPredictionToDraftListing(
      selectedDonor.id,
      selectedDonor.name,
      selectedDonor.location.address,
      selectedDonor.location.lat,
      selectedDonor.location.lng,
      selectedDonor.location.zone,
      params,
      prediction,
      currentSimulatedTime
    );

    addListing(draft as any);
    setPublishedSuccess(true);
    setTimeout(() => {
      setPublishedSuccess(false);
      setActiveTab('listings');
    }, 1800);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8 text-emerald-600" />
            <span>AI Surplus Forecaster</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Forecast edible surplus before service wraps up. Adjust footfall, weather, and inventory factors to preview expected portions.
          </p>
        </div>

        <span className="text-sm font-extrabold text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 self-start md:self-auto">
          Explainable Heuristic Model
        </span>
      </div>

      {publishedSuccess && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-base font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3 font-semibold">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Success! Predicted surplus published as active listing for AI redistribution matching.</span>
          </div>
          <span className="text-sm text-emerald-700 underline font-bold">Redirecting to listings...</span>
        </div>
      )}

      {/* Grid: Left parameters, Right live forecast */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-5 text-base">
          <div className="flex items-center justify-between border-b border-surface-100 pb-3">
            <h2 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-600" />
              <span>Forecast Scenario Inputs</span>
            </h2>
            <span className="text-xs font-bold text-surface-400 uppercase">Interactive</span>
          </div>

          {/* Donor selector */}
          <div>
            <label className="block font-semibold text-surface-800 mb-1.5">Donor Establishment</label>
            <select
              value={selectedDonorId}
              onChange={e => setSelectedDonorId(e.target.value)}
              className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-base"
            >
              {donors.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.type})
                </option>
              ))}
            </select>
          </div>

          {/* Food item title */}
          <div>
            <label className="block font-semibold text-surface-800 mb-1.5">Prepared Menu Item</label>
            <input
              type="text"
              value={foodName}
              onChange={e => setFoodName(e.target.value)}
              className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
            />
          </div>

          {/* Food Category & Day of Week */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-surface-800 mb-1.5">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as FoodCategory)}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-base"
              >
                <option value="cooked_meals">Cooked Hot Meals</option>
                <option value="catered_buffet">Catered Buffet</option>
                <option value="fresh_produce">Fresh Produce</option>
                <option value="bakery_dairy">Bakery & Dairy</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-surface-800 mb-1.5">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value)}
                className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-base"
              >
                <option value="Tuesday">Tuesday (Today)</option>
                <option value="Friday">Friday (High Volume)</option>
                <option value="Sunday">Sunday (Brunch Surge)</option>
              </select>
            </div>
          </div>

          {/* Remaining Inventory Slider */}
          <div>
            <div className="flex justify-between font-semibold text-surface-800 mb-1.5">
              <span>Remaining Prep Inventory:</span>
              <span className="font-extrabold text-emerald-700">{remainingInventoryKg} kg</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={remainingInventoryKg}
              onChange={e => setRemainingInventoryKg(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>10 kg (~25 servings)</span>
              <span>150 kg (~380 servings)</span>
            </div>
          </div>

          {/* Expected Footfall Slider */}
          <div>
            <div className="flex justify-between font-semibold text-surface-800 mb-1.5">
              <span>Expected Diner Footfall:</span>
              <span className="font-extrabold text-emerald-700">{expectedFootfall} diners</span>
            </div>
            <input
              type="range"
              min="50"
              max="800"
              step="10"
              value={expectedFootfall}
              onChange={e => setExpectedFootfall(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-surface-500 mt-1">
              <span>50 (Sparse)</span>
              <span>400 (Moderate)</span>
              <span>800 (Capacity)</span>
            </div>
          </div>

          {/* Weather / External Conditions */}
          <div>
            <label className="block font-semibold text-surface-800 mb-2">Weather & External Condition</label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setWeatherCondition('heavy_rain')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-sm transition ${
                  weatherCondition === 'heavy_rain'
                    ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold'
                    : 'bg-surface-50 border-surface-200 text-surface-700'
                }`}
              >
                <CloudRain className="w-5 h-5 text-blue-600 shrink-0" />
                <span>Heavy Rain (-25% Footfall)</span>
              </button>
              <button
                type="button"
                onClick={() => setWeatherCondition('clear')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-sm transition ${
                  weatherCondition === 'clear'
                    ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold'
                    : 'bg-surface-50 border-surface-200 text-surface-700'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Normal / Clear</span>
              </button>
              <button
                type="button"
                onClick={() => setWeatherCondition('holiday_event')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-sm transition ${
                  weatherCondition === 'holiday_event'
                    ? 'bg-purple-50 border-purple-400 text-purple-950 font-bold'
                    : 'bg-surface-50 border-surface-200 text-surface-700'
                }`}
              >
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <span>Special Event</span>
              </button>
              <button
                type="button"
                onClick={() => setWeatherCondition('extreme_heat')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 text-sm transition ${
                  weatherCondition === 'extreme_heat'
                    ? 'bg-rose-50 border-rose-400 text-rose-950 font-bold'
                    : 'bg-surface-50 border-surface-200 text-surface-700'
                }`}
              >
                <Flame className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Ambient Heat Surge</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Forecast Metric Card */}
          <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Forecasted Surplus Projection
                </span>
                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-5xl font-black text-surface-900">
                    {prediction.predictedSurplusPortions}
                  </span>
                  <span className="text-2xl font-bold text-surface-600">portions</span>
                  <span className="text-sm font-semibold text-surface-400">
                    (±{prediction.uncertaintyMargin})
                  </span>
                </div>
                <div className="text-sm text-surface-600 mt-1.5">
                  Estimated commercial meal value: <strong className="text-surface-900">${prediction.estimatedValueUsd}</strong>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 text-center shrink-0">
                <div className="text-xs font-bold text-surface-500 uppercase">Confidence Level</div>
                <div className="text-3xl font-black text-emerald-600 mt-0.5">
                  {prediction.confidenceScore}%
                </div>
                <div className="text-xs text-surface-500">Based on historical variance</div>
              </div>
            </div>

            {/* Model Explanation Box */}
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 text-base text-surface-800 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-surface-900 mb-0.5">Explainable AI Attribution:</div>
                <p className="leading-relaxed text-sm text-surface-700">{prediction.explanation}</p>
              </div>
            </div>

            {/* Publish Action Button */}
            <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-sm text-surface-500">
                Suggested pickup window: <strong>{prediction.suggestedCollectionWindowHours} hrs</strong>
              </span>
              <button
                onClick={handlePublishListing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition active:scale-95"
              >
                <PackagePlus className="w-5 h-5" />
                <span>1-Click Create Food Listing</span>
              </button>
            </div>
          </div>

          {/* Factor Breakdown Cards */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
            <h3 className="font-extrabold text-base text-surface-900 uppercase tracking-wider mb-4">
              Driving Factors Influencing Estimate
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {prediction.factors.map((f, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    f.type === 'positive'
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                      : f.type === 'negative'
                      ? 'bg-blue-50/70 border-blue-300 text-blue-950'
                      : 'bg-surface-50 border-surface-200 text-surface-900'
                  }`}
                >
                  <div className="font-bold text-base mb-1">{f.factor}</div>
                  <div className="text-sm text-surface-700">{f.impact}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Historical vs Predicted Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
            <h3 className="font-extrabold text-base text-surface-900 uppercase tracking-wider mb-1">
              Historical vs. Forecasted Surplus (Portions)
            </h3>
            <p className="text-sm text-surface-500 mb-4">
              Compares today's live heuristic projection against past Tuesdays' verified surplus.
            </p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '13px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '13px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Bar dataKey="historicalActual" name="Actual Surplus" fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="predicted" name="AI Forecast" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

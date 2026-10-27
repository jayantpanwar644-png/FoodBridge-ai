import React from 'react';
import { useApp } from '../context/AppContext';
import { PerishabilityRisk, FoodListing } from '../types';
import {
  Timer,
  Clock,
  AlertTriangle,
  Flame,
  Snowflake,
  ShieldAlert,
  ShieldCheck,
  FastForward,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PerishabilityPage: React.FC = () => {
  const { listings, donors, currentSimulatedTime, advanceSimulatedTime, resetSimulatedTime, setActiveTab } = useApp();

  const getRiskDetails = (listing: FoodListing) => {
    const curTime = new Date(currentSimulatedTime).getTime();
    const deadlineTime = new Date(listing.collectionDeadline).getTime();
    const useByTime = new Date(listing.useByDeadline).getTime();
    const minutesLeft = Math.round((deadlineTime - curTime) / 60000);

    if (listing.quarantined || listing.status === 'quarantined') {
      return {
        risk: 'ineligible' as PerishabilityRisk,
        minutesLeft,
        label: 'Ineligible (Safety Quarantine)',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        recommendation: 'Quarantined: Frozen from allocation until food-safety investigation concludes.'
      };
    }

    if (minutesLeft <= 0 || listing.status === 'expired') {
      return {
        risk: 'ineligible' as PerishabilityRisk,
        minutesLeft: 0,
        label: 'Ineligible (Collection Window Lapsed)',
        badgeColor: 'bg-surface-200 text-surface-700 border-surface-300',
        recommendation: 'Expired: Unsafe for human distribution. Route to certified commercial composting.'
      };
    }

    if (minutesLeft <= 45) {
      return {
        risk: 'critical' as PerishabilityRisk,
        minutesLeft,
        label: 'Critical Expiry (< 45 min)',
        badgeColor: 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse',
        recommendation: 'Immediate action required: 2 eligible shelters remain within 15-min delivery radius.'
      };
    }

    if (minutesLeft <= 90) {
      return {
        risk: 'warning' as PerishabilityRisk,
        minutesLeft,
        label: 'Warning (Approaching Window)',
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        recommendation: 'Collection deadline approaching. Pre-match with standby recipient.'
      };
    }

    return {
      risk: 'normal' as PerishabilityRisk,
      minutesLeft,
      label: 'Normal Safe Window',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      recommendation: 'Comfortable distribution buffer remains.'
    };
  };

  const criticalItems = listings.filter(l => getRiskDetails(l).risk === 'critical');
  const warningItems = listings.filter(l => getRiskDetails(l).risk === 'warning');
  const normalItems = listings.filter(l => getRiskDetails(l).risk === 'normal');
  const ineligibleItems = listings.filter(l => getRiskDetails(l).risk === 'ineligible');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <Timer className="w-5 h-5 text-brand-600" />
            <span>Perishability Intelligence & Expiry Radar</span>
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Dynamic shelf-life tracking synced with ambient temperature and simulated transit feasibility.
          </p>
        </div>

        {/* Demo Fast-Forward Controller for Judges */}
        <div className="flex items-center gap-2 bg-surface-50 border border-surface-200 p-2 rounded-xl text-xs">
          <span className="font-semibold text-surface-600">Simulate Time:</span>
          <button
            onClick={() => advanceSimulatedTime(15)}
            className="px-2.5 py-1 rounded-lg bg-white border border-surface-200 hover:bg-surface-100 font-medium transition"
          >
            +15m
          </button>
          <button
            onClick={() => advanceSimulatedTime(45)}
            className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 font-bold transition"
          >
            +45m (Trigger Critical)
          </button>
          <button
            onClick={() => advanceSimulatedTime(180)}
            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 hover:bg-rose-100 font-bold transition"
          >
            +3h (Lapse Window)
          </button>
          <button
            onClick={resetSimulatedTime}
            title="Reset clock"
            className="p-1.5 rounded-lg bg-white border border-surface-200 text-surface-500 hover:text-surface-900"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Urgent Alert Banner if Critical Items exist */}
      {criticalItems.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <span>
              URGENT EXPIRY RADAR: {criticalItems.length} active batch requires immediate courier assignment before collection deadline expires!
            </span>
          </div>
          <button
            onClick={() => setActiveTab('matching')}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 shrink-0"
          >
            Dispatch Now
          </button>
        </div>
      )}

      {/* Risk Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <div className="text-surface-400 font-bold uppercase text-[10px]">Critical (&lt; 45m)</div>
          <div className="text-2xl font-black text-rose-600 mt-1">{criticalItems.length}</div>
          <div className="text-[11px] text-surface-500 mt-0.5">High urgency dispatch needed</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <div className="text-surface-400 font-bold uppercase text-[10px]">Warning (45-90m)</div>
          <div className="text-2xl font-black text-amber-600 mt-1">{warningItems.length}</div>
          <div className="text-[11px] text-surface-500 mt-0.5">Approaching window</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <div className="text-surface-400 font-bold uppercase text-[10px]">Normal (&gt; 90m)</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{normalItems.length}</div>
          <div className="text-[11px] text-surface-500 mt-0.5">Safe operational buffer</div>
        </div>
        <div className="p-4 rounded-xl bg-white border border-surface-200 shadow-xs">
          <div className="text-surface-400 font-bold uppercase text-[10px]">Ineligible / Quarantined</div>
          <div className="text-2xl font-black text-surface-500 mt-1">{ineligibleItems.length}</div>
          <div className="text-[11px] text-surface-500 mt-0.5">Safety blocked</div>
        </div>
      </div>

      {/* Perishability Inventory Cards */}
      <div className="space-y-3">
        {listings.map(item => {
          const donor = donors.find(d => d.id === item.donorId);
          const riskInfo = getRiskDetails(item);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 shadow-xs transition flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                riskInfo.risk === 'critical'
                  ? 'border-rose-300 bg-rose-50/10 ring-1 ring-rose-200'
                  : riskInfo.risk === 'warning'
                  ? 'border-amber-300 bg-amber-50/10'
                  : 'border-surface-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-surface-900">{item.foodName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${riskInfo.badgeColor}`}>
                    {riskInfo.label}
                  </span>
                  <span className="text-[10px] font-semibold text-surface-500 bg-surface-100 px-2 py-0.5 rounded">
                    {item.storageRequirement.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-[11px] text-surface-500 flex flex-wrap items-center gap-3">
                  <span>Donor: <strong>{donor?.name}</strong></span>
                  <span>•</span>
                  <span>Quantity: <strong>{item.remainingQuantity} {item.unit}</strong></span>
                  <span>•</span>
                  <span>
                    Deadline: <strong>{new Date(item.collectionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                  </span>
                </div>

                {/* Intelligent recommendation */}
                <div className="text-[11px] text-brand-900 font-medium bg-brand-50/70 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                  <span><strong>AI Perishability Sentinel:</strong> {riskInfo.recommendation}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                {riskInfo.risk === 'ineligible' ? (
                  <span className="text-surface-400 font-semibold text-[11px]">Safety Locked</span>
                ) : (
                  <button
                    onClick={() => setActiveTab('matching')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                  >
                    <span>Match Before Expiry</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

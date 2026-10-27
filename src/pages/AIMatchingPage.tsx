import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { evaluateListingMatches, ScoredRecipientMatch } from '../services/matchingEngine';
import {
  HeartHandshake,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const AIMatchingPage: React.FC = () => {
  const {
    listings,
    recipients,
    requests,
    drivers,
    createAllocation,
    currentSimulatedTime,
    setActiveTab
  } = useApp();

  const activeListings = listings.filter(l => l.status === 'active' || l.status === 'partially_allocated');
  const [selectedListingId, setSelectedListingId] = useState<string>(activeListings[0]?.id || listings[0]?.id);
  const [expandedMatchId, setExpandedMatchId] = useState<string | null>(null);

  const selectedListing = listings.find(l => l.id === selectedListingId) || listings[0];

  // Allocation quantity (supports partial allocation)
  const [quantityToAllocate, setQuantityToAllocate] = useState<number>(
    selectedListing ? selectedListing.remainingQuantity : 20
  );

  const [confirmationNotice, setConfirmationNotice] = useState<string>('');

  // Evaluate matches
  const matchResults: ScoredRecipientMatch[] = selectedListing
    ? evaluateListingMatches(selectedListing, recipients, requests, drivers, currentSimulatedTime)
    : [];

  const eligibleMatches = matchResults.filter(m => m.matchScore > 0);
  const topThreeMatches = eligibleMatches.slice(0, 3);
  const isQuarantined = selectedListing?.quarantined || selectedListing?.status === 'quarantined';

  const handleSelectNGO = (match: ScoredRecipientMatch) => {
    if (!selectedListing) return;
    const qty = Math.min(quantityToAllocate, selectedListing.remainingQuantity);
    const alloc = createAllocation(selectedListing.id, match.recipient.id, qty);
    if (alloc) {
      setConfirmationNotice(
        `Selected ${match.recipient.name}! Assigned ${qty} ${selectedListing.unit}. Courier dispatch initiated.`
      );
      setTimeout(() => {
        setConfirmationNotice('');
        setActiveTab('deliveries');
      }, 1800);
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <HeartHandshake className="w-8 h-8 text-emerald-600" />
            <span>AI Matching</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Find an NGO that needs your food and can receive it safely. Check storage capability, delivery radius, and urgency score.
          </p>
        </div>
      </div>

      {confirmationNotice && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-base font-semibold flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{confirmationNotice} Redirecting to Deliveries...</span>
        </div>
      )}

      {/* Step 1: Select Eligible Food Donation */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="font-extrabold text-surface-900 text-xl">
            Step 1: Choose Available Food Donation
          </label>
          <span className="text-surface-600 text-base">
            Selected Batch Remaining: <strong className="text-emerald-700 font-extrabold">{selectedListing?.remainingQuantity} {selectedListing?.unit}</strong>
          </span>
        </div>

        {activeListings.length === 0 ? (
          <div className="p-6 bg-surface-50 rounded-2xl text-center text-surface-600 text-base">
            No active donations available. Click "+ Donate Food" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeListings.map(l => {
              const isSelected = selectedListingId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setSelectedListingId(l.id);
                    setQuantityToAllocate(l.remainingQuantity);
                    setExpandedMatchId(null);
                  }}
                  className={`p-4 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500'
                      : 'border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <div className="font-bold text-lg text-surface-900 truncate">{l.foodName}</div>
                  <div className="text-sm text-surface-600 mt-1.5 flex items-center justify-between">
                    <span>{l.remainingQuantity} {l.unit} remaining</span>
                    <span className="capitalize text-emerald-700 font-bold">{l.storageRequirement.replace('_', ' ')}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Partial Allocation Quantity Slider */}
        {selectedListing && !isQuarantined && (
          <div className="pt-4 border-t border-surface-100 flex flex-wrap items-center justify-between gap-4 text-base">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-surface-800">Portions to Allocate:</span>
              <input
                type="number"
                min="5"
                max={selectedListing.remainingQuantity}
                value={quantityToAllocate}
                onChange={e => setQuantityToAllocate(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-surface-300 rounded-xl text-center font-bold text-base text-surface-900"
              />
              <span className="text-surface-600 font-medium">{selectedListing.unit}</span>
            </div>
            <span className="text-sm text-surface-500">
              Remaining after allocation: <strong className="text-surface-800">{Math.max(0, selectedListing.remainingQuantity - quantityToAllocate)} {selectedListing.unit}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Step 2: Top 3 NGO Recommendations */}
      <div className="space-y-5">
        <h2 className="font-extrabold text-xl text-surface-900">
          Step 2: Recommended NGO Recipients for this Food
        </h2>

        {isQuarantined ? (
          <div className="p-8 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 space-y-3 text-center">
            <ShieldAlert className="w-10 h-10 text-rose-600 mx-auto" />
            <h3 className="font-extrabold text-xl">Allocation Blocked: Batch on Safety Hold</h3>
            <p className="max-w-lg mx-auto text-base text-rose-800 leading-relaxed">
              This food batch was flagged with a quality concern ({selectedListing.quarantineReason}). In strict adherence to food safety standards, it cannot be matched until cleared by operations.
            </p>
            <button
              onClick={() => setActiveTab('safety')}
              className="mt-2 px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base transition"
            >
              Review Safety Hold
            </button>
          </div>
        ) : topThreeMatches.length === 0 ? (
          <div className="p-8 rounded-2xl bg-surface-100 border border-surface-200 text-center text-surface-700 space-y-3">
            <h3 className="font-bold text-xl">No Suitable Match Found</h3>
            <p className="max-w-lg mx-auto text-base text-surface-600">
              Candidate shelters either lack required storage or the collection deadline is too short to complete transit safely.
            </p>
            <div className="text-base font-semibold text-emerald-800">
              Suggested next step: Extend the pickup window or select a different available batch.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {topThreeMatches.map((match, index) => {
              const isExpanded = expandedMatchId === match.recipient.id;

              return (
                <div
                  key={match.recipient.id}
                  className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs transition space-y-4 hover:border-surface-300"
                >
                  {/* NGO Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 text-sm font-extrabold flex items-center justify-center shrink-0">
                          #{index + 1}
                        </span>
                        <h3 className="font-extrabold text-xl text-surface-900">{match.recipient.name}</h3>
                        <span className="text-xs uppercase font-extrabold text-surface-600 bg-surface-100 px-3 py-1 rounded-full">
                          {match.recipient.type}
                        </span>
                      </div>
                      <div className="text-sm text-surface-600 flex items-center gap-3 pl-9">
                        <span>Approx. <strong>{match.explanation.estimatedDistanceKm} km</strong> away (Demo estimate)</span>
                        <span>•</span>
                        <span>Capacity: <strong>{match.recipient.capacityKg} kg</strong></span>
                      </div>
                    </div>

                    {/* Match Score & Select Button */}
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="text-xs text-surface-500 font-bold uppercase">Match Score</div>
                        <div className="text-3xl font-black text-emerald-600">{match.matchScore} / 100</div>
                      </div>

                      <button
                        onClick={() => handleSelectNGO(match)}
                        className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition active:scale-95"
                      >
                        Select NGO
                      </button>
                    </div>
                  </div>

                  {/* One Short Explanation */}
                  <div className="pl-9 text-base text-surface-800 font-medium bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      {match.request
                        ? `Matches active ${match.request.urgency} request for ${match.request.quantityNeeded} portions. Recipient has confirmed ${selectedListing.storageRequirement.replace('_', ' ')} receiving capacity.`
                        : `Facility is within ${match.explanation.estimatedDistanceKm}km and supports ${selectedListing.storageRequirement.replace('_', ' ')} storage.`}
                    </span>
                  </div>

                  {/* Expandable "Why this match?" */}
                  <div className="pl-9 pt-1">
                    <button
                      type="button"
                      onClick={() => setExpandedMatchId(isExpanded ? null : match.recipient.id)}
                      className="text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                    >
                      <span>Why this match?</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isExpanded && (
                      <div className="mt-3 p-4 bg-surface-50 rounded-xl border border-surface-200 text-sm space-y-3 animate-in fade-in">
                        <div className="font-bold text-surface-900 uppercase text-xs">
                          Hard Safety Constraints Verified:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-surface-700">
                          {match.explanation.safetyChecks.map((chk, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{chk.constraint}: Pass</span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-2 border-t border-surface-200 text-surface-600">
                          Estimated Courier Transit: ~{match.explanation.estimatedTravelMinutes} mins. Ready for immediate pickup dispatch.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

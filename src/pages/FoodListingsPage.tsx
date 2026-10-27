import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodListing } from '../types';
import {
  Package,
  Plus,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Filter,
  ArrowRight
} from 'lucide-react';

interface FoodListingsPageProps {
  onOpenCreateListing: () => void;
}

export const FoodListingsPage: React.FC<FoodListingsPageProps> = ({ onOpenCreateListing }) => {
  const { listings, donors, currentSimulatedTime, setActiveTab, searchQuery } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [safetyFilter, setSafetyFilter] = useState<string>('all');

  const getSafetyState = (listing: FoodListing): 'eligible' | 'at_risk' | 'safety_hold' => {
    if (listing.quarantined || listing.status === 'quarantined') return 'safety_hold';
    const curTime = new Date(currentSimulatedTime).getTime();
    const deadlineTime = new Date(listing.collectionDeadline).getTime();
    const minutesLeft = Math.round((deadlineTime - curTime) / 60000);
    if (minutesLeft <= 45) return 'at_risk';
    return 'eligible';
  };

  const filteredListings = listings.filter(item => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = item.foodName.toLowerCase().includes(q);
      const matchDonor = donors.find(d => d.id === item.donorId)?.name.toLowerCase().includes(q);
      if (!matchName && !matchDonor) return false;
    }
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    if (safetyFilter !== 'all') {
      const state = getSafetyState(item);
      if (state !== safetyFilter) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-emerald-600" />
            <span>Food Donations</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            List extra food so it can reach a suitable NGO. Check collection deadlines and connect with verified recipient shelters.
          </p>
        </div>
        <button
          onClick={onOpenCreateListing}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition self-start md:self-auto active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>+ Donate Surplus Food</span>
        </button>
      </div>

      {/* 2. Clean Filters */}
      <div className="bg-white p-5 rounded-2xl border border-surface-200 flex flex-wrap items-center gap-4 text-base">
        <div className="flex items-center gap-2 text-surface-700 font-semibold">
          <Filter className="w-5 h-5 text-surface-500" />
          <span>Filter:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-surface-800 text-base font-medium"
        >
          <option value="all">All Categories</option>
          <option value="cooked_meals">Cooked Meals</option>
          <option value="fresh_produce">Fresh Produce</option>
          <option value="bakery_dairy">Bakery & Dairy</option>
          <option value="catered_buffet">Catered Buffet</option>
        </select>

        <select
          value={safetyFilter}
          onChange={e => setSafetyFilter(e.target.value)}
          className="px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-surface-800 text-base font-medium"
        >
          <option value="all">All Safety States</option>
          <option value="eligible">Safe & Eligible</option>
          <option value="at_risk">Deadline at Risk</option>
          <option value="safety_hold">On Safety Hold</option>
        </select>

        <span className="text-sm text-surface-500 ml-auto">
          Showing <strong>{filteredListings.length}</strong> available batches
        </span>
      </div>

      {/* 3. Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredListings.map(item => {
          const donor = donors.find(d => d.id === item.donorId);
          const safetyState = getSafetyState(item);
          const curTime = new Date(currentSimulatedTime).getTime();
          const deadlineTime = new Date(item.collectionDeadline).getTime();
          const minutesLeft = Math.round((deadlineTime - curTime) / 60000);

          return (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between space-y-4 transition ${
                safetyState === 'safety_hold'
                  ? 'border-rose-300 bg-rose-50/20'
                  : safetyState === 'at_risk'
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-surface-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-extrabold text-xl text-surface-900">{item.foodName}</h3>

                  {safetyState === 'safety_hold' && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 shrink-0 border border-rose-300">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>On Safety Hold</span>
                    </span>
                  )}
                  {safetyState === 'at_risk' && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 shrink-0 border border-amber-300">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>Deadline at Risk</span>
                    </span>
                  )}
                  {safetyState === 'eligible' && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Eligible</span>
                    </span>
                  )}
                </div>

                <div className="text-sm text-surface-600 mb-3">
                  Donor: <strong className="text-surface-800">{donor?.name}</strong> • Location: <strong>{item.pickupLocation.zone}</strong>
                </div>

                {safetyState === 'safety_hold' && item.quarantineReason && (
                  <div className="mb-3 p-3 rounded-xl bg-rose-100/70 text-rose-900 text-sm font-medium border border-rose-200">
                    <strong>Investigation Reason:</strong> {item.quarantineReason}
                  </div>
                )}

                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200 grid grid-cols-2 gap-3 text-sm mb-2">
                  <div>
                    <span className="text-surface-500">Remaining Quantity:</span>{' '}
                    <div className="text-base font-extrabold text-surface-900">{item.remainingQuantity} {item.unit}</div>
                  </div>
                  <div>
                    <span className="text-surface-500">Collection Deadline:</span>{' '}
                    <div className={`text-base font-extrabold ${minutesLeft <= 45 ? 'text-amber-700' : 'text-surface-900'}`}>
                      {minutesLeft > 0 ? `${minutesLeft}m left` : 'Lapsed'}
                    </div>
                  </div>
                  <div>
                    <span className="text-surface-500">Required Storage:</span>{' '}
                    <div className="capitalize text-surface-800 font-semibold">{item.storageRequirement.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <span className="text-surface-500">Allergens Declared:</span>{' '}
                    <div className="text-surface-800 font-semibold">
                      {item.allergens.length > 0 ? item.allergens.join(', ') : 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Find Suitable NGO on each eligible listing */}
              <div className="pt-3 border-t border-surface-200 flex items-center justify-between">
                <span className="text-sm text-surface-500 font-mono">
                  Batch: {item.id}
                </span>

                {safetyState === 'safety_hold' ? (
                  <button
                    onClick={() => setActiveTab('safety')}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base transition"
                  >
                    Inspect Safety Hold
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('matching')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xs flex items-center gap-2 transition active:scale-95"
                  >
                    <span>Find Suitable NGO</span>
                    <ArrowRight className="w-5 h-5" />
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

import React from 'react';
import { useApp } from '../context/AppContext';
import { FoodListing } from '../types';
import {
  Package,
  HeartHandshake,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  ShieldAlert,
  ScanBarcode,
  MapPin,
  Sparkles
} from 'lucide-react';

interface DashboardPageProps {
  onOpenCreateListing: () => void;
  onOpenRescueMission: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenCreateListing,
  onOpenRescueMission
}) => {
  const {
    listings,
    allocations,
    setActiveTab,
    currentSimulatedTime,
    donors,
    failoverDelivery
  } = useApp();

  // 1. Calculate the 4 key metrics
  const activeListings = listings.filter(l => l.status === 'active' || l.status === 'partially_allocated');
  const totalFoodAvailablePortions = activeListings.reduce((sum, item) => {
    const portions = item.unit === 'kg' ? Math.round(item.remainingQuantity * 2.2) : item.remainingQuantity;
    return sum + portions;
  }, 0);

  const activeDonationsCount = activeListings.length;

  const deliveriesInProgress = allocations.filter(
    a => a.status === 'in_transit' || a.status === 'pickup_assigned' || a.status === 'reassigned'
  ).length;

  const mealsDeliveredCount = allocations
    .filter(a => a.status === 'delivered')
    .reduce((sum, a) => {
      const portions = a.unit === 'kg' ? Math.round(a.quantityAllocated * 2.2) : a.quantityAllocated;
      return sum + portions;
    }, 0);

  // 2. Identify "Needs Attention" items
  const attentionItems: {
    id: string;
    type: 'deadline' | 'failure' | 'safety';
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
  }[] = [];

  // Check failed pickups
  allocations.forEach(a => {
    if (a.status === 'pickup_failed') {
      attentionItems.push({
        id: `fail-${a.id}`,
        type: 'failure',
        title: `Courier Issue: Delivery ${a.id}`,
        description: a.failureReason || 'Courier unable to complete run. Immediate reassignment available.',
        actionLabel: 'Find Replacement Partner',
        onAction: () => {
          failoverDelivery(a.id, 'Dispatched standby replacement courier from Dashboard.');
          setActiveTab('deliveries');
        }
      });
    }
  });

  // Check critical deadlines & safety holds
  listings.forEach(l => {
    const curTime = new Date(currentSimulatedTime).getTime();
    const deadlineTime = new Date(l.collectionDeadline).getTime();
    const minutesLeft = Math.round((deadlineTime - curTime) / 60000);

    if (l.quarantined || l.status === 'quarantined') {
      attentionItems.push({
        id: `safe-${l.id}`,
        type: 'safety',
        title: `Safety Hold: ${l.foodName}`,
        description: l.quarantineReason || 'Under quality investigation. Allocation blocked.',
        actionLabel: 'Review Safety Hold',
        onAction: () => setActiveTab('safety')
      });
    } else if (l.status === 'active' && minutesLeft > 0 && minutesLeft <= 45) {
      attentionItems.push({
        id: `dead-${l.id}`,
        type: 'deadline',
        title: `Urgent Pickup: ${l.foodName}`,
        description: `Only ${minutesLeft} minutes remaining before pickup deadline lapses.`,
        actionLabel: 'Find Suitable NGO',
        onAction: () => setActiveTab('matching')
      });
    }
  });

  // Helper for safety badge
  const getSafetyBadge = (listing: FoodListing) => {
    const curTime = new Date(currentSimulatedTime).getTime();
    const deadlineTime = new Date(listing.collectionDeadline).getTime();
    const minutesLeft = Math.round((deadlineTime - curTime) / 60000);

    if (listing.quarantined || listing.status === 'quarantined') {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <span>Safety Hold</span>
        </span>
      );
    }

    if (minutesLeft <= 45) {
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Urgent ({minutesLeft > 0 ? `${minutesLeft}m left` : 'Lapsed'})</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>Safe & Ready</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. Welcome Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Community Food Redistribution
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-surface-900 tracking-tight">
            Welcome to FoodBridge AI
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Help surplus food reach people who need it. Connect surplus meals from local donors to verified shelters and community kitchens quickly and safely.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenCreateListing}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>+ Donate Surplus Food</span>
          </button>
          <button
            onClick={onOpenRescueMission}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-semibold text-base shadow-sm transition active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Run Rescue Demo</span>
          </button>
        </div>
      </div>

      {/* 2. Exactly 4 Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Available Food */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-surface-600">Available Food</span>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-surface-900">
            {totalFoodAvailablePortions} <span className="text-base font-medium text-surface-500">portions</span>
          </div>
          <p className="text-sm text-surface-500 mt-2">Ready for immediate local pickup</p>
        </div>

        {/* Metric 2: Active Donations */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs hover:border-blue-300 transition">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-surface-600">Active Donations</span>
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-surface-900">
            {activeDonationsCount} <span className="text-base font-medium text-surface-500">batches</span>
          </div>
          <p className="text-sm text-surface-500 mt-2">Listed by registered donors</p>
        </div>

        {/* Metric 3: Active Deliveries */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs hover:border-amber-300 transition">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-surface-600">Active Deliveries</span>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-surface-900">
            {deliveriesInProgress} <span className="text-base font-medium text-surface-500">couriers</span>
          </div>
          <p className="text-sm text-surface-500 mt-2">En route to receiving shelters</p>
        </div>

        {/* Metric 4: Meals Delivered */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs hover:border-emerald-300 transition">
          <div className="flex items-center justify-between text-surface-500 mb-3">
            <span className="text-sm font-bold uppercase tracking-wider text-surface-600">Meals Delivered</span>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-surface-900">
            {mealsDeliveredCount} <span className="text-base font-medium text-surface-500">meals</span>
          </div>
          <p className="text-sm text-surface-500 mt-2">Safely served to families in need</p>
        </div>
      </div>

      {/* 3. Quick Actions Section */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-surface-900">Quick Actions</h2>
          <p className="text-base text-surface-500">Choose a primary action to get started immediately</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Donate Food */}
          <button
            onClick={onOpenCreateListing}
            className="p-5 rounded-2xl border border-surface-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Plus className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-surface-900 group-hover:text-emerald-800">
              Donate Food
            </div>
            <p className="text-sm text-surface-600 mt-1">
              Publish extra cooked or packaged food for nearby NGOs.
            </p>
          </button>

          {/* Action 2: Find an NGO */}
          <button
            onClick={() => setActiveTab('matching')}
            className="p-5 rounded-2xl border border-surface-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-surface-900 group-hover:text-emerald-800">
              Find an NGO
            </div>
            <p className="text-sm text-surface-600 mt-1">
              Match active donations to verified recipient shelters.
            </p>
          </button>

          {/* Action 3: Scan a Product */}
          <button
            onClick={() => setActiveTab('scanner')}
            className="p-5 rounded-2xl border border-surface-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-surface-900 group-hover:text-emerald-800">
              Scan a Product
            </div>
            <p className="text-sm text-surface-600 mt-1">
              Verify packaged items, allergens, and shelf-life safety.
            </p>
          </button>

          {/* Action 4: Track Delivery */}
          <button
            onClick={() => setActiveTab('deliveries')}
            className="p-5 rounded-2xl border border-surface-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition group shadow-2xs"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
              <Truck className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-surface-900 group-hover:text-emerald-800">
              Track Delivery
            </div>
            <p className="text-sm text-surface-600 mt-1">
              Check live status, QR verification, and courier handoffs.
            </p>
          </button>
        </div>
      </div>

      {/* 4. "Needs Attention" Section */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Needs Attention</span>
            </h2>
            <p className="text-base text-surface-500 mt-0.5">
              Urgent collection deadlines, delivery delays, and safety holds requiring review
            </p>
          </div>
        </div>

        {attentionItems.length === 0 ? (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-base text-emerald-900 flex items-center gap-3 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>All operations running smoothly. No urgent deadlines or safety delays currently.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {attentionItems.map(item => (
              <div
                key={item.id}
                className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-base ${
                  item.type === 'safety'
                    ? 'bg-rose-50/80 border-rose-200'
                    : item.type === 'failure'
                    ? 'bg-purple-50/80 border-purple-200'
                    : 'bg-amber-50/80 border-amber-200'
                }`}
              >
                <div>
                  <div className="font-bold text-lg text-surface-900">{item.title}</div>
                  <div className="text-surface-700 text-sm mt-1">{item.description}</div>
                </div>

                <button
                  onClick={item.onAction}
                  className={`px-5 py-2.5 rounded-xl font-bold text-base shrink-0 self-start md:self-auto transition ${
                    item.type === 'safety'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : item.type === 'failure'
                      ? 'bg-purple-700 hover:bg-purple-800 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. Short List of Recent Donations */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Recent Food Donations</h2>
            <p className="text-base text-surface-500 mt-0.5">Available surplus food items ready for matching</p>
          </div>
          <button
            onClick={() => setActiveTab('listings')}
            className="text-base font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
          >
            <span>View All Food</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-surface-100">
          {listings.slice(0, 4).map(item => {
            const donor = donors.find(d => d.id === item.donorId);
            const isQuarantined = item.quarantined || item.status === 'quarantined';

            return (
              <div
                key={item.id}
                className="p-5 hover:bg-surface-50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-lg font-bold text-surface-900">{item.foodName}</span>
                    {getSafetyBadge(item)}
                  </div>
                  <div className="text-sm text-surface-600 flex flex-wrap items-center gap-2">
                    <span>Donor: <strong className="text-surface-800">{donor?.name}</strong></span>
                    <span>•</span>
                    <span>Available: <strong className="text-surface-800">{item.remainingQuantity} {item.unit}</strong></span>
                    <span>•</span>
                    <span>Storage: <strong className="text-surface-800 capitalize">{item.storageRequirement.replace('_', ' ')}</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  {isQuarantined ? (
                    <button
                      onClick={() => setActiveTab('safety')}
                      className="px-5 py-2.5 rounded-xl bg-surface-100 hover:bg-surface-200 text-rose-800 font-bold text-base"
                    >
                      Inspect Safety Hold
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('matching')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xs transition"
                    >
                      Find Suitable NGO
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

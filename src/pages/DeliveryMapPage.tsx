import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Truck,
  Building,
  Navigation,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  Package
} from 'lucide-react';

export const DeliveryMapPage: React.FC = () => {
  const {
    donors,
    recipients,
    drivers,
    allocations,
    listings,
    setActiveTab,
    failoverDelivery
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'donors' | 'shelters' | 'drivers'>('all');
  const [selectedEntity, setSelectedEntity] = useState<any>(recipients[0]);
  const [sameRouteEnabled, setSameRouteEnabled] = useState(true);

  // Active in-transit deliveries
  const activeDeliveries = allocations.filter(
    a => a.status === 'in_transit' || a.status === 'pickup_assigned' || a.status === 'reassigned'
  );

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-emerald-600" />
            <span>Delivery Map</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            View nearby food donors, recipient shelters, and active courier routes on the map.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('deliveries')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition self-start md:self-auto"
          >
            <Truck className="w-5 h-5" />
            <span>Track Food Deliveries</span>
          </button>
        </div>
      </div>

      {/* 2. Map & Side-Drawer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Map Canvas & Route Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Map Filters Bar */}
          <div className="bg-white p-4 rounded-xl border border-surface-200 flex flex-wrap items-center justify-between gap-3 text-base">
            <div className="flex items-center gap-2 font-semibold text-surface-700">
              <span>Show on Map:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition ${
                  filterType === 'all'
                    ? 'bg-surface-900 text-white'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                All ({donors.length + recipients.length + drivers.length})
              </button>
              <button
                onClick={() => setFilterType('donors')}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition ${
                  filterType === 'donors'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                Donors ({donors.length})
              </button>
              <button
                onClick={() => setFilterType('shelters')}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition ${
                  filterType === 'shelters'
                    ? 'bg-blue-700 text-white'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                Shelters & NGOs ({recipients.length})
              </button>
              <button
                onClick={() => setFilterType('drivers')}
                className={`px-3 py-1.5 rounded-lg font-bold text-sm transition ${
                  filterType === 'drivers'
                    ? 'bg-amber-700 text-white'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                Couriers ({drivers.length})
              </button>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-emerald-800 text-sm bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <input
                type="checkbox"
                checked={sameRouteEnabled}
                onChange={e => setSameRouteEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>Same-Route Community Pooling</span>
            </label>
          </div>

          {/* Interactive Simulated Map Box */}
          <div className="relative bg-surface-100 rounded-2xl border-2 border-surface-200 h-[520px] overflow-hidden shadow-inner p-6 flex flex-col justify-between">
            {/* Map Grid Background pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#10b981 1.5px, transparent 1.5px), radial-gradient(#64748b 1px, #fafaf9 1px)`,
                backgroundSize: '40px 40px',
                backgroundPosition: '0 0, 20px 20px'
              }}
            />

            {/* City Transit Waterway & Arterial Roads representation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <path
                d="M -20,200 Q 250,150 450,300 T 900,280"
                fill="none"
                stroke="#0284c7"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M 50,-10 L 150,550"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="6"
              />
              <path
                d="M 380,-10 L 420,550"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="8"
              />
              <path
                d="M -10,120 L 800,140"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="7"
              />
              <path
                d="M -10,380 L 800,400"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="7"
              />

              {/* Active Delivery Route Lines */}
              {activeDeliveries.map((del, i) => (
                <path
                  key={del.id}
                  d={
                    i === 0
                      ? 'M 180,110 Q 300,200 480,260'
                      : 'M 350,90 Q 420,220 540,380'
                  }
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="6 6"
                  className="animate-pulse"
                />
              ))}
            </svg>

            {/* Floating Top Badge */}
            <div className="z-10 bg-white/95 backdrop-blur-xs px-4 py-2 rounded-xl border border-surface-200 shadow-sm flex items-center justify-between max-w-md">
              <div className="flex items-center gap-2 text-sm font-semibold text-surface-800">
                <Compass className="w-5 h-5 text-emerald-600 animate-spin" style={{ animationDuration: '8s' }} />
                <span>Live Metro Corridor: <strong>Central Hub & Waterfront Shelters</strong></span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                Active GPS
              </span>
            </div>

            {/* Simulated Entity Pins Placed on Map */}
            <div className="relative w-full h-full my-auto pointer-events-auto">
              {/* Donor Pin 1: Grand Amber Hotel */}
              {(filterType === 'all' || filterType === 'donors') && (
                <button
                  onClick={() => setSelectedEntity(donors[0])}
                  className="absolute top-[20%] left-[22%] -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  title="Grand Amber Hotel (Donor)"
                >
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition ring-4 ring-emerald-200">
                    <Building className="w-5 h-5" />
                  </div>
                  <div className="bg-white/95 text-surface-900 text-xs font-bold px-2 py-1 rounded-md shadow-xs mt-1 whitespace-nowrap border border-surface-200">
                    Grand Amber Hotel
                  </div>
                </button>
              )}

              {/* Donor Pin 2: Green Leaf Cafeteria */}
              {(filterType === 'all' || filterType === 'donors') && (
                <button
                  onClick={() => setSelectedEntity(donors[1])}
                  className="absolute top-[18%] left-[48%] -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  title="Green Leaf Cafeteria (Donor)"
                >
                  <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition ring-2 ring-emerald-300">
                    <Building className="w-4 h-4" />
                  </div>
                  <div className="bg-white/95 text-surface-900 text-xs font-bold px-2 py-1 rounded-md shadow-xs mt-1 whitespace-nowrap border border-surface-200">
                    Green Leaf Cafe
                  </div>
                </button>
              )}

              {/* Shelter Pin 1: Hope Harbor */}
              {(filterType === 'all' || filterType === 'shelters') && (
                <button
                  onClick={() => setSelectedEntity(recipients[0])}
                  className="absolute top-[52%] left-[60%] -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  title="Hope Harbor Family Shelter"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition ring-4 ring-blue-200">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="bg-white/95 text-surface-900 text-xs font-bold px-2 py-1 rounded-md shadow-xs mt-1 whitespace-nowrap border border-surface-200">
                    Hope Harbor Shelter
                  </div>
                </button>
              )}

              {/* Shelter Pin 2: Downtown Community Kitchen */}
              {(filterType === 'all' || filterType === 'shelters') && (
                <button
                  onClick={() => setSelectedEntity(recipients[1])}
                  className="absolute top-[75%] left-[68%] -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  title="Downtown Community Kitchen"
                >
                  <div className="w-9 h-9 rounded-2xl bg-blue-700 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition ring-2 ring-blue-300">
                    <Users className="w-4 h-4" />
                  </div>
                  <div className="bg-white/95 text-surface-900 text-xs font-bold px-2 py-1 rounded-md shadow-xs mt-1 whitespace-nowrap border border-surface-200">
                    Downtown Kitchen
                  </div>
                </button>
              )}

              {/* Driver Pin 1: Courier Marcus Brody */}
              {(filterType === 'all' || filterType === 'drivers') && (
                <button
                  onClick={() => setSelectedEntity(drivers[0])}
                  className="absolute top-[38%] left-[38%] -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none animate-bounce"
                  style={{ animationDuration: '2s' }}
                  title="Marcus Brody (Courier - On Mission)"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition ring-4 ring-amber-200">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="bg-white/95 text-surface-900 text-xs font-bold px-2 py-1 rounded-md shadow-xs mt-1 whitespace-nowrap border border-surface-200">
                    Courier: {drivers[0].name}
                  </div>
                </button>
              )}

              {/* Driver Pin 2: Standby Courier Alex Chen */}
              {(filterType === 'all' || filterType === 'drivers') && (
                <button
                  onClick={() => setSelectedEntity(drivers[1])}
                  className="absolute top-[65%] left-[25%] -translate-x-1/2 -translate-y-1/2 group z-20 focus:outline-none"
                  title="Alex Chen (Standby EV Courier)"
                >
                  <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition ring-2 ring-emerald-300">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="bg-white/95 text-surface-900 text-xs font-bold px-2 py-1 rounded-md shadow-xs mt-1 whitespace-nowrap border border-surface-200">
                    Standby: {drivers[1].name}
                  </div>
                </button>
              )}
            </div>

            {/* Map Legend */}
            <div className="z-10 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-surface-200 shadow-sm flex flex-wrap items-center gap-4 text-sm font-semibold text-surface-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>Food Donors</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-600" />
                <span>NGO Shelters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Couriers En Route</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 ml-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Radius Optimization: 4.8 km corridor</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Entity Inspector / Partner Details (4 cols) */}
        <div className="lg:col-span-4 bg-white p-7 rounded-2xl border border-surface-200 shadow-xs space-y-6">
          <div className="border-b border-surface-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-surface-400">
              Selected Location Pin
            </span>
            <h2 className="text-2xl font-extrabold text-surface-900 mt-1">
              {selectedEntity?.name || 'Grand Amber Hotel'}
            </h2>
            <div className="text-sm text-surface-500 mt-0.5">
              {selectedEntity?.location?.address || selectedEntity?.currentLocation?.address || 'Metro Downtown'}
            </div>
          </div>

          {/* Details based on entity type */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 space-y-2">
              <div className="flex justify-between text-base">
                <span className="text-surface-600">Trust Score:</span>
                <strong className="text-emerald-700 font-bold">{selectedEntity?.trustScore || 96} / 100</strong>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-surface-600">Contact Person:</span>
                <strong className="text-surface-900">{selectedEntity?.contactPerson || 'Coordinator On Duty'}</strong>
              </div>
              <div className="flex justify-between text-base">
                <span className="text-surface-600">Phone:</span>
                <strong className="text-surface-900 font-mono">{selectedEntity?.phone || '+1 (555) 019-4821'}</strong>
              </div>
              {selectedEntity?.capacityKg && (
                <div className="flex justify-between text-base">
                  <span className="text-surface-600">Storage Capacity:</span>
                  <strong className="text-surface-900">{selectedEntity.capacityKg} kg</strong>
                </div>
              )}
            </div>

            {/* Same-Route Community Delivery Highlight */}
            {sameRouteEnabled && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-base text-emerald-900">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  <span>Same-Route Pooling Available</span>
                </div>
                <p className="text-sm text-emerald-800 leading-snug">
                  Courier Alex Chen is travelling along this corridor. 2 additional donations can be batched with zero added carbon emissions.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('matching')}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition"
            >
              <span>Match Food To This Location</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

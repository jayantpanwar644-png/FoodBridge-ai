import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Package,
  HeartHandshake,
  ScanBarcode,
  MapPin,
  Truck,
  Star,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  ShieldAlert,
  History,
  Settings,
  BarChart3
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, role, incidents, listings } = useApp();
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

  const activeQuarantineCount = incidents.filter(i => i.status === 'quarantined').length;
  const criticalCount = listings.filter(l => {
    const diff = (new Date(l.collectionDeadline).getTime() - new Date().getTime()) / 60000;
    return l.status === 'active' && diff < 60 && diff > 0;
  }).length;

  // The 7 primary navigation sections specified in the UI/UX redesign
  const mainNavItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'listings',
      label: 'Food Donations',
      icon: Package,
      badge: criticalCount > 0 ? `${criticalCount} urgent` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'matching',
      label: 'AI Matching',
      icon: HeartHandshake,
      badge: null
    },
    {
      id: 'scanner',
      label: 'Product Scanner',
      icon: ScanBarcode,
      badge: 'New',
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'map',
      label: 'Delivery Map',
      icon: MapPin,
      badge: null
    },
    {
      id: 'deliveries',
      label: 'Track Food',
      icon: Truck,
      badge: null
    },
    {
      id: 'reviews',
      label: 'Food Reviews',
      icon: Star,
      badge: null
    }
  ];

  const secondaryTools = [
    { id: 'impact', label: 'Impact & Analytics', icon: BarChart3 },
    { id: 'prediction', label: 'AI Surplus Forecaster', icon: BrainCircuit },
    { id: 'safety', label: 'Safety & Quarantine', icon: ShieldAlert, badge: activeQuarantineCount > 0 ? `${activeQuarantineCount}` : null },
    { id: 'audit', label: 'Admin Audit Trail', icon: History },
    { id: 'settings', label: 'Settings & Rules', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white border-r border-surface-200 hidden md:flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Main 7 Navigation Items */}
      <div className="p-4">
        <div className="text-sm font-bold uppercase tracking-wider text-surface-400 px-3 py-2">
          Main Navigation
        </div>
        <nav className="space-y-1.5 mt-1">
          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs'
                    : 'text-surface-700 hover:bg-surface-100 hover:text-surface-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-emerald-600' : 'text-surface-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-sm px-2.5 py-0.5 rounded-full font-bold ${
                      item.badgeColor || 'bg-brand-100 text-brand-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Secondary Tools Collapsible (Keeps main nav ultra clean) */}
      <div className="p-4 mt-auto border-t border-surface-200">
        <button
          onClick={() => setMoreToolsOpen(!moreToolsOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold text-surface-600 hover:text-surface-900 rounded-xl hover:bg-surface-100 transition"
        >
          <span className="uppercase tracking-wider text-surface-500">More Tools & Logs</span>
          {moreToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {moreToolsOpen && (
          <div className="mt-2 space-y-1 pl-1">
            {secondaryTools.map(tool => {
              const Icon = tool.icon;
              const isActive = activeTab === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTab(tool.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-base font-medium transition ${
                    isActive
                      ? 'bg-surface-100 text-surface-900 font-bold'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-surface-500" />
                    <span>{tool.label}</span>
                  </div>
                  {tool.badge && (
                    <span className="text-sm bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                      {tool.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* User Account / Role Profile Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-surface-50 border border-surface-200">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold text-surface-500">Active Profile</span>
            <button
              onClick={() => setActiveTab('login')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
            >
              Switch
            </button>
          </div>
          <div className="font-extrabold text-base text-surface-900 mt-1 truncate">
            {role === 'donor' && 'Food Donor (Restaurant)'}
            {role === 'ngo' && 'NGO / Shelter Coordinator'}
            {role === 'driver' && 'Delivery Partner'}
            {role === 'shelter' && 'Recipient Shelter'}
            {role === 'admin' && 'Central Admin / Safety'}
          </div>
          <button
            onClick={() => setActiveTab('login')}
            className="mt-2.5 w-full py-1.5 px-3 rounded-lg bg-white border border-surface-200 hover:bg-surface-100 text-xs font-bold text-surface-700 text-center transition"
          >
            Manage User Details
          </button>
        </div>
      </div>
    </aside>
  );
};

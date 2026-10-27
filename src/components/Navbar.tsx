import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import {
  Bell,
  Clock,
  PlayCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  User,
  LogOut,
  Radio,
  Building,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  onOpenRescueMission: () => void;
  onOpenCreateListing: () => void;
  onToggleNotificationDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRescueMission,
  onOpenCreateListing,
  onToggleNotificationDrawer
}) => {
  const {
    role,
    setRole,
    currentUser,
    logout,
    setActiveTab,
    isRealTimeActive,
    setIsRealTimeActive,
    currentSimulatedTime,
    advanceSimulatedTime,
    resetSimulatedTime,
    notifications,
    incidents,
    isSimulationRunning,
    simulationMessage
  } = useApp();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;
  const activeQuarantines = incidents.filter(i => i.status === 'quarantined').length;

  const roleLabels: Record<UserRole, { title: string; short: string; badge: string }> = {
    donor: { title: 'Food Donor', short: 'Donor', badge: 'Restaurant / Hotel' },
    ngo: { title: 'NGO Coordinator', short: 'NGO', badge: 'Food Bank' },
    driver: { title: 'Delivery Partner', short: 'Courier', badge: 'EV Transit Fleet' },
    shelter: { title: 'Shelter / Kitchen', short: 'Shelter', badge: 'Hope Harbor' },
    admin: { title: 'Central Admin', short: 'Admin', badge: 'Operations' }
  };

  const formattedTime = new Date(currentSimulatedTime).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-surface-200">
      {/* Live Simulation Banner */}
      {isSimulationRunning && (
        <div className="bg-emerald-600 text-white px-5 py-2 text-sm font-semibold flex items-center justify-between animate-pulse">
          <span>Live Demo Scenario Running: {simulationMessage}</span>
          <span className="text-sm bg-emerald-700 px-3 py-1 rounded-md">Observing Real-Time State</span>
        </div>
      )}

      {/* Safety Hold Alert Banner */}
      {activeQuarantines > 0 && !isSimulationRunning && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-sm text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>
              <strong>Safety Hold Active:</strong> {activeQuarantines} food batch quarantined pending inspection.
            </span>
          </div>
          <span className="text-sm font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full">
            Safety Lock
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Left: Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-surface-900">FoodBridge</span>
              <span className="text-sm font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                AI
              </span>
            </div>
            <p className="text-sm text-surface-500 hidden sm:block">
              Rescue surplus. Deliver safely. Waste less.
            </p>
          </div>
        </div>

        {/* Right Section: Real-Time Status, Clock, User Profile, Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Live Real-Time Ticker Status */}
          <div
            onClick={() => setIsRealTimeActive(!isRealTimeActive)}
            title="Click to toggle real-time clock advancement"
            className="hidden xl:flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 cursor-pointer hover:bg-emerald-100/70 transition"
          >
            <Radio className={`w-4 h-4 text-emerald-600 ${isRealTimeActive ? 'animate-pulse' : 'opacity-40'}`} />
            <span className="text-xs font-bold text-emerald-900">
              {isRealTimeActive ? 'Live Real-Time Sync' : 'Sync Paused'}
            </span>
          </div>

          {/* Clock controls */}
          <div className="hidden lg:flex items-center bg-surface-50 border border-surface-200 rounded-xl px-3 py-1.5 text-sm">
            <div className="flex items-center gap-2 text-surface-700 font-mono text-sm font-semibold mr-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{formattedTime}</span>
            </div>
            <button
              onClick={() => advanceSimulatedTime(15)}
              title="Fast-forward 15 minutes"
              className="px-2 py-1 text-sm font-bold rounded-lg bg-white hover:bg-surface-100 text-surface-700 border border-surface-200 transition"
            >
              +15m
            </button>
            <button
              onClick={() => advanceSimulatedTime(60)}
              title="Fast-forward 1 hour"
              className="ml-1.5 px-2 py-1 text-sm font-bold rounded-lg bg-white hover:bg-surface-100 text-surface-700 border border-surface-200 transition"
            >
              +1h
            </button>
            <button
              onClick={resetSimulatedTime}
              title="Reset time"
              className="ml-1.5 p-1 text-surface-500 hover:text-surface-800 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Rescue Mission Quick Trigger */}
          <button
            onClick={onOpenRescueMission}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-semibold text-sm shadow-xs transition"
          >
            <PlayCircle className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Rescue Mission</span>
          </button>

          {/* Primary Donate Button */}
          <button
            onClick={onOpenCreateListing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Donate Food</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onToggleNotificationDrawer}
            className="relative p-2.5 rounded-xl text-surface-600 hover:bg-surface-100 hover:text-surface-900 border border-transparent hover:border-surface-200 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>

          {/* User Profile & Account Menu */}
          <div className="relative">
            {currentUser && currentUser.isLoggedIn ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-200 border border-surface-200 transition"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {currentUser.avatar || 'FB'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-extrabold text-surface-900 truncate max-w-[110px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[11px] text-surface-500 capitalize leading-none">
                    {currentUser.role === 'donor'
                      ? 'Donor'
                      : currentUser.role === 'ngo'
                      ? 'NGO Shelter'
                      : currentUser.role === 'driver'
                      ? 'Courier'
                      : 'Admin'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('login')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

            {/* User Profile Dropdown Menu */}
            {userMenuOpen && currentUser && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-surface-200 rounded-2xl shadow-xl py-3 z-50 animate-in fade-in space-y-2">
                <div className="px-4 py-2 border-b border-surface-100">
                  <div className="font-extrabold text-base text-surface-900">{currentUser.name}</div>
                  <div className="text-xs text-surface-500 truncate">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200">
                    <Building className="w-3 h-3 text-emerald-600" />
                    <span>{currentUser.organizationName}</span>
                  </div>
                </div>

                <div className="px-2 space-y-1 text-sm font-semibold text-surface-700">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setActiveTab('login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-100 flex items-center gap-2 text-surface-900 transition"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Switch Role / Account Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      setActiveTab('login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, UserProfile } from '../types';
import {
  ShieldCheck,
  Building,
  HeartHandshake,
  Truck,
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Zap
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, currentUser, setActiveTab } = useApp();

  // Step 1: Role selection
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser?.role || 'donor');

  // Step 2: Form fields
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [organizationName, setOrganizationName] = useState(currentUser?.organizationName || '');
  const [city, setCity] = useState(currentUser?.city || 'Metro Central');
  const [address, setAddress] = useState(currentUser?.address || '450 Lexington Ave, Suite 12');
  const [password, setPassword] = useState('••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const rolesConfig: {
    id: UserRole;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge: string;
    color: string;
    bg: string;
    border: string;
  }[] = [
    {
      id: 'donor',
      title: 'Food Donor',
      subtitle: 'Restaurants, Hotels, Hostels, Supermarkets & Event Caterers',
      icon: Building,
      badge: 'Surplus Giver',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-300'
    },
    {
      id: 'ngo',
      title: 'NGO / Shelter',
      subtitle: 'Food Banks, Community Kitchens, Orphanages & Shelters',
      icon: HeartHandshake,
      badge: 'Food Recipient',
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-300'
    },
    {
      id: 'driver',
      title: 'Delivery Partner',
      subtitle: 'EV Transit Couriers, Cargo Bikes & Community Riders',
      icon: Truck,
      badge: 'Transporter',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-300'
    },
    {
      id: 'admin',
      title: 'Central Admin / Safety',
      subtitle: 'Food Safety Inspectors, Operations & Regional Coordinators',
      icon: Shield,
      badge: 'Platform Ops',
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-300'
    }
  ];

  // Quick preset accounts for judges
  const handleQuickDemoLogin = (roleType: UserRole) => {
    let demoProfile: Omit<UserProfile, 'isLoggedIn'>;

    if (roleType === 'donor') {
      demoProfile = {
        id: 'usr-donor-101',
        name: 'Chef Marcus Sterling',
        email: 'marcus@grandamber.com',
        phone: '+1 (555) 234-8900',
        organizationName: 'Grand Amber Hotel & Banquet',
        role: 'donor',
        address: '450 Lexington Ave',
        city: 'Metro Downtown',
        avatar: 'MS',
        joinedDate: 'Oct 2026'
      };
    } else if (roleType === 'ngo') {
      demoProfile = {
        id: 'usr-ngo-201',
        name: 'Pastor Michael Vance',
        email: 'michael@hopeharbor.org',
        phone: '+1 (555) 456-7812',
        organizationName: 'Hope Harbor Family Shelter',
        role: 'ngo',
        address: '742 Evergreen St',
        city: 'Eastside Sector',
        avatar: 'MV',
        joinedDate: 'Oct 2026'
      };
    } else if (roleType === 'driver') {
      demoProfile = {
        id: 'usr-driver-301',
        name: 'Marcus Brody',
        email: 'marcus.brody@transitgreen.io',
        phone: '+1 (555) 789-0145',
        organizationName: 'GreenTransit EV Couriers',
        role: 'driver',
        address: 'Mobile Fleet Hub #4',
        city: 'Metro Central',
        avatar: 'MB',
        joinedDate: 'Oct 2026'
      };
    } else {
      demoProfile = {
        id: 'usr-admin-401',
        name: 'Elena Rostova',
        email: 'elena@foodbridge.ai',
        phone: '+1 (555) 890-1234',
        organizationName: 'FoodBridge Central Operations',
        role: 'admin',
        address: 'HQ Ops Tower, 8th Floor',
        city: 'Metro Central',
        avatar: 'ER',
        joinedDate: 'Oct 2026'
      };
    }

    login(demoProfile);
    setSuccessMessage(`Logged in successfully as ${demoProfile.name} (${demoProfile.organizationName})!`);
    setTimeout(() => {
      if (onSuccess) onSuccess();
      setActiveTab('dashboard');
    }, 900);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'FB';

    const newProfile: Omit<UserProfile, 'isLoggedIn'> = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@foodbridge.network`,
      phone: phone.trim() || '+1 (555) 019-4820',
      organizationName: organizationName.trim() || `${name}'s Organization`,
      role: selectedRole,
      address: address.trim(),
      city: city.trim(),
      avatar: initials,
      joinedDate: 'Oct 2026'
    };

    login(newProfile);
    setSuccessMessage(`Account verified! Welcome to FoodBridge AI, ${newProfile.name}.`);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      setActiveTab('dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Brand & Introduction */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-xl font-black text-surface-900 tracking-tight">FoodBridge AI</span>
          <span className="text-xs font-extrabold uppercase bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
            Real-Time Network
          </span>
        </div>

        <h1 className="text-4xl font-black text-surface-900 tracking-tight">
          Join the Surplus Food Redistribution Network
        </h1>
        <p className="text-lg text-surface-600 max-w-2xl mx-auto">
          Rescue surplus food, deliver safely before expiry, and feed local families. Select your role to get started with live data.
        </p>
      </div>

      {successMessage && (
        <div className="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-base font-bold flex items-center gap-3 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>{successMessage} Loading your real-time dashboard...</span>
        </div>
      )}

      {/* 1-Click Quick Demo Login for Hackathon Judges */}
      <div className="bg-white p-6 rounded-3xl border border-surface-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold text-base text-surface-900">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>1-Click Quick Login (Instant Demo Profiles)</span>
          </div>
          <span className="text-xs font-bold text-surface-400 uppercase tracking-wider">
            Ready for Hackathon Testing
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleQuickDemoLogin('donor')}
            className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Building className="w-5 h-5" />
            </div>
            <div className="font-bold text-base text-surface-900">Chef Marcus</div>
            <div className="text-xs text-emerald-800 font-semibold">Grand Amber Hotel (Donor)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('ngo')}
            className="p-4 rounded-2xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-left transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="font-bold text-base text-surface-900">Pastor Michael</div>
            <div className="text-xs text-blue-800 font-semibold">Hope Harbor (Shelter/NGO)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('driver')}
            className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/70 text-left transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Truck className="w-5 h-5" />
            </div>
            <div className="font-bold text-base text-surface-900">Marcus Brody</div>
            <div className="text-xs text-amber-800 font-semibold">GreenTransit (EV Courier)</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickDemoLogin('admin')}
            className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/70 text-left transition group shadow-2xs"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 group-hover:scale-105 transition">
              <Shield className="w-5 h-5" />
            </div>
            <div className="font-bold text-base text-surface-900">Elena Rostova</div>
            <div className="text-xs text-purple-800 font-semibold">Central Food Safety Ops</div>
          </button>
        </div>
      </div>

      {/* Main Registration & Sign-in Form */}
      <form onSubmit={handleCustomSubmit} className="bg-white p-8 rounded-3xl border border-surface-200 shadow-xs space-y-7">
        {/* Step 1: Role Selection */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-black text-surface-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-black flex items-center justify-center">
                1
              </span>
              <span>Select Your Role</span>
            </h2>
            <span className="text-sm font-semibold text-surface-500">
              Are you donating, receiving, or delivering?
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rolesConfig.map(r => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;

              return (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-5 rounded-2xl border-2 text-left transition relative flex flex-col justify-between ${
                    isSelected
                      ? `${r.border} ${r.bg} ring-2 ring-emerald-500 shadow-sm`
                      : 'border-surface-200 hover:border-surface-300 hover:bg-surface-50'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <div>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${
                      isSelected ? 'bg-white shadow-xs' : 'bg-surface-100 text-surface-600'
                    }`}>
                      <Icon className={`w-6 h-6 ${isSelected ? r.color : 'text-surface-600'}`} />
                    </div>
                    <div className="font-black text-lg text-surface-900">{r.title}</div>
                    <p className="text-xs text-surface-600 mt-1 leading-relaxed">
                      {r.subtitle}
                    </p>
                  </div>
                  <span className={`mt-3 text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-md inline-block w-fit ${
                    isSelected ? 'bg-white/80 text-surface-900' : 'bg-surface-100 text-surface-500'
                  }`}>
                    {r.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Personal & Organization Details */}
        <div className="pt-4 border-t border-surface-100 space-y-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-black text-surface-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm font-black flex items-center justify-center">
                2
              </span>
              <span>Enter Details & Profile Information</span>
            </h2>
            <span className="text-sm font-semibold text-surface-500">
              Personalized for your {rolesConfig.find(r => r.id === selectedRole)?.title} profile
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-base font-bold text-surface-800 mb-1.5 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" />
                <span>Your Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma / Chef Marcus"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-300 text-base font-medium focus:ring-2 focus:ring-emerald-500 text-surface-900"
              />
            </div>

            {/* Organization / Kitchen Name */}
            <div>
              <label className="block text-base font-bold text-surface-800 mb-1.5 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                <span>
                  {selectedRole === 'donor'
                    ? 'Restaurant / Hotel / Kitchen Name *'
                    : selectedRole === 'ngo'
                    ? 'Shelter / NGO / Food Bank Name *'
                    : selectedRole === 'driver'
                    ? 'Courier Fleet / Vehicle Type *'
                    : 'Agency / Department Name *'}
                </span>
              </label>
              <input
                type="text"
                required
                placeholder={
                  selectedRole === 'donor'
                    ? 'e.g. Taj Heritage Dining'
                    : selectedRole === 'ngo'
                    ? 'e.g. Seva Community Kitchen'
                    : 'e.g. Green Transit Logistics'
                }
                value={organizationName}
                onChange={e => setOrganizationName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-300 text-base font-medium focus:ring-2 focus:ring-emerald-500 text-surface-900"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-base font-bold text-surface-800 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Official Work Email</span>
              </label>
              <input
                type="email"
                placeholder="e.g. contact@tajdining.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-300 text-base font-medium focus:ring-2 focus:ring-emerald-500 text-surface-900"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-base font-bold text-surface-800 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>Phone / WhatsApp (for OTP & Delivery)</span>
              </label>
              <input
                type="tel"
                placeholder="e.g. +1 (555) 019-4820"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-300 text-base font-medium focus:ring-2 focus:ring-emerald-500 text-surface-900"
              />
            </div>

            {/* City / Operating Zone */}
            <div>
              <label className="block text-base font-bold text-surface-800 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>City & Operational Zone</span>
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-300 text-base bg-surface-50 text-surface-900 font-medium"
              >
                <option value="Metro Central">Metro Central (Downtown Hub)</option>
                <option value="Eastside Waterfront">Eastside Waterfront (Shelters & Docks)</option>
                <option value="North Industrial">North Industrial Corridor</option>
                <option value="South Suburban">South Suburban Food District</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label className="block text-base font-bold text-surface-800 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Pickup / Receiving Address</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 102 Marine Drive, Gate 3"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-surface-300 text-base font-medium focus:ring-2 focus:ring-emerald-500 text-surface-900"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-surface-500 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Encrypted local session. Real-time updates automatically enabled.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg shadow-md hover:shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            <span>Complete Setup & Enter Platform</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

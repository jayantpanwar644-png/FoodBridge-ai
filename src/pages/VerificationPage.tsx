import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Scan,
  Smartphone,
  ShieldCheck,
  Package,
  Truck,
  Building,
  Key,
  Info
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const {
    allocations,
    listings,
    recipients,
    drivers,
    donors,
    verifyPickup,
    verifyDropoff
  } = useApp();

  const [activeTabMode, setActiveTabMode] = useState<'pickup' | 'dropoff'>('pickup');
  const [selectedAllocId, setSelectedAllocId] = useState<string>(allocations[0]?.id || 'alloc-201');
  const [inputToken, setInputToken] = useState<string>('');
  const [receivedQuantity, setReceivedQuantity] = useState<number>(40);
  const [handoffNotes, setHandoffNotes] = useState<string>('Temperature checked: 67°C. Containers sealed.');

  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isScannerSimulating, setIsScannerSimulating] = useState(false);

  const currentAlloc = allocations.find(a => a.id === selectedAllocId) || allocations[0];
  const listing = listings.find(l => l.id === currentAlloc?.listingId);
  const recipient = recipients.find(r => r.id === currentAlloc?.recipientId);
  const driver = drivers.find(d => d.id === currentAlloc?.deliveryPartnerId);
  const donor = donors.find(d => d.id === listing?.donorId);

  const activeToken = activeTabMode === 'pickup' ? currentAlloc?.pickupToken : currentAlloc?.dropoffToken;

  const handleSimulateScan = () => {
    setIsScannerSimulating(true);
    setTimeout(() => {
      setIsScannerSimulating(false);
      setInputToken(activeToken || '');
    }, 900);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlloc) return;

    if (activeTabMode === 'pickup') {
      const res = verifyPickup(currentAlloc.id, inputToken, handoffNotes);
      setScanResult(res);
    } else {
      const res = verifyDropoff(currentAlloc.id, inputToken, receivedQuantity, handoffNotes);
      setScanResult(res);
    }
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-600" />
            <span>Two-Stage QR & OTP Handoff Verification Suite</span>
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Cryptographic custody transfer ensuring strict chain-of-custody from donor kitchen to recipient dining line.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full border border-brand-200 self-start md:self-auto">
          Simulated Hardware Scanner
        </span>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-surface-200 gap-4">
        <button
          onClick={() => {
            setActiveTabMode('pickup');
            setInputToken('');
            setScanResult(null);
          }}
          className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
            activeTabMode === 'pickup'
              ? 'border-brand-600 text-brand-900'
              : 'border-transparent text-surface-400 hover:text-surface-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stage 1: Pickup Verification (Donor → Courier)</span>
        </button>

        <button
          onClick={() => {
            setActiveTabMode('dropoff');
            setInputToken('');
            setScanResult(null);
          }}
          className={`pb-3 font-bold text-xs flex items-center gap-2 border-b-2 transition ${
            activeTabMode === 'dropoff'
              ? 'border-brand-600 text-brand-900'
              : 'border-transparent text-surface-400 hover:text-surface-600'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Stage 2: Drop-Off Verification (Courier → Recipient)</span>
        </button>
      </div>

      {/* Task Selector */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 flex items-center gap-3 overflow-x-auto">
        <span className="font-semibold text-surface-500 shrink-0">Select Target Task:</span>
        {allocations.map(a => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedAllocId(a.id);
              setInputToken('');
              setScanResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg border font-mono font-bold transition shrink-0 ${
              selectedAllocId === a.id
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100'
            }`}
          >
            {a.id} ({a.status.replace('_', ' ')})
          </button>
        ))}
      </div>

      {/* Main Grid: Left Scanner Simulator, Right QR Token Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Simulated Camera / OTP Scanner (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-surface-100 pb-3">
            <h2 className="font-bold text-sm text-surface-900 flex items-center gap-2">
              <Scan className="w-4 h-4 text-brand-600" />
              <span>Simulated QR Camera & OTP Scanner</span>
            </h2>
            <span className="text-[10px] text-surface-400">Optical & Manual Fallback</span>
          </div>

          {/* Scanner Viewfinder Box */}
          <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
            {isScannerSimulating ? (
              <div className="text-center text-white space-y-2">
                <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin mx-auto" />
                <div className="text-xs font-bold font-mono">ALIGNING QR BARCODE...</div>
              </div>
            ) : (
              <div className="text-center text-slate-400 space-y-2">
                <div className="w-24 h-24 border-2 border-dashed border-emerald-500/60 rounded-xl flex items-center justify-center mx-auto">
                  <Scan className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="text-[11px]">Ready to scan optical token</div>
              </div>
            )}

            {/* Quick autofill scan button */}
            <div className="absolute bottom-3 right-3">
              <button
                type="button"
                onClick={handleSimulateScan}
                disabled={isScannerSimulating}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition"
              >
                Simulate Camera Scan
              </button>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <div className="flex justify-between font-semibold text-surface-700 mb-1">
                <span>Input Token / OTP Code *</span>
                <button
                  type="button"
                  onClick={() => setInputToken(activeToken || '')}
                  className="text-brand-700 hover:underline font-bold text-[11px]"
                >
                  Insert Demo Token ({activeToken})
                </button>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-surface-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={inputToken}
                  onChange={e => setInputToken(e.target.value.toUpperCase())}
                  placeholder={activeTabMode === 'pickup' ? 'e.g. PKUP-101-782' : 'e.g. DROP-101-943'}
                  className="w-full pl-9 pr-3 py-2 border border-surface-300 rounded-lg font-mono text-sm tracking-wider uppercase font-bold text-surface-900"
                />
              </div>
            </div>

            {activeTabMode === 'dropoff' && (
              <div>
                <label className="block font-semibold text-surface-700 mb-1">
                  Verified Delivered Quantity ({currentAlloc?.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={receivedQuantity}
                  onChange={e => setReceivedQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg font-bold"
                />
              </div>
            )}

            <div>
              <label className="block font-semibold text-surface-700 mb-1">
                Inspection & Custody Notes
              </label>
              <input
                type="text"
                value={handoffNotes}
                onChange={e => setHandoffNotes(e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-sm transition active:scale-95"
            >
              Confirm & Execute Handoff
            </button>
          </form>

          {/* Verification Result Feedback */}
          {scanResult && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                scanResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium'
                  : 'bg-rose-50 border-rose-200 text-rose-950 font-medium'
              }`}
            >
              {scanResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-bold">{scanResult.success ? 'Verified Successfully!' : 'Verification Failed'}</div>
                <div className="text-[11px] mt-0.5 leading-relaxed">{scanResult.message}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scannable QR Token Display (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs text-center space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-surface-400">
              Scannable Security Pass
            </div>
            <h3 className="font-bold text-sm text-surface-900">
              {activeTabMode === 'pickup' ? 'Donor Pickup Token' : 'Recipient Drop-Off Token'}
            </h3>

            {/* Simulated Scannable QR Card */}
            <div className="w-44 h-44 mx-auto p-3 bg-white rounded-2xl border-2 border-surface-900 shadow-md flex items-center justify-center relative">
              <QrCode className="w-36 h-36 text-surface-900" />
            </div>

            <div className="font-mono text-base font-black tracking-widest text-brand-800 bg-brand-50 py-1.5 px-4 rounded-xl border border-brand-200 inline-block">
              {activeToken}
            </div>

            <p className="text-[11px] text-surface-500 leading-relaxed max-w-xs mx-auto">
              Present this token to the courier upon arrival. Token is one-time-use only; subsequent attempts will be rejected.
            </p>

            {/* Task verification status */}
            <div className="pt-3 border-t border-surface-100 text-left space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-surface-500">Food Item:</span>
                <strong className="text-surface-900">{listing?.foodName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Assigned Courier:</span>
                <strong className="text-surface-900">{driver?.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Pickup Status:</span>
                <span className={`font-bold ${currentAlloc?.pickupVerifiedAt ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {currentAlloc?.pickupVerifiedAt ? 'Verified' : 'Pending Handoff'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Drop-off Status:</span>
                <span className={`font-bold ${currentAlloc?.dropoffVerifiedAt ? 'text-emerald-600' : 'text-surface-400'}`}>
                  {currentAlloc?.dropoffVerifiedAt ? 'Delivered' : 'Awaiting Delivery'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

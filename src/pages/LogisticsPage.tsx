import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Allocation, AllocationStatus } from '../types';
import {
  Truck,
  Check,
  AlertTriangle,
  RotateCw,
  QrCode,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const LogisticsPage: React.FC = () => {
  const {
    allocations,
    listings,
    recipients,
    drivers,
    donors,
    failoverDelivery,
    verifyPickup,
    verifyDropoff
  } = useApp();

  const [selectedAllocId, setSelectedAllocId] = useState<string>(
    allocations[0]?.id || 'alloc-201'
  );

  // Modals for actions
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showDropoffModal, setShowDropoffModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [problemReason, setProblemReason] = useState('Courier vehicle tire puncture on 34th St. Cannot complete run.');

  // Token inputs for verification
  const [tokenInput, setTokenInput] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');

  const currentAlloc = allocations.find(a => a.id === selectedAllocId) || allocations[0];
  const listing = listings.find(l => l.id === currentAlloc?.listingId);
  const recipient = recipients.find(r => r.id === currentAlloc?.recipientId);
  const driver = drivers.find(d => d.id === currentAlloc?.deliveryPartnerId);
  const donor = donors.find(d => d.id === listing?.donorId);

  // 5-step visual tracker:
  // Matched → Pickup Assigned → Picked Up → In Transit → Delivered
  const progressSteps: { key: string; label: string }[] = [
    { key: 'matched', label: 'Matched' },
    { key: 'pickup_assigned', label: 'Pickup Assigned' },
    { key: 'picked_up', label: 'Picked Up' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const getStepIndex = (status: AllocationStatus) => {
    switch (status) {
      case 'proposed':
      case 'accepted':
        return 0; // Matched
      case 'pickup_assigned':
      case 'reassigned':
        return 1; // Pickup Assigned
      case 'in_transit':
        return 3; // In Transit
      case 'delivered':
        return 4; // Delivered
      default:
        return 0;
    }
  };

  const currentStepIndex = currentAlloc ? getStepIndex(currentAlloc.status) : 0;
  const isFailed = currentAlloc?.status === 'pickup_failed';
  const isQuarantined = currentAlloc?.status === 'quarantined';

  // Next required action prompt
  const getNextAction = () => {
    if (!currentAlloc) return '';
    if (isFailed) return 'Courier reported exception. Click "Find Replacement Partner" to dispatch standby courier.';
    if (isQuarantined) return 'Delivery paused under safety hold pending investigation.';
    if (currentAlloc.status === 'accepted') return 'Assign a courier partner to pick up the food.';
    if (currentAlloc.status === 'pickup_assigned' || currentAlloc.status === 'reassigned') {
      return `Courier ${driver?.name || 'Partner'} must confirm pickup using donor QR code.`;
    }
    if (currentAlloc.status === 'in_transit') {
      return `Food is en route to ${recipient?.name}. Recipient receiving desk must confirm drop-off upon arrival.`;
    }
    if (currentAlloc.status === 'delivered') {
      return 'Delivery completed and verified. Meals received by shelter.';
    }
    return '';
  };

  const handleConfirmPickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlloc) return;
    const res = verifyPickup(currentAlloc.id, tokenInput || currentAlloc.pickupToken);
    setVerifyMessage(res.message);
    if (res.success) {
      setTimeout(() => {
        setShowPickupModal(false);
        setVerifyMessage('');
      }, 1400);
    }
  };

  const handleConfirmDropoffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlloc) return;
    const res = verifyDropoff(
      currentAlloc.id,
      tokenInput || currentAlloc.dropoffToken,
      currentAlloc.quantityAllocated
    );
    setVerifyMessage(res.message);
    if (res.success) {
      setTimeout(() => {
        setShowDropoffModal(false);
        setVerifyMessage('');
      }, 1400);
    }
  };

  const handleReportProblemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAlloc) return;
    failoverDelivery(currentAlloc.id, problemReason);
    setShowProblemModal(false);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <Truck className="w-8 h-8 text-emerald-600" />
            <span>Track Food Deliveries</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Track courier pickup, transit progress, and verified shelter handoffs in real time.
          </p>
        </div>
      </div>

      {/* Task Selector Pills */}
      <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex items-center gap-3 overflow-x-auto">
        <span className="font-bold text-base text-surface-700 shrink-0">Select Delivery Run:</span>
        {allocations.map(a => (
          <button
            key={a.id}
            onClick={() => {
              setSelectedAllocId(a.id);
              setVerifyMessage('');
            }}
            className={`px-4 py-2 rounded-xl border text-base font-bold transition shrink-0 ${
              selectedAllocId === a.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-surface-50 border-surface-200 text-surface-700 hover:bg-surface-100'
            }`}
          >
            {a.id} ({a.status.replace('_', ' ')})
          </button>
        ))}
      </div>

      {/* Main Delivery Tracker Card */}
      {currentAlloc && (
        <div className="bg-white rounded-2xl border border-surface-200 p-7 shadow-xs space-y-7">
          {/* Top Info Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-surface-100">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-surface-900">
                  {currentAlloc.quantityAllocated} {currentAlloc.unit} of {listing?.foodName}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-extrabold uppercase ${
                    currentAlloc.status === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : currentAlloc.status === 'pickup_failed'
                      ? 'bg-rose-100 text-rose-800 animate-pulse'
                      : currentAlloc.status === 'reassigned'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentAlloc.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-base text-surface-600 mt-1.5 flex flex-wrap items-center gap-3">
                <span>From: <strong className="text-surface-800">{donor?.name}</strong></span>
                <span>•</span>
                <span>To: <strong className="text-surface-800">{recipient?.name}</strong></span>
                <span>•</span>
                <span>Assigned Courier: <strong className="text-surface-800">{driver?.name || 'Pending assignment'}</strong></span>
              </div>
            </div>

            {/* Collection Deadline */}
            <div className="bg-surface-50 px-5 py-3 rounded-xl border border-surface-200 text-left sm:text-right shrink-0">
              <div className="text-xs text-surface-500 font-bold uppercase">Collection Deadline</div>
              <div className="text-base font-extrabold text-surface-900 mt-0.5 flex items-center sm:justify-end gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>{new Date(listing?.collectionDeadline || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Tracker: Matched → Pickup Assigned → Picked Up → In Transit → Delivered */}
          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 relative text-center">
              {progressSteps.map((step, idx) => {
                const isPast = currentStepIndex > idx || currentAlloc.status === 'delivered';
                const isCurrent = currentStepIndex === idx && currentAlloc.status !== 'delivered';

                return (
                  <div key={step.key} className="space-y-2.5">
                    <div className="relative flex items-center justify-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold transition ${
                          isPast
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : isCurrent
                            ? 'bg-emerald-100 border-2 border-emerald-600 text-emerald-900 animate-pulse'
                            : 'bg-surface-100 text-surface-400 border border-surface-200'
                        }`}
                      >
                        {isPast ? <Check className="w-5 h-5" /> : idx + 1}
                      </div>
                    </div>
                    <div
                      className={`text-sm font-bold leading-tight ${
                        isCurrent || isPast ? 'text-surface-900' : 'text-surface-400'
                      }`}
                    >
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Next Required Action Box */}
          <div className="p-5 rounded-2xl bg-surface-50 border border-surface-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-surface-500">Next Action Required</div>
              <div className="font-bold text-surface-900 mt-1 text-base">{getNextAction()}</div>
            </div>

            {/* Simple Primary Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {isFailed ? (
                <button
                  onClick={() => failoverDelivery(currentAlloc.id, 'Dispatched standby replacement courier.')}
                  className="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-base flex items-center gap-2 shadow-sm transition"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Find Replacement Partner</span>
                </button>
              ) : currentAlloc.status === 'in_transit' ? (
                <>
                  <button
                    onClick={() => {
                      setTokenInput(currentAlloc.dropoffToken);
                      setShowDropoffModal(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition active:scale-95"
                  >
                    Confirm Delivery
                  </button>
                  <button
                    onClick={() => setShowProblemModal(true)}
                    className="px-4 py-2.5 rounded-xl border border-surface-300 text-surface-700 hover:bg-surface-100 font-bold text-base"
                  >
                    Report Exception
                  </button>
                </>
              ) : currentAlloc.status === 'delivered' ? (
                <span className="text-emerald-800 font-extrabold bg-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2 text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Delivery Complete</span>
                </span>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setTokenInput(currentAlloc.pickupToken);
                      setShowPickupModal(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm transition active:scale-95"
                  >
                    Confirm Pickup
                  </button>
                  <button
                    onClick={() => setShowProblemModal(true)}
                    className="px-4 py-2.5 rounded-xl border border-surface-300 text-surface-700 hover:bg-surface-100 font-bold text-base"
                  >
                    Report Exception
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Delivery Timeline / Activity History */}
          <div className="pt-2">
            <h3 className="font-extrabold text-base text-surface-900 mb-3">Delivery Activity History</h3>
            <div className="space-y-2">
              {currentAlloc.timeline.map((ev, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-surface-50 border border-surface-200 flex items-start gap-3 text-sm">
                  <Clock className="w-4 h-4 text-surface-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-surface-900 capitalize mr-2">
                      {ev.status.replace('_', ' ')}:
                    </span>
                    <span className="text-surface-700">{ev.note}</span>
                  </div>
                  <span className="text-xs text-surface-500 shrink-0 font-medium">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Pickup */}
      {showPickupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setShowPickupModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-surface-200 max-w-md w-full p-6 z-10 space-y-4">
            <h3 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
              <QrCode className="w-6 h-6 text-emerald-600" />
              <span>Confirm Food Pickup</span>
            </h3>
            <p className="text-surface-600 text-base">
              Enter or scan the pickup token provided by the food donor to verify collection.
            </p>

            <form onSubmit={handleConfirmPickupSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-surface-800 mb-1">Pickup Verification Token</label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl font-mono font-bold text-base text-center"
                />
              </div>

              {verifyMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-sm font-bold">
                  {verifyMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPickupModal(false)}
                  className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Verify Pickup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Drop-off */}
      {showDropoffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setShowDropoffModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-surface-200 max-w-md w-full p-6 z-10 space-y-4">
            <h3 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Confirm Food Drop-Off</span>
            </h3>
            <p className="text-surface-600 text-base">
              Enter the recipient shelter verification token to complete this donation run.
            </p>

            <form onSubmit={handleConfirmDropoffSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-surface-800 mb-1">Drop-off Verification Token</label>
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={e => setTokenInput(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl font-mono font-bold text-base text-center"
                />
              </div>

              {verifyMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-sm font-bold">
                  {verifyMessage}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDropoffModal(false)}
                  className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Verify Drop-off
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Report a Problem */}
      {showProblemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setShowProblemModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-surface-200 max-w-md w-full p-6 z-10 space-y-4">
            <h3 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <span>Report Delivery Exception</span>
            </h3>
            <p className="text-surface-600 text-base">
              Reporting an issue alerts operations and triggers an immediate carrier failover.
            </p>

            <form onSubmit={handleReportProblemSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-surface-800 mb-1">Describe Exception</label>
                <textarea
                  rows={3}
                  required
                  value={problemReason}
                  onChange={e => setProblemReason(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProblemModal(false)}
                  className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Request Standby Backup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

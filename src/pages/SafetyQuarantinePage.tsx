import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SafetyIncident } from '../types';
import {
  ShieldAlert,
  ShieldCheck,
  FileText,
  Lock,
  PlusCircle
} from 'lucide-react';

export const SafetyQuarantinePage: React.FC = () => {
  const {
    incidents,
    listings,
    reportIncident,
    resolveIncident
  } = useApp();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string>(listings[0]?.id || 'list-101');
  const [incidentCategory, setIncidentCategory] = useState<
    'suspected_spoilage' | 'damaged_packaging' | 'temperature_abuse' | 'allergen_mismatch' | 'wrong_quantity'
  >('temperature_abuse');
  const [description, setDescription] = useState(
    'Digital probe indicated core soup temperature was 48°C upon courier arrival (minimum regulatory threshold is 60°C).'
  );
  const [severity, setSeverity] = useState<'critical' | 'major' | 'minor'>('critical');

  // Resolution modal
  const [selectedIncidentForResolve, setSelectedIncidentForResolve] = useState<SafetyIncident | null>(null);
  const [resolutionDecision, setResolutionDecision] = useState<'resolved_cleared' | 'resolved_penalized'>('resolved_penalized');
  const [resolutionNotes, setResolutionNotes] = useState(
    'Temperature violation confirmed via secondary digital log. Batch discarded and donor penalized 8 trust points.'
  );

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reportIncident({
      listingId: selectedListingId,
      reporterId: 'rec-1',
      reporterRole: 'shelter',
      reporterName: 'Pastor Michael (Hope Harbor)',
      incidentCategory,
      description,
      severity
    });
    setIsReportModalOpen(false);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForResolve) return;
    resolveIncident(selectedIncidentForResolve.id, resolutionDecision, resolutionNotes);
    setSelectedIncidentForResolve(null);
  };

  const quarantinedIncidents = incidents.filter(i => i.status === 'quarantined');
  const resolvedIncidents = incidents.filter(i => i.status !== 'quarantined');

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-rose-600" />
            <span>Safety & Quarantine Vault</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Strict safety circuit-breaker: Reports trigger immediate inventory quarantine and freeze downstream allocations to protect recipients.
          </p>
        </div>
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-sm transition self-start md:self-auto"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report Safety Concern</span>
        </button>
      </div>

      {/* Active Quarantined Inventory Vault */}
      <div className="bg-rose-50/60 border border-rose-300 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-950 font-extrabold text-xl">
            <Lock className="w-5 h-5 text-rose-600" />
            <span>Active Quarantined Batches Under Investigation ({quarantinedIncidents.length})</span>
          </div>
          <span className="text-sm font-extrabold uppercase bg-rose-100 text-rose-800 px-3 py-1 rounded-full border border-rose-300">
            Hard Safety Lock
          </span>
        </div>

        {quarantinedIncidents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-surface-500 text-base">
            No batches currently under quarantine hold. All platform listings meet food-safety compliance.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {quarantinedIncidents.map(inc => {
              const listing = listings.find(l => l.id === inc.listingId);

              return (
                <div
                  key={inc.id}
                  className="bg-white rounded-2xl border border-rose-300 p-6 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm text-surface-400 font-bold uppercase">{inc.id}</span>
                      <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-rose-100 text-rose-800 uppercase border border-rose-200">
                        {inc.severity} Severity
                      </span>
                    </div>

                    <h3 className="font-extrabold text-xl text-surface-900 leading-snug">
                      {listing?.foodName || `Batch ${inc.listingId}`}
                    </h3>

                    <div className="text-sm text-surface-600 mt-1">
                      Concern: <strong className="capitalize">{inc.incidentCategory.replace('_', ' ')}</strong>
                    </div>

                    <div className="mt-3 p-3.5 rounded-xl bg-surface-50 border border-surface-200 text-surface-800 text-base leading-relaxed">
                      "{inc.description}"
                    </div>

                    <div className="text-sm text-surface-500 mt-2">
                      Reported by <strong>{inc.reporterName}</strong> at {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-surface-200 flex items-center justify-between">
                    <span className="text-sm text-rose-700 font-bold flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-rose-600" />
                      <span>Blocked from Matching</span>
                    </span>

                    <button
                      onClick={() => setSelectedIncidentForResolve(inc)}
                      className="px-5 py-2.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-bold text-base transition"
                    >
                      Admin Review
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Safety Audit History */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 shadow-xs space-y-5">
        <h2 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-surface-600" />
          <span>Resolved Safety Tickets & Trust Accountability History</span>
        </h2>

        <div className="divide-y divide-surface-100">
          {resolvedIncidents.map(inc => (
            <div key={inc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-base">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-surface-500 font-bold text-sm">{inc.id}</span>
                  <span className="font-bold text-surface-900">{inc.incidentCategory.replace('_', ' ')}</span>
                  <span
                    className={`px-3 py-0.5 rounded-full text-xs font-bold ${
                      inc.status === 'resolved_cleared'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.status === 'resolved_cleared' ? 'Cleared (Safe)' : 'Penalized (Violation)'}
                  </span>
                </div>
                <div className="text-sm text-surface-600 mt-1">{inc.resolutionNotes}</div>
              </div>
              <div className="text-sm text-surface-500 shrink-0">
                Resolved by <strong>{inc.resolvedBy || 'Operations Lead'}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Report Incident */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setIsReportModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-200 max-w-lg w-full p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-surface-100">
              <h2 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
                <span>Submit Safety Concern</span>
              </h2>
              <button onClick={() => setIsReportModalOpen(false)} className="text-surface-400 hover:text-surface-700 text-xl font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="mt-4 space-y-4 text-base">
              <div>
                <label className="block font-semibold text-surface-800 mb-1.5">Target Food Batch</label>
                <select
                  value={selectedListingId}
                  onChange={e => setSelectedListingId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-base"
                >
                  {listings.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.foodName} ({l.remainingQuantity} {l.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-surface-800 mb-1.5">Category</label>
                  <select
                    value={incidentCategory}
                    onChange={e => setIncidentCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-base"
                  >
                    <option value="temperature_abuse">Temperature Violation</option>
                    <option value="suspected_spoilage">Suspected Spoilage</option>
                    <option value="damaged_packaging">Damaged Packaging</option>
                    <option value="allergen_mismatch">Allergen Mismatch</option>
                    <option value="wrong_quantity">Incorrect Quantity</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-surface-800 mb-1.5">Severity</label>
                  <select
                    value={severity}
                    onChange={e => setSeverity(e.target.value as any)}
                    className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-base"
                  >
                    <option value="critical">Critical (Immediate Hold)</option>
                    <option value="major">Major Concern</option>
                    <option value="minor">Minor Discrepancy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-surface-800 mb-1.5">Description & Observations</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                />
              </div>

              <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Submit & Quarantine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Resolution */}
      {selectedIncidentForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setSelectedIncidentForResolve(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-200 max-w-lg w-full p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-surface-100">
              <h2 className="font-extrabold text-xl text-surface-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span>Admin Safety Determination: {selectedIncidentForResolve.id}</span>
              </h2>
              <button onClick={() => setSelectedIncidentForResolve(null)} className="text-surface-400 hover:text-surface-700 text-xl font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-4 text-base">
              <div>
                <label className="block font-semibold text-surface-800 mb-1.5">Investigation Determination</label>
                <select
                  value={resolutionDecision}
                  onChange={e => setResolutionDecision(e.target.value as any)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 font-bold"
                >
                  <option value="resolved_penalized">Confirm Violation & Deduct Trust Score (-8 pts)</option>
                  <option value="resolved_cleared">Clear Batch & Lift Quarantine (Verified Safe)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-surface-800 mb-1.5">Documented Reason</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={e => setResolutionNotes(e.target.value)}
                  className="w-full px-4 py-2.5 border border-surface-300 rounded-xl text-base"
                />
              </div>

              <div className="pt-4 border-t border-surface-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForResolve(null)}
                  className="px-5 py-2.5 border border-surface-200 rounded-xl text-surface-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm"
                >
                  Commit Determination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

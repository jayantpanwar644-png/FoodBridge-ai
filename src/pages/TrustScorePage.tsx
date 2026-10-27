import React from 'react';
import { useApp } from '../context/AppContext';
import { Award, TrendingUp, TrendingDown, ShieldCheck, CheckCircle2, History } from 'lucide-react';

export const TrustScorePage: React.FC = () => {
  const { donors, recipients, drivers, trustEvents } = useApp();

  return (
    <div className="space-y-6 text-xs">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
        <h1 className="text-xl font-bold text-surface-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-brand-600" />
          <span>Partner Trust & Reliability Matrix</span>
        </h1>
        <p className="text-xs text-surface-500 mt-0.5">
          Algorithmic accountability: Trust scores increase upon verified on-time handoffs and decrease only upon confirmed safety or policy non-conformance.
        </p>
      </div>

      {/* Trust Score Leaderboards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Donors */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-3">
          <div className="font-bold text-sm text-surface-900 flex items-center justify-between border-b border-surface-100 pb-2">
            <span>Food Donors</span>
            <span className="text-[10px] text-surface-400">Score / 100</span>
          </div>
          <div className="space-y-2">
            {donors.map(d => (
              <div key={d.id} className="p-2.5 rounded-xl bg-surface-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-surface-900">{d.name}</div>
                  <div className="text-[10px] text-surface-500">{d.type}</div>
                </div>
                <span className={`text-sm font-black ${d.trustScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {d.trustScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Couriers */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-3">
          <div className="font-bold text-sm text-surface-900 flex items-center justify-between border-b border-surface-100 pb-2">
            <span>Delivery Couriers</span>
            <span className="text-[10px] text-surface-400">Score / 100</span>
          </div>
          <div className="space-y-2">
            {drivers.map(d => (
              <div key={d.id} className="p-2.5 rounded-xl bg-surface-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-surface-900">{d.name}</div>
                  <div className="text-[10px] text-surface-500">{d.vehicleType} • {d.completedRuns} runs</div>
                </div>
                <span className={`text-sm font-black ${d.trustScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {d.trustScore}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shelters */}
        <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-3">
          <div className="font-bold text-sm text-surface-900 flex items-center justify-between border-b border-surface-100 pb-2">
            <span>Shelters & Kitchens</span>
            <span className="text-[10px] text-surface-400">Score / 100</span>
          </div>
          <div className="space-y-2">
            {recipients.map(r => (
              <div key={r.id} className="p-2.5 rounded-xl bg-surface-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-surface-900">{r.name}</div>
                  <div className="text-[10px] text-surface-500">{r.type.toUpperCase()} • {r.location.zone}</div>
                </div>
                <span className={`text-sm font-black ${r.trustScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {r.trustScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Score Change Audit Stream */}
      <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs space-y-4">
        <h2 className="font-bold text-sm text-surface-900 flex items-center gap-2">
          <History className="w-4 h-4 text-surface-500" />
          <span>Trust Score Modification Audit Log</span>
        </h2>

        <div className="divide-y divide-surface-100">
          {trustEvents.map(ev => {
            const isPositive = ev.scoreDelta > 0;

            return (
              <div key={ev.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${
                      isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-surface-900 flex items-center gap-2">
                      <span>{ev.entityName}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isPositive ? `+${ev.scoreDelta}` : ev.scoreDelta} pts
                      </span>
                    </div>
                    <div className="text-[11px] text-surface-600 mt-0.5">{ev.reason}</div>
                  </div>
                </div>

                <div className="text-[10px] text-surface-400 shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

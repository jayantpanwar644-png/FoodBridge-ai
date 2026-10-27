import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { History, Filter, Search, ArrowRight } from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    if (roleFilter !== 'all' && log.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchReason = log.reason?.toLowerCase().includes(q) || false;
      const matchActor = log.actor.toLowerCase().includes(q);
      const matchEntity = log.entityId.toLowerCase().includes(q);
      if (!matchAction && !matchReason && !matchActor && !matchEntity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <History className="w-8 h-8 text-emerald-600" />
            <span>Admin Audit Trail & Accountability Ledger</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Transparent event ledger tracking status transitions, safety quarantines, algorithmic courier failovers, and coordinator decisions.
          </p>
        </div>
        <span className="text-sm font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl border border-emerald-300 self-start md:self-auto">
          Audit Logging Active
        </span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-2xl border border-surface-200 shadow-xs flex flex-wrap items-center gap-4 text-base">
        <div className="flex items-center gap-2 text-surface-700 font-semibold">
          <Filter className="w-5 h-5 text-surface-500" />
          <span>Filter:</span>
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-surface-300 rounded-xl bg-surface-50 text-surface-800 text-base"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin Operations</option>
          <option value="donor">Food Donor</option>
          <option value="driver">Courier</option>
          <option value="shelter">Shelter / NGO</option>
        </select>

        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-surface-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search action, reason, entity, or actor..."
            className="w-full pl-10 pr-4 py-2.5 border border-surface-300 rounded-xl text-base"
          />
        </div>

        <span className="text-sm text-surface-500 ml-auto">
          Showing <strong>{filteredLogs.length}</strong> events
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-surface-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-50 border-b border-surface-200 text-xs uppercase font-extrabold text-surface-600">
                <th className="py-4 px-5">Event ID / Entity</th>
                <th className="py-4 px-5">Action</th>
                <th className="py-4 px-5">Transition</th>
                <th className="py-4 px-5">Actor & Role</th>
                <th className="py-4 px-5">Audit Justification / Note</th>
                <th className="py-4 px-5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 font-sans text-sm">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-surface-50 transition">
                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="font-mono font-bold text-surface-900">{log.id}</div>
                    <div className="text-xs text-surface-500">{log.entityType}: {log.entityId}</div>
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full font-bold uppercase text-xs ${
                        log.action.includes('QUARANTINE')
                          ? 'bg-rose-100 text-rose-800'
                          : log.action.includes('REASSIGN')
                          ? 'bg-purple-100 text-purple-800'
                          : log.action.includes('VERIFIED')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-surface-100 text-surface-700'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap text-sm text-surface-700">
                    {log.previousState && log.newState ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-surface-500">{log.previousState}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-surface-400" />
                        <span className="font-bold text-surface-900">{log.newState}</span>
                      </div>
                    ) : (
                      log.newState || 'Executed'
                    )}
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <div className="font-bold text-surface-900">{log.actor}</div>
                    <div className="text-xs text-surface-500 uppercase font-semibold">{log.role}</div>
                  </td>

                  <td className="py-4 px-5 text-surface-700 max-w-sm leading-relaxed">
                    {log.reason || 'Routine state transition.'}
                  </td>

                  <td className="py-4 px-5 text-right whitespace-nowrap text-surface-500 text-xs font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

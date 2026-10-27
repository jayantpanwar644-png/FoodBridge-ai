import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RecipientRequest, FoodCategory } from '../types';
import {
  HeartHandshake,
  PlusCircle,
  Clock,
  AlertCircle,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';

export const RecipientRequestsPage: React.FC = () => {
  const { requests, recipients, addRequest, currentSimulatedTime, setActiveTab } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recipientId, setRecipientId] = useState(recipients[0]?.id || 'rec-1');
  const [category, setCategory] = useState<FoodCategory>('cooked_meals');
  const [quantityNeeded, setQuantityNeeded] = useState(60);
  const [peopleToServe, setPeopleToServe] = useState(60);
  const [urgency, setUrgency] = useState<'urgent' | 'high' | 'medium'>('urgent');
  const [dietary, setDietary] = useState('Halal preferred, mild seasoning');

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const cur = new Date(currentSimulatedTime).getTime();
    const neededBy = new Date(cur + 3 * 3600 * 1000).toISOString();

    const newReq: RecipientRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      recipientId,
      category,
      quantityNeeded,
      unit: 'portions',
      peopleToServe,
      urgency,
      neededBy,
      dietaryRestrictions: [dietary],
      acceptedStorage: ['hot_insulated', 'refrigerated', 'room_temp'],
      fulfilledQuantity: 0,
      status: 'open'
    };

    addRequest(newReq);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-rose-600" />
            <span>Shelter & Community Kitchen Hunger Demands</span>
          </h1>
          <p className="text-xs text-surface-500 mt-0.5">
            Real-time food needs submitted by homeless shelters, family resource centers, and community kitchens.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Submit Hunger Request</span>
        </button>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        {requests.map(req => {
          const recipient = recipients.find(r => r.id === req.recipientId);
          const percentFulfilled = Math.round((req.fulfilledQuantity / req.quantityNeeded) * 100);

          return (
            <div
              key={req.id}
              className="bg-white rounded-2xl border border-surface-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-surface-400 font-bold uppercase">
                    {req.id}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      req.urgency === 'urgent'
                        ? 'bg-rose-100 text-rose-800 animate-pulse'
                        : req.urgency === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {req.urgency} Priority
                  </span>
                </div>

                <h3 className="font-bold text-sm text-surface-900 mb-1">
                  {recipient?.name}
                </h3>

                <div className="text-[11px] text-surface-500 flex items-center gap-1.5 mb-3">
                  <Building className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                  <span>{recipient?.location.zone} • {recipient?.operatingHours}</span>
                </div>

                <div className="bg-surface-50 p-3 rounded-xl border border-surface-100 space-y-2 mb-3">
                  <div className="flex justify-between">
                    <span className="text-surface-500">Need:</span>
                    <strong className="text-surface-900">
                      {req.quantityNeeded} {req.unit} ({req.category.replace('_', ' ')})
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Diners to Serve:</span>
                    <span className="font-semibold text-surface-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-surface-400" />
                      {req.peopleToServe} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-surface-500">Needed By:</span>
                    <span className="font-semibold text-surface-800">
                      {new Date(req.neededBy).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-surface-500 mb-1">
                    <span>Fulfillment Progress</span>
                    <span className="font-bold">{req.fulfilledQuantity} / {req.quantityNeeded}</span>
                  </div>
                  <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand-600 h-full rounded-full transition-all"
                      style={{ width: `${percentFulfilled}%` }}
                    />
                  </div>
                </div>

                {/* Dietary Rules */}
                <div className="text-[11px] text-surface-600">
                  <span className="font-semibold text-surface-700">Dietary:</span>{' '}
                  {req.dietaryRestrictions.join(', ') || 'Standard shelter intake'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-100 flex items-center justify-between">
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  {recipient?.trustScore}% Trust Score
                </span>
                <button
                  onClick={() => setActiveTab('matching')}
                  className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-900 font-bold text-xs transition"
                >
                  Find Surplus Matches
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for Submitting Food Request */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-surface-200 max-w-lg w-full p-6 z-10 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-surface-100">
              <h2 className="font-bold text-base text-surface-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Submit Recipient Food Demand</span>
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-surface-400 hover:text-surface-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="block font-semibold text-surface-700 mb-1">Recipient Facility</label>
                <select
                  value={recipientId}
                  onChange={e => setRecipientId(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg bg-surface-50 focus:bg-white"
                >
                  {recipients.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.location.zone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">Category Needed</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as FoodCategory)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg bg-surface-50"
                  >
                    <option value="cooked_meals">Cooked Hot Meals</option>
                    <option value="fresh_produce">Fresh Produce</option>
                    <option value="bakery_dairy">Bakery & Dairy</option>
                    <option value="catered_buffet">Catered Buffet</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={e => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg bg-surface-50"
                  >
                    <option value="urgent">Urgent (Immediate Service)</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">Portions Needed</label>
                  <input
                    type="number"
                    min="10"
                    value={quantityNeeded}
                    onChange={e => setQuantityNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-surface-700 mb-1">People to Feed</label>
                  <input
                    type="number"
                    min="5"
                    value={peopleToServe}
                    onChange={e => setPeopleToServe(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-surface-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-surface-700 mb-1">Dietary Restrictions</label>
                <input
                  type="text"
                  value={dietary}
                  onChange={e => setDietary(e.target.value)}
                  className="w-full px-3 py-2 border border-surface-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-surface-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 border border-surface-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

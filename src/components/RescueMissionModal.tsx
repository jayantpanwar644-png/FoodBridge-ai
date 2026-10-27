import React from 'react';
import { useApp } from '../context/AppContext';
import {
  PlayCircle,
  X,
  Sparkles,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Truck,
  QrCode,
  HeartHandshake
} from 'lucide-react';

interface RescueMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RescueMissionModal: React.FC<RescueMissionModalProps> = ({ isOpen, onClose }) => {
  const {
    isSimulationRunning,
    simulationStep,
    simulationMessage,
    runRescueMissionSimulation,
    runSafetyQuarantineSimulation,
    resetToDefaultData
  } = useApp();

  if (!isOpen) return null;

  const missionPhases = [
    {
      num: 1,
      title: 'AI Surplus Forecasting',
      desc: 'Predicts dinner surplus at Grand Amber Hotel based on weather and footfall variance.',
      icon: Sparkles
    },
    {
      num: 2,
      title: 'Surplus Listing Published',
      desc: '50 portions of Steamed Salmon registered with temperature and allergen disclosure.',
      icon: TrendingUp
    },
    {
      num: 3,
      title: 'Constraint-Based AI Matching',
      desc: 'Checks 5 hard constraints (halal, hot insulation, expiry). Matches Hope Harbor with score 94.',
      icon: HeartHandshake
    },
    {
      num: 4,
      title: 'Driver Failure & Dynamic Failover',
      desc: 'Courier Marcus Brody suffers tire puncture. System re-evaluates 38m shelf-life and auto-reassigns to Alex Chen.',
      icon: Truck
    },
    {
      num: 5,
      title: 'Two-Stage QR/OTP Verification',
      desc: 'Courier Alex scans donor QR code; package core temperature logged at 66°C.',
      icon: QrCode
    },
    {
      num: 6,
      title: 'Drop-off Confirmation & Impact Metrics',
      desc: 'Hope Harbor confirms 50 hot portions received. Avoided 22.5 kg food waste & 56 kg CO2e.',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-xs" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-surface-200 max-w-2xl w-full p-7 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-surface-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <PlayCircle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-surface-900">
                  "Rescue Mission" Live Demo
                </h2>
                <span className="text-xs font-bold uppercase bg-brand-100 text-brand-800 px-3 py-1 rounded-full">
                  Autonomous Run
                </span>
              </div>
              <p className="text-base text-surface-500 mt-1">
                Witness an autonomous, end-to-end food rescue journey updating shared platform state.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-surface-400 hover:text-surface-700 hover:bg-surface-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Live Simulation Status Banner */}
        {isSimulationRunning && (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-brand-900 flex items-center gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              {simulationStep}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-700">
                Phase {simulationStep} of 6 In Progress
              </div>
              <div className="text-base font-bold text-brand-950 truncate">
                {simulationMessage}
              </div>
            </div>
          </div>
        )}

        {/* Six Mission Phases Step Visualizer */}
        <div className="space-y-2.5">
          {missionPhases.map(phase => {
            const Icon = phase.icon;
            const isCompleted = simulationStep > phase.num;
            const isCurrent = simulationStep === phase.num;
            return (
              <div
                key={phase.num}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                  isCurrent
                    ? 'bg-brand-50 border-brand-400 shadow-xs'
                    : isCompleted
                    ? 'bg-surface-50 border-surface-200 opacity-90'
                    : 'bg-white border-surface-200 text-surface-500'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isCurrent
                        ? 'bg-brand-600 text-white animate-bounce'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-surface-100 text-surface-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="font-bold text-base text-surface-900 flex items-center gap-2">
                      <span>Phase {phase.num}: {phase.title}</span>
                    </div>
                    <div className="text-sm text-surface-600 leading-snug">
                      {phase.desc}
                    </div>
                  </div>
                </div>
                {isCompleted && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Verified
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => {
                runRescueMissionSimulation();
                onClose();
              }}
              disabled={isSimulationRunning}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-sm disabled:opacity-50 transition"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Run Live Rescue Simulation</span>
            </button>
            <button
              onClick={() => {
                runSafetyQuarantineSimulation();
                onClose();
              }}
              disabled={isSimulationRunning}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-base transition"
              title="Test the safety engine locking a batch upon complaint"
            >
              <ShieldAlert className="w-5 h-5" />
              <span>Simulate Quarantine</span>
            </button>
          </div>

          <button
            onClick={() => {
              resetToDefaultData();
              alert('Demo state reset to initial seed data.');
            }}
            className="flex items-center gap-1.5 text-base text-surface-500 hover:text-surface-800 font-semibold transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

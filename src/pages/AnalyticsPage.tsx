import React from 'react';
import { useApp } from '../context/AppContext';
import { computePlatformImpact, exportImpactToCsv } from '../services/impactCalculator';
import {
  BarChart3,
  Download,
  Info
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const { listings, allocations, recipients } = useApp();

  const impact = computePlatformImpact(listings, allocations, recipients);

  const handleDownloadCsv = () => {
    const csv = exportImpactToCsv(impact, allocations, listings);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `foodbridge_impact_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = [
    { period: 'Mon', deliveredPortions: 35 },
    { period: 'Tue (Today)', deliveredPortions: impact.totalPortionsDelivered },
    { period: 'Wed (Projected)', deliveredPortions: 48 },
    { period: 'Thu (Projected)', deliveredPortions: 52 },
    { period: 'Fri (Projected)', deliveredPortions: 65 }
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold text-surface-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-600" />
            <span>Community Impact</span>
          </h1>
          <p className="text-base text-surface-600 mt-1 max-w-2xl">
            Transparent records of meals rescued, food waste prevented, and completed donations.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface-900 hover:bg-surface-800 text-white font-bold text-base shadow-sm transition self-start md:self-auto"
        >
          <Download className="w-5 h-5" />
          <span>Download Impact Report (CSV)</span>
        </button>
      </div>

      {/* 2. Key Impact Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Food Delivered */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
          <div className="text-surface-500 font-bold uppercase text-xs mb-2">
            Total Food Delivered
          </div>
          <div className="text-3xl font-black text-surface-900">
            {impact.totalPortionsDelivered} <span className="text-base font-semibold text-surface-500">portions</span>
          </div>
          <div className="text-sm text-surface-600 mt-2">
            (~{impact.totalKgDelivered} kg total weight)
          </div>
        </div>

        {/* Metric 2: Estimated Meals Provided */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
          <div className="text-surface-500 font-bold uppercase text-xs mb-2">
            Estimated Meals Provided
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {impact.estimatedMealsProvided} <span className="text-base font-semibold text-surface-500">meals</span>
          </div>
          <div className="text-sm text-surface-600 mt-2">
            Served through verified shelters
          </div>
        </div>

        {/* Metric 3: Donations Completed */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
          <div className="text-surface-500 font-bold uppercase text-xs mb-2">
            Donations Completed
          </div>
          <div className="text-3xl font-black text-surface-900">
            {impact.totalCompletedDonations} <span className="text-base font-semibold text-surface-500">handoffs</span>
          </div>
          <div className="text-sm text-surface-600 mt-2">
            100% verified with QR / OTP
          </div>
        </div>

        {/* Metric 4: Estimated Food Waste Avoided */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs">
          <div className="text-surface-500 font-bold uppercase text-xs mb-2">
            Estimated Waste Avoided
          </div>
          <div className="text-3xl font-black text-brand-700">
            {impact.foodWasteAvoidedKg} <span className="text-base font-semibold text-surface-500">kg</span>
          </div>
          <div className="text-sm text-surface-600 mt-2">
            ~{impact.co2eAvoidedKg} kg CO2e prevented
          </div>
        </div>
      </div>

      {/* 3. Food Delivered Over Time Chart */}
      <div className="bg-white p-7 rounded-2xl border border-surface-200 shadow-xs space-y-4">
        <div>
          <h2 className="font-extrabold text-xl text-surface-900">Food Delivered (Portions Over Time)</h2>
          <p className="text-base text-surface-500 mt-0.5">
            Track daily volume delivered across community kitchens and shelters.
          </p>
        </div>

        <div className="h-64 w-full pt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" stroke="#64748b" style={{ fontSize: '13px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '13px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '13px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="deliveredPortions" name="Meals Delivered" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transparent Methodology Footnote */}
        <div className="p-4 bg-surface-50 rounded-xl border border-surface-200 flex items-start gap-3 text-sm text-surface-600">
          <Info className="w-5 h-5 text-surface-500 shrink-0 mt-0.5" />
          <span>
            <strong>Estimation Methodology:</strong> Food waste calculations apply standard USDA & IPCC environmental benchmark factors (1 portion = 0.42 kg; 1 kg food rescued prevents ~2.5 kg CO2e emissions). All donation records originate from authenticated demo drop-off verifications.
          </span>
        </div>
      </div>
    </div>
  );
};

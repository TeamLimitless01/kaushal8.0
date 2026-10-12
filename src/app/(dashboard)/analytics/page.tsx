import React from 'react';
import { getDashboardData } from '@/server/services/analyticsService';
import { TrendingUp, Building, CloudFog, Zap, Droplets, Trash2, ShieldCheck, Trees } from 'lucide-react';
import OnboardingEmptyState from '@/components/dashboard/OnboardingEmptyState';

export default async function AnalyticsPage() {
  const data = await getDashboardData({});

  if (!data.hasData) {
    return <OnboardingEmptyState />;
  }

  // Calculate building intensities
  const buildingBreakdown = data.charts.buildingComparison.map((b) => {
    return {
      ...b,
      co2Kg: Math.round(b.electricity * 0.82 + b.water * 0.0003 + b.waste * 0.45),
      efficiencyScore: Math.max(50, Math.min(95, Math.round(95 - (b.electricity / 200)))),
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Campus Sustainability Analytics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          In-depth carbon footprint audit, building efficiency ratings, and emissions breakdown for SVVV Campus
        </p>
      </div>

      {/* Top Carbon & Equivalent Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Gross CO₂ Emissions</span>
            <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
              <CloudFog className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">
            {data.kpis.co2EmissionsKg.toLocaleString('en-IN')} kg CO₂
          </p>
          <p className="text-[11px] text-slate-500 mt-1">Calculated via CEA India grid factor</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Offset Requirement</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <Trees className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-3">
            {Math.round(data.kpis.co2EmissionsKg / 21.7).toLocaleString('en-IN')} Trees
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">Required to neutralize current footprint</p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Financial Optimization Potential</span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-900 mt-3">
            ₹{data.kpis.potentialSavingsInr.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-700 mt-1">Estimated annual university cost reduction</p>
        </div>
      </div>

      {/* Building-by-Building Scorecard Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
          <Building className="w-4 h-4 text-emerald-600" />
          <span>Building Efficiency Scorecard</span>
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Comparative resource consumption, carbon generation, and efficiency rank across SVVV campus facilities
        </p>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Facility / Block</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Electricity (kWh)</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Water (L)</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Waste (kg)</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Carbon Footprint</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Total Cost</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Efficiency Index</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {buildingBreakdown.map((b) => (
                <tr key={b.buildingId} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900">{b.buildingName}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{b.electricity.toLocaleString()} kWh</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{b.water.toLocaleString()} L</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">{b.waste.toLocaleString()} kg</td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{b.co2Kg.toLocaleString()} kg CO₂</td>
                  <td className="px-4 py-3 font-bold text-slate-900">₹{b.totalCost.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.efficiencyScore >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.efficiencyScore >= 65
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.efficiencyScore} / 100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

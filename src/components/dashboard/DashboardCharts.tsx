'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { DailyTrendItem, BuildingUsageItem } from '@/server/services/analyticsService';
import { Zap, Droplets, Trash2, Calendar, Building, PieChart as PieIcon } from 'lucide-react';

interface DashboardChartsProps {
  consumptionOverTime: DailyTrendItem[];
  buildingComparison: BuildingUsageItem[];
  resourceDistribution: Array<{ name: string; value: number; color: string; unit: string }>;
  peakDays: Array<{ date: string; resource: string; usage: number; unit: string; building: string }>;
}

export default function DashboardCharts({
  consumptionOverTime,
  buildingComparison,
  resourceDistribution,
  peakDays,
}: DashboardChartsProps) {
  const [activeMetric, setActiveMetric] = useState<'electricity' | 'water' | 'waste'>('electricity');

  // Format short date for X-Axis (e.g., '01 Oct')
  const formattedTimeline = consumptionOverTime.map((d) => {
    const parts = d.date.split('-');
    const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date;
    return {
      ...d,
      shortDate,
    };
  });

  return (
    <div className="space-y-6">
      {/* Chart Row 1: Consumption Over Time (Area Chart) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Resource Consumption Over Time</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily trend analysis across measured campus dates
            </p>
          </div>

          {/* Metric Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveMetric('electricity')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeMetric === 'electricity'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              <span>Electricity (kWh)</span>
            </button>
            <button
              onClick={() => setActiveMetric('water')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeMetric === 'water'
                  ? 'bg-white text-cyan-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              <span>Water (L)</span>
            </button>
            <button
              onClick={() => setActiveMetric('waste')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeMetric === 'waste'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Waste (kg)</span>
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="h-72 w-full">
          {formattedTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="shortDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as DailyTrendItem;
                      return (
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs">
                          <p className="font-bold text-slate-800">{data.date}</p>
                          <p className="text-emerald-800 mt-1">
                            ⚡ Electricity: {data.electricity} kWh
                          </p>
                          <p className="text-cyan-800">💧 Water: {data.water} L</p>
                          <p className="text-amber-800">♻️ Waste: {data.waste} kg</p>
                          <p className="text-slate-500 mt-1 pt-1 border-t border-slate-100">
                            Equiv. Cost: ₹{data.totalEquivalentCost.toLocaleString('en-IN')}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {activeMetric === 'electricity' && (
                  <Area
                    type="monotone"
                    dataKey="electricity"
                    stroke="#059669"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorElec)"
                  />
                )}
                {activeMetric === 'water' && (
                  <Area
                    type="monotone"
                    dataKey="water"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWater)"
                  />
                )}
                {activeMetric === 'waste' && (
                  <Area
                    type="monotone"
                    dataKey="waste"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWaste)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              No timeline data available for the selected range
            </div>
          )}
        </div>
      </div>

      {/* Chart Row 2: Building Comparison & Resource Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building Comparison Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="mb-5">
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-emerald-600" />
              <span>Building Consumption Comparison</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked total estimated utility expenditure by SVVV campus blocks
            </p>
          </div>

          <div className="h-72 w-full">
            {buildingComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingComparison} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v}`} />
                  <YAxis
                    type="category"
                    dataKey="buildingName"
                    stroke="#475569"
                    fontSize={11}
                    tickLine={false}
                    width={110}
                    tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 14)}...` : val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as BuildingUsageItem;
                        return (
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-md text-xs">
                            <p className="font-bold text-slate-800">{data.buildingName}</p>
                            <p className="text-slate-900 font-semibold mt-1">
                              Total Cost: ₹{data.totalCost.toLocaleString('en-IN')}
                            </p>
                            <p className="text-emerald-800">⚡ Elec: {data.electricity} kWh</p>
                            <p className="text-cyan-800">💧 Water: {data.water} L</p>
                            <p className="text-amber-800">♻️ Waste: {data.waste} kg</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalCost" fill="#059669" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No building comparison available
              </div>
            )}
          </div>
        </div>

        {/* Resource Distribution Donut Chart (1 col) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>Expenditure Share</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of total financial utility impact
            </p>

            <div className="h-52 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Cost Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Custom Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {resourceDistribution.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">
                  ₹{item.value.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak Usage Days Summary Cards */}
      {peakDays.length > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
            Top Peak Consumption Days Observed
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {peakDays.map((peak, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                  {peak.date}
                </span>
                <p className="text-sm font-bold text-slate-900 mt-0.5">
                  {peak.usage} {peak.unit}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {peak.building}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

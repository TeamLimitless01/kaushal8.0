'use client';

import React, { useState, useMemo } from 'react';
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
  CartesianGrid,
} from 'recharts';
import { DailyTrendItem, BuildingUsageItem } from '@/server/services/analyticsService';
import {
  Zap,
  Droplets,
  Trash2,
  Calendar,
  Building2,
  PieChart as PieIcon,
  IndianRupee,
  TrendingUp,
  Activity,
  Flame,
  ArrowUpRight,
  Maximize2,
  BarChart3,
} from 'lucide-react';

interface DashboardChartsProps {
  consumptionOverTime: DailyTrendItem[];
  buildingComparison: BuildingUsageItem[];
  resourceDistribution: Array<{ name: string; value: number; color: string; unit: string }>;
  peakDays: Array<{ date: string; resource: string; usage: number; unit: string; building: string }>;
}

type MetricType = 'electricity' | 'water' | 'waste' | 'cost';

export default function DashboardCharts({
  consumptionOverTime,
  buildingComparison,
  resourceDistribution,
  peakDays,
}: DashboardChartsProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('electricity');
  const [chartMode, setChartMode] = useState<'daily' | 'cumulative'>('daily');

  // Format short date for X-Axis and calculate cumulative sums
  const formattedTimeline = useMemo(() => {
    let runningElec = 0;
    let runningWater = 0;
    let runningWaste = 0;
    let runningCost = 0;

    return consumptionOverTime.map((d) => {
      const parts = d.date.split('-');
      const shortDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : d.date;
      runningElec += d.electricity;
      runningWater += d.water;
      runningWaste += d.waste;
      runningCost += d.totalEquivalentCost;

      return {
        ...d,
        shortDate,
        cumElectricity: Math.round(runningElec),
        cumWater: Math.round(runningWater),
        cumWaste: Math.round(runningWaste),
        cumCost: Math.round(runningCost),
      };
    });
  }, [consumptionOverTime]);

  // Metric metadata
  const metricConfig = {
    electricity: {
      label: 'Electricity',
      unit: 'kWh',
      icon: Zap,
      color: '#10b981',
      gradientId: 'gradientElec',
      textColor: 'text-emerald-700',
      bgActive: 'bg-emerald-500 text-white shadow-emerald-500/25',
      glow: 'shadow-emerald-500/10',
      dataKey: chartMode === 'daily' ? 'electricity' : 'cumElectricity',
    },
    water: {
      label: 'Water',
      unit: 'L',
      icon: Droplets,
      color: '#06b6d4',
      gradientId: 'gradientWater',
      textColor: 'text-cyan-700',
      bgActive: 'bg-cyan-500 text-white shadow-cyan-500/25',
      glow: 'shadow-cyan-500/10',
      dataKey: chartMode === 'daily' ? 'water' : 'cumWater',
    },
    waste: {
      label: 'Waste',
      unit: 'kg',
      icon: Trash2,
      color: '#f59e0b',
      gradientId: 'gradientWaste',
      textColor: 'text-amber-700',
      bgActive: 'bg-amber-500 text-white shadow-amber-500/25',
      glow: 'shadow-amber-500/10',
      dataKey: chartMode === 'daily' ? 'waste' : 'cumWaste',
    },
    cost: {
      label: 'Equivalent Cost',
      unit: '₹',
      icon: IndianRupee,
      color: '#8b5cf6',
      gradientId: 'gradientCost',
      textColor: 'text-purple-700',
      bgActive: 'bg-purple-600 text-white shadow-purple-500/25',
      glow: 'shadow-purple-500/10',
      dataKey: chartMode === 'daily' ? 'totalEquivalentCost' : 'cumCost',
    },
  };

  const currentCfg = metricConfig[activeMetric];

  // Calculate high-level summary metrics for active selected metric
  const metricStats = useMemo(() => {
    if (!formattedTimeline.length) return { total: 0, avg: 0, peak: 0, peakDate: 'N/A' };

    let total = 0;
    let peak = 0;
    let peakDate = '';

    formattedTimeline.forEach((d) => {
      let val = 0;
      if (activeMetric === 'electricity') val = d.electricity;
      else if (activeMetric === 'water') val = d.water;
      else if (activeMetric === 'waste') val = d.waste;
      else if (activeMetric === 'cost') val = d.totalEquivalentCost;

      total += val;
      if (val > peak) {
        peak = val;
        peakDate = d.date;
      }
    });

    const avg = total / formattedTimeline.length;
    return {
      total,
      avg,
      peak,
      peakDate,
    };
  }, [formattedTimeline, activeMetric]);

  // Total expenditure sum across all resources
  const totalExpenditure = useMemo(() => {
    return resourceDistribution.reduce((sum, item) => sum + item.value, 0);
  }, [resourceDistribution]);

  return (
    <div className="space-y-6">
      {/* Visual Analytics Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold tracking-tight text-slate-900">
                Visual Analytics & Consumption Hub
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              High-resolution campus temporal trends, building benchmarks, and cost proportions
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setChartMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'daily'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Daily Volume
            </button>
            <button
              onClick={() => setChartMode('cumulative')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                chartMode === 'cumulative'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Cumulative Run
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Primary Consumption Timeline (2 cols) + Expenditure Donut (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Resource Consumption Timeline Hero (2 cols) */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between">
          <div>
            {/* Chart Header with Interactive Metric Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Temporal Resource Trajectory</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Measured daily telemetry across active campus meters
                </p>
              </div>

              {/* Metric Selector Pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl text-xs font-semibold">
                {(['electricity', 'water', 'waste', 'cost'] as MetricType[]).map((mKey) => {
                  const m = metricConfig[mKey];
                  const Icon = m.icon;
                  const isActive = activeMetric === mKey;
                  return (
                    <button
                      key={mKey}
                      onClick={() => setActiveMetric(mKey)}
                      className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? `${m.bgActive} shadow-xs font-bold scale-[1.02]`
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Summary Pill Strip inside chart card */}
            <div className="grid grid-cols-3 gap-3 mb-6 p-3 bg-slate-50/80 border border-slate-200/60 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                  Total in Scope
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 inline-block">
                  {activeMetric === 'cost' ? '₹' : ''}
                  {Math.round(metricStats.total).toLocaleString('en-IN')}{' '}
                  {activeMetric !== 'cost' ? currentCfg.unit : ''}
                </span>
              </div>
              <div className="border-x border-slate-200/80 px-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                  Daily Average
                </span>
                <span className="text-sm font-black text-slate-900 mt-0.5 inline-block">
                  {activeMetric === 'cost' ? '₹' : ''}
                  {metricStats.avg.toFixed(1)}{' '}
                  {activeMetric !== 'cost' ? `${currentCfg.unit}/day` : '/day'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600 block">
                  Peak Intensity
                </span>
                <span className="text-sm font-black text-amber-800 mt-0.5 inline-block truncate">
                  {activeMetric === 'cost' ? '₹' : ''}
                  {Math.round(metricStats.peak).toLocaleString('en-IN')}{' '}
                  {activeMetric !== 'cost' ? currentCfg.unit : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="h-72 w-full mt-2">
            {formattedTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedTimeline}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradientElec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="gradientCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="shortDate"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(val) =>
                      val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val
                    }
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DailyTrendItem & {
                          cumElectricity: number;
                          cumWater: number;
                          cumWaste: number;
                          cumCost: number;
                        };
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl shadow-xl text-white text-xs min-w-[200px] animate-in fade-in zoom-in-95 duration-100">
                            <p className="font-bold text-slate-200 border-b border-slate-800 pb-1.5 flex items-center justify-between">
                              <span>{data.date}</span>
                              <span className="text-[10px] font-mono text-emerald-400 uppercase">
                                Telemetry
                              </span>
                            </p>
                            <div className="space-y-1.5 mt-2">
                              <div
                                className={`flex items-center justify-between ${
                                  activeMetric === 'electricity'
                                    ? 'text-emerald-400 font-bold'
                                    : 'text-slate-300'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                  Electricity:
                                </span>
                                <span>
                                  {chartMode === 'daily'
                                    ? `${data.electricity} kWh`
                                    : `${data.cumElectricity} kWh`}
                                </span>
                              </div>
                              <div
                                className={`flex items-center justify-between ${
                                  activeMetric === 'water'
                                    ? 'text-cyan-400 font-bold'
                                    : 'text-slate-300'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                  Water:
                                </span>
                                <span>
                                  {chartMode === 'daily'
                                    ? `${data.water} L`
                                    : `${data.cumWater} L`}
                                </span>
                              </div>
                              <div
                                className={`flex items-center justify-between ${
                                  activeMetric === 'waste'
                                    ? 'text-amber-400 font-bold'
                                    : 'text-slate-300'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                  Waste:
                                </span>
                                <span>
                                  {chartMode === 'daily'
                                    ? `${data.waste} kg`
                                    : `${data.cumWaste} kg`}
                                </span>
                              </div>
                              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-semibold text-purple-300">
                                <span>Equivalent Impact:</span>
                                <span>
                                  ₹
                                  {(chartMode === 'daily'
                                    ? data.totalEquivalentCost
                                    : data.cumCost
                                  ).toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={currentCfg.dataKey}
                    stroke={currentCfg.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${currentCfg.gradientId})`}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: currentCfg.color }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No timeline data available for the selected parameters
              </div>
            )}
          </div>
        </div>

        {/* Resource Expenditure Share Donut (1 col) */}
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-600" />
                <span>Expenditure Share</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">
                Proportion
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Campus utility budget distribution by resource class
            </p>

            {/* Donut Chart with Centered Total Callout */}
            <div className="h-56 w-full relative mt-3 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resourceDistribution}
                    innerRadius={58}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="#ffffff"
                    strokeWidth={2}
                  >
                    {resourceDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        const percentage =
                          totalExpenditure > 0
                            ? ((data.value / totalExpenditure) * 100).toFixed(1)
                            : 0;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs shadow-lg">
                            <p className="font-bold">{data.name}</p>
                            <p className="text-emerald-400 font-semibold mt-0.5">
                              ₹{data.value.toLocaleString('en-IN')} ({percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Centered Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                  Total
                </span>
                <span className="text-base font-black text-slate-900">
                  ₹{Math.round(totalExpenditure).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Interactive Breakdown List */}
          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {resourceDistribution.map((item, idx) => {
              const pct =
                totalExpenditure > 0
                  ? ((item.value / totalExpenditure) * 100).toFixed(1)
                  : '0';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {pct}%
                    </span>
                    <span className="font-bold text-slate-900 min-w-[70px] text-right">
                      ₹{item.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Building Comparison Bar Chart (2 cols) + Peak Outliers / Observations (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building Consumption Comparison Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Building Consumption Hierarchy</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparative expenditure and consumption rank across SVVV campus facilities
              </p>
            </div>
            {buildingComparison.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200/60 self-start sm:self-auto">
                {buildingComparison.length} Facilities Measured
              </span>
            )}
          </div>

          <div className="h-72 w-full">
            {buildingComparison.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={buildingComparison}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 45, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#059669" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(v) => `₹${v.toLocaleString('en-IN')}`}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="buildingName"
                    stroke="#334155"
                    fontSize={11}
                    tickLine={false}
                    width={115}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(val) =>
                      val.length > 15 ? `${val.slice(0, 15)}...` : val
                    }
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as BuildingUsageItem;
                        return (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-xs min-w-[200px]">
                            <p className="font-bold text-slate-100 border-b border-slate-800 pb-1">
                              {data.buildingName}
                            </p>
                            <p className="text-emerald-400 font-bold mt-2 text-sm">
                              Total Cost: ₹{data.totalCost.toLocaleString('en-IN')}
                            </p>
                            <div className="mt-2 space-y-1 text-slate-300">
                              <p>⚡ Electricity: {data.electricity} kWh</p>
                              <p>💧 Water: {data.water} L</p>
                              <p>♻️ Waste: {data.waste} kg</p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="totalCost"
                    fill="url(#barGradient)"
                    radius={[0, 8, 8, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No building comparison data available
              </div>
            )}
          </div>
        </div>

        {/* Peak Demand & Anomaly Telemetry Cards (1 col) */}
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Peak Load Surges</span>
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                Top Spikes
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Highest single-day resource usage recorded across campus meters
            </p>

            {peakDays.length > 0 ? (
              <div className="space-y-2.5">
                {peakDays.slice(0, 4).map((peak, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-gradient-to-r from-slate-50 to-amber-50/30 border border-slate-200/80 rounded-2xl hover:border-amber-300 transition flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-lg bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 truncate">
                          {peak.building}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 mt-1">
                        {peak.date} • {peak.resource}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 block">
                        {peak.usage.toLocaleString('en-IN')} {peak.unit}
                      </span>
                      <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                        Peak Spike
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-slate-400 text-xs">
                No peak load events recorded
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-emerald-800 font-semibold">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Dynamic Peak Shaving active
            </span>
            <span className="text-[10px] font-mono text-slate-600">SVVV-GRID</span>
          </div>
        </div>
      </div>
    </div>
  );
}

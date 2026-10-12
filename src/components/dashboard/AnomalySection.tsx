'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  IndianRupee,
  CloudFog,
  Sparkles,
  X,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { AnomalyReport } from '@/lib/anomaly/engine';
import { ResourceType } from '@prisma/client';

export default function AnomalySection({
  anomalies,
}: {
  anomalies: AnomalyReport[];
}) {
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyReport | null>(null);

  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              No Critical Anomalies Detected
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Campus resource consumption across all buildings is currently tracking within standard historical deviations.
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg">
          Optimal State
        </span>
      </div>
    );
  }

  // Highlight top critical anomaly
  const topAnomaly = anomalies[0];

  return (
    <div className="space-y-4">
      {/* Featured Primary Anomaly Alert Card */}
      <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-100 text-red-700 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-800 bg-red-100 px-2.5 py-0.5 rounded-full">
                  ⚠️ Critical Anomaly Flagged
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {topAnomaly.date}
                </span>
              </div>

              <h4 className="text-lg font-bold text-slate-900 mt-1">
                {topAnomaly.buildingName} — {topAnomaly.roomName} ({topAnomaly.resourceType.toLowerCase()})
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                Consumption is <strong>{topAnomaly.deviationPercent}%</strong> above its historical statistical baseline ({topAnomaly.actualUsage} {topAnomaly.unit} vs expected {topAnomaly.expectedUsage} {topAnomaly.unit}).
              </p>

              {/* Key Quick Metrics */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <span className="text-slate-600">
                  Expected: <strong>{topAnomaly.expectedUsage} {topAnomaly.unit}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-red-700 font-semibold">
                  Actual: <strong>{topAnomaly.actualUsage} {topAnomaly.unit}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-amber-800 font-medium">
                  Potential excess: +{topAnomaly.excessUsage} {topAnomaly.unit}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
            <button
              onClick={() => setSelectedAnomaly(topAnomaly)}
              className="w-full md:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Investigate Anomaly</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Other Detected Anomalies (if more than 1) */}
      {anomalies.length > 1 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Additional Anomaly Signals ({anomalies.length - 1})
            </h5>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {anomalies.slice(1).map((a) => (
              <div
                key={a.id}
                onClick={() => setSelectedAnomaly(a)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {a.buildingName} ({a.resourceType.toLowerCase()})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {a.date} • +{a.deviationPercent}% deviation
                  </p>
                </div>
                <button
                  type="button"
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 underline ml-2 shrink-0"
                >
                  Inspect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investigation Modal / Drawer */}
      {selectedAnomaly && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-700 rounded-xl">
                  <ShieldAlert className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    {selectedAnomaly.statusLabel}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedAnomaly.buildingName} — {selectedAnomaly.roomName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Recorded Date: {selectedAnomaly.date} • Resource: {selectedAnomaly.resourceType}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAnomaly(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Variance Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Expected Baseline</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedAnomaly.expectedUsage} {selectedAnomaly.unit}
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-[10px] font-semibold text-red-600 uppercase">Actual Measured</p>
                <p className="text-base font-bold text-red-700 mt-0.5">
                  {selectedAnomaly.actualUsage} {selectedAnomaly.unit}
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-[10px] font-semibold text-amber-700 uppercase">Excess Deviation</p>
                <p className="text-base font-bold text-amber-800 mt-0.5">
                  +{selectedAnomaly.deviationPercent}%
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Excess Cost</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  ₹{selectedAnomaly.estimatedExcessCostInr.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* AI Insights & Root Cause Analysis */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Sustainability Intelligence & Diagnosis</span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {selectedAnomaly.aiExplanation.summary}
              </p>

              <div>
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Probable Root Causes:
                </p>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedAnomaly.aiExplanation.possibleCauses.map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{cause}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-emerald-200/60">
                <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Recommended Action:
                </p>
                <p className="text-xs text-slate-800 bg-white p-3 rounded-xl border border-emerald-200">
                  {selectedAnomaly.aiExplanation.recommendedAction}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-emerald-900 pt-1">
                <span>Potential Monthly Cost Saving:</span>
                <span className="text-sm font-bold text-emerald-800">
                  ₹{selectedAnomaly.aiExplanation.potentialMonthlySavingInr.toLocaleString('en-IN')} / month
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Alert dispatched to SVVV Facilities Team for ${selectedAnomaly.buildingName} ${selectedAnomaly.roomName}`);
                  setSelectedAnomaly(null);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Dispatch Maintenance Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

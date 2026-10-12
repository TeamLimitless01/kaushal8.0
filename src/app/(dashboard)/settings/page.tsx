'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, Save, CheckCircle2, Building2, HelpCircle } from 'lucide-react';

export default function SettingsPage() {
  const [elecRate, setElecRate] = useState('8.50');
  const [waterRate, setWaterRate] = useState('0.05');
  const [wasteRate, setWasteRate] = useState('12.00');
  const [elecFactor, setElecFactor] = useState('0.82');
  const [waterFactor, setWaterFactor] = useState('0.0003');
  const [wasteFactor, setWasteFactor] = useState('0.45');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Platform Settings & Sustainability Parameters
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institutional utility tariffs, carbon emission benchmarks, and system configurations.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Utility Tariffs */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Utility Tariff Rates (INR)
          </h4>
          <p className="text-xs text-slate-500 mb-5">
            Configurable unit prices applied across historical consumption to compute estimated expenditure.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Electricity Tariff (₹ / kWh)
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={elecRate}
                  onChange={(e) => setElecRate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Commercial tariff for education</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Water Tariff (₹ / Liter)
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  step="0.001"
                  value={waterRate}
                  onChange={(e) => setWaterRate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Municipal bulk supply rate</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Waste Handling (₹ / kg)
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  step="0.1"
                  value={wasteRate}
                  onChange={(e) => setWasteRate(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Disposal & transport fee</p>
            </div>
          </div>
        </div>

        {/* Card 2: Carbon Factors */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Carbon Emission Factors (CO₂ Baseline)
          </h4>
          <p className="text-xs text-slate-500 mb-5">
            Greenhouse gas calculation factors in line with standard institutional GHG protocol.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Grid Electricity (kg CO₂ / kWh)
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={elecFactor}
                  onChange={(e) => setElecFactor(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">CEA National Grid Average</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Water Treatment (kg CO₂ / L)
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  step="0.0001"
                  value={waterFactor}
                  onChange={(e) => setWaterFactor(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Pumping & distribution power</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Solid Waste Landfill (kg CO₂ / kg)
              </label>
              <div className="mt-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={wasteFactor}
                  onChange={(e) => setWasteFactor(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white font-semibold text-slate-900"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Landfill decomposition emission</p>
            </div>
          </div>
        </div>

        {/* Card 3: Institutional Campus Info */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Institutional Campus Profile
              </h4>
              <p className="text-xs text-slate-500">
                Active tenant configuration
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-semibold uppercase">University</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                Shri Vaishnav Vidyapeeth Vishwavidyalaya
              </p>
              <p className="text-slate-500 mt-0.5">Campus Code: SVVV-INDORE-01</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-400 text-[10px] font-semibold uppercase">Location</span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                Indore, Madhya Pradesh, India
              </p>
              <p className="text-emerald-800 font-medium mt-0.5">Connected to Neon Serverless DB</p>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Note: Calculations are calibrated for institutional estimation.</span>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Parameters Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Parameters</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Flame,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface WasteRule {
  id: string;
  itemName: string;
  aliases: string[];
  category: string;
  primaryBin: string;
  material: string;
  prepInstructions: string[];
  disposalLocation: string;
  isHazardous: boolean;
  hazardousWarning: string | null;
  requiresClarification: boolean;
  clarificationQuestion: string | null;
  clarificationOptions: any;
  searchKeywords: string[];
}

export default function CampusRulesPage() {
  const [rules, setRules] = useState<WasteRule[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBin, setSelectedBin] = useState<string>('ALL');
  const [hazardousOnly, setHazardousOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeRuleModal, setActiveRuleModal] = useState<WasteRule | null>(null);

  useEffect(() => {
    fetchRules();
  }, [searchQuery, selectedCategory, selectedBin]);

  const fetchRules = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory !== 'ALL') params.set('category', selectedCategory);
    if (selectedBin !== 'ALL') params.set('bin', selectedBin);

    fetch(`/api/waste/rules?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRules(data.rules);
        }
      })
      .catch(err => console.error('Error fetching rules', err))
      .finally(() => setLoading(false));
  };

  const getBinMeta = (binType: string) => {
    switch (binType) {
      case 'BLUE_RECYCLABLE':
        return {
          name: 'Blue Bin (Dry Recyclables)',
          shortName: 'Blue Bin',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'GREEN_ORGANIC':
        return {
          name: 'Green Bin (Wet / Organic)',
          shortName: 'Green Bin',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'RED_HAZARDOUS':
        return {
          name: 'Red Bin (Hazardous)',
          shortName: 'Red Bin',
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'YELLOW_EWASTE':
        return {
          name: 'Yellow Bin (E-Waste)',
          shortName: 'Yellow Bin',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'BLACK_LANDFILL':
      default:
        return {
          name: 'Black Bin (Landfill / General)',
          shortName: 'Black Bin',
          badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
        };
    }
  };

  const filteredRules = hazardousOnly
    ? rules.filter(r => r.isHazardous)
    : rules;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Official Campus Disposal Manual</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Searchable Campus Recycling Rules
        </h1>
        <p className="text-slate-600 text-xs md:text-sm max-w-3xl">
          Authorized waste disposal policies for Shri Vaishnav Vidyapeeth Vishwavidyalaya (SVVV) Indore.
          Every classification is verified against campus waste treatment partner protocols.
        </p>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items, materials, aliases (e.g. coffee cup, battery, pizza box, pet bottle)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          {/* Bin Filter Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedBin}
              onChange={(e) => setSelectedBin(e.target.value)}
              className="w-full md:w-auto px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">All Bins</option>
              <option value="BLUE_RECYCLABLE">🟦 Blue Bin (Recyclables)</option>
              <option value="GREEN_ORGANIC">🟩 Green Bin (Organic / Wet)</option>
              <option value="RED_HAZARDOUS">🟥 Red Bin (Hazardous)</option>
              <option value="YELLOW_EWASTE">🟨 Yellow Bin (E-Waste)</option>
              <option value="BLACK_LANDFILL">⬛ Black Bin (Landfill)</option>
            </select>

            {/* Hazardous Filter Toggle */}
            <button
              onClick={() => setHazardousOnly(!hazardousOnly)}
              className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                hazardousOnly
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Hazardous Items Only</span>
            </button>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'RECYCLABLE_DRY', label: 'Dry Recyclables' },
            { id: 'ORGANIC_WET', label: 'Wet Organic' },
            { id: 'HAZARDOUS', label: 'Hazardous Chemicals & Batteries' },
            { id: 'E_WASTE', label: 'Electronic Waste' },
            { id: 'LANDFILL_RESIDUAL', label: 'Landfill / Residual' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Loading campus recycling rules...
        </div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-500 space-y-2">
          <Info className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-sm">No campus rules match your search.</p>
          <p className="text-xs">Try searching for &quot;coffee cup&quot;, &quot;battery&quot;, &quot;can&quot;, or &quot;bottle&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => {
            const binMeta = getBinMeta(rule.primaryBin);
            return (
              <div
                key={rule.id}
                onClick={() => setActiveRuleModal(rule)}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-3xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-3 cursor-pointer group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${binMeta.badgeClass}`}>
                      {binMeta.shortName}
                    </span>

                    {rule.isHazardous && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-600" /> Hazard
                      </span>
                    )}

                    {rule.requiresClarification && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        Needs Clarification
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition">
                      {rule.itemName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Material: {rule.material}
                    </p>
                  </div>

                  {rule.hazardousWarning && (
                    <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] leading-snug">
                      <strong>Warning:</strong> {rule.hazardousWarning.substring(0, 100)}...
                    </div>
                  )}

                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Disposal Steps Preview:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      {rule.prepInstructions.slice(0, 2).map((step, idx) => (
                        <li key={idx} className="line-clamp-1">{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[11px] font-medium truncate max-w-[180px]">
                    📍 {rule.disposalLocation}
                  </span>
                  <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-1">
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Rule Modal */}
      {activeRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBinMeta(activeRuleModal.primaryBin).badgeClass}`}>
                  {getBinMeta(activeRuleModal.primaryBin).name}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {activeRuleModal.itemName}
                </h2>
                <p className="text-xs text-slate-500">
                  Material: {activeRuleModal.material}
                </p>
              </div>
              <button
                onClick={() => setActiveRuleModal(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full"
              >
                ✕
              </button>
            </div>

            {activeRuleModal.isHazardous && activeRuleModal.hazardousWarning && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-red-700">
                  <Flame className="w-4 h-4" /> CRITICAL HAZARDOUS ITEM
                </span>
                <p>{activeRuleModal.hazardousWarning}</p>
              </div>
            )}

            {activeRuleModal.requiresClarification && activeRuleModal.clarificationOptions && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Ambiguity / Clarification Rule:
                </span>
                <p className="text-slate-700">{activeRuleModal.clarificationQuestion}</p>
                <div className="space-y-1 pt-1">
                  {(activeRuleModal.clarificationOptions as any[]).map((opt) => (
                    <div key={opt.id} className="p-2 bg-white rounded-xl border border-amber-200/80 text-[11px]">
                      <strong>{opt.label}</strong> → {getBinMeta(opt.destinationBin).shortName} ({opt.note})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Preparation & Disposal Steps:
              </h4>
              <div className="space-y-1.5">
                {activeRuleModal.prepInstructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 space-y-0.5">
              <span className="font-bold text-slate-800">Designated Disposal Location:</span>
              <p>{activeRuleModal.disposalLocation}</p>
            </div>

            <button
              onClick={() => setActiveRuleModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Close Manual
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

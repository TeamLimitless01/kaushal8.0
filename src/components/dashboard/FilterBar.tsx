'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, Calendar, Building, X, RefreshCw, Zap, Droplets, Trash2, Layers } from 'lucide-react';
import { ResourceType } from '@prisma/client';

interface FilterBarProps {
  buildings: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string; buildingId: string }>;
  dateMin: string | null;
  dateMax: string | null;
  currentFilters: {
    startDate?: string;
    endDate?: string;
    buildingId?: string;
    roomId?: string;
    resourceType?: ResourceType;
  };
}

export default function FilterBar({
  buildings,
  rooms,
  dateMin,
  dateMax,
  currentFilters,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset room if building changes
    if (key === 'buildingId') {
      params.delete('roomId');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClearAll = () => {
    router.push(pathname);
  };

  const setPresetRange = (days: number | null) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    if (!days || !dateMax) {
      params.delete('startDate');
      params.delete('endDate');
    } else {
      const maxD = new Date(dateMax);
      const startD = new Date(maxD);
      startD.setDate(startD.getDate() - days);
      params.set('startDate', startD.toISOString().split('T')[0]);
      params.set('endDate', dateMax);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    Boolean(currentFilters.startDate) ||
    Boolean(currentFilters.endDate) ||
    Boolean(currentFilters.buildingId) ||
    Boolean(currentFilters.roomId) ||
    Boolean(currentFilters.resourceType);

  // Filter available rooms based on selected building
  const availableRooms = currentFilters.buildingId
    ? rooms.filter((r) => r.buildingId === currentFilters.buildingId)
    : rooms;

  return (
    <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4">
        {/* Resource Type Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => updateParam('resourceType', null)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              !currentFilters.resourceType
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>All Resources</span>
          </button>
          <button
            onClick={() => updateParam('resourceType', ResourceType.ELECTRICITY)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentFilters.resourceType === ResourceType.ELECTRICITY
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Electricity</span>
          </button>
          <button
            onClick={() => updateParam('resourceType', ResourceType.WATER)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentFilters.resourceType === ResourceType.WATER
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-cyan-700 hover:bg-cyan-50'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>Water</span>
          </button>
          <button
            onClick={() => updateParam('resourceType', ResourceType.WASTE)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              currentFilters.resourceType === ResourceType.WASTE
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Waste</span>
          </button>
        </div>

        {/* Dropdowns, Presets, and Date Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Date Presets */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-1 text-[11px] font-semibold text-slate-600">
            <button
              onClick={() => setPresetRange(null)}
              className="px-2 py-1 rounded-lg hover:bg-white hover:text-slate-900 transition cursor-pointer"
            >
              All Time
            </button>
            <button
              onClick={() => setPresetRange(30)}
              className="px-2 py-1 rounded-lg hover:bg-white hover:text-slate-900 transition cursor-pointer"
            >
              Last 30D
            </button>
            <button
              onClick={() => setPresetRange(7)}
              className="px-2 py-1 rounded-lg hover:bg-white hover:text-slate-900 transition cursor-pointer"
            >
              Last 7D
            </button>
          </div>

          {/* Building Selector */}
          <div className="relative min-w-[160px]">
            <select
              value={currentFilters.buildingId || ''}
              onChange={(e) => updateParam('buildingId', e.target.value || null)}
              className="w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
            >
              <option value="">All SVVV Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room Selector (enabled if building selected) */}
          {currentFilters.buildingId && (
            <div className="relative min-w-[140px]">
              <select
                value={currentFilters.roomId || ''}
                onChange={(e) => updateParam('roomId', e.target.value || null)}
                className="w-full text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-white border border-slate-200/90 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition cursor-pointer"
              >
                <option value="">All Rooms / Labs</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={currentFilters.startDate || ''}
              min={dateMin || undefined}
              max={dateMax || undefined}
              onChange={(e) => updateParam('startDate', e.target.value || null)}
              className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              title="Start Date"
            />
            <span className="text-slate-400 font-bold">→</span>
            <input
              type="date"
              value={currentFilters.endDate || ''}
              min={dateMin || undefined}
              max={dateMax || undefined}
              onChange={(e) => updateParam('endDate', e.target.value || null)}
              className="bg-transparent border-none text-xs font-medium text-slate-800 focus:outline-none cursor-pointer"
              title="End Date"
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

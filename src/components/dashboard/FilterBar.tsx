'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter, Calendar, Building, X, RefreshCw } from 'lucide-react';
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Resource Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 overflow-x-auto">
          <button
            onClick={() => updateParam('resourceType', null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              !currentFilters.resourceType
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => updateParam('resourceType', ResourceType.ELECTRICITY)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentFilters.resourceType === ResourceType.ELECTRICITY
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ⚡ Electricity
          </button>
          <button
            onClick={() => updateParam('resourceType', ResourceType.WATER)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentFilters.resourceType === ResourceType.WATER
                ? 'bg-white text-cyan-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            💧 Water
          </button>
          <button
            onClick={() => updateParam('resourceType', ResourceType.WASTE)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              currentFilters.resourceType === ResourceType.WASTE
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ♻️ Waste
          </button>
        </div>

        {/* Dropdowns & Date inputs */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Building Selector */}
          <div className="relative min-w-[150px]">
            <select
              value={currentFilters.buildingId || ''}
              onChange={(e) => updateParam('buildingId', e.target.value || null)}
              className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="">All Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room Selector (enabled if building selected) */}
          {currentFilters.buildingId && (
            <div className="relative min-w-[130px]">
              <select
                value={currentFilters.roomId || ''}
                onChange={(e) => updateParam('roomId', e.target.value || null)}
                className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white cursor-pointer"
              >
                <option value="">All Rooms</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range Inputs */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={currentFilters.startDate || ''}
              min={dateMin || undefined}
              max={dateMax || undefined}
              onChange={(e) => updateParam('startDate', e.target.value || null)}
              className="bg-transparent border-none text-xs text-slate-700 focus:outline-none"
              title="Start Date"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={currentFilters.endDate || ''}
              min={dateMin || undefined}
              max={dateMax || undefined}
              onChange={(e) => updateParam('endDate', e.target.value || null)}
              className="bg-transparent border-none text-xs text-slate-700 focus:outline-none"
              title="End Date"
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
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

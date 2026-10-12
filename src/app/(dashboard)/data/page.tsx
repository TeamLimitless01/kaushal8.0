'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  Building,
  Loader2,
  FileText,
} from 'lucide-react';
import { ResourceType } from '@prisma/client';

interface ResourceRecord {
  id: string;
  date: string;
  building: string;
  room: string;
  resource: ResourceType;
  usage: number;
  unit: string;
  operatingHours: number | null;
  importFile: string;
}

export default function DataExplorerPage() {
  const [records, setRecords] = useState<ResourceRecord[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('recordedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Buildings list for dropdown
  const [buildings, setBuildings] = useState<Array<{ id: string; name: string }>>([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        search,
        buildingId: buildingFilter,
        resourceType: resourceFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });

      const res = await fetch(`/api/data?${params.toString()}`);
      const data = await res.json();

      setRecords(data.records || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalRecords(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, buildingFilter, resourceFilter, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch buildings list for filter
  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => {
        if (d.filterOptions?.buildings) {
          setBuildings(d.filterOptions.buildings);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleExportCsv = () => {
    if (records.length === 0) return;
    const header = 'Date,Building,Room,Resource,Usage,Unit,Operating Hours,Source Import\n';
    const rows = records
      .map(
        (r) =>
          `"${r.date}","${r.building}","${r.room}","${r.resource}",${r.usage},"${r.unit}",${r.operatingHours || 8},"${r.importFile}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosentinel-data-export-page-${page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Resource Data Explorer
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Server-side paginated telemetry query interface ({totalRecords.toLocaleString()} total normalized observations)
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={records.length === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-xs cursor-pointer disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Current View</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search building, lab, room..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* Building Dropdown */}
          <div>
            <select
              value={buildingFilter}
              onChange={(e) => {
                setBuildingFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="">All Campus Buildings</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Dropdown */}
          <div>
            <select
              value={resourceFilter}
              onChange={(e) => {
                setResourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white cursor-pointer"
            >
              <option value="">All Resource Types</option>
              <option value="ELECTRICITY">⚡ Electricity</option>
              <option value="WATER">💧 Water</option>
              <option value="WASTE">♻️ Waste</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              placeholder="From Date"
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              placeholder="To Date"
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th
                  onClick={() => {
                    setSortBy('recordedDate');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Recorded Date</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Building</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Room / Zone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Resource</th>
                <th
                  onClick={() => {
                    setSortBy('usage');
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  }}
                  className="px-4 py-3 text-left font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                >
                  <div className="flex items-center gap-1">
                    <span>Usage Value</span>
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Unit</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Operating Hours</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Source Import</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading campus records from PostgreSQL...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No resource records match the selected filters
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-2.5 font-medium text-slate-900">{r.date}</td>
                    <td className="px-4 py-2.5 text-slate-800 font-semibold">{r.building}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.room}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          r.resource === 'ELECTRICITY'
                            ? 'bg-emerald-50 text-emerald-800'
                            : r.resource === 'WATER'
                            ? 'bg-cyan-50 text-cyan-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {r.resource}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-bold text-slate-900">
                      {r.usage.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 font-mono">{r.unit}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {r.operatingHours !== null ? `${r.operatingHours} hrs` : '8 hrs'}
                    </td>
                    <td className="px-4 py-2.5 text-slate-400 text-[11px] truncate max-w-[140px]">
                      {r.importFile}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <strong>{(page - 1) * pageSize + 1}</strong> to{' '}
            <strong>{Math.min(page * pageSize, totalRecords)}</strong> of{' '}
            <strong>{totalRecords.toLocaleString()}</strong> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1 || isLoading}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800 px-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages || isLoading}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

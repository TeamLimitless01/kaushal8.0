'use client';

import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Sparkles,
  Coins,
  RefreshCw,
  Search,
  AlertCircle,
  Eye,
  X,
  User,
  ShieldCheck,
  Filter,
} from 'lucide-react';

interface AdminReport {
  id: string;
  studentName: string;
  studentEmail: string;
  detectedItem: string;
  category: string;
  primaryBin: string;
  imageUrl: string | null;
  confidenceScore: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointsProposed: number;
  pointsAwarded: number;
  location: string;
  notes: string;
  aiSuggestion: string;
  adminNote: string;
  createdAt: string;
}

export default function AdminReportsReviewPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filter]);

  const handleAction = async (reportId: string, action: 'APPROVE' | 'REJECT', points?: number) => {
    setActionLoading(reportId);
    try {
      const res = await fetch('/api/admin/reports/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, points }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh local list
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId
              ? {
                ...r,
                status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
                pointsAwarded: action === 'APPROVE' ? points || r.pointsProposed : 0,
              }
              : r
          )
        );
      } else {
        alert(data.error || 'Failed to update report');
      }
    } catch (err) {
      console.error('Action error', err);
      alert('Error updating report status.');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;

  const filteredReports = reports.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q) ||
      r.detectedItem.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Admin Verification Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Student Reports & Queries Review
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Inspect student-submitted litter photos. Verify genuine cleanup queries, review AI suggestions, and approve to award EcoPoints.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
              Pending Review
            </span>
            <span className="text-xl font-black text-amber-900">{pendingCount}</span>
          </div>
          <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Approved
            </span>
            <span className="text-xl font-black text-emerald-900">{approvedCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Filters & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl transition cursor-pointer capitalize ${filter === tab
                ? 'bg-white text-slate-900 shadow-xs font-black'
                : 'hover:text-slate-900'
                }`}
            >
              {tab === 'PENDING'
                ? `Pending (${pendingCount})`
                : tab === 'APPROVED'
                  ? 'Approved'
                  : tab === 'REJECTED'
                    ? 'Rejected'
                    : 'All'}
            </button>
          ))}
        </div>

        {/* Search & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 sm:w-60"
            />
          </div>

          <button
            onClick={loadReports}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3. Report Cards List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading student submissions...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No {filter.toLowerCase()} submissions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All student reports in this filter category have been processed or no new entries exist.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((report) => {
            const isPending = report.status === 'PENDING';
            const isApproved = report.status === 'APPROVED';
            const isActionBusy = actionLoading === report.id;

            return (
              <div
                key={report.id}
                className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  {/* Top Row: Student info & Status Pill */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
                        <User className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {report.studentName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{report.studentEmail}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isPending
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                        }`}
                    >
                      {report.status}
                    </span>
                  </div>

                  {/* Middle Content: Image & Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-4">
                    {/* Left: Image Thumbnail (5 cols) */}
                    <div className="sm:col-span-5 relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 flex items-center justify-center border border-slate-200">
                      {report.imageUrl ? (
                        <div
                          onClick={() => setPreviewImage(report.imageUrl)}
                          className="w-full h-full cursor-pointer group relative"
                        >
                          <img
                            src={report.imageUrl}
                            alt="Waste submission"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                            <Eye className="w-4 h-4" /> Enlarge
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-slate-400 text-xs">
                          No Photo Provided
                        </div>
                      )}
                    </div>

                    {/* Right: Info (7 cols) */}
                    <div className="sm:col-span-7 space-y-2.5 text-xs">
                      {/* Location */}
                      <div className="flex items-start gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{report.location}</span>
                      </div>

                      {/* AI Detection */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-semibold">AI Detection:</span>
                          <span className="font-bold text-slate-900">{report.detectedItem}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-semibold">Recommended:</span>
                          <span className="font-bold text-emerald-700">
                            {report.primaryBin.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Student Query / Notes if any */}
                      {report.notes && (
                        <div className="text-[11px] text-slate-600 bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                          <span className="font-bold text-amber-900">Student Note: </span>
                          <span>&ldquo;{report.notes}&rdquo;</span>
                        </div>
                      )}

                      {/* Points Proposed */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="text-slate-500 font-semibold">Reward Points:</span>
                        <span className="font-black text-amber-600 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          <span>
                            {isApproved
                              ? `+${report.pointsAwarded} pts credited`
                              : `+${report.pointsProposed} pts proposed`}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Actions (Approve / Reject) */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2.5">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleAction(report.id, 'APPROVE', report.pointsProposed)}
                        disabled={isActionBusy}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isActionBusy ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>Approve (+{report.pointsProposed} pts)</span>
                      </button>

                      <button
                        onClick={() => handleAction(report.id, 'REJECT')}
                        disabled={isActionBusy}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-right text-[11px] text-slate-600 font-medium">
                      Status: <strong>{report.status}</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-2 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Full preview"
              className="w-full h-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}

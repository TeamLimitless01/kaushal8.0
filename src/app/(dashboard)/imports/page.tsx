'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  FileText,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UploadCloud,
  Layers,
  ArrowRight,
  Database,
} from 'lucide-react';

interface ImportItem {
  id: string;
  fileName: string;
  createdAt: string;
  dateFrom: string | null;
  dateTo: string | null;
  rowCount: number;
  validRowCount: number;
  invalidRowCount: number;
  insertedCount: number;
  updatedCount: number;
  skippedCount: number;
  status: 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'PARTIAL';
  cloudinaryUrl: string | null;
  publicId: string | null;
  uploadedBy: string;
  usagesLinked: number;
}

export default function ImportsPage() {
  const [imports, setImports] = useState<ImportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchImports = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/imports');
      const data = await res.json();
      setImports(data.imports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  const handleDelete = async (importId: string, fileName: string) => {
    if (
      !confirm(
        `Are you sure you want to safely delete "${fileName}" and all telemetry records imported under this batch?`
      )
    ) {
      return;
    }

    setDeletingId(importId);
    try {
      const res = await fetch(`/api/imports?id=${importId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete import');
      await fetchImports();
    } catch (err) {
      alert('Error deleting import batch');
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Import History & Audit Log
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of historical CSV uploads, normalization jobs, Cloudinary file references, and deduplication states.
          </p>
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Dataset</span>
        </Link>
      </div>

      {/* Main Imports List Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">File & Batch</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Upload Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Coverage Range</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Rows Ingested</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Deduplication Stats</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Cloudinary Archive</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    <span>Loading import logs...</span>
                  </td>
                </tr>
              ) : imports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No import batches found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload your first campus dataset to start building intelligence.
                    </p>
                    <Link
                      href="/upload"
                      className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                    >
                      Go to Upload Wizard
                    </Link>
                  </td>
                </tr>
              ) : (
                imports.map((imp) => (
                  <tr key={imp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{imp.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            By {imp.uploadedBy}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {imp.createdAt.split('T')[0]}
                    </td>

                    <td className="px-4 py-3 font-medium text-slate-700">
                      {imp.dateFrom && imp.dateTo ? `${imp.dateFrom} → ${imp.dateTo}` : 'N/A'}
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-bold text-slate-900">
                        {imp.validRowCount.toLocaleString()}
                      </span>
                      <span className="text-slate-400 text-[11px]"> / {imp.rowCount} total</span>
                    </td>

                    <td className="px-4 py-3 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-600">
                        <span className="text-emerald-800 font-medium">+{imp.insertedCount} new</span>
                        <span className="text-blue-800 font-medium">↻ {imp.updatedCount} updated</span>
                        <span className="text-slate-500 font-medium">{imp.skippedCount} skipped</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {imp.cloudinaryUrl ? (
                        <a
                          href={imp.cloudinaryUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 underline"
                        >
                          <span>Raw CSV</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">Stored Locally</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          imp.status === 'COMPLETED'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : imp.status === 'PARTIAL'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {imp.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(imp.id, imp.fileName)}
                        disabled={deletingId === imp.id}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer disabled:opacity-50"
                        title="Safely Delete Batch & Associated Records"
                      >
                        {deletingId === imp.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

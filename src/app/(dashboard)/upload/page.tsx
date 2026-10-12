'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  ArrowLeft,
  Calendar,
  Building,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { CsvParseResult, CsvValidationError, CsvValidationWarning } from '@/lib/csv/parser';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing campus state
  const [existingStats, setExistingStats] = useState<{
    dateFrom: string | null;
    dateTo: string | null;
    lastImportDate: string | null;
    totalImports: number;
  }>({ dateFrom: null, dateTo: null, lastImportDate: null, totalImports: 0 });

  // Wizard state: 1 = File Selection, 2 = Preview & Validation, 3 = Ingestion
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [rawCsvText, setRawCsvText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewData, setPreviewData] = useState<CsvParseResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch existing imports metadata on mount
  useEffect(() => {
    fetch('/api/imports')
      .then((res) => res.json())
      .then((data) => {
        if (data.imports && data.imports.length > 0) {
          const first = data.imports[0];
          setExistingStats({
            dateFrom: first.dateFrom,
            dateTo: first.dateTo,
            lastImportDate: first.createdAt ? first.createdAt.split('T')[0] : null,
            totalImports: data.imports.length,
          });
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = async (selectedFile: File) => {
    setErrorMessage(null);
    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      setErrorMessage('Please select a valid CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      setRawCsvText(text);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/upload/preview', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse CSV');
      }

      setPreviewData(data);
      setStep(2);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Error validating CSV');
    } finally {
      setIsProcessing(false);
    }
  };

  // 1-Click Sample loader for Hackathon Evaluation
  const handleLoadSample = async (sampleType: 'october' | 'additional') => {
    setErrorMessage(null);
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/samples/load?type=${sampleType}`);
      const data = await res.json();
      if (!data.csvContent) throw new Error('Could not load sample file');

      const sampleBlob = new Blob([data.csvContent], { type: 'text/csv' });
      const sampleFile = new File([sampleBlob], data.fileName, { type: 'text/csv' });
      await handleFileSelected(sampleFile);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to load sample');
      setIsProcessing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData || !file) return;

    setIsConfirming(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          validRows: previewData.validRows,
          totalRows: previewData.totalRows,
          csvContent: rawCsvText,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete import');
      }

      // Success! Redirect to dashboard with notification
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to import dataset');
      setIsConfirming(false);
    }
  };

  const handleDownloadErrorReport = () => {
    if (!previewData || previewData.errors.length === 0) return;
    const header = 'Row Number,Column,Actual Value,Error Reason,Suggestion\n';
    const rows = previewData.errors
      .map(
        (e) =>
          `"${e.rowNumber}","${e.column}","${e.value.replace(/"/g, '""')}","${e.message.replace(
            /"/g,
            '""'
          )}","${e.suggestion || ''}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-errors-${file?.name || 'report'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Context & Merge Policy Banner (Section 25) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Campus Resource Data Ingestion
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Normalize and store historical sub-meter telemetry in PostgreSQL
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Existing Dataset:</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
              {existingStats.dateFrom && existingStats.dateTo
                ? `${existingStats.dateFrom} → ${existingStats.dateTo}`
                : 'No existing imports'}
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-emerald-900 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/60">
          <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Smart Merge Protocol:</strong> New datasets are merged with existing campus data. Existing matching records on the same date and room are updated instead of duplicated.
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
          <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Import Warning</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* STEP 1: Upload Dropzone & Sample Buttons */}
      {step === 1 && (
        <div className="space-y-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-3xl p-10 bg-white text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[260px] shadow-xs group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelected(e.target.files[0]);
                }
              }}
            />

            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-105 transition shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h4 className="text-base font-bold text-slate-900 mt-4">
              Drag & drop your CSV file here
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              or browse from your local file system (maximum file size 15 MB)
            </p>

            <button
              type="button"
              className="mt-5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              Browse Files
            </button>
          </div>

          {/* Action helpers: Download template & 1-Click Samples */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Helper 1: Template */}
            <a
              href="/api/template/download"
              download
              className="p-4 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-3 hover:border-slate-300 transition shadow-xs"
            >
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600">
                <Download className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">CSV Template</p>
                <p className="text-[11px] text-slate-500">Download formatted schema</p>
              </div>
            </a>

            {/* Helper 2: 1-Click 30-Day SVVV Dataset */}
            <button
              onClick={() => handleLoadSample('october')}
              disabled={isProcessing}
              className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center gap-3 hover:bg-emerald-100/60 transition shadow-xs text-left cursor-pointer disabled:opacity-60"
            >
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Load SVVV 30-Day Dataset</p>
                <p className="text-[11px] text-emerald-700">1,440 records with anomalies</p>
              </div>
            </button>

            {/* Helper 3: Overlapping Dataset (Merge test) */}
            <button
              onClick={() => handleLoadSample('additional')}
              disabled={isProcessing}
              className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center gap-3 hover:bg-blue-100/60 transition shadow-xs text-left cursor-pointer disabled:opacity-60"
            >
              <div className="p-2.5 bg-blue-100 rounded-xl text-blue-700">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Load Overlapping Merge CSV</p>
                <p className="text-[11px] text-blue-700">Test deduplication update</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Preview & Validation Inspection (Section 11 & 12) */}
      {step === 2 && previewData && (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Import Dataset Preview
                  </h4>
                  <p className="text-xs text-slate-500">File: {previewData.fileName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={isConfirming || previewData.validRows.length === 0}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting into PostgreSQL...</span>
                    </>
                  ) : (
                    <>
                      <span>Import {previewData.summary.validCount.toLocaleString()} Valid Records</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validation Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Rows Detected</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {previewData.totalRows.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase">Valid Rows</p>
                <p className="text-base font-bold text-emerald-800 mt-0.5">
                  {previewData.summary.validCount.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200/70">
                <p className="text-[10px] font-semibold text-red-600 uppercase">Invalid Rows</p>
                <p className="text-base font-bold text-red-700 mt-0.5">
                  {previewData.summary.invalidCount.toLocaleString()}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70">
                <p className="text-[10px] font-semibold text-amber-700 uppercase">Warnings</p>
                <p className="text-base font-bold text-amber-800 mt-0.5">
                  {previewData.warnings.length}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Date Range</p>
                <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {previewData.summary.dateFrom || 'N/A'} → {previewData.summary.dateTo || 'N/A'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                <p className="text-[10px] font-semibold text-slate-500 uppercase">Buildings</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">
                  {previewData.summary.buildingCount}
                </p>
              </div>
            </div>

            {/* Errors breakdown if any */}
            {previewData.errors.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Row Validation Errors ({previewData.errors.length})</span>
                  </div>
                  <button
                    onClick={handleDownloadErrorReport}
                    className="text-xs font-semibold text-red-700 underline hover:text-red-900 cursor-pointer"
                  >
                    Download Error CSV Report
                  </button>
                </div>
                <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs text-red-700 pr-2">
                  {previewData.errors.slice(0, 10).map((err, idx) => (
                    <div key={idx} className="p-2 bg-white/70 rounded-lg border border-red-200">
                      <strong>Row {err.rowNumber}:</strong> Column <code>{err.column}</code> had value{' '}
                      <code>&quot;{err.value}&quot;</code>. {err.message}.
                    </div>
                  ))}
                  {previewData.errors.length > 10 && (
                    <p className="text-[11px] text-red-600 font-medium">
                      + {previewData.errors.length - 10} more rows with errors
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* First 50 Rows Preview Table */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3">
              Dataset Rows Preview (First 50 Rows)
            </h5>

            <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Row</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Date</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Building</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Room</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Resource</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Usage</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Unit</th>
                    <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {previewData.previewRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="px-3 py-2 font-mono text-slate-400">
                        {String(row._rowNumber)}
                      </td>
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {String(row.date)}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {String(row.building)}
                      </td>
                      <td className="px-3 py-2 text-slate-700">
                        {String(row.room)}
                      </td>
                      <td className="px-3 py-2 font-semibold">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] ${String(row.resource).toLowerCase().includes('elec')
                              ? 'bg-emerald-50 text-emerald-800'
                              : String(row.resource).toLowerCase().includes('water')
                                ? 'bg-cyan-50 text-cyan-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                        >
                          {String(row.resource)}
                        </span>
                      </td>
                      <td className="px-3 py-2 font-bold text-slate-900">
                        {String(row.usage)}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {String(row.unit)}
                      </td>
                      <td className="px-3 py-2 text-slate-500">
                        {String(row.operating_hours)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  Zap,
  Droplets,
  Trash2,
  TrendingUp,
  AlertTriangle,
  IndianRupee,
  Leaf,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OnboardingEmptyState({
  onSampleImportSuccess,
}: {
  onSampleImportSuccess?: () => void;
}) {
  const router = useRouter();
  const [isImportingSample, setIsImportingSample] = useState(false);

  const handle1ClickSampleImport = async () => {
    try {
      setIsImportingSample(true);
      // Fetch sample CSV content
      const sampleRes = await fetch('/api/samples/load?type=october');
      const sampleData = await sampleRes.json();

      if (!sampleData.csvContent) {
        throw new Error('Could not load sample data');
      }

      // Preview & parse sample
      const formData = new FormData();
      const sampleBlob = new Blob([sampleData.csvContent], { type: 'text/csv' });
      formData.append('file', sampleBlob, sampleData.fileName);

      const previewRes = await fetch('/api/upload/preview', {
        method: 'POST',
        body: formData,
      });
      const previewData = await previewRes.json();

      // Confirm import
      const confirmRes = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: sampleData.fileName,
          validRows: previewData.rawValidRows,
          totalRows: previewData.totalRows,
          csvContent: sampleData.csvContent,
        }),
      });

      if (!confirmRes.ok) {
        throw new Error('Failed to import sample');
      }

      if (onSampleImportSuccess) {
        onSampleImportSuccess();
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert('Error loading sample dataset. Please use the Upload page.');
    } finally {
      setIsImportingSample(false);
    }
  };

  const checklistItems = [
    { icon: Zap, text: 'Energy insights (kWh consumption across campus blocks)' },
    { icon: Droplets, text: 'Water insights (storage & distribution monitoring)' },
    { icon: Trash2, text: 'Waste generation tracking & diversion analytics' },
    { icon: TrendingUp, text: 'Historical consumption trends & baseline modelling' },
    { icon: AlertTriangle, text: 'Statistical anomaly detection (mean + std deviation)' },
    { icon: IndianRupee, text: 'Utility cost estimates & savings opportunities' },
    { icon: Leaf, text: 'Carbon footprint (CO₂) calculation & reduction' },
    { icon: Sparkles, text: 'Campus Sustainability Score rating' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
        {/* Soft ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl mb-5 shadow-xs">
          <Leaf className="w-8 h-8 text-emerald-600" />
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Welcome to EcoSentinel
        </h2>
        <p className="mt-3 text-base text-slate-600 max-w-xl mx-auto">
          Start understanding your campus resource consumption. Upload your SVVV historical resource dataset to unlock live intelligence.
        </p>

        {/* Value Proposition Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto bg-slate-50/80 p-6 rounded-2xl border border-slate-200/60">
          {checklistItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/api/template/download"
            download
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-400 transition shadow-xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Download CSV Template</span>
          </a>

          <Link
            href="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm shadow-emerald-600/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload CSV Dataset</span>
          </Link>

          {/* 1-Click Demo Sample Button */}
          <button
            onClick={handle1ClickSampleImport}
            disabled={isImportingSample}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-sm font-semibold hover:bg-emerald-100 transition shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isImportingSample ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Ingesting SVVV Dataset...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>1-Click Load SVVV Sample Data</span>
              </>
            )}
          </button>
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Supports multi-building historical data for Electricity (kWh), Water (L), and Waste (kg)
        </p>
      </div>
    </div>
  );
}

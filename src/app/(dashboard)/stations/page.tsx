'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  QrCode,
  ExternalLink,
  ShieldCheck,
  Battery,
  SlidersHorizontal,
  Layers,
  Camera,
  CheckCircle2,
  Navigation
} from 'lucide-react';

interface WasteStation {
  id: string;
  name: string;
  location: string;
  availableBins: string[];
  hasEwasteDrop: boolean;
  hasBatteryDrop: boolean;
  qrCodeData: string;
}

export default function CampusStationsPage() {
  const [stations, setStations] = useState<WasteStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<WasteStation | null>(null);

  useEffect(() => {
    fetch('/api/waste/stations')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStations(data.stations);
        }
      })
      .catch(err => console.error('Failed to load stations', err))
      .finally(() => setLoading(false));
  }, []);

  const getBinBadge = (bin: string) => {
    switch (bin) {
      case 'BLUE_RECYCLABLE':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">🟦 Blue Dry</span>;
      case 'GREEN_ORGANIC':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">🟩 Green Wet</span>;
      case 'RED_HAZARDOUS':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">🟥 Red Hazard</span>;
      case 'YELLOW_EWASTE':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">🟨 Yellow E-Waste</span>;
      case 'BLACK_LANDFILL':
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200 text-slate-800 border border-slate-300">⬛ Black General</span>;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm space-y-2">
        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
          <QrCode className="w-4 h-4" />
          <span>SVVV Campus Infrastructure</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Campus Waste Stations & Station QR Codes
        </h1>
        <p className="text-slate-600 text-xs md:text-sm max-w-3xl">
          Physical waste sorting points placed across SVVV Indore. Scan or click any station to open the AI Waste Classifier pre-configured with that station&apos;s available bins and nearby drop-off alternatives.
        </p>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">
          Loading campus waste stations...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stations.map((st) => (
            <div
              key={st.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {st.id}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-lg mt-1">
                      {st.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {st.location}
                    </p>
                  </div>

                  {/* QR Code Icon / View Trigger */}
                  <button
                    onClick={() => setSelectedStation(st)}
                    className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-2xl border border-slate-200 transition shrink-0 cursor-pointer"
                    title="View Station QR Code"
                  >
                    <QrCode className="w-6 h-6 text-slate-800" />
                  </button>
                </div>

                {/* Available Bins */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Available Quad Bins at Station:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {st.availableBins.map((bin) => (
                      <span key={bin}>{getBinBadge(bin)}</span>
                    ))}
                  </div>
                </div>

                {/* Special Drops Capabilities */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
                  {st.hasBatteryDrop && (
                    <span className="flex items-center gap-1 text-red-700 font-semibold bg-red-50 px-2 py-1 rounded-lg border border-red-200 text-[11px]">
                      <Battery className="w-3.5 h-3.5 text-red-600" /> Battery Drop Box
                    </span>
                  )}
                  {st.hasEwasteDrop && (
                    <span className="flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 text-[11px]">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" /> E-Waste Kiosk
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedStation(st)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Show QR Poster</span>
                </button>

                <Link
                  href={`/scan?station=${st.id}`}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scan at this Station</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Poster Modal */}
      {selectedStation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 font-mono">
                {selectedStation.id}
              </span>
              <button
                onClick={() => setSelectedStation(null)}
                className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base">
                {selectedStation.name}
              </h3>
              <p className="text-xs text-slate-500">
                {selectedStation.location}
              </p>
            </div>

            {/* Generated QR Code Graphical Visualization */}
            <div className="p-4 bg-slate-50 border-2 border-dashed border-emerald-500/50 rounded-2xl flex flex-col items-center justify-center space-y-2">
              <div className="w-44 h-44 bg-white p-3 rounded-xl shadow-inner border border-slate-200 flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="5" width="20" height="20" fill="white" />
                  <rect x="9" y="9" width="12" height="12" fill="currentColor" />

                  <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                  <rect x="75" y="5" width="20" height="20" fill="white" />
                  <rect x="79" y="9" width="12" height="12" fill="currentColor" />

                  <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                  <rect x="5" y="75" width="20" height="20" fill="white" />
                  <rect x="9" y="79" width="12" height="12" fill="currentColor" />

                  {/* QR Data Pattern */}
                  <rect x="38" y="10" width="8" height="8" fill="currentColor" />
                  <rect x="52" y="10" width="8" height="8" fill="currentColor" />
                  <rect x="38" y="24" width="8" height="8" fill="currentColor" />
                  <rect x="10" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="24" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="42" width="16" height="16" fill="currentColor" />
                  <rect x="70" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="84" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="70" width="8" height="8" fill="currentColor" />
                  <rect x="56" y="70" width="8" height="8" fill="currentColor" />
                  <rect x="70" y="70" width="8" height="8" fill="currentColor" />
                  <rect x="84" y="84" width="8" height="8" fill="currentColor" />
                </svg>
              </div>
              <span className="text-[10px] font-mono text-slate-500 break-all">
                {selectedStation.qrCodeData}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 leading-snug">
              Print this station QR code placard and place on bin headers. Students scanning this code launch the classifier with this station&apos;s available bins.
            </p>

            <Link
              href={`/scan?station=${selectedStation.id}`}
              onClick={() => setSelectedStation(null)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
            >
              <Camera className="w-4 h-4" />
              <span>Launch Scanner for this Station</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

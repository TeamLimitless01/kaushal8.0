'use client';

import React from 'react';
import Link from 'next/link';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import {
  Leaf,
  ShieldCheck,
  Zap,
  Droplets,
  Trash2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Database,
  Sliders,
  Sparkles,
  Building2,
  Lock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#021a12] text-white">
      {/* Dynamic Animated WebGL Shader Background */}
      <WebGLShader />

      {/* Top Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/30 backdrop-blur-md border border-emerald-500/40 rounded-2xl text-emerald-400 shadow-lg shadow-emerald-950/50">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              EcoSentinel
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MVP 8.0
              </span>
            </span>
            <p className="text-[11px] text-emerald-300/80 font-medium tracking-wide">
              AI Campus Resource Intelligence
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-emerald-100/80">
          <a href="#features" className="hover:text-emerald-300 transition">
            Platform Capabilities
          </a>
          <a href="#architecture" className="hover:text-emerald-300 transition">
            Data Architecture
          </a>
          <a href="#svvv" className="hover:text-emerald-300 transition">
            SVVV Campus
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Sign In</span>
          </Link>
          <Link href="/dashboard">
            <LiquidButton
              className="text-white border border-emerald-400/40 bg-emerald-600/30 backdrop-blur-md hover:bg-emerald-600/50 text-xs font-bold rounded-xl"
              size="default"
            >
              <span>Launch Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </LiquidButton>
          </Link>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Campus Live Pulse Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 backdrop-blur-md mb-6 shadow-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-300">
            Shri Vaishnav Vidyapeeth Vishwavidyalaya • Live Intelligence
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
          See where resources <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-100 to-teal-300 bg-clip-text text-transparent">
            are being wasted.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-emerald-100/70 max-w-2xl font-normal leading-relaxed">
          EcoSentinel normalizes historical sub-meter telemetry into high-precision energy, water, and waste analytics with statistical anomaly detection and verifiable CO₂ reduction.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard">
            <LiquidButton
              className="w-full sm:w-auto text-white border border-emerald-400/50 bg-emerald-500/30 backdrop-blur-md px-8 py-3.5 rounded-full font-bold text-sm tracking-wide shadow-2xl shadow-emerald-500/20"
              size="xl"
            >
              <span>Explore Campus Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </LiquidButton>
          </Link>

          <Link
            href="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs font-semibold text-emerald-100 hover:text-white bg-black/40 hover:bg-black/60 border border-emerald-500/30 backdrop-blur-md transition shadow-md"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Upload New CSV Dataset</span>
          </Link>
        </div>

        {/* Live Metrics Quick Row */}
        <div className="mt-14 w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Monitored Load
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">30,240+ kWh</p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Historical telemetry</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md text-left">
            <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
              Water Distributed
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">4.9L+ Liters</p>
            <p className="text-[11px] text-cyan-200/60 mt-0.5">Hostels & libraries</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md text-left">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Anomalies Flagged
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">Mean + 1.8σ</p>
            <p className="text-[11px] text-amber-200/60 mt-0.5">Statistical baseline</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md text-left">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              Campus Facilities
            </span>
            <p className="text-xl sm:text-2xl font-black text-white mt-1">7 Blocks</p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">SVVV Indore Core</p>
          </div>
        </div>

        {/* Core Capabilities Grid */}
        <div id="features" className="mt-16 w-full text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-300">
              Core Intelligence Engines
            </h2>
            <span className="text-xs text-white/50">Production Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit">
                <AlertTriangle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mt-3">
                Statistical Anomaly Engine
              </h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Calculates rolling sample standard deviation over 7+ historical observations to catch abnormal surges in Block B labs and library water circuits.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit">
                <Sliders className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mt-3">
                What-If Scenario Simulator
              </h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                Live interactive load-reduction slider projecting financial cost savings in INR, CEA grid carbon offset, and mature tree equivalents.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md hover:border-emerald-500/40 transition">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mt-3">
                Non-Destructive Ingestion
              </h3>
              <p className="text-xs text-white/60 mt-1 leading-relaxed">
                PostgreSQL composite unique constraints ensure multiple CSV uploads merge seamlessly over time without duplicating or corrupting date records.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full border-t border-white/10 bg-black/50 backdrop-blur-md py-6 px-6 text-center text-xs text-emerald-100/50 flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-4">
        <p>
          EcoSentinel © 2026 • Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore
        </p>
        <div className="flex items-center gap-4 text-emerald-300/80">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <Link href="/upload" className="hover:underline">Upload CSV</Link>
          <Link href="/login" className="hover:underline">Admin Login</Link>
        </div>
      </footer>
    </div>
  );
}

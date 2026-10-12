'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton, MetalButton } from '@/components/ui/liquid-glass-button';
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
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Layers,
  Cpu,
  Activity,
  FileCheck,
  Server,
  Clock,
  ArrowUpRight,
  Check,
  RefreshCw,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'simulation'>('overview');
  const [selectedCircuit, setSelectedCircuit] = useState<'blockB' | 'library' | 'workshop'>('blockB');
  const [simReduction, setSimReduction] = useState<number>(15);

  // Dynamic What-If Math calculations based on 30-day baseline of 30,240 kWh
  const baseKwh = 30240;
  const tariffKwh = 8.5; // INR / kWh
  const ceaFactor = 0.82; // kg CO2e / kWh
  const treeFactor = 22.0; // kg CO2e absorbed by 1 mature tree / year

  const savedKwh = Math.round(baseKwh * (simReduction / 100));
  const savedCost = Math.round(savedKwh * tariffKwh);
  const savedCo2Mt = Number(((savedKwh * ceaFactor) / 1000).toFixed(2));
  const savedTrees = Math.round((savedKwh * ceaFactor) / treeFactor);

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-transparent text-white selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Animated WebGL Shader Background */}
      <WebGLShader />

      {/* Ambient Gradient Glow Accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-emerald-500/15 blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-0 w-[700px] h-[450px] bg-teal-500/15 blur-[140px] pointer-events-none z-0" />

      {/* Top Navigation */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/20 backdrop-blur-xl border border-emerald-400/30 rounded-2xl text-emerald-400 shadow-xl shadow-emerald-950/60 ring-1 ring-emerald-500/20">
            <Leaf className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                EcoSentinel
              </span>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                v8.0 Live
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium tracking-wide">
              AI Campus Resource Intelligence
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-emerald-100/70">
          <a href="#macro-telemetry" className="hover:text-emerald-300 transition-colors">
            Infrastructure Telemetry
          </a>
          <a href="#anomaly-engine" className="hover:text-emerald-300 transition-colors">
            Statistical Outliers
          </a>
          <a href="#data-governance" className="hover:text-emerald-300 transition-colors">
            Data Architecture
          </a>
          <a href="#interactive-preview" className="hover:text-emerald-300 transition-colors">
            Live Preview
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white bg-white/5 hover:bg-white/10 border border-emerald-500/20 backdrop-blur-md transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Sign In</span>
          </Link>
          <Link href="/dashboard">
            <LiquidButton
              className="text-white border border-emerald-400/50 bg-emerald-600/30 backdrop-blur-md hover:bg-emerald-600/50 text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40"
              size="default"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </LiquidButton>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-20 w-full max-w-6xl mx-auto px-6 py-12 md:py-16 flex flex-col items-center text-center">
        {/* Campus Live Pulse Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-xl mb-6 shadow-2xl ring-1 ring-emerald-500/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-emerald-300 tracking-wide">
            Shri Vaishnav Vidyapeeth Vishwavidyalaya • Live Telemetry Stream
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-white">
          Design is <span className="text-emerald-400">Everything.</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Sustainability is Future.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-emerald-100/80 max-w-3xl font-normal leading-relaxed">
          EcoSentinel transforms raw campus energy, water, and waste sub-meter telemetry into enterprise-grade intelligence — featuring ISO 50001 compliance standards, statistical anomaly radar (mean + 1.8σ), and non-destructive Neon PostgreSQL ingestion.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard">
            <LiquidButton
              className="w-full sm:w-auto text-white border border-emerald-400/60 bg-emerald-500/40 backdrop-blur-xl px-9 py-4 rounded-full font-bold text-sm tracking-wide shadow-2xl shadow-emerald-500/30 hover:scale-[1.03] transition-transform"
              size="xl"
            >
              <span>Explore Live Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </LiquidButton>
          </Link>

          <Link
            href="/upload"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-semibold text-emerald-100 hover:text-white bg-black/60 hover:bg-black/80 border border-emerald-500/30 backdrop-blur-xl transition-all shadow-xl hover:border-emerald-400/50"
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Upload Historical CSV</span>
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center"
          >
            <MetalButton variant="success">
              Admin Demo Access
            </MetalButton>
          </Link>
        </div>

        {/* Live Metrics Quick Row */}
        <div className="mt-14 w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Monitored Power
              </span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">30,240 <span className="text-xs font-medium text-emerald-300">kWh</span></p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">30-day baseline</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Water Tracked
              </span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">4.92M <span className="text-xs font-medium text-cyan-300">Liters</span></p>
            <p className="text-[11px] text-cyan-200/60 mt-0.5">Hostels & laboratories</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Threshold Rule
              </span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">Mean + 1.8σ</p>
            <p className="text-[11px] text-amber-200/60 mt-0.5">Statistical anomaly engine</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                SVVV Campus
              </span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5">7 Blocks</p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Indore campus facility</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: FULL-SIZED CAMPUS TELEMETRY INFRASTRUCTURE CARDS */}
        {/* ============================================================ */}
        <section id="macro-telemetry" className="mt-24 w-full text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Core Telemetry Infrastructure
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                Multi-Resource Sub-Meter Architecture
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              High-resolution digital monitoring across high-voltage substations, closed-loop water circuits, and diverted campus organic streams.
            </p>
          </div>

          {/* Full-Sized Card 1: Power & Grid Displacement */}
          <div className="group p-6 sm:p-10 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-2xl hover:shadow-emerald-950/50 flex flex-col lg:flex-row items-stretch gap-8">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Zap className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Electrical Utility Pipeline • ISO 50001
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Substation Telemetry & Peak Shaving Analysis
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                  Continuous logging of 11kV distribution feeds, transformer step-down circuits, and rooftop solar inverters across SVVV Academic Blocks. Real-time power factor tracking prevents inductive penalty tariffs while identifying high-draw academic lab circuits.
                </p>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Base Commercial Tariff</span>
                  <p className="text-base sm:text-lg font-black text-white mt-1">₹8.50 / kWh</p>
                  <span className="text-[10px] text-emerald-300">Regulated DISCOM Rate</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">CEA Grid Factor</span>
                  <p className="text-base sm:text-lg font-black text-white mt-1">0.82 kg/kWh</p>
                  <span className="text-[10px] text-emerald-300">Central Electricity Auth.</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-white/50">30-Day Aggregated Load</span>
                  <p className="text-base sm:text-lg font-black text-emerald-300 mt-1">30,240 kWh</p>
                  <span className="text-[10px] text-emerald-300">40+ Monitored Rooms</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/data"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Explore Sub-Meter Records</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Telemetry Mock UI Panel */}
            <div className="w-full lg:w-[420px] p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Feeder Distribution</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  99.8% Meter Health
                </span>
              </div>

              {/* Feeders List */}
              <div className="space-y-3">
                <div
                  onClick={() => setSelectedCircuit('blockB')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCircuit === 'blockB'
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Block B — High Performance Lab Feeder</span>
                    <span className="text-amber-400">12,450 kWh</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '82%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
                    <span>Peak: 14:30 Weekdays</span>
                    <span className="text-amber-300 font-semibold">Flagged: Idle Weekend Draw</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedCircuit('library')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCircuit === 'library'
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Central Library & Study Commons</span>
                    <span className="text-emerald-400">8,210 kWh</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: '54%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
                    <span>Peak: 18:00 Evenings</span>
                    <span className="text-emerald-300 font-semibold">Optimal Schedule</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedCircuit('workshop')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedCircuit === 'workshop'
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Engineering Mechanical Workshop</span>
                    <span className="text-teal-400">9,580 kWh</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-teal-400 h-full rounded-full transition-all duration-500" style={{ width: '63%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
                    <span>Peak: 11:00 Practical Labs</span>
                    <span className="text-teal-300 font-semibold">Normal Baseline</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-white/60 flex items-center justify-between">
                <span>Total 30-Day Cost Burden:</span>
                <span className="font-bold text-white">₹2,57,040 INR</span>
              </div>
            </div>
          </div>

          {/* Full-Sized Card 2: Hydrological & Closed-Loop Water Optimization */}
          <div className="group p-6 sm:p-10 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-2xl hover:shadow-emerald-950/50 flex flex-col lg:flex-row items-stretch gap-8">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Droplets className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Hydrological Distribution Core
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Acoustic Leakage Detection & Automated Pump Cutoff
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                  Advanced ultrasonic telemetry tracking campus borewell extraction, overhead tank levels, and hostel distribution manifolds. Automated off-hour thresholding isolates hidden pipeline fissures during 01:00–05:00 low-consumption windows, conserving millions of liters annually.
                </p>
              </div>

              {/* Technical Water Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Commercial Water Tariff</span>
                  <p className="text-base sm:text-lg font-black text-white mt-1">₹0.05 / Liter</p>
                  <span className="text-[10px] text-cyan-300">Pumping & Treatment Cost</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Logged Volume</span>
                  <p className="text-base sm:text-lg font-black text-white mt-1">4.92M Liters</p>
                  <span className="text-[10px] text-cyan-300">30-Day Campus Total</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-white/50">Greywater Recovery</span>
                  <p className="text-base sm:text-lg font-black text-cyan-300 mt-1">94% Efficiency</p>
                  <span className="text-[10px] text-cyan-300">Campus Landscaping Cycle</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>View Water Distribution Scorecard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Reservoir & Circuit Meter Panel */}
            <div className="w-full lg:w-[420px] p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Campus Reservoir Levels</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Telemetry Online
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Hostel Complex Overhead Reservoirs</span>
                    <span className="text-cyan-400">2.45M L (50%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '50%' }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">Night schedule active • Automated cutoff 23:00</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Academic & Laboratory Blocks</span>
                    <span className="text-cyan-400">1.65M L (33%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-teal-400 h-full rounded-full" style={{ width: '33%' }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">RO Purifiers & Sanitary Mains</p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Grounds & Irrigation Storage</span>
                    <span className="text-cyan-400">0.82M L (17%)</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '17%' }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">Reclaimed greywater integration</p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 flex items-center justify-between">
                <span>Estimated Monthly Cost:</span>
                <span className="font-bold text-white">₹2,46,000 INR</span>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: FULL-SIZED PREDICTIVE ANOMALY & SIMULATOR CARDS */}
        {/* ============================================================ */}
        <section id="anomaly-engine" className="mt-24 w-full text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Mathematical Machine Intelligence
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                Predictive Anomaly Radar & Simulator
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              Rigorous rolling standard deviation statistical filtering that pinpoints operational waste with root cause diagnostics.
            </p>
          </div>

          {/* Full-Sized Card 3: Statistical Deviation Engine */}
          <div className="group p-6 sm:p-10 rounded-3xl bg-black/60 border border-amber-500/20 backdrop-blur-2xl hover:border-amber-400/50 transition-all duration-300 shadow-2xl hover:shadow-amber-950/50 flex flex-col lg:flex-row items-stretch gap-8">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Outlier Detection Engine • Mean + 1.8σ
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Rolling Standard Deviation & Excess Impact Quantification
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                  Unlike brittle static thresholds that produce dozens of false alarms during exams or festivals, EcoSentinel establishes an empirical baseline requiring at least 7 historical observations per circuit. When consumption exceeds $\mu + 1.8\sigma$, it calculates excess cost in INR and excess CO₂ emissions.
                </p>
              </div>

              {/* Mathematical Methodology Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Mathematical Formula</span>
                  <p className="text-sm font-mono font-bold text-amber-300 mt-1">Threshold = μ + 1.8σ</p>
                  <span className="text-[10px] text-white/50">Sample Std Deviation</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Min Historical History</span>
                  <p className="text-base sm:text-lg font-black text-white mt-1">7 Records</p>
                  <span className="text-[10px] text-white/50">Guarantees Normal Fit</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Quantified Cost Drag</span>
                  <p className="text-base sm:text-lg font-black text-amber-400 mt-1">₹31,480 INR</p>
                  <span className="text-[10px] text-white/50">Avoidable Monthly Waste</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition"
                >
                  <span>Investigate Active Flags in Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Live Root Cause Diagnostic Card */}
            <div className="w-full lg:w-[440px] p-5 sm:p-6 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                  </span>
                  <span className="text-xs font-bold text-white">Active Investigation: Event #A-104</span>
                </div>
                <span className="text-[10px] font-bold text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40">
                  Severity: High (+3.1σ)
                </span>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-white/50">Location & Sub-Circuit</span>
                  <p className="text-sm font-bold text-white">Block B — Lab 301 & AI Workstation Cluster</p>
                </div>

                <div className="p-3 rounded-xl bg-black/50 border border-white/10 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Expected Sunday Baseline:</span>
                    <span className="font-mono text-emerald-400 font-bold">42.1 kWh</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Actual Recorded Telemetry:</span>
                    <span className="font-mono text-red-400 font-bold">134.8 kWh</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1 border-t border-white/10 font-bold">
                    <span className="text-amber-300">Excess Power Draw:</span>
                    <span className="text-amber-400">+92.7 kWh (3.2x)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-white/50">Algorithmic Root Cause</span>
                  <p className="text-xs text-white/80 mt-0.5 leading-relaxed">
                    HVAC chiller and 30 GPU workstations left active over the weekend with zero scheduled classes or faculty badges detected.
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center justify-between">
                  <span>Action: Automated Chiller Off-Timer</span>
                  <span className="font-bold text-emerald-300">Saves ₹7,880</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Sized Card 4: What-If Scenario Simulator */}
          <div className="group p-6 sm:p-10 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-2xl hover:shadow-emerald-950/50 flex flex-col lg:flex-row items-stretch gap-8">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Sliders className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Interactive Decarbonization Modeler
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  What-If Scenario Simulator & ESG Progress Projections
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                  Calculate the exact financial and environmental impact of operational changes before implementation. Drag the slider to model policy changes such as HVAC temperature setbacks, LED motion sensor retrofits, and night pumping bans.
                </p>
              </div>

              {/* Interactive Slider Container */}
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">Target Load Reduction Parameter</span>
                  <span className="text-lg font-black text-emerald-300">{simReduction}% Shaved</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={simReduction}
                  onChange={(e) => setSimReduction(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-white/20 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>0% (Status Quo)</span>
                  <span>10% (Behavioral)</span>
                  <span>20% (Automation)</span>
                  <span>30% (Deep Retrofit)</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Run Custom Building Simulations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Calculated Impact Results */}
            <div className="w-full lg:w-[440px] p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Projected Campus Returns</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  Real-Time Math
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-[10px] uppercase font-bold text-white/50">Monthly Financial Savings</span>
                  <p className="text-2xl font-black text-emerald-400 mt-1">₹{savedCost.toLocaleString('en-IN')} INR</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Calculated at ₹8.50/kWh baseline tariff</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-left">
                  <span className="text-[10px] uppercase font-bold text-white/50">Energy Avoided</span>
                  <p className="text-2xl font-black text-teal-300 mt-1">{savedKwh.toLocaleString()} kWh</p>
                  <p className="text-[10px] text-white/50 mt-0.5">Reduction against 30,240 kWh historical stream</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-left">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-white/50">Carbon Offset</span>
                    <p className="text-lg font-black text-white mt-0.5">{savedCo2Mt} MT</p>
                    <span className="text-[9px] text-emerald-300">CO₂e Avoided</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-white/50">Mature Trees</span>
                    <p className="text-lg font-black text-white mt-0.5">{savedTrees}</p>
                    <span className="text-[9px] text-emerald-300">Annual Equivalent</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200 text-center">
                Annualized Budgetary Impact: <strong className="text-white">₹{(savedCost * 12).toLocaleString('en-IN')} / year</strong>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: FULL-SIZED DATA GOVERNANCE & NEON ARCHITECTURE */}
        {/* ============================================================ */}
        <section id="data-governance" className="mt-24 w-full text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Enterprise Data Governance
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                PostgreSQL Architecture & Audit Vault
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              Zero telemetry loss, atomic batch transactions, Cloudinary object archival, and WebSocket proxying over restrictive campus firewalls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 5: Non-Destructive Merging */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Server className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Neon PostgreSQL Pooler
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-4">
                  Composite Unique Keys & Non-Destructive Ingestion
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  Traditional CSV systems overwrite or duplicate historical rows upon re-upload. EcoSentinel utilizes native PostgreSQL composite indices on <code className="text-emerald-300 font-mono text-[11px] bg-white/10 px-1 py-0.5 rounded">[campusId, buildingId, roomId, resourceType, recordedDate]</code> to safely merge multi-month datasets without data corruption.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Firewall Transversal:</span>
                  <span className="font-bold text-emerald-300">WSS Port 443 (@neondatabase/serverless)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Bulk Ingestion Speed:</span>
                  <span className="font-bold text-emerald-300">1,440 records / 2.4s batch</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Date Integrity:</span>
                  <span className="font-bold text-emerald-300">PostgreSQL Native DATE (Zero UTC Drift)</span>
                </div>
              </div>

              <Link
                href="/imports"
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
              >
                <span>View Import History & Rollback Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 6: Cloudinary Archival & Auditability */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
                    <FileCheck className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Cloudinary Storage & Audit Trail
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-4">
                  Raw Payload Archival & 1-Click Batch Rollbacks
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  Every ingested CSV file is immediately mirrored to Cloudinary object storage with an immutable public URL and batch identifier. Facility managers can audit uploaded headers, review parse warnings, or trigger a safe atomic rollback if corrupt legacy files are uploaded.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Cloud Bucket:</span>
                  <span className="font-mono text-teal-300 font-bold">dsbutpmej / raw_telemetry</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Transactional Rollback:</span>
                  <span className="font-bold text-teal-300">Atomic Cascade Deletion</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Audited Metadata:</span>
                  <span className="font-bold text-teal-300">Parsed Rows, Success Count & Failure Errors</span>
                </div>
              </div>

              <Link
                href="/upload"
                className="inline-flex items-center gap-2 text-xs font-bold text-teal-400 hover:text-teal-300 transition"
              >
                <span>Upload New CSV Telemetry File</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: INTERACTIVE SHOWCASE PREVIEW */}
        {/* ============================================================ */}
        <section id="interactive-preview" className="mt-24 w-full text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Interactive Environment
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
                Live Campus Telemetry Explorer
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-sm">
              Toggle between real-time sub-meter consumption, anomaly investigation flags, and decarbonization simulation.
            </p>
          </div>

          <div className="p-4 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-emerald-300">
                  ecosentinel://svvv.in/telemetry-core
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'overview'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Resource Telemetry
                </button>
                <button
                  onClick={() => setActiveTab('anomalies')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'anomalies'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Anomaly Radar
                </button>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'simulation'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  What-If Simulator
                </button>
              </div>
            </div>

            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Block A — Admin & Faculty</span>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-black mt-2 text-white">4,280 kWh</p>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                    <p className="text-[11px] text-white/50 mt-2">Optimal consumption • 0 flags</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                      <span>Block B — Computer Labs</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-2xl font-black mt-2 text-white">12,450 kWh</p>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                    <p className="text-[11px] text-amber-200 mt-2">Surge detected: 24/7 HVAC idling</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                      <span>Central Library & Hostels</span>
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-black mt-2 text-white">1,820,000 L</p>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                    <p className="text-[11px] text-white/50 mt-2">Night pump schedule active</p>
                  </div>
                </div>
              )}

              {activeTab === 'anomalies' && (
                <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/30 text-left space-y-3">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Active Investigation Flag #A-104</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    Abnormal Server Room & Lab 301 Load on Sunday (+3.1σ)
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Statistical baseline recorded average weekend draw of 42.1 kWh. Actual reading spiked to 134.8 kWh with zero scheduled classes. Estimated excess cost impact: ₹7,880.
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <Link href="/dashboard" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
                      View Root Cause in Dashboard <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'simulation' && (
                <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      Target Reduction: 15% Smart Campus Optimization
                    </span>
                    <span className="text-base font-extrabold text-emerald-400">₹38,556 / month projected savings</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Electricity Saved</p>
                      <p className="text-xl font-black text-emerald-300 mt-1">4,536 kWh</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">CO₂ Grid Offset</p>
                      <p className="text-xl font-black text-teal-300 mt-1">3.72 MT CO₂e</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Tree Equivalency</p>
                      <p className="text-xl font-black text-emerald-400 mt-1">170 Mature Trees</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-24 w-full p-8 md:p-14 rounded-3xl bg-gradient-to-r from-emerald-950/90 via-emerald-900/70 to-teal-950/90 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left max-w-xl">
            <h3 className="text-2xl md:text-3xl font-black text-white">
              Ready to verify campus sustainability?
            </h3>
            <p className="text-xs md:text-sm text-emerald-200/80 mt-2 leading-relaxed">
              Log in with pre-seeded administrator credentials to inspect live charts, run What-If simulations, or import fresh CSV telemetry files.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/login">
              <LiquidButton className="w-full text-white border border-emerald-400/50 bg-emerald-500/30 backdrop-blur-md font-bold px-8 py-3.5 rounded-xl" size="lg">
                Admin Sign In
              </LiquidButton>
            </Link>
            <Link href="/dashboard">
              <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow-lg">
                View Live Demo
              </button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-30 w-full border-t border-emerald-500/20 bg-black/60 backdrop-blur-xl py-8 px-6 text-xs text-emerald-100/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <p>
              EcoSentinel Platform © 2026 • Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore
            </p>
          </div>
          <div className="flex items-center gap-5 text-emerald-300/80 font-medium">
            <Link href="/dashboard" className="hover:text-emerald-200 transition">Dashboard</Link>
            <Link href="/upload" className="hover:text-emerald-200 transition">Upload CSV</Link>
            <Link href="/data" className="hover:text-emerald-200 transition">Data Explorer</Link>
            <Link href="/analytics" className="hover:text-emerald-200 transition">Analytics</Link>
            <Link href="/login" className="hover:text-emerald-200 transition">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

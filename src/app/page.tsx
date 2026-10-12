'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'simulation'>('overview');

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#02150e] text-white selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Animated WebGL Shader Background */}
      <WebGLShader />

      {/* Ambient Gradient Glow Accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-5" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[400px] bg-teal-500/10 blur-[130px] pointer-events-none -z-5" />

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
          <a href="#features" className="hover:text-emerald-300 transition-colors">
            Intelligence Engines
          </a>
          <a href="#showcase" className="hover:text-emerald-300 transition-colors">
            Campus Infrastructure
          </a>
          <a href="#demo-preview" className="hover:text-emerald-300 transition-colors">
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

      {/* Main Hero Container */}
      <main className="relative z-20 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
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
          EcoSentinel transforms raw campus energy, water, and waste sub-meter telemetry into high-precision intelligence — featuring automated statistical anomaly detection (mean + 1.8σ) and actionable CO₂ reduction.
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

        {/* Interactive Showcase Preview */}
        <section id="demo-preview" className="mt-16 w-full text-left">
          <div className="p-3 sm:p-6 rounded-3xl bg-black/60 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-emerald-300">
                  ecosentinel://svvv.in/intelligence-core
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'overview'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  Resource Telemetry
                </button>
                <button
                  onClick={() => setActiveTab('anomalies')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'anomalies'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  Anomaly Radar
                </button>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'simulation'
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
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Block A — Admin & Faculty</span>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xl font-bold mt-2 text-white">4,280 kWh</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-400 h-full rounded-full" style={{ width: '42%' }} />
                    </div>
                    <p className="text-[11px] text-white/50 mt-2">Optimal consumption • 0 flags</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                      <span>Block B — Computer Labs</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <p className="text-xl font-bold mt-2 text-white">12,450 kWh</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '88%' }} />
                    </div>
                    <p className="text-[11px] text-amber-200 mt-2">Surge detected: 24/7 HVAC idling</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                      <span>Central Library & Hostels</span>
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xl font-bold mt-2 text-white">1,820,000 L</p>
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                    <p className="text-[11px] text-white/50 mt-2">Night pump schedule active</p>
                  </div>
                </div>
              )}

              {activeTab === 'anomalies' && (
                <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-left space-y-2">
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Active Investigation Flag #A-104</span>
                  </div>
                  <h4 className="text-base font-bold text-white">
                    Abnormal Server Room & Lab 301 Load on Sunday (+3.1σ)
                  </h4>
                  <p className="text-xs text-white/70 leading-relaxed">
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
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      Target Reduction: 15% Smart Campus Optimization
                    </span>
                    <span className="text-sm font-extrabold text-emerald-400">₹38,556 / month projected savings</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Electricity Saved</p>
                      <p className="text-lg font-black text-emerald-300 mt-1">4,536 kWh</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">CO₂ Grid Offset</p>
                      <p className="text-lg font-black text-teal-300 mt-1">3.72 MT CO₂e</p>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Tree Equivalency</p>
                      <p className="text-lg font-black text-emerald-400 mt-1">170 Mature Trees</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sustainable Campus Infrastructure Gallery */}
        <section id="showcase" className="mt-20 w-full text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Modern Higher Education Sustainability
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Real-World Smart Campus Telemetry
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-sm">
              EcoSentinel maps physical university substations, solar inverters, and water flow sensors into a unified single-pane-of-glass.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="group rounded-2xl overflow-hidden bg-black/40 border border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/50 transition-all shadow-xl flex flex-col">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1508873696983-2df5293cb325?auto=format&fit=crop&w=1200&q=80"
                  alt="Clean Campus Solar Grid"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  Solar Array Inverters
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Substation Telemetry</h3>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                    Continuous monitoring of campus transformers, solar array output, and academic wing peak demand profiles.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400">
                  <span>99.8% Uptime</span>
                  <Link href="/analytics" className="hover:underline flex items-center gap-1">
                    Details <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl overflow-hidden bg-black/40 border border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/50 transition-all shadow-xl flex flex-col">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1200&q=80"
                  alt="University Academic Quads"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  Academic Complex
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Building Efficiency Index</h3>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                    Multi-parameter scorecards evaluating energy density per student square meter across all SVVV departments.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400">
                  <span>Grade A Baseline</span>
                  <Link href="/data" className="hover:underline flex items-center gap-1">
                    Explore Data <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl overflow-hidden bg-black/40 border border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/50 transition-all shadow-xl flex flex-col">
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
                  alt="Server and Sensor Telemetry"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                  IoT Aggregation Core
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">PostgreSQL Data Vault</h3>
                  <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                    Reliable ingestion with Neon connection pooling, non-destructive record merges, and automated CSV audit trails.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-emerald-400">
                  <span>Composite Unique Keys</span>
                  <Link href="/imports" className="hover:underline flex items-center gap-1">
                    Audit Log <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Capabilities Detailed */}
        <section id="features" className="mt-20 w-full text-left space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Analytical Framework
              </span>
              <h2 className="text-2xl font-bold text-white mt-0.5">
                Enterprise Sustainability Engines
              </h2>
            </div>
            <span className="text-xs text-white/50 hidden sm:inline">Production Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit ring-1 ring-emerald-400/30">
                <AlertTriangle className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">
                Statistical Anomaly Engine
              </h3>
              <p className="text-xs text-white/65 mt-2 leading-relaxed">
                Calculates rolling sample standard deviation across historical observations to catch abnormal surges in Block B labs and library water circuits.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit ring-1 ring-emerald-400/30">
                <Sliders className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">
                What-If Scenario Simulator
              </h3>
              <p className="text-xs text-white/65 mt-2 leading-relaxed">
                Live interactive load-reduction slider projecting financial cost savings in INR, CEA grid carbon offset, and mature tree equivalents.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md hover:border-emerald-500/40 transition-all shadow-xl">
              <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl w-fit ring-1 ring-emerald-400/30">
                <Database className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mt-4">
                Non-Destructive Ingestion
              </h3>
              <p className="text-xs text-white/65 mt-2 leading-relaxed">
                PostgreSQL composite unique constraints ensure multiple CSV uploads merge seamlessly over time without duplicating or corrupting date records.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-20 w-full p-8 md:p-12 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-teal-950/80 border border-emerald-500/40 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
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
              <LiquidButton className="w-full text-white border border-emerald-400/50 bg-emerald-500/30 backdrop-blur-md font-bold px-7 py-3 rounded-xl" size="lg">
                Admin Sign In
              </LiquidButton>
            </Link>
            <Link href="/dashboard">
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow-lg">
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

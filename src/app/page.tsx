'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import { LiquidButton, MetalButton } from '@/components/ui/liquid-glass-button';
import {
  Leaf,
  Zap,
  Droplets,
  Trash2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Sparkles,
  Building2,
  Lock,
  BarChart3,
  CheckCircle2,
  Trophy,
  Users,
  Compass,
  GraduationCap,
  HeartHandshake,
  Award,
  Sun,
  Smile,
  ShieldCheck,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'anomalies' | 'simulation'>('overview');
  const [selectedCircuit, setSelectedCircuit] = useState<'blockB' | 'library' | 'workshop'>('blockB');
  const [studentPledge, setStudentPledge] = useState<number>(15);

  // Dynamic Student Collective Impact math (30-day base: 30,240 kWh)
  const baseKwh = 30240;
  const tariffKwh = 8.5; // INR saved per kWh for campus reinvestment
  const ceaFactor = 0.82; // kg CO2e / kWh
  const treeFactor = 22.0; // kg CO2e absorbed by 1 mature tree / year

  const savedKwh = Math.round(baseKwh * (studentPledge / 100));
  const savedFunds = Math.round(savedKwh * tariffKwh);
  const savedCo2Mt = Number(((savedKwh * ceaFactor) / 1000).toFixed(2));
  const savedTrees = Math.round((savedKwh * ceaFactor) / treeFactor);
  const savedCyclingKm = Math.round(savedKwh * 3.2);

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
              <span className="text-xl font-extrabold tracking-tight text-white font-heading">
                EcoCampus
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                SVVV Green Portal
              </span>
            </div>
            <p className="text-[11px] text-emerald-300/80 font-medium tracking-wide">
              Student & Campus Sustainability Network
            </p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-emerald-100/80">
          <a href="#campus-life" className="hover:text-emerald-300 transition-colors">
            Campus Life
          </a>
          <a href="#leaderboard" className="hover:text-emerald-300 transition-colors">
            Green Leaderboard
          </a>
          <a href="#student-impact" className="hover:text-emerald-300 transition-colors">
            Student Impact
          </a>
          <a href="#student-action" className="hover:text-emerald-300 transition-colors">
            Get Involved
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-emerald-200 hover:text-white bg-white/5 hover:bg-white/10 border border-emerald-500/20 backdrop-blur-md transition-all shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Student / Admin Sign In</span>
          </Link>
          <Link href="/dashboard">
            <LiquidButton
              className="text-white border border-emerald-400/50 bg-emerald-600/30 backdrop-blur-md hover:bg-emerald-600/50 text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/40"
              size="default"
            >
              <span>Explore Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </LiquidButton>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-20 w-full max-w-6xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">
        {/* Campus Live Pulse Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 backdrop-blur-xl mb-6 shadow-2xl ring-1 ring-emerald-500/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-sm shadow-emerald-400" />
          </span>
          <span className="text-xs font-semibold text-emerald-300 tracking-wide">
            Shri Vaishnav Vidyapeeth Vishwavidyalaya • Live Campus Green Grid
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.05] text-white font-heading">
          Every Student. <span className="text-emerald-400">Every Block.</span>
          <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            One Greener Campus.
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base md:text-lg text-emerald-100/80 max-w-3xl font-normal leading-relaxed">
          See where electricity is saved in student hostels, reduce water waste in university labs, and compete on the inter-department green leaderboard. Real-time sustainability built for the student community at SVVV Indore.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/dashboard">
            <LiquidButton
              className="w-full sm:w-auto text-white border border-emerald-400/60 bg-emerald-500/40 backdrop-blur-xl px-9 py-4 rounded-full font-bold text-sm tracking-wide shadow-2xl shadow-emerald-500/30 hover:scale-[1.03] transition-transform"
              size="xl"
            >
              <span>Explore Campus Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </LiquidButton>
          </Link>

          <a
            href="#leaderboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-xs font-semibold text-emerald-100 hover:text-white bg-black/60 hover:bg-black/80 border border-emerald-500/30 backdrop-blur-xl transition-all shadow-xl hover:border-emerald-400/50"
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>View Department Rankings</span>
          </a>

          <Link
            href="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center"
          >
            <MetalButton variant="success">
              Join Campus Eco-Action
            </MetalButton>
          </Link>
        </div>

        {/* Live Metrics Quick Row */}
        <div className="mt-14 w-full grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Clean Power Used
              </span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-heading">
              30,240 <span className="text-xs font-medium text-emerald-300">kWh</span>
            </p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Labs, libraries & classrooms</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Water Saved Together
              </span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-heading">
              4.92M <span className="text-xs font-medium text-cyan-300">Liters</span>
            </p>
            <p className="text-[11px] text-cyan-200/60 mt-0.5">Hostels & refill stations</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Cafeteria Waste Diverted
              </span>
              <Trash2 className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-heading">
              8,400 <span className="text-xs font-medium text-amber-300">kg</span>
            </p>
            <p className="text-[11px] text-amber-200/60 mt-0.5">Composted for campus lawns</p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/20 backdrop-blur-xl text-left hover:border-emerald-500/40 transition-all shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                Campus Eco-Rank
              </span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1.5 font-heading">Grade A+</p>
            <p className="text-[11px] text-emerald-200/60 mt-0.5">Top 5% Green Universities</p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 1: FULL-SIZED CAMPUS LIFE & SUSTAINABLE BUILDINGS */}
        {/* ============================================================ */}
        <section id="campus-life" className="mt-24 w-full text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Green Campus Life
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                Smart Academic Labs & Sustainable Hostels
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              Discover how student habits, automated building sensors, and clean energy work together across SVVV's 7 academic complexes.
            </p>
          </div>

          {/* Full-Sized Card 1: Green Academic Blocks & Labs */}
          <div className="group p-6 sm:p-10 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/50 transition-all duration-300 shadow-2xl hover:shadow-emerald-950/50 flex flex-col lg:flex-row items-stretch gap-8">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <GraduationCap className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Smart Classrooms & Computer Labs
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 font-heading">
                  Energy Awareness in University Labs & Study Halls
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                  High-performance computer labs, engineering workshops, and smart classrooms draw significant power throughout the semester. By remembering to shut down workstation towers after programming practicals and keeping lecture hall thermostats at an eco-friendly 24°C, students save thousands of units every month.
                </p>
              </div>

              {/* Student Action Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Student Pro-Tip</span>
                  <p className="text-xs font-semibold text-white mt-1">Unplug Idle Chargers</p>
                  <span className="text-[10px] text-white/50">Cuts phantom draw in study desks</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Smart Temperature</span>
                  <p className="text-xs font-semibold text-white mt-1">Set ACs to 24°C</p>
                  <span className="text-[10px] text-white/50">Optimal cooling with 18% less energy</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Natural Daylight</span>
                  <p className="text-xs font-semibold text-white mt-1">Library Skylights</p>
                  <span className="text-[10px] text-white/50">Reading zones bathed in natural sun</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>See Live Block B Lab Consumption</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Department Live Selector Panel */}
            <div className="w-full lg:w-[420px] p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Campus Building Monitor</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Sensor Sync
                </span>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setSelectedCircuit('blockB')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selectedCircuit === 'blockB'
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Block B — Computer Science & AI Labs</span>
                    <span className="text-amber-400">12,450 kWh</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: '80%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
                    <span>Active: 8 Practical Labs</span>
                    <span className="text-amber-300 font-semibold">Tip: Power down GPUs after class</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedCircuit('library')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selectedCircuit === 'library'
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Central Library & Study Commons</span>
                    <span className="text-emerald-400">8,210 kWh</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all duration-500" style={{ width: '52%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
                    <span>Natural Light Harvesting: Active</span>
                    <span className="text-emerald-300 font-semibold">Green Star Rated</span>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedCircuit('workshop')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${selectedCircuit === 'workshop'
                      ? 'bg-emerald-950/40 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span>Mechanical & Robotics Workshop</span>
                    <span className="text-teal-400">9,580 kWh</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-teal-400 h-full rounded-full transition-all duration-500" style={{ width: '64%' }} />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/50 mt-1.5">
                    <span>Solar Shift Timetable Active</span>
                    <span className="text-teal-300 font-semibold">Clean Machinery Hours</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 text-[11px] text-white/70 flex items-center justify-between">
                <span>Green Student Engagement Score:</span>
                <span className="font-bold text-emerald-300">92% Compliance</span>
              </div>
            </div>
          </div>

          {/* Full-Sized Card 2: Clean Water & Green Hostels */}
          <div className="group p-6 sm:p-10 rounded-3xl bg-black/60 border border-cyan-500/20 backdrop-blur-2xl hover:border-cyan-400/50 transition-all duration-300 shadow-2xl hover:shadow-cyan-950/50 flex flex-col lg:flex-row items-stretch gap-8">
            <div className="flex-1 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    <Droplets className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                    Hostel Life & Water Conservation
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 font-heading">
                  Clean Refill Stations, Zero Waste Taps & Greywater Gardens
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-3 leading-relaxed">
                  Water is our most precious campus resource. Across our boys and girls hostels, automated flow sensors detect dripping taps and running tanks before thousands of liters are wasted. Plus, modern RO refill stations across campus have eliminated over 45,000 single-use plastic bottles this academic year.
                </p>
              </div>

              {/* Water Impact Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Campus RO Coolers</span>
                  <p className="text-sm font-bold text-white mt-1">45,000+ Bottles Saved</p>
                  <span className="text-[10px] text-white/50">Carry your reusable flask!</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Night Leak Prevention</span>
                  <p className="text-sm font-bold text-white mt-1">Zero Hostel Overflow</p>
                  <span className="text-[10px] text-white/50">Auto-cutoff during off-hours</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-cyan-400">Reclaimed Irrigation</span>
                  <p className="text-sm font-bold text-white mt-1">100% Green Lawns</p>
                  <span className="text-[10px] text-white/50">Campus gardens use recycled water</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition"
                >
                  <span>See Campus Water Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual Hostel Reservoir Flow Panel */}
            <div className="w-full lg:w-[420px] p-5 sm:p-6 rounded-2xl bg-black/80 border border-white/10 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Campus Water Distribution</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  94% Conservation Rate
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Student Hostels & Dining Mess</span>
                    <span className="text-cyan-400">2.45M Liters</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-cyan-400 h-full rounded-full" style={{ width: '50%' }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">Refill stations active • Mess dishwashing optimized</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Academic Wings & Chemistry Labs</span>
                    <span className="text-teal-400">1.65M Liters</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-teal-400 h-full rounded-full" style={{ width: '34%' }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">Closed-loop lab cooling & clean drinking fountains</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex justify-between text-xs font-bold text-white">
                    <span>Sports Grounds & Campus Forestry</span>
                    <span className="text-emerald-400">0.82M Liters</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '16%' }} />
                  </div>
                  <p className="text-[10px] text-white/50 mt-1">100% recycled rainwater & greywater</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 text-center">
                Together, SVVV students save <strong className="text-white">12,000+ Liters</strong> every single day!
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 2: STUDENT GREEN LEADERBOARD & INTER-DEPARTMENT CUP */}
        {/* ============================================================ */}
        <section id="leaderboard" className="mt-24 w-full text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Inter-Department Green Cup
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                Campus Sustainability Standings
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              Friendly campus competition! See which university blocks and hostel wings are leading in energy conservation and zero-waste initiatives.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Full-Sized Card 3: Live Department Leaderboard */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-amber-500/20 backdrop-blur-2xl hover:border-amber-400/40 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <Trophy className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Monthly Campus Standings
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-300 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40">
                    October 2026 Season
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-4 font-heading">
                  The Chancellor&apos;s Green Trophy Race
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  Earn Green Credits for your department by cutting idle lab electricity, organizing campus clean-up drives, and keeping canteen waste to zero. Top ranked department wins student club project grants!
                </p>
              </div>

              {/* Leaderboard Table Rows */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Computer Science & AI (Block B)</p>
                      <p className="text-[10px] text-amber-200">18% Energy Shaved • 100% Lab Shutdown</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-amber-300">94 / 100</span>
                    <p className="text-[10px] text-white/50">Eco-Points</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-zinc-300 text-black font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">School of Architecture & Design</p>
                      <p className="text-[10px] text-emerald-300">Zero Single-Use Plastic Exhibition</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white">91 / 100</span>
                    <p className="text-[10px] text-white/50">Eco-Points</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Mechanical Engineering Labs</p>
                      <p className="text-[10px] text-teal-300">Shifted Machine Hours to Solar Peaks</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white">86 / 100</span>
                    <p className="text-[10px] text-white/50">Eco-Points</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-zinc-600 text-white font-black text-xs flex items-center justify-center">
                      4
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">Central Student Hostels (Block 1 & 2)</p>
                      <p className="text-[10px] text-cyan-300">Saved 42,000 Liters Water This Week</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-white">83 / 100</span>
                    <p className="text-[10px] text-white/50">Eco-Points</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 text-xs text-white/70 flex items-center justify-between">
                <span>Want your club on the leaderboard?</span>
                <Link href="/login" className="text-amber-400 font-bold hover:underline">
                  Submit Eco Action →
                </Link>
              </div>
            </div>

            {/* Full-Sized Card 4: Interactive Student Impact Calculator */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/40 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Sliders className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Interactive Calculator
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40">
                    12,000 Students Strong
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-4 font-heading">
                  What If Every Student Joined the Green Pledge?
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  Drag the slider to see how small everyday collective actions — like turning off lab monitors and reporting tap leaks — compound into massive positive impact across SVVV.
                </p>
              </div>

              {/* Interactive Slider */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-white">Campus Student Conservation Target:</span>
                  <span className="text-xl font-black text-emerald-300 font-heading">
                    {studentPledge}% Shaved
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={studentPledge}
                  onChange={(e) => setStudentPledge(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-white/20 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>5% (Basic Habits)</span>
                  <span>15% (Department Drive)</span>
                  <span>30% (Campus Movement!)</span>
                </div>
              </div>

              {/* Real Student Returns */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Clean Electricity Saved</span>
                  <p className="text-xl font-black text-emerald-400 mt-1 font-heading">{savedKwh.toLocaleString()} kWh</p>
                  <span className="text-[10px] text-emerald-300">Powers campus study rooms</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Student Eco-Fund</span>
                  <p className="text-xl font-black text-teal-300 mt-1 font-heading">₹{savedFunds.toLocaleString('en-IN')}</p>
                  <span className="text-[10px] text-teal-300">Reinvested in solar benches</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">CO₂ Avoided</span>
                  <p className="text-xl font-black text-white mt-1 font-heading">{savedCo2Mt} MT</p>
                  <span className="text-[10px] text-emerald-300">Cleaner Indore air</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-white/50">Tree Equivalent</span>
                  <p className="text-xl font-black text-white mt-1 font-heading">{savedTrees} Trees</p>
                  <span className="text-[10px] text-emerald-300">Annual forest absorption</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-200 text-center">
                Equivalent to <strong className="text-white">{savedCyclingKm.toLocaleString()} km</strong> of student bicycle transit!
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 3: STUDENT ACTION, ZERO-WASTE DINING & AMBASSADORS */}
        {/* ============================================================ */}
        <section id="student-action" className="mt-24 w-full text-left space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Get Involved & Lead
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                Zero-Waste Cafeteria & Eco-Ambassadors
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-md">
              Step up and make a tangible mark on your university campus. Earn recognized sustainability leadership certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 5: Zero-Waste Dining */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/40 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Trash2 className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Campus Circular Dining
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-4 font-heading">
                  100% Canteen Composting & Zero Single-Use Plastic
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  Every food scrap from student cafeterias and dining halls is collected daily and transformed into nutrient-rich organic compost. This compost nourishes the botanical lawns, student tree plantations, and agricultural research plots across campus.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Annual Organic Compost Produced:</span>
                  <span className="font-bold text-amber-300">8,400 kg Natural Fertilizer</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Canteen Single-Use Plastic:</span>
                  <span className="font-bold text-emerald-300">Banned Across All Campus Kiosks</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Student Volunteer Mess Audit:</span>
                  <span className="font-bold text-white">Weekly Food Waste Tracking</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Explore Campus Waste Diversion Stats</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 6: Eco-Ambassadors Program */}
            <div className="p-6 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/20 backdrop-blur-2xl hover:border-emerald-400/40 transition-all duration-300 shadow-2xl flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Users className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Student Leadership Program
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-4 font-heading">
                  Become a Student Eco-Ambassador
                </h3>
                <p className="text-xs sm:text-sm text-white/70 mt-2 leading-relaxed">
                  Represent your department or hostel block! Eco-Ambassadors organize green campus hackathons, lead building energy spot-audits, and graduate with verified sustainability leadership credentials to enhance their global careers.
                </p>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Eligibility:</span>
                  <span className="font-bold text-white">All SVVV Undergrads & Postgrads</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Recognition:</span>
                  <span className="font-bold text-emerald-300">University Chancellor Certificate</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <span className="text-white/60">Annual Green Hackathon:</span>
                  <span className="font-bold text-emerald-300">Prizes for Best Clean-Tech Idea</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>Sign Up as Campus Eco-Ambassador</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SECTION 4: INTERACTIVE CAMPUS TELEMETRY SHOWCASE */}
        {/* ============================================================ */}
        <section className="mt-24 w-full text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Interactive Campus Explorer
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1 font-heading">
                Campus Energy & Waste Preview
              </h2>
            </div>
            <p className="text-xs text-white/60 max-w-sm">
              Explore how energy, water, and waste are distributed across your university campus in real time.
            </p>
          </div>

          <div className="p-4 sm:p-8 rounded-3xl bg-black/60 border border-emerald-500/30 backdrop-blur-2xl shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-2 text-xs font-mono text-emerald-300">
                  ecocampus://svvv.in/live-stream
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'overview'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                    }`}
                >
                  Resource Telemetry
                </button>
                <button
                  onClick={() => setActiveTab('anomalies')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'anomalies'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                    }`}
                >
                  Green Alerts
                </button>
                <button
                  onClick={() => setActiveTab('simulation')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'simulation'
                      ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'text-white/60 hover:text-white'
                    }`}
                >
                  Student Pledge Model
                </button>
              </div>
            </div>

            <div className="mt-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold">
                      <span>Block A — Faculty & Classrooms</span>
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-black mt-2 text-white font-heading">4,280 kWh</p>
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
                    <p className="text-2xl font-black mt-2 text-white font-heading">12,450 kWh</p>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '82%' }} />
                    </div>
                    <p className="text-[11px] text-amber-200 mt-2">Active practical sessions & workshops</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between text-xs text-cyan-400 font-semibold">
                      <span>Central Library & Hostels</span>
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-2xl font-black mt-2 text-white font-heading">1,820,000 L</p>
                    <div className="w-full bg-white/10 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '65%' }} />
                    </div>
                    <p className="text-[11px] text-white/50 mt-2">Refill coolers active • Zero pipe leaks</p>
                  </div>
                </div>
              )}

              {activeTab === 'anomalies' && (
                <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-left space-y-3">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Campus Green Alert: Block B Lab 301</span>
                  </div>
                  <h4 className="text-lg font-bold text-white font-heading">
                    Overnight Workstation Power Draw Detected on Sunday
                  </h4>
                  <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                    Student lab workstations were left on standby after weekend coding projects. Automated notification sent to student lab reps — powering them down saves ₹7,880 for student activity funds!
                  </p>
                  <div className="pt-2 flex items-center gap-3">
                    <Link href="/dashboard" className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1">
                      View Campus Action Center <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}

              {activeTab === 'simulation' && (
                <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                      Target Goal: 15% Collective Student Energy Pledge
                    </span>
                    <span className="text-base font-extrabold text-emerald-400 font-heading">
                      ₹38,556 / month for Student Green Projects
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Electricity Saved</p>
                      <p className="text-xl font-black text-emerald-300 mt-1 font-heading">4,536 kWh</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">CO₂ Footprint Slashed</p>
                      <p className="text-xl font-black text-teal-300 mt-1 font-heading">3.72 MT CO₂e</p>
                    </div>
                    <div className="p-4 bg-black/40 rounded-xl border border-white/10">
                      <p className="text-[10px] text-white/50 uppercase font-bold">Tree Equivalency</p>
                      <p className="text-xl font-black text-emerald-400 mt-1 font-heading">170 Mature Trees</p>
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
            <h3 className="text-2xl md:text-3xl font-black text-white font-heading">
              Ready to lead sustainability at SVVV?
            </h3>
            <p className="text-xs md:text-sm text-emerald-200/80 mt-2 leading-relaxed">
              Explore real campus telemetry, check your hostel block score, or sign in to track department eco-credits and join student green drives.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/login">
              <LiquidButton className="w-full text-white border border-emerald-400/50 bg-emerald-500/30 backdrop-blur-md font-bold px-8 py-3.5 rounded-xl" size="lg">
                Student & Admin Login
              </LiquidButton>
            </Link>
            <Link href="/dashboard">
              <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white text-emerald-950 font-bold text-xs hover:bg-emerald-50 transition shadow-lg font-heading">
                Launch Live Dashboard
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
              EcoCampus Initiative © 2026 • Shri Vaishnav Vidyapeeth Vishwavidyalaya, Indore
            </p>
          </div>
          <div className="flex items-center gap-5 text-emerald-300/80 font-medium">
            <Link href="/dashboard" className="hover:text-emerald-200 transition">Campus Dashboard</Link>
            <Link href="/data" className="hover:text-emerald-200 transition">Telemetry Data</Link>
            <Link href="/analytics" className="hover:text-emerald-200 transition">Green Analytics</Link>
            <Link href="/upload" className="hover:text-emerald-200 transition">Upload Dataset</Link>
            <Link href="/login" className="hover:text-emerald-200 transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

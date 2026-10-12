'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Leaf,
  ShieldCheck,
  ArrowRight,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  GraduationCap,
  Building2,
  Zap,
  Award,
  CheckCircle2,
  Trophy,
} from 'lucide-react';
import { WebGLShader } from '@/components/ui/web-gl-shader';

export default function ModernLoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');
  const [email, setEmail] = useState('student@svvv.in');
  const [password, setPassword] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: 'STUDENT' | 'ADMIN') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'STUDENT') {
      setEmail('student@svvv.in');
      setPassword('student');
    } else {
      setEmail('admin@svvv.in');
      setPassword('admin');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || 'Invalid credentials. Please verify your email and password.');
        setIsLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950 overflow-hidden text-slate-100">
      {/* 1. Animated Ambient WebGL Emerald Waves Shader */}
      <div className="absolute inset-0 pointer-events-none opacity-60">
        <WebGLShader />
      </div>

      {/* 2. Glassmorphic Backdrop Grid & Glow Accents */}
      <div className="absolute inset-0 bg-radial from-transparent via-slate-950/60 to-slate-950 pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* 3. Main Dual-Column Container */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Brand & Campus Intelligence Showcase (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-7 text-left hidden md:block">
          {/* University Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>SVVV Indore • Shri Vaishnav Vidyapeeth Vishwavidyalaya</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-2xl shadow-xl shadow-emerald-500/20 text-white">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  EcoCampus <span className="text-emerald-400 text-3xl font-light">8.0</span>
                </h1>
                <p className="text-xs uppercase tracking-widest text-emerald-300/80 font-bold">
                  Next-Gen Sustainability Intelligence
                </p>
              </div>
            </div>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Empowering students and campus administrators with real-time IoT energy monitoring, AI vision waste classification, and cleanliness gamification rewards.
            </p>
          </div>

          {/* 3 Telemetry Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 max-w-xl">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 hover:border-emerald-400/40 transition">
              <div className="flex items-center justify-between text-emerald-400">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Campus</span>
              </div>
              <p className="text-lg font-black text-white">Net-Zero 2030</p>
              <p className="text-[11px] text-slate-400">Active IoT Telemetry</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 hover:border-emerald-400/40 transition">
              <div className="flex items-center justify-between text-teal-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vision</span>
              </div>
              <p className="text-lg font-black text-white">99.4% Accuracy</p>
              <p className="text-[11px] text-slate-400">AI Waste Classifier</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-1 hover:border-emerald-400/40 transition">
              <div className="flex items-center justify-between text-amber-400">
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Rewards</span>
              </div>
              <p className="text-lg font-black text-white">EcoPoints</p>
              <p className="text-[11px] text-slate-400">Dynamic Leaderboard</p>
            </div>
          </div>

          {/* Security & Partner Footnote */}
          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Neon PostgreSQL Cloud</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Role-Tailored Portals</span>
            </span>
          </div>
        </div>

        {/* Right Column: Modern Glassmorphic Login Card (5 cols) */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          <div className="bg-slate-900/85 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/60 space-y-6 relative overflow-hidden">
            {/* Ambient Card Header Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Mobile Branding Header */}
            <div className="md:hidden text-center pb-2">
              <div className="inline-flex p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-xl text-white mb-2 shadow-md">
                <Leaf className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">EcoCampus 8.0</h2>
              <p className="text-xs text-slate-400">SVVV Indore Sustainability Portal</p>
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Welcome Back
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Select your campus role and authenticate into your portal.
              </p>
            </div>

            {/* Role Segmented Selector */}
            <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => handleRoleSelect('STUDENT')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${selectedRole === 'STUDENT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('ADMIN')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition cursor-pointer ${selectedRole === 'ADMIN'
                  ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-white border border-white/20 shadow-md'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Administrator</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <span className="font-bold text-red-400">Notice:</span>
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider"
                >
                  Campus Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={selectedRole === 'STUDENT' ? 'student@svvv.in' : 'admin@svvv.in'}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 text-xs text-white placeholder:text-slate-500 bg-white/5 border border-white/10 rounded-xl focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to {selectedRole === 'STUDENT' ? 'Student Portal' : 'Admin Console'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick 1-Tap Demo Switcher Pills */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                Instant One-Tap Demo Access:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('STUDENT')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-center ${selectedRole === 'STUDENT'
                    ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                >
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-400" /> Student
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">student@svvv.in</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-center ${selectedRole === 'ADMIN'
                    ? 'bg-slate-700/50 border-white/30 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10'
                    }`}
                >
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-teal-400" /> Admin
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">admin@svvv.in</span>
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="text-center pt-1 text-[10px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Encrypted Session • SVVV Campus Gateway</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

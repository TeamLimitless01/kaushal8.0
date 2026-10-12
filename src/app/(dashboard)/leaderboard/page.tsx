'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Trophy,
  Award,
  Coins,
  Medal,
  RefreshCw,
  Search,
  Sparkles,
  ClipboardCheck,
  Camera,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  User,
} from 'lucide-react';

interface StudentLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  department: string;
  points: number;
  reportsCount: number;
  badge: string;
  isCurrentUser: boolean;
  avatarColor: string;
}

interface UserEcoStats {
  userId: string;
  name: string;
  email: string;
  points: number;
  rank: number;
  level: number;
  levelTitle: string;
  nextLevelPoints: number;
  levelProgressPct: number;
  approvedReportsCount: number;
  pendingReportsCount: number;
  badge: string;
}

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isAdmin = userRole === 'ADMIN';

  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserEcoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/report/leaderboard');
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
        setUserStats(data.userStats);
      }
    } catch (err) {
      console.error('Failed to load leaderboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const totalPointsAwarded = leaderboard.reduce((sum, s) => sum + s.points, 0);
  const totalVerifiedCleanups = leaderboard.reduce((sum, s) => sum + s.reportsCount, 0);

  const filteredLeaderboard = leaderboard.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-7 pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 mb-2.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Campus Sustainability Standings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Student Eco-Champions Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              Live campus rankings recognizing student sustainability contributions, verified waste segregation, and campus hygiene audits.
            </p>
          </div>

          {/* Quick CTA depending on role */}
          {isAdmin ? (
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition self-start sm:self-auto cursor-pointer"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Review Student Submissions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/report"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/30 transition self-start sm:self-auto cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Report Waste & Earn Points</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Leading Champion
            </span>
            <p className="text-base font-black text-slate-900">
              {leaderboard[0] ? leaderboard[0].name : 'Loading...'}
            </p>
            <span className="text-xs font-semibold text-emerald-800">
              {leaderboard[0] ? `${leaderboard[0].points} EcoPoints` : ''}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Verified Cleanups
            </span>
            <p className="text-xl font-black text-slate-900">{totalVerifiedCleanups}</p>
            <span className="text-xs font-semibold text-slate-500">Across SVVV Grounds</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Points Awarded
            </span>
            <p className="text-xl font-black text-slate-900">{totalPointsAwarded} pts</p>
            <span className="text-xs font-semibold text-slate-500">Student Rewards Pool</span>
          </div>
        </div>
      </div>

      {/* 3. Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end pt-2">
          {/* Rank 2 (Silver) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center shadow-xs order-2 md:order-1 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 mx-auto flex items-center justify-center font-black text-lg border-2 border-slate-300 mb-3 shadow-xs">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-base">{leaderboard[1].name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{leaderboard[1].department}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-800 rounded-full text-xs font-black">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{leaderboard[1].points} pts</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-medium">
              {leaderboard[1].reportsCount} Verified Reports
            </p>
          </div>

          {/* Rank 1 (Gold - Elevated) */}
          <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50/30 border-2 border-amber-300 rounded-3xl p-7 text-center shadow-md order-1 md:order-2 md:-translate-y-2">
            <div className="w-16 h-16 rounded-full bg-amber-400 text-white mx-auto flex items-center justify-center font-black text-2xl border-4 border-amber-200 mb-3 shadow-lg shadow-amber-500/20">
              <Trophy className="w-8 h-8" />
            </div>
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 inline-block mb-1.5">
              🥇 1st Place Champion
            </span>
            <h4 className="font-black text-slate-900 text-lg">{leaderboard[0].name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{leaderboard[0].department}</p>
            <div className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-sm font-black border border-amber-200">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>{leaderboard[0].points} EcoPoints</span>
            </div>
            <p className="text-xs text-emerald-800 font-bold mt-2">
              {leaderboard[0].reportsCount} Verified Cleanups
            </p>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 text-center shadow-xs order-3 hover:shadow-md transition">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-black text-lg border-2 border-amber-300 mb-3 shadow-xs">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-base">{leaderboard[2].name}</h4>
            <p className="text-xs text-slate-500 mt-0.5">{leaderboard[2].department}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 text-amber-800 rounded-full text-xs font-black">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{leaderboard[2].points} pts</span>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 font-medium">
              {leaderboard[2].reportsCount} Verified Reports
            </p>
          </div>
        </div>
      )}

      {/* 4. Full Leaderboard Table with Search */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span>Campus Rankings Roster</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Updated live upon administrative report verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-52 sm:w-64"
              />
            </div>

            <button
              onClick={loadLeaderboard}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition cursor-pointer"
              title="Refresh standings"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading live campus standings...</p>
          </div>
        ) : filteredLeaderboard.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No students found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLeaderboard.map((student) => (
              <div
                key={student.id}
                className={`flex items-center justify-between py-3.5 px-3 rounded-2xl transition ${student.isCurrentUser
                  ? 'bg-emerald-50/80 border border-emerald-300 font-semibold'
                  : 'hover:bg-slate-50'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${student.rank === 1
                      ? 'bg-amber-100 text-amber-800'
                      : student.rank === 2
                        ? 'bg-slate-200 text-slate-800'
                        : student.rank === 3
                          ? 'bg-amber-50 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    #{student.rank}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{student.name}</span>
                      {student.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{student.department}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block">
                    <span className="text-xs font-semibold text-slate-700 block">
                      {student.reportsCount} cleanups
                    </span>
                    <span className="text-[10px] text-slate-600">{student.badge}</span>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-900 font-black text-xs min-w-[85px] text-right flex items-center justify-end gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-500" />
                    <span>{student.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

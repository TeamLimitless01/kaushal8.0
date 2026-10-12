'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Database,
  History,
  TrendingUp,
  Settings,
  UploadCloud,
  Leaf,
  LogOut,
  Bell,
  Menu,
  X,
  Building2,
  CheckCircle2,
  ChevronDown,
  Camera,
  BookOpen,
  QrCode,
  Sparkles,
  Award,
  ClipboardCheck,
  Trophy,
  Activity,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'IoT Telemetry', href: '/iot', icon: Activity, badge: 'LIVE' },
  // { name: 'Classroom Streams', href: '/streams', icon: Video, badge: 'CCTV' },
  { name: 'AI Sustainability Advisor', href: '/ai', icon: Sparkles },
  { name: 'Student Reports', href: '/admin/reports', icon: ClipboardCheck, badge: 'Review' },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'AI Waste Classifier', href: '/scan', icon: Camera, badge: 'AI' },
  { name: 'Data Explorer', href: '/data', icon: Database },
  { name: 'Imports', href: '/imports', icon: History },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = (session?.user as { role?: string })?.role;
  const isStudent = userRole === 'STUDENT';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const activeNavItems: NavItem[] = isStudent
    ? [
      { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
      { name: 'AI Waste Classifier', href: '/dashboard', icon: Camera, badge: 'AI' },
      { name: 'Report & Earn', href: '/report', icon: Award, badge: '+Pts' },
    ]
    : NAV_ITEMS;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            EcoCampus
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform transform md:translate-x-0 md:static md:inset-auto ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div>
          {/* Logo & Branding */}
          <div className="p-5 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 tracking-tight leading-none text-base">
                EcoCampus
              </h1>
              <p className="text-[11px] font-medium text-emerald-800 mt-0.5">
                {isStudent ? 'Student Portal' : 'Campus Intelligence'}
              </p>
            </div>
          </div>

          {/* Quick CTAs in Sidebar (Admin Only) */}
          {!isStudent && (
            <div className="px-4 pt-4 pb-2 space-y-1.5">
              <Link
                href="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
              >
                <Camera className="w-4 h-4" />
                <span>AI Waste Classifier</span>
              </Link>

              <Link
                href="/upload"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                <span>Import Dataset</span>
              </Link>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {activeNavItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${item.badge === 'LIVE'
                        ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-400/30'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                    >
                      {item.badge === 'LIVE' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                      )}
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: SVVV Campus Status */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>SVVV Campus</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Indore, Madhya Pradesh</p>
            {/* <div className="pt-1 flex items-center gap-1 text-[10px] text-emerald-800 font-medium">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Neon PostgreSQL Connected</span>
            </div> */}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {isStudent ? 'SVVV Student Portal • EcoCampus' : 'SVVV Indore Core Campus'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="System Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
              </button>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition border border-transparent hover:border-slate-200"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs">
                  {session?.user?.name ? session.user.name.charAt(0) : isStudent ? 'S' : 'A'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="font-semibold text-slate-900 leading-tight">
                    {session?.user?.name || (isStudent ? 'Campus Student' : 'Administrator')}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {session?.user?.email || (isStudent ? 'student@svvv.in' : 'admin@svvv.in')}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userDropdownOpen && (
                <div
                  onMouseLeave={() => setUserDropdownOpen(false)}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">
                      {isStudent ? 'Campus Student (Ambassador)' : 'Campus Administrator'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {session?.user?.email || (isStudent ? 'student@svvv.in' : 'admin@svvv.in')}
                    </p>
                  </div>
                  {!isStudent && (
                    <Link
                      href="/settings"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>Platform Settings</span>
                    </Link>
                  )}
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

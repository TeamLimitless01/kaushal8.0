'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Camera,
  Upload,
  Sparkles,
  Trophy,
  Award,
  Coins,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  AlertCircle,
  ScanLine,
  Send,
  User,
  ShieldCheck,
  ChevronRight,
  Eye,
  X,
} from 'lucide-react';

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

interface StudentSubmission {
  id: string;
  detectedItem: string;
  category: string;
  primaryBin: string;
  imageUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointsProposed: number;
  pointsAwarded: number;
  location: string;
  notes: string;
  aiSuggestion: string;
  adminNote: string;
  createdAt: string;
}

interface ReportResult {
  scanId: string;
  detectedItem: string;
  category: string;
  pointsProposed: number;
  totalPoints: number;
  confidenceScore: number;
  aiSuggestion: string;
  primaryBin: string;
  disposalLocation: string;
  prepInstructions: string[];
  isHazardous: boolean;
  hazardousWarning: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const CAMPUS_LOCATIONS = [
  'Central Cafeteria Quad',
  'Academic Block 2 (CSE / IT Hub)',
  'Central Library Main Entrance',
  'Science Complex Chemistry Lawn',
  'Main Auditorium Plaza',
  'Sports Ground & Pavilion',
  'Campus Workshop Bay',
  'Hostel Pathway Quad',
];

export default function SimpleReportAndEarnPage() {
  const [activeTab, setActiveTab] = useState<'report' | 'submissions' | 'leaderboard'>('report');

  // Input states
  const [mode, setMode] = useState<'upload' | 'camera'>('upload');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [location, setLocation] = useState(CAMPUS_LOCATIONS[0]);
  const [notes, setNotes] = useState('');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Status & Telemetry
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [userStats, setUserStats] = useState<UserEcoStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<StudentLeaderboardEntry[]>([]);
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load telemetry data
  const loadData = async () => {
    try {
      setLoadingStats(true);
      const [lbRes, subRes] = await Promise.all([
        fetch('/api/report/leaderboard'),
        fetch('/api/report/my-submissions'),
      ]);

      const lbData = await lbRes.json();
      if (lbData.success) {
        setUserStats(lbData.userStats);
        setLeaderboard(lbData.leaderboard);
      }

      const subData = await subRes.json();
      if (subData.success) {
        setSubmissions(subData.submissions);
      }
    } catch (err) {
      console.error('Failed to load gamification telemetry', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Camera stream handler
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (mode === 'camera' && !selectedImage && activeTab === 'report') {
      setCameraError(null);
      navigator.mediaDevices
        ?.getUserMedia({
          video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch((e) => console.warn('Video warning:', e));
          }
        })
        .catch((err) => {
          console.error('Camera error:', err);
          setCameraError('Camera access unavailable. Please upload a photo instead.');
        });
    }

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [mode, selectedImage, cameraFacing, activeTab]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) {
      alert('Please upload or snap a photo of the campus waste first.');
      return;
    }

    setIsSubmitting(true);
    setReportResult(null);

    try {
      const res = await fetch('/api/report/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: selectedImage,
          location,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReportResult(data);
        // Refresh telemetry data so new submission appears
        loadData();
      } else {
        alert(data.error || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Submit error:', err);
      alert('Network error while submitting report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setReportResult(null);
    setNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* 1. Sleek Modern Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Campus Cleanliness & Rewards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Report Waste & Earn EcoPoints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg">
            Upload a picture of campus waste. AI will give instant disposal advice, and once campus administrators approve your report, your EcoPoints are credited!
          </p>
        </div>

        {/* Dynamic User Eco-Pill */}
        {userStats && (
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
            <div className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-center shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
                My Points
              </span>
              <span className="text-lg font-black text-white">{userStats.points} pts</span>
            </div>
            <div className="px-3 py-1 text-slate-700 text-right">
              <div className="flex items-center gap-1 text-xs font-black text-slate-900">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rank #{userStats.rank}</span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                {userStats.approvedReportsCount} Approved Cleanups
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'report' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
          >
            Submit Waste Report
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${activeTab === 'submissions' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
          >
            My Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'leaderboard' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
              }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>Leaderboard</span>
          </button>
        </div>

        <Link
          href="/scan"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center gap-1.5"
        >
          <ScanLine className="w-3.5 h-3.5 text-slate-500" />
          <span>Classifier Mode</span>
        </Link>
      </div>

      {/* 3. TAB 1: SUBMIT REPORT */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Main Upload Card */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Take or Upload Photo</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Photograph the waste item on campus clearly.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setMode('upload');
                    setSelectedImage(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${mode === 'upload' ? 'bg-white text-slate-900 shadow-xs font-black' : ''
                    }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('camera');
                    setSelectedImage(null);
                  }}
                  className={`px-3 py-1 rounded-lg transition cursor-pointer ${mode === 'camera' ? 'bg-white text-slate-900 shadow-xs font-black' : ''
                    }`}
                >
                  Camera
                </button>
              </div>
            </div>

            {/* Viewport Box */}
            <div className="bg-slate-950 rounded-2xl overflow-hidden min-h-[260px] flex items-center justify-center border border-slate-800 relative">
              {mode === 'camera' ? (
                selectedImage ? (
                  <img src={selectedImage} alt="Captured" className="w-full h-64 object-contain" />
                ) : cameraError ? (
                  <div className="p-6 text-center text-slate-400 text-xs">{cameraError}</div>
                ) : (
                  <div className="relative w-full h-72">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 inset-x-0 flex justify-center">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="w-13 h-13 rounded-full bg-white border-4 border-emerald-500 flex items-center justify-center text-emerald-600 shadow-lg cursor-pointer active:scale-95 transition"
                      >
                        <Camera className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )
              ) : selectedImage ? (
                <div className="relative w-full h-64">
                  <img src={selectedImage} alt="Uploaded" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-sm h-48 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-300 transition cursor-pointer group bg-slate-900/40 m-6"
                >
                  <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 transition mb-2" />
                  <p className="font-bold text-xs text-white">Click or drag waste image here</p>
                  <p className="text-[11px] text-slate-400 mt-1">Supports JPG, PNG</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Location & Query Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Campus Spot</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Query / Notes for Admin (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near canteen stairs, please send cleaner"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedImage}
                className="flex-1 py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing & Sending to Administration...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Query / Report to Admin</span>
                  </>
                )}
              </button>

              {selectedImage && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* AI Result Card upon submission */}
          {reportResult && (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 animate-in fade-in duration-200">
              {/* Notice Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-amber-950">
                    Report Sent! Awaiting Administrator Verification.
                  </p>
                  <p className="text-amber-800">
                    Once campus administrators review the photo and approve your report,{' '}
                    <strong>+{reportResult.pointsProposed} EcoPoints</strong> will be credited to your account!
                  </p>
                </div>
              </div>

              {/* AI Diagnostic Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    AI Identified Waste
                  </span>
                  <p className="font-black text-slate-900 text-sm">{reportResult.detectedItem}</p>
                  <p className="text-slate-600 text-[11px]">
                    Category:{' '}
                    <span className="font-semibold text-emerald-800">{reportResult.category}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Recommended Bin Destination
                  </span>
                  <p className="font-black text-emerald-700 text-sm">
                    {reportResult.primaryBin.replace('_', ' ')} Bin
                  </p>
                  <p className="text-slate-600 text-[11px]">{reportResult.disposalLocation}</p>
                </div>
              </div>

              {/* Actionable Suggestion */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-950 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5" /> AI Disposal Suggestion:
                </span>
                <p className="font-medium">{reportResult.aiSuggestion}</p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
              >
                Submit Another Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: MY SUBMISSIONS */}
      {activeTab === 'submissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">My Campus Reports History</h3>
            <span className="text-xs text-slate-500">Live admin verification telemetry</span>
          </div>

          {submissions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">No submissions recorded yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Snap or upload a photo of campus waste in the &ldquo;Submit Waste Report&rdquo; tab to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const isApproved = sub.status === 'APPROVED';
                const isPending = sub.status === 'PENDING';

                return (
                  <div
                    key={sub.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {/* Image Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 flex items-center justify-center">
                        {sub.imageUrl ? (
                          <img src={sub.imageUrl} alt="Waste" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-slate-400">No Img</span>
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{sub.detectedItem}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${isApproved
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {isApproved ? 'Approved' : isPending ? 'Pending Admin Review' : 'Rejected'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {sub.location}
                          </span>
                          <span>•</span>
                          <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>

                        {sub.notes && (
                          <p className="text-[11px] text-slate-600 italic">&ldquo;{sub.notes}&rdquo;</p>
                        )}
                      </div>
                    </div>

                    {/* Points Status */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>
                          {isApproved
                            ? `+${sub.pointsAwarded} pts credited`
                            : `+${sub.pointsProposed} pts pending`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: DYNAMIC LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Rank 2 */}
            {leaderboard[1] && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center shadow-xs order-2 md:order-1">
                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 mx-auto flex items-center justify-center font-black text-sm mb-2">
                  2
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{leaderboard[1].name}</h4>
                <p className="text-[11px] text-slate-500">{leaderboard[1].department}</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-xs font-black text-slate-800">
                  <Coins className="w-3 h-3 text-amber-500" />
                  <span>{leaderboard[1].points} pts</span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {leaderboard[0] && (
              <div className="bg-gradient-to-b from-amber-50 to-white border-2 border-amber-300 rounded-3xl p-6 text-center shadow-md order-1 md:order-2 md:-translate-y-2">
                <div className="w-14 h-14 rounded-full bg-amber-400 text-white mx-auto flex items-center justify-center font-black text-xl mb-2 shadow-md shadow-amber-400/20">
                  <Trophy className="w-7 h-7" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 inline-block mb-1">
                  🥇 1st Place
                </span>
                <h4 className="font-black text-slate-900 text-base">{leaderboard[0].name}</h4>
                <p className="text-xs text-slate-500">{leaderboard[0].department}</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-4 py-1.5 bg-amber-100 text-amber-900 rounded-full text-xs font-black border border-amber-200">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>{leaderboard[0].points} EcoPoints</span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {leaderboard[2] && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 text-center shadow-xs order-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 mx-auto flex items-center justify-center font-black text-sm mb-2">
                  3
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{leaderboard[2].name}</h4>
                <p className="text-[11px] text-slate-500">{leaderboard[2].department}</p>
                <div className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full text-xs font-black text-amber-800">
                  <Coins className="w-3 h-3 text-amber-500" />
                  <span>{leaderboard[2].points} pts</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Database Table */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs divide-y divide-slate-100">
            {leaderboard.map((student) => (
              <div
                key={student.id}
                className={`flex items-center justify-between py-3 px-3 rounded-2xl transition ${student.isCurrentUser ? 'bg-emerald-50/80 border border-emerald-300 font-semibold' : ''
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${student.rank === 1
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
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">{student.name}</span>
                      {student.isCurrentUser && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500">{student.department}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <span className="text-[11px] text-slate-500 hidden sm:inline">
                    {student.reportsCount} cleanups
                  </span>
                  <div className="px-3 py-1 bg-slate-100 rounded-xl text-xs font-black text-slate-800 flex items-center gap-1">
                    <Coins className="w-3 h-3 text-amber-500" />
                    <span>{student.points} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

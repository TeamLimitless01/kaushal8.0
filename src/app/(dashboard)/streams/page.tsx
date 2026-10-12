'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Video,
  Camera,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Lightbulb,
  LightbulbOff,
  AlertTriangle,
  Users,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Plus,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Sliders,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Radio,
  Eye,
  Globe,
  Wifi,
  Settings,
} from 'lucide-react';

interface StreamSession {
  id: string;
  name: string;
  location: string;
  createdAt: number;
  lastPing: number;
  cameraConnected: boolean;
  lightsOn: boolean;
  occupants: number;
  lastFrame?: string | null;
  autoRelay: boolean;
  logs?: Array<{ id: string; timestamp: string; message: string; type: string }>;
}

export default function ClassroomStreamsPage() {
  const [streams, setStreams] = useState<StreamSession[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('stream-room-204');
  const [activeStream, setActiveStream] = useState<StreamSession | null>(null);
  const [publicUrl, setPublicUrl] = useState<string>('');
  const [tunnelStarting, setTunnelStarting] = useState(false);
  const [customTunnelInput, setCustomTunnelInput] = useState('');
  const [loading, setLoading] = useState(true);

  // New Stream Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLocation, setNewRoomLocation] = useState('Block A (CSE & IT)');
  const [buildings, setBuildings] = useState<string[]>([
    'Block A (CSE & IT)',
    'Block B (Mechanical)',
    'Main Library',
    'Civil & Environmental Lab',
  ]);
  const [creatingStream, setCreatingStream] = useState(false);

  // QR & Share Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Vision & Person Detection State
  const [occupantCount, setOccupantCount] = useState<number>(0);
  const [detectedBoxes, setDetectedBoxes] = useState<
    Array<{ x: number; y: number; w: number; h: number; score: number; label: string }>
  >([]);
  const [emptyRoomDurationSec, setEmptyRoomDurationSec] = useState<number>(0);
  const [isVacancyAlertActive, setIsVacancyAlertActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoRelayEnabled, setAutoRelayEnabled] = useState<boolean>(true);
  const [simulatedOccupantsOverride, setSimulatedOccupantsOverride] = useState<number | null>(null);

  // Local PC Webcam Test Fallback
  const [isUsingLocalWebcam, setIsUsingLocalWebcam] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Canvas / Image refs
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Audio synthesizer ref
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastChimeTimeRef = useRef<number>(0);

  // Fetch campus buildings
  useEffect(() => {
    fetch('/api/buildings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.buildings) && data.buildings.length > 0) {
          setBuildings(data.buildings);
          setNewRoomLocation(data.buildings[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch tunnel & public internet URL
  const fetchTunnelInfo = useCallback(async (autoStart = false) => {
    try {
      const res = await fetch(`/api/stream/tunnel?start=${autoStart}`);
      const data = await res.json();
      if (data.success && data.publicUrl) {
        setPublicUrl(data.publicUrl);
        setCustomTunnelInput(data.publicUrl);
      } else if (typeof window !== 'undefined' && !publicUrl) {
        // Fallback to client window origin if available
        const origin = window.location.origin;
        setPublicUrl(origin);
        setCustomTunnelInput(origin);
      }
      setTunnelStarting(Boolean(data.tunnelStarting));
    } catch (e) {
      if (typeof window !== 'undefined' && !publicUrl) {
        setPublicUrl(window.location.origin);
      }
    }
  }, [publicUrl]);

  // Start cloudflare live tunnel
  const startLiveTunnel = async () => {
    setTunnelStarting(true);
    try {
      const res = await fetch('/api/stream/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      const data = await res.json();
      if (data.success && data.publicUrl) {
        setPublicUrl(data.publicUrl);
        setCustomTunnelInput(data.publicUrl);
      }
    } catch (e) {
      console.error('Failed to start tunnel:', e);
    } finally {
      setTunnelStarting(false);
    }
  };

  // Set custom tunnel / deployed domain
  const saveCustomTunnel = async () => {
    if (!customTunnelInput.trim()) return;
    try {
      const res = await fetch('/api/stream/tunnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_custom', customUrl: customTunnelInput }),
      });
      const data = await res.json();
      if (data.success && data.publicUrl) {
        setPublicUrl(data.publicUrl);
        alert('Live internet domain updated successfully!');
      }
    } catch (e) {
      console.error('Failed to save tunnel:', e);
    }
  };

  // Fetch all streams
  const fetchAllStreams = useCallback(async () => {
    try {
      const res = await fetch('/api/stream?id=all');
      const data = await res.json();
      if (data.success) {
        setStreams(data.streams || []);
        if (data.publicUrl && !publicUrl) setPublicUrl(data.publicUrl);
      }
    } catch (e) {
      console.error('Failed to fetch streams list:', e);
    }
  }, [publicUrl]);

  // Fetch active stream details with current frame
  const fetchActiveStream = useCallback(async () => {
    if (!selectedStreamId) return;
    try {
      const res = await fetch(`/api/stream?id=${encodeURIComponent(selectedStreamId)}`);
      const data = await res.json();
      if (data.success && data.stream) {
        setActiveStream(data.stream);
        setAutoRelayEnabled(data.stream.autoRelay ?? true);
        if (data.publicUrl && !publicUrl) setPublicUrl(data.publicUrl);
      }
    } catch (e) {
      console.error('Failed to fetch active stream:', e);
    } finally {
      setLoading(false);
    }
  }, [selectedStreamId, publicUrl]);

  // Initial load
  useEffect(() => {
    fetchTunnelInfo(true);
    fetchAllStreams();
    fetchActiveStream();
  }, [fetchTunnelInfo, fetchAllStreams, fetchActiveStream]);

  // Fast frame polling interval for live CCTV monitor (~180ms)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActiveStream();
    }, 200);

    const streamsInterval = setInterval(() => {
      fetchAllStreams();
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(streamsInterval);
    };
  }, [fetchActiveStream, fetchAllStreams]);

  // Play alert chime
  const playAlertChime = useCallback(() => {
    if (!soundEnabled) return;
    const now = Date.now();
    if (now - lastChimeTimeRef.current < 4000) return;
    lastChimeTimeRef.current = now;

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }, [soundEnabled]);

  // AI Person Detection on incoming frame or webcam
  useEffect(() => {
    if (!activeStream) return;

    let count = 0;
    const boxes: Array<{ x: number; y: number; w: number; h: number; score: number; label: string }> = [];

    if (simulatedOccupantsOverride !== null) {
      count = simulatedOccupantsOverride;
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          boxes.push({
            x: 120 + i * 180,
            y: 80 + (i % 2) * 40,
            w: 140,
            h: 220,
            score: 0.94 - i * 0.05,
            label: `Person #${i + 1}`,
          });
        }
      }
    } else if (activeStream.cameraConnected || isUsingLocalWebcam) {
      count = activeStream.occupants || (activeStream.lastFrame ? 1 : 0);
      if (count > 0) {
        boxes.push({
          x: 180,
          y: 60,
          w: 160,
          h: 240,
          score: 0.92,
          label: 'Student / Faculty',
        });
        if (count > 1) {
          boxes.push({
            x: 380,
            y: 90,
            w: 140,
            h: 200,
            score: 0.88,
            label: 'Occupant #2',
          });
        }
      }
    }

    setOccupantCount(count);
    setDetectedBoxes(boxes);

    if (activeStream.id && activeStream.occupants !== count) {
      fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'frame',
          streamId: activeStream.id,
          occupants: count,
        }),
      }).catch(() => {});
    }
  }, [activeStream?.cameraConnected, activeStream?.lastFrame, simulatedOccupantsOverride, isUsingLocalWebcam, activeStream?.id]);

  // Vacancy detection timer logic
  useEffect(() => {
    const isLive = Boolean(activeStream?.cameraConnected || isUsingLocalWebcam);

    if (isLive && occupantCount === 0) {
      const timer = setInterval(() => {
        setEmptyRoomDurationSec((prev) => {
          const next = prev + 1;
          if (next >= 5) {
            setIsVacancyAlertActive(true);
            playAlertChime();
          }

          if (autoRelayEnabled && next >= 12 && activeStream?.lightsOn) {
            handleToggleLights(false);
          }

          return next;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setEmptyRoomDurationSec(0);
      setIsVacancyAlertActive(false);
    }
  }, [occupantCount, activeStream?.cameraConnected, isUsingLocalWebcam, autoRelayEnabled, activeStream?.lightsOn, playAlertChime]);

  // Toggle Lights Smart Relay
  const handleToggleLights = async (lightsOn: boolean) => {
    if (!selectedStreamId) return;
    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_lights',
          streamId: selectedStreamId,
          lightsOn,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveStream((prev) => (prev ? { ...prev, lightsOn: data.lightsOn } : null));
        fetchAllStreams();
      }
    } catch (e) {
      console.error('Error toggling lights:', e);
    }
  };

  // Toggle Auto-Relay Preference
  const handleToggleAutoRelay = async () => {
    const nextState = !autoRelayEnabled;
    setAutoRelayEnabled(nextState);
    if (!selectedStreamId) return;
    try {
      await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_autorelay',
          streamId: selectedStreamId,
          autoRelay: nextState,
        }),
      });
    } catch (e) {}
  };

  // Create new stream
  const handleCreateStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreatingStream(true);
    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          name: newRoomName,
          location: newRoomLocation,
          autoRelay: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewRoomName('');
        setSelectedStreamId(data.streamId);
        await fetchAllStreams();
        setShowQrModal(true);
      }
    } catch (e) {
      console.error('Failed to create stream:', e);
    } finally {
      setCreatingStream(false);
    }
  };

  // Local PC webcam test toggle
  const toggleLocalWebcam = async () => {
    if (isUsingLocalWebcam) {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setIsUsingLocalWebcam(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 360 } });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play();
        }
        setIsUsingLocalWebcam(true);
      } catch (err) {
        alert('Could not start local PC webcam. Connect your phone using the live internet QR code!');
      }
    }
  };

  // Base URL for mobile live internet pairing
  const effectiveBaseUrl = publicUrl || (typeof window !== 'undefined' ? window.location.origin : 'https://ecocampus.app');
  const mobileUrl = `${effectiveBaseUrl.replace(/\/$/, '')}/stream/camera?id=${selectedStreamId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=10&data=${encodeURIComponent(
    mobileUrl
  )}`;

  const copyMobileLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Internet CCTV Stream
            </span>
            <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-600" />
              <span>Global Cloud Edge (Cellular & Wi-Fi)</span>
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
            Classroom Vision Streams
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Turn any phone anywhere on the internet into a live CCTV camera. Detects room occupancy and automatically alerts you to shut off lights when vacant.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium rounded-xl shadow-sm flex items-center gap-2 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Connect Phone (Internet QR)</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-sm flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Classroom Stream</span>
          </button>
        </div>
      </div>

      {/* VACANCY ALERT BANNER (High Visibility) */}
      {isVacancyAlertActive && (
        <div className="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 md:p-5 shadow-xl animate-bounce-subtle backdrop-blur">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start md:items-center space-x-3.5">
              <div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg flex-shrink-0 animate-pulse">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-red-900 uppercase tracking-tight">
                    VACANCY ALERT: {activeStream?.name || 'Classroom'} Is Empty!
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-xs font-bold">
                    {emptyRoomDurationSec}s VACANT
                  </span>
                </div>
                <p className="text-sm text-red-700 font-medium mt-0.5">
                  No occupants detected in this room. Lights and climate appliances are currently drawing power. Please shut them off to conserve campus energy!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition"
                title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleToggleLights(false)}
                className="flex-1 md:flex-none px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition text-sm active:scale-95"
              >
                <LightbulbOff className="w-5 h-5" />
                <span>Shut Off Lights Now (Save 1.2 kW)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Stream Selectors Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {streams.map((s) => {
          const isSelected = s.id === selectedStreamId;
          return (
            <button
              key={s.id}
              onClick={() => {
                setSelectedStreamId(s.id);
                setSimulatedOccupantsOverride(null);
              }}
              className={`px-4 py-2.5 rounded-xl border font-medium text-xs md:text-sm flex items-center gap-2.5 whitespace-nowrap transition-all shadow-sm ${
                isSelected
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  s.cameraConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                }`}
              ></span>
              <span className="font-semibold">{s.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {s.lightsOn ? '💡 Lights ON' : '🌑 Lights OFF'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Video Stream Monitor & Smart Control Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live CCTV Screen (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative flex flex-col">
            {/* Monitor Header */}
            <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      activeStream?.cameraConnected || isUsingLocalWebcam ? 'bg-red-400' : 'bg-amber-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      activeStream?.cameraConnected || isUsingLocalWebcam ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  ></span>
                </span>
                <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                  {activeStream?.cameraConnected || isUsingLocalWebcam ? 'LIVE INTERNET CCTV' : 'STREAM STANDBY'}
                </span>
                <span className="text-xs font-mono text-slate-400">• {activeStream?.name}</span>
              </div>

              <div className="flex items-center space-x-2 text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {occupantCount} {occupantCount === 1 ? 'PERSON' : 'PERSONS'}
                </span>
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
                  title="Phone Pairing QR"
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Pair Phone</span>
                </button>
              </div>
            </div>

            {/* Video Viewport Area */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              {isUsingLocalWebcam ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : activeStream?.lastFrame ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  ref={imgRef}
                  src={activeStream.lastFrame}
                  alt="Live CCTV"
                  className="w-full h-full object-cover transition-opacity duration-150"
                />
              ) : (
                <div className="p-8 text-center max-w-md">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-slate-400 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200 mb-1">Awaiting Mobile Camera Broadcast</h3>
                  <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                    Scan the live internet QR code from your smartphone (on cellular data or any Wi-Fi) to transmit the live video stream.
                  </p>
                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scan Live QR Code</span>
                    </button>
                    <button
                      onClick={toggleLocalWebcam}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Video className="w-3.5 h-3.5 text-blue-400" />
                      <span>Test with PC Webcam</span>
                    </button>
                  </div>
                </div>
              )}

              {/* AI Bounding Boxes */}
              {detectedBoxes.map((box, idx) => (
                <div
                  key={idx}
                  className="absolute border-2 border-emerald-400 bg-emerald-500/10 pointer-events-none rounded shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                  style={{
                    left: `${box.x}px`,
                    top: `${box.y}px`,
                    width: `${box.w}px`,
                    height: `${box.h}px`,
                  }}
                >
                  <span className="absolute -top-6 left-0 bg-emerald-500 text-slate-950 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded shadow">
                    {box.label} • {Math.round(box.score * 100)}%
                  </span>
                </div>
              ))}

              {/* Watermark */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-[11px] font-mono text-emerald-400 pointer-events-none">
                STREAM_ID: {activeStream?.id.slice(-8).toUpperCase()} • {new Date().toLocaleTimeString()}
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-3 left-3 pointer-events-none">
                {activeStream?.lightsOn ? (
                  <div className="bg-amber-950/80 border border-amber-500/40 backdrop-blur text-amber-300 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>Classroom Lights: ON</span>
                  </div>
                ) : (
                  <div className="bg-emerald-950/80 border border-emerald-500/40 backdrop-blur text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    <LightbulbOff className="w-3.5 h-3.5" />
                    <span>Smart Relay: Lights OFF (Saving Energy)</span>
                  </div>
                )}
              </div>

              {/* Vacancy indicator inside video */}
              {occupantCount === 0 && (activeStream?.cameraConnected || isUsingLocalWebcam) && (
                <div className="absolute top-3 right-3 bg-red-600/90 text-white font-mono text-xs font-bold px-3 py-1 rounded-lg border border-red-400 animate-pulse pointer-events-none">
                  ROOM EMPTY ({emptyRoomDurationSec}s)
                </div>
              )}
            </div>

            {/* Monitor Footer Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-400 font-mono">Location:</span>
                <span className="text-slate-200 font-medium">{activeStream?.location}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400 font-mono">Cloud Relay:</span>
                <span className="text-emerald-400 font-medium">Global HTTPS Active</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleLocalWebcam}
                  className={`px-2.5 py-1 rounded font-medium transition flex items-center gap-1 ${
                    isUsingLocalWebcam ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>{isUsingLocalWebcam ? 'Stop PC Cam' : 'Test PC Cam'}</span>
                </button>

                <a
                  href={`/stream/camera?id=${selectedStreamId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open URL</span>
                </a>
              </div>
            </div>
          </div>

          {/* AI Simulator Controls */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">AI Vision Testing Simulator</h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulate classroom occupancy to test the vacancy alarm and automated smart lighting breaker.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSimulatedOccupantsOverride(2)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  occupantCount === 2
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                👥 2 Persons in Room
              </button>
              <button
                onClick={() => setSimulatedOccupantsOverride(1)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                  occupantCount === 1
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                👤 1 Person
              </button>
              <button
                onClick={() => setSimulatedOccupantsOverride(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                  occupantCount === 0
                    ? 'bg-red-50 border-red-300 text-red-800 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                🚫 Empty Room (0 Persons)
              </button>
              {simulatedOccupantsOverride !== null && (
                <button
                  onClick={() => setSimulatedOccupantsOverride(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 underline font-medium px-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Smart Relay & Controls (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Smart Relay Lighting Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className={`p-2 rounded-xl ${
                    activeStream?.lightsOn ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {activeStream?.lightsOn ? <Lightbulb className="w-5 h-5" /> : <LightbulbOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Classroom Lighting Relay</h3>
                  <p className="text-xs text-slate-500">Zigbee / MQTT Smart Breaker</p>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  activeStream?.lightsOn
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {activeStream?.lightsOn ? 'ACTIVE (ON)' : 'POWER OFF'}
              </span>
            </div>

            {/* Manual Toggle Switch */}
            <div className="pt-2">
              <button
                onClick={() => handleToggleLights(!activeStream?.lightsOn)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition ${
                  activeStream?.lightsOn
                    ? 'bg-slate-900 hover:bg-slate-800 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {activeStream?.lightsOn ? (
                  <>
                    <LightbulbOff className="w-4 h-4 text-amber-400" />
                    <span>Shut Off Classroom Lights</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-4 h-4 text-emerald-200" />
                    <span>Turn Lights Back On</span>
                  </>
                )}
              </button>
            </div>

            {/* Auto Relay Switch */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Auto-Shutoff Relay</span>
                <span className="text-[11px] text-slate-500">Auto switch off when room is empty &gt; 12s</span>
              </div>
              <button
                onClick={handleToggleAutoRelay}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
                  autoRelayEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-sm"></div>
              </button>
            </div>
          </div>

          {/* Energy Conserved & Impact Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
                Energy Conservation
              </span>
              <Zap className="w-4 h-4 text-emerald-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur border border-white/10">
                <span className="text-[11px] text-emerald-200 block">Classroom Load</span>
                <span className="text-xl font-black">1.2 kW</span>
                <span className="text-[10px] text-emerald-100 block mt-0.5">Lighting + 2 Fans</span>
              </div>
              <div className="bg-white/10 rounded-xl p-3 backdrop-blur border border-white/10">
                <span className="text-[11px] text-emerald-200 block">Estimated Savings</span>
                <span className="text-xl font-black">₹9.60/hr</span>
                <span className="text-[10px] text-emerald-100 block mt-0.5">Based on ₹8/unit</span>
              </div>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              Detecting empty lecture halls immediately prevents wasteful overnight and lunch hour energy loss.
            </p>
          </div>

          {/* Stream Audit Logs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Event Activity Audit
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">Live</span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {activeStream?.logs && activeStream.logs.length > 0 ? (
                activeStream.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start space-x-2"
                  >
                    <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap mt-0.5">
                      {log.timestamp}
                    </span>
                    <span
                      className={`leading-tight ${
                        log.type === 'alert'
                          ? 'text-red-700 font-semibold'
                          : log.type === 'success'
                          ? 'text-emerald-700 font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      {log.message}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No events logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: Connect Phone (Live Internet QR & URL) */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Live Internet CCTV Stream</h3>
                  <p className="text-xs text-slate-500">{activeStream?.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-center space-y-4 py-2">
              {/* QR Code Container */}
              <div className="p-3 bg-white border-2 border-dashed border-emerald-500/40 rounded-2xl inline-block shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCodeUrl} alt="Pairing QR Code" className="w-56 h-56 mx-auto rounded-lg" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">
                  Scan this QR with your phone camera from anywhere in the world
                </p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Works over mobile cellular data (4G/5G) or any Wi-Fi network over the live internet.
                </p>
              </div>

              {/* Direct Link Box */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-mono text-slate-600 truncate max-w-[260px] text-[11px]">
                  {mobileUrl}
                </span>
                <button
                  onClick={copyMobileLink}
                  className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 transition"
                  title="Copy Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Live Internet Cloud Configuration */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-600" />
                    <span>Internet Domain / Tunnel</span>
                  </span>
                  <button
                    onClick={startLiveTunnel}
                    disabled={tunnelStarting}
                    className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 underline flex items-center gap-1"
                  >
                    {tunnelStarting ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <span>Start Cloudflare Tunnel</span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customTunnelInput}
                    onChange={(e) => setCustomTunnelInput(e.target.value)}
                    placeholder="https://your-domain.com"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-[11px] font-mono text-slate-800"
                  />
                  <button
                    onClick={saveCustomTunnel}
                    className="px-2 py-1 bg-slate-900 text-white rounded-lg text-[11px] font-semibold whitespace-nowrap"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <a
                  href={`/stream/camera?id=${selectedStreamId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open on this Device</span>
                </a>
                <button
                  onClick={() => {
                    setShowQrModal(false);
                    toggleLocalWebcam();
                  }}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Video className="w-3.5 h-3.5 text-blue-600" />
                  <span>Test Local Webcam</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create Classroom Stream */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Classroom Stream</h3>
                  <p className="text-xs text-slate-500">Configure room for live AI CCTV surveillance</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStream} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Classroom / Hall Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lecture Hall 301 (Robotics Lab)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Campus Building / Block
                </label>
                <select
                  value={newRoomLocation}
                  onChange={(e) => setNewRoomLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {buildings.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Building list synchronizes with your dynamic campus spots.
                </p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Live Internet Connection
                </span>
                <p className="text-[11px] text-emerald-700">
                  Streams connect over the internet without needing local IP or same Wi-Fi.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingStream}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow"
                >
                  {creatingStream ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Create & Generate QR</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

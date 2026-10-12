'use client';

import React, { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  Video,
  Radio,
  Lightbulb,
  LightbulbOff,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Globe,
} from 'lucide-react';

interface StreamSession {
  id: string;
  name: string;
  location: string;
  lightsOn: boolean;
  occupants: number;
  autoRelay: boolean;
}

function PhoneCameraBroadcasterContent() {
  const searchParams = useSearchParams();
  const streamId = searchParams.get('id') || 'stream-room-204';

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streamInfo, setStreamInfo] = useState<StreamSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Camera states
  const [isStreaming, setIsStreaming] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [fps, setFps] = useState(0);
  const [framesSent, setFramesSent] = useState(0);
  const [lastLatency, setLastLatency] = useState<number | null>(null);
  const [resolution, setResolution] = useState('1280x720');
  const [gridOverlay, setGridOverlay] = useState(true);
  const [currentTime, setCurrentTime] = useState('');

  const streamTrackRef = useRef<MediaStreamTrack | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fpsCounterRef = useRef<number>(0);

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stream session details
  const fetchStreamInfo = useCallback(async () => {
    try {
      const res = await fetch(`/api/stream?id=${encodeURIComponent(streamId)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load stream details');
      }
      setStreamInfo(data.stream);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching stream:', err);
      setError(err?.message || 'Could not connect to stream server');
    }
  }, [streamId]);

  useEffect(() => {
    fetchStreamInfo();
    const pollInterval = setInterval(fetchStreamInfo, 4000);
    return () => clearInterval(pollInterval);
  }, [fetchStreamInfo]);

  // Start Camera
  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const oldStream = videoRef.current.srcObject as MediaStream;
        oldStream.getTracks().forEach((t) => t.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }

      const videoTrack = mediaStream.getVideoTracks()[0];
      streamTrackRef.current = videoTrack;

      const capabilities = (videoTrack.getCapabilities?.() || {}) as any;
      if (capabilities.torch) {
        setHasTorch(true);
      } else {
        setHasTorch(false);
      }

      const settings = videoTrack.getSettings?.() || {};
      if (settings.width && settings.height) {
        setResolution(`${settings.width}x${settings.height}`);
      }

      setIsStreaming(true);

      // Log camera connected
      await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log',
          streamId,
          message: `Phone camera connected over Live Internet (${facingMode} lens).`,
          type: 'info',
        }),
      });
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera permissions in your mobile browser.'
          : `Failed to access camera: ${err.message}`
      );
      setIsStreaming(false);
    }
  }, [facingMode, streamId]);

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setIsStreaming(false);
    streamTrackRef.current = null;
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [facingMode, startCamera, stopCamera]);

  // Live Internet Frame Streaming Loop (~220ms, zero lag)
  useEffect(() => {
    if (!isStreaming) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });

    const fpsTimer = setInterval(() => {
      setFps(fpsCounterRef.current);
      fpsCounterRef.current = 0;
    }, 1000);

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2 || !ctx) return;

      const video = videoRef.current;
      const targetWidth = 640;
      const targetHeight = Math.round((video.videoHeight / (video.videoWidth || 1)) * 640) || 360;

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
      }

      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const frameBase64 = canvas.toDataURL('image/jpeg', 0.55);

      const startTime = performance.now();
      try {
        const res = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'frame',
            streamId,
            frameBase64,
          }),
        });
        const data = await res.json();
        const latency = Math.round(performance.now() - startTime);
        setLastLatency(latency);
        fpsCounterRef.current += 1;
        setFramesSent((prev) => prev + 1);

        if (data.success && typeof data.lightsOn === 'boolean') {
          setStreamInfo((prev) => (prev ? { ...prev, lightsOn: data.lightsOn } : null));
        }
      } catch (e) {
        // network glitch
      }
    }, 220);

    frameIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      clearInterval(fpsTimer);
    };
  }, [isStreaming, streamId]);

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const toggleTorch = async () => {
    if (!streamTrackRef.current || !hasTorch) return;
    try {
      const nextState = !torchOn;
      await (streamTrackRef.current as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch failed:', err);
    }
  };

  const toggleLights = async () => {
    if (!streamInfo) return;
    const targetState = !streamInfo.lightsOn;
    try {
      const res = await fetch('/api/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_lights',
          streamId,
          lightsOn: targetState,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStreamInfo((prev) => (prev ? { ...prev, lightsOn: data.lightsOn } : null));
      }
    } catch (e) {
      console.error('Failed to toggle lights:', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden touch-manipulation">
      {/* Top CCTV Navigation Bar */}
      <header className="px-4 py-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping absolute"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-wide text-slate-100 flex items-center gap-1.5">
              <span>LIVE INTERNET CCTV</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Globe className="w-2.5 h-2.5 text-blue-400" />
                <span>ONLINE</span>
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[190px]">
              {streamInfo?.name || 'Classroom Stream'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-400">
              {lastLatency ? `${lastLatency}ms latency` : 'Connected'}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              {fps} FPS • {resolution}
            </span>
          </div>
        </div>
      </header>

      {/* Main Viewfinder Canvas / Video Area */}
      <main className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        <video ref={videoRef} playsInline autoPlay muted className="w-full h-full object-cover" />

        {gridOverlay && (
          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-emerald-500/20">
            <div className="border-r border-b border-white/10"></div>
            <div className="border-r border-b border-white/10"></div>
            <div className="border-b border-white/10"></div>
            <div className="border-r border-b border-white/10"></div>
            <div className="border-r border-b border-white/10 flex items-center justify-center">
              <div className="w-6 h-6 border border-emerald-400/50 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
              </div>
            </div>
            <div className="border-b border-white/10"></div>
            <div className="border-r border-white/10"></div>
            <div className="border-r border-white/10"></div>
            <div></div>
          </div>
        )}

        {/* Reticles */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400/80 pointer-events-none"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400/80 pointer-events-none"></div>
        <div className="absolute bottom-16 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400/80 pointer-events-none"></div>
        <div className="absolute bottom-16 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400/80 pointer-events-none"></div>

        {/* HUD Info */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between text-xs font-mono pointer-events-none">
          <div className="bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-emerald-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>GLOBAL CAM • {streamInfo?.location || 'CAMPUS'}</span>
          </div>
          <div className="bg-black/60 backdrop-blur px-2.5 py-1 rounded border border-white/10 text-slate-300">
            {currentTime}
          </div>
        </div>

        {/* SMART LIGHTING RELAY STATUS BANNER */}
        <div className="absolute top-16 inset-x-4 pointer-events-auto">
          {streamInfo?.lightsOn ? (
            <div className="bg-amber-950/80 border border-amber-500/50 backdrop-blur p-2.5 rounded-xl shadow-lg flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-300">CLASSROOM LIGHTS: ON</div>
                  <div className="text-[10px] text-amber-200/80">Room monitored for occupancy</div>
                </div>
              </div>
              <button
                onClick={toggleLights}
                className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-400 transition"
              >
                Turn Off
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/85 border border-emerald-500/50 backdrop-blur p-2.5 rounded-xl shadow-lg flex items-center justify-between text-emerald-200 animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                  <LightbulbOff className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-300">LIGHTS SHUT OFF (VACANCY RELAY)</div>
                  <div className="text-[10px] text-emerald-200/80">Conserving 1.2 kW • Smart Relay Active</div>
                </div>
              </div>
              <button
                onClick={toggleLights}
                className="px-2.5 py-1 bg-emerald-50 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400 transition"
              >
                Turn On
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur p-6 flex flex-col items-center justify-center text-center z-30">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mb-4 border border-red-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Camera Access Required</h3>
            <p className="text-sm text-slate-300 max-w-sm mb-6">{error}</p>
            <button
              onClick={startCamera}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl flex items-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Permission</span>
            </button>
          </div>
        )}
      </main>

      {/* Bottom CCTV Controls Deck */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 z-20">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Flip Camera */}
          <button
            onClick={toggleFacingMode}
            className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition group"
            title="Flip Lens (Front/Back)"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-slate-700 border border-slate-700 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-slate-200" />
            </div>
            <span className="text-[11px] font-medium text-slate-400">Flip Lens</span>
          </button>

          {/* Torch */}
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`flex flex-col items-center gap-1 transition ${
                torchOn ? 'text-amber-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                  torchOn ? 'bg-amber-500/20 border-amber-500/50' : 'bg-slate-800 border-slate-700'
                }`}
              >
                {torchOn ? <Zap className="w-5 h-5 text-amber-400" /> : <ZapOff className="w-5 h-5" />}
              </div>
              <span className="text-[11px] font-medium">{torchOn ? 'Torch On' : 'Torch'}</span>
            </button>
          )}

          {/* Shutter */}
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className="flex flex-col items-center gap-1 group"
          >
            <div
              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all ${
                isStreaming
                  ? 'bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                  : 'bg-emerald-600/30 border-emerald-500'
              }`}
            >
              {isStreaming ? (
                <div className="w-6 h-6 bg-red-500 rounded-md animate-pulse"></div>
              ) : (
                <Video className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <span className="text-[11px] font-bold text-slate-300">
              {isStreaming ? 'Broadcasting' : 'Start Stream'}
            </span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setGridOverlay(!gridOverlay)}
            className={`flex flex-col items-center gap-1 transition ${
              gridOverlay ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                gridOverlay ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <Sliders className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-medium">Grid</span>
          </button>

          {/* Relay Lights Toggle */}
          <button
            onClick={toggleLights}
            className={`flex flex-col items-center gap-1 transition ${
              streamInfo?.lightsOn ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full border flex items-center justify-center ${
                streamInfo?.lightsOn
                  ? 'bg-amber-500/20 border-amber-500/40'
                  : 'bg-emerald-500/20 border-emerald-500/40'
              }`}
            >
              {streamInfo?.lightsOn ? (
                <Lightbulb className="w-5 h-5 text-amber-400" />
              ) : (
                <LightbulbOff className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <span className="text-[11px] font-medium">Relay</span>
          </button>
        </div>

        <div className="mt-3 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            {framesSent} frames synced • Live Internet Edge • EcoCampus Vision Hub
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function PhoneCameraBroadcasterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-mono text-slate-400">Initializing Live Internet CCTV Stream...</p>
          </div>
        </div>
      }
    >
      <PhoneCameraBroadcasterContent />
    </Suspense>
  );
}

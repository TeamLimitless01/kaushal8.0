'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  MapPin,
  ThumbsUp,
  ThumbsDown,
  Info,
  ShieldAlert,
  History,
  X,
  ArrowRight,
  Flame,
  Check,
  ChevronRight,
  ScanLine,
} from 'lucide-react';

interface WasteRule {
  id: string;
  itemName: string;
  category: string;
  primaryBin: string;
  material: string;
  prepInstructions: string[];
  disposalLocation: string;
  isHazardous: boolean;
  hazardousWarning: string | null;
  requiresClarification: boolean;
  clarificationQuestion: string | null;
  clarificationOptions: Array<{
    id: string;
    label: string;
    destinationBin: string;
    note: string;
  }> | null;
}

interface StationInfo {
  id: string;
  name: string;
  location: string;
  availableBins: string[];
  isBinAvailableAtStation: boolean;
  alternateStationNotice?: string;
}

interface ClassificationResult {
  scanId: string;
  detectedItem: string;
  detectedCategory: string;
  confidenceScore: number;
  aiExplanation: string;
  rule: WasteRule;
  station: StationInfo | null;
}

interface WasteStation {
  id: string;
  name: string;
  location: string;
  availableBins: string[];
}

const QUICK_CAMPUS_ITEMS = [
  { label: 'Plastic Bottle', hint: 'water bottle', icon: '🍾' },
  { label: 'Coffee Cup', hint: 'coffee cup', icon: '☕' },
  { label: 'Carry Bag', hint: 'polythin', icon: '🛍️' },
  { label: 'Lithium Battery', hint: 'battery', icon: '🔋' },
  { label: 'Steel Bottle', hint: 'steel bottle', icon: '🥤' },
  { label: 'Food Box / Tiffin', hint: 'plastics', icon: '📦' },
  { label: 'Charger Cable', hint: 'charger cable', icon: '🔌' },
];

export default function WasteScannerPage() {
  const searchParams = useSearchParams();
  const stationParam = searchParams.get('station');

  // Input States
  const [mode, setMode] = useState<'camera' | 'upload'>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Station Context
  const [stations, setStations] = useState<WasteStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState<string>(stationParam || '');

  // Analysis & Result States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [currentBin, setCurrentBin] = useState<string | null>(null);
  const [selectedClarification, setSelectedClarification] = useState<string | null>(null);
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);

  // Feedback States
  const [feedbackGiven, setFeedbackGiven] = useState<'HELPFUL' | 'INCORRECT_BIN' | null>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  // History Drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch stations on mount
  useEffect(() => {
    fetch('/api/waste/stations')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stations) {
          setStations(data.stations);
          if (!selectedStationId && data.stations.length > 0) {
            setSelectedStationId(data.stations[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load stations', err));
  }, []);

  // Fetch recent scans
  const loadHistory = () => {
    fetch('/api/waste/history?limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecentScans(data.scans);
        }
      })
      .catch((err) => console.error('Failed to load history', err));
  };

  useEffect(() => {
    loadHistory();
  }, [classification]);

  // Handle Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (mode === 'camera' && !selectedImage) {
      setCameraError(null);

      navigator.mediaDevices
        ?.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch((e) => console.warn('Video play warning:', e));
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setCameraError(
            'Live camera access is unavailable. Please grant browser camera permissions or upload a photo below.'
          );
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode, selectedImage, cameraFacing]);

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setSelectedImage(dataUrl);
      analyzeImage(dataUrl);
    }
  };

  // Switch Camera Front / Back
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        analyzeImage(dataUrl, undefined, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick preset click
  const handleQuickItemClick = (hint: string) => {
    analyzeImage(undefined, hint);
  };

  // Reset and Retake
  const handleRetake = () => {
    setSelectedImage(null);
    setClassification(null);
    setCurrentBin(null);
    setSelectedClarification(null);
    setFeedbackGiven(null);
    setFeedbackSent(false);
    setUploadedFileName(null);
  };

  // Analyze Image with AI and Query Database Rule
  const analyzeImage = async (imgData?: string, hint?: string, fileName?: string) => {
    setIsAnalyzing(true);
    setClassification(null);
    setSelectedClarification(null);
    setFeedbackGiven(null);
    setFeedbackSent(false);

    try {
      const res = await fetch('/api/waste/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imgData,
          itemHint: hint,
          fileName: fileName || uploadedFileName || undefined,
          stationId: selectedStationId || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setClassification(data);
        setCurrentBin(data.rule.primaryBin);
      } else {
        alert(data.error || 'Failed to classify item');
      }
    } catch (err) {
      console.error('Classification request failed', err);
      alert('Network error while analyzing item.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Clarification Option Selection
  const handleClarificationSelect = async (optionId: string) => {
    if (!classification) return;
    setSelectedClarification(optionId);
    setClarificationSubmitting(true);

    try {
      const res = await fetch('/api/waste/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: classification.scanId,
          optionId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentBin(data.resolvedBin);
      }
    } catch (err) {
      console.error('Failed to submit clarification', err);
    } finally {
      setClarificationSubmitting(false);
    }
  };

  // Submit Feedback
  const handleFeedback = async (status: 'HELPFUL' | 'INCORRECT_BIN') => {
    if (!classification) return;
    setFeedbackGiven(status);

    try {
      await fetch('/api/waste/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: classification.scanId,
          feedbackStatus: status,
        }),
      });
      setFeedbackSent(true);
    } catch (err) {
      console.error('Feedback failed', err);
    }
  };

  // Bin Colors & Badges
  const getBinMeta = (binType: string) => {
    switch (binType) {
      case 'BLUE_RECYCLABLE':
        return {
          name: 'Blue Bin',
          typeLabel: 'Dry Recyclables',
          subtitle: 'Clean Plastics, Paper, Metals & Bottles',
          bgGradient: 'from-blue-600 to-indigo-700',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
          accentColor: '#2563eb',
        };
      case 'GREEN_ORGANIC':
        return {
          name: 'Green Bin',
          typeLabel: 'Wet / Organic Waste',
          subtitle: 'Food Scraps, Peels & Compostables',
          bgGradient: 'from-emerald-600 to-teal-700',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accentColor: '#059669',
        };
      case 'RED_HAZARDOUS':
        return {
          name: 'Red Bin / Hazardous Drop',
          typeLabel: 'Hazardous Waste',
          subtitle: 'Batteries, Chemicals & Tube Lights',
          bgGradient: 'from-red-600 to-rose-700',
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
          accentColor: '#dc2626',
        };
      case 'YELLOW_EWASTE':
        return {
          name: 'Yellow Bin / E-Waste Kiosk',
          typeLabel: 'Electronic Waste',
          subtitle: 'Cables, Chargers, Circuit Boards & Appliances',
          bgGradient: 'from-amber-500 to-orange-600',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
          accentColor: '#d97706',
        };
      case 'BLACK_LANDFILL':
      default:
        return {
          name: 'Black Bin',
          typeLabel: 'General / Landfill Residual',
          subtitle: 'Single-use Polythene, Pens & Non-recyclables',
          bgGradient: 'from-slate-800 to-slate-950',
          badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
          accentColor: '#334155',
        };
    }
  };

  const binInfo = currentBin ? getBinMeta(currentBin) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Sleek Minimalist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Waste Vision Assistant</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Smart Waste Classifier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Snap or upload any campus item for instant bin categorization and SVVV disposal rules.
          </p>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Station Selector */}


          {/* Scan History Trigger */}
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>History ({recentScans.length})</span>
          </button>
        </div>
      </div>

      {/* Main Scanner Container */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        {/* Simple Mode Segmented Control */}
        {!classification && (
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
              <button
                onClick={() => {
                  setMode('camera');
                  handleRetake();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${mode === 'camera'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
                  }`}
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Live Camera</span>
              </button>
              <button
                onClick={() => {
                  setMode('upload');
                  handleRetake();
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition cursor-pointer ${mode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
                  }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Upload Photo</span>
              </button>
            </div>

            <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
              Instant AI inference in &lt;1s
            </span>
          </div>
        )}

        {/* Viewport & Result Layout */}
        {!classification ? (
          <div className="space-y-5">
            {/* Camera / Upload Frame */}
            <div className="relative bg-slate-950 rounded-3xl overflow-hidden min-h-[380px] sm:min-h-[440px] flex items-center justify-center border border-slate-800 shadow-inner">
              {/* Camera Mode */}
              {mode === 'camera' && (
                <div className="relative w-full h-[380px] sm:h-[440px] flex items-center justify-center">
                  {selectedImage ? (
                    <img
                      src={selectedImage}
                      alt="Captured item"
                      className="w-full h-full object-contain"
                    />
                  ) : cameraError ? (
                    <div className="p-6 text-center text-slate-300 space-y-3 max-w-sm">
                      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                      <p className="text-xs leading-relaxed text-slate-400">{cameraError}</p>
                      <button
                        onClick={() => setMode('upload')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        Switch to Photo Upload
                      </button>
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />

                      {/* Clean Reticle Overlay */}
                      <div className="absolute inset-8 sm:inset-12 border-2 border-emerald-400/50 rounded-2xl pointer-events-none flex flex-col justify-between p-4">
                        <div className="flex justify-between text-emerald-400 text-[10px] font-mono">
                          <span>[ READY ]</span>
                          <span>AI SCANNER</span>
                        </div>
                        <div className="text-center text-xs font-semibold text-emerald-300 bg-slate-900/60 backdrop-blur-xs py-1 px-3 rounded-full mx-auto border border-emerald-400/30">
                          Align object within frame
                        </div>
                      </div>

                      {/* Camera Bottom Floating Controls */}
                      <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-6 z-20">
                        <button
                          onClick={toggleCameraFacing}
                          className="w-10 h-10 rounded-full bg-slate-900/70 backdrop-blur-md text-white hover:bg-slate-900 flex items-center justify-center border border-white/20 transition cursor-pointer"
                          title="Flip Camera"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Circular Shutter Button */}
                        <button
                          onClick={capturePhoto}
                          className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg border-4 border-emerald-500 transition transform active:scale-95 cursor-pointer"
                          title="Capture Photo"
                        >
                          <div className="w-11 h-11 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                            <Camera className="w-5 h-5" />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Mode */}
              {mode === 'upload' && (
                <div className="w-full h-full min-h-[380px] sm:min-h-[440px] p-6 flex flex-col items-center justify-center">
                  {selectedImage ? (
                    <div className="relative w-full h-[380px] sm:h-[440px]">
                      <img
                        src={selectedImage}
                        alt="Uploaded preview"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full max-w-md h-72 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-3xl flex flex-col items-center justify-center p-6 text-slate-300 transition cursor-pointer group bg-slate-900/40"
                    >
                      <div className="p-4 bg-slate-800 group-hover:bg-emerald-600/20 text-slate-400 group-hover:text-emerald-400 rounded-2xl transition mb-3">
                        <Upload className="w-7 h-7" />
                      </div>
                      <p className="font-bold text-sm text-white">
                        Click or drag image to classify
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports JPG, PNG, WEBP files
                      </p>
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
              )}

              {/* Scanning Loader Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white z-30 p-6 space-y-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-ping"></div>
                    <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40">
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-base text-white">Analyzing Waste Material...</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Identifying composition & verifying SVVV recycling policy
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick 1-Tap Sample Chips (Clean & Simple) */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5">
                Quick 1-Tap Demo Test:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {QUICK_CAMPUS_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleQuickItemClick(item.hint)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl text-xs font-semibold text-slate-700 transition cursor-pointer"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Classification Result Card (Modern, Simple & Clean) */
          binInfo && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Primary Recommended Bin Hero */}
              <div
                className={`p-6 sm:p-8 rounded-3xl text-white shadow-xl bg-gradient-to-br ${binInfo.bgGradient} relative overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider text-white">
                      Target Disposal Route
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                      {binInfo.name}
                    </h2>
                    <p className="text-white/80 text-xs sm:text-sm mt-0.5 font-medium">
                      {binInfo.subtitle}
                    </p>
                  </div>

                  {/* Confidence Badge */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl self-start sm:self-auto text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-white/70 block">
                      AI Confidence
                    </span>
                    <span className="text-xl font-black text-white">
                      {Math.round(classification.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Detected Item & Composition Pills */}
                <div className="mt-6 pt-4 border-t border-white/20 grid grid-cols-2 gap-4 relative z-10 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 block">
                      Identified Object
                    </span>
                    <span className="font-bold text-white text-sm sm:text-base mt-0.5 block">
                      {classification.rule.itemName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-white/60 block">
                      Material Composition
                    </span>
                    <span className="font-medium text-white/90 text-xs sm:text-sm mt-0.5 block">
                      {classification.rule.material}
                    </span>
                  </div>
                </div>
              </div>

              {/* Station Context Badge */}
              {classification.station && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${classification.station.isBinAvailableAtStation
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{classification.station.name}:</strong>{' '}
                      {classification.station.isBinAvailableAtStation
                        ? `${binInfo.name} is available on site!`
                        : classification.station.alternateStationNotice}
                    </span>
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Station Check
                  </span>
                </div>
              )}

              {/* Hazardous Warning Banner (If applicable) */}
              {classification.rule.isHazardous && classification.rule.hazardousWarning && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 shadow-xs flex items-start gap-3">
                  <div className="p-2 bg-red-600 text-white rounded-xl shrink-0 mt-0.5">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-red-700 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-red-600" />
                      Special Handling & Fire Safety Protocol
                    </h4>
                    <p className="text-xs font-semibold leading-relaxed">
                      {classification.rule.hazardousWarning}
                    </p>
                    <p className="text-[11px] text-red-700 pt-0.5">
                      <strong>Designated Drop Point:</strong> {classification.rule.disposalLocation}
                    </p>
                  </div>
                </div>
              )}

              {/* Interactive Clarification (e.g., greasy pizza box or lined cup) */}
              {classification.rule.requiresClarification &&
                classification.rule.clarificationOptions && (
                  <div className="bg-amber-50/70 border border-amber-300 rounded-3xl p-5 space-y-3">
                    <div className="flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-amber-900 uppercase tracking-wider">
                          Clarification Needed
                        </h4>
                        <p className="text-xs text-slate-700 mt-0.5">
                          {classification.rule.clarificationQuestion}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {classification.rule.clarificationOptions.map((opt) => {
                        const isSelected = selectedClarification === opt.id;
                        const optBin = getBinMeta(opt.destinationBin);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleClarificationSelect(opt.id)}
                            disabled={clarificationSubmitting}
                            className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${isSelected
                              ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-400'
                              : 'bg-white/80 hover:bg-white border-slate-200'
                              }`}
                          >
                            <span className="font-bold text-xs text-slate-900">{opt.label}</span>
                            <span className="text-[11px] text-slate-500 mt-1">{opt.note}</span>
                            <span
                              className={`mt-2 inline-block self-start px-2 py-0.5 rounded-lg text-[10px] font-bold ${optBin.badgeClass}`}
                            >
                              → {optBin.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Preparation & Disposal Checklist */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Preparation Instructions:</span>
                </h4>

                <div className="space-y-2">
                  {classification.rule.prepInstructions.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5 border-t border-slate-200/60">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Location: <strong>{classification.rule.disposalLocation}</strong>
                  </span>
                </div>
              </div>

              {/* Bottom Actions: Scan Another & Quick Feedback */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Accurate categorization?</span>
                  {feedbackSent ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                      <Check className="w-3.5 h-3.5" /> Logged!
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleFeedback('HELPFUL')}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${feedbackGiven === 'HELPFUL'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        title="Yes, accurate"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleFeedback('INCORRECT_BIN')}
                        className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${feedbackGiven === 'INCORRECT_BIN'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        title="Wrong bin"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleRetake}
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Another Item</span>
                </button>
              </div>
            </div>
          )
        )}

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Slide-out Scan History Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <History className="w-5 h-5 text-emerald-600" />
                  <span>Recent Campus Scans</span>
                </div>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {recentScans.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">
                    No scan history yet. Scan an item to see it here!
                  </p>
                ) : (
                  recentScans.map((scan) => {
                    const binMeta = getBinMeta(scan.finalBinRecommended);
                    return (
                      <div
                        key={scan.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{scan.detectedItem}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] ${binMeta.badgeClass}`}>
                            {binMeta.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span>
                            {new Date(scan.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>Confidence: {Math.round(scan.confidenceScore * 100)}%</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              onClick={() => setHistoryOpen(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition mt-6 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

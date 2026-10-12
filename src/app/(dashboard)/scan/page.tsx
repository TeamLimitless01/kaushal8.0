'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  MapPin,
  QrCode,
  ThumbsUp,
  ThumbsDown,
  Info,
  Flame,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Layers,
  Check,
  History,
  Zap,
  Coffee,
  Battery,
  FileQuestion,
  Scan,
  Maximize2,
  Key,
  Search,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp
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

/**
 * Universal Object Preset Chips
 * Covers every object type requested by the user:
 * polythin, water bottles, plastics, electronic appliances, steel water bottles, metals, pens, pencils, etc.
 */
const OBJECT_PRESETS = [
  { id: 'polythin', label: 'Polythene / Polythin Bag', hint: 'polythin', icon: '🛍️', bin: 'BLACK_LANDFILL', desc: 'LDPE carry bag & plastic film' },
  { id: 'steel_bottle', label: 'Steel Water Bottle', hint: 'steal water bottel', icon: '🥤', bin: 'BLUE_RECYCLABLE', desc: 'Stainless steel flask & sipper' },
  { id: 'plastic_bottle', label: 'Plastic Water Bottle', hint: 'water bottel', icon: '🍾', bin: 'BLUE_RECYCLABLE', desc: 'PET #1 mineral & soda bottle' },
  { id: 'pen', label: 'Ballpoint Pen / Marker', hint: 'pens', icon: '🖊️', bin: 'BLACK_LANDFILL', desc: 'Pens, markers & plastic refills' },
  { id: 'pencil', label: 'Wooden Pencil & Shavings', hint: 'pencils', icon: '✏️', bin: 'GREEN_ORGANIC', desc: 'Wood casing & sharpener shavings' },
  { id: 'appliance', label: 'Electronic Appliance', hint: 'electronic applinces', icon: '💻', bin: 'YELLOW_EWASTE', desc: 'Kettle, iron, toaster, microwave' },
  { id: 'metal', label: 'Metals & Utensils', hint: 'matels', icon: '🥄', bin: 'BLUE_RECYCLABLE', desc: 'Scrap metal, spoon, foil, hardware' },
  { id: 'plastic_box', label: 'Rigid Plastics & Tiffin', hint: 'plastics', icon: '📦', bin: 'BLUE_RECYCLABLE', desc: 'Tupperware, containers & cutlery' },
  { id: 'coffee_cup', label: 'Single-use Coffee Cup', hint: 'coffee cup', icon: '☕', bin: 'BLACK_LANDFILL', desc: 'Plastic PE-lined paper cup' },
  { id: 'battery', label: 'Lithium Battery', hint: 'battery', icon: '🔋', bin: 'RED_HAZARDOUS', desc: 'AA/AAA, lithium cell, power bank' },
  { id: 'cable', label: 'Cables & Chargers', hint: 'charger cable', icon: '🔌', bin: 'YELLOW_EWASTE', desc: 'USB cords, phone charger, wires' },
  { id: 'paper', label: 'Paper & Notebook', hint: 'notebook paper', icon: '📄', bin: 'BLUE_RECYCLABLE', desc: 'Clean office paper, study sheets' },
  { id: 'soda_can', label: 'Aluminum Soda Can', hint: 'soda can', icon: '🥫', bin: 'BLUE_RECYCLABLE', desc: 'Aluminum drink can & tin' },
  { id: 'pizza_box', label: 'Pizza Box & Cardboard', hint: 'pizza box', icon: '🍕', bin: 'BLACK_LANDFILL', desc: 'Food greasy takeaway cardboard' },
  { id: 'organic_food', label: 'Food Scraps & Peels', hint: 'food scraps', icon: '🍌', bin: 'GREEN_ORGANIC', desc: 'Biodegradable campus canteen lunch' },
  { id: 'glass_jar', label: 'Glass Bottle & Jar', hint: 'glass jar', icon: '🫙', bin: 'BLUE_RECYCLABLE', desc: 'Clean silica glass jar / bottle' },
  { id: 'bulb', label: 'Tube Light & CFL Bulb', hint: 'cfl bulb', icon: '💡', bin: 'RED_HAZARDOUS', desc: 'Mercury vapor fluorescent light' },
  { id: 'chemical', label: 'Lab Chemicals & Solvents', hint: 'chemical lab', icon: '🧪', bin: 'RED_HAZARDOUS', desc: 'Toxic reagents & science lab bottles' },
  { id: 'styrofoam', label: 'Thermocol & Styrofoam', hint: 'styrofoam packaging', icon: '🧱', bin: 'BLACK_LANDFILL', desc: 'Expanded polystyrene foam container' },
];

export default function WasteScannerPage() {
  const searchParams = useSearchParams();
  const stationParam = searchParams.get('station');

  // Input & Media States
  const [mode, setMode] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Object Selection & Identification States
  const [selectedItemHint, setSelectedItemHint] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Multimodal AI Vision API Key States
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [keySavedStatus, setKeySavedStatus] = useState(false);

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
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Recent History Drawer
  const [historyOpen, setHistoryOpen] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load API Key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedKey = localStorage.getItem('ecosentinel_gemini_key');
      if (storedKey) setGeminiApiKey(storedKey);
    }
  }, []);

  const saveApiKey = (key: string) => {
    setGeminiApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ecosentinel_gemini_key', key.trim());
      setKeySavedStatus(true);
      setTimeout(() => setKeySavedStatus(false), 2500);
    }
  };

  // Filter Presets based on search
  const filteredPresets = useMemo(() => {
    if (!searchQuery.trim()) return OBJECT_PRESETS;
    const q = searchQuery.toLowerCase().trim();
    return OBJECT_PRESETS.filter(
      p =>
        p.label.toLowerCase().includes(q) ||
        p.hint.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Fetch stations on mount
  useEffect(() => {
    fetch('/api/waste/stations')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.stations) {
          setStations(data.stations);
          if (!selectedStationId && data.stations.length > 0) {
            setSelectedStationId(data.stations[0].id);
          }
        }
      })
      .catch(err => console.error('Failed to load stations', err));
  }, []);

  // Fetch recent scans
  const loadHistory = () => {
    fetch('/api/waste/history?limit=8')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setRecentScans(data.scans);
        }
      })
      .catch(err => console.error('Failed to load history', err));
  };

  useEffect(() => {
    loadHistory();
  }, [classification]);

  // Handle Camera Stream
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (mode === 'camera' && !selectedImage) {
      setIsCameraActive(true);
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
            videoRef.current.play().catch(e => console.warn('Video play warning:', e));
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setIsCameraActive(false);
          setCameraError(
            'Live camera access is unavailable or denied. Please use the "Upload Photo" tab or click a Quick Sample below.'
          );
        });
    } else {
      setIsCameraActive(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode, selectedImage, cameraFacing]);

  // Extract visual cues from canvas pixels
  const extractVisualCues = (canvas: HTMLCanvasElement): string => {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';
      const w = canvas.width;
      const h = canvas.height;
      const imgData = ctx.getImageData(Math.floor(w * 0.25), Math.floor(h * 0.25), Math.floor(w * 0.5), Math.floor(h * 0.5));
      const data = imgData.data;
      let totalR = 0, totalG = 0, totalB = 0;
      let specularCount = 0;
      const len = data.length;
      for (let i = 0; i < len; i += 16) {
        const r = data[i], g = data[i+1], b = data[i+2];
        totalR += r; totalG += g; totalB += b;
        if (r > 180 && g > 180 && b > 180 && Math.abs(r - g) < 20 && Math.abs(g - b) < 20) {
          specularCount++;
        }
      }
      const samples = len / 16;
      const avgR = totalR / samples;
      const specularRatio = specularCount / samples;
      const aspect = h / w;

      if (aspect > 1.8) return 'pencil pen bottle';
      if (specularRatio > 0.35) return 'metal steel bottle';
      if (avgR > 205) return 'paper polythene thin film';
      if (avgR < 60) return 'electronic cable appliance';
      return '';
    } catch {
      return '';
    }
  };

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

      const visualCue = extractVisualCues(canvas);
      analyzeImage(dataUrl, selectedItemHint || undefined, visualCue);
    }
  };

  // Switch Camera Front / Back
  const toggleCameraFacing = () => {
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // File Upload Handler (with smart filename parsing)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);

      // Clean file name for auto-hint
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .toLowerCase();

      // Check if file name matches any known preset
      let detectedHint = selectedItemHint;
      if (!detectedHint) {
        for (const p of OBJECT_PRESETS) {
          if (cleanName.includes(p.hint) || cleanName.includes(p.id) || p.label.toLowerCase().includes(cleanName)) {
            detectedHint = p.hint;
            setSelectedItemHint(p.hint);
            break;
          }
        }
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setSelectedImage(dataUrl);
        analyzeImage(dataUrl, detectedHint || cleanName, undefined, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select Item Chip Handler
  const handleItemSelect = (hint: string) => {
    setSelectedItemHint(hint);
    // If an image is already uploaded or in view, immediately re-analyze with this hint!
    if (selectedImage) {
      analyzeImage(selectedImage, hint);
    }
  };

  // Sample Item Quick Click
  const handleSampleClick = (sampleName: string) => {
    setSelectedImage(`sample://${sampleName}`);
    setSelectedItemHint(sampleName);
    analyzeImage(undefined, sampleName);
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
  const analyzeImage = async (imgData?: string, hint?: string, visualCue?: string, fileName?: string) => {
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
          itemHint: hint || selectedItemHint || undefined,
          visualCue: visualCue || undefined,
          fileName: fileName || uploadedFileName || undefined,
          apiKey: geminiApiKey.trim() || undefined,
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
      alert('Network error while analyzing photo.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle Clarification Option Selection (Interactive Ambiguity Resolver)
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
          feedbackComment,
        }),
      });
      setFeedbackSent(true);
    } catch (err) {
      console.error('Feedback failed', err);
    }
  };

  // Helper for Bin Colors & Labels
  const getBinMeta = (binType: string) => {
    switch (binType) {
      case 'BLUE_RECYCLABLE':
        return {
          name: 'Blue Bin (Dry Recyclables)',
          shortName: 'Blue Bin',
          subtitle: 'Clean Plastics, Paper & Metals',
          bgClass: 'bg-blue-600',
          textClass: 'text-blue-600',
          borderClass: 'border-blue-500',
          lightBg: 'bg-blue-50',
          badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'GREEN_ORGANIC':
        return {
          name: 'Green Bin (Wet / Organic Waste)',
          shortName: 'Green Bin',
          subtitle: 'Compostables & Food Scraps',
          bgClass: 'bg-emerald-600',
          textClass: 'text-emerald-600',
          borderClass: 'border-emerald-500',
          lightBg: 'bg-emerald-50',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        };
      case 'RED_HAZARDOUS':
        return {
          name: 'Red Bin (Hazardous Waste)',
          shortName: 'Red Bin / Hazardous Kiosk',
          subtitle: 'Batteries, Chemicals & Bio-waste',
          bgClass: 'bg-red-600',
          textClass: 'text-red-600',
          borderClass: 'border-red-500',
          lightBg: 'bg-red-50',
          badgeClass: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'YELLOW_EWASTE':
        return {
          name: 'Yellow Bin (Electronic Waste)',
          shortName: 'Yellow Bin / E-Waste Kiosk',
          subtitle: 'Cables, Appliances & Electronics',
          bgClass: 'bg-amber-500',
          textClass: 'text-amber-600',
          borderClass: 'border-amber-400',
          lightBg: 'bg-amber-50',
          badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        };
      case 'BLACK_LANDFILL':
      default:
        return {
          name: 'Black Bin (Landfill / General Waste)',
          shortName: 'Black Bin',
          subtitle: 'Polythene, Soiled Items & Pens',
          bgClass: 'bg-slate-800',
          textClass: 'text-slate-800',
          borderClass: 'border-slate-700',
          lightBg: 'bg-slate-100',
          badgeClass: 'bg-slate-200 text-slate-800 border-slate-300',
        };
    }
  };

  const binInfo = currentBin ? getBinMeta(currentBin) : null;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl shadow-emerald-950/20 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 backdrop-blur-md border border-emerald-400/40 text-emerald-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GPT-6 Luna Multimodal AI Vision (Active ⚡) + Campus Rules Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Universal Waste Classifier
          </h1>
          <p className="text-slate-200 text-xs md:text-sm max-w-xl">
            Powered by <strong>openai/gpt-6-luna</strong> at gen.pollinations.ai. Point camera or upload any image: polythene bags, plastic & steel bottles, appliances, metals, pens, pencils, and arbitrary objects.
          </p>
        </div>

        {/* Action Controls: Vision AI Status, Campus Station Selector & History Trigger */}
        <div className="z-10 flex flex-wrap items-center gap-2.5">
          {/* Active AI Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 border border-emerald-400/40 rounded-xl text-xs font-bold text-emerald-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>AI Model: openai/gpt-6-luna</span>
          </div>

          {/* Station Selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-xs">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <select
              value={selectedStationId}
              onChange={(e) => setSelectedStationId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="text-slate-900">Any Campus Station</option>
              {stations.map(st => (
                <option key={st.id} value={st.id} className="text-slate-900">
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 rounded-xl text-xs font-semibold text-white transition cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>My Scans ({recentScans.length})</span>
          </button>
        </div>

        {/* Ambient Decorative Glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Expandable Gemini Multimodal Vision Key Configuration Drawer */}
      {showKeyPanel && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 text-white shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-4 h-4" />
                Google Gemini Multimodal Vision Integration (Free)
              </h3>
              <p className="text-xs text-slate-300 max-w-2xl">
                Enable true autonomous computer vision for arbitrary real-world objects. Paste your free Google AI Studio key below. The vision model analyzes actual pixels, while our PostgreSQL database enforces SVVV campus disposal rules.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition shrink-0"
            >
              <span>Get Free Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <input
              type="password"
              placeholder="Paste Google AI Studio Key (AIzaSy...)"
              value={geminiApiKey}
              onChange={(e) => saveApiKey(e.target.value)}
              className="w-full sm:flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
            {geminiApiKey && (
              <button
                onClick={() => saveApiKey('')}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Clear Key
              </button>
            )}
            {keySavedStatus && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved to Browser!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Universal Object Identification & Smart Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scan className="w-4 h-4 text-emerald-600" />
              <span>Target Object Identification</span>
              {selectedItemHint && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Active: {selectedItemHint}
                  <button
                    onClick={() => {
                      setSelectedItemHint(null);
                      if (selectedImage) analyzeImage(selectedImage);
                    }}
                    className="hover:text-emerald-950 cursor-pointer ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select or type the object you are discarding to guarantee 100% precision:
            </p>
          </div>

          {/* Quick Search & Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search (polythin, pencil, steel bottle...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable / Grid Object Chips */}
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
          {filteredPresets.map((preset) => {
            const isSelected = selectedItemHint === preset.hint;
            return (
              <button
                key={preset.id}
                onClick={() => handleItemSelect(preset.hint)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
                title={preset.desc}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Input Capture Column vs Classification Result Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera / Upload Viewport */}
        <div className="lg:col-span-6 space-y-4">
          {/* Mode Switch Tabs */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-2xl">
            <button
              onClick={() => { setMode('camera'); handleRetake(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'camera'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Camera Stream</span>
            </button>

            <button
              onClick={() => { setMode('upload'); handleRetake(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'upload'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Upload Photo</span>
            </button>

            <button
              onClick={() => { setMode('samples'); handleRetake(); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                mode === 'samples'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Quick Test Items</span>
            </button>
          </div>

          {/* Viewport Card */}
          <div className="relative bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-lg min-h-[420px] flex flex-col justify-center items-center">
            {/* 1. Camera Mode */}
            {mode === 'camera' && (
              <div className="relative w-full h-[420px] bg-black flex items-center justify-center overflow-hidden">
                {selectedImage ? (
                  /* Captured Photo Preview */
                  <div className="relative w-full h-full">
                    <img
                      src={selectedImage}
                      alt="Captured waste item"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Captured Snapshot</span>
                    </div>
                  </div>
                ) : cameraError ? (
                  /* Camera Error Fallback */
                  <div className="p-6 text-center text-slate-300 space-y-3 max-w-sm">
                    <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                    <p className="text-xs leading-relaxed">{cameraError}</p>
                    <button
                      onClick={() => setMode('upload')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Switch to Photo Upload
                    </button>
                  </div>
                ) : (
                  /* Live Camera Stream with Viewfinder Overlay */
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Viewfinder Bounding Box */}
                    <div className="absolute inset-8 border-2 border-emerald-400/60 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-emerald-400/80 text-[10px] font-mono uppercase tracking-wider">
                        <span>[ AI VISION ACTIVE ]</span>
                        <span>{cameraFacing === 'environment' ? 'BACK CAM' : 'FRONT CAM'}</span>
                      </div>
                      <div className="text-center text-emerald-300 text-xs font-semibold bg-black/40 backdrop-blur-sm py-1 px-3 rounded-full mx-auto border border-emerald-400/30">
                        {selectedItemHint
                          ? `Target: ${selectedItemHint}`
                          : 'Position any object in frame'}
                      </div>
                    </div>

                    {/* Camera Control Action Buttons */}
                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-6 z-20">
                      <button
                        onClick={toggleCameraFacing}
                        className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 flex items-center justify-center border border-white/20 transition cursor-pointer"
                        title="Flip Camera"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* Giant Snap Button */}
                      <button
                        onClick={capturePhoto}
                        className="w-16 h-16 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-lg shadow-white/20 border-4 border-emerald-500 transition transform active:scale-95 cursor-pointer"
                        title="Capture Photo"
                      >
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                          <Camera className="w-6 h-6" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Upload Mode */}
            {mode === 'upload' && (
              <div className="w-full h-full min-h-[420px] p-6 flex flex-col items-center justify-center text-center">
                {selectedImage ? (
                  <div className="relative w-full h-[420px] bg-black">
                    <img
                      src={selectedImage}
                      alt="Uploaded waste item"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>{uploadedFileName || 'Uploaded Photo Preview'}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-80 border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-6 text-slate-300 transition cursor-pointer group"
                  >
                    <div className="p-4 bg-slate-800 group-hover:bg-emerald-600/20 text-slate-300 group-hover:text-emerald-400 rounded-2xl transition mb-3">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="font-semibold text-sm text-white">
                      Click to choose or drag an image here
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Supports JPG, PNG, WEBP. Auto-detects filename keywords.
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

            {/* 3. Quick Test Items Mode */}
            {mode === 'samples' && (
              <div className="w-full p-6 text-left space-y-4 max-h-[420px] overflow-y-auto">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>1-Click Test Scenarios (No camera required)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Select any campus item below to test visual trait detection and authoritative PostgreSQL rule lookup:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: 'Polythene Carry Bag', hint: 'polythin', icon: '🛍️', desc: 'Tests LDPE thin film / landfill clarification' },
                    { name: 'Stainless Steel Water Bottle', hint: 'steal water bottel', icon: '🥤', desc: 'Tests recyclable steel metal flask' },
                    { name: 'Plastic Beverage Bottle', hint: 'water bottel', icon: '🍾', desc: 'Tests PET #1 dry recyclables blue bin' },
                    { name: 'Ballpoint Pen / Marker', hint: 'pens', icon: '🖊️', desc: 'Tests composite stationery landfill rule' },
                    { name: 'Wooden Pencil & Shavings', hint: 'pencils', icon: '✏️', desc: 'Tests organic compostable vs rubber eraser' },
                    { name: 'Small Electrical Appliance', hint: 'electronic applinces', icon: '💻', desc: 'Tests kettle/iron yellow e-waste alert' },
                    { name: 'Scrap Metals & Utensils', hint: 'matels', icon: '🥄', desc: 'Tests steel spoon, foil & metal recycling' },
                    { name: 'Rigid Plastics & Tiffin', hint: 'plastics', icon: '📦', desc: 'Tests PP/HDPE containers & lunch box' },
                    { name: 'Single-use Coffee Cup', hint: 'coffee cup', icon: '☕', desc: 'Tests plastic inner lining clarification' },
                    { name: 'Lithium Battery', hint: 'battery', icon: '🔋', desc: 'Tests red hazardous warning & fire safety' },
                    { name: 'E-Waste Charger Cable', hint: 'charger cable', icon: '🔌', desc: 'Tests yellow e-waste drop station' },
                    { name: 'Greasy Pizza Box', hint: 'pizza box', icon: '🍕', desc: 'Tests food oil / landfill residual' },
                  ].map((s) => (
                    <button
                      key={s.name}
                      onClick={() => handleSampleClick(s.hint)}
                      className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-emerald-500 rounded-xl text-left transition flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-white font-semibold text-xs group-hover:text-emerald-400">
                        <span className="text-base">{s.icon}</span>
                        <span>{s.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hidden Canvas for Frame Capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Bar (Retake / Change Photo) */}
          {selectedImage && (
            <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Image Loaded
              </span>
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake / Choose Another</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: AI Detection & Database Disposal Route */}
        <div className="lg:col-span-6 space-y-4">
          {isAnalyzing ? (
            /* Holographic Scanning Radar Loader */
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-5 flex flex-col items-center justify-center min-h-[420px]">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping"></div>
                <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-lg">
                  Analyzing Waste Attributes...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  1. AI classifying visual materials and container shape...
                  <br />
                  2. Querying PostgreSQL for official SVVV campus recycling rule...
                </p>
              </div>
            </div>
          ) : classification && binInfo ? (
            /* Classification Results Display */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Primary Bin Recommendation Banner */}
              <div
                className={`p-6 rounded-3xl text-white shadow-xl ${binInfo.bgClass} relative overflow-hidden transition-all`}
              >
                <div className="flex items-start justify-between gap-4 z-10 relative">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md uppercase tracking-wider text-white">
                      Recommended Campus Bin
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mt-1">
                      {binInfo.name}
                    </h2>
                    <p className="text-white/80 text-xs mt-0.5 font-medium">
                      {binInfo.subtitle}
                    </p>
                  </div>

                  {/* Confidence Badge */}
                  <div className="text-right bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20">
                    <span className="block text-[10px] text-white/80 uppercase font-semibold">
                      AI Confidence
                    </span>
                    <span className="text-lg font-extrabold text-white">
                      {Math.round(classification.confidenceScore * 100)}%
                    </span>
                  </div>
                </div>

                {/* Detected Item & Material Composition */}
                <div className="mt-5 pt-4 border-t border-white/20 grid grid-cols-2 gap-3 z-10 relative text-xs">
                  <div>
                    <span className="text-white/60 text-[10px] uppercase font-bold block">
                      Identified Object
                    </span>
                    <span className="font-bold text-white text-sm">
                      {classification.rule.itemName}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60 text-[10px] uppercase font-bold block">
                      Material Composition
                    </span>
                    <span className="font-medium text-white/95">
                      {classification.rule.material}
                    </span>
                  </div>
                </div>

                {/* Decorative BG Watermark */}
                <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                  <Layers className="w-48 h-48" />
                </div>
              </div>

              {/* Station Availability Alert (If station was selected) */}
              {classification.station && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                    classification.station.isBinAvailableAtStation
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">
                      Current Location: {classification.station.name}
                    </span>
                    <p className="text-[11px] mt-0.5">
                      {classification.station.isBinAvailableAtStation
                        ? `✓ ${binInfo.shortName} is available at this station!`
                        : classification.station.alternateStationNotice}
                    </p>
                  </div>
                </div>
              )}

              {/* CRITICAL FEATURE: Hazardous Warning Banner (Batteries, E-Waste, Chemicals) */}
              {classification.rule.isHazardous && classification.rule.hazardousWarning && (
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-400 text-red-900 shadow-sm flex items-start gap-3">
                  <div className="p-2 bg-red-600 text-white rounded-xl shadow-md shrink-0">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-red-600" />
                      Special Hazard Alert & Policy Warning
                    </h4>
                    <p className="text-xs leading-relaxed font-semibold">
                      {classification.rule.hazardousWarning}
                    </p>
                    <p className="text-[11px] text-red-700 pt-1 font-medium">
                      <strong>Designated Drop Point:</strong> {classification.rule.disposalLocation}
                    </p>
                  </div>
                </div>
              )}

              {/* CRITICAL FEATURE: Interactive Clarification Dialog (e.g. Polythene food grease / coffee cup lining / pencil composite) */}
              {classification.rule.requiresClarification && classification.rule.clarificationOptions && (
                <div className="bg-white border-2 border-amber-300 rounded-3xl p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center gap-2 text-amber-800">
                    <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        Clarification Required
                      </h4>
                      <p className="text-xs text-slate-600">
                        {classification.rule.clarificationQuestion}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {classification.rule.clarificationOptions.map((opt) => {
                      const isSelected = selectedClarification === opt.id;
                      const optBinMeta = getBinMeta(opt.destinationBin);

                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleClarificationSelect(opt.id)}
                          disabled={clarificationSubmitting}
                          className={`w-full p-3 rounded-2xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-500 shadow-sm ring-1 ring-amber-500'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-amber-600 bg-amber-600'
                                    : 'border-slate-400 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <span className="font-bold text-xs text-slate-900">
                                {opt.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 pl-5.5">
                              {opt.note}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold ${optBinMeta.badgeClass}`}
                          >
                            → {optBinMeta.shortName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step-by-Step Preparation & Disposal Checklist */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Preparation & Disposal Instructions</span>
                </h4>

                <div className="space-y-2">
                  {classification.rule.prepInstructions.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                    >
                      <span className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed font-medium">{step}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Location: <strong>{classification.rule.disposalLocation}</strong>
                  </span>
                </div>
              </div>

              {/* User Feedback Widget */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Was this recommendation accurate?
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Your feedback trains campus compliance data.
                  </span>
                </div>

                {feedbackSent ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-4 h-4" /> Thank you for your feedback!
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFeedback('HELPFUL')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        feedbackGiven === 'HELPFUL'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Accurate</span>
                    </button>

                    <button
                      onClick={() => handleFeedback('INCORRECT_BIN')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                        feedbackGiven === 'INCORRECT_BIN'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>Wrong Bin</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty State: Ready to Scan */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm space-y-4 min-h-[420px] flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">
                  Ready to Identify Waste
                </h3>
                <p className="text-xs text-slate-500 max-w-sm">
                  Point your camera or upload a photo of any object. The AI identifies physical traits, while the official SVVV database determines the permitted disposal route.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap justify-center gap-2 text-[11px] text-slate-600">
                <span className="px-2.5 py-1 rounded-full bg-slate-100">🛍️ Polythene Bags</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">🥤 Steel Bottles</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">🍾 Water Bottles</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">🖊️ Pens</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">✏️ Pencils</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">💻 Appliances</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-100">🥄 Metals</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-out Recent History Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                  <History className="w-5 h-5 text-emerald-600" />
                  <span>My Recent Scans</span>
                </div>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
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
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{scan.detectedItem}</span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-[10px] ${binMeta.badgeClass}`}
                          >
                            {binMeta.shortName}
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

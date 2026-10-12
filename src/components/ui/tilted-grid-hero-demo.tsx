"use client";

import React, { useState } from "react";
import Link from "next/link";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import {
  Zap,
  Droplets,
  Trash2,
  AlertTriangle,
  Sliders,
  Database,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Sparkles,
  CheckCircle2,
  Layers,
  BarChart3,
} from "lucide-react";

// Our R2 artwork, alternating photos with gradients — the same set as the
// Halo Reel demo. Portrait sources are cropped to the tiles by object-cover.
const CDN = "https://pub-940ccf6255b54fa799a9b01050e6c227.r2.dev";

const IMAGES = [
  {
    src: `${CDN}/stock-images/767d99bb371a54d0d36751e8cecae43c.jpg`,
    alt: "Diver silhouetted inside a sunset seascape shaped like a profile",
    badge: "Telemetry Core",
    title: "Continuous Sub-Meter Stream",
  },
  {
    src: `${CDN}/gradients/hero_gradient/hero-gradients-01.png`,
    alt: "Soft multi-tone gradient wash",
    badge: "AI Baseline",
    title: "Mean + 1.8σ Anomaly Radar",
  },
  {
    src: `${CDN}/stock-images/821d815affa6496c39cbdeeec7a84603.jpg`,
    alt: "Double-exposure portrait blended with a city skyline at dusk",
    badge: "Smart Campus",
    title: "SVVV Academic Block Grid",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-03.png`,
    alt: "Moon-toned gradient",
    badge: "Simulation",
    title: "What-If Carbon Forecaster",
  },
  {
    src: `${CDN}/stock-images/937438c560ada1c83317f2c11b3454b0.jpg`,
    alt: "Motion-blurred side-profile portrait against a deep orange backdrop",
    badge: "HVAC Optimization",
    title: "Lab Idle Surge Detection",
  },
  {
    src: `${CDN}/gradients/shade_shiters/shade-shifters-05.png`,
    alt: "Shifting shade gradient",
    badge: "Water Flow",
    title: "Hostel Night Pump Telemetry",
  },
  {
    src: `${CDN}/stock-images/98f89cb9994f5c382ab964062c4039db.jpg`,
    alt: "Figure holding a racket that dissolves into a swirling colourful cloud",
    badge: "Zero Loss",
    title: "PostgreSQL Deduplication",
  },
  {
    src: `${CDN}/gradients/shade_shiters/shade-shifters-09.png`,
    alt: "Shifting shade gradient",
    badge: "Audit Vault",
    title: "Cloudinary Telemetry Archive",
  },
  {
    src: `${CDN}/stock-images/ddcbee38be8b7274e19e132d7ab35b53.jpg`,
    alt: "Hand gesture with a colourful cutout of a bird flying through the fingers",
    badge: "CEA Standard",
    title: "0.82 kg CO2/kWh Grid Factor",
  },
  {
    src: `${CDN}/gradients/moon/moon-grade-06.png`,
    alt: "Moon-toned gradient",
    badge: "Production MVP",
    title: "Shri Vaishnav Vidyapeeth",
  },
];

type FeatureTab = "telemetry" | "anomaly" | "simulator" | "vault";

export default function TiltedGridHeroDemo() {
  const [activeFeature, setActiveFeature] = useState<FeatureTab>("telemetry");

  const features = [
    {
      id: "telemetry" as FeatureTab,
      label: "Sub-Meter Telemetry",
      icon: Zap,
      badge: "Real-Time Ingestion",
      headline: "Normalized 3-Resource Telemetry Ingestion",
      description:
        "Ingests Electricity (kWh), Water (Liters), and Waste (kg) across 7 SVVV campus blocks with automated unit normalization and timezone-safe date indexing.",
      stats: [
        { label: "Monitored Electricity", value: "30,240+ kWh" },
        { label: "Water Distribution", value: "4.92M Liters" },
        { label: "Waste Diversion", value: "8,400 kg" },
      ],
    },
    {
      id: "anomaly" as FeatureTab,
      label: "Statistical Anomaly Radar",
      icon: AlertTriangle,
      badge: "Statistical Baseline",
      headline: "Rolling Mean + 1.8σ Spike Identification",
      description:
        "Detects abnormal weekend server room draws, night-time pipe leakage, and off-hour library HVAC idling without rigid hardcoded limits or false alerts.",
      stats: [
        { label: "Statistical Threshold", value: "Mean + 1.8σ" },
        { label: "Min Observations", value: "7 Records" },
        { label: "Flagged Outliers", value: "6 Resolved" },
      ],
    },
    {
      id: "simulator" as FeatureTab,
      label: "What-If Scenario Forecaster",
      icon: Sliders,
      badge: "Interactive Projections",
      headline: "Dynamic Financial & Carbon Reduction Modeler",
      description:
        "Live interactive slider modeling 0% to 30% peak demand cuts. Computes monthly monetary savings in INR, CEA grid carbon offset, and equivalent mature trees saved.",
      stats: [
        { label: "Peak Load Cut", value: "0% – 30% Slider" },
        { label: "Avg Cost Offset", value: "₹38,550 / mo" },
        { label: "CEA Grid Factor", value: "0.82 kg/kWh" },
      ],
    },
    {
      id: "vault" as FeatureTab,
      label: "Enterprise Audit Vault",
      icon: Database,
      badge: "Non-Destructive",
      headline: "Neon PostgreSQL Merging & Cloudinary Storage",
      description:
        "Multi-upload deduplication guarantees historic telemetry merges without overwriting or duplicating dates, with Cloudinary CSV archiving and 1-click batch rollbacks.",
      stats: [
        { label: "Unique Keys", value: "5-Field Composite" },
        { label: "Rollback Safety", value: "Safe Batch Delete" },
        { label: "Cloudinary Archival", value: "Raw CSV Sync" },
      ],
    },
  ];

  const current = features.find((f) => f.id === activeFeature) || features[0];
  const Icon = current.icon;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <TiltedGridHero
        images={IMAGES}
        className="min-h-[640px] md:min-h-[720px] w-full rounded-3xl border border-emerald-500/30 bg-black/80 backdrop-blur-2xl shadow-2xl shadow-emerald-950/40"
      >
        <div className="relative z-10 flex h-full w-full flex-col items-center justify-between py-10 md:py-14 px-4 sm:px-8 text-center max-w-5xl mx-auto">
          {/* Top Live Pill & Tagline */}
          <div className="flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 backdrop-blur-md shadow-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-300">
                EcoSentinel Intelligence Core • Feature Suite
              </span>
            </div>

            <h1 className="text-balance text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.1]">
              Every frame, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                brought into focus.
              </span>
            </h1>

            <p className="max-w-2xl text-balance px-4 text-xs sm:text-sm md:text-base text-emerald-100/70 font-normal">
              Images curve in from one edge, flatten out at the centre, then fade away round the other. Below the 3D grid, explore real-world campus sustainability engines.
            </p>
          </div>

          {/* Interactive Feature Tabs Selector */}
          <div className="w-full my-6 max-w-4xl">
            {/* Feature Selector Tabs */}
            <div className="flex items-center justify-center flex-wrap gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl mb-5">
              {features.map((feat) => {
                const TabIcon = feat.icon;
                const isActive = activeFeature === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeature(feat.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 scale-105"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{feat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Feature Showcase Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-black/70 border border-emerald-500/30 backdrop-blur-xl text-left shadow-2xl transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                      {current.badge}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {current.headline}
                    </h3>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-300/80 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
                  Status: Active Engine
                </span>
              </div>

              <p className="mt-3 text-xs sm:text-sm text-emerald-100/70 leading-relaxed">
                {current.description}
              </p>

              {/* Real Metrics Row */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {current.stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-left"
                  >
                    <span className="text-[10px] uppercase font-semibold text-white/50">
                      {stat.label}
                    </span>
                    <p className="text-base sm:text-lg font-black text-emerald-300 mt-0.5">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Actions Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/dashboard">
              <LiquidButton
                className="w-full sm:w-auto text-white border border-emerald-400/50 bg-emerald-500/40 backdrop-blur-md px-7 py-3 rounded-xl font-bold text-xs shadow-xl shadow-emerald-500/20"
                size="lg"
              >
                <span>Launch Analytics Platform</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </LiquidButton>
            </Link>

            <Link
              href="/upload"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-emerald-100 hover:text-white bg-black/60 hover:bg-black/80 border border-emerald-500/30 backdrop-blur-md transition shadow-md"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Import New CSV Dataset</span>
            </Link>

            <Link
              href="/analytics"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Carbon Breakdown</span>
            </Link>
          </div>
        </div>
      </TiltedGridHero>
    </div>
  );
}

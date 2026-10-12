'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Activity,
  Zap,
  Droplets,
  Trash2,
  IndianRupee,
  Building,
  CloudFog,
  Trees,
  Award,
  TrendingUp,
  TrendingDown,
  Gauge,
  Radio,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Wifi,
  Server,
  Layers,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';

// Time filter options
type TimeFilter = 'realtime' | 'past5m' | 'past10m' | 'today';
type ResourceMetric = 'electricity' | 'water' | 'waste' | 'cost';

// Telemetry point definition
interface TelemetryPoint {
  time: string;
  rawTime: number;
  electricity: number; // kWh
  water: number; // Liters
  waste: number; // kg
  cost: number; // INR
  cumElectricity: number;
  cumWater: number;
  cumWaste: number;
  cumCost: number;
  // Substation physics
  activeKw: number;
  flowLpm: number;
  voltage: number;
  powerFactor: number;
}

// Building breakdown item
interface BuildingTelemetry {
  id: string;
  name: string;
  electricity: number;
  water: number;
  waste: number;
  cost: number;
  status: 'Optimal' | 'Elevated' | 'Surging';
  activeKw: number;
  flowLpm: number;
  binPct: number;
}

interface PacketLog {
  id: string;
  timestamp: string;
  nodeId: string;
  protocol: 'MQTT' | 'LoRaWAN' | 'Modbus';
  category: 'POWER' | 'HYDRO' | 'WASTE' | 'FINANCE';
  topic: string;
  summary: string;
}

function formatTime(date: Date, includeSec = true): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  if (!includeSec) return `${h}:${m}`;
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function IotDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeMetric, setActiveMetric] = useState<ResourceMetric>('electricity');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('realtime');
  const [chartMode, setChartMode] = useState<'rate' | 'cumulative'>('rate');

  // Streaming controls
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1000); // ms per tick
  const [activeAnomaly, setActiveAnomaly] = useState<'none' | 'power_surge' | 'water_burst' | 'bin_overflow'>('none');
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  // Live accumulators matching dashboard totals
  const [totals, setTotals] = useState({
    electricityKwh: 48250,
    waterLiters: 320400,
    wasteKg: 1450,
    costInr: 395000,
    sustainabilityScore: 78,
    co2Kg: 39565,
    potentialSavingsInr: 59250,
  });

  // Rolling telemetry buffers
  const [realtimeData, setRealtimeData] = useState<TelemetryPoint[]>([]);
  const [past5mData, setPast5mData] = useState<TelemetryPoint[]>([]);
  const [past10mData, setPast10mData] = useState<TelemetryPoint[]>([]);
  const [todayData, setTodayData] = useState<TelemetryPoint[]>([]);

  // Campus building state (dynamically fluctuates)
  const [buildings, setBuildings] = useState<BuildingTelemetry[]>([
    {
      id: 'b-1',
      name: 'Academic Block 2 (CSE & IT Hub)',
      electricity: 18450,
      water: 92400,
      waste: 420,
      cost: 152800,
      status: 'Optimal',
      activeKw: 52.4,
      flowLpm: 22.8,
      binPct: 54,
    },
    {
      id: 'b-2',
      name: 'Central Cafeteria Quad',
      electricity: 8200,
      water: 114200,
      waste: 590,
      cost: 72400,
      status: 'Elevated',
      activeKw: 31.8,
      flowLpm: 34.2,
      binPct: 88,
    },
    {
      id: 'b-3',
      name: 'Central Library',
      electricity: 6400,
      water: 24800,
      waste: 110,
      cost: 51900,
      status: 'Optimal',
      activeKw: 18.2,
      flowLpm: 6.4,
      binPct: 28,
    },
    {
      id: 'b-4',
      name: 'Science & Chemistry Complex',
      electricity: 9800,
      water: 48600,
      waste: 210,
      cost: 82400,
      status: 'Optimal',
      activeKw: 28.5,
      flowLpm: 12.1,
      binPct: 62,
    },
    {
      id: 'b-5',
      name: 'Hostels & Residential Block',
      electricity: 5400,
      water: 40400,
      waste: 120,
      cost: 35500,
      status: 'Optimal',
      activeKw: 15.6,
      flowLpm: 9.8,
      binPct: 35,
    },
  ]);

  // Terminal logs
  const [packetLogs, setPacketLogs] = useState<PacketLog[]>([]);
  const [isTerminalPaused, setIsTerminalPaused] = useState(false);

  // Metric styling & meta matching the dashboard
  const metricConfigs = {
    electricity: {
      label: 'Campus Electricity',
      unit: 'kWh',
      rateUnit: 'kW Active Load',
      icon: Zap,
      color: '#10b981',
      gradientId: 'iotGradElec',
      textColor: 'text-emerald-700',
      bgPill: 'bg-emerald-500 text-white shadow-emerald-500/20',
      activeBorder: 'border-emerald-500',
      sensorProtocol: 'Modbus RS-485 / MQTT Substation Gateway',
    },
    water: {
      label: 'Campus Water',
      unit: 'L',
      rateUnit: 'L/min Hydro Flow',
      icon: Droplets,
      color: '#06b6d4',
      gradientId: 'iotGradWater',
      textColor: 'text-cyan-700',
      bgPill: 'bg-cyan-500 text-white shadow-cyan-500/20',
      activeBorder: 'border-cyan-500',
      sensorProtocol: 'Ultrasonic Hydro-Flowmeter DN50 (LoRaWAN)',
    },
    waste: {
      label: 'Waste Generation',
      unit: 'kg',
      rateUnit: 'Fill % & Daily kg',
      icon: Trash2,
      color: '#f59e0b',
      gradientId: 'iotGradWaste',
      textColor: 'text-amber-700',
      bgPill: 'bg-amber-500 text-white shadow-amber-500/20',
      activeBorder: 'border-amber-500',
      sensorProtocol: 'Laser ToF & Ultrasonic Sonar Nodes (LoRaWAN)',
    },
    cost: {
      label: 'Equivalent Cost',
      unit: '₹',
      rateUnit: '₹/hr Run-Rate',
      icon: IndianRupee,
      color: '#8b5cf6',
      gradientId: 'iotGradCost',
      textColor: 'text-purple-700',
      bgPill: 'bg-purple-600 text-white shadow-purple-500/20',
      activeBorder: 'border-purple-500',
      sensorProtocol: 'Automated CEA Indian Grid Tariff Compute Engine',
    },
  };

  const currentConfig = metricConfigs[activeMetric];

  // Try fetching actual dashboard baseline from /api/dashboard on mount
  useEffect(() => {
    setMounted(true);

    async function loadDashboardBaseline() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data && data.hasData && data.kpis) {
            setTotals({
              electricityKwh: Math.round(data.kpis.energy?.value || 48250),
              waterLiters: Math.round(data.kpis.water?.value || 320400),
              wasteKg: Math.round(data.kpis.waste?.value || 1450),
              costInr: Math.round(data.kpis.cost?.value || 395000),
              sustainabilityScore: data.kpis.sustainabilityScore || 78,
              co2Kg: Math.round(data.kpis.co2EmissionsKg || 39565),
              potentialSavingsInr: Math.round(data.kpis.potentialSavingsInr || 59250),
            });

            if (data.charts?.buildingComparison && data.charts.buildingComparison.length > 0) {
              const mapped = data.charts.buildingComparison.map((b: any, idx: number) => ({
                id: b.buildingId || `b-${idx}`,
                name: b.buildingName,
                electricity: Math.round(b.electricity),
                water: Math.round(b.water),
                waste: Math.round(b.waste),
                cost: Math.round(b.totalCost),
                status: idx === 1 ? 'Elevated' : 'Optimal',
                activeKw: Math.round((b.electricity / 400) * 10) / 10,
                flowLpm: Math.round((b.water / 3500) * 10) / 10,
                binPct: Math.round(Math.min(95, 30 + idx * 15)),
              }));
              setBuildings(mapped);
            }
          }
        }
      } catch (e) {
        console.warn('Using seeded dashboard telemetry baseline:', e);
      }
    }

    loadDashboardBaseline();

    // Generate initial time filters datasets
    const now = Date.now();

    // 1. Initial 20 rolling points for Realtime (2s steps)
    const initRealtime: TelemetryPoint[] = [];
    let rElec = 48200;
    let rWater = 320300;
    let rWaste = 1445;
    let rCost = 394600;

    for (let i = 19; i >= 0; i--) {
      const t = new Date(now - i * 2000);
      const activeKw = 142 + Math.sin(i * 0.4) * 10 + (Math.random() * 4 - 2);
      const flowLpm = 64 + Math.cos(i * 0.3) * 8 + (Math.random() * 3 - 1.5);
      const wasteRate = 0.8 + Math.random() * 0.4;
      const costRate = Math.round(activeKw * 8.2);

      rElec += Math.round((activeKw / 1800) * 10) / 10;
      rWater += Math.round((flowLpm / 30) * 10) / 10;
      rWaste += Math.round((wasteRate / 60) * 100) / 100;
      rCost += Math.round(costRate / 1800);

      initRealtime.push({
        time: formatTime(t, true),
        rawTime: t.getTime(),
        electricity: Math.round(activeKw * 10) / 10,
        water: Math.round(flowLpm * 10) / 10,
        waste: Math.round(wasteRate * 10) / 10,
        cost: costRate,
        cumElectricity: Math.round(rElec),
        cumWater: Math.round(rWater),
        cumWaste: Math.round(rWaste * 10) / 10,
        cumCost: Math.round(rCost),
        activeKw: Math.round(activeKw * 10) / 10,
        flowLpm: Math.round(flowLpm * 10) / 10,
        voltage: 231.2,
        powerFactor: 0.98,
      });
    }
    setRealtimeData(initRealtime);

    // 2. Past 5 min dataset (30 points, 10s steps)
    const initPast5m: TelemetryPoint[] = [];
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now - i * 10000);
      const wave = Math.sin((30 - i) * 0.3);
      const kw = 138 + wave * 14 + (Math.random() * 5 - 2.5);
      const lpm = 62 + wave * 10 + (Math.random() * 4 - 2);
      const kgRate = 0.9 + wave * 0.2;
      const inrRate = Math.round(kw * 8.2);

      initPast5m.push({
        time: formatTime(t, true),
        rawTime: t.getTime(),
        electricity: Math.round(kw * 10) / 10,
        water: Math.round(lpm * 10) / 10,
        waste: Math.round(kgRate * 10) / 10,
        cost: inrRate,
        cumElectricity: Math.round(48150 + (30 - i) * 3.2),
        cumWater: Math.round(319800 + (30 - i) * 20),
        cumWaste: Math.round((1440 + (30 - i) * 0.3) * 10) / 10,
        cumCost: Math.round(394200 + (30 - i) * 26),
        activeKw: Math.round(kw * 10) / 10,
        flowLpm: Math.round(lpm * 10) / 10,
        voltage: 231.0,
        powerFactor: 0.98,
      });
    }
    setPast5mData(initPast5m);

    // 3. Past 10 min dataset (40 points, 15s steps)
    const initPast10m: TelemetryPoint[] = [];
    for (let i = 39; i >= 0; i--) {
      const t = new Date(now - i * 15000);
      const wave = Math.sin((40 - i) * 0.2);
      const kw = 134 + wave * 18 + (Math.random() * 6 - 3);
      const lpm = 59 + wave * 13 + (Math.random() * 4 - 2);
      const kgRate = 0.85 + wave * 0.3;
      const inrRate = Math.round(kw * 8.2);

      initPast10m.push({
        time: formatTime(t, true),
        rawTime: t.getTime(),
        electricity: Math.round(kw * 10) / 10,
        water: Math.round(lpm * 10) / 10,
        waste: Math.round(kgRate * 10) / 10,
        cost: inrRate,
        cumElectricity: Math.round(48050 + (40 - i) * 5),
        cumWater: Math.round(319200 + (40 - i) * 30),
        cumWaste: Math.round((1435 + (40 - i) * 0.4) * 10) / 10,
        cumCost: Math.round(393400 + (40 - i) * 41),
        activeKw: Math.round(kw * 10) / 10,
        flowLpm: Math.round(lpm * 10) / 10,
        voltage: 230.8,
        powerFactor: 0.97,
      });
    }
    setPast10mData(initPast10m);

    // 4. Today (24 Hours profile)
    const hours = [
      '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
    ];

    const elecProfile = [
      42, 38, 36, 35, 38, 45, 65, 95, 142, 168, 185, 192,
      178, 182, 175, 160, 140, 115, 92, 75, 62, 55, 48, 44,
    ];
    const waterProfile = [
      12, 10, 8, 8, 14, 25, 45, 78, 85, 72, 65, 88,
      95, 82, 70, 64, 52, 40, 30, 25, 20, 18, 15, 14,
    ];
    const wasteProfile = [
      5, 4, 3, 3, 6, 12, 28, 45, 58, 72, 85, 94,
      98, 88, 74, 62, 48, 32, 24, 18, 14, 10, 8, 6,
    ];

    let cumElec = 0;
    let cumWtr = 0;
    let cumWst = 0;
    let cumCst = 0;

    const initToday: TelemetryPoint[] = hours.map((hr, idx) => {
      const e = elecProfile[idx];
      const w = waterProfile[idx];
      const s = wasteProfile[idx];
      const c = Math.round(e * 8.2);

      cumElec += e;
      cumWtr += w * 60;
      cumWst += s;
      cumCst += c;

      return {
        time: hr,
        rawTime: idx,
        electricity: e,
        water: w,
        waste: s,
        cost: c,
        cumElectricity: cumElec,
        cumWater: cumWtr,
        cumWaste: cumWst,
        cumCost: cumCst,
        activeKw: e,
        flowLpm: w,
        voltage: 231.0,
        powerFactor: 0.98,
      };
    });
    setTodayData(initToday);

    // Initial packet stream seed
    setPacketLogs([
      {
        id: 'p-1',
        timestamp: formatTime(new Date(now - 4500)),
        nodeId: 'PWR-MAIN-SUB01',
        protocol: 'MQTT',
        category: 'POWER',
        topic: 'svvv/grid/electricity/kwh',
        summary: 'Substation Load: 142.4 kW | 231.2V | PF: 0.98 | Total: 48,250 kWh',
      },
      {
        id: 'p-2',
        timestamp: formatTime(new Date(now - 3200)),
        nodeId: 'HYD-DN50-MTR03',
        protocol: 'MQTT',
        category: 'HYDRO',
        topic: 'svvv/water/flow/liters',
        summary: 'Hydro Velocity: 64.2 L/min | Pressure: 3.8 bar | Total: 320,400 L',
      },
      {
        id: 'p-3',
        timestamp: formatTime(new Date(now - 1800)),
        nodeId: 'BIN-CAFE-LORA',
        protocol: 'LoRaWAN',
        category: 'WASTE',
        topic: 'svvv/waste/sonar/cafeteria',
        summary: 'Ultrasonic Fill: 88% | Daily Mass: 590 kg | Station: Cafeteria Quad',
      },
      {
        id: 'p-4',
        timestamp: formatTime(new Date(now - 600)),
        nodeId: 'CEA-TARIFF-FIN01',
        protocol: 'Modbus',
        category: 'FINANCE',
        topic: 'svvv/finance/cost/run_rate',
        summary: 'Run-Rate: ₹1,180/hr | Cumulative: ₹3,95,000 INR | Carbon: 39,565 kg',
      },
    ]);
  }, []);

  // Realtime Live Streaming Engine
  useEffect(() => {
    if (!mounted || !isStreaming || timeFilter !== 'realtime') return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = formatTime(now, true);

      setRealtimeData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];

        // Anomaly offsets
        let powerOffset = 0;
        let waterOffset = 0;
        let binOffset = 0;

        if (activeAnomaly === 'power_surge') powerOffset = 75.0; // +75 kW spike
        if (activeAnomaly === 'water_burst') waterOffset = 45.0; // +45 L/min burst
        if (activeAnomaly === 'bin_overflow') binOffset = 15.0; // Push bin overfill

        // Live values with micro-fluctuations
        const nextActiveKw = Math.max(105, Math.min(260, last.activeKw + (Math.random() * 4 - 2) + powerOffset));
        const nextFlowLpm = Math.max(25, Math.min(130, last.flowLpm + (Math.random() * 3 - 1.5) + waterOffset));
        const nextWasteRate = Math.max(0.4, Math.min(2.5, last.waste + (Math.random() * 0.2 - 0.1) + (binOffset > 0 ? 0.8 : 0)));
        const nextCostRate = Math.round(nextActiveKw * 8.2);

        // Incremental accumulation to cumulative dashboard totals
        const incElec = Math.round((nextActiveKw / 1800) * 10) / 10;
        const incWater = Math.round((nextFlowLpm / 30) * 10) / 10;
        const incWaste = Math.round((nextWasteRate / 60) * 100) / 100;
        const incCost = Math.round(nextCostRate / 1800);

        const nextPoint: TelemetryPoint = {
          time: timeStr,
          rawTime: now.getTime(),
          electricity: Math.round(nextActiveKw * 10) / 10,
          water: Math.round(nextFlowLpm * 10) / 10,
          waste: Math.round(nextWasteRate * 10) / 10,
          cost: nextCostRate,
          cumElectricity: Math.round(last.cumElectricity + incElec),
          cumWater: Math.round(last.cumWater + incWater),
          cumWaste: Math.round((last.cumWaste + incWaste) * 10) / 10,
          cumCost: Math.round(last.cumCost + incCost),
          activeKw: Math.round(nextActiveKw * 10) / 10,
          flowLpm: Math.round(nextFlowLpm * 10) / 10,
          voltage: Math.round((230.8 + Math.random() * 1.5 - 0.75) * 10) / 10,
          powerFactor: Math.round((0.97 + Math.random() * 0.02 - 0.01) * 100) / 100,
        };

        return [...prev.slice(1), nextPoint];
      });

      // Update Top KPI Totals live!
      setTotals((prev) => ({
        ...prev,
        electricityKwh: prev.electricityKwh + (Math.random() > 0.5 ? 1 : 0),
        waterLiters: prev.waterLiters + Math.round(2 + Math.random() * 2),
        costInr: prev.costInr + (Math.random() > 0.6 ? 2 : 1),
      }));

      // Dynamically fluctuate building sensor values
      setBuildings((prev) =>
        prev.map((b, idx) => {
          const deltaKw = Math.round((Math.random() * 1.6 - 0.8) * 10) / 10;
          const deltaLpm = Math.round((Math.random() * 1.2 - 0.6) * 10) / 10;
          const newActiveKw = Math.max(10, Math.round((b.activeKw + deltaKw) * 10) / 10);
          const newFlowLpm = Math.max(4, Math.round((b.flowLpm + deltaLpm) * 10) / 10);

          let newBin = b.binPct;
          if (idx === 1 && activeAnomaly === 'bin_overflow') {
            newBin = 98;
          } else {
            newBin = Math.min(99, Math.max(10, b.binPct + (Math.random() > 0.8 ? 1 : 0)));
          }

          return {
            ...b,
            activeKw: newActiveKw,
            flowLpm: newFlowLpm,
            binPct: newBin,
            status: newBin >= 85 || newActiveKw > 60 ? 'Surging' : newBin >= 70 ? 'Elevated' : 'Optimal',
          };
        })
      );

      // Append real-time MQTT / LoRaWAN packet
      if (!isTerminalPaused) {
        let log: PacketLog;
        if (activeMetric === 'electricity') {
          log = {
            id: `p-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'PWR-SUB-01',
            protocol: 'MQTT',
            category: 'POWER',
            topic: 'svvv/grid/electricity/kwh',
            summary: `Active Demand: ${(140 + Math.random() * 6).toFixed(1)} kW | Line V: 231.2V | PF: 0.98`,
          };
        } else if (activeMetric === 'water') {
          log = {
            id: `p-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'HYD-MAIN-03',
            protocol: 'MQTT',
            category: 'HYDRO',
            topic: 'svvv/water/flow/liters',
            summary: `Hydro Flow: ${(62 + Math.random() * 6).toFixed(1)} L/min | Pressure: 3.8 bar`,
          };
        } else if (activeMetric === 'waste') {
          log = {
            id: `p-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'BIN-CAFE-01',
            protocol: 'LoRaWAN',
            category: 'WASTE',
            topic: 'svvv/waste/sonar/cafeteria',
            summary: `Sonar Fill: ${Math.round(85 + Math.random() * 5)}% | RSSI: -72 dBm | Battery: 3.64V`,
          };
        } else {
          log = {
            id: `p-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'CEA-FIN-ENGINE',
            protocol: 'Modbus',
            category: 'FINANCE',
            topic: 'svvv/finance/cost/run_rate',
            summary: `Dynamic Run-Rate: ₹${Math.round(1160 + Math.random() * 40)}/hr | Grid Tariff: ₹8.2/kWh`,
          };
        }
        setPacketLogs((prev) => [log, ...prev.slice(0, 19)]);
      }
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [mounted, isStreaming, timeFilter, streamSpeed, activeAnomaly, isTerminalPaused, activeMetric]);

  // Anomaly auto-restore
  useEffect(() => {
    if (activeAnomaly !== 'none') {
      const timer = setTimeout(() => {
        setActiveAnomaly('none');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activeAnomaly]);

  // Active dataset based on timeFilter
  const currentDataset = useMemo(() => {
    switch (timeFilter) {
      case 'past5m':
        return past5mData;
      case 'past10m':
        return past10mData;
      case 'today':
        return todayData;
      case 'realtime':
      default:
        return realtimeData;
    }
  }, [timeFilter, realtimeData, past5mData, past10mData, todayData]);

  // Latest instant reading for top cards
  const latest = useMemo(() => {
    if (currentDataset.length === 0) {
      return {
        electricity: 142.4,
        water: 64.2,
        waste: 0.9,
        cost: 1180,
        cumElectricity: 48250,
        cumWater: 320400,
        cumWaste: 1450,
        cumCost: 395000,
        activeKw: 142.4,
        flowLpm: 64.2,
        voltage: 231.2,
        powerFactor: 0.98,
      };
    }
    return currentDataset[currentDataset.length - 1];
  }, [currentDataset]);

  // Circular progress ring calculation (radius 28)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totals.sustainabilityScore / 100) * circumference;

  // Chart dataKey based on mode
  const chartDataKey = useMemo(() => {
    if (chartMode === 'cumulative') {
      if (activeMetric === 'electricity') return 'cumElectricity';
      if (activeMetric === 'water') return 'cumWater';
      if (activeMetric === 'waste') return 'cumWaste';
      return 'cumCost';
    }
    return activeMetric;
  }, [chartMode, activeMetric]);

  // Handlers
  const handleTriggerAnomaly = (type: 'power_surge' | 'water_burst' | 'bin_overflow') => {
    setActiveAnomaly(type);
    if (timeFilter !== 'realtime') setTimeFilter('realtime');
    if (!isStreaming) setIsStreaming(true);
  };

  const handleDispatchCrew = (buildingName: string) => {
    setDispatchToast(`🚀 Autonomous Dispatch: Sanitation team notified for ${buildingName}. Real-time GPS dispatched.`);
    setTimeout(() => setDispatchToast(null), 5000);
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 animate-spin">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Connecting to SVVV Campus IoT Gateway & Modbus Grid...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert Notice */}
      {dispatchToast && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between shadow-xl shadow-emerald-950/20 border border-emerald-700/50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-sm font-medium">{dispatchToast}</p>
          </div>
          <button
            onClick={() => setDispatchToast(null)}
            className="text-emerald-300 hover:text-white text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Banner: IoT Command Center & Live Telemetry Controls */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 md:p-8 shadow-2xl shadow-slate-950/40">
        {/* Neon Glow backdrops */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Header Info */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${isStreaming ? 'animate-ping' : ''} opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {isStreaming ? 'Stream Active (Real-Time IoT)' : 'Stream Paused'}
              </div>

              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                SVVV Campus Gateway • 18ms Latency
              </span>

              {activeAnomaly !== 'none' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Spike Active: {activeAnomaly.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Campus IoT Live Telemetry</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-800 text-emerald-400 border border-slate-700 font-mono">
                DASHBOARD METRICS (LIVE STREAM)
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              Live IoT simulation streaming the exact same campus sustainability data (Electricity, Water, Waste, Cost & Buildings) with high-frequency updates and flexible filters.
            </p>
          </div>

          {/* Flex & Presentation Live Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 shadow-lg">
            {/* Play/Pause Button */}


            {/* Speed Multiplier */}
            {/* <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700/80 text-xs">
              <span className="text-[10px] text-slate-400 px-2 font-mono uppercase">Speed:</span>
              <button
                onClick={() => setStreamSpeed(2000)}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${streamSpeed === 2000 ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
              >
                1x
              </button>
              <button
                onClick={() => setStreamSpeed(800)}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${streamSpeed === 800 ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
              >
                2x
              </button>
              <button
                onClick={() => setStreamSpeed(300)}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${streamSpeed === 300 ? 'bg-cyan-400 text-slate-950 shadow-xs font-extrabold' : 'text-slate-400 hover:text-cyan-300'
                  }`}
              >
                5x Flex ⚡
              </button>
            </div> */}

            {/* Anomaly Flex Spikes */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleTriggerAnomaly('power_surge')}
                title="Inject sudden 75 kW power surge"
                className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-600 text-xs font-semibold transition flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Surge</span>
              </button>

              <button
                onClick={() => handleTriggerAnomaly('water_burst')}
                title="Inject water line burst"
                className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-600 text-xs font-semibold transition flex items-center gap-1"
              >
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Burst</span>
              </button>

              <button
                onClick={() => handleTriggerAnomaly('bin_overflow')}
                title="Trigger 98% Cafeteria Bin Overflow"
                className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-red-500/20 text-slate-300 hover:text-red-300 border border-slate-600 text-xs font-semibold transition flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
                <span>Overflow</span>
              </button>

              {activeAnomaly !== 'none' && (
                <button
                  onClick={() => setActiveAnomaly('none')}
                  title="Reset to baseline"
                  className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Time Filters Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Time Window:
            </span>

            <div className="inline-flex p-1 bg-slate-800/90 rounded-2xl border border-slate-700">
              <button
                onClick={() => setTimeFilter('realtime')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${timeFilter === 'realtime'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${timeFilter === 'realtime' ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'}`} />
                <span>Realtime (Live Stream)</span>
              </button>

              <button
                onClick={() => setTimeFilter('past5m')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${timeFilter === 'past5m' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                Past 5 min
              </button>

              <button
                onClick={() => setTimeFilter('past10m')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${timeFilter === 'past10m' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                Past 10 min
              </button>

              <button
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${timeFilter === 'today' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                Today (24h Diurnal)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>Points: <strong className="text-white">{currentDataset.length}</strong></span>
            <span>•</span>
            <span>Update: <strong className="text-emerald-400">{timeFilter === 'realtime' ? `${streamSpeed / 1000}s/tick` : 'Static Snapshot'}</strong></span>
            <span>•</span>
            <span className="hidden sm:inline">Sensors: <strong className="text-cyan-400">24 IoT Nodes Online</strong></span>
          </div>
        </div>
      </div>

      {/* Primary KPI Command Cards (Showing the exact Dashboard data with live telemetry) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Campus Electricity */}
        <div
          onClick={() => setActiveMetric('electricity')}
          className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all relative overflow-hidden ${activeMetric === 'electricity'
            ? 'border-emerald-500 ring-2 ring-emerald-500/20'
            : 'border-slate-200/80 hover:border-emerald-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-600" />
              Total Electricity
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Wifi className="w-3 h-3" />
              {latest.activeKw.toFixed(1)} kW Live
            </span>
          </div>

          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {totals.electricityKwh.toLocaleString('en-IN')} <span className="text-base font-semibold text-slate-500 font-sans">kWh</span>
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Grid: <strong className="text-slate-800">{latest.voltage}V / 50Hz</strong></span>
            <span className="text-emerald-800 font-semibold">PF {latest.powerFactor}</span>
          </div>
        </div>

        {/* KPI 2: Water Consumption */}
        <div
          onClick={() => setActiveMetric('water')}
          className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all relative overflow-hidden ${activeMetric === 'water'
            ? 'border-cyan-500 ring-2 ring-cyan-500/20'
            : 'border-slate-200/80 hover:border-cyan-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-600" />
              Water Consumption
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md">
              <Gauge className="w-3 h-3" />
              {latest.flowLpm.toFixed(1)} L/min
            </span>
          </div>

          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {totals.waterLiters.toLocaleString('en-IN')} <span className="text-base font-semibold text-slate-500 font-sans">L</span>
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pipeline: <strong className="text-slate-800">3.8 bar</strong></span>
            <span className="text-cyan-800 font-semibold">Auto-Pumping</span>
          </div>
        </div>

        {/* KPI 3: Waste Generated */}
        <div
          onClick={() => setActiveMetric('waste')}
          className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all relative overflow-hidden ${activeMetric === 'waste'
            ? 'border-amber-500 ring-2 ring-amber-500/20'
            : 'border-slate-200/80 hover:border-amber-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              Waste Generated
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
              4 LoRa Bins
            </span>
          </div>

          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            {totals.wasteKg.toLocaleString('en-IN')} <span className="text-base font-semibold text-slate-500 font-sans">kg</span>
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Sonar Fill: <strong className="text-slate-800">{buildings[1]?.binPct || 88}% Max</strong></span>
            <span className="text-emerald-800 font-semibold">92% Diverted</span>
          </div>
        </div>

        {/* KPI 4: Equivalent Cost */}
        <div
          onClick={() => setActiveMetric('cost')}
          className={`bg-white border rounded-2xl p-5 shadow-xs cursor-pointer transition-all relative overflow-hidden ${activeMetric === 'cost'
            ? 'border-purple-500 ring-2 ring-purple-500/20'
            : 'border-slate-200/80 hover:border-purple-300'
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-purple-600" />
              Estimated Cost
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md font-mono">
              ₹{latest.cost}/hr
            </span>
          </div>

          <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono mt-3">
            ₹{totals.costInr.toLocaleString('en-IN')}
          </p>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tariff: <strong className="text-slate-800">CEA Tier-2</strong></span>
            <span className="text-purple-800 font-semibold">Live Accrual</span>
          </div>
        </div>
      </div>

      {/* Campus Sustainability Score & Carbon Offset Banner */}
      <div className="p-6 sm:p-7 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 rounded-3xl border border-emerald-200/80 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          {/* Radial progress ring */}
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r={radius} stroke="#e2e8f0" strokeWidth="6" fill="transparent" />
                <circle
                  cx="36"
                  cy="36"
                  r={radius}
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900 leading-none">
                  {totals.sustainabilityScore}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">/ 100</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Silver Standard EcoCampus
                </span>
                <span className="text-xs font-semibold text-slate-400">SVVV Indore</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                Campus Environmental Intelligence & Carbon Footprint
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                IoT telemetry tracks resource consumption and generates automated CEA India emission factors in real-time.
              </p>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-200 w-full lg:w-auto">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <CloudFog className="w-3.5 h-3.5 text-slate-400" />
                <span>Gross CO₂ Emissions</span>
              </div>
              <p className="text-lg font-extrabold text-slate-900 font-mono">
                {totals.co2Kg.toLocaleString('en-IN')} kg
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Trees className="w-3.5 h-3.5 text-emerald-600" />
                <span>Offset Requirement</span>
              </div>
              <p className="text-lg font-extrabold text-emerald-700 font-mono">
                {Math.round(totals.co2Kg / 21.7).toLocaleString('en-IN')} Trees
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>Potential Savings</span>
              </div>
              <p className="text-lg font-extrabold text-emerald-700 font-mono">
                ₹{totals.potentialSavingsInr.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Dynamic Streaming Trajectory Chart */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        {/* Metric Selector Tabs & Mode Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-100">
          {/* Resource Selector Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {(['electricity', 'water', 'waste', 'cost'] as ResourceMetric[]).map((metricKey) => {
              const cfg = metricConfigs[metricKey];
              const Icon = cfg.icon;
              const isSelected = activeMetric === metricKey;

              return (
                <button
                  key={metricKey}
                  onClick={() => setActiveMetric(metricKey)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${isSelected
                    ? cfg.bgPill
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cfg.label}</span>
                </button>
              );
            })}
          </div>

          {/* Rate vs Cumulative Toggle */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold text-slate-600">
              <button
                onClick={() => setChartMode('rate')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${chartMode === 'rate' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
              >
                Instant Telemetry Rate
              </button>
              <button
                onClick={() => setChartMode('cumulative')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${chartMode === 'cumulative' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'hover:text-slate-900'
                  }`}
              >
                Cumulative Campus Total
              </button>
            </div>
          </div>
        </div>

        {/* Chart Subhead */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            Sensor Interface: <strong className="text-slate-700">{currentConfig.sensorProtocol}</strong>
          </span>
          <span className="font-mono">
            Metric: <strong className="text-slate-900">{chartMode === 'rate' ? currentConfig.rateUnit : currentConfig.unit}</strong>
          </span>
        </div>

        {/* Recharts Streaming Area Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentDataset} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis
                unit={` ${currentConfig.unit}`}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-mono text-slate-400 font-bold border-b border-slate-800 pb-1">
                        Timestamp: {label}
                      </p>
                      <div className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5" style={{ color: currentConfig.color }}>
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentConfig.color }} />
                          {currentConfig.label}:
                        </span>
                        <span className="font-mono font-bold text-white">
                          {payload[0].value} {currentConfig.unit}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey={chartDataKey}
                name={currentConfig.label}
                stroke={currentConfig.color}
                strokeWidth={2.5}
                fillOpacity={1}
                fill={`url(#${currentConfig.gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Building-by-Building IoT Comparison Section (Live Bar Chart & Telemetry Status) */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Campus Building Telemetry & Live Sensor Matrix
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live consumption distribution and smart meter readings across SVVV campus facilities
            </p>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
            {buildings.length} Connected Facilities
          </span>
        </div>

        {/* Building Comparison Bar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={buildings.map((b) => ({
                name: b.name.replace(/ \(.*\)/, ''),
                value:
                  activeMetric === 'electricity'
                    ? b.electricity
                    : activeMetric === 'water'
                      ? b.water
                      : activeMetric === 'waste'
                        ? b.waste
                        : b.cost,
                activeRate:
                  activeMetric === 'electricity'
                    ? `${b.activeKw} kW`
                    : activeMetric === 'water'
                      ? `${b.flowLpm} L/m`
                      : activeMetric === 'waste'
                        ? `${b.binPct}% fill`
                        : `₹${Math.round(b.activeKw * 8.2)}/hr`,
              }))}
              margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
                interval={0}
              />
              <YAxis
                unit={` ${currentConfig.unit}`}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-slate-900 border border-slate-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                      <p className="font-bold text-slate-300">{label}</p>
                      <p className="font-mono text-emerald-400 font-bold">
                        Total: {payload[0].value} {currentConfig.unit}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Live Sensor Draw: {payload[0].payload.activeRate}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill={currentConfig.color} radius={[6, 6, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Live Facility Telemetry Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {buildings.map((b) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border transition-all ${b.status === 'Surging'
                ? 'bg-red-50/60 border-red-200'
                : b.status === 'Elevated'
                  ? 'bg-amber-50/50 border-amber-200'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-white hover:shadow-xs'
                }`}
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{b.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${b.status === 'Surging'
                    ? 'bg-red-100 text-red-700 animate-pulse'
                    : b.status === 'Elevated'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                    }`}
                >
                  {b.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Power Load</span>
                  <strong className="text-slate-900">{b.activeKw} kW</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Water Flow</span>
                  <strong className="text-cyan-700">{b.flowLpm} L/m</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">Bin Fill</span>
                  <strong className={b.binPct >= 85 ? 'text-red-600' : 'text-slate-900'}>{b.binPct}%</strong>
                </div>
              </div>

              {b.binPct >= 85 && (
                <div className="mt-3 pt-2 border-t border-red-200/60 flex items-center justify-between">
                  <span className="text-[10px] text-red-700 font-semibold">Overfill Warning</span>
                  <button
                    onClick={() => handleDispatchCrew(b.name)}
                    className="text-[10px] font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-2.5 h-2.5" />
                    Dispatch Team
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live MQTT / LoRaWAN Terminal Ingestion Stream */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-300 shadow-2xl font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isStreaming ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-bold text-white tracking-wide text-sm font-sans flex items-center gap-2">
              <span>Live Campus IoT Ingestion Feed</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 font-mono">
                MQTT Broker / LoRaWAN Server
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTerminalPaused(!isTerminalPaused)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-medium transition cursor-pointer"
            >
              {isTerminalPaused ? 'Resume Feed' : 'Pause Feed'}
            </button>
            <button
              onClick={() => setPacketLogs([])}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-sans font-medium transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable Packet Stream */}
        <div className="space-y-2 max-h-52 overflow-y-auto pr-2 scrollbar-thin">
          {packetLogs.length === 0 ? (
            <p className="text-slate-600 italic py-4 text-center">Waiting for incoming telemetry packets...</p>
          ) : (
            packetLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800/80 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-[11px]">[{log.timestamp}]</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${log.protocol === 'MQTT'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : log.protocol === 'LoRaWAN'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    }`}>
                    {log.protocol}
                  </span>
                  <span className="text-cyan-300 font-semibold">{log.nodeId}</span>
                  <span className="text-slate-400 hidden lg:inline">› {log.topic}</span>
                </div>

                <div className="text-slate-300 text-[11px] truncate md:max-w-md">
                  {log.summary}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

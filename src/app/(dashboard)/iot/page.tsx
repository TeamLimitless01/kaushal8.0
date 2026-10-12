'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  Wind,
  Gauge,
  Radio,
  Play,
  Pause,
  FastForward,
  AlertTriangle,
  RotateCcw,
  Wifi,
  Cpu,
  Server,
  Layers,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Battery,
  Flame,
  Volume2,
  VolumeX,
  Clock,
  ShieldAlert,
  Send,
} from 'lucide-react';

// Time filter options
type TimeFilter = 'realtime' | 'past5m' | 'past10m' | 'today';
type PowerViewMode = 'grid_solar' | 'phases' | 'efficiency';

interface TelemetryPoint {
  time: string;
  rawTime: number;
  // Power & Energy
  powerGridKw: number;
  solarGenKw: number;
  netDemandKw: number;
  voltage: number;
  powerFactor: number;
  frequency: number;
  phaseR: number;
  phaseY: number;
  phaseB: number;
  // Hydro
  waterFlowLpm: number;
  waterPressureBar: number;
  tank1LevelPct: number;
  tank2LevelPct: number;
  // Waste Bins (fill %)
  binCafeteriaPct: number;
  binBlock2Pct: number;
  binLibraryPct: number;
  binBiotechPct: number;
  // IEQ / Climate
  co2Ppm: number;
  pm25: number;
  tempC: number;
  humidityPct: number;
}

interface PacketLog {
  id: string;
  timestamp: string;
  nodeId: string;
  protocol: 'MQTT' | 'LoRaWAN' | 'Modbus';
  category: 'POWER' | 'HYDRO' | 'WASTE' | 'AIR';
  topic: string;
  summary: string;
  payload: Record<string, any>;
}

// Initial seed generators
function formatTimeString(date: Date, includeSec = true): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  if (!includeSec) return `${h}:${m}`;
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function generateInitialRealtimePoints(count = 20): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  const stepMs = 2000;

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const baseKw = 135 + Math.sin(i * 0.4) * 8 + (Math.random() * 4 - 2);
    const solarKw = Math.max(15, 45 + Math.sin(i * 0.2) * 5 + (Math.random() * 3 - 1.5));
    const flowLpm = Math.max(20, 58 + Math.cos(i * 0.3) * 6 + (Math.random() * 4 - 2));

    points.push({
      time: formatTimeString(t, true),
      rawTime: t.getTime(),
      powerGridKw: Math.round(baseKw * 10) / 10,
      solarGenKw: Math.round(solarKw * 10) / 10,
      netDemandKw: Math.max(20, Math.round((baseKw - solarKw) * 10) / 10),
      voltage: Math.round((230.5 + Math.random() * 2 - 1) * 10) / 10,
      powerFactor: Math.round((0.97 + Math.random() * 0.02 - 0.01) * 100) / 100,
      frequency: Math.round((50.0 + (Math.random() * 0.08 - 0.04)) * 100) / 100,
      phaseR: Math.round((baseKw * 0.34 + Math.random() * 2) * 10) / 10,
      phaseY: Math.round((baseKw * 0.33 + Math.random() * 2) * 10) / 10,
      phaseB: Math.round((baseKw * 0.33 + Math.random() * 2) * 10) / 10,
      waterFlowLpm: Math.round(flowLpm * 10) / 10,
      waterPressureBar: Math.round((3.8 + Math.random() * 0.2 - 0.1) * 10) / 10,
      tank1LevelPct: Math.round(82 - (i * 0.05)),
      tank2LevelPct: Math.round(68 + (i * 0.04)),
      binCafeteriaPct: Math.min(98, Math.round(76 + i * 0.3)),
      binBlock2Pct: Math.min(95, Math.round(48 + i * 0.15)),
      binLibraryPct: Math.min(90, Math.round(32 + i * 0.1)),
      binBiotechPct: Math.min(95, Math.round(64 + i * 0.2)),
      co2Ppm: Math.round(590 + Math.random() * 20 - 10),
      pm25: Math.round(18 + Math.random() * 4 - 2),
      tempC: Math.round((24.2 + Math.random() * 0.4 - 0.2) * 10) / 10,
      humidityPct: Math.round(52 + Math.random() * 2 - 1),
    });
  }
  return points;
}

function generatePast5mPoints(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  const count = 30; // 1 every 10 seconds
  const stepMs = 10000;

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const wave = Math.sin((count - i) * 0.3);
    const baseKw = 138 + wave * 12 + (Math.random() * 5 - 2.5);
    const solarKw = 46 + Math.cos((count - i) * 0.2) * 6;
    const flowLpm = 62 + wave * 9;

    points.push({
      time: formatTimeString(t, true),
      rawTime: t.getTime(),
      powerGridKw: Math.round(baseKw * 10) / 10,
      solarGenKw: Math.round(solarKw * 10) / 10,
      netDemandKw: Math.round((baseKw - solarKw) * 10) / 10,
      voltage: Math.round((231 + Math.random() * 2 - 1) * 10) / 10,
      powerFactor: 0.98,
      frequency: 50.01,
      phaseR: Math.round((baseKw * 0.34) * 10) / 10,
      phaseY: Math.round((baseKw * 0.33) * 10) / 10,
      phaseB: Math.round((baseKw * 0.33) * 10) / 10,
      waterFlowLpm: Math.round(flowLpm * 10) / 10,
      waterPressureBar: 3.8,
      tank1LevelPct: Math.round(84 - (i * 0.1)),
      tank2LevelPct: Math.round(66 + (i * 0.1)),
      binCafeteriaPct: Math.min(95, Math.round(72 + (count - i) * 0.4)),
      binBlock2Pct: Math.round(45 + (count - i) * 0.2),
      binLibraryPct: Math.round(30 + (count - i) * 0.1),
      binBiotechPct: Math.round(60 + (count - i) * 0.3),
      co2Ppm: Math.round(600 + wave * 30),
      pm25: Math.round(19 + wave * 3),
      tempC: Math.round((24.0 + (count - i) * 0.02) * 10) / 10,
      humidityPct: 53,
    });
  }
  return points;
}

function generatePast10mPoints(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  const count = 40; // 1 every 15 seconds
  const stepMs = 15000;

  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(now - i * stepMs);
    const wave = Math.sin((count - i) * 0.2);
    const baseKw = 132 + wave * 16 + (Math.random() * 6 - 3);
    const solarKw = 48 + Math.cos((count - i) * 0.15) * 8;
    const flowLpm = 58 + wave * 12;

    points.push({
      time: formatTimeString(t, true),
      rawTime: t.getTime(),
      powerGridKw: Math.round(baseKw * 10) / 10,
      solarGenKw: Math.round(solarKw * 10) / 10,
      netDemandKw: Math.round((baseKw - solarKw) * 10) / 10,
      voltage: Math.round((230.8 + Math.random() * 1.5) * 10) / 10,
      powerFactor: 0.97,
      frequency: 50.0,
      phaseR: Math.round((baseKw * 0.34) * 10) / 10,
      phaseY: Math.round((baseKw * 0.33) * 10) / 10,
      phaseB: Math.round((baseKw * 0.33) * 10) / 10,
      waterFlowLpm: Math.round(flowLpm * 10) / 10,
      waterPressureBar: 3.7,
      tank1LevelPct: Math.round(86 - (i * 0.15)),
      tank2LevelPct: Math.round(64 + (i * 0.15)),
      binCafeteriaPct: Math.min(94, Math.round(68 + (count - i) * 0.5)),
      binBlock2Pct: Math.round(42 + (count - i) * 0.3),
      binLibraryPct: Math.round(28 + (count - i) * 0.15),
      binBiotechPct: Math.round(56 + (count - i) * 0.35),
      co2Ppm: Math.round(580 + wave * 45),
      pm25: Math.round(18 + wave * 4),
      tempC: Math.round((23.8 + (count - i) * 0.03) * 10) / 10,
      humidityPct: 54,
    });
  }
  return points;
}

function generateTodayPoints(): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  ];

  // Realistic daily university curve
  const gridProfile = [
    42, 38, 36, 35, 38, 45,
    65, 95, 142, 168, 185, 192,
    178, 182, 175, 160, 140, 115,
    92, 75, 62, 55, 48, 44,
  ];

  const solarProfile = [
    0, 0, 0, 0, 0, 0,
    5, 18, 42, 68, 88, 98,
    104, 98, 85, 62, 35, 12,
    0, 0, 0, 0, 0, 0,
  ];

  const waterProfile = [
    12, 10, 8, 8, 14, 25,
    45, 78, 85, 72, 65, 88,
    95, 82, 70, 64, 52, 40,
    30, 25, 20, 18, 15, 14,
  ];

  const co2Profile = [
    420, 415, 410, 410, 415, 430,
    460, 520, 680, 780, 840, 810,
    760, 820, 850, 790, 690, 580,
    510, 480, 450, 440, 430, 425,
  ];

  const nowHour = new Date().getHours();

  hours.forEach((hr, idx) => {
    const isPastOrCurrent = idx <= nowHour;
    const baseKw = gridProfile[idx] + (Math.random() * 6 - 3);
    const solarKw = solarProfile[idx];
    const flowLpm = waterProfile[idx];

    points.push({
      time: hr,
      rawTime: idx,
      powerGridKw: Math.round(baseKw * 10) / 10,
      solarGenKw: Math.round(solarKw * 10) / 10,
      netDemandKw: Math.max(10, Math.round((baseKw - solarKw) * 10) / 10),
      voltage: 231.0,
      powerFactor: 0.98,
      frequency: 50.0,
      phaseR: Math.round((baseKw * 0.34) * 10) / 10,
      phaseY: Math.round((baseKw * 0.33) * 10) / 10,
      phaseB: Math.round((baseKw * 0.33) * 10) / 10,
      waterFlowLpm: Math.round(flowLpm * 10) / 10,
      waterPressureBar: 3.8,
      tank1LevelPct: Math.round(92 - (idx * 1.5)),
      tank2LevelPct: Math.round(55 + (idx * 1.2)),
      binCafeteriaPct: Math.min(96, Math.round(15 + idx * 3.8)),
      binBlock2Pct: Math.min(92, Math.round(12 + idx * 2.8)),
      binLibraryPct: Math.min(85, Math.round(10 + idx * 2.2)),
      binBiotechPct: Math.min(90, Math.round(14 + idx * 3.1)),
      co2Ppm: co2Profile[idx],
      pm25: Math.round(14 + Math.sin(idx * 0.4) * 6),
      tempC: Math.round((21 + Math.sin((idx - 6) * 0.25) * 6) * 10) / 10,
      humidityPct: Math.round(62 - Math.sin((idx - 6) * 0.25) * 18),
    });
  });

  return points;
}

export default function IotDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('realtime');
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1500); // ms per tick
  const [powerView, setPowerView] = useState<PowerViewMode>('grid_solar');
  
  // Anomaly / Simulation inject state
  const [activeAnomaly, setActiveAnomaly] = useState<'none' | 'power_surge' | 'water_burst' | 'bin_overflow'>('none');
  const [anomalyDuration, setAnomalyDuration] = useState(0);

  // Total water counter accumulator
  const [cumulativeWaterLiters, setCumulativeWaterLiters] = useState(42860);

  // Telemetry buffer
  const [realtimeData, setRealtimeData] = useState<TelemetryPoint[]>([]);
  const [past5mData, setPast5mData] = useState<TelemetryPoint[]>([]);
  const [past10mData, setPast10mData] = useState<TelemetryPoint[]>([]);
  const [todayData, setTodayData] = useState<TelemetryPoint[]>([]);

  // Raw packet audit logs
  const [packetLogs, setPacketLogs] = useState<PacketLog[]>([]);
  const [isTerminalPaused, setIsTerminalPaused] = useState(false);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  // Initialize data on mount to prevent SSR hydration discrepancies
  useEffect(() => {
    setMounted(true);
    setRealtimeData(generateInitialRealtimePoints(20));
    setPast5mData(generatePast5mPoints());
    setPast10mData(generatePast10mPoints());
    setTodayData(generateTodayPoints());

    // Initial packet logs
    const seedLogs: PacketLog[] = [
      {
        id: 'pkt-1',
        timestamp: formatTimeString(new Date(Date.now() - 6000)),
        nodeId: 'PWR-SUB-01',
        protocol: 'MQTT',
        category: 'POWER',
        topic: 'svvv/grid/substation/phase_rms',
        summary: 'Active Demand: 142.4 kW | V_rms: 231.2V | PF: 0.98',
        payload: { active_kw: 142.4, pf: 0.98, v_rms: 231.2, freq_hz: 50.02 },
      },
      {
        id: 'pkt-2',
        timestamp: formatTimeString(new Date(Date.now() - 4200)),
        nodeId: 'SOL-ROOF-A',
        protocol: 'Modbus',
        category: 'POWER',
        topic: 'svvv/solar/inverter/array_out',
        summary: 'Solar Generation: 48.6 kW | Irradiance: 840 W/m²',
        payload: { pv_kw: 48.6, eff_pct: 98.2, temp_c: 44.1 },
      },
      {
        id: 'pkt-3',
        timestamp: formatTimeString(new Date(Date.now() - 2500)),
        nodeId: 'HYD-MAIN-03',
        protocol: 'MQTT',
        category: 'HYDRO',
        topic: 'svvv/water/flow/main_line',
        summary: 'Hydro Flow: 64.2 L/min | Line Pressure: 3.82 bar',
        payload: { flow_lpm: 64.2, press_bar: 3.82, valve_pos: 'OPEN' },
      },
      {
        id: 'pkt-4',
        timestamp: formatTimeString(new Date(Date.now() - 900)),
        nodeId: 'BIN-CAFE-01',
        protocol: 'LoRaWAN',
        category: 'WASTE',
        topic: 'svvv/waste/sonar/cafeteria',
        summary: 'Ultrasonic Sonar: 88.4% Capacity | Lid Cycles: 184',
        payload: { fill_pct: 88.4, dist_cm: 14.2, battery_v: 3.64 },
      },
    ];
    setPacketLogs(seedLogs);
  }, []);

  // Real-time ticking engine
  useEffect(() => {
    if (!mounted || !isStreaming || timeFilter !== 'realtime') return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = formatTimeString(now, true);

      setRealtimeData((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];

        // Anomaly injection influences
        let surgeOffset = 0;
        let waterSurgeOffset = 0;
        let binSurgeOffset = 0;

        if (activeAnomaly === 'power_surge') {
          surgeOffset = 78.5; // Big jump to ~220 kW
        } else if (activeAnomaly === 'water_burst') {
          waterSurgeOffset = 42.0; // Jump to ~110 L/min
        } else if (activeAnomaly === 'bin_overflow') {
          binSurgeOffset = 18.0; // Pushes bin to 98%
        }

        // Realistic subtle fluctuation
        const randomPowerDrift = (Math.random() * 5 - 2.5);
        const nextPower = Math.max(100, Math.min(260, last.powerGridKw + randomPowerDrift + surgeOffset));
        const nextSolar = Math.max(10, Math.min(75, last.solarGenKw + (Math.random() * 2 - 1)));
        const nextWaterFlow = Math.max(25, Math.min(130, last.waterFlowLpm + (Math.random() * 3 - 1.5) + waterSurgeOffset));
        const nextPressure = activeAnomaly === 'water_burst' ? 2.1 : Math.round((3.8 + Math.random() * 0.1 - 0.05) * 10) / 10;

        const nextPoint: TelemetryPoint = {
          time: timeStr,
          rawTime: now.getTime(),
          powerGridKw: Math.round(nextPower * 10) / 10,
          solarGenKw: Math.round(nextSolar * 10) / 10,
          netDemandKw: Math.max(15, Math.round((nextPower - nextSolar) * 10) / 10),
          voltage: Math.round((230.8 + Math.random() * 1.8 - 0.9) * 10) / 10,
          powerFactor: Math.round((0.97 + Math.random() * 0.02 - 0.01) * 100) / 100,
          frequency: Math.round((50.0 + (Math.random() * 0.06 - 0.03)) * 100) / 100,
          phaseR: Math.round((nextPower * 0.34 + Math.random() * 1.5) * 10) / 10,
          phaseY: Math.round((nextPower * 0.33 + Math.random() * 1.5) * 10) / 10,
          phaseB: Math.round((nextPower * 0.33 + Math.random() * 1.5) * 10) / 10,
          waterFlowLpm: Math.round(nextWaterFlow * 10) / 10,
          waterPressureBar: nextPressure,
          tank1LevelPct: Math.max(40, Math.min(95, Math.round(last.tank1LevelPct + (Math.random() * 0.4 - 0.25)))),
          tank2LevelPct: Math.max(30, Math.min(90, Math.round(last.tank2LevelPct + (Math.random() * 0.3 - 0.15)))),
          binCafeteriaPct: Math.min(99, Math.max(10, Math.round(last.binCafeteriaPct + (Math.random() * 0.5 - 0.1) + binSurgeOffset))),
          binBlock2Pct: Math.min(98, Math.max(10, Math.round(last.binBlock2Pct + (Math.random() * 0.3 - 0.1)))),
          binLibraryPct: Math.min(95, Math.max(5, Math.round(last.binLibraryPct + (Math.random() * 0.2 - 0.05)))),
          binBiotechPct: Math.min(98, Math.max(10, Math.round(last.binBiotechPct + (Math.random() * 0.3 - 0.1)))),
          co2Ppm: Math.round(last.co2Ppm + (Math.random() * 8 - 4)),
          pm25: Math.round(Math.max(10, last.pm25 + (Math.random() * 2 - 1))),
          tempC: Math.round((last.tempC + (Math.random() * 0.1 - 0.05)) * 10) / 10,
          humidityPct: Math.round(last.humidityPct + (Math.random() * 0.6 - 0.3)),
        };

        // Keep rolling buffer of max 22 points for smooth visible motion
        const updated = [...prev.slice(1), nextPoint];
        return updated;
      });

      // Increment water liters
      setCumulativeWaterLiters((prev) => prev + Math.round(1.2 + Math.random() * 0.8));

      // Append raw packet audit log
      if (!isTerminalPaused) {
        const protocols: Array<'MQTT' | 'LoRaWAN' | 'Modbus'> = ['MQTT', 'LoRaWAN', 'Modbus'];
        const pCol = protocols[Math.floor(Math.random() * protocols.length)];
        
        let newLog: PacketLog;
        const roll = Math.random();

        if (roll < 0.3) {
          const val = Math.round((140 + Math.random() * 10) * 10) / 10;
          newLog = {
            id: `pkt-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'PWR-SUB-01',
            protocol: 'MQTT',
            category: 'POWER',
            topic: 'svvv/grid/substation/telemetry',
            summary: `Active Demand: ${val} kW | PF: 0.98 | V: 231.4V`,
            payload: { active_kw: val, pf: 0.98, v_rms: 231.4 },
          };
        } else if (roll < 0.6) {
          const flow = Math.round((60 + Math.random() * 12) * 10) / 10;
          newLog = {
            id: `pkt-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'HYD-MAIN-03',
            protocol: 'MQTT',
            category: 'HYDRO',
            topic: 'svvv/water/meter/flow_rate',
            summary: `Flow Rate: ${flow} L/min | Pressure: 3.8 bar`,
            payload: { flow_lpm: flow, press_bar: 3.8 },
          };
        } else if (roll < 0.85) {
          const fill = Math.round(75 + Math.random() * 15);
          newLog = {
            id: `pkt-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'BIN-CAFE-01',
            protocol: 'LoRaWAN',
            category: 'WASTE',
            topic: 'svvv/waste/ultrasonic/node',
            summary: `Sonar Fill: ${fill}% | RSSI: -74 dBm`,
            payload: { fill_pct: fill, rssi_dbm: -74, snr: 9.2 },
          };
        } else {
          const co2 = Math.round(590 + Math.random() * 30);
          newLog = {
            id: `pkt-${Date.now()}`,
            timestamp: timeStr,
            nodeId: 'ENV-BLOCK2-04',
            protocol: 'Modbus',
            category: 'AIR',
            topic: 'svvv/ieq/sensirion/climate',
            summary: `CO₂: ${co2} ppm | PM2.5: 16 µg/m³ | Temp: 24.2°C`,
            payload: { co2_ppm: co2, pm25: 16, temp_c: 24.2 },
          };
        }

        setPacketLogs((prev) => [newLog, ...prev.slice(0, 19)]);
      }
    }, streamSpeed);

    return () => clearInterval(interval);
  }, [mounted, isStreaming, timeFilter, streamSpeed, activeAnomaly, isTerminalPaused]);

  // Handle anomaly timeout auto-reset after 12 seconds
  useEffect(() => {
    if (activeAnomaly !== 'none') {
      const timer = setTimeout(() => {
        setActiveAnomaly('none');
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [activeAnomaly]);

  // Current active dataset depending on filter
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

  // Latest point for KPI cards
  const latest = useMemo(() => {
    if (currentDataset.length === 0) {
      return {
        powerGridKw: 142.4,
        solarGenKw: 48.6,
        netDemandKw: 93.8,
        voltage: 231.2,
        powerFactor: 0.98,
        frequency: 50.02,
        phaseR: 48.4,
        phaseY: 47.0,
        phaseB: 47.0,
        waterFlowLpm: 64.2,
        waterPressureBar: 3.8,
        tank1LevelPct: 82,
        tank2LevelPct: 68,
        binCafeteriaPct: 88,
        binBlock2Pct: 48,
        binLibraryPct: 32,
        binBiotechPct: 64,
        co2Ppm: 595,
        pm25: 18,
        tempC: 24.2,
        humidityPct: 52,
      };
    }
    return currentDataset[currentDataset.length - 1];
  }, [currentDataset]);

  // Handlers
  const triggerAnomaly = (type: 'power_surge' | 'water_burst' | 'bin_overflow') => {
    setActiveAnomaly(type);
    if (timeFilter !== 'realtime') {
      setTimeFilter('realtime');
    }
    if (!isStreaming) {
      setIsStreaming(true);
    }
  };

  const handleDispatchCrew = (stationName: string) => {
    setDispatchNotice(`🚀 Autonomous Dispatch: Sanitation team notified for ${stationName}. GPS route generated.`);
    setTimeout(() => setDispatchNotice(null), 5000);
  };

  if (!mounted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 animate-spin">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-600">Initializing SVVV Campus IoT Gateway Stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Dispatch or Anomaly Toast Notice */}
      {dispatchNotice && (
        <div className="p-4 rounded-2xl bg-emerald-900 text-white flex items-center justify-between shadow-xl shadow-emerald-950/20 animate-fade-in border border-emerald-700/50">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-sm font-medium">{dispatchNotice}</p>
          </div>
          <button
            onClick={() => setDispatchNotice(null)}
            className="text-emerald-300 hover:text-white text-xs font-semibold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner & Live Control Center */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 md:p-8 shadow-2xl shadow-slate-950/40">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title & Gateway Health */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 ${isStreaming ? 'animate-ping' : ''} opacity-75`}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                {isStreaming ? 'Stream Active (LoRaWAN & MQTT)' : 'Stream Paused'}
              </div>

              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                Gateway SVVV-IND-01 • 18ms Latency
              </span>

              {activeAnomaly !== 'none' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-bold animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Anomaly Active: {activeAnomaly.toUpperCase()}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>Smart Campus IoT Telemetry</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-800 text-cyan-400 border border-slate-700 font-mono">
                LIVE DEMO
              </span>
            </h1>

            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              High-frequency multi-sensor telemetry stream showcasing SVVV campus smart grid, hydro-flow metering, ultrasonic waste monitoring, and indoor ambient air quality.
            </p>
          </div>

          {/* Real-time Demo & Presentation Flex Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-800/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700/60 shadow-lg">
            {/* Play/Pause Button */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isStreaming
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-emerald-500 text-slate-950 font-extrabold hover:bg-emerald-400'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Resume Live</span>
                </>
              )}
            </button>

            {/* Stream Speed Selector */}
            <div className="flex items-center bg-slate-900/80 rounded-xl p-1 border border-slate-700/80 text-xs">
              <span className="text-[10px] text-slate-400 px-2 font-mono uppercase">Speed:</span>
              <button
                onClick={() => setStreamSpeed(2000)}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
                  streamSpeed === 2000
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1x
              </button>
              <button
                onClick={() => setStreamSpeed(800)}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
                  streamSpeed === 800
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2x
              </button>
              <button
                onClick={() => setStreamSpeed(300)}
                className={`px-2 py-1 rounded-lg font-bold transition text-[11px] ${
                  streamSpeed === 300
                    ? 'bg-cyan-400 text-slate-950 shadow-xs font-extrabold'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                5x Flex ⚡
              </button>
            </div>

            {/* Quick Anomaly / Event Trigger Dropdown */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => triggerAnomaly('power_surge')}
                title="Inject sudden 80 kW demand surge"
                className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-600 text-xs font-semibold transition flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Surge</span>
              </button>

              <button
                onClick={() => triggerAnomaly('water_burst')}
                title="Inject pipe burst / leak warning"
                className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-600 text-xs font-semibold transition flex items-center gap-1"
              >
                <Droplets className="w-3 h-3 text-cyan-400" />
                <span>Leak</span>
              </button>

              <button
                onClick={() => triggerAnomaly('bin_overflow')}
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

        {/* Time Window Filters Bar */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Time Window:
            </span>

            <div className="inline-flex p-1 bg-slate-800/90 rounded-2xl border border-slate-700">
              <button
                onClick={() => setTimeFilter('realtime')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeFilter === 'realtime'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${timeFilter === 'realtime' ? 'bg-slate-950 animate-ping' : 'bg-emerald-400'}`} />
                <span>Realtime (Live Stream)</span>
              </button>

              <button
                onClick={() => setTimeFilter('past5m')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  timeFilter === 'past5m'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Past 5 min
              </button>

              <button
                onClick={() => setTimeFilter('past10m')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  timeFilter === 'past10m'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Past 10 min
              </button>

              <button
                onClick={() => setTimeFilter('today')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  timeFilter === 'today'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Today (24h Diurnal)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>Points: <strong className="text-white">{currentDataset.length}</strong></span>
            <span>•</span>
            <span>Freq: <strong className="text-emerald-400">{timeFilter === 'realtime' ? `${streamSpeed / 1000}s/pkt` : 'Aggregated'}</strong></span>
            <span>•</span>
            <span className="hidden sm:inline">Sensors: <strong className="text-cyan-400">18 Online</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Primary Top Live KPI Tickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Power Substation */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Substation Load
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
              <Wifi className="w-3 h-3" />
              231V / 50Hz
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono transition-all">
                {latest.powerGridKw.toFixed(1)} <span className="text-base font-semibold text-slate-500 font-sans">kW</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                Net Grid Draw: <span className="font-semibold text-slate-700">{latest.netDemandKw.toFixed(1)} kW</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                ☀️ {latest.solarGenKw.toFixed(1)} kW
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Solar PV Gen</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Power Factor: <strong className="text-slate-800">{latest.powerFactor.toFixed(2)}</strong></span>
            <span className="text-emerald-800 font-medium">Phase Balanced</span>
          </div>
        </div>

        {/* Card 2: Main Hydro Flow Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-cyan-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-500" />
              Main Hydro Flow
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md">
              <Gauge className="w-3 h-3" />
              {latest.waterPressureBar} bar
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {latest.waterFlowLpm.toFixed(1)} <span className="text-base font-semibold text-slate-500 font-sans">L/min</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Pipeline: <span className="font-semibold text-emerald-800">Nominal Pressure</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-cyan-900 font-mono">
                {cumulativeWaterLiters.toLocaleString('en-IN')} L
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Today Consumed</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Overhead Tank: <strong className="text-slate-800">{latest.tank1LevelPct}%</strong></span>
            <span className="text-cyan-800 font-medium">Pump: Auto-Feed</span>
          </div>
        </div>

        {/* Card 3: Smart Waste Ultrasonic Nodes */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-amber-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5 text-emerald-600" />
              Ultrasonic Waste Bins
            </span>
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
              latest.binCafeteriaPct >= 85
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-emerald-50 text-emerald-800'
            }`}>
              {latest.binCafeteriaPct >= 85 ? '1 Pickup Due' : 'All Optimal'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {Math.round((latest.binCafeteriaPct + latest.binBlock2Pct + latest.binLibraryPct + latest.binBiotechPct) / 4)}%
                <span className="text-base font-semibold text-slate-500 font-sans"> Avg</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Cafeteria Station: <span className={`font-bold ${latest.binCafeteriaPct >= 85 ? 'text-red-600' : 'text-slate-700'}`}>{latest.binCafeteriaPct}% full</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                4 Nodes
              </span>
              <p className="text-[10px] text-slate-400 mt-1">LoRa Active</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Battery: <strong className="text-slate-800">3.64V (98%)</strong></span>
            <span className="text-slate-600">Lid cycles: 412/day</span>
          </div>
        </div>

        {/* Card 4: Environmental / Air Quality */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-indigo-500" />
              Air Quality & Climate
            </span>
            <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md">
              {latest.tempC}°C • {latest.humidityPct}%
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {latest.co2Ppm} <span className="text-base font-semibold text-slate-500 font-sans">ppm</span>
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                CO₂ Level: <span className="font-semibold text-emerald-800">Clean & Fresh</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg font-mono">
                {latest.pm25} µg/m³
              </span>
              <p className="text-[10px] text-slate-400 mt-1">PM2.5 Index</p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>AQI Rating: <strong className="text-emerald-800">Good (US-AQI 32)</strong></span>
            <span className="text-emerald-800 font-medium">Optimal Classrooms</span>
          </div>
        </div>
      </div>

      {/* Primary Section 1: Power Substation & Solar PV Telemetry */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Campus Electrical Substation & Solar Telemetry
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time active load demand (kW), rooftop solar generation offset, and phase synchronization
            </p>
          </div>

          {/* Substation View Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs">
              <button
                onClick={() => setPowerView('grid_solar')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  powerView === 'grid_solar'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grid vs Solar PV
              </button>
              <button
                onClick={() => setPowerView('phases')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  powerView === 'phases'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3-Phase Balance (R/Y/B)
              </button>
            </div>
          </div>
        </div>

        {/* Live Recharts Area */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {powerView === 'grid_solar' ? (
              <AreaChart data={currentDataset} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradGrid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradSolar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
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
                  unit=" kW"
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
                        {payload.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                              {item.name}:
                            </span>
                            <span className="font-mono font-bold text-white">
                              {item.value} kW
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="powerGridKw"
                  name="Gross Demand (kW)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradGrid)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="solarGenKw"
                  name="Solar Generation (kW)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradSolar)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="netDemandKw"
                  name="Net Grid Draw (kW)"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#gradNet)"
                  isAnimationActive={false}
                />
              </AreaChart>
            ) : (
              <LineChart data={currentDataset} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  unit=" kW"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, paddingBottom: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="phaseR"
                  name="Phase R (Red)"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="phaseY"
                  name="Phase Y (Yellow)"
                  stroke="#eab308"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="phaseB"
                  name="Phase B (Blue)"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Dual Section 2: Water Flow & Smart Ultrasonic Bins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hydro Infrastructure & Reservoirs */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-50 rounded-lg text-cyan-600">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Smart Hydro Metering & Tanks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time line velocity, hydraulic pressure & tank levels
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-800 bg-cyan-50 px-2.5 py-1 rounded-lg">
                {latest.waterFlowLpm.toFixed(1)} L/min
              </span>
            </div>

            {/* Hydro Chart */}
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentDataset} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                  <YAxis unit=" L/m" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="waterFlowLpm"
                    name="Flow Rate (L/min)"
                    stroke="#0891b2"
                    strokeWidth={2}
                    fill="url(#gradWater)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Dual Tank Visualizers */}
          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
            {/* Tank 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Overhead Tank 1 (Academic)</span>
                <span className="text-cyan-800 font-bold">{latest.tank1LevelPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${latest.tank1LevelPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Capacity: 25,000 L</span>
                <span className="text-emerald-800 font-semibold">Feed Active</span>
              </p>
            </div>

            {/* Tank 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                <span>Underground Sump (Central)</span>
                <span className="text-blue-700 font-bold">{latest.tank2LevelPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${latest.tank2LevelPct}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-2 flex items-center justify-between">
                <span>Capacity: 60,000 L</span>
                <span className="text-slate-600">Reserve Safe</span>
              </p>
            </div>
          </div>
        </div>

        {/* Smart Ultrasonic Waste Stations */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Smart Ultrasonic Waste Stations
                  </h3>
                  <p className="text-xs text-slate-500">
                    Live LoRa sonar fill levels across 4 strategic campus hubs
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-500 font-mono">LoRaWAN 868MHz</span>
            </div>

            {/* 4 Station Progress Cards */}
            <div className="space-y-3.5">
              {/* Station 1: Cafeteria */}
              <div className={`p-3.5 rounded-2xl border transition ${
                latest.binCafeteriaPct >= 85
                  ? 'bg-red-50/60 border-red-200'
                  : 'bg-slate-50 border-slate-200/80'
              }`}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">1. Central Cafeteria (Station A)</span>
                    {latest.binCafeteriaPct >= 85 && (
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 bg-red-100 text-red-700 rounded-md animate-pulse">
                        OVERFLOW ALERT
                      </span>
                    )}
                  </div>
                  <span className={`font-mono font-bold ${latest.binCafeteriaPct >= 85 ? 'text-red-600' : 'text-slate-700'}`}>
                    {latest.binCafeteriaPct}% Full
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      latest.binCafeteriaPct >= 85 ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${latest.binCafeteriaPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span>Sensor: Sonar HC-SR04 (12cm)</span>
                  {latest.binCafeteriaPct >= 85 ? (
                    <button
                      onClick={() => handleDispatchCrew('Central Cafeteria')}
                      className="text-red-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Send className="w-2.5 h-2.5" />
                      Dispatch Crew Now
                    </button>
                  ) : (
                    <span>Status: Normal</span>
                  )}
                </div>
              </div>

              {/* Station 2: Block 2 Tech Hub */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">2. Block 2 Tech Hub (Station B)</span>
                  <span className="font-mono font-bold text-slate-700">{latest.binBlock2Pct}% Full</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${latest.binBlock2Pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span>Sensor: Laser ToF VL53L0X</span>
                  <span className="text-emerald-800 font-semibold">Optimal Capacity</span>
                </div>
              </div>

              {/* Station 3: Central Library */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">3. Central Library (Station C)</span>
                  <span className="font-mono font-bold text-slate-700">{latest.binLibraryPct}% Full</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${latest.binLibraryPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span>Sensor: Sonar HC-SR04</span>
                  <span className="text-slate-600">Low Utilization</span>
                </div>
              </div>

              {/* Station 4: Biotech & Science Complex */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-900">4. Science & Biotech Complex (Station D)</span>
                  <span className="font-mono font-bold text-slate-700">{latest.binBiotechPct}% Full</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${latest.binBiotechPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2">
                  <span>Bio-Hazard Smart Latch: Locked</span>
                  <span className="text-slate-600">Moderate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Live MQTT / LoRa Packet Stream Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-slate-300 shadow-2xl font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isStreaming ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isStreaming ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-bold text-white tracking-wide text-sm font-sans flex items-center gap-2">
              <span>Live IoT Ingestion Packet Log</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-mono">
                MQTT Broker / LoRaWAN Server
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTerminalPaused(!isTerminalPaused)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans font-medium transition"
            >
              {isTerminalPaused ? 'Resume Terminal' : 'Pause Terminal'}
            </button>
            <button
              onClick={() => setPacketLogs([])}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] font-sans font-medium transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Scrollable Packet Stream */}
        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 scrollbar-thin">
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
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.protocol === 'MQTT'
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

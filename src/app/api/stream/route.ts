import { NextRequest, NextResponse } from 'next/server';
import { getLiveInternetUrl } from './tunnel/route';

export interface StreamLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'alert' | 'success';
}

export interface StreamSession {
  id: string;
  name: string;
  location: string;
  createdAt: number;
  lastPing: number;
  cameraConnected: boolean;
  viewerConnected: boolean;
  lightsOn: boolean;
  occupants: number;
  lastFrame: string | null;
  autoRelay: boolean;
  sdpOffer: any | null;
  sdpAnswer: any | null;
  candidates: any[];
  logs: StreamLog[];
}

declare global {
  // eslint-disable-next-line no-var
  var __streamStore: Map<string, StreamSession> | undefined;
}

if (!global.__streamStore) {
  global.__streamStore = new Map<string, StreamSession>();

  // Seed default classroom stream
  const defaultId = 'stream-room-204';
  global.__streamStore.set(defaultId, {
    id: defaultId,
    name: 'Classroom 204 (CSE & AI Hub)',
    location: 'Block A (CSE & IT)',
    createdAt: Date.now(),
    lastPing: Date.now(),
    cameraConnected: false,
    viewerConnected: true,
    lightsOn: true,
    occupants: 0,
    lastFrame: null,
    autoRelay: true,
    sdpOffer: null,
    sdpAnswer: null,
    candidates: [],
    logs: [
      {
        id: 'l-1',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        message: 'Classroom 204 CCTV Stream initialized on Live Internet Cloud.',
        type: 'info',
      },
    ],
  });
}

const store = global.__streamStore;

// Helper: resolve public live internet URL without local LAN IPs
function resolvePublicUrl(req: NextRequest): string {
  const tunnelUrl = getLiveInternetUrl();
  if (tunnelUrl && tunnelUrl.startsWith('http')) {
    return tunnelUrl;
  }

  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = req.headers.get('host');
  if (host && !host.includes('localhost') && !host.includes('127.0.0.1')) {
    return `https://${host}`;
  }

  return tunnelUrl || 'https://ecocampus-live.trycloudflare.com';
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const publicUrl = resolvePublicUrl(req);

    if (id === 'all' || !id) {
      const allStreams = Array.from(store.values()).map((s) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        createdAt: s.createdAt,
        lastPing: s.lastPing,
        cameraConnected: Date.now() - s.lastPing < 10000 && s.cameraConnected,
        lightsOn: s.lightsOn,
        occupants: s.occupants,
        autoRelay: s.autoRelay,
        hasFrame: Boolean(s.lastFrame),
      }));

      return NextResponse.json({
        success: true,
        streams: allStreams,
        publicUrl,
      });
    }

    const session = store.get(id);
    if (!session) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    const isCameraAlive = Date.now() - session.lastPing < 8000 && session.cameraConnected;

    return NextResponse.json({
      success: true,
      stream: {
        ...session,
        cameraConnected: isCameraAlive,
      },
      publicUrl,
    });
  } catch (error: any) {
    console.error('Error fetching stream:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const publicUrl = resolvePublicUrl(req);

    if (action === 'create') {
      const name = body.name?.trim() || 'New Classroom Stream';
      const location = body.location?.trim() || 'Block A';
      const streamId = `stream-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

      const newSession: StreamSession = {
        id: streamId,
        name,
        location,
        createdAt: Date.now(),
        lastPing: Date.now(),
        cameraConnected: false,
        viewerConnected: true,
        lightsOn: true,
        occupants: 0,
        lastFrame: null,
        autoRelay: body.autoRelay ?? true,
        sdpOffer: null,
        sdpAnswer: null,
        candidates: [],
        logs: [
          {
            id: `l-${Date.now()}`,
            timestamp: nowTime,
            message: `Created live internet stream for ${name} at ${location}.`,
            type: 'info',
          },
        ],
      };

      store.set(streamId, newSession);

      return NextResponse.json({
        success: true,
        streamId,
        stream: newSession,
        publicUrl,
      });
    }

    const streamId = body.streamId;
    if (!streamId || !store.has(streamId)) {
      return NextResponse.json({ error: 'Invalid or expired stream ID' }, { status: 404 });
    }

    const session = store.get(streamId)!;

    if (action === 'frame') {
      session.lastFrame = body.frameBase64 || session.lastFrame;
      session.lastPing = Date.now();
      session.cameraConnected = true;
      if (typeof body.occupants === 'number') {
        session.occupants = body.occupants;
      }

      return NextResponse.json({
        success: true,
        lightsOn: session.lightsOn,
        autoRelay: session.autoRelay,
      });
    }

    if (action === 'toggle_lights') {
      const newLightsState = Boolean(body.lightsOn);
      session.lightsOn = newLightsState;

      const logMsg = newLightsState
        ? `Lights powered ON manually by Admin for ${session.name}.`
        : `Smart Relay Tripped: Lights & HVAC SHUT OFF for ${session.name}. Energy conserved!`;

      session.logs.unshift({
        id: `l-${Date.now()}`,
        timestamp: nowTime,
        message: logMsg,
        type: newLightsState ? 'info' : 'success',
      });
      session.logs = session.logs.slice(0, 30);

      return NextResponse.json({
        success: true,
        lightsOn: session.lightsOn,
      });
    }

    if (action === 'toggle_autorelay') {
      session.autoRelay = Boolean(body.autoRelay);
      return NextResponse.json({
        success: true,
        autoRelay: session.autoRelay,
      });
    }

    if (action === 'signal') {
      const { role, type, payload } = body;
      if (type === 'offer') {
        session.sdpOffer = payload;
      } else if (type === 'answer') {
        session.sdpAnswer = payload;
      } else if (type === 'candidate' && payload) {
        session.candidates.push({ role, candidate: payload });
        session.candidates = session.candidates.slice(-20);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'log') {
      session.logs.unshift({
        id: `l-${Date.now()}`,
        timestamp: nowTime,
        message: body.message || 'Stream event recorded',
        type: body.type || 'info',
      });
      session.logs = session.logs.slice(0, 30);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Stream API error:', error);
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || !store.has(id)) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 });
    }

    store.delete(id);
    return NextResponse.json({ success: true, message: 'Stream deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete stream' }, { status: 500 });
  }
}

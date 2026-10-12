import { NextRequest, NextResponse } from 'next/server';
import { spawn, ChildProcess } from 'child_process';

declare global {
  // eslint-disable-next-line no-var
  var __tunnelProcess: ChildProcess | null | undefined;
  // eslint-disable-next-line no-var
  var __tunnelUrl: string | null | undefined;
  // eslint-disable-next-line no-var
  var __tunnelStarting: boolean | undefined;
}

if (global.__tunnelUrl === undefined) {
  global.__tunnelUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.LIVE_STREAM_URL || null;
}

export function getLiveInternetUrl(): string | null {
  return global.__tunnelUrl || process.env.NEXT_PUBLIC_APP_URL || process.env.LIVE_STREAM_URL || null;
}

export function setLiveInternetUrl(url: string | null) {
  global.__tunnelUrl = url;
}

// Function to start Cloudflare Quick Tunnel in the background
export async function startCloudflareTunnel(targetPort = 3000): Promise<string> {
  if (global.__tunnelUrl && global.__tunnelUrl.startsWith('http')) {
    return global.__tunnelUrl;
  }

  if (global.__tunnelStarting) {
    // Wait up to 10 seconds if already starting
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      if (global.__tunnelUrl) return global.__tunnelUrl;
    }
  }

  global.__tunnelStarting = true;

  return new Promise((resolve, reject) => {
    try {
      if (global.__tunnelProcess) {
        try {
          global.__tunnelProcess.kill();
        } catch (e) { }
      }

      const cp = spawn('npx', ['-y', 'cloudflared', 'tunnel', '--url', `http://localhost:${targetPort}`], {
        shell: true,
      });

      global.__tunnelProcess = cp;

      let resolved = false;
      const timeout = setTimeout(() => {
        global.__tunnelStarting = false;
        if (!resolved) {
          // If timed out, return fallback if available or reject
          if (global.__tunnelUrl) {
            resolve(global.__tunnelUrl);
          } else {
            resolve(`https://ecocampus-live.trycloudflare.com`);
          }
        }
      }, 20000);

      const checkOutput = (data: Buffer) => {
        const text = data.toString();
        const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        if (match && !resolved) {
          resolved = true;
          clearTimeout(timeout);
          const foundUrl = match[0];
          global.__tunnelUrl = foundUrl;
          global.__tunnelStarting = false;
          console.log('[Cloudflare Tunnel] Live Internet URL established:', foundUrl);
          resolve(foundUrl);
        }
      };

      cp.stdout?.on('data', checkOutput);
      cp.stderr?.on('data', checkOutput);

      cp.on('error', (err) => {
        global.__tunnelStarting = false;
        if (!resolved) {
          clearTimeout(timeout);
          console.warn('[Cloudflare Tunnel] Process error:', err);
          resolve(global.__tunnelUrl || `https://ecocampus-live.trycloudflare.com`);
        }
      });

      cp.on('close', () => {
        global.__tunnelProcess = null;
        global.__tunnelStarting = false;
      });
    } catch (err: any) {
      global.__tunnelStarting = false;
      reject(err);
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const autoStart = searchParams.get('start') === 'true';

    // If request contains a forward host (e.g. accessed through an existing tunnel or deployed domain)
    const forwardedHost = req.headers.get('x-forwarded-host');
    const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
    if (forwardedHost && !forwardedHost.includes('localhost') && !forwardedHost.includes('127.0.0.1')) {
      global.__tunnelUrl = `${forwardedProto}://${forwardedHost}`;
    }

    let publicUrl = getLiveInternetUrl();

    if (!publicUrl && autoStart) {
      try {
        publicUrl = await startCloudflareTunnel(3000);
      } catch (e) {
        console.error('Failed to auto-start tunnel:', e);
      }
    }

    return NextResponse.json({
      success: true,
      active: Boolean(publicUrl),
      publicUrl: publicUrl || null,
      tunnelStarting: Boolean(global.__tunnelStarting),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, customUrl } = body;

    if (action === 'start') {
      const publicUrl = await startCloudflareTunnel(3000);
      return NextResponse.json({ success: true, publicUrl });
    }

    if (action === 'set_custom' && customUrl) {
      const formatted = customUrl.trim().replace(/\/$/, '');
      setLiveInternetUrl(formatted);
      return NextResponse.json({ success: true, publicUrl: formatted });
    }

    if (action === 'stop') {
      if (global.__tunnelProcess) {
        try {
          global.__tunnelProcess.kill();
        } catch (e) { }
        global.__tunnelProcess = null;
      }
      global.__tunnelUrl = null;
      return NextResponse.json({ success: true, message: 'Tunnel stopped' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to update tunnel' }, { status: 500 });
  }
}

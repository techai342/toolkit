import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function getGlobalVisitorId() {
  if (typeof window === 'undefined') return 'unknown';
  let vid = localStorage.getItem('global_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('global_visitor_id', vid);
  }
  return vid;
}

async function getCachedIp(): Promise<string> {
  if (typeof window === 'undefined') return 'unknown';
  const cached = sessionStorage.getItem('user_ip');
  if (cached) return cached;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 800);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    if (data?.ip) {
      sessionStorage.setItem('user_ip', data.ip);
      return data.ip;
    }
  } catch {}
  return 'unknown';
}

export default function GlobalTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (location.pathname.includes('/saqibadmin') || location.pathname.includes('/super-saqib-admin')) return;

    // Run asynchronously after page renders without blocking UI thread
    const timer = setTimeout(async () => {
      const visitorHash = getGlobalVisitorId();
      let batteryLevel = 'unknown';
      let isCharging = 'unknown';

      try {
        if ((navigator as any).getBattery) {
          const battery: any = await (navigator as any).getBattery();
          batteryLevel = Math.round(battery.level * 100) + '%';
          isCharging = battery.charging ? 'Yes' : 'No';
        }
      } catch {}

      const ipAddress = await getCachedIp();

      const metadata = {
        path: location.pathname,
        battery_level: batteryLevel,
        is_charging: isCharging,
        ip_address: ipAddress,
        browser_info: navigator.userAgent,
        screen_resolution: `${window.screen.width}x${window.screen.height}`,
        platform: navigator.platform || 'unknown',
        language: navigator.language || 'unknown',
        visitor_id: visitorHash,
      };

      try {
        await supabase.from('global_analytics').insert({
          event_type: 'page_view',
          path: location.pathname,
          metadata,
        });
      } catch {}
    }, 200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return null;
}

import { NextResponse } from 'next/server';

const FALLBACK_OWNER_DATA = {
  name: "Muhammad Saqib",
  short_name: "Saqib",
  tagline: "Full-Stack Engineer & Cyber Security Specialist",
  bio: "Available for high-performance Next.js SaaS apps & AI systems",
  email: "mrsaqib242242@gmail.com",
  phone: "03478936242",
  whatsapp: "https://wa.me/923478936242",
  location: "Gojra, Faisalabad, Pakistan",
  avatar: "https://ik.imagekit.io/mrsaqib/mrsaqib242-img25_7oG52NZUY.png",
  instagram: "https://www.instagram.com/mr_saqib242",
  facebook: "https://www.facebook.com/profile.php?id=100085188689033",
  tiktok: "https://www.tiktok.com/@mr_saqib_242",
  snapchat: "https://www.snapchat.com/add/mrsaqib242",
  portfolio: "https://mrsaqib242.vercel.app",
  github: "https://github.com/mrsaqib242",
  contract_status: "Open for New Projects",
  availability_note: "Available for Remote Worldwide Contracts & Security Audits."
};

export async function GET(req: Request) {
  try {
    const origin = req.headers.get('origin') || 'https://protoolkits.com';
    
    // Attempt live fetch from Central API Hub
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://mrsaqib242.vercel.app/api/public/contact', {
      headers: {
        'Accept': 'application/json',
        'Origin': origin
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json?.data) {
        return NextResponse.json({
          success: true,
          live: true,
          source: 'live_api_hub',
          data: json.data
        });
      }
    }

    // Return official verified data if 403 or non-200
    return NextResponse.json({
      success: true,
      live: false,
      source: 'verified_fallback',
      status_code: res.status,
      data: FALLBACK_OWNER_DATA
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      live: false,
      source: 'verified_fallback',
      error: err?.message,
      data: FALLBACK_OWNER_DATA
    });
  }
}

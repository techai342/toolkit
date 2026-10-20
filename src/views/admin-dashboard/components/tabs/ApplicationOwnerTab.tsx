import React, { useEffect, useState } from 'react';
import { 
  Sparkles, Shield, Mail, Phone, MapPin, Globe, CheckCircle2, 
  ExternalLink, Copy, Check, RefreshCw, Send, MessageCircle, 
  Briefcase, Code2, Award, Terminal, Lock
} from 'lucide-react';
import { 
  SiWhatsapp, 
  SiGithub, 
  SiInstagram, 
  SiTiktok, 
  SiFacebook, 
  SiSnapchat 
} from 'react-icons/si';

interface OwnerContactData {
  name: string;
  short_name: string;
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  avatar: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  snapchat: string;
  portfolio: string;
  github: string;
  contract_status: string;
  availability_note?: string;
}

const DEFAULT_OWNER_DATA: OwnerContactData = {
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

export function ApplicationOwnerTab() {
  const [data, setData] = useState<OwnerContactData>(DEFAULT_OWNER_DATA);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchContactData = async () => {
    try {
      setRefreshing(true);
      // Attempt to fetch via proxy route first, then direct fallback
      const res = await fetch('/api/owner-contact');
      if (res.ok) {
        const json = await res.json();
        if (json?.data) {
          setData(json.data);
          setIsLive(!!json.live);
          return;
        }
      }
      // If proxy unavailable, attempt direct API
      const directRes = await fetch('https://mrsaqib242.vercel.app/api/public/contact', {
        headers: { Accept: 'application/json' }
      });
      if (directRes.ok) {
        const json = await directRes.json();
        if (json?.data) {
          setData(json.data);
          setIsLive(true);
          return;
        }
      }
    } catch {
      // Gracefully retain verified default data
      setIsLive(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchContactData();
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      handle: data.phone || '03478936242',
      url: data.whatsapp || 'https://wa.me/923478936242',
      icon: SiWhatsapp,
      color: 'from-emerald-600 to-green-500',
      border: 'border-emerald-500/30',
      badge: 'Direct Chat',
    },
    {
      name: 'Live Portfolio',
      handle: 'mrsaqib242.vercel.app',
      url: data.portfolio || 'https://mrsaqib242.vercel.app',
      icon: Globe,
      color: 'from-purple-600 to-indigo-600',
      border: 'border-purple-500/30',
      badge: 'Official Hub',
    },
    {
      name: 'GitHub',
      handle: '@mrsaqib242',
      url: data.github || 'https://github.com/mrsaqib242',
      icon: SiGithub,
      color: 'from-zinc-700 to-zinc-900',
      border: 'border-zinc-500/30',
      badge: 'Code Repos',
    },
    {
      name: 'Instagram',
      handle: '@mr_saqib242',
      url: data.instagram || 'https://www.instagram.com/mr_saqib242',
      icon: SiInstagram,
      color: 'from-pink-600 to-rose-600',
      border: 'border-pink-500/30',
      badge: 'Photos & Reels',
    },
    {
      name: 'TikTok',
      handle: '@mr_saqib_242',
      url: data.tiktok || 'https://www.tiktok.com/@mr_saqib_242',
      icon: SiTiktok,
      color: 'from-cyan-600 to-blue-600',
      border: 'border-cyan-500/30',
      badge: 'Viral Videos',
    },
    {
      name: 'Facebook',
      handle: 'Muhammad Saqib',
      url: data.facebook || 'https://www.facebook.com/profile.php?id=100085188689033',
      icon: SiFacebook,
      color: 'from-blue-600 to-indigo-600',
      border: 'border-blue-500/30',
      badge: 'Social Profile',
    },
    {
      name: 'Snapchat',
      handle: '@mrsaqib242',
      url: data.snapchat || 'https://www.snapchat.com/add/mrsaqib242',
      icon: SiSnapchat,
      color: 'from-amber-500 to-yellow-500',
      border: 'border-yellow-500/30',
      badge: 'Instant Snaps',
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      {/* Top Banner / Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#0A051E]/90 to-black/95 border border-purple-500/20 p-6 md:p-10 shadow-[0_0_50px_rgba(168,85,247,0.15)]">
        {/* Ambient Neon Blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar with Glow & Ring */}
          <div className="relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-cyan-500 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-all duration-500" />
            <img
              src={data.avatar}
              alt={data.name}
              className="relative w-36 h-36 md:w-44 md:h-44 rounded-3xl object-cover border-2 border-white/20 shadow-2xl bg-zinc-900"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-white/20 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-300" />
              Owner & Lead Dev
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                Verified Application Architect
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {data.contract_status || 'Open for New Projects'}
              </span>
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  Live API Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-zinc-400 border border-white/10">
                  Official Central Hub
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2">
                {data.name}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 text-2xl md:text-3xl">
                  (Saqib 242)
                </span>
              </h1>
              <p className="text-purple-300 font-semibold text-base mt-1">
                {data.tagline}
              </p>
            </div>

            <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">
              {data.bio}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-zinc-400 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-pink-400" />
                {data.location}
              </span>
              {data.availability_note && (
                <span className="inline-flex items-center gap-1.5 text-emerald-300/80">
                  <Briefcase className="w-4 h-4 text-emerald-400" />
                  {data.availability_note}
                </span>
              )}
            </div>
          </div>

          {/* Sync Button */}
          <div className="hidden md:flex flex-col items-end shrink-0">
            <button
              onClick={fetchContactData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Contact Details from Central API Hub"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
              {refreshing ? 'Syncing...' : 'Sync Live API'}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons (WhatsApp, Email, Call, Portfolio) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* WhatsApp Button */}
        <a
          href={data.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-green-900/30 border border-emerald-500/30 hover:border-emerald-500/70 transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(16,185,129,0.15)]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <SiWhatsapp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Direct WhatsApp</div>
              <div className="text-sm font-black text-white">{data.phone}</div>
            </div>
          </div>
          <Send className="w-4 h-4 text-emerald-400/60 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all" />
        </a>

        {/* Email Button */}
        <div className="relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-900/30 border border-purple-500/30 hover:border-purple-500/70 transition-all shadow-[0_0_25px_rgba(168,85,247,0.15)]">
          <a
            href={`mailto:${data.email}`}
            className="flex items-center gap-3.5 flex-1 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Official Email</div>
              <div className="text-xs font-black text-white truncate" title={data.email}>
                {data.email}
              </div>
            </div>
          </a>
          <button
            onClick={() => copyToClipboard(data.email, 'email')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-purple-300 transition-colors ml-2"
            title="Copy Email"
          >
            {copiedKey === 'email' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Direct Call Button */}
        <div className="relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-900/30 border border-cyan-500/30 hover:border-cyan-500/70 transition-all shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <a
            href={`tel:${data.phone}`}
            className="flex items-center gap-3.5 flex-1 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Phone Call</div>
              <div className="text-sm font-black text-white">{data.phone}</div>
            </div>
          </a>
          <button
            onClick={() => copyToClipboard(data.phone, 'phone')}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-cyan-300 transition-colors ml-2"
            title="Copy Phone Number"
          >
            {copiedKey === 'phone' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Portfolio */}
        <a
          href={data.portfolio}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 to-pink-900/30 border border-fuchsia-500/30 hover:border-fuchsia-500/70 transition-all hover:scale-[1.02] shadow-[0_0_25px_rgba(217,70,239,0.15)]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-fuchsia-400 uppercase tracking-wider">Main Portfolio</div>
              <div className="text-sm font-black text-white">mrsaqib242</div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-fuchsia-400/60 group-hover:text-fuchsia-300 group-hover:translate-x-1 transition-all" />
        </a>
      </div>

      {/* Social & Professional Handles Grid */}
      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Verified Developer Socials & Profiles
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Connect directly with Muhammad Saqib across official platforms for collaborations and support.
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">Saqib 242 Central Hub</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialLinks.map((item, idx) => {
            const Icon = item.icon;
            return (
              <a
                key={idx}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border ${item.border} transition-all hover:scale-[1.02]`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {item.name}
                    </div>
                    <div className="text-xs text-zinc-400 font-mono truncate max-w-[150px]">
                      {item.handle}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 group-hover:text-white uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-full">
                  <span>{item.badge}</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Developer API & System Integration Note */}
      <div className="p-6 rounded-2xl bg-black/40 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Central API Integration Active</div>
            <div className="text-[11px] text-zinc-400 font-mono">
              GET https://mrsaqib242.vercel.app/api/public/contact
            </div>
          </div>
        </div>
        <div className="text-[11px] text-zinc-500 text-center md:text-right">
          Official Master Documentation &amp; Live Contact Bridge for Pro-Toolkits Platform
        </div>
      </div>
    </div>
  );
}

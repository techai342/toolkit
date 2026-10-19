import React from "react";
import {
  SiWhatsapp,
  SiTiktok,
  SiSnapchat,
  SiInstagram,
  SiYoutube,
  SiFacebook,
  SiTelegram,
  SiX,
  SiGithub,
} from "react-icons/si";
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { GlowWrapper } from "../../../components/GlowWrapper";

interface LiveMobilePreviewProps {
  settingsForm: {
    username: string;
    description: string;
    phone_number: string;
    social_whatsapp: string;
    social_tiktok: string;
    social_youtube: string;
    social_instagram: string;
    social_telegram: string;
    social_facebook: string;
    social_github: string;
    social_twitter: string;
    theme_font_family: string;
    theme_text_color?: string;
    theme_username_color?: string;
    theme_color_combo?: string;
    theme_profile_border?: boolean;
    theme_search_border?: boolean;
    theme_social_border?: boolean;
    theme_buttons_border?: boolean;
    bg_image_url?: string;
    bg_color?: string;
    popup_enabled?: boolean;
    popup_title?: string;
  };
  avatarUrl?: string;
  whatsappGreeting?: string;
}

export const LiveMobilePreview: React.FC<LiveMobilePreviewProps> = ({
  settingsForm,
  avatarUrl,
  whatsappGreeting,
}) => {
  const fontClass =
    settingsForm.theme_font_family === "serif"
      ? "font-serif"
      : settingsForm.theme_font_family === "mono"
        ? "font-mono"
        : settingsForm.theme_font_family === "display"
          ? "font-black tracking-wide"
          : "font-sans";

  // Build test whatsapp link if present
  let waNumber = (settingsForm.social_whatsapp || "").replace(/[^0-9]/g, "");
  let waUrl = "";
  if (waNumber) {
    waUrl = `https://wa.me/${waNumber}${whatsappGreeting ? `?text=${encodeURIComponent(whatsappGreeting)}` : ""}`;
  }

  // Active socials with real authentic official icons from Simple Icons
  const socials = [
    {
      id: "whatsapp",
      val: settingsForm.social_whatsapp,
      icon: <SiWhatsapp size={15} className="text-[#25D366]" />,
      name: "WhatsApp",
      color: "bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366]",
    },
    {
      id: "tiktok",
      val: settingsForm.social_tiktok,
      icon: <SiTiktok size={15} className="text-white" />,
      name: "TikTok",
      color: "bg-white/10 border-white/30 text-white",
    },
    {
      id: "instagram",
      val: settingsForm.social_instagram,
      icon: <SiInstagram size={15} className="text-[#E4405F]" />,
      name: "Instagram",
      color: "bg-pink-500/10 border-pink-500/30 text-pink-400",
    },
    {
      id: "youtube",
      val: settingsForm.social_youtube,
      icon: <SiYoutube size={15} className="text-[#FF0000]" />,
      name: "YouTube",
      color: "bg-red-500/10 border-red-500/30 text-red-400",
    },
    {
      id: "telegram",
      val: settingsForm.social_telegram,
      icon: <SiTelegram size={15} className="text-[#26A5E4]" />,
      name: "Telegram",
      color: "bg-sky-500/10 border-sky-500/30 text-sky-400",
    },
    {
      id: "facebook",
      val: settingsForm.social_facebook,
      icon: <SiFacebook size={15} className="text-[#1877F2]" />,
      name: "Facebook",
      color: "bg-blue-500/10 border-blue-500/30 text-blue-400",
    },
    {
      id: "twitter",
      val: settingsForm.social_twitter,
      icon: <SiX size={14} className="text-white" />,
      name: "X / Twitter",
      color: "bg-white/10 border-white/30 text-white",
    },
    {
      id: "github",
      val: settingsForm.social_github,
      icon: <SiGithub size={15} className="text-white" />,
      name: "GitHub",
      color: "bg-white/10 border-white/30 text-white",
    },
  ].filter((s) => Boolean(s.val));

  return (
    <div className="relative flex flex-col items-center">
      {/* Phone Hardware Mockup Bezel */}
      <div className="relative w-[300px] sm:w-[320px] h-[610px] bg-[#0c0817] rounded-[44px] p-3 shadow-[0_0_60px_rgba(168,85,247,0.25)] border-[5px] border-zinc-700/80 ring-1 ring-white/10 overflow-hidden flex flex-col">
        {/* Dynamic Island / Camera Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-24 h-5 bg-black rounded-full flex items-center justify-end pr-2 gap-1.5 shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80"></div>
        </div>

        {/* Screen Glass Container */}
        <div
          className={`relative w-full h-full rounded-[34px] overflow-hidden flex flex-col justify-between text-white ${fontClass} custom-scrollbar overflow-y-auto`}
          style={{
            backgroundColor: settingsForm.bg_color || "#090514",
            backgroundImage: settingsForm.bg_image_url
              ? `url(${settingsForm.bg_image_url})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Subtle Ambient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#090514]/70 via-[#090514]/85 to-[#090514] pointer-events-none z-0" />

          {/* Top Status Bar Area */}
          <div className="relative z-10 pt-6 px-5 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-semibold text-white/90">9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="text-[10px] text-emerald-400">● LIVE</span>
              <span>5G</span>
              <div className="w-4 h-2 border border-zinc-400 rounded-sm p-[1px] flex items-center">
                <div className="w-full h-full bg-white rounded-2xs"></div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative z-10 px-4 pt-4 pb-6 flex flex-col items-center text-center">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[10px] text-purple-300 mb-3 backdrop-blur-md">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" />
              <span>Real-time Preview</span>
            </div>

            {/* Avatar with Dynamic Conic Glow */}
            <div className="mb-3">
              <GlowWrapper
                enabled={settingsForm.theme_profile_border}
                combo={settingsForm.theme_color_combo || "rgb"}
                roundedClass="rounded-full"
                className="group"
              >
                <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white/60 bg-zinc-800 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-xl font-bold text-purple-300">
                      {settingsForm.username
                        ? settingsForm.username.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}
                </div>
              </GlowWrapper>
            </div>

            {/* Username / Name with Theme Color */}
            <h3 
              className="text-base font-bold tracking-tight flex items-center justify-center gap-1"
              style={{ color: settingsForm.theme_username_color || "#FFFFFF" }}
            >
              <span>{settingsForm.username || "your_name"}</span>
              <ShieldCheck className="w-4 h-4 text-purple-400 inline" />
            </h3>
            <p className="text-[11px] text-purple-300/80 font-mono mt-0.5">
              protoolkits.com/{settingsForm.username || "creator"}
            </p>

            {/* Bio / Description */}
            <p className="text-[12px] text-zinc-300 mt-2 px-3 line-clamp-3 leading-relaxed">
              {settingsForm.description ||
                "Welcome to my verified toolkit! Explore tools, resources, and contact me below."}
            </p>

            {/* WhatsApp Featured CTA Pill with Official SiWhatsapp */}
            {settingsForm.social_whatsapp && (
              <div className="w-full mt-4">
                <a
                  href={waUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,211,102,0.35)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <SiWhatsapp size={16} />
                  <span>Chat on WhatsApp</span>
                  <ExternalLink size={12} className="opacity-70 ml-0.5" />
                </a>
                {whatsappGreeting && (
                  <p className="text-[10px] text-emerald-400/90 mt-1 italic line-clamp-1">
                    "{whatsappGreeting}"
                  </p>
                )}
              </div>
            )}

            {/* TikTok Featured Card with Official SiTiktok */}
            {settingsForm.social_tiktok && (
              <div className="w-full mt-2.5">
                <a
                  href={settingsForm.social_tiktok}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-black/60 border border-white/20 hover:border-pink-500/50 text-white font-medium text-xs flex items-center justify-between shadow-sm transition-all hover:bg-black/80"
                >
                  <div className="flex items-center gap-2">
                    <SiTiktok size={15} />
                    <span className="text-[11px]">Follow on TikTok</span>
                  </div>
                  <span className="text-[10px] text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                    Watch
                  </span>
                </a>
              </div>
            )}

            {/* Social Icons Badge Grid */}
            {socials.length > 0 && (
              <div className="w-full mt-4 pt-3 border-t border-white/10">
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-2">
                  Connected Channels ({socials.length})
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {socials.map((s) => (
                    <div
                      key={s.id}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] backdrop-blur-sm ${s.color}`}
                    >
                      {s.icon}
                      <span className="capitalize">{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mock Toolkit Buttons Preview */}
            <div className="w-full mt-4 space-y-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold text-left ml-1">
                Featured Tools
              </div>
              <GlowWrapper
                enabled={settingsForm.theme_buttons_border}
                combo={settingsForm.theme_color_combo || "rgb"}
                roundedClass="rounded-xl"
                className="w-full"
              >
                <div className="w-full p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between text-left">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                      ⚡
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Pro Media Hub
                      </div>
                      <div className="text-[10px] text-zinc-400">
                        High-speed assets
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    Open
                  </div>
                </div>
              </GlowWrapper>
            </div>

            {/* Marketing Popup Preview (if enabled) */}
            {settingsForm.popup_enabled && (
              <div className="w-full mt-3 p-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-left">
                <div className="flex items-center gap-1.5 text-pink-300 font-bold text-[11px]">
                  <span>📢</span>
                  <span>{settingsForm.popup_title || "Special Announcement"}</span>
                </div>
                <div className="text-[10px] text-zinc-300 mt-0.5">
                  Visitor promo modal active
                </div>
              </div>
            )}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="relative z-10 pb-2 flex justify-center">
            <div className="w-28 h-1 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

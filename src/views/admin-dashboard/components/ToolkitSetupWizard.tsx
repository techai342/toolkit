import React, { useState, useEffect } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Phone,
  MessageCircle,
  Copy,
  ExternalLink,
  Shield,
  Palette,
  Megaphone,
  User,
  Share2,
  Lock,
  Upload,
  Check,
  Globe,
} from "lucide-react";
import { LiveMobilePreview } from "./LiveMobilePreview";
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
import { uploadImageClientSide } from "../utils";

interface ToolkitSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  settingsForm: any;
  setSettingsForm: React.Dispatch<React.SetStateAction<any>>;
  pageProfile: any;
  saveSettings: (e: React.FormEvent) => Promise<void>;
  settingsLoading: boolean;
  settingsMessage: { text: string; type: "error" | "success" } | null;
  onAvatarUpdated?: (url: string) => void;
}

const COUNTRY_CODES = [
  { code: "+92", country: "Pakistan", flag: "🇵🇰", sample: "3001234567" },
  { code: "+971", country: "UAE", flag: "🇦🇪", sample: "501234567" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦", sample: "501234567" },
  { code: "+44", country: "UK", flag: "🇬🇧", sample: "7911123456" },
  { code: "+1", country: "US / Canada", flag: "🇺🇸", sample: "5551234567" },
  { code: "+91", country: "India", flag: "🇮🇳", sample: "9812345678" },
  { code: "+90", country: "Turkey", flag: "🇹🇷", sample: "5012345678" },
  { code: "custom", country: "Other Country", flag: "🌐", sample: "" },
];

const GREETING_PRESETS = [
  {
    id: "inquiry",
    label: "General Inquiry",
    text: "Assalam-o-Alaikum! I visited your verified toolkit and would like more information.",
  },
  {
    id: "services",
    label: "Services & Pricing",
    text: "Hello! I am interested in your tools and pricing details. Let's discuss!",
  },
  {
    id: "collab",
    label: "Collaboration",
    text: "Hey! I love your work and would like to collaborate with you.",
  },
  {
    id: "custom",
    label: "Custom Message",
    text: "",
  },
];

export const ToolkitSetupWizard: React.FC<ToolkitSetupWizardProps> = ({
  isOpen,
  onClose,
  settingsForm,
  setSettingsForm,
  pageProfile,
  saveSettings,
  settingsLoading,
  settingsMessage,
  onAvatarUpdated,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+92");
  const [customCountryCode, setCustomCountryCode] = useState("+");
  const [whatsappLocalNumber, setWhatsappLocalNumber] = useState("");
  const [whatsappGreeting, setWhatsappGreeting] = useState(
    GREETING_PRESETS[0].text,
  );
  const [selectedGreetingPreset, setSelectedGreetingPreset] =
    useState("inquiry");
  const [copiedLink, setCopiedLink] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [wallpaperUploading, setWallpaperUploading] = useState(false);
  const [showMobilePreviewModal, setShowMobilePreviewModal] = useState(false);

  // Initialize WhatsApp state from existing settingsForm.social_whatsapp
  useEffect(() => {
    if (settingsForm?.social_whatsapp) {
      const raw = settingsForm.social_whatsapp.replace(/[^0-9+]/g, "");
      // Detect matched country code
      const matched = COUNTRY_CODES.find(
        (c) => c.code !== "custom" && raw.startsWith(c.code),
      );
      if (matched) {
        setSelectedCountryCode(matched.code);
        setWhatsappLocalNumber(raw.slice(matched.code.length));
      } else if (raw.startsWith("+")) {
        setSelectedCountryCode("custom");
        const codeDigits = raw.slice(0, 4);
        setCustomCountryCode(codeDigits);
        setWhatsappLocalNumber(raw.slice(4));
      } else {
        setWhatsappLocalNumber(raw);
      }
    }
  }, []);

  // Sync WhatsApp number back into settingsForm
  const updateWhatsappInForm = (cc: string, num: string) => {
    const cleanNum = num.replace(/[^0-9]/g, "");
    if (!cleanNum) {
      setSettingsForm((prev: any) => ({ ...prev, social_whatsapp: "" }));
      return;
    }
    const fullCode = cc === "custom" ? customCountryCode : cc;
    const finalNumber = `${fullCode}${cleanNum}`.replace(/[^0-9+]/g, "");
    setSettingsForm((prev: any) => ({
      ...prev,
      social_whatsapp: finalNumber,
    }));
  };

  const handleCountryChange = (code: string) => {
    setSelectedCountryCode(code);
    updateWhatsappInForm(code, whatsappLocalNumber);
  };

  const handleLocalNumberChange = (val: string) => {
    // Strip leading 0 if user enters e.g. 0300... with country code
    let cleaned = val.replace(/[^0-9]/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.substring(1);
    }
    setWhatsappLocalNumber(cleaned);
    updateWhatsappInForm(selectedCountryCode, cleaned);
  };

  // WhatsApp wa.me generated URL
  const getFullWhatsappNumber = () => {
    const cc =
      selectedCountryCode === "custom"
        ? customCountryCode
        : selectedCountryCode;
    const cleanDigits = `${cc}${whatsappLocalNumber}`.replace(/[^0-9]/g, "");
    return cleanDigits;
  };

  const generatedWhatsappLink = getFullWhatsappNumber()
    ? `https://wa.me/${getFullWhatsappNumber()}${
        whatsappGreeting
          ? `?text=${encodeURIComponent(whatsappGreeting.trim())}`
          : ""
      }`
    : "";

  const handleCopyWhatsappLink = () => {
    if (!generatedWhatsappLink) return;
    navigator.clipboard.writeText(generatedWhatsappLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Smart TikTok formatting
  const handleTiktokChange = (val: string) => {
    let clean = val.trim();
    if (clean) {
      if (clean.startsWith("@")) {
        clean = `https://www.tiktok.com/${clean}`;
      } else if (
        !clean.startsWith("http://") &&
        !clean.startsWith("https://") &&
        !clean.includes("tiktok.com")
      ) {
        clean = `https://www.tiktok.com/@${clean}`;
      }
    }
    setSettingsForm((prev: any) => ({ ...prev, social_tiktok: clean }));
  };

  // Avatar Upload Handler
  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarUploading(true);
    try {
      const data = await uploadImageClientSide(file, "avatar");
      if (onAvatarUpdated) {
        onAvatarUpdated(data.url);
      }
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Wallpaper Upload Handler
  const handleWallpaperFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setWallpaperUploading(true);
    try {
      const data = await uploadImageClientSide(file, "bg-wall");
      setSettingsForm((prev: any) => ({ ...prev, bg_image_url: data.url }));
    } catch (err: any) {
      console.error("Wallpaper upload failed:", err);
    } finally {
      setWallpaperUploading(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Identity & Bio",
      subtitle: "Username, bio, profile photo",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: 2,
      title: "WhatsApp Studio",
      subtitle: "Country code, auto-greeting & test",
      icon: <SiWhatsapp size={16} className="text-emerald-400" />,
    },
    {
      id: 3,
      title: "TikTok & Channels",
      subtitle: "TikTok auto-format & creator links",
      icon: <SiTiktok size={16} className="text-white" />,
    },
    {
      id: 4,
      title: "Theme & Finish",
      subtitle: "Fonts, wallpaper, security & publish",
      icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#050014]/90 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Main Wizard Modal Box */}
      <div className="relative w-full max-w-6xl bg-[#0F0A1F]/95 border border-purple-500/20 rounded-[32px] shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden flex flex-col max-h-[94vh] z-10 animate-in zoom-in-95 duration-200">
        {/* Wizard Top Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Toolkit Setup Wizard
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Step {currentStep} of 4
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Configure your toolkit, WhatsApp greeting, and TikTok channel in
                minutes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile View Preview Button */}
            <button
              type="button"
              onClick={() => setShowMobilePreviewModal(!showMobilePreviewModal)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-medium hover:bg-purple-500/25 transition-all"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Stepper Bar */}
        <div className="px-6 sm:px-8 pt-4 pb-3 bg-black/20 border-b border-white/5">
          {/* Progress Bar line */}
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>

          {/* Stepper Steps Row */}
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const isPassed = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentStep(s.id)}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                    isCurrent
                      ? "bg-purple-500/20 border border-purple-500/40 text-white"
                      : isPassed
                        ? "bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]"
                        : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                      isCurrent
                        ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                        : isPassed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/5 text-zinc-500"
                    }`}
                  >
                    {isPassed ? <Check className="w-3.5 h-3.5" /> : s.id}
                  </div>
                  <div className="hidden sm:block min-w-0">
                    <div className="text-xs font-semibold truncate leading-tight">
                      {s.title}
                    </div>
                    <div className="text-[10px] text-zinc-400 truncate">
                      {s.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Wizard Body: 2 Columns on Desktop (Form on Left, Live Mockup on Right) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Interactive Step Forms */}
          <div className="lg:col-span-7 xl:col-span-8 p-6 sm:p-8 overflow-y-auto custom-scrollbar max-h-[calc(94vh-180px)]">
            {settingsMessage && (
              <div
                className={`mb-6 p-4 rounded-2xl text-sm border flex items-center gap-2 ${
                  settingsMessage.type === "error"
                    ? "bg-red-500/10 border-red-500/30 text-red-200"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsMessage.text}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (currentStep < 4) {
                  setCurrentStep((prev) => prev + 1);
                } else {
                  saveSettings(e);
                }
              }}
            >
              {/* STEP 1: IDENTITY & BIO */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-purple-400" />
                      <span>Toolkit Identity & Bio</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Set up how your public toolkit appears to visitors and
                      search engines.
                    </p>
                  </div>

                  {/* Username / URL Slug */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      Username / URL Handle
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={settingsForm.username}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            username: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9_]/g, ""),
                          })
                        }
                        className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-white font-mono text-sm outline-none transition-all"
                        placeholder="your_handle"
                      />
                    </div>
                    <p className="text-[11px] text-zinc-500 ml-1">
                      Your public URL will be:{" "}
                      <span className="text-purple-400 font-mono">
                        protoolkits.com/{settingsForm.username || "handle"}
                      </span>
                    </p>
                  </div>

                  {/* Bio Description */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                        Creator Bio / Description
                      </label>
                      <span className="text-[10px] text-zinc-500">
                        {settingsForm.description?.length || 0}/200
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      maxLength={200}
                      value={settingsForm.description}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-zinc-600 resize-none"
                      placeholder="Share what your toolkit offers (e.g. Free video tools, high-speed downloads, verified links)..."
                    />
                  </div>

                  {/* Avatar Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      Profile Avatar
                    </label>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-500/20 border-2 border-purple-500/40 flex items-center justify-center shrink-0">
                        {pageProfile?.avatar_url ? (
                          <img
                            src={pageProfile.avatar_url}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-purple-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer transition-all shadow-md shadow-purple-600/20">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {avatarUploading ? "Uploading..." : "Upload Photo"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarFile}
                            disabled={avatarUploading}
                          />
                        </label>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          PNG or JPG recommended (square aspect ratio)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Public Contact Phone */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      General Contact Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone_number}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          phone_number: e.target.value,
                        })
                      }
                      className="w-full bg-black/40 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-white text-sm outline-none transition-all placeholder-zinc-600"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: WHATSAPP SMART STUDIO */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="border-b border-white/5 pb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
                      <SiWhatsapp size={14} />
                      <span>Smart WhatsApp Integration</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      WhatsApp Channel & Auto-Greeting Studio
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Configure your direct WhatsApp contact button with smart
                      country code recognition and one-click greeting presets.
                    </p>
                  </div>

                  {/* Country Code & Phone Number Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      WhatsApp Phone Number
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Country Code Picker */}
                      <div className="sm:col-span-5">
                        <select
                          value={selectedCountryCode}
                          onChange={(e) => handleCountryChange(e.target.value)}
                          className="w-full bg-black/60 border border-emerald-500/30 focus:border-emerald-400 text-white rounded-2xl px-3.5 py-3.5 text-sm outline-none transition-all font-medium cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c) => (
                            <option
                              key={c.code}
                              value={c.code}
                              className="bg-[#0F0A1F] text-white"
                            >
                              {c.flag} {c.country} ({c.code})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone Digits Input */}
                      <div className="sm:col-span-7 relative">
                        <input
                          type="tel"
                          value={whatsappLocalNumber}
                          onChange={(e) =>
                            handleLocalNumberChange(e.target.value)
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-2xl px-4 py-3.5 text-white font-mono text-sm outline-none transition-all placeholder-zinc-600"
                          placeholder="e.g. 3001234567"
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
                          <Phone className="w-4 h-4 text-emerald-400/70" />
                        </div>
                      </div>
                    </div>

                    {selectedCountryCode === "custom" && (
                      <div className="mt-2">
                        <label className="text-[11px] text-zinc-400 ml-1">
                          Enter Custom Country Dial Code (with +):
                        </label>
                        <input
                          type="text"
                          value={customCountryCode}
                          onChange={(e) => {
                            setCustomCountryCode(e.target.value);
                            updateWhatsappInForm("custom", whatsappLocalNumber);
                          }}
                          className="w-32 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-emerald-500"
                          placeholder="+880"
                        />
                      </div>
                    )}
                  </div>

                  {/* Auto-Greeting Presets */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 flex items-center justify-between">
                      <span>Auto-Greeting Message Presets</span>
                      <span className="text-[10px] text-emerald-400 font-normal">
                        Visitors will send this with 1 tap
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {GREETING_PRESETS.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => {
                            setSelectedGreetingPreset(preset.id);
                            if (preset.id !== "custom") {
                              setWhatsappGreeting(preset.text);
                            }
                          }}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                            selectedGreetingPreset === preset.id
                              ? "bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10"
                              : "bg-white/[0.03] border-white/5 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-xs font-bold text-white">
                              {preset.label}
                            </span>
                            {selectedGreetingPreset === preset.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">
                            {preset.text || "Type your custom greeting message"}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Greeting Message Textarea */}
                    <div className="relative mt-2">
                      <textarea
                        rows={2}
                        value={whatsappGreeting}
                        onChange={(e) => {
                          setWhatsappGreeting(e.target.value);
                          setSelectedGreetingPreset("custom");
                        }}
                        className="w-full bg-black/40 border border-white/10 focus:border-emerald-500 rounded-2xl px-4 py-3 text-white text-xs outline-none transition-all placeholder-zinc-600 resize-none"
                        placeholder="Customize greeting text..."
                      />
                    </div>
                  </div>

                  {/* Generated WhatsApp Link Card & Action Buttons */}
                  {generatedWhatsappLink ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/[0.08] border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <SiWhatsapp size={18} className="text-emerald-400" />
                          <span className="text-xs font-bold text-white">
                            Generated WhatsApp Link
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          Ready to use
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/50 border border-emerald-500/20 font-mono text-[11px] text-zinc-300 truncate">
                        {generatedWhatsappLink}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Test Button */}
                        <a
                          href={generatedWhatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Test WhatsApp Link Now</span>
                        </a>

                        {/* Copy Button */}
                        <button
                          type="button"
                          onClick={handleCopyWhatsappLink}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all"
                        >
                          {copiedLink ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center text-xs text-zinc-500">
                      Enter your WhatsApp number above to generate your smart
                      link & test button.
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: TIKTOK & SOCIAL CHANNELS */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="border-b border-white/5 pb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold mb-2">
                      <SiTiktok size={14} />
                      <span>TikTok & Social Hub</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">
                      Connect TikTok & Social Presence
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Link your TikTok profile with automatic handle formatting
                      and connect companion creator channels.
                    </p>
                  </div>

                  {/* Highlighted TikTok Smart Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-black/40 to-sky-500/10 border border-pink-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center text-white border border-white/20">
                          <SiTiktok size={18} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-white">
                            TikTok Profile URL / Handle
                          </span>
                          <p className="text-[11px] text-zinc-400">
                            Type <span className="text-pink-400">@handle</span>{" "}
                            or full URL
                          </p>
                        </div>
                      </div>
                      {settingsForm.social_tiktok && (
                        <a
                          href={settingsForm.social_tiktok}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] font-bold text-pink-400 bg-pink-500/15 border border-pink-500/30 px-3 py-1 rounded-lg hover:bg-pink-500/25 transition-all"
                        >
                          <span>Verify TikTok</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        value={settingsForm.social_tiktok}
                        onChange={(e) => handleTiktokChange(e.target.value)}
                        className="w-full bg-black/60 border border-white/10 focus:border-pink-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-all placeholder-zinc-600 font-mono"
                        placeholder="e.g. @coolcreator or https://tiktok.com/@..."
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      💡 Tip: Just enter{" "}
                      <span className="text-white font-mono">@yourhandle</span>{" "}
                      and we will format it automatically.
                    </p>
                  </div>

                  {/* Secondary Social Channels Grid */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      Other Creator Channels (Official Brand Logos)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* YouTube */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1 flex items-center gap-1.5">
                          <SiYoutube className="w-3.5 h-3.5 text-[#FF0000]" />
                          <span>YouTube Channel</span>
                        </label>
                        <input
                          type="url"
                          value={settingsForm.social_youtube}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              social_youtube: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder-zinc-600"
                          placeholder="https://youtube.com/@channel"
                        />
                      </div>

                      {/* Instagram */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1 flex items-center gap-1.5">
                          <SiInstagram className="w-3.5 h-3.5 text-[#E4405F]" />
                          <span>Instagram Profile</span>
                        </label>
                        <input
                          type="text"
                          value={settingsForm.social_instagram}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              social_instagram: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-pink-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder-zinc-600"
                          placeholder="https://instagram.com/user"
                        />
                      </div>

                      {/* Telegram */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1 flex items-center gap-1.5">
                          <SiTelegram className="w-3.5 h-3.5 text-[#26A5E4]" />
                          <span>Telegram Channel</span>
                        </label>
                        <input
                          type="text"
                          value={settingsForm.social_telegram}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              social_telegram: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-sky-400 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder-zinc-600"
                          placeholder="https://t.me/channel"
                        />
                      </div>

                      {/* Facebook */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1 flex items-center gap-1.5">
                          <SiFacebook className="w-3.5 h-3.5 text-[#1877F2]" />
                          <span>Facebook Page</span>
                        </label>
                        <input
                          type="text"
                          value={settingsForm.social_facebook}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              social_facebook: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder-zinc-600"
                          placeholder="https://facebook.com/page"
                        />
                      </div>

                      {/* X / Twitter */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1 flex items-center gap-1.5">
                          <SiX className="w-3.5 h-3.5 text-white" />
                          <span>X (Twitter) Profile</span>
                        </label>
                        <input
                          type="text"
                          value={settingsForm.social_twitter}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              social_twitter: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-zinc-400 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder-zinc-600"
                          placeholder="https://x.com/username"
                        />
                      </div>

                      {/* GitHub */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1 flex items-center gap-1.5">
                          <SiGithub className="w-3.5 h-3.5 text-white" />
                          <span>GitHub Profile</span>
                        </label>
                        <input
                          type="text"
                          value={settingsForm.social_github}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              social_github: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 focus:border-zinc-400 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none transition-all placeholder-zinc-600"
                          placeholder="https://github.com/username"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: FULL CUSTOMIZATION (THEMES, NEON GLOW & AMBIANCE) */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="border-b border-white/5 pb-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold mb-2">
                      <Sparkles size={14} className="text-purple-400" />
                      <span>Full Visual Customization</span>
                    </div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Theme, Glow Effects & Appearance</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1">
                      Customize dynamic neon border glow themes, typography fonts, username color accents, background canvas, and marketing popup.
                    </p>
                  </div>

                  {/* Typography Font Picker */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1 flex items-center justify-between">
                      <span>Typography Font Style</span>
                      <span className="text-[10px] text-purple-400 lowercase font-mono">var(--font-{settingsForm.theme_font_family || 'sans'})</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "sans", label: "Sans (Modern)", font: "font-sans", sample: "Clean Inter" },
                        {
                          id: "serif",
                          label: "Serif (Classic)",
                          font: "font-serif",
                          sample: "Playfair Display",
                        },
                        { id: "mono", label: "Mono (Tech)", font: "font-mono", sample: "JetBrains Terminal" },
                        {
                          id: "display",
                          label: "Display (Bold)",
                          font: "font-black tracking-wide",
                          sample: "Space Grotesk",
                        },
                      ].map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_font_family: f.id,
                            })
                          }
                          className={`p-3 rounded-xl border text-center transition-all ${
                            settingsForm.theme_font_family === f.id
                              ? "bg-purple-500/25 border-purple-500 text-white font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)] scale-[1.02]"
                              : "bg-white/[0.03] border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.06]"
                          }`}
                        >
                          <div className={`text-base mb-1 ${f.font}`}>Aa</div>
                          <div className="text-[11px] font-semibold truncate">{f.label}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{f.sample}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Neon Conic Glow Theme Combo Presets */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span>Neon Border Glow Theme</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">
                        {settingsForm.theme_color_combo || 'rgb'} active
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {[
                        { id: "rgb", label: "RGB Chroma", preview: "bg-[conic-gradient(from_0deg,#ef4444,#22c55e,#3b82f6,#ef4444)]" },
                        { id: "purple_cyan", label: "Cyberpunk", preview: "bg-[conic-gradient(from_0deg,#a855f7,#06b6d4,#a855f7)]" },
                        { id: "fire", label: "Inferno Fire", preview: "bg-[conic-gradient(from_0deg,#f97316,#eab308,#f97316)]" },
                        { id: "ocean", label: "Deep Ocean", preview: "bg-[conic-gradient(from_0deg,#0ea5e9,#3b82f6,#0ea5e9)]" },
                        { id: "toxic", label: "Toxic Neon", preview: "bg-[conic-gradient(from_0deg,#84cc16,#bef264,#84cc16)]" },
                        { id: "royal", label: "Royal Gold", preview: "bg-[conic-gradient(from_0deg,#eab308,#a855f7,#eab308)]" },
                        { id: "sakura", label: "Sakura Pink", preview: "bg-[conic-gradient(from_0deg,#f472b6,#fdf2f8,#f472b6)]" },
                        { id: "sunset", label: "Sunset", preview: "bg-[conic-gradient(from_0deg,#ef4444,#f97316,#a855f7,#ef4444)]" },
                        { id: "none", label: "Clean / Off", preview: "bg-zinc-700" },
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_color_combo: c.id,
                            })
                          }
                          className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center ${
                            settingsForm.theme_color_combo === c.id
                              ? "border-purple-400 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.35)] scale-[1.03]"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/30 hover:text-white"
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full p-[2px] overflow-hidden relative shadow-sm">
                            <div className={`w-full h-full rounded-full ${c.preview} ${c.id !== 'none' ? 'animate-spin' : ''}`}></div>
                          </div>
                          <span className="text-[10px] font-semibold truncate w-full">{c.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Glow Targets Selection Toggles */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div>
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Active Glow Placements
                      </span>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Choose which components on your public toolkit will display the rotating neon glow
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      {[
                        { key: "theme_profile_border", label: "Profile Avatar Glow", icon: "👤" },
                        { key: "theme_buttons_border", label: "Tools Cards Glow", icon: "⚡" },
                        { key: "theme_social_border", label: "Social Buttons Glow", icon: "🌐" },
                        { key: "theme_search_border", label: "Search Bar Glow", icon: "🔍" },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              [item.key]: !settingsForm[item.key],
                            })
                          }
                          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                            settingsForm[item.key]
                              ? "bg-purple-600/20 border-purple-500/60 text-white shadow-sm"
                              : "bg-black/30 border-white/5 text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                          </div>
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] font-bold ${
                            settingsForm[item.key]
                              ? "bg-purple-500 border-purple-400 text-white"
                              : "border-zinc-600 text-transparent"
                          }`}>
                            ✓
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Username Color Accent Swatches */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest">
                        Username Color Accent
                      </label>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {settingsForm.theme_username_color || "#FFFFFF"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        { label: "White", color: "#FFFFFF" },
                        { label: "Purple", color: "#A855F7" },
                        { label: "Cyan", color: "#00F2FE" },
                        { label: "Emerald", color: "#10B981" },
                        { label: "Amber", color: "#F59E0B" },
                        { label: "Pink", color: "#EC4899" },
                        { label: "Fire Red", color: "#EF4444" },
                        { label: "Sky Blue", color: "#38BDF8" },
                      ].map((c) => (
                        <button
                          key={c.color}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_username_color: c.color,
                            })
                          }
                          className={`w-8 h-8 rounded-full border-2 transition-transform ${
                            (settingsForm.theme_username_color || "#FFFFFF").toLowerCase() === c.color.toLowerCase()
                              ? "scale-125 border-white ring-2 ring-purple-500 shadow-md"
                              : "border-transparent opacity-80 hover:opacity-100 hover:scale-110"
                          }`}
                          style={{ backgroundColor: c.color }}
                          title={c.label}
                        />
                      ))}

                      <div className="flex items-center gap-1.5 ml-auto bg-black/40 border border-white/10 rounded-xl px-2.5 py-1 text-xs">
                        <span className="text-zinc-500 font-mono">#</span>
                        <input
                          type="text"
                          value={(settingsForm.theme_username_color || "#FFFFFF").replace("#", "")}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              theme_username_color: `#${e.target.value.replace(/[^0-9a-fA-F]/g, "")}`,
                            })
                          }
                          maxLength={6}
                          className="w-16 bg-transparent text-white font-mono text-xs outline-none uppercase"
                          placeholder="FFFFFF"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background Canvas Ambiance & Wallpaper */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-widest ml-1">
                      Canvas Background Ambiance
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[
                        { id: "#0A0F1E", label: "Obsidian", desc: "Classic Deep Blue" },
                        { id: "#030014", label: "Midnight Void", desc: "Ultra Dark Space" },
                        { id: "#130924", label: "Cyber Violet", desc: "Electric Purple" },
                        { id: "#0B0E14", label: "Charcoal Noir", desc: "Minimalist Black" },
                      ].map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() =>
                            setSettingsForm({
                              ...settingsForm,
                              bg_color: b.id,
                            })
                          }
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            (settingsForm.bg_color || "#0A0F1E").toLowerCase() === b.id.toLowerCase()
                              ? "border-purple-400 bg-white/10 text-white font-bold"
                              : "border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full border border-white/20 mb-1" style={{ backgroundColor: b.id }}></div>
                          <div className="text-xs truncate">{b.label}</div>
                          <div className="text-[9px] text-zinc-500 truncate">{b.desc}</div>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-black/50 border border-white/20 shrink-0 flex items-center justify-center">
                        {settingsForm.bg_image_url ? (
                          <img
                            src={settingsForm.bg_image_url}
                            alt="Wallpaper"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Palette className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium cursor-pointer transition-all">
                          <Upload className="w-3.5 h-3.5" />
                          <span>
                            {wallpaperUploading ? "Uploading..." : "Upload Custom Wallpaper"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleWallpaperFile}
                            disabled={wallpaperUploading}
                          />
                        </label>
                        {settingsForm.bg_image_url && (
                          <button
                            type="button"
                            onClick={() =>
                              setSettingsForm({
                                ...settingsForm,
                                bg_image_url: "",
                              })
                            }
                            className="block text-[11px] text-red-400 hover:underline"
                          >
                            Remove wallpaper
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Visitor Marketing Popup Toggle */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                          <Megaphone className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">
                            Visitor Marketing Announcement Popup
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            Show special alert/notice when visitors open your toolkit
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.popup_enabled}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              popup_enabled: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>

                    {settingsForm.popup_enabled && (
                      <div className="space-y-2.5 pt-2 border-t border-white/5 animate-in fade-in duration-200">
                        <input
                          type="text"
                          value={settingsForm.popup_title || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              popup_title: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-pink-500"
                          placeholder="Popup Headline (e.g. 🔥 Join our Official Telegram for VIP updates!)"
                        />
                        <textarea
                          value={settingsForm.popup_description || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              popup_description: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-pink-500 resize-none"
                          placeholder="Announcement description or promotional details..."
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={settingsForm.popup_button_text || ""}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                popup_button_text: e.target.value,
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-pink-500"
                            placeholder="Button Text (e.g. Join Now)"
                          />
                          <input
                            type="url"
                            value={settingsForm.popup_link || ""}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                popup_link: e.target.value,
                              })
                            }
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-pink-500"
                            placeholder="Button Target URL (e.g. https://t.me/...)"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Search Engine & Social Share SEO Optimization */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            <span>Search Engine & Social Share SEO</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono font-bold">LIVE</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 mt-0.5">
                            Google search indexing & social chat preview cards (WhatsApp, TikTok, Facebook, Twitter)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Live Google & Social Preview Mockup */}
                    <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 space-y-1.5">
                      <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                        <span>🔍</span>
                        <span>Google & Social Link Preview</span>
                      </div>
                      <div className="text-xs font-bold text-[#8AB4F8] hover:underline cursor-pointer truncate">
                        {settingsForm.seo_title || `${settingsForm.username || 'Creator'} (@${settingsForm.username || 'creator'}) | Verified Pro Toolkit`}
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono truncate">
                        https://protoolkits.com/{settingsForm.username || 'username'}
                      </div>
                      <div className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">
                        {settingsForm.seo_description || settingsForm.description || `Explore verified tools, direct WhatsApp link, and exclusive resources curated by @${settingsForm.username || 'creator'} on Pro Toolkits.`}
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1">
                          Custom SEO Title (Optional Google Override)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.seo_title || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              seo_title: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-indigo-500 transition-all placeholder-zinc-600"
                          placeholder={`e.g. @${settingsForm.username || 'name'} | Official Tools & Verified Media`}
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1">
                          Custom Meta Description (Google & WhatsApp Snippet)
                        </label>
                        <textarea
                          value={settingsForm.seo_description || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              seo_description: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-indigo-500 transition-all resize-none placeholder-zinc-600"
                          placeholder="Brief description for search engines and social chat previews..."
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 ml-1">
                          Target SEO Keywords (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.seo_keywords || ""}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              seo_keywords: e.target.value,
                            })
                          }
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-white text-xs outline-none focus:border-indigo-500 transition-all placeholder-zinc-600"
                          placeholder="e.g. tools, termux, cyber, verified toolkit, free scripts"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Checklist Review */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 space-y-2.5">
                    <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Setup Summary Checklist</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">@{settingsForm.username || "unset"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        {settingsForm.social_whatsapp ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-600 inline-block shrink-0"></span>
                        )}
                        <span className="truncate">WhatsApp Connected</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        {settingsForm.social_tiktok ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full bg-zinc-600 inline-block shrink-0"></span>
                        )}
                        <span className="truncate">TikTok Linked</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">Glow: {settingsForm.theme_color_combo || 'rgb'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Wizard Bottom Navigation Buttons */}
              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev - 1)}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {currentStep < 4 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStep((prev) => prev + 1)}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition-all transform hover:scale-[1.02]"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={settingsLoading}
                      className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/30 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                    >
                      {settingsLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving Changes...</span>
                        </div>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save & Publish Toolkit</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Live Mobile Mockup Preview (Desktop) */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 bg-black/40 border-l border-white/5 p-6 flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-4 left-6 flex items-center gap-1.5 text-xs font-semibold text-purple-300">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Real-time Live Preview</span>
            </div>

            <div className="mt-6 transform scale-[0.88] xl:scale-95 transition-all">
              <LiveMobilePreview
                settingsForm={settingsForm}
                avatarUrl={pageProfile?.avatar_url}
                whatsappGreeting={whatsappGreeting}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Live Preview Modal Overlay (when toggled on small screens) */}
      {showMobilePreviewModal && (
        <div className="fixed inset-0 z-[10000] lg:hidden flex flex-col items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="w-full max-w-sm flex items-center justify-between mb-4 px-2">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>Live Mobile Mockup</span>
            </span>
            <button
              onClick={() => setShowMobilePreviewModal(false)}
              className="p-1.5 bg-white/10 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="transform scale-[0.9]">
            <LiveMobilePreview
              settingsForm={settingsForm}
              avatarUrl={pageProfile?.avatar_url}
              whatsappGreeting={whatsappGreeting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

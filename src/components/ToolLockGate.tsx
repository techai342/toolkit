import React, { useState, useEffect } from "react";
import { Lock, Unlock, ShieldAlert, Key, MessageCircle, X, CheckCircle2 } from "lucide-react";

export const SAQIB_WHATSAPP = "https://wa.me/923478936242?text=Assalam-o-Alaikum%20Saqib%20Bhai,%20mujhe%20custom%20tools%20access%20chahiye";
export const SAQIB_PHONE = "03478936242";

export function isOwnerPasscodeValid(input: string): boolean {
  const clean = input.trim().toLowerCase();
  return clean === "saqibadmin" || clean === "saqib242" || clean === "242" || clean === "saqib";
}

export function useToolLock() {
  const [isLocked, setIsLocked] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("saqib_tools_unlocked");
      if (stored === "true") {
        setIsLocked(false);
      }
    } catch (e) {}
  }, []);

  const unlock = (passcode: string): boolean => {
    if (isOwnerPasscodeValid(passcode)) {
      setIsLocked(false);
      try {
        localStorage.setItem("saqib_tools_unlocked", "true");
      } catch (e) {}
      return true;
    }
    return false;
  };

  const relock = () => {
    setIsLocked(true);
    try {
      localStorage.removeItem("saqib_tools_unlocked");
    } catch (e) {}
  };

  return { isLocked, unlock, relock };
}

interface ToolLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolName?: string;
  onUnlocked?: () => void;
}

export const ToolLockModal: React.FC<ToolLockModalProps> = ({
  isOpen,
  onClose,
  toolName = "Custom Tool",
  onUnlocked,
}) => {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwnerPasscodeValid(passcode)) {
      setError("");
      setSuccess("Owner Verified! Custom Tools Unlocked.");
      try {
        localStorage.setItem("saqib_tools_unlocked", "true");
      } catch (e) {}
      setTimeout(() => {
        if (onUnlocked) onUnlocked();
        onClose();
        setSuccess("");
        setPasscode("");
      }, 700);
    } else {
      setError("Access Denied: Ghalat Passcode. Contact Saqib 242 (+92 347 8936242).");
      setSuccess("");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0b0f19] border border-red-500/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_60px_rgba(239,68,68,0.25)] relative overflow-hidden">
        {/* Glowing Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/40 mx-auto flex items-center justify-center text-amber-400 mb-4 shadow-lg shadow-red-500/20 animate-pulse">
          <Lock className="w-8 h-8" />
        </div>

        {/* Header Content */}
        <div className="text-center">
          <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Access Restricted
          </span>
          <h3 className="text-xl font-black text-white mt-3">
            {toolName} is Locked
          </h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Ye tool filhal <b>Application Owner (Muhammad Saqib 242)</b> ki taraf se <b>LOCKED</b> hai. Unauthorized users ke liye creation aur usage disabled hai.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-4">
          <a
            href={SAQIB_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            Contact Saqib 242 on WhatsApp ({SAQIB_PHONE})
          </a>

          {/* Owner Passcode Unlock Form */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" /> Owner Passcode Unlock:
              </span>
              <span className="text-[10px] text-zinc-500">Saqib 242 Only</span>
            </div>

            <form onSubmit={handleUnlock} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter Master Passcode..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400/50 font-mono"
                />
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1 shadow-md shadow-amber-500/20"
                >
                  <Unlock className="w-3.5 h-3.5" /> Unlock
                </button>
              </div>

              {error && (
                <p className="text-[11px] text-red-400 font-mono flex items-center gap-1 mt-1">
                  <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" /> {error}
                </p>
              )}

              {success && (
                <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" /> {success}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToolLockBannerProps {
  toolName: string;
  isLocked: boolean;
  onUnlockClick: () => void;
  onRelockClick?: () => void;
}

export const ToolLockBanner: React.FC<ToolLockBannerProps> = ({
  toolName,
  isLocked,
  onUnlockClick,
  onRelockClick,
}) => {
  if (!isLocked) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 px-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Unlock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-300">
              Owner Mode Active — {toolName} Unlocked
            </p>
            <p className="text-[11px] text-zinc-400">
              Clearance verified for Muhammad Saqib (Saqib 242).
            </p>
          </div>
        </div>
        {onRelockClick && (
          <button
            onClick={onRelockClick}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 flex items-center gap-1.5 transition-all"
          >
            <Lock className="w-3.5 h-3.5" /> Lock Tool
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 px-5 bg-gradient-to-r from-red-950/40 via-amber-950/20 to-black/60 border border-red-500/30 rounded-2xl mb-6 shadow-lg shadow-red-950/40">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-red-500/20 text-amber-400 border border-red-500/30 animate-pulse">
          <Lock className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-bold text-red-300 flex items-center gap-2">
            <span>🔒 Access Restricted: {toolName} Locked by Owner (Saqib 242)</span>
            <span className="text-[9px] bg-red-500/20 text-red-300 border border-red-500/40 px-2 py-0.5 rounded-full font-mono uppercase">VIP ONLY</span>
          </p>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Public usage & creation has been disabled by Administrator. Contact Muhammad Saqib for clearance.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        <a
          href={SAQIB_WHATSAPP}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-bold px-3 py-2 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white flex items-center gap-1.5 transition-all"
        >
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
        </a>
        <button
          onClick={onUnlockClick}
          className="text-xs font-bold px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-all"
        >
          <Key className="w-3.5 h-3.5" /> Unlock
        </button>
      </div>
    </div>
  );
};

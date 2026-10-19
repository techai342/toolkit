import React from 'react';
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
  SiDiscord, 
  SiReddit, 
  SiPinterest, 
  SiSpotify, 
  SiBehance, 
  SiGmail 
} from 'react-icons/si';
import { 
  FaLinkedin, 
  FaTwitter, 
  FaSkype 
} from 'react-icons/fa6';
import { 
  Globe, 
  Mail,
  Activity,
  Shield,
  Users,
  CheckCircle,
  Lock,
  Search,
  Palette,
  Megaphone,
  Share2
} from 'lucide-react';

export const SocialIconColors = {
  facebook: '#1877F2',
  youtube: '#FF0000',
  whatsapp: '#25D366',
  github: '#ffffff',
  telegram: '#26A5E4',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  x: '#ffffff',
  tiktok: '#ffffff',
  snapchat: '#FFFC00',
  linkedin: '#0A66C2',
  reddit: '#FF4500',
  pinterest: '#BD081C',
  discord: '#5865F2',
  spotify: '#1DB954',
  behance: '#1769ff',
  skype: '#00aff0',
  globe: '#3b82f6',
  mail: '#ef4444'
};

export function WhatsappIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiWhatsapp className={className} size={size} />;
}

export function TelegramIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiTelegram className={className} size={size} />;
}

export function TiktokIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiTiktok className={className} size={size} />;
}

export function SnapchatIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiSnapchat className={className} size={size} />;
}

export function InstagramIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiInstagram className={className} size={size} />;
}

export function YoutubeIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiYoutube className={className} size={size} />;
}

export function FacebookIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiFacebook className={className} size={size} />;
}

export function BehanceIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiBehance className={className} size={size} />;
}

export function SkypeIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <FaSkype className={className} size={size} />;
}

export function RedditIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiReddit className={className} size={size} />;
}

export function PinterestIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return <SiPinterest className={className} size={size} />;
}

export function RenderSocialIcon({ 
  platform, 
  className, 
  size = 20, 
  style 
}: { 
  platform: string; 
  className?: string; 
  size?: number; 
  style?: React.CSSProperties;
}) {
  const iconProps = { className, size, style };
  const key = (platform || '').toLowerCase().trim();

  switch (key) {
    case 'whatsapp': 
      return <SiWhatsapp {...iconProps} />;
    case 'tiktok': 
      return <SiTiktok {...iconProps} />;
    case 'snapchat': 
      return <SiSnapchat {...iconProps} />;
    case 'instagram': 
      return <SiInstagram {...iconProps} />;
    case 'youtube': 
      return <SiYoutube {...iconProps} />;
    case 'facebook': 
      return <SiFacebook {...iconProps} />;
    case 'telegram': 
      return <SiTelegram {...iconProps} />;
    case 'twitter': 
      return <FaTwitter {...iconProps} />;
    case 'x': 
      return <SiX {...iconProps} />;
    case 'github': 
      return <SiGithub {...iconProps} />;
    case 'discord': 
      return <SiDiscord {...iconProps} />;
    case 'reddit': 
      return <SiReddit {...iconProps} />;
    case 'pinterest': 
      return <SiPinterest {...iconProps} />;
    case 'spotify': 
      return <SiSpotify {...iconProps} />;
    case 'behance': 
      return <SiBehance {...iconProps} />;
    case 'linkedin': 
      return <FaLinkedin {...iconProps} />;
    case 'skype': 
      return <FaSkype {...iconProps} />;
    case 'mail': 
    case 'gmail': 
      return <SiGmail {...iconProps} />;
    case 'megaphone': 
      return <Megaphone {...iconProps} />;
    case 'activity': 
      return <Activity {...iconProps} />;
    case 'shield': 
      return <Shield {...iconProps} />;
    case 'users': 
      return <Users {...iconProps} />;
    case 'checkcircle': 
      return <CheckCircle {...iconProps} />;
    case 'lock': 
      return <Lock {...iconProps} />;
    case 'search': 
      return <Search {...iconProps} />;
    case 'palette': 
      return <Palette {...iconProps} />;
    case 'share': 
      return <Share2 {...iconProps} />;
    case 'globe': 
      return <Globe {...iconProps} />;
    default: 
      return <Globe {...iconProps} />;
  }
}

export function GlassSocialIcon({ platform, className }: { platform: string; className?: string }) {
  const color = SocialIconColors[platform.toLowerCase() as keyof typeof SocialIconColors] || '#ffffff';
  
  return (
    <div className={`relative group ${className}`}>
      {/* Glass Background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20" />
      
      {/* Glow Effect */}
      <div 
        className="absolute inset-2 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-300 rounded-full"
        style={{ backgroundColor: color }}
      />
      
      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-2">
        <RenderSocialIcon 
          platform={platform} 
          className="w-full h-full text-white drop-shadow-md" 
        />
      </div>
      
      {/* Reflection Line */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />
    </div>
  );
}

export function SocialButton({ platform, url }: { platform: string; url: string }) {
  if (!url) return null;
  const color = SocialIconColors[platform.toLowerCase() as keyof typeof SocialIconColors] || '#ffffff';
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white/5 border border-white/10 hover:-translate-y-1 transition-all duration-300 group shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] overflow-hidden relative"
      style={{ '--hover-color': color } as any}
    >
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
      
      <RenderSocialIcon 
        platform={platform} 
        className="w-5 h-5 text-zinc-400 group-hover:scale-110 transition-transform duration-300 relative z-10" 
      />
      <style>{`
        .group:hover svg { color: var(--hover-color) !important; }
        .group:hover { border-color: color-mix(in srgb, var(--hover-color) 40%, transparent) !important; }
      `}</style>
    </a>
  );
}

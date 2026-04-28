import React from 'react';
import { 
  Facebook, 
  Youtube, 
  Github, 
  Instagram, 
  Twitter, 
  Linkedin, 
  MessageSquare, 
  Send, 
  Share2, 
  Globe, 
  Mail,
  Activity,
  Shield,
  Users,
  CheckCircle,
  Lock,
  Search,
  Palette,
  Megaphone
} from 'lucide-react';

export const SocialIconColors = {
  facebook: '#1877F2',
  youtube: '#FF0000',
  whatsapp: '#25D366',
  github: '#ffffff',
  telegram: '#26A5E4',
  instagram: '#E4405F',
  twitter: '#1DA1F2',
  tiktok: '#ffffff',
  snapchat: '#FFFC00',
  linkedin: '#0A66C2',
  reddit: '#FF4500',
  pinterest: '#BD081C',
  discord: '#5865F2',
  behance: '#1769ff',
  skype: '#00aff0',
  globe: '#3b82f6',
  mail: '#ef4444'
};

export function WhatsappIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  );
}

export function TelegramIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.686c.223-.195-.05-.304-.346-.108l-6.4 4.024-2.76-.86c-.6-.185-.615-.6.125-.89l10.736-4.138c.497-.181.93.111.758.857z"/>
    </svg>
  );
}

export function TiktokIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.35-2.91 5.72-1.75 1.36-4.04 1.94-6.22 1.56-2.17-.37-4.11-1.64-5.26-3.46-1.15-1.81-1.41-4.06-.72-6.05.69-1.98 2.22-3.62 4.16-4.43 1.94-.8 4.19-.88 6.17-.22V13.8c-1.37-.36-2.85-.29-4.15.22-1.29.51-2.4 1.48-2.99 2.73-.6 1.25-.65 2.72-.12 4.01.52 1.28 1.52 2.33 2.8 2.87 1.27.53 2.75.52 4.02-.03 1.27-.55 2.31-1.57 2.83-2.84.53-1.28.6-2.71.21-4.04-.39-1.33-1.24-2.48-2.38-3.21V.02z"/>
    </svg>
  );
}

export function SnapchatIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.4c-4.4 0-6 3.2-6 3.2 0 0-1.2 0-1.2 1.2 0 .8.8 1.2 1.2 1.2.4 3.6 1.6 4.8 1.6 4.8.4 4 4.4 5.2 4.4 5.2.4.4.8.4 1.2.4s.8 0 1.2-.4c0 0 4-1.2 4.4-5.2 0 0 1.2-1.2 1.6-4.8.4 0 1.2-.4 1.2-1.2 0-1.2-1.2-1.2-1.2-1.2S16.4 2.4 12 2.4z"/>
    </svg>
  );
}

export function BehanceIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <path d="M22 7h-7v-2h7v2zm.5 3.5c0 1.933-1.567 3.5-3.5 3.5s-3.5-1.567-3.5-3.5h7zm-7 0c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5h-7zm-10-5.5h-5.5v14h5.5c2.485 0 4.5-2.015 4.5-4.5 0-1.545-.777-2.909-1.964-3.712.875-.761 1.464-1.874 1.464-3.138 0-1.464-.693-2.766-1.782-3.593-.81-.617-1.801-.957-2.871-.957h.153zm-.153 2h-.347v4h.347c1.103 0 2 .897 2 2s-.897 2-2 2h-.347v4h.347c1.381 0 2.5-1.119 2.5-2.5 0-.802-.377-1.517-.963-1.977l-.537-.282.537-.282c1.474-.774 2.463-2.316 2.463-4.101 0-2.485-2.015-4.5-4.5-4.5h.153z"/>
    </svg>
  );
}

export function SkypeIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zm0 2c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10zm-1.815 13.91c2.14 0 3.203-1.114 3.203-2.618 0-1.071-.723-1.859-2.148-2.35l-.974-.32c-.521-.176-.719-.34-.719-.571 0-.308.318-.461.9-.461.583 0 1.252.132 1.846.363l.428-1.53c-.703-.296-1.516-.428-2.263-.428-2.033 0-3.088 1.054-3.088 2.508 0 1.054.66 1.813 2.132 2.296l.967.331c.582.198.791.396.791.66 0 .373-.418.527-1.022.527-.726 0-1.637-.242-2.308-.57l-.538 1.57c.78.363 1.813.518 2.793.518z"/>
    </svg>
  );
}

export function RedditIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M24 11.5c0-1.65-1.35-3-3-3-.7 0-1.32.24-1.83.65C17.43 8.04 15.05 7.3 12.46 7.2l1.06-4.99 3.47.74c.03.88.76 1.58 1.65 1.58 1.15 0 1.9-.85 1.9-2 0-1.15-.75-2-1.9-2-.82 0-1.53.48-1.84 1.18L13.14.73C12.98.39 12.63.2 12.28.27l-5.32 1.12c-.2.04-.36.2-.41.4l-1.07 5C2.89 7.31.5 8.05.5 8.5c0 1.65 1.35 3 3 3 .15 0 .3-.01.44-.04C3.36 12.56 3 13.97 3 15.5c0 4.14 4.03 7.5 9 7.5s9-3.36 9-7.5c0-1.53-.36-2.94-.94-4.04.14.03.29.04.44.04 1.65 0 3-1.35 3-3z"/>
    </svg>
  );
}

export function PinterestIcon({ className, size = 24 }: { className?: string, size?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.42 7.63 11.17-.1-.95-.19-2.42.04-3.46.21-.93 1.35-5.73 1.35-5.73s-.34-.69-.34-1.71c0-1.61.93-2.81 2.09-2.81 1 0 1.48.75 1.48 1.64 0 1-.64 2.5-1 3.88-.28 1.17.58 2.12 1.73 2.12 2.08 0 3.68-2.19 3.68-5.36 0-2.81-2.02-4.77-4.9-4.77-3.34 0-5.3 2.5-5.3 5.09 0 1 .39 2.08.88 2.68.1.12.11.23.08.35-.09.37-.28 1.14-.32 1.29-.05.23-.18.28-.41.17-1.51-.7-2.45-2.91-2.45-4.68 0-3.81 2.77-7.31 7.99-7.31 4.19 0 7.45 2.99 7.45 6.98 0 4.17-2.63 7.52-6.27 7.52-1.22 0-2.37-.64-2.77-1.39l-.75 2.87c-.27 1.04-1.01 2.34-1.51 3.13C9.05 23.67 10.48 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
    </svg>
  );
}

export function RenderSocialIcon({ platform, className, size = 20, style }: { platform: string, className?: string, size?: number, style?: React.CSSProperties }) {
  const iconProps = { className, size, style };
  switch (platform.toLowerCase()) {
    case 'facebook': return <Facebook {...iconProps} />;
    case 'youtube': return <Youtube {...iconProps} />;
    case 'github': return <Github {...iconProps} />;
    case 'instagram': return <Instagram {...iconProps} />;
    case 'twitter': return <Twitter {...iconProps} />;
    case 'whatsapp': return <WhatsappIcon className={className} size={size} />;
    case 'telegram': return <TelegramIcon className={className} size={size} />;
    case 'tiktok': return <TiktokIcon className={className} size={size} />;
    case 'snapchat': return <SnapchatIcon className={className} size={size} />;
    case 'reddit': return <RedditIcon className={className} size={size} />;
    case 'behance': return <BehanceIcon className={className} size={size} />;
    case 'skype': return <SkypeIcon className={className} size={size} />;
    case 'pinterest': return <PinterestIcon className={className} size={size} />;
    case 'linkedin': return <Linkedin {...iconProps} />;
    case 'discord': return <MessageSquare {...iconProps} />;
    case 'messagesquare': return <MessageSquare {...iconProps} />;
    case 'megaphone': return <Megaphone {...iconProps} />;
    case 'activity': return <Activity {...iconProps} />;
    case 'shield': return <Shield {...iconProps} />;
    case 'users': return <Users {...iconProps} />;
    case 'checkcircle': return <CheckCircle {...iconProps} />;
    case 'lock': return <Lock {...iconProps} />;
    case 'search': return <Search {...iconProps} />;
    case 'palette': return <Palette {...iconProps} />;
    case 'share': return <Share2 {...iconProps} />;
    case 'globe': return <Globe {...iconProps} />;
    case 'mail': return <Mail {...iconProps} />;
    default: return <ExternalLink {...iconProps} />;
  }
}

function ExternalLink(props: any) {
    return <Globe {...props} />;
}

export function GlassSocialIcon({ platform, className }: { platform: string, className?: string }) {
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

export function SocialButton({ platform, url }: { platform: string, url: string }) {
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


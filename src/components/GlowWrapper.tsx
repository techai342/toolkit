import React from 'react';

export const GlowWrapper = ({ 
  children, 
  enabled, 
  combo, 
  roundedClass = 'rounded-full', 
  className = "",
  onClick
}: { 
  key?: React.Key,
  children: React.ReactNode, 
  enabled?: boolean, 
  combo?: string, 
  roundedClass?: string, 
  className?: string,
  onClick?: (e: React.MouseEvent) => void
}) => {
  if (!enabled || !combo || combo === 'none') {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }
  return (
    <div className={`relative p-[2.5px] ${roundedClass} overflow-hidden group ${className}`} onClick={onClick}>
      <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite]">
         {combo === 'rgb' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_10%,#ef4444_30%,#22c55e_50%,#3b82f6_70%,transparent_90%)]" />}
         {combo === 'fire' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#f97316_40%,#eab308_60%,transparent_80%)]" />}
         {combo === 'ocean' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#0ea5e9_40%,#3b82f6_60%,transparent_80%)]" />}
         {combo === 'purple_cyan' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#a855f7_40%,#06b6d4_60%,transparent_80%)]" />}
         {combo === 'toxic' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#84cc16_40%,#bef264_60%,transparent_80%)]" />}
         {combo === 'royal' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#eab308_40%,#a855f7_60%,transparent_80%)]" />}
         {combo === 'sakura' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_20%,#f472b6_40%,#fdf2f8_60%,transparent_80%)]" />}
         {combo === 'sunset' && <div className="w-full h-full bg-[conic-gradient(from_0deg,transparent_10%,#ef4444_30%,#f97316_50%,#a855f7_70%,transparent_90%)]" />}
      </div>
      <div className={`relative w-full h-full bg-[#0A0F1E] ${roundedClass} flex items-center justify-center overflow-hidden z-10`}>
        {children}
      </div>
    </div>
  );
};

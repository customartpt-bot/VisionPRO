
import React, { useEffect, useState } from 'react';

interface IntroPageProps {
  onFinish: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [statusText, setStatusText] = useState('BOOTING_SYSTEM');
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    const statuses = [
      'INITIALIZING_CORE',
      'SYNCING_NEURAL_MAPS',
      'LOAD_TACTICAL_ASSETS',
      'VISION_PRO_READY'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) {
        setStatusText(statuses[i]);
        i++;
      }
    }, 800);

    const exitTimer = setTimeout(() => setIsExiting(true), 4000);
    const finishTimer = setTimeout(onFinish, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-[1200ms] ${isExiting ? 'opacity-0 scale-110 blur-xl' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.1)_0%,transparent_70%)] opacity-50"></div>
      <div className="absolute inset-0 hud-grid opacity-10"></div>
      
      <div className="relative w-full max-w-2xl px-4 flex flex-col items-center">
        
        {/* GIF Container - Centered and Fully Visible */}
        <div className="relative w-full max-w-xs aspect-square flex items-center justify-center overflow-visible">
          
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/main/_MConverter.eu_1000017191.gif" 
            alt="VisionPRO AI Loading" 
            className={`w-full h-full object-contain relative z-20 transition-all duration-1000 ${logoLoaded ? 'opacity-100 scale-125 brightness-110' : 'opacity-0 scale-90'}`}
            onLoad={() => setLogoLoaded(true)}
            onError={(e) => {
              console.error("Erro ao carregar o logo animado");
              e.currentTarget.src = "https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png";
              setLogoLoaded(true);
            }}
          />

          {/* Tactical Brackets with Glow */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-orange-500/50 rounded-tl-3xl shadow-[-5px_-5px_20px_rgba(249,115,22,0.1)] z-30"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-orange-500/50 rounded-br-3xl shadow-[5px_5px_20px_rgba(249,115,22,0.1)] z-30"></div>
          
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 bg-orange-600/5 blur-[100px] rounded-full z-10"></div>
        </div>

        {/* Terminal Status */}
        <div className={`mt-16 mono flex flex-col items-center transition-all duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_12px_#f97316]"></div>
            <span className="text-[10px] text-orange-500 font-black tracking-[0.6em] uppercase">
              {statusText}
            </span>
          </div>
          <div className="w-72 h-[2px] bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <div className="h-full bg-orange-600 animate-[loading_4s_linear_infinite]" style={{ width: '100%' }}></div>
          </div>
          <span className="mt-8 text-[8px] text-zinc-500 uppercase tracking-[0.4em] font-black opacity-40">
            SYSTEMS_AUTH_V3 // CUSTOMART_PRO_TAC
          </span>
        </div>
      </div>

      {/* Heavy Vignette for focus */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default IntroPage;


import React, { useEffect, useState } from 'react';

interface IntroPageProps {
  onFinish: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [statusText, setStatusText] = useState('BOOTING_SYSTEM');

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]"></div>
      <div className="absolute inset-0 hud-grid opacity-10"></div>
      
      <div className="relative w-full max-w-2xl px-4 flex flex-col items-center">
        
        {/* GIF Container - Centered and Fully Visible */}
        <div className="relative w-full max-w-sm aspect-square flex items-center justify-center">
          {/* Suave vinheta interna para foco, sem esconder o centro */}
          <div className="absolute inset-0 z-10 pointer-events-none" 
               style={{
                 background: 'radial-gradient(circle, transparent 50%, black 110%)'
               }}>
          </div>
          
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/main/_MConverter.eu_1000017191.gif" 
            alt="VisionPRO AI Loading" 
            className="w-full h-full object-contain relative z-0 opacity-100 scale-110"
            onError={(e) => {
              console.error("Erro ao carregar o logo animado");
              e.currentTarget.src = "https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png";
            }}
          />

          {/* Tactical Brackets */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-orange-500/40 rounded-tl-2xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-orange-500/40 rounded-br-2xl"></div>
        </div>

        {/* Terminal Status */}
        <div className={`mt-12 mono flex flex-col items-center transition-all duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_10px_#f97316]"></div>
            <span className="text-xs text-orange-500 font-black tracking-[0.5em] uppercase">
              {statusText}
            </span>
          </div>
          <div className="w-64 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600 animate-[loading_4s_linear_infinite]" style={{ width: '100%' }}></div>
          </div>
          <span className="mt-6 text-[8px] text-zinc-500 uppercase tracking-[0.3em] font-bold">
            © CUSTOMART PRO SERIES // VISION_ENGINE_V3
          </span>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]"></div>
    </div>
  );
};

export default IntroPage;

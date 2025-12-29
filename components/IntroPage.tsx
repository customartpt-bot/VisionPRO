
import React, { useEffect, useState } from 'react';

interface IntroPageProps {
  onFinish: () => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onFinish }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [statusText, setStatusText] = useState('BOOTING_SYSTEM');
  const [logoReady, setLogoReady] = useState(false);

  useEffect(() => {
    const statuses = [
      'INITIALIZING_AI_CORE',
      'SYNCING_TACTICAL_DATA',
      'VISION_PRO_ACTIVE'
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) {
        setStatusText(statuses[i]);
        i++;
      }
    }, 1000);

    const exitTimer = setTimeout(() => setIsExiting(true), 3500);
    const finishTimer = setTimeout(onFinish, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center transition-all duration-1000 ${isExiting ? 'opacity-0 scale-105' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.08)_0%,transparent_70%)]"></div>
      
      <div className="relative flex flex-col items-center">
        
        {/* GIF Container - Optimized Visibility */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/main/_MConverter.eu_1000017191.gif" 
            alt="VisionPRO AI" 
            className={`w-full h-full object-contain transition-all duration-1000 ${logoReady ? 'opacity-100 scale-125' : 'opacity-0 scale-90'}`}
            onLoad={() => setLogoReady(true)}
            onError={(e) => {
              e.currentTarget.src = "https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png";
              setLogoReady(true);
            }}
          />

          {/* Brackets */}
          <div className="absolute inset-0 border border-orange-500/20 rounded-full scale-110 animate-pulse"></div>
        </div>

        {/* Terminal Info */}
        <div className="mt-12 text-center mono">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
            <span className="text-[10px] text-orange-500 font-black tracking-[0.5em] uppercase">
              {statusText}
            </span>
          </div>
          <div className="w-48 h-[1px] bg-zinc-800 mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-orange-600 animate-[loading_3s_infinite]"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-12 text-[8px] text-zinc-600 uppercase tracking-[0.4em] font-black">
        CustomART PRO // AI_ENGINE_V3
      </div>
    </div>
  );
};

export default IntroPage;

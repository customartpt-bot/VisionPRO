
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

    const exitTimer = setTimeout(() => setIsExiting(true), 5500);
    const finishTimer = setTimeout(onFinish, 6500);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center transition-all duration-[1500ms] ${isExiting ? 'opacity-0 scale-125' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.15)_0%,transparent_70%)]"></div>
      
      <div className="relative flex flex-col items-center max-w-full px-6">
        
        {/* GIF Container - Novo Visual v2 */}
        <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] flex items-center justify-center overflow-hidden rounded-3xl border border-white/5 shadow-[0_0_120px_rgba(249,115,22,0.2)] bg-black/40">
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/main/1000017198.gif" 
            alt="VisionPRO AI Tactical Boot" 
            className={`w-full h-full object-contain transition-all duration-1000 ${logoReady ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
            onLoad={() => setLogoReady(true)}
            onError={(e) => {
              e.currentTarget.src = "https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png";
              setLogoReady(true);
            }}
          />

          {/* Radar Scanning Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/5 to-transparent h-1/4 animate-[scan_3s_infinite] pointer-events-none"></div>
        </div>

        {/* Terminal Info */}
        <div className="mt-16 text-center mono w-full">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping"></div>
            <span className="text-[11px] text-orange-500 font-black tracking-[0.6em] uppercase">
              {statusText}
            </span>
          </div>
          <div className="w-64 h-[2px] bg-zinc-900 mx-auto relative overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-600 to-transparent animate-[loading_2.5s_infinite]"></div>
          </div>
          <p className="text-[8px] text-zinc-700 mt-6 font-bold uppercase tracking-[0.8em] opacity-40">Connecting_Secure_Protocol_v4.2</p>
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] text-zinc-500 uppercase tracking-[0.6em] font-black mono">
        VISION_PRO // ENGINE_UPGRADE_ACTIVE
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
      `}</style>
    </div>
  );
};

export default IntroPage;

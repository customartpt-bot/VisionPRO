
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
    }, 1000);

    const exitTimer = setTimeout(() => setIsExiting(true), 4500);
    const finishTimer = setTimeout(onFinish, 5500);

    return () => {
      clearInterval(interval);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center overflow-hidden transition-all duration-[1500ms] ${isExiting ? 'opacity-0 scale-110 blur-xl' : 'opacity-100'}`}>
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.05)_0%,transparent_70%)]"></div>
      
      <div className="relative w-full max-w-2xl px-4 flex flex-col items-center">
        
        {/* GIF Container with Advanced Masking - Reduced size to half */}
        <div className="relative w-full aspect-square md:aspect-video flex items-center justify-center group">
          {/* Múltiplas camadas de máscara radial para suavizar bordas */}
          <div className="absolute inset-0 z-10 pointer-events-none" 
               style={{
                 background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 70%, black 90%)'
               }}>
          </div>
          
          <img 
            src="https://github.com/customartpt-bot/fcbfotos/blob/main/_MConverter.eu_1000017191.gif?raw=true" 
            alt="VisionPRO Intro" 
            className="w-1/2 h-1/2 object-contain mix-blend-lighten opacity-80"
          />

          {/* HUD Brackets - Adjusted for smaller size */}
          <div className="absolute top-1/4 left-1/4 w-12 h-12 border-t border-l border-orange-500/20 rounded-tl-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-12 h-12 border-b border-r border-orange-500/20 rounded-br-2xl"></div>
        </div>

        {/* Terminal Status */}
        <div className={`mt-8 mono flex flex-col items-center transition-all duration-700 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-orange-500 font-bold tracking-[0.4em] uppercase">
              {statusText}
            </span>
          </div>
          <div className="w-48 h-[1px] bg-zinc-900 rounded-full overflow-hidden">
            <div className="h-full bg-orange-600/50 animate-[loading_5s_linear_infinite]" style={{ width: '100%' }}></div>
          </div>
          <span className="mt-4 text-[7px] text-zinc-600 uppercase tracking-widest font-bold">
            © CUSTOMART PRO SERIES // V3.0.4
          </span>
        </div>
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
    </div>
  );
};

export default IntroPage;

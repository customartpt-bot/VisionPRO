
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [engineStatus, setEngineStatus] = useState<'READY' | 'OFFLINE' | 'SYNCING'>('SYNCING');

  const checkStatus = async () => {
    // Uso de as any para evitar conflitos de tipos globais durante a transpilação
    const aistudio = (window as any).aistudio;
    const hasEnvKey = !!process.env.API_KEY;

    if (hasEnvKey) {
      setEngineStatus('READY');
      return;
    }

    if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
      try {
        const hasKey = await aistudio.hasSelectedApiKey();
        setEngineStatus(hasKey ? 'READY' : 'OFFLINE');
      } catch (e) {
        setEngineStatus('OFFLINE');
      }
    } else {
      setEngineStatus('OFFLINE');
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      await aistudio.openSelectKey();
      setEngineStatus('READY');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-xl border-b border-orange-500/30 px-8 py-4 flex items-center justify-between shadow-2xl">
      <div className="flex items-center gap-12">
        <div className="relative group">
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
            className="h-10 md:h-12 w-auto object-contain transition-transform group-hover:scale-105" 
            style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' }}
            alt="VisionPRO" 
          />
        </div>

        <nav className="hidden lg:flex items-center gap-4">
           <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-lg border border-white/5">
              <div className={`w-1.5 h-1.5 rounded-full ${engineStatus === 'READY' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mono">
                ENGINE_{engineStatus}
              </span>
              {engineStatus === 'OFFLINE' && (
                <button 
                  onClick={handleSync}
                  className="ml-2 text-[8px] text-orange-500 font-black hover:text-orange-400 transition-colors border-b border-orange-500/20"
                >
                  [SYNC_LINK]
                </button>
              )}
           </div>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-6">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Analista Pro</span>
          <span className="text-[7px] text-orange-500 font-bold uppercase tracking-widest">Sessão Ativa</span>
        </div>
        
        <div className="flex items-center gap-3 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img src="https://picsum.photos/seed/vision/100/100" className="w-full h-full object-cover" alt="User" />
          </div>
          <div className="pr-2 hidden xl:block">
            <p className="text-[10px] font-bold text-white leading-none">Alpha_Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

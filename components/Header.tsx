
import React, { useState, useEffect } from 'react';

interface HeaderProps {
  viewState: 'auth' | 'hub' | 'setup' | 'analysis' | 'ai_report_view';
  matchData?: {
    homeTeam: { name: string };
    awayTeam: { name: string };
  };
  score?: {
    home: number;
    away: number;
  };
  onSave?: () => void;
  onGoToHub?: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewState, matchData, score, onSave, onGoToHub }) => {
  const [engineStatus, setEngineStatus] = useState<'READY' | 'OFFLINE' | 'SYNCING'>('SYNCING');

  const checkStatus = async () => {
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
    <header className="sticky top-0 z-50 w-full bg-black/95 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between shadow-2xl h-20">
      <div className="flex items-center gap-8 min-w-[200px]">
        <div className="relative group cursor-pointer" onClick={onGoToHub}>
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105" 
            style={{ filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.4))' }}
            alt="VisionPRO" 
          />
        </div>
        
        {viewState !== 'analysis' && (
          <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-white/5">
            <div className={`w-1 h-1 rounded-full ${engineStatus === 'READY' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mono">
              SYS_{engineStatus}
            </span>
          </div>
        )}
      </div>

      {/* Barreirense vs Beja Score Bar Integration */}
      {viewState === 'analysis' && matchData && score && (
        <div className="flex-1 flex items-center justify-center gap-12 animate-in slide-in-from-top-2 duration-500">
          <div className="text-right">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">CASA</p>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">{matchData.homeTeam.name}</h3>
          </div>

          <div className="bg-orange-600 text-white px-6 py-2 rounded-xl text-2xl font-black shadow-[0_0_20px_rgba(249,115,22,0.3)] min-w-[100px] text-center">
            {score.home} - {score.away}
          </div>

          <div className="text-left">
            <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">FORA</p>
            <h3 className="text-xl font-black text-orange-500 tracking-tight uppercase">{matchData.awayTeam.name}</h3>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 min-w-[300px] justify-end">
        {viewState === 'analysis' ? (
          <div className="flex items-center gap-2">
            <button 
              onClick={onSave}
              className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <i className="fas fa-save text-orange-500"></i>
              GRAVAR PROTOCOLO
            </button>
            <button 
              onClick={onGoToHub}
              className="px-5 py-2.5 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
            >
              HUB
            </button>
          </div>
        ) : (
          <>
            <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-4">
              <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Analista_Pro</span>
              <span className="text-[7px] text-orange-500 font-bold uppercase tracking-widest">Auth_Active</span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
              <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/5">
                <img src="https://picsum.photos/seed/vision/100/100" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" alt="User" />
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

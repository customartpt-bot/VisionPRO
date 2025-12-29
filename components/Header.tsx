
import React from 'react';

const Header: React.FC = () => {
  const isEngineActive = !!process.env.API_KEY || (typeof window !== 'undefined' && (window as any).aistudio);

  return (
    <header className="sticky top-0 z-50 w-full bg-[#05070a]/95 backdrop-blur-xl border-b border-orange-500/30 px-8 py-4 flex items-center justify-between overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.9)]">
      <div className="absolute left-0 top-0 w-80 h-full bg-orange-600/10 blur-[100px] -z-10 rounded-full"></div>
      
      <div className="flex items-center gap-12">
        <div className="relative group flex items-center">
          <img 
            src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
            className="h-10 md:h-12 w-auto object-contain transition-all duration-500 group-hover:scale-[1.05]" 
            style={{ 
              filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 1)) drop-shadow(0px 0px 8px rgba(249, 115, 22, 0.4))' 
            }}
            alt="VisionPRO Logo" 
          />
        </div>

        <nav className="hidden lg:flex items-center gap-8">
           <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isEngineActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mono">
                {isEngineActive ? 'ENGINE_READY' : 'ENGINE_OFFLINE'}
              </span>
           </div>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-6">
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Analista Pro</span>
          <span className="text-[7px] text-orange-500 font-bold uppercase tracking-widest">Sessão de Análise Ativa</span>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900/80 p-1 rounded-xl border border-white/10 shadow-2xl">
          <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/20">
            <img src="https://picsum.photos/seed/tactical-vision-pro/100/100" className="w-full h-full object-cover" alt="User" />
          </div>
          <div className="pr-2 hidden xl:block">
            <p className="text-[8px] font-black text-slate-500 uppercase leading-none mb-0.5">Unidade</p>
            <p className="text-[10px] font-bold text-white leading-none tracking-tight">Alpha_Analyst</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

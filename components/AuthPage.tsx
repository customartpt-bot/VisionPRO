
import React, { useState, useEffect } from 'react';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    // Autorização instantânea conforme solicitado
    setTimeout(() => {
      onLogin();
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-[90] flex items-center justify-center p-6 bg-[#000000] transition-all duration-[1200ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background HUD Grid */}
      <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[180px] rounded-full pointer-events-none"></div>
      
      <div className={`glass-card w-full max-w-md rounded-3xl p-10 md:p-12 relative overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-90'}`}>
        <div className="scanline-effect"></div>
        
        <div className="flex flex-col items-center mb-12 relative z-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
            <img 
              src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
              className="h-12 md:h-14 w-auto relative z-10" 
              alt="Logo" 
            />
          </div>
          <h1 className="text-white text-lg font-black uppercase tracking-[0.3em] text-center">Protocol Access</h1>
          <div className="h-0.5 w-10 bg-orange-600 mt-2 rounded-full"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest ml-1 mono">Unit_Identity</label>
            <input 
              type="text" 
              placeholder="ANALYST_ALPHA" 
              className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl py-4 px-6 text-white placeholder:text-zinc-700 focus:outline-none focus:border-orange-500/40 focus:ring-1 focus:ring-orange-500/10 transition-all text-[11px] font-bold mono"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="group w-full bg-zinc-900 border border-white/5 hover:border-orange-500/50 text-white font-black uppercase tracking-[0.3em] py-5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 overflow-hidden relative"
          >
            <div className={`absolute inset-0 bg-orange-600 transition-transform duration-500 ${loading ? 'translate-x-0' : '-translate-x-full'} group-hover:translate-x-0 opacity-100`}></div>
            <span className="relative z-10 text-[10px] py-1 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <i className="fas fa-sync-alt animate-spin text-white"></i>
                  AUTORIZANDO...
                </>
              ) : (
                <>
                  <i className="fas fa-shield-halved text-orange-500 group-hover:text-white transition-colors"></i>
                  Entrar no Sistema
                </>
              )}
            </span>
          </button>
          
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => handleLogin()}
              className="text-[9px] font-bold text-zinc-600 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors mono group"
            >
              <span className="opacity-40 group-hover:opacity-100">[</span> 
              BYPASS_AUTH_REQUEST
              <span className="opacity-40 group-hover:opacity-100">]</span>
            </button>
          </div>
        </form>

        <div className="mt-12 pt-6 border-t border-white/5 flex justify-between items-center opacity-40 mono">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">AI_CORE: ONLINE</span>
          </div>
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">V3.0.4_STABLE</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthPageProps {
  onLogin: (role: UserRole) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('analista');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    // Simulating authentication delay
    setTimeout(() => {
      onLogin(selectedRole);
    }, 800);
  };

  return (
    <div className={`fixed inset-0 z-[90] flex items-center justify-center p-6 bg-[#000000] transition-all duration-[1200ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background HUD Grid */}
      <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-600/5 blur-[180px] rounded-full pointer-events-none"></div>
      
      <div className={`glass-card w-full max-w-md rounded-3xl p-10 md:p-12 relative overflow-hidden transition-all duration-1000 transform ${isVisible ? 'translate-y-0 scale-100' : 'translate-y-12 scale-90'}`}>
        <div className="scanline-effect"></div>
        
        <div className="flex flex-col items-center mb-10 relative z-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-orange-500/20 blur-2xl rounded-full"></div>
            <img 
              src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
              className="h-12 md:h-14 w-auto relative z-10" 
              alt="Logo" 
            />
          </div>
          <h1 className="text-white text-lg font-black uppercase tracking-[0.3em] text-center">Acesso ao Sistema</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-8 relative z-10">
          <div className="space-y-4">
            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1 mono">Perfil_de_Analista</label>
            <div className="grid grid-cols-1 gap-2">
              {(['admin', 'analista', 'jogo'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`w-full py-4 px-6 rounded-xl border transition-all flex items-center justify-between group ${selectedRole === role ? 'bg-orange-600/10 border-orange-500 text-white' : 'bg-zinc-950/50 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fas ${role === 'admin' ? 'fa-user-shield' : role === 'analista' ? 'fa-user-pen' : 'fa-users-viewfinder'} text-xs ${selectedRole === role ? 'text-orange-500' : 'text-zinc-700'}`}></i>
                    <span className="text-[10px] font-black uppercase tracking-widest">{role === 'jogo' ? 'Visualizador (Live)' : role}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full border-2 ${selectedRole === role ? 'bg-orange-500 border-white shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'border-zinc-800 group-hover:border-zinc-700'}`}></div>
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="group w-full bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-[0.3em] py-5 rounded-xl transition-all shadow-2xl shadow-orange-600/20 active:scale-[0.98] relative overflow-hidden"
          >
            <span className="relative z-10 text-[10px] flex items-center justify-center gap-3">
              {loading ? 'AUTORIZANDO...' : 'INICIAR SESSÃO'}
            </span>
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center opacity-30 mono">
          <span className="text-[8px] font-bold text-zinc-400 uppercase">User: customart.pt@gmail.com</span>
          <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">SECURED BY SUPABASE</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

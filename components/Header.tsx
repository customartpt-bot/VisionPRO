
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center shadow-lg transform rotate-45 border border-white/20">
          <i className="fas fa-shield-halved text-white -rotate-45 text-xl"></i>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tighter flex items-center">
            <span className="text-white">Vision</span>
            <span className="gradient-text-orange ml-0.5">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">AI Video Analyst</p>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Analysis History</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Live Scouting</a>
        <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Tactical Boards</a>
      </nav>

      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-400 hover:text-white transition-colors">
          <i className="fas fa-bell"></i>
        </button>
        <div className="w-9 h-9 rounded-full border-2 border-orange-500/50 p-0.5">
          <img src="https://picsum.photos/seed/user/100/100" className="w-full h-full rounded-full object-cover" alt="User Profile" />
        </div>
      </div>
    </header>
  );
};

export default Header;

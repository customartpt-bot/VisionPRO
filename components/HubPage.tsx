
import React from 'react';
import { ManualMatchAnalysis, UserRole } from '../types';

interface HubPageProps {
  history: ManualMatchAnalysis[];
  userRole: UserRole;
  onAddNew: () => void;
  onSelectAnalysis: (analysis: ManualMatchAnalysis) => void;
  onDelete: (id: string) => void;
}

const HubPage: React.FC<HubPageProps> = ({ history, userRole, onAddNew, onSelectAnalysis, onDelete }) => {
  const canWrite = userRole === 'admin' || userRole === 'analista';
  const canDelete = userRole === 'admin';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Tactical Hub</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mono">Gestão de Inteligência de Jogo</span>
            <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[8px] font-black rounded uppercase tracking-widest">{userRole}</span>
          </div>
        </div>
        
        {canWrite && (
          <button 
            onClick={onAddNew}
            className="group relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl transition-all shadow-2xl shadow-orange-600/20 active:scale-95 overflow-hidden"
          >
            <div className="relative z-10 flex items-center gap-3">
              <i className="fas fa-plus text-sm"></i>
              <span className="text-xs font-black uppercase tracking-widest">Nova Análise</span>
            </div>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {canWrite && (
          <div 
            onClick={onAddNew}
            className="group border-2 border-dashed border-zinc-800 rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all min-h-[160px] bg-zinc-950/20"
          >
            <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-white/5 shadow-inner">
              <i className="fas fa-folder-plus text-zinc-700 group-hover:text-orange-500 text-sm"></i>
            </div>
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">Criar Novo Registo</span>
            <span className="text-[7px] text-zinc-800 uppercase font-bold mt-1 tracking-tighter">Sincronização Cloud Ativa</span>
          </div>
        )}

        {history.map((item) => (
          <div 
            key={item.id}
            className="glass-card rounded-3xl p-6 border border-white/5 hover:border-orange-500/30 transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-orange-500 bg-orange-500/10 px-2 py-1 rounded uppercase w-fit">{item.date} {item.time}</span>
                <span className="text-[8px] font-bold text-zinc-600 uppercase mono tracking-tighter">{item.location}</span>
              </div>
              {canDelete && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                  className="text-zinc-700 hover:text-red-500 transition-colors p-2"
                >
                  <i className="fas fa-trash-can text-xs"></i>
                </button>
              )}
            </div>

            <div onClick={() => onSelectAnalysis(item)} className="cursor-pointer">
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-white uppercase tracking-tight truncate max-w-[100px]">{item.homeTeam.name}</span>
                  <span className="text-zinc-600 text-[10px] font-bold px-2">vs</span>
                  <span className="text-sm font-black text-white uppercase tracking-tight text-right truncate max-w-[100px]">{item.awayTeam.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-orange-600" style={{ width: `${Math.min(item.events.length, 100)}%` }}></div>
                  </div>
                  <span className="text-[8px] font-black text-zinc-500 uppercase mono">{item.events.length} EVTS</span>
                </div>
              </div>
              <button className="w-full py-3 bg-zinc-950 group-hover:bg-white group-hover:text-black rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                {userRole === 'jogo' ? 'Visualizar Estatísticas' : 'Abrir Relatório'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HubPage;

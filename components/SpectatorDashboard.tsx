
import React from 'react';
import { ManualMatchAnalysis, ActionType } from '../types';
import StatsCard from './StatsCard';

interface SpectatorDashboardProps {
  matchData: ManualMatchAnalysis;
  currentTime: number;
}

const SpectatorDashboard: React.FC<SpectatorDashboardProps> = ({ matchData, currentTime }) => {
  const getStats = (team: 'home' | 'away', type: ActionType) => 
    matchData.events.filter(e => e.team === team && e.type === type).length;
  
  const getCombinedStats = (team: 'home' | 'away', types: ActionType[]) => 
    matchData.events.filter(e => e.team === team && types.includes(e.type)).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculatePossessionPerc = () => {
    const total = matchData.possessionTimeHome + matchData.possessionTimeAway;
    if (total === 0) return { home: 50, away: 50 };
    return {
      home: Math.round((matchData.possessionTimeHome / total) * 100),
      away: Math.round((matchData.possessionTimeAway / total) * 100)
    };
  };

  const possessionPerc = calculatePossessionPerc();

  return (
    <div className="max-w-[1400px] mx-auto p-8 animate-in fade-in duration-1000">
      {/* Live Scoreboard Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-12 bg-zinc-950/80 p-10 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 hud-grid opacity-10 pointer-events-none"></div>
        
        <div className="text-center flex-1 z-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{matchData.homeTeam.name}</h2>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">EQUIPA DA CASA</span>
        </div>
        
        <div className="flex flex-col items-center gap-4 px-12 border-x border-white/5 z-10 my-8 md:my-0">
          <div className="text-8xl font-black text-white flex gap-8 items-center tabular-nums">
            <span>{getStats('home', 'goal')}</span>
            <span className="text-orange-600 text-5xl animate-pulse">:</span>
            <span>{getStats('away', 'goal')}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-orange-600/10 text-orange-500 px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-[0.2em] border border-orange-500/20 shadow-lg shadow-orange-600/10">
              TEMPO: {formatTime(currentTime)}
            </div>
            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest animate-pulse mt-2">
              ● TRANSMISSÃO EM DIRETO
            </span>
          </div>
        </div>

        <div className="text-center flex-1 z-10">
          <h2 className="text-4xl font-black text-orange-500 uppercase tracking-tighter mb-2">{matchData.awayTeam.name}</h2>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em]">EQUIPA VISITANTE</span>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatsCard label="Posse de Bola" homeValue={possessionPerc.home} awayValue={possessionPerc.away} icon="fa-clock" percentage />
        <StatsCard label="Passes Totais" homeValue={getStats('home', 'pass_certo') + getStats('home', 'pass_errado')} awayValue={getStats('away', 'pass_certo') + getStats('away', 'pass_errado')} icon="fa-shuffle" />
        <StatsCard label="Remates" homeValue={getCombinedStats('home', ['remate_certo', 'remate_fora'])} awayValue={getCombinedStats('away', ['remate_certo', 'remate_fora'])} icon="fa-bullseye" />
        <StatsCard label="Recuperações" homeValue={getStats('home', 'recuperacao')} awayValue={getStats('away', 'recuperacao')} icon="fa-shield-halved" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pass Efficiency Charts */}
        <div className="lg:col-span-2 glass-card rounded-3xl p-8 border border-white/5">
           <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
             <i className="fas fa-chart-bar text-orange-500"></i> Eficiência de Passe por Equipa
           </h3>
           <div className="space-y-12">
              {['home', 'away'].map((t) => {
                const team = t as 'home' | 'away';
                const certo = getStats(team, 'pass_certo');
                const errado = getStats(team, 'pass_errado');
                const total = certo + errado;
                const perc = total === 0 ? 0 : Math.round((certo / total) * 100);
                const teamName = team === 'home' ? matchData.homeTeam.name : matchData.awayTeam.name;
                
                return (
                  <div key={t} className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{team === 'home' ? 'CASA' : 'VISITANTE'}</span>
                        <span className="text-xl font-black text-white uppercase">{teamName}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-white mono">{perc}%</span>
                        <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{certo} / {total} PASSES</p>
                      </div>
                    </div>
                    <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <div 
                        className={`h-full transition-all duration-1000 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.2)] ${team === 'home' ? 'bg-zinc-100' : 'bg-orange-600'}`} 
                        style={{ width: `${perc}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
           </div>
        </div>

        {/* Live Match Log */}
        <div className="glass-card rounded-3xl p-8 border border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
              <i className="fas fa-history text-orange-500"></i> Log de Eventos
            </h3>
            <span className="text-[8px] font-bold text-zinc-600 uppercase mono">LIVE_FEED</span>
          </div>
          <div className="space-y-4 max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
            {matchData.events.length === 0 ? (
              <div className="text-center py-12 opacity-20">
                <i className="fas fa-satellite-dish text-4xl mb-4"></i>
                <p className="text-[10px] font-black uppercase tracking-widest">A aguardar início...</p>
              </div>
            ) : (
              matchData.events.slice().reverse().slice(0, 15).map((e) => (
                <div key={e.id} className="group p-4 bg-zinc-950/40 rounded-xl border border-white/5 flex justify-between items-center hover:bg-zinc-900 transition-all">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {e.type === 'goal' && <i className="fas fa-star text-yellow-500 text-[10px]"></i>}
                      <p className="text-[10px] font-black text-white uppercase tracking-tight">{e.description.split('|')[0]}</p>
                    </div>
                    <p className="text-[8px] text-zinc-500 uppercase font-bold tracking-widest">
                      <span className={e.team === 'home' ? 'text-zinc-400' : 'text-orange-500'}>
                        {e.team === 'home' ? matchData.homeTeam.name : matchData.awayTeam.name}
                      </span>
                      {e.playerName ? ` • ${e.playerName}` : ''}
                    </p>
                  </div>
                  <span className="text-[9px] font-black text-orange-500 mono bg-orange-600/5 px-2 py-1 rounded">
                    {formatTime(e.timestamp)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpectatorDashboard;

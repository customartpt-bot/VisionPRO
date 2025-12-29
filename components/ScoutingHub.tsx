
import React, { useState, useEffect } from 'react';
import { AnalysisData, PlayerStats } from '../types';
import { dbService } from '../services/dbService';

const ScoutingHub: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AnalysisData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const data = await dbService.searchAnalyses(searchQuery);
      setResults(data);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  // Extrair todos os jogadores únicos dos resultados
  const allPlayers: { player: PlayerStats, team: string }[] = [];
  results.forEach(analysis => {
    analysis.homeTeam.players.forEach(p => allPlayers.push({ player: p, team: analysis.homeTeam.name }));
    analysis.awayTeam.players.forEach(p => allPlayers.push({ player: p, team: analysis.awayTeam.name }));
  });

  const sortedPlayers = allPlayers.sort((a, b) => b.player.rating - a.player.rating);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="glass-card rounded-2xl p-8 border border-white/10 bg-gradient-to-br from-slate-900/60 to-slate-800/40">
        <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
          <i className="fas fa-magnifying-glass-chart text-orange-500"></i>
          Scouting Intelligence Hub
        </h2>
        <p className="text-slate-400 mb-8">Explore a base de dados de atletas analisados pela VisionPRO AI.</p>
        
        <div className="flex gap-4">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input 
              type="text" 
              placeholder="Pesquisar por equipa, jogador ou competição..."
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button 
            onClick={handleSearch}
            className="px-8 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
          >
            {isSearching ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-bolt"></i>}
            Filtrar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-star text-amber-500"></i>
            Top Prospects Identificados
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedPlayers.slice(0, 6).map((item, idx) => (
              <div key={idx} className="glass-card p-5 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-white/10 group-hover:bg-orange-500/10 transition-colors">
                      <span className="text-xl font-black text-white">{item.player.number}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">{item.player.name}</h4>
                      <p className="text-[10px] text-slate-500 uppercase font-black">{item.team} • {item.player.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-orange-500">{item.player.rating.toFixed(1)}</div>
                    <div className="text-[8px] text-slate-600 uppercase font-bold">Rating IA</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-950/40 p-2 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Passes</div>
                    <div className="text-xs font-bold text-slate-200">{item.player.passAccuracy}%</div>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">KM</div>
                    <div className="text-xs font-bold text-slate-200">{item.player.distanceCovered}</div>
                  </div>
                  <div className="bg-slate-950/40 p-2 rounded-lg text-center">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Sprint</div>
                    <div className="text-xs font-bold text-slate-200">{item.player.topSpeed}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <i className="fas fa-clock-rotate-left text-sky-500"></i>
            Atividade Recente
          </h3>
          <div className="space-y-3">
            {results.slice(0, 5).map((match, i) => (
              <div key={i} className="p-4 bg-slate-900/40 border border-white/5 rounded-xl hover:bg-slate-800/40 transition-all cursor-pointer">
                <div className="text-[10px] text-sky-500 font-bold mb-1 uppercase tracking-tighter">Match ID: {Math.random().toString(16).slice(2,8)}</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-white">{match.homeTeam.name} vs {match.awayTeam.name}</span>
                  <i className="fas fa-arrow-right text-[10px] text-slate-600"></i>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoutingHub;

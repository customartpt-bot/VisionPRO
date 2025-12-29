
import React from 'react';
import { AnalysisData } from '../types';
import StatsCard from './StatsCard';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell
} from 'recharts';

interface DashboardProps {
  data: AnalysisData | null;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (!data) return (
    <div className="h-full flex flex-col items-center justify-center text-slate-500 p-12 text-center">
      <div className="relative mb-8">
        <i className="fas fa-chart-line text-8xl opacity-10"></i>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-futbol text-4xl text-slate-800 animate-bounce"></i>
        </div>
      </div>
      <h3 className="text-2xl font-black text-white mb-2">Aguardando Recolha de Dados</h3>
      <p className="max-w-md text-slate-400">
        Carregue um vídeo ou selecione uma análise no histórico lateral para gerar insights automáticos da VisionPRO.
      </p>
      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 w-1/3"></div>
        </div>
        <div className="h-1 bg-slate-800 rounded-full"></div>
        <div className="h-1 bg-slate-800 rounded-full"></div>
      </div>
    </div>
  );

  const passingData = [
    { name: data.homeTeam.name, value: data.homeTeam.stats.passesCompleted, total: data.homeTeam.stats.passesTotal },
    { name: data.awayTeam.name, value: data.awayTeam.stats.passesCompleted, total: data.awayTeam.stats.passesTotal },
  ];

  const allPlayers = [...data.homeTeam.players, ...data.awayTeam.players].sort((a, b) => b.rating - a.rating);

  const handleShare = () => {
    const text = `Análise VisionPRO: ${data.homeTeam.name} vs ${data.awayTeam.name}. Posse: ${data.homeTeam.stats.possession}% - ${data.awayTeam.stats.possession}%`;
    alert("Link de partilha copiado para a área de transferência!\n\n" + text);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-2xl border border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Análise Ativa</span>
          </div>
          <h2 className="text-3xl font-black text-white">{data.homeTeam.name} <span className="text-slate-600 px-2 font-normal">VS</span> {data.awayTeam.name}</h2>
          <p className="text-slate-400 text-sm">Dashboard de Insights e Performance Coletiva</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleShare}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center gap-2"
          >
            <i className="fas fa-share-nodes text-sky-400"></i> Partilhar Insights
          </button>
          <button className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-400 hover:scale-105 rounded-xl text-sm font-black text-white shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2">
            <i className="fas fa-file-export"></i> Exportar PDF
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          label="Posse de Bola" 
          homeValue={data.homeTeam.stats.possession} 
          awayValue={data.awayTeam.stats.possession} 
          icon="fa-futbol" 
          percentage
        />
        <StatsCard 
          label="Precisão de Passe" 
          homeValue={Math.round((data.homeTeam.stats.passesCompleted / data.homeTeam.stats.passesTotal) * 100)} 
          awayValue={Math.round((data.awayTeam.stats.passesCompleted / data.awayTeam.stats.passesTotal) * 100)} 
          icon="fa-arrows-rotate" 
          percentage
        />
        <StatsCard 
          label="Remates Totais" 
          homeValue={data.homeTeam.stats.shotsTotal} 
          awayValue={data.awayTeam.stats.shotsTotal} 
          icon="fa-crosshairs" 
        />
        <StatsCard 
          label="No Alvo" 
          homeValue={data.homeTeam.stats.shotsOnTarget} 
          awayValue={data.awayTeam.stats.shotsOnTarget} 
          icon="fa-bullseye" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-chart-simple text-sky-400"></i>
            Volume de Passes e Eficácia
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passingData} layout="vertical" margin={{ left: 40, right: 40 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={100} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={24} fill="#334155" />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {passingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#0ea5e9' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-list-check text-orange-400"></i>
            Eventos Recolhidos
          </h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {data.highlights.map((h, i) => (
              <div key={i} className="group p-3 bg-slate-800/30 rounded-xl border border-white/5 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded uppercase">{h.type}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{h.timestamp}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/20">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <i className="fas fa-users-viewfinder text-sky-400"></i>
            Métricas Individuais (Recolha IA)
          </h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 mr-4">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{data.homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{data.awayTeam.name}</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-[10px] text-slate-400 font-black uppercase tracking-widest border-b border-white/5">
                <th className="px-6 py-4">Jogador</th>
                <th className="px-6 py-4 text-center">Pos</th>
                <th className="px-6 py-4 text-center">Distância</th>
                <th className="px-6 py-4 text-center">Passe %</th>
                <th className="px-6 py-4 text-center">Rating Vision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {allPlayers.map((p, idx) => {
                const isHome = data.homeTeam.players.some(hp => hp.id === p.id);
                return (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isHome ? 'bg-sky-500/10 text-sky-400 border border-sky-400/20' : 'bg-orange-500/10 text-orange-400 border border-orange-400/20'}`}>
                          {p.number}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{p.name}</div>
                          <div className="text-[10px] text-slate-500 uppercase">{isHome ? data.homeTeam.name : data.awayTeam.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-[10px] text-slate-300 font-bold px-2 py-0.5 bg-slate-800 rounded uppercase">{p.position}</span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-mono text-slate-400">{p.distanceCovered.toFixed(2)} km</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-white">{p.passAccuracy}%</span>
                        <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${p.passAccuracy}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border font-black ${p.rating >= 8 ? 'text-emerald-400 border-emerald-500/30' : 'text-orange-400 border-orange-500/30'}`}>
                        {p.rating.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

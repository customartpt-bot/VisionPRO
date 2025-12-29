
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
    <div className="h-full flex flex-col items-center justify-center text-zinc-800 p-12 text-center relative overflow-hidden">
      <div className="absolute inset-0 hud-grid opacity-[0.03] pointer-events-none"></div>
      
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <i className="fas fa-radar text-9xl opacity-[0.02]"></i>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-satellite-dish text-5xl text-zinc-900 animate-pulse"></i>
        </div>
      </div>
      
      <div className="relative z-10 space-y-4">
        <h3 className="text-2xl font-black text-zinc-800 uppercase tracking-[0.5em] mono">SYSTEM_IDLE</h3>
        <p className="max-w-md text-zinc-600 text-xs font-bold uppercase tracking-widest leading-relaxed">
          Waiting for visual input data. Feed the neural processor to begin extraction.
        </p>
        
        <div className="mt-12 flex items-center justify-center gap-6 opacity-20">
          <div className="w-16 h-[1px] bg-zinc-800"></div>
          <div className="flex gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
          </div>
          <div className="w-16 h-[1px] bg-zinc-800"></div>
        </div>
      </div>
    </div>
  );

  const passingData = [
    { name: data.homeTeam.name, value: data.homeTeam.stats.passesCompleted, total: data.homeTeam.stats.passesTotal },
    { name: data.awayTeam.name, value: data.awayTeam.stats.passesCompleted, total: data.awayTeam.stats.passesTotal },
  ];

  const allPlayers = [...data.homeTeam.players, ...data.awayTeam.players].sort((a, b) => b.rating - a.rating);

  const handleShare = () => {
    const text = `VisionPRO Session: ${data.homeTeam.name} vs ${data.awayTeam.name}`;
    alert("Encrypted share link copied: " + text);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-1000">
      {/* Overview Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-zinc-950/60 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-10">
           <i className="fas fa-microchip text-4xl"></i>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mono">DATALINK_ESTABLISHED</span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight flex items-baseline gap-4">
            {data.homeTeam.name} 
            <span className="text-zinc-800 font-normal italic text-2xl">vs</span> 
            {data.awayTeam.name}
          </h2>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-3 mono">DEEP_ANALYSIS_REPORT_V3.0</p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <button 
            onClick={handleShare}
            className="px-6 py-4 bg-zinc-900/50 hover:bg-black rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-800 transition-all flex items-center gap-3 text-white mono"
          >
            <i className="fas fa-terminal text-orange-600"></i> SHARE_OUTPUT
          </button>
          <button className="px-6 py-4 bg-orange-600 hover:bg-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-2xl transition-all flex items-center gap-3 active:scale-95">
            <i className="fas fa-file-invoice"></i> GEN_REPORT
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Ball_Possession" homeValue={data.homeTeam.stats.possession} awayValue={data.awayTeam.stats.possession} icon="fa-circle-notch" percentage />
        <StatsCard label="Pass_Efficiency" homeValue={Math.round((data.homeTeam.stats.passesCompleted / data.homeTeam.stats.passesTotal) * 100)} awayValue={Math.round((data.awayTeam.stats.passesCompleted / data.awayTeam.stats.passesTotal) * 100)} icon="fa-shuffle" percentage />
        <StatsCard label="Attack_Attempts" homeValue={data.homeTeam.stats.shotsTotal} awayValue={data.awayTeam.stats.shotsTotal} icon="fa-meteor" />
        <StatsCard label="Target_Impact" homeValue={data.homeTeam.stats.shotsOnTarget} awayValue={data.awayTeam.stats.shotsOnTarget} icon="fa-bullseye" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
               <i className="fas fa-chart-line text-orange-500"></i>
               FLOW_DYNAMICS
             </h3>
             <span className="text-[9px] text-zinc-600 font-bold uppercase mono">Unit: Passes_Completed</span>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={passingData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" stroke="#525252" fontSize={11} width={100} tick={{fontWeight: '800', fontFamily: 'JetBrains Mono'}} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #27272a', borderRadius: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="total" radius={[0, 6, 6, 0]} barSize={24} fill="#09090b" />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                  {passingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#ffffff' : '#f97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-8">
          <h3 className="text-xs font-black text-white mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
            <i className="fas fa-satellite text-orange-500"></i>
            TACTICAL_LOG
          </h3>
          <div className="space-y-5 max-h-[320px] overflow-y-auto pr-4 custom-scrollbar mono">
            {data.highlights.map((h, i) => (
              <div key={i} className="group p-4 bg-zinc-950/80 rounded-2xl border border-zinc-900 hover:border-orange-500/30 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1 h-full bg-zinc-900 group-hover:bg-orange-600 transition-colors"></div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black text-white bg-orange-600 px-2 py-0.5 rounded-sm uppercase tracking-widest">{h.type}</span>
                  <span className="text-[10px] text-zinc-600 font-bold">{h.timestamp}</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-bold uppercase tracking-tight">{h.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden border border-white/5">
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/60">
          <h3 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
            <i className="fas fa-users-viewfinder text-orange-500"></i>
            ATHLETE_TRAJECTORY_SYNC
          </h3>
          <div className="flex items-center gap-6 mono">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <span className="text-[9px] text-zinc-500 uppercase font-black">{data.homeTeam.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-600"></div>
              <span className="text-[9px] text-zinc-500 uppercase font-black">{data.awayTeam.name}</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left mono">
            <thead>
              <tr className="bg-zinc-950 text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em] border-b border-zinc-900">
                <th className="px-8 py-5">UNIT_DESIGNATION</th>
                <th className="px-8 py-5 text-center">POS</th>
                <th className="px-8 py-5 text-center">DISTANCE_KM</th>
                <th className="px-8 py-5 text-center">PRECISION</th>
                <th className="px-8 py-5 text-center">AI_RATING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {allPlayers.map((p, idx) => {
                const isHome = data.homeTeam.players.some(hp => hp.id === p.id);
                return (
                  <tr key={p.id} className="hover:bg-orange-600/[0.02] transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs border border-white/5 ${isHome ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-orange-500 border-orange-500/20'}`}>
                          {p.number}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white tracking-tight uppercase">{p.name}</div>
                          <div className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest">{isHome ? 'H_UNIT' : 'A_UNIT'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-[10px] text-zinc-500 font-black px-3 py-1 bg-zinc-950 border border-zinc-900 rounded-lg uppercase">{p.position}</span>
                    </td>
                    <td className="px-8 py-5 text-center text-xs font-bold text-zinc-400">{p.distanceCovered.toFixed(2)}</td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] font-black text-white">{p.passAccuracy}%</span>
                        <div className="w-16 h-1 bg-zinc-900 rounded-full overflow-hidden">
                          <div className={`h-full ${isHome ? 'bg-white' : 'bg-orange-600'}`} style={{ width: `${p.passAccuracy}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-950 border-2 font-black text-xs ${p.rating >= 8 ? 'text-emerald-400 border-emerald-950/50' : 'text-orange-500 border-zinc-900'}`}>
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

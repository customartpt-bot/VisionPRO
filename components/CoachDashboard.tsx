import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useParams } from 'react-router-dom';
import { Match, MatchEvent } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CoachDashboard: React.FC = () => {
  const { id } = useParams();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);

  useEffect(() => {
    if (!id) return;
    
    supabase.from('matches').select('*').eq('id', id).single().then(({ data }) => setMatch(data));
    supabase.from('match_events').select('*').eq('match_id', id).then(({ data }) => setEvents(data || []));

    const subscription = supabase
      .channel('public:match_events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, (payload) => {
         setEvents(prev => [...prev, payload.new as MatchEvent]);
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [id]);

  const data = [
    { name: 'Passes', Home: events.filter(e => e.team === 'home' && e.type === 'pass_success').length, Away: events.filter(e => e.team === 'away' && e.type === 'pass_success').length },
    { name: 'Remates', Home: events.filter(e => e.team === 'home' && e.type.includes('shot')).length, Away: events.filter(e => e.team === 'away' && e.type.includes('shot')).length },
    { name: 'Faltas', Home: events.filter(e => e.team === 'home' && e.type === 'foul_committed').length, Away: events.filter(e => e.team === 'away' && e.type === 'foul_committed').length },
  ];

  return (
    <div className="min-h-screen bg-dark-bg text-white p-6 font-sans">
      {/* Header Dashboard */}
      <div className="flex justify-between items-center mb-8 border-b border-dark-border pb-4 bg-dark-surface p-6 rounded-lg border">
         <div className="flex items-center gap-4">
            <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white border-l border-gray-700 pl-4">Live Dashboard</h1>
         </div>
         <div className="text-right">
             <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Resultado Atual</div>
             <div className="text-4xl font-mono font-bold text-brand">{match?.home_score} - {match?.away_score}</div>
             <div className="text-xs text-gray-500">{match?.home_team} vs {match?.away_team}</div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* Main Chart */}
         <div className="bg-dark-surface p-6 rounded-lg border border-dark-border shadow-lg">
           <h3 className="text-brand font-bold uppercase text-xs tracking-widest mb-6">Métricas de Performance</h3>
           <div className="h-80">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} fontWeight="bold" />
                  <YAxis stroke="#52525b" fontSize={12} />
                  <Tooltip 
                    cursor={{fill: '#27272a'}}
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#ff4d00', color: '#fff', borderRadius: '4px' }} 
                    itemStyle={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Home" fill="#ff4d00" name={match?.home_team || 'Home'} radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Away" fill="#3f3f46" name={match?.away_team || 'Away'} radius={[4, 4, 0, 0]} barSize={40} />
               </BarChart>
             </ResponsiveContainer>
           </div>
         </div>

         {/* Feed */}
         <div className="bg-dark-surface p-6 rounded-lg border border-dark-border shadow-lg flex flex-col">
            <h3 className="text-brand font-bold uppercase text-xs tracking-widest mb-6">Timeline de Jogo</h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar max-h-80">
               {events.slice().reverse().map(ev => (
                 <div key={ev.id} className="flex justify-between items-center bg-dark-bg p-3 rounded border border-dark-border hover:border-brand/30 transition">
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-brand font-bold text-sm bg-brand/10 px-2 py-1 rounded">{ev.match_minute}'</span>
                        <div>
                             <div className="font-bold text-sm uppercase text-white">{ev.type.replace('_', ' ')}</div>
                             <div className="text-[10px] text-gray-500 font-mono uppercase">{ev.team === 'home' ? match?.home_team : match?.away_team}</div>
                        </div>
                    </div>
                 </div>
               ))}
               {events.length === 0 && <div className="text-center text-gray-600 text-sm py-10">A aguardar eventos de jogo...</div>}
            </div>
         </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
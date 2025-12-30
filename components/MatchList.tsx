import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Match } from '../types';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Monitor, PlayCircle, Calendar, MapPin, Trophy } from 'lucide-react';

const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: false });
    
    if (data) setMatches(data);
    if (error) console.error('Error fetching matches:', error);
  };

  const deleteMatch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Confirmar eliminação de registo?')) {
      const { error } = await supabase.from('matches').delete().eq('id', id);
      if (!error) fetchMatches();
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('userRole');
      navigate('/');
  }

  return (
    <div className="min-h-screen bg-dark-bg p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-12 border-b border-dark-border pb-6">
          <div className="flex items-center gap-6">
             <img 
                src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" 
                alt="Logo" 
                className="h-12 object-contain"
             />
             <div className="h-8 w-px bg-dark-border"></div>
             <div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none">MATCH CENTER</h1>
                <p className="text-xs text-brand font-mono uppercase tracking-widest mt-1">Base de Dados de Análise</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            {role !== 'dashboard' && (
                <button
                onClick={() => navigate('/matches/new')}
                className="flex items-center gap-2 bg-dark-surface border border-dark-border hover:border-brand text-white px-4 py-2 rounded text-sm font-bold uppercase transition hover:text-brand"
                >
                <Plus size={16} /> Novo Jogo
                </button>
            )}
            <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white uppercase font-bold">Logout</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => navigate(role === 'dashboard' ? `/dashboard/${match.id}` : `/matches/${match.id}/console`)}
              className="bg-dark-surface border border-dark-border rounded-xl p-0 hover:border-brand cursor-pointer transition-all duration-300 group relative overflow-hidden"
            >
               {/* Status Indicator */}
               <div className={`absolute top-0 left-0 w-1 h-full ${match.status === 'live' ? 'bg-red-600' : 'bg-transparent group-hover:bg-brand'} transition-colors`}></div>

               <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                <Calendar size={12} />
                                <span>{new Date(match.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                                <Trophy size={12} />
                                <span className="uppercase">{match.competition || 'Competição'}</span>
                            </div>
                        </div>
                        {match.status === 'live' && (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center mb-6">
                        <div className="w-[45%]">
                            <h3 className="font-bold text-lg text-white leading-tight">{match.home_team}</h3>
                        </div>
                        <div className="text-sm font-mono text-gray-600 font-bold px-2">VS</div>
                        <div className="w-[45%] text-right">
                            <h3 className="font-bold text-lg text-white leading-tight">{match.away_team}</h3>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-dark-border mt-4">
                        <div className="text-2xl font-mono font-bold text-brand">
                            {match.home_score} - {match.away_score}
                        </div>
                        
                        <div className="flex gap-2">
                             {role !== 'dashboard' && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); navigate(`/matches/${match.id}/edit`); }}
                                    className="p-2 hover:bg-dark-bg rounded text-gray-500 hover:text-white transition"
                                    title="Editar"
                                >
                                    <span className="text-[10px] uppercase font-bold border border-gray-600 px-1 rounded">Edit</span>
                                </button>
                             )}
                             {role === 'admin' && (
                                <button 
                                    onClick={(e) => deleteMatch(match.id, e)}
                                    className="p-2 hover:bg-red-900/20 rounded text-gray-500 hover:text-red-500 transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                             )}
                        </div>
                    </div>
               </div>
               
               {/* Hover Action Strip */}
               <div className="bg-dark-bg p-3 flex justify-center items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 group-hover:text-brand transition-colors border-t border-dark-border">
                  {role === 'dashboard' ? (
                      <><Monitor size={14} /> Visualizar Dashboard</>
                  ) : (
                      <><PlayCircle size={14} /> Abrir Consola</>
                  )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchList;

import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { Match } from '../types';
import { Shield, Users } from 'lucide-react';

const MatchForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Default my_team_side to 'home'
  const [matchData, setMatchData] = useState<Partial<Match>>({
    home_team: '', away_team: '', my_team_side: 'home', date: '', time: '', location: '', competition: '', youtube_url: '', status: 'scheduled'
  });
  
  const [homePlayersText, setHomePlayersText] = useState('');
  const [awayPlayersText, setAwayPlayersText] = useState('');

  useEffect(() => {
    if (id) {
      loadMatch(id);
    }
  }, [id]);

  const loadMatch = async (matchId: string) => {
    const { data: match } = await supabase.from('matches').select('*').eq('id', matchId).single();
    if (match) {
        setMatchData(match);
        const { data: players } = await supabase.from('players').select('*').eq('match_id', matchId).order('number', { ascending: true });
        if (players) {
            setHomePlayersText(players.filter(p => p.team === 'home').map(p => `${p.number},${p.name}`).join('\n'));
            setAwayPlayersText(players.filter(p => p.team === 'away').map(p => `${p.number},${p.name}`).join('\n'));
        }
    }
  };

  const parsePlayers = (text: string, team: 'home' | 'away') => {
    return text.split('\n').filter(l => l.trim()).map((line, index) => {
      const [num, name] = line.split(',');
      return {
        number: parseInt(num?.trim() || '0'),
        name: name?.trim() || 'Unknown',
        team,
        is_starter: index < 11 // Os primeiros 11 são titulares
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let matchId = id;
    if (id) {
      await supabase.from('matches').update(matchData).eq('id', id);
    } else {
      const { data, error } = await supabase.from('matches').insert([matchData]).select().single();
      if (error) {
          alert('Error saving match: ' + error.message);
          setLoading(false);
          return;
      }
      matchId = data.id;
    }

    if (matchId) {
        // Apagar jogadores antigos e re-inserir (simples para edição)
        await supabase.from('players').delete().eq('match_id', matchId);
        const homePlayers = parsePlayers(homePlayersText, 'home').map(p => ({ ...p, match_id: matchId }));
        const awayPlayers = parsePlayers(awayPlayersText, 'away').map(p => ({ ...p, match_id: matchId }));
        
        const { error: pError } = await supabase.from('players').insert([...homePlayers, ...awayPlayers]);
        if(pError) console.error("Erro ao gravar jogadores", pError);
    }

    setLoading(false);
    navigate('/matches');
  };

  const inputClass = "w-full bg-dark-bg border border-dark-border text-white p-3 rounded focus:border-brand focus:outline-none transition-colors text-sm placeholder-gray-600";
  const labelClass = "block text-[10px] uppercase font-bold text-brand tracking-widest mb-2";

  return (
    <div className="min-h-screen bg-dark-bg p-8 text-gray-200 font-sans">
      <div className="max-w-4xl mx-auto bg-dark-surface p-8 rounded-xl border border-dark-border shadow-2xl">
        <div className="flex justify-between items-center mb-8 border-b border-dark-border pb-4">
            <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{id ? 'Editar Ficha de Jogo' : 'Criar Novo Jogo'}</h2>
            <div className="text-xs text-gray-500 font-mono">ID: {id || 'NEW'}</div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-6 relative">
            
            {/* Seletor de Minha Equipa */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 bg-dark-surface px-4 z-10 flex gap-4">
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="myTeam" 
                    checked={matchData.my_team_side === 'home'} 
                    onChange={() => setMatchData({...matchData, my_team_side: 'home'})}
                    className="accent-brand"
                  />
                  <span className={`text-[10px] font-bold uppercase ${matchData.my_team_side === 'home' ? 'text-brand' : 'text-gray-500'}`}>Somos a Casa</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="myTeam" 
                    checked={matchData.my_team_side === 'away'} 
                    onChange={() => setMatchData({...matchData, my_team_side: 'away'})}
                    className="accent-brand"
                  />
                  <span className={`text-[10px] font-bold uppercase ${matchData.my_team_side === 'away' ? 'text-brand' : 'text-gray-500'}`}>Somos Visitante</span>
               </label>
            </div>

            <div className={`p-4 rounded border-2 transition-colors ${matchData.my_team_side === 'home' ? 'border-brand/50 bg-brand/5' : 'border-dark-border'}`}>
               <label className={labelClass}>Equipa Casa</label>
               <input required className={inputClass} value={matchData.home_team} onChange={e => setMatchData({...matchData, home_team: e.target.value})} placeholder="Nome Equipa" />
            </div>
            <div className={`p-4 rounded border-2 transition-colors ${matchData.my_team_side === 'away' ? 'border-brand/50 bg-brand/5' : 'border-dark-border'}`}>
               <label className={labelClass}>Equipa Visitante</label>
               <input required className={inputClass} value={matchData.away_team} onChange={e => setMatchData({...matchData, away_team: e.target.value})} placeholder="Nome Equipa" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
             <div className="col-span-1">
               <label className={labelClass}>Data</label>
               <input type="date" required className={inputClass} value={matchData.date} onChange={e => setMatchData({...matchData, date: e.target.value})} />
            </div>
            <div className="col-span-1">
               <label className={labelClass}>Hora</label>
               <input type="time" required className={inputClass} value={matchData.time} onChange={e => setMatchData({...matchData, time: e.target.value})} />
            </div>
            <div className="col-span-1">
               <label className={labelClass}>Competição</label>
               <input className={inputClass} value={matchData.competition} onChange={e => setMatchData({...matchData, competition: e.target.value})} placeholder="Ex: Liga Portugal" />
            </div>
             <div className="col-span-1">
               <label className={labelClass}>Local</label>
               <input className={inputClass} value={matchData.location} onChange={e => setMatchData({...matchData, location: e.target.value})} placeholder="Estádio..." />
            </div>
          </div>

          <div>
             <label className={labelClass}>Fonte de Vídeo (YouTube)</label>
             <input className={inputClass} placeholder="https://youtube.com/..." value={matchData.youtube_url} onChange={e => setMatchData({...matchData, youtube_url: e.target.value})} />
             <p className="text-[10px] text-gray-500 mt-1">* Suporta links de live stream ou vídeos gravados.</p>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div>
                <label className={labelClass}>Plantel Casa <span className="text-gray-500 normal-case">(Inserir "nº, nome" • Primeiros 11 são Titulares)</span></label>
                <textarea 
                  className={`${inputClass} h-48 font-mono text-xs`}
                  placeholder="1, Rui Patrício&#10;3, Pepe&#10;..."
                  value={homePlayersText}
                  onChange={e => setHomePlayersText(e.target.value)}
                />
             </div>
             <div>
                <label className={labelClass}>Plantel Visitante <span className="text-gray-500 normal-case">(Inserir "nº, nome" • Primeiros 11 são Titulares)</span></label>
                <textarea 
                  className={`${inputClass} h-48 font-mono text-xs`}
                  placeholder="10, Messi&#10;7, Ronaldo&#10;..."
                  value={awayPlayersText}
                  onChange={e => setAwayPlayersText(e.target.value)}
                />
             </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-dark-border">
            <button type="submit" disabled={loading} className="bg-brand hover:bg-brand-hover text-black px-8 py-3 rounded font-bold uppercase tracking-widest text-sm transition shadow-lg shadow-brand/20">
              {loading ? 'A processar...' : 'Gravar Ficha'}
            </button>
            <button type="button" onClick={() => navigate('/matches')} className="bg-transparent border border-gray-600 hover:border-white text-gray-400 hover:text-white px-8 py-3 rounded font-bold uppercase tracking-widest text-sm transition">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchForm;

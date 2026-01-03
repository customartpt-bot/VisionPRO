
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, MatchEvent, EventType } from '../types';
import { 
  ArrowLeft, Goal, ArrowUpRight, ArrowDownRight,
  Shield, Hand, Square, UserMinus, UserPlus, Footprints, Target, Trash2, PlayCircle, AlertTriangle
} from 'lucide-react';
import VoiceChat from './VoiceChat';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const BanIcon = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
);

// --- COMPONENTES DE LINHA ---

const OurPlayerRow: React.FC<{ 
    player: Player, 
    onAction: (type: EventType) => void,
    isOnPitch: boolean 
}> = ({ player, onAction, isOnPitch }) => (
  <div className={`flex items-center gap-1 bg-dark-bg p-1 rounded border transition-all group mb-1 ${isOnPitch ? 'border-dark-border hover:border-brand/50' : 'border-dark-border opacity-50 hover:opacity-100'}`}>
    <div className="flex items-center gap-2 min-w-[100px]">
        <div className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs border ${isOnPitch ? 'bg-brand/10 text-brand border-brand/20' : 'bg-dark-surface text-gray-500 border-dark-border'}`}>
            {player.number}
        </div>
        <div className="text-[10px] font-bold text-gray-300 truncate uppercase w-20 leading-tight">
            {player.name}
        </div>
    </div>

    {isOnPitch ? (
        <div className="flex-1 flex justify-end gap-2 select-none">
            <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Passe</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('pass_success')} className="w-7 h-6 flex items-center justify-center rounded bg-green-900/20 text-green-500 hover:bg-green-500 hover:text-black border border-green-500/30 transition" title="Certo"><ArrowUpRight size={12} /></button>
                    <button onClick={() => onAction('pass_fail')} className="w-7 h-6 flex items-center justify-center rounded bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition" title="Errado"><ArrowDownRight size={12} /></button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Remate</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('shot_on_target')} className="w-7 h-6 flex items-center justify-center rounded bg-blue-900/20 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/30 transition" title="Alvo"><Target size={12} /></button>
                    <button onClick={() => onAction('shot_off_target')} className="w-7 h-6 flex items-center justify-center rounded bg-gray-700/20 text-gray-400 hover:bg-gray-500 hover:text-white border border-gray-500/30 transition" title="Fora"><BanIcon size={12} /></button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Posse</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('ball_loss')} className="w-7 h-6 flex items-center justify-center rounded bg-gray-700/20 text-gray-400 hover:bg-gray-500 hover:text-white border border-gray-500/30 transition" title="Perda"><AlertTriangle size={12} /></button>
                    <button onClick={() => onAction('ball_recovery')} className="w-7 h-6 flex items-center justify-center rounded bg-indigo-900/20 text-indigo-500 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 transition" title="Recuperação"><Shield size={12} /></button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-brand/70 font-bold uppercase tracking-tighter">Golo</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('goal')} className="w-7 h-6 flex items-center justify-center rounded bg-brand/20 text-brand hover:bg-brand hover:text-black border border-brand/30 transition font-bold" title="Golo"><Goal size={12} /></button>
                    <button onClick={() => onAction('assist')} className="w-7 h-6 flex items-center justify-center rounded bg-purple-900/20 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/30 transition" title="Assistência"><Footprints size={12} /></button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Discipl.</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('foul_committed')} className="w-5 h-6 flex items-center justify-center rounded bg-orange-900/20 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30 transition" title="Falta C"><Hand size={10} /></button>
                    <button onClick={() => onAction('foul_won')} className="w-5 h-6 flex items-center justify-center rounded bg-indigo-900/20 text-indigo-500 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 transition" title="Falta S"><Shield size={10} /></button>
                    <button onClick={() => onAction('yellow_card')} className="w-5 h-6 flex items-center justify-center rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-400 hover:text-black border border-yellow-500/20 transition" title="Amarelo"><Square size={8} fill="currentColor" /></button>
                    <button onClick={() => onAction('red_card')} className="w-5 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black border border-red-500/20 transition" title="Vermelho"><Square size={8} fill="currentColor" /></button>
                </div>
            </div>

             <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Sub</span>
                <button onClick={() => onAction('sub_out')} className="w-7 h-6 flex items-center justify-center rounded bg-gray-800 text-gray-500 hover:bg-white hover:text-black border border-gray-600 transition" title="Sair"><UserMinus size={12} /></button>
            </div>
        </div>
    ) : (
        <div className="flex-1 flex gap-2 justify-end items-center">
            <span className="text-[9px] text-gray-600 italic mr-2">Suplente</span>
            <button onClick={() => onAction('sub_in')} className="px-3 h-6 flex items-center justify-center rounded bg-brand/20 text-brand hover:bg-brand hover:text-black border border-brand/30 transition text-[9px] font-bold uppercase tracking-wider gap-1">
                <UserPlus size={12} /> Entrar
            </button>
        </div>
    )}
  </div>
);

const OpponentPlayerRow: React.FC<{ 
    player: Player, 
    onAction: (type: EventType) => void,
    isOnPitch: boolean 
}> = ({ player, onAction, isOnPitch }) => (
    <div className={`flex items-center gap-2 bg-dark-bg p-1 rounded border mb-1 group ${isOnPitch ? 'border-dark-border opacity-70 hover:opacity-100' : 'border-dark-border opacity-40 hover:opacity-80'}`}>
      <div className="flex items-center gap-2 min-w-[100px]">
          <div className="w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs bg-dark-surface text-gray-500 border border-dark-border">
              {player.number}
          </div>
          <div className="text-[10px] font-bold text-gray-300 truncate uppercase w-20 leading-tight">
              {player.name}
          </div>
      </div>

      {isOnPitch ? (
        <div className="flex-1 flex justify-end gap-2 select-none">
             <div className="flex flex-col items-center gap-0.5">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Golo</span>
                <button onClick={() => onAction('goal')} className="w-7 h-6 flex items-center justify-center rounded bg-brand/20 text-brand hover:bg-brand hover:text-black border border-brand/30 transition" title="Golo"><Goal size={12} /></button>
             </div>
             <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Discipl.</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('yellow_card')} className="w-6 h-6 flex items-center justify-center rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-400 hover:text-black border border-yellow-500/20 transition" title="Amarelo"><Square size={10} fill="currentColor" /></button>
                    <button onClick={() => onAction('red_card')} className="w-6 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black border border-red-500/20 transition" title="Vermelho"><Square size={10} fill="currentColor" /></button>
                </div>
             </div>
             <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Sub</span>
                <button onClick={() => onAction('sub_out')} className="w-7 h-6 flex items-center justify-center rounded bg-gray-800 text-gray-500 hover:bg-white hover:text-black border border-gray-600 transition" title="Sair"><UserMinus size={12} /></button>
             </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-2 justify-end items-center">
             <button onClick={() => onAction('sub_in')} className="px-2 h-6 flex items-center justify-center rounded bg-gray-700/50 text-gray-400 hover:bg-white hover:text-black border border-gray-600 transition text-[9px] font-bold uppercase tracking-wider gap-1">
                <UserPlus size={12} /> Entrar
            </button>
        </div>
      )}
    </div>
);

const IndividualConsole: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  const role = localStorage.getItem('userRole') || 'analistaind';
  
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]); 
  const [serverGameTime, setServerGameTime] = useState(0); 
  const [halfSplitSeconds, setHalfSplitSeconds] = useState(0);
  const [currentHalf, setCurrentHalf] = useState<1 | 2>(1);
  const [viewHalf, setViewHalf] = useState<'1' | '2' | 'total'>('total');
  
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [playersOnPitch, setPlayersOnPitch] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const { data: matchData } = await supabase.from('matches').select('*').eq('id', id).single();
      setMatch(matchData);
      if (matchData?.current_game_seconds) setServerGameTime(matchData.current_game_seconds);
      if (matchData?.half_split_seconds) setHalfSplitSeconds(matchData.half_split_seconds);
      if (matchData?.is_timer_running) setIsTimerRunning(matchData.is_timer_running);
      if (matchData?.current_half) {
          setCurrentHalf(matchData.current_half as 1 | 2);
          setViewHalf(String(matchData.current_half) as '1' | '2');
      }

      const { data: playerData } = await supabase.from('players').select('*').eq('match_id', id).order('number', { ascending: true });
      if (playerData) {
          setPlayers(playerData);
          const initialPitchState: Record<string, boolean> = {};
          playerData.forEach(p => { initialPitchState[p.id] = p.is_starter; });
          setPlayersOnPitch(initialPitchState);
      }
      
      const { data: evs } = await supabase.from('match_events').select('*, player:players(name, number)').eq('match_id', id).order('created_at', {ascending: false});
      if(evs) setEvents(evs);
    };
    loadData();

    const channel = supabase.channel(`match_sync_${id}`)
      .on('broadcast', { event: 'timer_tick' }, ({ payload }) => {
          setServerGameTime(payload.seconds);
          setIsTimerRunning(payload.is_running);
          if (payload.half) {
              setCurrentHalf(payload.half);
              // Não forçamos o viewHalf aqui para permitir que o analista veja totais livremente
          }
          if (payload.split !== undefined) setHalfSplitSeconds(payload.split);
      })
      .subscribe();

    const matchSub = supabase
      .channel('individual_match_sync_fallback')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
          const newMatch = payload.new as Match;
          setMatch(prev => ({...prev, ...newMatch}));
          if (newMatch.half_split_seconds !== undefined) setHalfSplitSeconds(newMatch.half_split_seconds);
      })
      .subscribe();

    const eventSub = supabase
      .channel('individual_events_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, (payload) => {
          if (payload.eventType === 'INSERT') {
             setEvents(prev => [payload.new as MatchEvent, ...prev]);
          } else if (payload.eventType === 'DELETE') {
             setEvents(prev => prev.filter(e => e.id !== payload.old.id));
          }
      })
      .subscribe();

    return () => { 
      supabase.removeChannel(matchSub); 
      supabase.removeChannel(eventSub);
      supabase.removeChannel(channel);
    };
  }, [id]);

  const addEvent = async (type: EventType, team: 'home' | 'away', playerId?: string) => {
    if (!match || !id) return;

    if (type === 'sub_in') {
        const teamPlayers = players.filter(p => p.team === team);
        const activeCount = teamPlayers.filter(p => playersOnPitch[p.id] !== undefined ? playersOnPitch[p.id] : p.is_starter).length;
        if (activeCount >= 11) {
            alert("Limite de 11 jogadores atingido.");
            return;
        }
    }

    const videoTime = playerRef.current?.getCurrentTime() || 0;
    const matchMinute = Math.floor(serverGameTime / 60) + 1; 
    const validUUID = generateUUID();

    if (playerId) {
        if (type === 'sub_out') setPlayersOnPitch(prev => ({ ...prev, [playerId]: false }));
        else if (type === 'sub_in') setPlayersOnPitch(prev => ({ ...prev, [playerId]: true }));
    }

    const optimisticEvent: any = {
      id: validUUID,
      match_id: id,
      type,
      team,
      player_id: playerId || null,
      video_timestamp: videoTime,
      match_minute: matchMinute,
      game_seconds: serverGameTime,
      half: currentHalf,
      created_at: new Date().toISOString(),
      player: playerId ? players.find(p => p.id === playerId) : null
    };

    setEvents(prev => [optimisticEvent, ...prev]);

    if (type === 'goal') {
      const newHomeScore = (match.home_score || 0) + (team === 'home' ? 1 : 0);
      const newAwayScore = (match.away_score || 0) + (team === 'away' ? 1 : 0);
      await supabase.from('matches').update({ home_score: newHomeScore, away_score: newAwayScore }).eq('id', id);
    }

    await supabase.from('match_events').insert([{
        id: validUUID,
        match_id: id,
        type,
        team,
        player_id: playerId || null,
        video_timestamp: videoTime,
        match_minute: matchMinute,
        game_seconds: serverGameTime,
        half: currentHalf
    }]);
  };

  const deleteEvent = async (eventId: string, type: EventType, team: 'home' | 'away') => {
      if (!window.confirm("Pretende anular este evento permanentemente?")) return;
      if (type === 'goal' && match) {
          const newHomeScore = Math.max(0, (match.home_score || 0) - (team === 'home' ? 1 : 0));
          const newAwayScore = Math.max(0, (match.away_score || 0) - (team === 'away' ? 1 : 0));
          await supabase.from('matches').update({ home_score: newHomeScore, away_score: newAwayScore }).eq('id', id);
      }
      setEvents(prev => prev.filter(ev => ev.id !== eventId)); 
      await supabase.from('match_events').delete().eq('id', eventId);
  };
  
  // RELÓGIO PRINCIPAL RELATIVO À PARTE DO JOGO
  const displayClockSecs = currentHalf === 1 
    ? (halfSplitSeconds > 0 ? Math.min(serverGameTime, halfSplitSeconds) : serverGameTime)
    : Math.max(0, serverGameTime - halfSplitSeconds);

  const displayMinutes = Math.floor(displayClockSecs / 60).toString().padStart(2, '0');
  const displaySeconds = (displayClockSecs % 60).toString().padStart(2, '0');

  const myTeamSide = match?.my_team_side || 'home'; 
  const opponentSide = myTeamSide === 'home' ? 'away' : 'home';

  const getActiveAndBench = (teamPlayers: Player[]) => {
      const active: Player[] = [];
      const bench: Player[] = [];
      const sorted = [...teamPlayers].sort((a,b) => a.number - b.number);
      sorted.forEach(p => {
          const isOnPitch = playersOnPitch[p.id] !== undefined ? playersOnPitch[p.id] : p.is_starter;
          if (isOnPitch) active.push(p); else bench.push(p);
      });
      return { active, bench };
  };

  const mySquad = getActiveAndBench(players.filter(p => p.team === myTeamSide));
  const opponentSquad = getActiveAndBench(players.filter(p => p.team === opponentSide));

  // FILTERED EVENTS FOR FEED (Only Shots, Goals, Discipline)
  const allowedFeedTypes: EventType[] = ['goal', 'shot_on_target', 'shot_off_target', 'yellow_card', 'red_card', 'sub_in', 'sub_out', 'ball_loss', 'ball_recovery'];
  const filteredEvents = events.filter(ev => 
      (viewHalf === 'total' || String(ev.half) === viewHalf) && 
      allowedFeedTypes.includes(ev.type)
  );

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      <div className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-brand transition"><ArrowLeft size={18} /></button>
          <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
          <div className="flex flex-col ml-2 border-l border-gray-800 pl-3">
             <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Live Console</span>
             <span className="text-[10px] text-gray-500 font-mono">Individual Stats v2.4 Feed Sync</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-dark-surface h-full flex flex-row items-center justify-center gap-6 px-6 border-x border-dark-border/50 shadow-2xl min-w-[500px]">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-right w-32 truncate hidden md:block">{match?.home_team}</div>
           <div className="text-3xl font-mono font-bold text-white tracking-widest leading-none">
             {match?.home_score || 0}<span className="text-brand mx-2">:</span>{match?.away_score || 0}
           </div>
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-left w-32 truncate hidden md:block">{match?.away_team}</div>
           <div className="h-8 w-px bg-dark-border mx-2"></div>
           <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase font-bold text-gray-600 tracking-wider">{currentHalf}ªP</span>
              <div className="flex items-center text-xl font-mono font-bold text-gray-200 leading-none bg-black px-2 py-1 rounded border border-dark-border">
                 <span>{displayMinutes}</span>
                 <span className={`mx-0.5 text-brand ${isTimerRunning ? 'animate-pulse' : ''}`}>:</span>
                 <span>{displaySeconds}</span>
              </div>
           </div>
        </div>

        <div className="flex items-center gap-4 w-1/3 justify-end">
           {id && <VoiceChat matchId={id} role={role} />}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-5/12 flex flex-col border-r border-dark-border bg-black relative">
            <div className="w-full border-b border-dark-border relative shadow-lg">
                 <div className="aspect-video bg-black">
                    {match?.youtube_url && (
                        <ReactPlayer ref={playerRef} url={match.youtube_url} width="100%" height="100%" controls={true} playing={true} muted={true} />
                    )}
                </div>
            </div>
            
            <div className="flex-1 bg-dark-surface p-4 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-3 border-b border-dark-border pb-2">
                    <h3 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Feed de Eventos</h3>
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-dark-border/50">
                        <button onClick={() => setViewHalf('1')} className={`text-[8px] px-2 py-0.5 rounded transition ${viewHalf === '1' ? 'bg-white text-black font-bold' : 'text-gray-600'}`}>1ªP</button>
                        <button onClick={() => setViewHalf('2')} className={`text-[8px] px-2 py-0.5 rounded transition ${viewHalf === '2' ? 'bg-white text-black font-bold' : 'text-gray-600'}`}>2ªP</button>
                        <button onClick={() => setViewHalf('total')} className={`text-[8px] px-2 py-0.5 rounded transition ${viewHalf === 'total' ? 'bg-brand text-black font-bold' : 'text-gray-600'}`}>TOTAL</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                    {filteredEvents.map(ev => (
                        <div key={ev.id} className="flex items-center justify-between gap-2 text-xs p-2 bg-dark-bg rounded border border-dark-border/50 hover:border-gray-600 group">
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end w-6 shrink-0">
                                    <span className="font-mono text-brand font-bold text-[10px]">{ev.match_minute}'</span>
                                    <span className="text-[6px] text-gray-600 uppercase font-black">{ev.half}P</span>
                                </div>
                                <span className="text-gray-300 font-bold w-24 truncate">{ev.player?.name || 'Geral'}</span>
                                <span className="text-gray-500 text-[10px] uppercase">{ev.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => playerRef.current?.seekTo(ev.video_timestamp, 'seconds')} className="text-gray-500 hover:text-brand transition mr-2" title="Ver no vídeo"><PlayCircle size={14} /></button>
                                <button onClick={() => deleteEvent(ev.id, ev.type, ev.team)} className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Apagar Registo"><Trash2 size={12} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="w-7/12 flex bg-dark-bg">
           <div className="flex-1 flex flex-col border-r border-dark-border">
               <div className="bg-dark-surface p-3 border-b border-dark-border flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest border-l-4 border-brand pl-2">{myTeamSide === 'home' ? match?.home_team : match?.away_team}</h2>
                    <span className="text-[10px] bg-brand text-black px-2 py-0.5 rounded font-bold">MINHA EQUIPA</span>
               </div>
               <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                   <div className="mb-4">
                       <h3 className="text-[9px] text-brand font-bold uppercase mb-2 tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-brand animate-pulse"></div> Em Campo</h3>
                       {mySquad.active.map(player => (
                           <OurPlayerRow key={player.id} player={player} isOnPitch={true} onAction={(type) => addEvent(type, myTeamSide, player.id)} />
                       ))}
                   </div>
                   <div className="border-t border-dark-border pt-4">
                       <h3 className="text-[9px] text-gray-500 font-bold uppercase mb-2 tracking-widest">Banco de Suplentes</h3>
                       {mySquad.bench.map(player => (
                           <OurPlayerRow key={player.id} player={player} isOnPitch={false} onAction={(type) => addEvent(type, myTeamSide, player.id)} />
                       ))}
                   </div>
               </div>
           </div>
           <div className="w-1/3 flex flex-col bg-dark-surface/50">
               <div className="bg-dark-surface p-3 border-b border-dark-border flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-l-4 border-gray-600 pl-2">{opponentSide === 'home' ? match?.home_team : match?.away_team}</h2>
                    <span className="text-[10px] bg-gray-700 text-gray-300 px-2 py-0.5 rounded font-bold">ADVERSÁRIO</span>
               </div>
               <div className="flex-1 overflow-y-auto p-2">
                   <div className="mb-4">
                        <h3 className="text-[9px] text-gray-400 font-bold uppercase mb-2 tracking-widest">Em Campo</h3>
                        {opponentSquad.active.map(player => (
                            <OpponentPlayerRow key={player.id} player={player} isOnPitch={true} onAction={(type) => addEvent(type, opponentSide, player.id)} />
                        ))}
                   </div>
                   <div className="border-t border-dark-border pt-4">
                        <h3 className="text-[9px] text-gray-600 font-bold uppercase mb-2 tracking-widest">Banco</h3>
                        {opponentSquad.bench.map(player => (
                            <OpponentPlayerRow key={player.id} player={player} isOnPitch={false} onAction={(type) => addEvent(type, opponentSide, player.id)} />
                        ))}
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualConsole;

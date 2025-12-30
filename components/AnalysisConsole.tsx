import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, MatchEvent, EventType } from '../types';
import { 
  Play, Pause, ArrowLeft, Layers, User, RotateCcw, 
  Clock, Crosshair, Shield, Hand, Timer, Activity, Goal,
  AlertTriangle, RectangleHorizontal, ShieldAlert, Ban, Trash2
} from 'lucide-react';
import VoiceChat from './VoiceChat';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// Componente Cartão de Estatística (Estilo Dashboard)
interface StatCardProps {
  title: string;
  icon: any;
  homeValue: number | string;
  awayValue: number | string;
  onHomeClick?: () => void;
  onAwayClick?: () => void;
  homeActive?: boolean;
  awayActive?: boolean;
  isTimer?: boolean;
  helperText?: string;
  progressBar?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, icon: Icon, homeValue, awayValue, onHomeClick, onAwayClick, 
  homeActive, awayActive, isTimer, helperText, progressBar = true 
}) => {
  
  let homePercent = 50;
  
  if (typeof homeValue === 'string' && homeValue.includes(':')) {
      homePercent = 50; 
  } else {
      const hVal = typeof homeValue === 'number' ? homeValue : parseFloat(homeValue as string);
      const aVal = typeof awayValue === 'number' ? awayValue : parseFloat(awayValue as string);
      const total = hVal + aVal;
      homePercent = total === 0 ? 50 : (hVal / total) * 100;
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group select-none hover:border-gray-600 transition-colors h-full">
       {homeActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>}
       {awayActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-brand animate-pulse shadow-[0_0_10px_rgba(255,77,0,0.5)]"></div>}

       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded bg-dark-surface ${homeActive || awayActive ? 'text-white' : 'text-gray-500'}`}>
                <Icon size={12} />
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">{title}</span>
          </div>
          {helperText && <span className="text-[8px] font-mono text-gray-600 border border-dark-border px-1 rounded">{helperText}</span>}
       </div>

       <div className="flex justify-between items-end mb-2">
          <button 
            onClick={onHomeClick} 
            disabled={!onHomeClick}
            className={`text-xl font-mono font-bold transition text-left ${onHomeClick ? 'cursor-pointer hover:text-gray-300 active:scale-95' : 'cursor-default'} ${homeActive ? 'text-white' : 'text-gray-200'}`}
          >
             {homeValue}
          </button>
          <button 
            onClick={onAwayClick} 
            disabled={!onAwayClick}
            className={`text-xl font-mono font-bold transition text-right ${onAwayClick ? 'cursor-pointer hover:text-brand-light active:scale-95' : 'cursor-default'} ${awayActive ? 'text-brand' : 'text-brand'}`}
          >
             {awayValue}
          </button>
       </div>

       {progressBar && (
           <div className="h-1 w-full bg-dark-surface rounded-full overflow-hidden flex relative mt-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-dark-bg z-10"></div>
              <div style={{ width: `${homePercent}%` }} className={`h-full transition-all duration-500 ${homeActive ? 'bg-white' : 'bg-gray-500'}`}></div>
              <div style={{ width: `${100 - homePercent}%` }} className={`h-full transition-all duration-500 ${awayActive ? 'bg-brand' : 'bg-brand/70'}`}></div>
           </div>
       )}
    </div>
  );
}

const PlayerRow: React.FC<{ player: Player, onAction: (type: EventType) => void }> = ({ player, onAction }) => (
  <div className="flex items-center gap-3 bg-dark-bg p-2 rounded border border-dark-border hover:border-brand/50 transition-colors group">
    <div className="w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-gray-400 bg-dark-surface text-xs group-hover:text-brand group-hover:bg-brand/10">{player.number}</div>
    <div className="flex-1 text-xs font-bold text-gray-300 truncate uppercase">{player.name}</div>
    <div className="flex gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
      <button onClick={() => onAction('goal')} className="w-6 h-6 flex items-center justify-center rounded bg-brand/30 text-brand hover:bg-brand hover:text-black font-bold text-[10px] transition border border-brand/20" title="Golo">G</button>
      <button onClick={() => onAction('pass_success')} className="w-6 h-6 flex items-center justify-center rounded bg-green-900/30 text-green-500 hover:bg-green-500 hover:text-black font-bold text-[10px] transition">P</button>
      <button onClick={() => onAction('shot_on_target')} className="w-6 h-6 flex items-center justify-center rounded bg-blue-900/30 text-blue-500 hover:bg-blue-500 hover:text-black font-bold text-[10px] transition">R</button>
      <button onClick={() => onAction('foul_committed')} className="w-6 h-6 flex items-center justify-center rounded bg-yellow-900/30 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold text-[10px] transition">F</button>
      <button onClick={() => onAction('yellow_card')} className="w-6 h-6 flex items-center justify-center rounded bg-yellow-600/30 text-yellow-200 hover:bg-yellow-400 hover:text-black font-bold text-[10px] transition">CA</button>
    </div>
  </div>
);

const AnalysisConsole: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  const role = localStorage.getItem('userRole') || 'admin';
  
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'collective' | 'individual'>('collective');
  
  // Estado da Parte do Jogo
  const [currentHalf, setCurrentHalf] = useState<1 | 2>(1);

  // Game Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  const [possession, setPossession] = useState({ home: 0, away: 0 });
  const [activePossession, setActivePossession] = useState<'home' | 'away' | null>(null);
  const possessionInterval = useRef<any>(null);

  // Time without shot calculation
  const timeSinceShot = useMemo(() => {
    const calcTeamTime = (team: 'home' | 'away') => {
        const teamShots = events.filter(e => 
            e.team === team && 
            (e.type === 'shot_on_target' || e.type === 'shot_off_target' || e.type === 'goal')
        );
        
        const getEventSeconds = (e: MatchEvent) => {
            if (e.game_seconds !== undefined && e.game_seconds !== null) {
                return e.game_seconds;
            }
            return (e.match_minute > 0 ? e.match_minute - 1 : 0) * 60;
        };

        const pastShots = teamShots.filter(e => getEventSeconds(e) <= timerSeconds);
        
        if (pastShots.length === 0) return timerSeconds;
        
        pastShots.sort((a, b) => getEventSeconds(b) - getEventSeconds(a));
        
        const lastShot = pastShots[0];
        const lastShotTime = getEventSeconds(lastShot);
        
        const diff = timerSeconds - lastShotTime;
        return diff > 0 ? diff : 0;
    };

    return {
        home: calcTeamTime('home'),
        away: calcTeamTime('away')
    };
  }, [events, timerSeconds]);

  // Initial Load
  useEffect(() => {
    if (!id) return;
    if (role === 'analistaind') setActiveTab('individual');
    else if (role === 'analistacol') setActiveTab('collective');

    const loadData = async () => {
      const { data: matchData } = await supabase.from('matches').select('*').eq('id', id).single();
      setMatch(matchData);
      
      if (matchData) {
          if (matchData.current_game_seconds) setTimerSeconds(matchData.current_game_seconds);
          if (matchData.current_half) setCurrentHalf(matchData.current_half as 1 | 2);
          
          // Carregar posse de bola guardada
          const savedHome = matchData.possession_home || 0;
          const savedAway = matchData.possession_away || 0;
          setPossession({ home: savedHome, away: savedAway });
      }
      
      const { data: playerData } = await supabase.from('players').select('*').eq('match_id', id);
      setPlayers(playerData || []);
      const { data: eventData } = await supabase.from('match_events').select('*, player:players(name, number)').eq('match_id', id).order('created_at', { ascending: false });
      setEvents(eventData || []);
    };
    loadData();

    const subscription = supabase
      .channel('public:match_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, (payload) => {
         if (payload.eventType === 'INSERT') {
            setEvents(prev => {
                const exists = prev.find(e => e.id === payload.new.id);
                if (exists) return prev;
                return [payload.new as MatchEvent, ...prev];
            });
         } else if (payload.eventType === 'DELETE') {
             setEvents(prev => prev.filter(e => e.id !== payload.old.id));
         }
      })
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }, [id, role]);

  // Main Game Timer Logic
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
            const next = prev + 1;
            if (next % 10 === 0 && id) {
                 supabase.from('matches').update({ current_game_seconds: next }).eq('id', id).then();
            }
            return next;
        });
      }, 1000);
    } else {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning, id]);

  const toggleTimer = async () => {
      const newState = !isTimerRunning;
      setIsTimerRunning(newState);
      if (!newState && id) {
          await supabase.from('matches').update({ current_game_seconds: timerSeconds }).eq('id', id);
      }
  };

  const updateHalf = async (half: 1 | 2) => {
      setCurrentHalf(half);
      if (id) {
          await supabase.from('matches').update({ current_half: half }).eq('id', id);
      }
  };

  // Possession Logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key.toLowerCase() === 'a') setActivePossession('home');
      else if (e.key.toLowerCase() === 'd') setActivePossession('away');
      else if (e.key.toLowerCase() === 's') setActivePossession(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (possessionInterval.current) {
        clearInterval(possessionInterval.current);
    }

    if (activePossession && id) {
      possessionInterval.current = window.setInterval(() => {
        setPossession(prev => {
           const nextVal = prev[activePossession] + 1;
           
           // Sincronizar com BD a cada 5 segundos para não sobrecarregar
           if (nextVal % 5 === 0) {
              const updateKey = activePossession === 'home' ? 'possession_home' : 'possession_away';
              supabase.from('matches').update({ [updateKey]: nextVal }).eq('id', id).then();
           }
           
           return { ...prev, [activePossession]: nextVal };
        });
      }, 1000);
    }
    return () => { if (possessionInterval.current) clearInterval(possessionInterval.current); };
  }, [activePossession, id]); 

  const addEvent = async (type: EventType, team: 'home' | 'away', playerId?: string) => {
    if (!match || !id) return;

    const videoTime = playerRef.current?.getCurrentTime() || 0;
    const matchMinute = Math.floor(timerSeconds / 60) + 1; 
    const validUUID = generateUUID();

    const optimisticEvent: any = {
      id: validUUID,
      match_id: id,
      type,
      team,
      player_id: playerId || null,
      video_timestamp: videoTime,
      match_minute: matchMinute,
      game_seconds: timerSeconds, 
      created_at: new Date().toISOString(),
      player: playerId ? players.find(p => p.id === playerId) : null
    };

    setEvents(prev => [optimisticEvent, ...prev]);

    const { error } = await supabase.from('match_events').insert([{
        id: validUUID,
        match_id: id,
        type,
        team,
        player_id: playerId || null,
        video_timestamp: videoTime,
        match_minute: matchMinute,
        game_seconds: timerSeconds,
    }]).select().single();

    if (error) {
        console.error("Erro ao gravar evento:", error);
        setEvents(prev => prev.filter(e => e.id !== validUUID));
        return;
    }

    if (type === 'goal') {
        updateMatchScore(team, 1);
    }
  };

  const updateMatchScore = async (team: 'home' | 'away', increment: number) => {
      if (!match || !id) return;
      
      const previousHome = match.home_score;
      const previousAway = match.away_score;

      const newHomeScore = team === 'home' ? match.home_score + increment : match.home_score;
      const newAwayScore = team === 'away' ? match.away_score + increment : match.away_score;

      setMatch(prev => prev ? { ...prev, home_score: newHomeScore, away_score: newAwayScore } : null);

      const { error } = await supabase.from('matches').update({
            home_score: newHomeScore,
            away_score: newAwayScore
      }).eq('id', id);

      if (error) {
          console.error("Erro ao atualizar resultado:", error);
          setMatch(prev => prev ? { ...prev, home_score: previousHome, away_score: previousAway } : null);
          alert("Erro: Permissão negada para atualizar o resultado do jogo.");
      }
  };

  const deleteEvent = async (eventId: string, type: EventType, team: 'home' | 'away', e: React.MouseEvent) => {
      e.stopPropagation();
      if (role === 'dashboard') return;
      if (!window.confirm("Pretende anular este evento permanentemente?")) return;
      
      const previousEvents = [...events];
      setEvents(prev => prev.filter(ev => ev.id !== eventId));

      const { error } = await supabase.from('match_events').delete().eq('id', eventId);
      
      if (error) {
          console.error("Erro ao apagar evento:", error);
          setEvents(previousEvents);
          alert(`Erro: Não foi possível apagar o evento. Detalhe: ${error.message}`);
      } else {
          if (type === 'goal') updateMatchScore(team, -1);
      }
  };
  
  const resetTimer = async () => {
      if(!window.confirm("Reiniciar cronómetro de jogo para 00:00?")) return;
      setIsTimerRunning(false);
      if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
      }
      setTimerSeconds(0);
      if (id) await supabase.from('matches').update({ current_game_seconds: 0 }).eq('id', id);
  }

  const handleTimeEdit = (minutes: string) => {
    const mins = parseInt(minutes);
    if (!isNaN(mins)) {
        setTimerSeconds(mins * 60 + (timerSeconds % 60));
    }
  };
  
  const formatTimeSimple = (seconds: number) => {
     const m = Math.floor(seconds / 60).toString().padStart(2, '0');
     const s = (seconds % 60).toString().padStart(2, '0');
     return `${m}:${s}`;
  }

  const liveScore = useMemo(() => {
    return {
        home: events.filter(e => e.team === 'home' && e.type === 'goal').length,
        away: events.filter(e => e.team === 'away' && e.type === 'goal').length
    }
  }, [events]);

  const stats = React.useMemo(() => {
    const calc = (team: 'home' | 'away', type: EventType) => events.filter(e => e.team === team && e.type === type).length;
    return {
      home: { 
          goals: calc('home', 'goal'),
          shotsOn: calc('home', 'shot_on_target'),
          shotsOff: calc('home', 'shot_off_target'),
          foulsCommitted: calc('home', 'foul_committed'),
          foulsWon: calc('home', 'foul_won'),
          yellow: calc('home', 'yellow_card'),
          red: calc('home', 'red_card'),
          loss: calc('home', 'ball_loss'),
          recovery: calc('home', 'ball_recovery'),
          corners: calc('home', 'corner'),
          passSuccess: calc('home', 'pass_success')
      },
      away: { 
          goals: calc('away', 'goal'),
          shotsOn: calc('away', 'shot_on_target'),
          shotsOff: calc('away', 'shot_off_target'),
          foulsCommitted: calc('away', 'foul_committed'),
          foulsWon: calc('away', 'foul_won'),
          yellow: calc('away', 'yellow_card'),
          red: calc('away', 'red_card'),
          loss: calc('away', 'ball_loss'),
          recovery: calc('away', 'ball_recovery'),
          corners: calc('away', 'corner'),
          passSuccess: calc('away', 'pass_success')
      }
    };
  }, [events]);

  const totalTime = possession.home + possession.away || 1;
  const homePossessionPct = Math.round((possession.home / totalTime) * 100);

  const displayMinutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const displaySeconds = (timerSeconds % 60).toString().padStart(2, '0');
  const canDelete = role !== 'dashboard';

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-brand transition"><ArrowLeft size={18} /></button>
          <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
          <div className="flex flex-col ml-2 border-l border-gray-800 pl-3">
             <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Live Console</span>
             <span className="text-[10px] text-gray-500 font-mono">Operator: {role?.toUpperCase()}</span>
          </div>
        </div>

        {/* Central Scoreboard - COMPACT MODE (ROW) */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-dark-surface h-full flex flex-row items-center justify-center gap-6 px-6 border-x border-dark-border/50 shadow-2xl min-w-[500px]">
           
           {/* Nome Equipa Casa */}
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-right w-32 truncate hidden md:block">
              {match?.home_team || 'HOME'}
           </div>

           {/* Live Score */}
           <div className="text-3xl font-mono font-bold text-white tracking-widest leading-none">
             {liveScore.home}<span className="text-brand mx-2">:</span>{liveScore.away}
           </div>

           {/* Nome Equipa Fora */}
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-left w-32 truncate hidden md:block">
              {match?.away_team || 'AWAY'}
           </div>

           <div className="h-8 w-px bg-dark-border mx-2"></div>

           {/* Half Selector */}
           <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-dark-border/30">
              <button 
                onClick={() => updateHalf(1)} 
                className={`text-[9px] font-bold px-2 py-1 rounded transition-colors uppercase ${currentHalf === 1 ? 'bg-brand text-black' : 'text-gray-500 hover:text-white'}`}
              >
                1ª P
              </button>
              <button 
                onClick={() => updateHalf(2)} 
                className={`text-[9px] font-bold px-2 py-1 rounded transition-colors uppercase ${currentHalf === 2 ? 'bg-brand text-black' : 'text-gray-500 hover:text-white'}`}
              >
                2ª P
              </button>
           </div>
           
           <div className="h-8 w-px bg-dark-border"></div>

           {/* Independent Game Timer */}
           <div className="flex items-center justify-center gap-2">
              <button 
                onClick={toggleTimer} 
                className={`text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 transition-colors ${isTimerRunning ? 'text-brand' : 'text-gray-500 hover:text-white'}`}
                title={isTimerRunning ? "Pausar" : "Iniciar"}
              >
                 {isTimerRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
              
              <div className="flex items-center text-xl font-mono font-bold text-gray-200 leading-none bg-black px-2 py-1 rounded border border-dark-border">
                 <input 
                    type="number" 
                    className="bg-transparent w-10 text-center focus:outline-none focus:text-brand placeholder-gray-500 appearance-none m-0 p-0" 
                    value={displayMinutes} 
                    onChange={(e) => handleTimeEdit(e.target.value)} 
                 />
                 <span className={`mx-0.5 ${isTimerRunning ? 'animate-pulse text-brand' : 'text-gray-600'}`}>:</span>
                 <span className="w-6 text-center">{displaySeconds}</span>
              </div>

               <button 
                onClick={resetTimer} 
                className="text-gray-600 hover:text-red-500 transition-colors"
                title="Reiniciar Cronómetro"
              >
                 <RotateCcw size={14} />
              </button>
           </div>
        </div>

        <div className="flex items-center gap-4 w-1/3 justify-end">
           <div className="text-right mr-4 hidden md:block">
             <div className="text-[10px] uppercase text-gray-600 font-bold">{match?.competition}</div>
             <div className="text-xs font-bold text-gray-500 font-mono">VPRO3</div>
           </div>
           {id && <VoiceChat matchId={id} role={role} />}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video Only */}
        <div className="w-5/12 flex flex-col border-r border-dark-border bg-black relative justify-center">
            <div className="w-full">
                <div className="aspect-video bg-black relative shadow-lg">
                    {match?.youtube_url ? (
                        <ReactPlayer ref={playerRef} url={match.youtube_url} width="100%" height="100%" controls={true} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs uppercase tracking-widest">No Video Signal</div>
                    )}
                </div>
            </div>
        </div>

        {/* Right: Controls & Data & Feed */}
        <div className="w-7/12 flex flex-col bg-dark-surface">
           {/* Tab Navigation - Apenas visível para admin */}
           {role === 'admin' && (
               <div className="flex border-b border-dark-border">
                  <button onClick={() => setActiveTab('collective')} className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'collective' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                     <Layers size={14} /> Painel Coletivo
                  </button>
                  <button onClick={() => setActiveTab('individual')} className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'individual' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                     <User size={14} /> Painel Individual
                  </button>
               </div>
           )}

           {role !== 'admin' && (
               <div className="bg-dark-bg p-4 border-b border-dark-border text-center">
                    <span className="text-brand font-bold uppercase tracking-widest text-xs">
                        {activeTab === 'collective' ? 'Painel Coletivo' : 'Painel Individual'}
                    </span>
               </div>
           )}

           <div className="flex-1 p-6 overflow-y-auto bg-dark-bg/50">
              {activeTab === 'collective' ? (
                 <div className="flex flex-col gap-6">
                     {/* 1. Grelha de Cartões */}
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 content-start">
                          {/* Cartão de Posse Real - Controlado por Teclado */}
                          <StatCard 
                              title="Posse Real (Tempo)"
                              icon={Clock}
                              homeValue={formatTimeSimple(possession.home)}
                              awayValue={formatTimeSimple(possession.away)}
                              homeActive={activePossession === 'home'}
                              awayActive={activePossession === 'away'}
                              helperText="A | S | D"
                              progressBar={true}
                          />
                          
                          {/* Golos */}
                          <StatCard 
                              title="Golos"
                              icon={Goal}
                              homeValue={stats.home.goals}
                              awayValue={stats.away.goals}
                              onHomeClick={() => addEvent('goal', 'home')}
                              onAwayClick={() => addEvent('goal', 'away')}
                          />

                          {/* Remates */}
                          <StatCard 
                              title="Remate Alvo"
                              icon={Crosshair}
                              homeValue={stats.home.shotsOn}
                              awayValue={stats.away.shotsOn}
                              onHomeClick={() => addEvent('shot_on_target', 'home')}
                              onAwayClick={() => addEvent('shot_on_target', 'away')}
                          />

                           <StatCard 
                              title="Remate Fora"
                              icon={Ban}
                              homeValue={stats.home.shotsOff}
                              awayValue={stats.away.shotsOff}
                              onHomeClick={() => addEvent('shot_off_target', 'home')}
                              onAwayClick={() => addEvent('shot_off_target', 'away')}
                          />
                          
                           {/* Faltas */}
                           <StatCard 
                              title="Falta Cometida"
                              icon={Hand}
                              homeValue={stats.home.foulsCommitted}
                              awayValue={stats.away.foulsCommitted}
                              onHomeClick={() => addEvent('foul_committed', 'home')}
                              onAwayClick={() => addEvent('foul_committed', 'away')}
                          />

                           <StatCard 
                              title="Falta Sofrida"
                              icon={ShieldAlert}
                              homeValue={stats.home.foulsWon}
                              awayValue={stats.away.foulsWon}
                              onHomeClick={() => addEvent('foul_won', 'home')}
                              onAwayClick={() => addEvent('foul_won', 'away')}
                          />

                           {/* Cartões */}
                           <StatCard 
                              title="Cartão Amarelo"
                              icon={RectangleHorizontal}
                              homeValue={stats.home.yellow}
                              awayValue={stats.away.yellow}
                              onHomeClick={() => addEvent('yellow_card', 'home')}
                              onAwayClick={() => addEvent('yellow_card', 'away')}
                          />

                           <StatCard 
                              title="Cartão Vermelho"
                              icon={RectangleHorizontal}
                              homeValue={stats.home.red}
                              awayValue={stats.away.red}
                              onHomeClick={() => addEvent('red_card', 'home')}
                              onAwayClick={() => addEvent('red_card', 'away')}
                          />

                           {/* Perda/Recuperação */}
                           <StatCard 
                              title="Perda de Bola"
                              icon={AlertTriangle}
                              homeValue={stats.home.loss}
                              awayValue={stats.away.loss}
                              onHomeClick={() => addEvent('ball_loss', 'home')}
                              onAwayClick={() => addEvent('ball_loss', 'away')}
                          />

                           <StatCard 
                              title="Recuperação"
                              icon={Shield}
                              homeValue={stats.home.recovery}
                              awayValue={stats.away.recovery}
                              onHomeClick={() => addEvent('ball_recovery', 'home')}
                              onAwayClick={() => addEvent('ball_recovery', 'away')}
                          />

                          {/* Cantos */}
                          <StatCard 
                              title="Cantos"
                              icon={Activity}
                              homeValue={stats.home.corners}
                              awayValue={stats.away.corners}
                              onHomeClick={() => addEvent('corner', 'home')}
                              onAwayClick={() => addEvent('corner', 'away')}
                          />

                           {/* Tempo Sem Remate - SEPARADO */}
                           <StatCard 
                              title="T. Sem Remate"
                              icon={Timer}
                              homeValue={formatTimeSimple(timeSinceShot.home)}
                              awayValue={formatTimeSimple(timeSinceShot.away)}
                              progressBar={false}
                              helperText="MM:SS"
                          />
                     </div>

                     {/* 2. Quick Stats Strip (Updated: Only Possession) */}
                     <div className="bg-dark-card border border-dark-border rounded-xl p-4 shadow-lg">
                         <div className="text-center w-full">
                            <div className="text-[10px] uppercase text-brand font-bold mb-2">Posse de Bola</div>
                            <div className="flex items-center justify-center gap-3 font-mono text-lg text-white w-full">
                                <span className="text-xl font-bold">{homePossessionPct}%</span>
                                <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden flex">
                                     <div className="h-full bg-white" style={{width: `${homePossessionPct}%`}}></div>
                                     <div className="h-full bg-brand" style={{width: `${100-homePossessionPct}%`}}></div>
                                </div>
                                <span className="text-xl font-bold text-brand">{100 - homePossessionPct}%</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Event Log (Moved from Left) */}
                    <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg flex flex-col h-96 shrink-0">
                         <div className="bg-dark-surface p-3 border-b border-dark-border text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            Event Log
                         </div>
                         <div className="flex-1 overflow-y-auto p-0 divide-y divide-dark-border">
                             {events.length === 0 ? (
                                 <div className="p-4 text-center text-xs text-gray-600 font-mono">Nenhum evento registado.</div>
                             ) : events.map(ev => (
                                <div key={ev.id} onClick={() => playerRef.current?.seekTo(ev.video_timestamp, 'seconds')} className="p-3 flex items-center justify-between hover:bg-dark-surface cursor-pointer group transition-colors">
                                   <div className="flex items-center gap-3">
                                        <span className="font-mono text-brand text-xs w-8 text-right">{ev.match_minute}'</span>
                                        <div className="w-1 h-8 bg-dark-border group-hover:bg-brand transition-colors"></div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-200 uppercase">{ev.type.replace('_', ' ')}</div>
                                            <div className="text-[10px] text-gray-500">{ev.team === 'home' ? match?.home_team : match?.away_team} {ev.player && `• #${ev.player.number} ${ev.player.name}`}</div>
                                        </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-2">
                                       <Play size={10} className="text-gray-600 group-hover:text-brand" />
                                       {canDelete && (
                                           <button 
                                            onClick={(e) => deleteEvent(ev.id, ev.type, ev.team, e)}
                                            className="text-gray-500 hover:text-red-500 transition-colors p-2 rounded hover:bg-red-500/10"
                                            title="Anular evento"
                                           >
                                               <Trash2 size={14} />
                                           </button>
                                       )}
                                   </div>
                                </div>
                              ))}
                         </div>
                    </div>
                 </div>
              ) : (
                  <div className="grid grid-cols-2 gap-8">
                     <div>
                        <h4 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-3 border-b border-dark-border pb-1">Plantel {match?.home_team}</h4>
                        <div className="space-y-2">
                           {players.filter(p => p.team === 'home').map(player => (
                               <PlayerRow key={player.id} player={player} onAction={(type) => addEvent(type, 'home', player.id)} />
                           ))}
                        </div>
                     </div>
                     <div>
                        <h4 className="text-gray-500 font-bold text-[10px] uppercase tracking-widest mb-3 border-b border-dark-border pb-1">Plantel {match?.away_team}</h4>
                        <div className="space-y-2">
                           {players.filter(p => p.team === 'away').map(player => (
                               <PlayerRow key={player.id} player={player} onAction={(type) => addEvent(type, 'away', player.id)} />
                           ))}
                        </div>
                     </div>
                  </div>
              )}
           </div>
           
           {/* Footer Hint */}
           <div className="bg-dark-surface p-2 border-t border-dark-border text-[10px] text-gray-600 flex justify-between font-mono">
              <span>Contador de posse de bola: A (Casa) | S (Stop) | D (Fora)</span>
              <span>VPRO3 SYSTEM v1.9</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConsole;

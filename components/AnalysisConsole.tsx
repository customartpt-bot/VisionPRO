
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, MatchEvent, EventType } from '../types';
import { 
  Play, Pause, ArrowLeft, Layers, User, RotateCcw, 
  Clock, Crosshair, Shield, Hand, Timer, Activity, Goal,
  AlertTriangle, RectangleHorizontal, ShieldAlert, Ban, Trash2,
  ArrowUpRight, ArrowDownRight, Target, Footprints, UserMinus, UserPlus, Square, PlayCircle
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

const BanIcon = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
);

// --- COMPONENTES AUXILIARES ---

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
  variant?: 'default' | 'danger';
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, icon: Icon, homeValue, awayValue, onHomeClick, onAwayClick, 
  homeActive, awayActive, isTimer, helperText, progressBar = true,
  variant = 'default'
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

  const pulseColor = variant === 'danger' ? 'bg-red-600' : 'bg-white';
  const awayPulseColor = variant === 'danger' ? 'bg-red-500' : 'bg-brand';

  return (
    <div className={`bg-dark-card border rounded-xl p-3 flex flex-col justify-between relative overflow-hidden group select-none hover:border-gray-600 transition-colors h-full ${variant === 'danger' ? 'border-red-900/30' : 'border-dark-border'}`}>
       {homeActive && <div className={`absolute left-0 top-0 bottom-0 w-1 animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)] ${pulseColor}`}></div>}
       {awayActive && <div className={`absolute right-0 top-0 bottom-0 w-1 animate-pulse shadow-[0_0_10px_rgba(255,77,0,0.5)] ${awayPulseColor}`}></div>}

       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded bg-dark-surface ${homeActive || awayActive ? 'text-white' : 'text-gray-500'}`}>
                <Icon size={12} />
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-widest leading-none ${variant === 'danger' ? 'text-red-500' : 'text-gray-500'}`}>{title}</span>
          </div>
          {helperText && <span className="text-[8px] font-mono text-gray-600 border border-dark-border px-1 rounded">{helperText}</span>}
       </div>

       <div className="flex justify-between items-end mb-2">
          <button 
            onClick={onHomeClick} 
            disabled={!onHomeClick}
            title={onHomeClick ? `Registar ${title} (Casa)` : ''}
            className={`text-xl font-mono font-bold transition text-left ${onHomeClick ? 'cursor-pointer hover:text-gray-300 active:scale-95' : 'cursor-default'} ${homeActive ? 'text-white' : 'text-gray-200'}`}
          >
             {homeValue}
          </button>
          <button 
            onClick={onAwayClick} 
            disabled={!onAwayClick}
            title={onAwayClick ? `Registar ${title} (Fora)` : ''}
            className={`text-xl font-mono font-bold transition text-right ${onAwayClick ? 'cursor-pointer hover:text-brand-light active:scale-95' : 'cursor-default'} ${variant === 'danger' ? 'text-red-500' : 'text-brand'}`}
          >
             {awayValue}
          </button>
       </div>

       {progressBar && (
           <div className="h-1 w-full bg-dark-surface rounded-full overflow-hidden flex relative mt-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-dark-bg z-10"></div>
              <div style={{ width: `${homePercent}%` }} className={`h-full transition-all duration-500 ${homeActive ? (variant === 'danger' ? 'bg-red-600' : 'bg-white') : 'bg-gray-500'}`}></div>
              <div style={{ width: `${100 - homePercent}%` }} className={`h-full transition-all duration-500 ${awayActive ? (variant === 'danger' ? 'bg-red-500' : 'bg-brand') : (variant === 'danger' ? 'bg-red-900/40' : 'bg-brand/70')}`}></div>
           </div>
       )}
    </div>
  );
}

// 1. Linha da NOSSA EQUIPA (Consola Individual)
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
                    <button onClick={() => onAction('pass_success')} title="Passe Certo" className="w-7 h-6 flex items-center justify-center rounded bg-green-900/20 text-green-500 hover:bg-green-500 hover:text-black border border-green-500/30 transition"><ArrowUpRight size={12} /></button>
                    <button onClick={() => onAction('pass_fail')} title="Passe Falhado" className="w-7 h-6 flex items-center justify-center rounded bg-red-900/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/30 transition"><ArrowDownRight size={12} /></button>
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Remate</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('shot_on_target')} title="Remate à Baliza" className="w-7 h-6 flex items-center justify-center rounded bg-blue-900/20 text-blue-500 hover:bg-blue-500 hover:text-white border border-blue-500/30 transition"><Target size={12} /></button>
                    <button onClick={() => onAction('shot_off_target')} title="Remate para Fora" className="w-7 h-6 flex items-center justify-center rounded bg-gray-700/20 text-gray-400 hover:bg-gray-500 hover:text-white border border-gray-500/30 transition"><BanIcon size={12} /></button>
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-brand/70 font-bold uppercase tracking-tighter">Golo</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('goal')} title="Golo" className="w-7 h-6 flex items-center justify-center rounded bg-brand/20 text-brand hover:bg-brand hover:text-black border border-brand/30 transition font-bold"><Goal size={12} /></button>
                    <button onClick={() => onAction('assist')} title="Assistência" className="w-7 h-6 flex items-center justify-center rounded bg-purple-900/20 text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/30 transition"><Footprints size={12} /></button>
                </div>
            </div>
            <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Discipl.</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('foul_committed')} title="Falta Cometida" className="w-5 h-6 flex items-center justify-center rounded bg-orange-900/20 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/30 transition"><Hand size={10} /></button>
                    <button onClick={() => onAction('foul_won')} title="Falta Sofrida" className="w-5 h-6 flex items-center justify-center rounded bg-indigo-900/20 text-indigo-500 hover:bg-indigo-500 hover:text-white border border-indigo-500/30 transition"><Shield size={10} /></button>
                    <button onClick={() => onAction('yellow_card')} title="Cartão Amarelo" className="w-5 h-6 flex items-center justify-center rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-400 hover:text-black border border-yellow-500/20 transition"><Square size={8} fill="currentColor" /></button>
                    <button onClick={() => onAction('red_card')} title="Cartão Vermelho" className="w-5 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black border border-red-500/20 transition"><Square size={8} fill="currentColor" /></button>
                </div>
            </div>
             <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Sub</span>
                <button onClick={() => onAction('sub_out')} title="Sair de Campo" className="w-7 h-6 flex items-center justify-center rounded bg-gray-800 text-gray-500 hover:bg-white hover:text-black border border-gray-600 transition"><UserMinus size={12} /></button>
            </div>
        </div>
    ) : (
        <div className="flex-1 flex gap-2 justify-end items-center">
            <span className="text-[9px] text-gray-600 italic mr-2">Suplente</span>
            <button onClick={() => onAction('sub_in')} title="Entrar em Campo" className="px-3 h-6 flex items-center justify-center rounded bg-brand/20 text-brand hover:bg-brand hover:text-black border border-brand/30 transition text-[9px] font-bold uppercase tracking-wider gap-1">
                <UserPlus size={12} /> Entrar
            </button>
        </div>
    )}
  </div>
);

// 2. Linha do ADVERSÁRIO (Consola Individual)
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
                <button onClick={() => onAction('goal')} title="Golo Adversário" className="w-7 h-6 flex items-center justify-center rounded bg-brand/20 text-brand hover:bg-brand hover:text-black border border-brand/30 transition"><Goal size={12} /></button>
             </div>
             <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Discipl.</span>
                <div className="flex gap-0.5">
                    <button onClick={() => onAction('yellow_card')} title="Cartão Amarelo Adversário" className="w-6 h-6 flex items-center justify-center rounded bg-yellow-500/10 text-yellow-500 hover:bg-yellow-400 hover:text-black border border-yellow-500/20 transition"><Square size={10} fill="currentColor" /></button>
                    <button onClick={() => onAction('red_card')} title="Cartão Vermelho Adversário" className="w-6 h-6 flex items-center justify-center rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-black border border-red-500/20 transition"><Square size={10} fill="currentColor" /></button>
                </div>
             </div>
             <div className="flex flex-col items-center gap-0.5 border-l border-dark-border/50 pl-1">
                <span className="text-[7px] text-gray-600 font-bold uppercase tracking-tighter">Sub</span>
                <button onClick={() => onAction('sub_out')} title="Sair de Campo Adversário" className="w-7 h-6 flex items-center justify-center rounded bg-gray-800 text-gray-500 hover:bg-white hover:text-black border border-gray-600 transition"><UserMinus size={12} /></button>
             </div>
        </div>
      ) : (
        <div className="flex-1 flex gap-2 justify-end items-center">
             <button onClick={() => onAction('sub_in')} title="Entrar em Campo Adversário" className="px-2 h-6 flex items-center justify-center rounded bg-gray-700/50 text-gray-400 hover:bg-white hover:text-black border border-gray-600 transition text-[9px] font-bold uppercase tracking-wider gap-1">
                <UserPlus size={12} /> Entrar
            </button>
        </div>
      )}
    </div>
);

// --- COMPONENTE PRINCIPAL ---

const AnalysisConsole: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  const role = localStorage.getItem('userRole') || 'admin';
  
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'collective' | 'individual'>('collective');
  const [currentHalf, setCurrentHalf] = useState<1 | 2>(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  const [possession, setPossession] = useState({ home: 0, away: 0 });
  const [activePossession, setActivePossession] = useState<'home' | 'away' | null>(null);
  const possessionInterval = useRef<any>(null);

  // Estado Local de Quem está em Campo (Individual)
  const [playersOnPitch, setPlayersOnPitch] = useState<Record<string, boolean>>({});

  // Initial Load
  useEffect(() => {
    if (!id) return;
    
    // Forçar aba correta baseada na função
    if (role === 'analistaind' || role === 'admin') setActiveTab('individual');
    else if (role === 'analistacol') setActiveTab('collective');

    const loadData = async () => {
      const { data: matchData } = await supabase.from('matches').select('*').eq('id', id).single();
      setMatch(matchData);
      
      if (matchData) {
          if (matchData.current_game_seconds) setTimerSeconds(matchData.current_game_seconds);
          if (matchData.current_half) setCurrentHalf(matchData.current_half as 1 | 2);
          const savedHome = matchData.possession_home || 0;
          const savedAway = matchData.possession_away || 0;
          setPossession({ home: savedHome, away: savedAway });
      }
      
      const { data: playerData } = await supabase.from('players').select('*').eq('match_id', id).order('number', { ascending: true });
      if (playerData) {
          setPlayers(playerData);
          // Inicializar estado dos jogadores (Baseado em is_starter)
          const initialPitchState: Record<string, boolean> = {};
          playerData.forEach(p => { initialPitchState[p.id] = p.is_starter; });
          setPlayersOnPitch(initialPitchState);
      }

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
    if (possessionInterval.current) clearInterval(possessionInterval.current);
    if (activePossession && id) {
      possessionInterval.current = window.setInterval(() => {
        setPossession(prev => {
           const nextVal = prev[activePossession] + 1;
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

    // Validação de 11 jogadores se for entrada
    if (type === 'sub_in' && playerId) {
        const teamPlayers = players.filter(p => p.team === team);
        const activeCount = teamPlayers.filter(p => playersOnPitch[p.id] !== undefined ? playersOnPitch[p.id] : p.is_starter).length;
        if (activeCount >= 11) {
            alert("Limite de 11 jogadores atingido. Registe a saída de um jogador primeiro.");
            return;
        }
    }

    const videoTime = playerRef.current?.getCurrentTime() || 0;
    const matchMinute = Math.floor(timerSeconds / 60) + 1; 
    const validUUID = generateUUID();

    // Atualizar estado local de quem está em campo
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
        setEvents(prev => prev.filter(e => e.id !== validUUID));
        return;
    }

    if (type === 'goal') updateMatchScore(team, 1);
  };

  const updateMatchScore = async (team: 'home' | 'away', increment: number) => {
      if (!match || !id) return;
      const newHomeScore = team === 'home' ? match.home_score + increment : match.home_score;
      const newAwayScore = team === 'away' ? match.away_score + increment : match.away_score;
      setMatch(prev => prev ? { ...prev, home_score: newHomeScore, away_score: newAwayScore } : null);
      await supabase.from('matches').update({ home_score: newHomeScore, away_score: newAwayScore }).eq('id', id);
  };

  const deleteEvent = async (eventId: string, type: EventType, team: 'home' | 'away', e: React.MouseEvent) => {
      e.stopPropagation();
      if (!window.confirm("Pretende anular este evento permanentemente?")) return;
      setEvents(prev => prev.filter(ev => ev.id !== eventId));
      const { error } = await supabase.from('match_events').delete().eq('id', eventId);
      if (!error && type === 'goal') updateMatchScore(team, -1);
  };
  
  const resetTimer = async () => {
      if(!window.confirm("Reiniciar cronómetro de jogo para 00:00?")) return;
      setIsTimerRunning(false);
      setTimerSeconds(0);
      if (id) await supabase.from('matches').update({ current_game_seconds: 0 }).eq('id', id);
  }

  const handleTimeEdit = (minutes: string) => {
    const mins = parseInt(minutes);
    if (!isNaN(mins)) setTimerSeconds(mins * 60 + (timerSeconds % 60));
  };
  
  const formatTimeSimple = (seconds: number) => {
     const m = Math.floor(seconds / 60).toString().padStart(2, '0');
     const s = (seconds % 60).toString().padStart(2, '0');
     return `${m}:${s}`;
  }

  const liveScore = useMemo(() => ({
    home: events.filter(e => e.team === 'home' && e.type === 'goal').length,
    away: events.filter(e => e.team === 'away' && e.type === 'goal').length
  }), [events]);

  const stats = useMemo(() => {
    const calc = (team: 'home' | 'away', type: EventType) => events.filter(e => e.team === team && e.type === type).length;
    return {
      home: { 
          goals: calc('home', 'goal'), shotsOn: calc('home', 'shot_on_target'), shotsOff: calc('home', 'shot_off_target'),
          foulsCommitted: calc('home', 'foul_committed'), foulsWon: calc('home', 'foul_won'), yellow: calc('home', 'yellow_card'),
          red: calc('home', 'red_card'), loss: calc('home', 'ball_loss'), recovery: calc('home', 'ball_recovery'),
          corners: calc('home', 'corner')
      },
      away: { 
          goals: calc('away', 'goal'), shotsOn: calc('away', 'shot_on_target'), shotsOff: calc('away', 'shot_off_target'),
          foulsCommitted: calc('away', 'foul_committed'), foulsWon: calc('away', 'foul_won'), yellow: calc('away', 'yellow_card'),
          red: calc('away', 'red_card'), loss: calc('away', 'ball_loss'), recovery: calc('away', 'ball_recovery'),
          corners: calc('away', 'corner')
      }
    };
  }, [events]);

  const timeSinceShot = useMemo(() => {
    const calcTeamTime = (team: 'home' | 'away') => {
        const teamShots = events.filter(e => e.team === team && ['shot_on_target', 'shot_off_target', 'goal'].includes(e.type));
        const getEventSeconds = (e: MatchEvent) => e.game_seconds ?? ((e.match_minute > 0 ? e.match_minute - 1 : 0) * 60);
        const pastShots = teamShots.filter(e => getEventSeconds(e) <= timerSeconds);
        if (pastShots.length === 0) return timerSeconds;
        pastShots.sort((a, b) => getEventSeconds(b) - getEventSeconds(a));
        const diff = timerSeconds - getEventSeconds(pastShots[0]);
        return diff > 0 ? diff : 0;
    };
    return { home: calcTeamTime('home'), away: calcTeamTime('away') };
  }, [events, timerSeconds]);

  const totalTime = possession.home + possession.away || 1;
  const homePossessionPct = Math.round((possession.home / totalTime) * 100);
  const displayMinutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const displaySeconds = (timerSeconds % 60).toString().padStart(2, '0');

  // Lógica de Separação de Equipas para Individual
  const myTeamSide = match?.my_team_side || 'home'; 
  const opponentSide = myTeamSide === 'home' ? 'away' : 'home';

  const getActiveAndBench = (team: 'home' | 'away') => {
      const teamPlayers = players.filter(p => p.team === team);
      const active: Player[] = [];
      const bench: Player[] = [];
      teamPlayers.forEach(p => {
          const isOnPitch = playersOnPitch[p.id] !== undefined ? playersOnPitch[p.id] : p.is_starter;
          if (isOnPitch) active.push(p); else bench.push(p);
      });
      return { active, bench };
  };

  const mySquad = getActiveAndBench(myTeamSide);
  const opponentSquad = getActiveAndBench(opponentSide);

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-brand transition"><ArrowLeft size={18} /></button>
          <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
          <div className="flex flex-col ml-2 border-l border-gray-800 pl-3">
             <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Live Console</span>
             <span className="text-[10px] text-gray-500 font-mono">System v1.9</span>
          </div>
        </div>

        {/* Central Scoreboard */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-dark-surface h-full flex flex-row items-center justify-center gap-6 px-6 border-x border-dark-border/50 shadow-2xl min-w-[500px]">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-right w-32 truncate hidden md:block">{match?.home_team}</div>
           <div className="text-3xl font-mono font-bold text-white tracking-widest">{liveScore.home}<span className="text-brand mx-2">:</span>{liveScore.away}</div>
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-left w-32 truncate hidden md:block">{match?.away_team}</div>
           <div className="h-8 w-px bg-dark-border mx-2"></div>
           <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-dark-border/30">
              <button onClick={() => updateHalf(1)} className={`text-[9px] font-bold px-2 py-1 rounded transition uppercase ${currentHalf === 1 ? 'bg-brand text-black' : 'text-gray-500 hover:text-white'}`}>1ª P</button>
              <button onClick={() => updateHalf(2)} className={`text-[9px] font-bold px-2 py-1 rounded transition uppercase ${currentHalf === 2 ? 'bg-brand text-black' : 'text-gray-500 hover:text-white'}`}>2ª P</button>
           </div>
           <div className="h-8 w-px bg-dark-border mx-2"></div>
           <div className="flex items-center gap-2">
              <button onClick={toggleTimer} className={`text-[10px] transition ${isTimerRunning ? 'text-brand' : 'text-gray-500 hover:text-white'}`}>{isTimerRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}</button>
              <div className="flex items-center text-xl font-mono font-bold text-gray-200 bg-black px-2 py-1 rounded border border-dark-border">
                 <input type="number" className="bg-transparent w-10 text-center focus:outline-none appearance-none" value={displayMinutes} onChange={(e) => handleTimeEdit(e.target.value)} />
                 <span className={`mx-0.5 ${isTimerRunning ? 'animate-pulse text-brand' : 'text-gray-600'}`}>:</span>
                 <span className="w-6 text-center">{displaySeconds}</span>
              </div>
               <button onClick={resetTimer} className="text-gray-600 hover:text-red-500"><RotateCcw size={14} /></button>
           </div>
        </div>

        <div className="flex items-center gap-4 w-1/3 justify-end">
           {id && <VoiceChat matchId={id} role={role} />}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video */}
        <div className="w-5/12 flex flex-col border-r border-dark-border bg-black relative justify-center">
            <div className="aspect-video bg-black shadow-lg">
                {match?.youtube_url ? (
                    <ReactPlayer ref={playerRef} url={match.youtube_url} width="100%" height="100%" controls={true} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs uppercase tracking-widest">No Signal</div>
                )}
            </div>
        </div>

        {/* Right: Controls */}
        <div className="w-7/12 flex flex-col bg-dark-surface overflow-hidden">
           <div className="flex border-b border-dark-border shrink-0">
              {/* O analistacol apenas vê o painel coletivo */}
              {role === 'analistacol' && (
                <button onClick={() => setActiveTab('collective')} className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'collective' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                   <Layers size={14} /> Painel Coletivo
                </button>
              )}
              {/* Bloqueia a versão admin e analistaind para o coletivo (vêem apenas individual) */}
              {(role === 'admin' || role === 'analistaind') && (
                <button onClick={() => setActiveTab('individual')} className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition ${activeTab === 'individual' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                   <User size={14} /> Painel Individual
                </button>
              )}
           </div>

           <div className="flex-1 overflow-y-auto bg-dark-bg/50 custom-scrollbar">
              {activeTab === 'collective' ? (
                 <div className="p-6 flex flex-col gap-6">
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          <StatCard title="Posse Real (Tempo)" icon={Clock} homeValue={formatTimeSimple(possession.home)} awayValue={formatTimeSimple(possession.away)} homeActive={activePossession === 'home'} awayActive={activePossession === 'away'} helperText="A | S | D" />
                          <StatCard title="Golos" icon={Goal} homeValue={stats.home.goals} awayValue={stats.away.goals} onHomeClick={() => addEvent('goal', 'home')} onAwayClick={() => addEvent('goal', 'away')} />
                          <StatCard title="Remate Alvo" icon={Crosshair} homeValue={stats.home.shotsOn} awayValue={stats.away.shotsOn} onHomeClick={() => addEvent('shot_on_target', 'home')} onAwayClick={() => addEvent('shot_on_target', 'away')} />
                          <StatCard title="Remate Fora" icon={Ban} homeValue={stats.home.shotsOff} awayValue={stats.away.shotsOff} onHomeClick={() => addEvent('shot_off_target', 'home')} onAwayClick={() => addEvent('shot_off_target', 'away')} />
                          <StatCard title="Falta Cometida" icon={Hand} homeValue={stats.home.foulsCommitted} awayValue={stats.away.foulsCommitted} onHomeClick={() => addEvent('foul_committed', 'home')} onAwayClick={() => addEvent('foul_committed', 'away')} />
                          <StatCard title="Falta Sofrida" icon={ShieldAlert} homeValue={stats.home.foulsWon} awayValue={stats.away.foulsWon} onHomeClick={() => addEvent('foul_won', 'home')} onAwayClick={() => addEvent('foul_won', 'away')} />
                          <StatCard title="Cartão Amarelo" icon={RectangleHorizontal} homeValue={stats.home.yellow} awayValue={stats.away.yellow} onHomeClick={() => addEvent('yellow_card', 'home')} onAwayClick={() => addEvent('yellow_card', 'away')} />
                          <StatCard title="Cartão Vermelho" icon={RectangleHorizontal} homeValue={stats.home.red} awayValue={stats.away.red} onHomeClick={() => addEvent('red_card', 'home')} onAwayClick={() => addEvent('red_card', 'away')} variant="danger" />
                          <StatCard title="Perda de Bola" icon={AlertTriangle} homeValue={stats.home.loss} awayValue={stats.away.loss} onHomeClick={() => addEvent('ball_loss', 'home')} onAwayClick={() => addEvent('ball_loss', 'away')} />
                          <StatCard title="Recuperação" icon={Shield} homeValue={stats.home.recovery} awayValue={stats.away.recovery} onHomeClick={() => addEvent('ball_recovery', 'home')} onAwayClick={() => addEvent('ball_recovery', 'away')} />
                          <StatCard title="Cantos" icon={Activity} homeValue={stats.home.corners} awayValue={stats.away.corners} onHomeClick={() => addEvent('corner', 'home')} onAwayClick={() => addEvent('corner', 'away')} />
                          <StatCard title="T. Sem Remate" icon={Timer} homeValue={formatTimeSimple(timeSinceShot.home)} awayValue={formatTimeSimple(timeSinceShot.away)} progressBar={false} helperText="MM:SS" />
                     </div>
                     <div className="bg-dark-card border border-dark-border rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2 px-1 relative">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{match?.home_team || 'CASA'}</span>
                            <span className="absolute left-1/2 -translate-x-1/2 text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Posse de Bola</span>
                            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">{match?.away_team || 'FORA'}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono text-lg text-white">
                            <span className="font-bold">{homePossessionPct}%</span>
                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden flex"><div className="bg-white" style={{width: `${homePossessionPct}%`}}></div><div className="bg-brand" style={{width: `${100-homePossessionPct}%`}}></div></div>
                            <span className="font-bold text-brand">{100 - homePossessionPct}%</span>
                        </div>
                    </div>
                    <div className="bg-dark-card border border-dark-border rounded-xl flex flex-col h-80 overflow-hidden">
                         <div className="bg-dark-surface p-3 border-b border-dark-border text-[10px] font-bold uppercase text-gray-500">Event Log</div>
                         <div className="flex-1 overflow-y-auto divide-y divide-dark-border">
                             {events.map(ev => (
                                <div key={ev.id} onClick={() => playerRef.current?.seekTo(ev.video_timestamp, 'seconds')} className="p-3 flex items-center justify-between hover:bg-dark-surface cursor-pointer group transition">
                                   <div className="flex items-center gap-3">
                                        <span className="font-mono text-brand text-xs w-8 text-right">{ev.match_minute}'</span>
                                        <div className="w-1 h-8 bg-dark-border group-hover:bg-brand transition"></div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-200 uppercase">{ev.type.replace('_', ' ')}</div>
                                            <div className="text-[10px] text-gray-500">{ev.team === 'home' ? match?.home_team : match?.away_team} {ev.player && `• #${ev.player.number} ${ev.player.name}`}</div>
                                        </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <button onClick={(e) => deleteEvent(ev.id, ev.type, ev.team, e)} className="text-gray-500 hover:text-red-500 p-2"><Trash2 size={14} /></button>
                                   </div>
                                </div>
                              ))}
                         </div>
                    </div>
                 </div>
              ) : (
                  <div className="flex h-full">
                     {/* Nossa Equipa */}
                     <div className="flex-1 flex flex-col border-r border-dark-border">
                         <div className="bg-dark-surface p-3 border-b border-dark-border flex justify-between items-center sticky top-0 z-10">
                              <h2 className="text-sm font-bold text-white uppercase tracking-widest border-l-4 border-brand pl-2">{myTeamSide === 'home' ? match?.home_team : match?.away_team}</h2>
                              <span className="text-[9px] bg-brand text-black px-2 py-0.5 rounded font-bold">MINHA EQUIPA</span>
                         </div>
                         <div className="flex-1 overflow-y-auto p-2">
                             <div className="mb-4">
                                 <h3 className="text-[9px] text-brand font-bold uppercase mb-2 tracking-widest">Em Campo</h3>
                                 {mySquad.active.map(player => (
                                     <OurPlayerRow key={player.id} player={player} isOnPitch={true} onAction={(type) => addEvent(type, myTeamSide, player.id)} />
                                 ))}
                             </div>
                             <div className="border-t border-dark-border pt-4">
                                 <h3 className="text-[9px] text-gray-500 font-bold uppercase mb-2">Banco</h3>
                                 {mySquad.bench.map(player => (
                                     <OurPlayerRow key={player.id} player={player} isOnPitch={false} onAction={(type) => addEvent(type, myTeamSide, player.id)} />
                                 ))}
                             </div>
                         </div>
                     </div>
                     {/* Adversário */}
                     <div className="w-1/3 flex flex-col bg-dark-surface/50">
                         <div className="bg-dark-surface p-3 border-b border-dark-border flex justify-between items-center sticky top-0 z-10">
                              <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-l-4 border-gray-600 pl-2">{opponentSide === 'home' ? match?.home_team : match?.away_team}</h2>
                         </div>
                         <div className="flex-1 overflow-y-auto p-2">
                              <h3 className="text-[9px] text-gray-400 font-bold uppercase mb-2">Em Campo</h3>
                              {opponentSquad.active.map(player => (
                                  <OpponentPlayerRow key={player.id} player={player} isOnPitch={true} onAction={(type) => addEvent(type, opponentSide, player.id)} />
                              ))}
                              <div className="border-t border-dark-border mt-4 pt-4">
                                  <h3 className="text-[9px] text-gray-600 font-bold uppercase mb-2">Banco</h3>
                                  {opponentSquad.bench.map(player => (
                                      <OpponentPlayerRow key={player.id} player={player} isOnPitch={false} onAction={(type) => addEvent(type, opponentSide, player.id)} />
                                  ))}
                              </div>
                         </div>
                     </div>
                  </div>
              )}
           </div>
           <div className="bg-dark-surface p-2 border-t border-dark-border text-[10px] text-gray-600 flex justify-between font-mono shrink-0">
              <span>Posse: A (Casa) | S (Stop) | D (Fora)</span>
              <span>VPRO3 SYSTEM ANALYST</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConsole;

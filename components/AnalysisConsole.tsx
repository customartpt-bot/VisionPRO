
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, MatchEvent, EventType } from '../types';
import { 
  Play, Pause, ArrowLeft, Layers, User, RotateCcw, 
  Clock, Crosshair, Shield, Hand, Timer, Activity, Goal,
  AlertTriangle, RectangleHorizontal, ShieldAlert, Ban, Trash2,
  ArrowUpRight, ArrowDownRight, Target, Footprints, UserMinus, UserPlus, Square, PlayCircle,
  Zap, Disc
} from 'lucide-react';
import VoiceChat from './VoiceChat';

const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
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
  progressBar?: boolean;
  variant?: 'default' | 'danger';
  labelRight?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, icon: Icon, homeValue, awayValue, onHomeClick, onAwayClick, 
  homeActive, awayActive, progressBar = true, variant = 'default',
  labelRight
}) => {
  let homePercent = 50;
  if (typeof homeValue === 'string' && homeValue.includes(':')) {
      const hParts = homeValue.split(':').map(Number);
      const aParts = (awayValue as string).split(':').map(Number);
      const hSecs = hParts[0] * 60 + hParts[1];
      const aSecs = aParts[0] * 60 + aParts[1];
      const total = hSecs + aSecs;
      homePercent = total === 0 ? 50 : (hSecs / total) * 100;
  } else {
      const hVal = typeof homeValue === 'number' ? homeValue : parseFloat(homeValue as string);
      const aVal = typeof awayValue === 'number' ? awayValue : parseFloat(awayValue as string);
      const total = hVal + aVal;
      homePercent = total === 0 ? 50 : (hVal / total) * 100;
  }

  const baseBorder = variant === 'danger' ? 'border-red-900/40 bg-red-900/5' : 'border-dark-border bg-dark-card/40';
  const titleColor = variant === 'danger' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className={`border rounded-lg p-3 flex flex-col justify-between relative overflow-hidden transition-all duration-300 group select-none ${baseBorder} hover:border-gray-600`}>
       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon size={12} className={titleColor} />
            <span className={`text-[9px] font-bold uppercase tracking-widest ${titleColor}`}>{title}</span>
          </div>
          {labelRight && <span className="text-[8px] font-mono text-gray-600 border border-dark-border px-1 rounded uppercase">{labelRight}</span>}
       </div>

       <div className="flex justify-between items-end mb-3 relative z-10">
          <button onClick={onHomeClick} disabled={!onHomeClick} className={`text-2xl font-mono font-bold transition leading-none ${onHomeClick ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'} ${homeActive ? 'text-white' : 'text-gray-300'}`}>{homeValue}</button>
          <button onClick={onAwayClick} disabled={!onAwayClick} className={`text-2xl font-mono font-bold transition leading-none text-brand ${onAwayClick ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'} ${awayActive ? 'text-brand' : 'text-brand/80'}`}>{awayValue}</button>
       </div>

       {progressBar && (
           <div className="h-1 w-full bg-dark-surface rounded-full overflow-hidden flex relative z-0">
              <div style={{ width: `${homePercent}%` }} className={`h-full transition-all duration-500 ${variant === 'danger' ? 'bg-red-600' : 'bg-gray-500'}`}></div>
              <div style={{ width: `${100 - homePercent}%` }} className="h-full bg-brand transition-all duration-500"></div>
           </div>
       )}
    </div>
  );
}

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
  const [statView, setStatView] = useState<'1' | '2' | 'total'>('total');
  
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [halfSplitSeconds, setHalfSplitSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  // Split Possession State
  const [possession1, setPossession1] = useState({ home: 0, away: 0 });
  const [possession2, setPossession2] = useState({ home: 0, away: 0 });
  const [activePossession, setActivePossession] = useState<'home' | 'away' | null>(null);
  const [clockMode, setClockMode] = useState<'1' | '2' | 'total'>('1');
  
  const [playersOnPitch, setPlayersOnPitch] = useState<Record<string, boolean>>({});
  const channelRef = useRef<any>(null);

  // Set default tab based on role and restriction
  useEffect(() => {
    if (role === 'analistacol') {
        setActiveTab('collective');
    }
  }, [role]);

  // Keyboard Shortcuts for Possession - GLOBAL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        switch(e.key.toLowerCase()) {
            case 'a': setActivePossession('home'); break;
            case 'd': setActivePossession('away'); break;
            case 's': setActivePossession(null); break;
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Possession Timer
  useEffect(() => {
    let interval: any;
    if (activePossession) {
        interval = setInterval(() => {
            // Determine which bucket to fill based on Active View or Current Half
            // If viewing Tab 1 -> Edit P1. If viewing Tab 2 -> Edit P2.
            // If Viewing Total -> Edit based on Current Half.
            const isP1 = statView === '1' || (statView === 'total' && currentHalf === 1);
            
            if (isP1) {
                setPossession1(prev => ({ ...prev, [activePossession]: prev[activePossession] + 1 }));
            } else {
                setPossession2(prev => ({ ...prev, [activePossession]: prev[activePossession] + 1 }));
            }
        }, 1000);
    }
    return () => clearInterval(interval);
  }, [activePossession, statView, currentHalf]);

  // Periodic Possession Save
  useEffect(() => {
    const saveInterval = setInterval(async () => {
        if(id && (role === 'analistacol' || role === 'admin')) {
             const totalHome = possession1.home + possession2.home;
             const totalAway = possession1.away + possession2.away;

             // Save Total to Matches
             await supabase.from('matches').update({ 
                 possession_home: totalHome, 
                 possession_away: totalAway 
             }).eq('id', id);

             // Also Sync Snapshot to Event if P1 is modified
             // This allows editing P1 even if in P2
             const hSnap = events.find(e => e.type === 'possession_update' && e.team === 'home');
             const aSnap = events.find(e => e.type === 'possession_update' && e.team === 'away');
             
             if (hSnap && hSnap.video_timestamp !== possession1.home) {
                 await supabase.from('match_events').update({ video_timestamp: possession1.home }).eq('id', hSnap.id);
             }
             if (aSnap && aSnap.video_timestamp !== possession1.away) {
                 await supabase.from('match_events').update({ video_timestamp: possession1.away }).eq('id', aSnap.id);
             }
        }
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [id, role, possession1, possession2, events]);

  useEffect(() => {
    if (!id) return;
    
    const channel = supabase.channel(`match_sync_${id}`, { config: { broadcast: { self: true } } })
    .on('broadcast', { event: 'timer_tick' }, ({ payload }) => {
        if (role !== 'analistacol' && role !== 'admin') {
            setTimerSeconds(payload.seconds);
            setIsTimerRunning(payload.is_running);
            if (payload.half) {
                setCurrentHalf(payload.half);
            }
            if (payload.split !== undefined) setHalfSplitSeconds(payload.split);
        }
    }).subscribe();
    channelRef.current = channel;

    const loadData = async () => {
      const { data: mData } = await supabase.from('matches').select('*').eq('id', id).single();
      const { data: eData } = await supabase.from('match_events').select('*, player:players(name, number)').eq('match_id', id).order('created_at', { ascending: false });
      
      if (mData) {
          setMatch(mData);
          setTimerSeconds(mData.current_game_seconds || 0);
          setHalfSplitSeconds(mData.half_split_seconds || 0);
          if (mData.current_half) {
              setCurrentHalf(mData.current_half as 1 | 2);
              setStatView(String(mData.current_half) as '1' | '2');
              setClockMode(String(mData.current_half) as '1'|'2');
          }
          setIsTimerRunning(mData.is_timer_running || false);
          
          // Logic to split possession from Total + Snapshot
          const eventsList = eData || [];
          const h1HomeSnap = eventsList.find(e => e.type === 'possession_update' && e.team === 'home');
          const h1AwaySnap = eventsList.find(e => e.type === 'possession_update' && e.team === 'away');
          
          const totalHome = mData.possession_home || 0;
          const totalAway = mData.possession_away || 0;

          if (h1HomeSnap || h1AwaySnap) {
              const p1Home = h1HomeSnap ? h1HomeSnap.video_timestamp : 0;
              const p1Away = h1AwaySnap ? h1AwaySnap.video_timestamp : 0;
              setPossession1({ home: p1Home, away: p1Away });
              setPossession2({ home: Math.max(0, totalHome - p1Home), away: Math.max(0, totalAway - p1Away) });
          } else {
              // No snapshot means everything is P1 (or not started P2)
              setPossession1({ home: totalHome, away: totalAway });
              setPossession2({ home: 0, away: 0 });
          }
      }

      const { data: pData } = await supabase.from('players').select('*').eq('match_id', id).order('number');
      if (pData) {
          setPlayers(pData);
          const pit: Record<string, boolean> = {};
          pData.forEach(p => pit[p.id] = p.is_starter);
          setPlayersOnPitch(pit);
      }
      setEvents(eData || []);
    };
    loadData();

    const eventSub = supabase.channel(`analysis_events_${id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, (payload) => {
         if (payload.eventType === 'INSERT') setEvents(p => [payload.new as MatchEvent, ...p]);
         else if (payload.eventType === 'DELETE') setEvents(p => p.filter(e => e.id !== payload.old.id));
         else if (payload.eventType === 'UPDATE') {
             // Handle Updates (e.g. from Sync)
             setEvents(prev => prev.map(e => e.id === payload.new.id ? payload.new as MatchEvent : e));
         }
      }).subscribe();

    return () => { supabase.removeChannel(eventSub); supabase.removeChannel(channel); };
  }, [id, role]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
            const next = prev + 1;
            
            // LÓGICA DE CONTINUIDADE
            let currentSplit = halfSplitSeconds;
            if (currentHalf === 1 && halfSplitSeconds > 0 && (role === 'analistacol' || role === 'admin')) {
                currentSplit = halfSplitSeconds + 1;
                setHalfSplitSeconds(currentSplit);
            }

            if (role === 'analistacol' || role === 'admin') {
                channelRef.current?.send({ 
                  type: 'broadcast', 
                  event: 'timer_tick', 
                  payload: { seconds: next, is_running: true, half: currentHalf, split: currentSplit } 
                });
            }
            if (next % 5 === 0 && id && (role === 'analistacol' || role === 'admin')) {
                 const updates: any = { current_game_seconds: next };
                 if (currentHalf === 1 && halfSplitSeconds > 0) {
                     updates.half_split_seconds = currentSplit;
                 }
                 supabase.from('matches').update(updates).eq('id', id).then();
            }
            return next;
        });
      }, 1000);
    } else {
       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isTimerRunning, id, role, currentHalf, halfSplitSeconds]);

  const updateHalf = async (half: 1 | 2) => {
      if (role !== 'analistacol' && role !== 'admin') return;
      let newSplit = halfSplitSeconds;

      if (half === 2 && currentHalf === 1) {
          if (newSplit === 0) {
              newSplit = timerSeconds;
              setHalfSplitSeconds(newSplit);
          }
          
          // Upsert Snapshot at end of 1st half
          if (id) {
              const hSnap = events.find(e => e.type === 'possession_update' && e.team === 'home');
              const aSnap = events.find(e => e.type === 'possession_update' && e.team === 'away');

              if (!hSnap) {
                  await supabase.from('match_events').insert({
                      match_id: id, type: 'possession_update', team: 'home',
                      video_timestamp: possession1.home, match_minute: 45, game_seconds: 0, half: 1
                  });
              }
              if (!aSnap) {
                   await supabase.from('match_events').insert({
                      match_id: id, type: 'possession_update', team: 'away',
                      video_timestamp: possession1.away, match_minute: 45, game_seconds: 0, half: 1
                  });
              }
          }
          
          setActivePossession(null);
      }
      
      setCurrentHalf(half);
      setClockMode(String(half) as '1'|'2');
      setStatView(String(half) as '1' | '2');

      channelRef.current?.send({ 
        type: 'broadcast', 
        event: 'timer_tick', 
        payload: { seconds: timerSeconds, is_running: isTimerRunning, half, split: newSplit } 
      });
      if (id) await supabase.from('matches').update({ current_half: half, half_split_seconds: newSplit }).eq('id', id);
  };

  const addEvent = async (type: EventType, team: 'home' | 'away', playerId?: string) => {
    if (!id) return;
    const videoTime = playerRef.current?.getCurrentTime() || 0;
    const matchMin = Math.floor(timerSeconds / 60) + 1; 
    const vId = generateUUID();

    const optimisticEvent: MatchEvent = {
        id: vId,
        match_id: id,
        type,
        team,
        player_id: playerId || null,
        video_timestamp: videoTime,
        match_minute: matchMin,
        game_seconds: timerSeconds,
        half: currentHalf,
        created_at: new Date().toISOString(),
        player: playerId ? players.find(p => p.id === playerId) : undefined
    };

    setEvents(prev => [optimisticEvent, ...prev]);

    if (playerId) {
        if (type === 'sub_out') setPlayersOnPitch(p => ({ ...p, [playerId]: false }));
        else if (type === 'sub_in') setPlayersOnPitch(p => ({ ...p, [playerId]: true }));
    }

    if (type === 'goal') {
        const hS = (match?.home_score || 0) + (team === 'home' ? 1 : 0);
        const aS = (match?.away_score || 0) + (team === 'away' ? 1 : 0);
        setMatch(prev => prev ? ({ ...prev, home_score: hS, away_score: aS }) : null);
        await supabase.from('matches').update({ home_score: hS, away_score: aS }).eq('id', id);
    }

    const { error } = await supabase.from('match_events').insert([{ id: vId, match_id: id, type, team, player_id: playerId || null, video_timestamp: videoTime, match_minute: matchMin, game_seconds: timerSeconds, half: currentHalf }]);
    
    if (error) {
        console.error("Error adding event:", error);
        setEvents(prev => prev.filter(e => e.id !== vId));
    }
  };

  const stats = useMemo(() => {
    // Filter out technical events like possession_update from the stats calculation
    const fEvs = statView === 'total' 
        ? events.filter(e => e.type !== 'possession_update')
        : events.filter(e => String(e.half) === statView && e.type !== 'possession_update');
    
    const calc = (tm: 'home' | 'away', tp: EventType) => fEvs.filter(e => e.team === tm && e.type === tp).length;
    
    const lastShotTime = (tm: 'home' | 'away') => {
        const lastShot = fEvs.find(e => e.team === tm && (e.type === 'shot_on_target' || e.type === 'shot_off_target' || e.type === 'goal'));
        if (!lastShot) return 0;
        return Math.max(0, timerSeconds - (lastShot.game_seconds || 0));
    };

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
        noShotTime: formatTime(lastShotTime('home'))
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
        noShotTime: formatTime(lastShotTime('away'))
      },
    };
  }, [events, statView, timerSeconds]);

  const displayPossession = useMemo(() => {
     if (statView === '1') return possession1;
     if (statView === '2') return possession2;
     
     // Total is the sum
     return { 
         home: possession1.home + possession2.home, 
         away: possession1.away + possession2.away 
     };
  }, [possession1, possession2, statView]);

  // RELÓGIO PRINCIPAL (HEADER)
  const headerDisplaySecs = useMemo(() => {
    if (clockMode === 'total') return timerSeconds;
    if (clockMode === '1') {
        return halfSplitSeconds > 0 ? Math.min(timerSeconds, halfSplitSeconds) : timerSeconds;
    }
    if (clockMode === '2') {
        return Math.max(0, timerSeconds - halfSplitSeconds);
    }
    return timerSeconds;
  }, [clockMode, timerSeconds, halfSplitSeconds]);

  const displayMinutes = Math.floor(headerDisplaySecs / 60).toString().padStart(2, '0');
  const displaySeconds = (headerDisplaySecs % 60).toString().padStart(2, '0');

  const globalPossessionPerc = useMemo(() => {
      const total = displayPossession.home + displayPossession.away;
      if (total === 0) return 50;
      return (displayPossession.home / total) * 100;
  }, [displayPossession]);

  const resetTimer = async () => {
    if (window.confirm("Reiniciar cronómetro para 00:00?")) {
        setTimerSeconds(0);
        setHalfSplitSeconds(0);
        setActivePossession(null); // Parar posse também
        if (id) await supabase.from('matches').update({ current_game_seconds: 0, half_split_seconds: 0 }).eq('id', id);
        channelRef.current?.send({ 
            type: 'broadcast', 
            event: 'timer_tick', 
            payload: { seconds: 0, is_running: isTimerRunning, half: currentHalf, split: 0 } 
        });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      <div className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-brand transition"><ArrowLeft size={18} /></button>
          <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
          <div className="flex flex-col ml-2 border-l border-gray-800 pl-3">
             <span className="text-[10px] font-bold text-brand uppercase tracking-widest leading-none">Live Console</span>
             <span className="text-[9px] text-gray-600 font-mono mt-1 uppercase">v3.7 Synced Chart</span>
          </div>
        </div>

        <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-dark-surface h-full flex flex-row items-center justify-center gap-6 px-6 border-x border-dark-border shadow-2xl min-w-[550px]">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-right w-32 truncate hidden md:block">{match?.home_team}</div>
           <div className="text-3xl font-mono font-bold text-white tracking-widest">{match?.home_score || 0}<span className="text-brand mx-2">:</span>{match?.away_score || 0}</div>
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-left w-32 truncate hidden md:block">{match?.away_team}</div>
           <div className="h-8 w-px bg-dark-border mx-2"></div>
           <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-dark-border/30">
              <button onClick={() => { updateHalf(1); setClockMode('1'); }} className={`text-[9px] font-bold px-3 py-1.5 rounded uppercase transition-all ${clockMode === '1' ? 'bg-brand text-black' : 'text-gray-500 hover:text-white'}`}>1ª P</button>
              <button onClick={() => { updateHalf(2); setClockMode('2'); }} className={`text-[9px] font-bold px-3 py-1.5 rounded uppercase transition-all ${clockMode === '2' ? 'bg-brand text-black' : 'text-gray-500'}`}>2ª P</button>
              <button onClick={() => { setClockMode('total'); setStatView('total'); }} className={`text-[9px] font-bold px-3 py-1.5 rounded uppercase transition-all ${clockMode === 'total' ? 'bg-white text-black' : 'text-gray-500'}`}>TOTAL</button>
           </div>
           
           <div className="h-8 w-px bg-dark-border mx-2"></div>
           
           <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsTimerRunning(!isTimerRunning)} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                 {isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              </button>

              <div className="bg-black px-4 py-2 rounded-lg border border-dark-border/60 flex items-center justify-center min-w-[130px] shadow-lg">
                 <div className="text-3xl font-mono font-bold tracking-wider flex items-center">
                    <span className="text-white">{displayMinutes}</span>
                    <span className={`mx-3 text-gray-600 ${isTimerRunning ? 'animate-pulse' : ''}`}>:</span>
                    <span className="text-white">{displaySeconds}</span>
                 </div>
              </div>

              <button 
                onClick={resetTimer} 
                className="text-gray-500 hover:text-white transition-colors"
              >
                 <RotateCcw size={20} />
              </button>
           </div>
        </div>

        <div className="w-1/3 flex justify-end gap-2">
            {id && <VoiceChat matchId={id} role={role} />}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-5/12 flex flex-col border-r border-dark-border bg-black justify-center">
            <div className="aspect-video shadow-lg">
                {match?.youtube_url ? <ReactPlayer ref={playerRef} url={match.youtube_url} width="100%" height="100%" controls /> : <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs uppercase tracking-widest">A aguardar sinal...</div>}
            </div>
        </div>

        <div className="w-7/12 flex flex-col bg-dark-bg overflow-hidden">
           <div className="flex border-b border-dark-border justify-between items-center px-4 bg-dark-surface h-12">
              <div className="flex flex-1 h-full">
                <button onClick={() => setActiveTab('collective')} className={`flex-1 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'collective' ? 'text-brand bg-brand/5 border-b-2 border-brand' : 'text-gray-500'}`}><Disc size={12}/> Coletivo</button>
                {role !== 'analistacol' && (
                    <button onClick={() => setActiveTab('individual')} className={`flex-1 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'individual' ? 'text-brand bg-brand/5 border-b-2 border-brand' : 'text-gray-500'}`}><User size={12}/> Individual</button>
                )}
              </div>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-dark-border/50 ml-4">
                  <button onClick={() => setStatView('1')} className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase transition ${statView === '1' ? 'bg-white text-black' : 'text-gray-600'}`}>1ªP</button>
                  <button onClick={() => setStatView('2')} className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase transition ${statView === '2' ? 'bg-white text-black' : 'text-gray-600'}`}>2ªP</button>
                  <button onClick={() => setStatView('total')} className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase transition ${statView === 'total' ? 'bg-brand text-black' : 'text-gray-600'}`}>TOTAL</button>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              {activeTab === 'collective' ? (
                 <div className="flex flex-col gap-4">
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          <StatCard title="Posse Real (Tempo)" icon={Clock} homeValue={formatTime(displayPossession.home)} awayValue={formatTime(displayPossession.away)} labelRight="A | S | D" homeActive={activePossession === 'home'} awayActive={activePossession === 'away'} />
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
                          <StatCard title="T. Sem Remate" icon={Timer} homeValue={stats.home.noShotTime} awayValue={stats.away.noShotTime} labelRight="MM:SS" />
                     </div>

                     <div className="bg-dark-card border border-dark-border rounded-lg p-4 flex flex-col shadow-inner">
                         <div className="flex justify-between items-center mb-4">
                             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none">FCB</span>
                             <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">POSSE DE BOLA</span>
                             <span className="text-[10px] font-black text-brand uppercase tracking-widest leading-none">BEJA</span>
                         </div>
                         <div className="flex items-center gap-4">
                             <span className="text-xl font-mono font-black text-gray-200">{Math.round(globalPossessionPerc)}%</span>
                             <div className="h-2 flex-1 bg-dark-surface rounded-full overflow-hidden flex relative">
                                <div style={{ width: `${globalPossessionPerc}%` }} className="h-full bg-gray-500 transition-all duration-700"></div>
                                <div style={{ width: `${100 - globalPossessionPerc}%` }} className="h-full bg-brand shadow-[0_0_10px_rgba(255,77,0,0.4)] transition-all duration-700"></div>
                             </div>
                             <span className="text-xl font-mono font-black text-brand">{Math.round(100 - globalPossessionPerc)}%</span>
                         </div>
                     </div>

                     <div className="bg-black border border-dark-border rounded-lg h-64 overflow-hidden flex flex-col">
                         <div className="bg-dark-surface p-2 text-[8px] font-black uppercase text-gray-600 tracking-widest flex justify-between">
                            <span>REGISTO DE EVENTOS ({statView})</span>
                            <span className="text-brand">LIVE FEED</span>
                         </div>
                         <div className="flex-1 overflow-y-auto divide-y divide-dark-border custom-scrollbar">
                             {events.filter(ev => (statView === 'total' || String(ev.half) === statView) && ev.type !== 'possession_update').map(ev => (
                                <div key={ev.id} className="p-2 flex items-center justify-between hover:bg-dark-surface transition-colors cursor-pointer group">
                                   <div className="flex items-center gap-4">
                                        <div className="w-10 text-right shrink-0">
                                            <div className="text-brand text-xs font-black font-mono leading-none">{ev.match_minute}'</div>
                                            <div className="text-[6px] text-gray-600 font-bold uppercase tracking-tighter">{ev.half}ªP</div>
                                        </div>
                                        <div className="w-0.5 h-6 bg-dark-border group-hover:bg-brand transition-all"></div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-300 uppercase tracking-tight">{ev.type.replace('_',' ')}</div>
                                            <div className="text-[9px] text-gray-600 font-bold">{ev.team==='home'?match?.home_team:match?.away_team} {ev.player && `• #${ev.player.number} ${ev.player.name}`}</div>
                                        </div>
                                   </div>
                                   <button onClick={(e) => {e.stopPropagation(); if(window.confirm("Anular evento?")) supabase.from('match_events').delete().eq('id', ev.id);}} className="text-gray-700 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={12} /></button>
                                </div>
                             ))}
                         </div>
                     </div>
                 </div>
              ) : (
                  <div className="flex h-full gap-2">
                     <div className="flex-1 flex flex-col border border-dark-border bg-dark-card/20 rounded-lg overflow-hidden p-2">
                        <h3 className="text-[9px] font-black uppercase text-brand mb-2 border-b border-brand/20 pb-1 tracking-widest">{match?.home_team}</h3>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                            {players.filter(p => p.team === 'home').map(p => <OurPlayerRow key={p.id} player={p} isOnPitch={playersOnPitch[p.id]} onAction={(t) => addEvent(t, 'home', p.id)} />)}
                        </div>
                     </div>
                     <div className="flex-1 flex flex-col border border-dark-border bg-dark-card/20 rounded-lg overflow-hidden p-2">
                        <h3 className="text-[9px] font-black uppercase text-gray-500 mb-2 border-b border-gray-600 pb-1 tracking-widest">{match?.away_team}</h3>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                            {players.filter(p => p.team === 'away').map(p => <OpponentPlayerRow key={p.id} player={p} isOnPitch={playersOnPitch[p.id]} onAction={(t) => addEvent(t, 'away', p.id)} />)}
                        </div>
                     </div>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisConsole;


import React, { useEffect, useState, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, MatchEvent, EventType } from '../types';
import { 
  ArrowLeft, Goal, Crosshair, Ban, Hand, Shield, ShieldAlert, 
  RectangleHorizontal, AlertTriangle, Activity, Timer, Clock, 
  Disc, User, PlayCircle
} from 'lucide-react';
import VoiceChat from './VoiceChat';

interface StatCardProps { 
  title: string; 
  icon: any; 
  homeValue: number | string; 
  awayValue: number | string; 
  progressBar?: boolean;
  labelRight?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ title, icon: Icon, homeValue, awayValue, progressBar = true, labelRight }) => {
  let hPerc = 50;
  if (typeof homeValue === 'string' && homeValue.includes(':')) {
      const hParts = homeValue.split(':').map(Number);
      const aParts = (awayValue as string).split(':').map(Number);
      const hSecs = hParts[0] * 60 + hParts[1];
      const aSecs = aParts[0] * 60 + aParts[1];
      const total = hSecs + aSecs;
      hPerc = total === 0 ? 50 : (hSecs / total) * 100;
  } else if (typeof homeValue === 'number') { 
      const total = homeValue + (awayValue as number); 
      hPerc = total === 0 ? 50 : (homeValue / total) * 100; 
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-3 flex flex-col justify-between h-full shadow-lg relative overflow-hidden group hover:border-gray-600 transition-colors">
       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
             <Icon size={12} className="text-gray-500" />
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{title}</span>
          </div>
          {labelRight && <span className="text-[8px] font-mono text-gray-600 border border-dark-border px-1 rounded uppercase">{labelRight}</span>}
       </div>
       <div className="flex justify-between items-end mb-2">
          <div className="text-xl font-mono font-bold text-gray-200">{homeValue}</div>
          <div className="text-xl font-mono font-bold text-brand">{awayValue}</div>
       </div>
       {progressBar && (
           <div className="h-1 w-full bg-dark-surface rounded-full overflow-hidden flex relative mt-auto">
              <div style={{ width: `${hPerc}%` }} className="h-full bg-gray-500 transition-all duration-500"></div>
              <div style={{ width: `${100 - hPerc}%` }} className="h-full bg-brand transition-all duration-500"></div>
           </div>
       )}
    </div>
  );
}

const PlayerStatsRow: React.FC<{ player: Player, events: MatchEvent[], curMin: number, isActive: boolean }> = ({ player, events, curMin, isActive }) => {
    const evs = events.filter(e => e.player_id === player.id);
    
    // Contagens detalhadas
    const goals = evs.filter(e => e.type === 'goal').length;
    
    const shotsOn = evs.filter(e => e.type === 'shot_on_target').length;
    const shotsOff = evs.filter(e => e.type === 'shot_off_target').length;
    
    const passOk = evs.filter(e => e.type === 'pass_success').length;
    const passFail = evs.filter(e => e.type === 'pass_fail').length;
    
    const foulC = evs.filter(e => e.type === 'foul_committed').length;
    const foulW = evs.filter(e => e.type === 'foul_won').length;
    
    const loss = evs.filter(e => e.type === 'ball_loss').length;
    const rec = evs.filter(e => e.type === 'ball_recovery').length;
    
    const yellow = evs.filter(e => e.type === 'yellow_card').length;
    const red = evs.filter(e => e.type === 'red_card').length;

    const subIn = evs.find(e => e.type === 'sub_in');
    const subOut = evs.find(e => e.type === 'sub_out');

    return (
      <div className={`flex items-center gap-2 bg-dark-bg p-2 rounded mb-1 transition-all ${isActive ? 'border-b-2 border-brand border-t border-x border-t-transparent border-x-transparent opacity-100' : 'border border-dark-border opacity-50'}`}>
        <div className={`w-6 h-6 shrink-0 rounded flex items-center justify-center font-mono font-bold text-[10px] border ${isActive ? 'bg-brand/10 text-brand border-brand/20' : 'bg-dark-surface text-gray-500 border-dark-border'}`}>{player.number}</div>
        <div className="text-[10px] font-bold text-gray-200 truncate w-24 uppercase mr-auto">{player.name}</div>
        
        <div className="flex gap-1.5 text-[8px] font-bold uppercase items-center flex-wrap justify-end">
            {goals > 0 && <span className="bg-brand text-black px-1 rounded flex items-center leading-none h-4 shadow shadow-brand/20">{goals} GOL</span>}
            
            {(shotsOn > 0 || shotsOff > 0) && (
                <span className="text-blue-400 bg-blue-900/10 px-1 rounded h-4 flex items-center" title="Remates (Alvo/Fora)">R {shotsOn}/{shotsOff}</span>
            )}

            {(passOk > 0 || passFail > 0) && (
                <span className="text-green-500 bg-green-900/10 px-1 rounded h-4 flex items-center" title="Passes (Certo/Errado)">P {passOk}/{passFail}</span>
            )}
            
            {(foulC > 0 || foulW > 0) && (
                <span className="text-orange-500 bg-orange-900/10 px-1 rounded h-4 flex items-center" title="Faltas (Cometidas/Sofridas)">F {foulC}/{foulW}</span>
            )}

            {rec > 0 && <span className="text-indigo-400 bg-indigo-900/10 px-1 rounded h-4 flex items-center" title="Recuperações">REC {rec}</span>}
            {loss > 0 && <span className="text-gray-500 bg-gray-800 px-1 rounded h-4 flex items-center" title="Perdas">PER {loss}</span>}

            {yellow > 0 && <span className="w-2.5 h-3 bg-yellow-500 rounded-sm inline-block mx-0.5"></span>}
            {red > 0 && <span className="w-2.5 h-3 bg-red-500 rounded-sm inline-block mx-0.5"></span>}

            {subIn && <span className="text-green-400 bg-green-900/20 px-1 rounded h-4 flex items-center ml-1">ENT {subIn.match_minute}'</span>}
            {subOut && <span className="text-red-500 bg-red-900/20 px-1 rounded h-4 flex items-center ml-1">SAI {subOut.match_minute}'</span>}
        </div>
      </div>
    );
};

const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const CoachDashboard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  const role = localStorage.getItem('userRole') || 'dashboard';

  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'collective' | 'individual'>('collective');
  const [viewHalf, setViewHalf] = useState<'1' | '2' | 'total'>('total');
  const [currentHalf, setCurrentHalf] = useState<1 | 2>(1);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    if (!id) return;
    const channel = supabase.channel(`match_sync_${id}`)
      .on('broadcast', { event: 'timer_tick' }, ({ payload }) => {
          setTimerSeconds(payload.seconds);
          if (payload.half) {
              setCurrentHalf(payload.half);
          }
      }).subscribe();

    const loadData = async () => {
      const { data: mData } = await supabase.from('matches').select('*').eq('id', id).single();
      if (mData) { 
          setMatch(mData); 
          setTimerSeconds(mData.current_game_seconds || 0); 
          setCurrentHalf(mData.current_half as 1|2 || 1); 
      }
      // CHANGE: Ordering by created_at to preserve Match Sheet insertion order
      const { data: pData } = await supabase.from('players').select('*').eq('match_id', id).order('created_at', { ascending: true });
      setPlayers(pData || []);
      const { data: eData } = await supabase.from('match_events').select('*, player:players(name, number)').eq('match_id', id).order('created_at', { ascending: false });
      setEvents(eData || []);
    };
    loadData();

    const evSub = supabase.channel(`dash_evs_${id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, (payload) => {
        if (payload.eventType === 'INSERT') setEvents(p => [payload.new as MatchEvent, ...p]);
        else if (payload.eventType === 'DELETE') setEvents(p => p.filter(e => e.id !== payload.old.id));
    }).subscribe();

    const matchSub = supabase.channel(`dash_match_${id}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
        setMatch(p => ({ ...p, ...payload.new as Match }));
    }).subscribe();

    return () => { supabase.removeChannel(evSub); supabase.removeChannel(matchSub); supabase.removeChannel(channel); };
  }, [id]);

  const displayPossession = useMemo(() => {
    const rawPos = { home: match?.possession_home || 0, away: match?.possession_away || 0 };
    if (viewHalf === 'total') return rawPos;
    
    // Find snapshots for H1
    const h1HomeSnap = events.find(e => e.type === 'possession_update' && e.team === 'home');
    const h1AwaySnap = events.find(e => e.type === 'possession_update' && e.team === 'away');
    
    const h1Home = h1HomeSnap ? h1HomeSnap.video_timestamp : (currentHalf === 1 ? rawPos.home : 0);
    const h1Away = h1AwaySnap ? h1AwaySnap.video_timestamp : (currentHalf === 1 ? rawPos.away : 0);
    
    if (viewHalf === '1') {
        return { home: h1Home, away: h1Away };
    }
    
    if (viewHalf === '2') {
        return { 
            home: Math.max(0, rawPos.home - h1Home), 
            away: Math.max(0, rawPos.away - h1Away) 
        };
    }
    return rawPos;
  }, [match, viewHalf, events, currentHalf]);

  const globalPossessionPerc = useMemo(() => {
      const total = displayPossession.home + displayPossession.away;
      if (total === 0) return 50;
      return (displayPossession.home / total) * 100;
  }, [displayPossession]);

  const stats = useMemo(() => {
    const fEvs = viewHalf === 'total' ? events : events.filter(e => String(e.half) === viewHalf);
    const calc = (tm: 'home' | 'away', tp: EventType) => fEvs.filter(e => e.team === tm && e.type === tp).length;
    
    const lastShotTime = (tm: 'home' | 'away') => {
        const shots = fEvs.filter(e => e.team === tm && (e.type === 'shot_on_target' || e.type === 'shot_off_target' || e.type === 'goal'));
        shots.sort((a,b) => (b.game_seconds || 0) - (a.game_seconds || 0));
        const lastShot = shots[0];
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
          noShot: formatTime(lastShotTime('home'))
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
          noShot: formatTime(lastShotTime('away'))
      }
    };
  }, [events, viewHalf, timerSeconds]);

  const filteredFeedEvents = useMemo(() => {
      let evs = viewHalf === 'total' ? events : events.filter(e => String(e.half) === viewHalf);
      evs = evs.filter(e => e.type !== 'possession_update');
      const collectiveTypes: EventType[] = ['corner', 'goal', 'shot_on_target', 'shot_off_target', 'yellow_card', 'red_card', 'sub_in', 'sub_out'];
      const individualTypes: EventType[] = ['goal', 'shot_on_target', 'shot_off_target', 'yellow_card', 'red_card', 'sub_in', 'sub_out'];
      const allowedTypes = activeTab === 'collective' ? collectiveTypes : individualTypes;
      return evs.filter(e => allowedTypes.includes(e.type));
  }, [events, viewHalf, activeTab]);

  const getSortedPlayers = (team: 'home' | 'away') => {
     // 1. Get Base Arrays (preserve original insertion order)
     let roster = players.filter(p => p.team === team);
     
     // Slots represent the physical positions in the list (Top 11)
     let pitchSlots: (Player | null)[] = roster.filter(p => p.is_starter);
     let bench = roster.filter(p => !p.is_starter);
     let subbedOut: Player[] = [];

     // 2. Process Substitution Events Logic
     // Filter events based on the view mode (1st Half, 2nd Half, Total)
     let relevantEvents = events.filter(e => e.team === team && (e.type === 'sub_in' || e.type === 'sub_out'));
     
     // Sort by time to replay the game flow
     relevantEvents.sort((a,b) => (a.game_seconds || 0) - (b.game_seconds || 0));

     if (viewHalf === '1') {
         relevantEvents = relevantEvents.filter(e => e.half === 1);
     }
     // Note: If viewHalf is '2' or 'total', we process all events chronologically to reach the final state.

     // 3. Replay Substitutions
     // We assume sub_out and sub_in pairs happen close together.
     // To strictly maintain slots: sub_out opens a slot, sub_in fills the first open slot.
     relevantEvents.forEach(ev => {
         if (ev.type === 'sub_out') {
             // Find player in pitchSlots
             const idx = pitchSlots.findIndex(p => p?.id === ev.player_id);
             if (idx !== -1) {
                 const leaving = pitchSlots[idx];
                 if (leaving) {
                     subbedOut.push(leaving);
                     pitchSlots[idx] = null; // Open the slot
                 }
             }
         } else if (ev.type === 'sub_in') {
             // Find player in bench
             const idxBench = bench.findIndex(p => p.id === ev.player_id);
             if (idxBench !== -1) {
                 const entering = bench[idxBench];
                 bench.splice(idxBench, 1); // Remove from bench

                 // Fill the first available null slot (from the sub_out)
                 const emptySlotIdx = pitchSlots.indexOf(null);
                 if (emptySlotIdx !== -1) {
                     pitchSlots[emptySlotIdx] = entering;
                 } else {
                     // If no empty slot (edge case), append to active slots
                     pitchSlots.push(entering);
                 }
             }
         }
     });

     // 4. Construct Final List
     // Active (Pitch Slots) -> Bench (Remaining) -> Subbed Out
     const activeList = pitchSlots.filter(p => p !== null) as Player[];

     // Add 'isActive' flag for styling
     const markedActive = activeList.map(p => ({ ...p, isActive: true }));
     const markedBench = bench.map(p => ({ ...p, isActive: false }));
     const markedSubbed = subbedOut.map(p => ({ ...p, isActive: false }));

     return [...markedActive, ...markedBench, ...markedSubbed];
  };

  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      <div className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-6 shrink-0 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-brand transition"><ArrowLeft size={18} /></button>
          <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 bg-dark-surface px-6 h-full border-x border-dark-border shadow-2xl min-w-[500px] justify-center">
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide w-32 text-right truncate">{match?.home_team}</div>
           <div className="text-3xl font-mono font-bold text-white tracking-widest">{match?.home_score || 0}<span className="text-brand mx-2">:</span>{match?.away_score || 0}</div>
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide w-32 text-left truncate">{match?.away_team}</div>
           
           <div className="h-8 w-px bg-dark-border mx-2"></div>
           
           <div className="flex items-center gap-2">
               <span className="text-[10px] font-bold text-gray-500 uppercase">{currentHalf}ªP</span>
               <div className="bg-black px-3 py-1 rounded border border-dark-border">
                  <span className="text-xl font-mono font-bold text-white">{Math.floor(timerSeconds/60).toString().padStart(2,'0')}:{(timerSeconds%60).toString().padStart(2,'0')}</span>
               </div>
           </div>
        </div>
        <div className="w-1/3 flex justify-end">{id && <VoiceChat matchId={id} role={role} />}</div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Video */}
        <div className="w-5/12 flex flex-col border-r border-dark-border bg-black justify-center">
            <div className="aspect-video shadow-lg relative">
                {match?.youtube_url ? (
                    <ReactPlayer 
                        ref={playerRef} 
                        url={match.youtube_url} 
                        width="100%" 
                        height="100%" 
                        controls 
                        playing={true}
                        muted={true}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs uppercase tracking-widest">A aguardar sinal...</div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/80 text-white px-2 py-1 rounded text-[10px] font-bold uppercase flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Em direto
                </div>
            </div>
        </div>

        {/* Right: Dashboard */}
        <div className="w-7/12 flex flex-col bg-dark-bg overflow-hidden">
            {/* Tabs Header */}
            <div className="flex border-b border-dark-border justify-between items-center px-4 bg-dark-surface h-12 shrink-0">
              <div className="flex flex-1 h-full">
                <button onClick={() => setActiveTab('collective')} className={`flex-1 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'collective' ? 'text-brand bg-brand/5 border-b-2 border-brand' : 'text-gray-500 hover:text-gray-300'}`}><Disc size={12}/> Coletivo</button>
                <button onClick={() => setActiveTab('individual')} className={`flex-1 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${activeTab === 'individual' ? 'text-brand bg-brand/5 border-b-2 border-brand' : 'text-gray-500 hover:text-gray-300'}`}><User size={12}/> Individual</button>
              </div>
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-dark-border/50 ml-4">
                  <button onClick={() => setViewHalf('1')} className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase transition ${viewHalf === '1' ? 'bg-white text-black' : 'text-gray-600'}`}>1ªP</button>
                  <button onClick={() => setViewHalf('2')} className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase transition ${viewHalf === '2' ? 'bg-white text-black' : 'text-gray-600'}`}>2ªP</button>
                  <button onClick={() => setViewHalf('total')} className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase transition ${viewHalf === 'total' ? 'bg-brand text-black' : 'text-gray-600'}`}>TOTAL</button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                {activeTab === 'collective' ? (
                    <div className="flex flex-col gap-4 h-full">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            <StatCard title="Posse Real" icon={Clock} homeValue={formatTime(displayPossession.home)} awayValue={formatTime(displayPossession.away)} labelRight="Tempo" />
                            <StatCard title="Golos" icon={Goal} homeValue={stats.home.goals} awayValue={stats.away.goals} />
                            <StatCard title="Remate Alvo" icon={Crosshair} homeValue={stats.home.shotsOn} awayValue={stats.away.shotsOn} />
                            <StatCard title="Remate Fora" icon={Ban} homeValue={stats.home.shotsOff} awayValue={stats.away.shotsOff} />
                            
                            <StatCard title="Faltas Cometidas" icon={Hand} homeValue={stats.home.foulsCommitted} awayValue={stats.away.foulsCommitted} />
                            <StatCard title="Faltas Sofridas" icon={ShieldAlert} homeValue={stats.home.foulsWon} awayValue={stats.away.foulsWon} />
                            <StatCard title="Cartão Amarelo" icon={RectangleHorizontal} homeValue={stats.home.yellow} awayValue={stats.away.yellow} />
                            <StatCard title="Cartão Vermelho" icon={RectangleHorizontal} homeValue={stats.home.red} awayValue={stats.away.red} />

                            <StatCard title="Perda Bola" icon={AlertTriangle} homeValue={stats.home.loss} awayValue={stats.away.loss} />
                            <StatCard title="Recuperação" icon={Shield} homeValue={stats.home.recovery} awayValue={stats.away.recovery} />
                            <StatCard title="Cantos" icon={Activity} homeValue={stats.home.corners} awayValue={stats.away.corners} />
                            <StatCard title="T. Sem Remate" icon={Timer} homeValue={stats.home.noShot} awayValue={stats.away.noShot} labelRight="Live Sync" />
                        </div>

                        {/* Possession Bar Card */}
                        <div className="bg-dark-card border border-dark-border rounded-lg p-3 flex flex-col shadow-inner shrink-0">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none truncate w-32">{match?.home_team || 'CASA'}</span>
                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">POSSE DE BOLA</span>
                                 <span className="text-[10px] font-black text-brand uppercase tracking-widest leading-none truncate w-32 text-right">{match?.away_team || 'FORA'}</span>
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

                        {/* Event Log */}
                        <div className="bg-black border border-dark-border rounded-lg flex-1 overflow-hidden flex flex-col min-h-[200px]">
                            <div className="bg-dark-surface p-2 text-[9px] font-black uppercase text-gray-500 tracking-widest border-b border-dark-border flex justify-between">
                                <span>EVENT LOG</span>
                                <span className="text-brand">SYNCED</span>
                            </div>
                            <div className="flex-1 overflow-y-auto divide-y divide-dark-border custom-scrollbar">
                                {filteredFeedEvents.map(ev => (
                                    <div key={ev.id} className="p-2 flex gap-4 text-xs items-center hover:bg-dark-surface/50 transition cursor-pointer group" onClick={() => playerRef.current?.seekTo(ev.video_timestamp, 'seconds')}>
                                        <div className="flex flex-col items-center w-8 shrink-0">
                                            <span className="font-mono text-brand font-bold">{ev.match_minute}'</span>
                                            <span className="text-[6px] text-gray-600 uppercase font-black">{ev.half}ªP</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="uppercase font-bold text-gray-300 text-[10px] group-hover:text-white">{ev.type.replace('_',' ')}</span>
                                            <span className="uppercase text-[9px] text-gray-600">{ev.team === 'home' ? match?.home_team : match?.away_team} • {ev.player?.name || 'Geral'}</span>
                                        </div>
                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                             <PlayCircle size={14} className="text-brand"/>
                                        </div>
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
                               {getSortedPlayers('home').map(p => (
                                   <PlayerStatsRow key={p.id} player={p} events={filteredFeedEvents} curMin={Math.floor(timerSeconds/60)+1} isActive={p.isActive} />
                               ))}
                           </div>
                        </div>
                        <div className="flex-1 flex flex-col border border-dark-border bg-dark-card/20 rounded-lg overflow-hidden p-2">
                           <h3 className="text-[9px] font-black uppercase text-gray-500 mb-2 border-b border-gray-600 pb-1 tracking-widest">{match?.away_team}</h3>
                           <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                               {getSortedPlayers('away').map(p => (
                                   <PlayerStatsRow key={p.id} player={p} events={filteredFeedEvents} curMin={Math.floor(timerSeconds/60)+1} isActive={p.isActive} />
                               ))}
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

export default CoachDashboard;

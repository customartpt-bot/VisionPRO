import React, { useEffect, useState, useRef, useMemo } from 'react';
import ReactPlayer from 'react-player/youtube';
import { supabase } from '../services/supabaseClient';
import { useParams, useNavigate } from 'react-router-dom';
import { Match, Player, MatchEvent, EventType } from '../types';
import { 
  ArrowLeft, Layers, User, Clock, Crosshair, Shield, Hand, 
  Timer, Activity, Goal, AlertTriangle, RectangleHorizontal, ShieldAlert, Ban,
  ArrowUp, ArrowDown, PlayCircle, AlertOctagon
} from 'lucide-react';
import VoiceChat from './VoiceChat';

// --- COMPONENTES VISUAIS ---

interface StatCardProps {
  title: string;
  icon: any;
  homeValue: number | string;
  awayValue: number | string;
  helperText?: string;
  progressBar?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, icon: Icon, homeValue, awayValue, helperText, progressBar = true 
}) => {
  let homePercent = 50;
  
  if (typeof homeValue === 'string' && homeValue.includes(':')) {
      const parseTime = (t: string) => {
          const parts = t.split(':');
          return parts.length === 2 ? parseInt(parts[0]) * 60 + parseInt(parts[1]) : 0;
      }
      const hSec = parseTime(homeValue);
      const aSec = parseTime(awayValue as string);
      const total = hSec + aSec;
      homePercent = total === 0 ? 50 : (hSec / total) * 100;

  } else if (typeof homeValue === 'number') {
      const hVal = homeValue;
      const aVal = typeof awayValue === 'number' ? awayValue : 0;
      const total = hVal + aVal;
      homePercent = total === 0 ? 50 : (hVal / total) * 100;
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-3 flex flex-col justify-between h-full shadow-lg relative overflow-hidden">
       <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-dark-surface text-gray-500">
                <Icon size={12} />
            </div>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">{title}</span>
          </div>
          {helperText && <span className="text-[8px] font-mono text-gray-600 border border-dark-border px-1 rounded">{helperText}</span>}
       </div>

       <div className="flex justify-between items-end mb-2">
          <div className="text-xl font-mono font-bold text-gray-200">{homeValue}</div>
          <div className="text-xl font-mono font-bold text-brand">{awayValue}</div>
       </div>

       {progressBar && (
           <div className="h-1 w-full bg-dark-surface rounded-full overflow-hidden flex relative mt-auto">
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-dark-bg z-10"></div>
              <div style={{ width: `${homePercent}%` }} className="h-full bg-gray-500 transition-all duration-500"></div>
              <div style={{ width: `${100 - homePercent}%` }} className="h-full bg-brand/70 transition-all duration-500"></div>
           </div>
       )}
    </div>
  );
}

// Badge Helper
const StatBadge = ({ label, value, colorClass }: { label: string, value: number, colorClass: string }) => {
    if (value === 0) return null;
    return (
        <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold border ${colorClass}`}>
            <span className="uppercase opacity-70">{label}</span>
            <span className="text-white">{value}</span>
        </div>
    );
};

const PlayerStatsRow: React.FC<{ player: Player, events: MatchEvent[], currentMatchMinute: number }> = ({ player, events, currentMatchMinute }) => {
    // Filtrar eventos do jogador
    const pEvents = events.filter(e => e.player_id === player.id);
    
    // Stats Principais
    const goals = pEvents.filter(e => e.type === 'goal').length;
    const assists = pEvents.filter(e => e.type === 'assist').length;
    const shots = pEvents.filter(e => e.type === 'shot_on_target' || e.type === 'shot_off_target').length;
    const passes = pEvents.filter(e => e.type === 'pass_success').length;
    const fouls = pEvents.filter(e => e.type === 'foul_committed').length;
    const cards = pEvents.filter(e => e.type === 'yellow_card' || e.type === 'red_card').sort((a,b) => a.type === 'red_card' ? 1 : -1);

    // Lógica de Minutos e Substituições
    const subInEvent = pEvents.find(e => e.type === 'sub_in');
    const subOutEvent = pEvents.find(e => e.type === 'sub_out');
    
    let minutesPlayed = 0;
    let statusText = "";
    let statusColor = "text-gray-500";

    // Calculo de Minutos
    const startMinute = subInEvent ? subInEvent.match_minute : (player.is_starter ? 0 : null);
    const endMinute = subOutEvent ? subOutEvent.match_minute : currentMatchMinute;

    if (startMinute !== null) {
        minutesPlayed = Math.max(0, endMinute - startMinute);
    }

    // Definir Texto de Estado
    if (subOutEvent) {
        statusText = `SAI ${subOutEvent.match_minute}'`;
        statusColor = "text-red-500";
    } else if (subInEvent) {
        statusText = `ENT ${subInEvent.match_minute}'`;
        statusColor = "text-green-500";
    } else if (player.is_starter) {
        statusText = "TITULAR";
        statusColor = "text-gray-400";
    } else {
        statusText = "DNP"; // Did Not Play
        statusColor = "text-gray-700";
    }

    // Se não jogou (suplente que não entrou), não mostramos minutos ou mostramos 0
    if (!player.is_starter && !subInEvent) minutesPlayed = 0;

    const isOnPitch = (player.is_starter || subInEvent) && !subOutEvent;

    return (
      <div className={`flex items-center gap-3 bg-dark-bg p-2 rounded border mb-1 transition-colors ${isOnPitch ? 'border-dark-border bg-dark-surface/50' : 'border-transparent opacity-60'}`}>
        {/* Número e Nome */}
        <div className="flex items-center gap-3 w-32 shrink-0">
            <div className={`w-6 h-6 rounded flex items-center justify-center font-mono font-bold text-xs border ${isOnPitch ? 'bg-brand/10 text-brand border-brand/20' : 'bg-dark-surface text-gray-500 border-dark-border'}`}>
                {player.number}
            </div>
            <div className="text-xs font-bold text-gray-300 truncate uppercase leading-tight">
                {player.name}
            </div>
        </div>

        {/* Minutos e Substituições */}
        <div className="flex flex-col w-16 shrink-0 items-center justify-center border-l border-dark-border/50 px-2">
             <span className="text-sm font-mono font-bold text-white">{minutesPlayed}'</span>
             <div className="flex items-center gap-1">
                 {subInEvent && <ArrowUp size={8} className="text-green-500" />}
                 {subOutEvent && <ArrowDown size={8} className="text-red-500" />}
                 <span className={`text-[8px] font-bold ${statusColor}`}>{statusText}</span>
             </div>
        </div>
        
        {/* Badges de Stats */}
        <div className="flex-1 flex gap-2 items-center flex-wrap pl-2 border-l border-dark-border/50">
            <StatBadge label="GOL" value={goals} colorClass="border-brand/30 bg-brand/10 text-brand" />
            <StatBadge label="ASS" value={assists} colorClass="border-purple-500/30 bg-purple-500/10 text-purple-400" />
            <StatBadge label="REM" value={shots} colorClass="border-blue-500/30 bg-blue-500/10 text-blue-400" />
            <StatBadge label="PAS" value={passes} colorClass="border-green-500/30 bg-green-500/10 text-green-400" />
            <StatBadge label="FLT" value={fouls} colorClass="border-orange-500/30 bg-orange-500/10 text-orange-400" />
        </div>

        {/* Disciplina */}
        <div className="flex gap-1 items-center justify-end w-12 shrink-0">
            {cards.map((c, i) => (
                <div key={i} className={`w-2 h-3 rounded-[1px] shadow-sm ${c.type === 'yellow_card' ? 'bg-yellow-400' : 'bg-red-600'}`}></div>
            ))}
        </div>
      </div>
    );
};

// --- COMPONENTE PRINCIPAL DASHBOARD ---

const CoachDashboard: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerRef = useRef<ReactPlayer>(null);
  const role = localStorage.getItem('userRole') || 'dashboard';

  // Data State
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'collective' | 'individual'>('collective');

  // Realtime Sync State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [currentHalf, setCurrentHalf] = useState<number>(1);

  // Time without shot logic (Local Calculation based on events)
  const timeSinceShot = useMemo(() => {
    const calcTeamTime = (team: 'home' | 'away') => {
        const teamShots = events.filter(e => e.team === team && ['shot_on_target', 'shot_off_target', 'goal'].includes(e.type));
        
        const getEventSeconds = (e: MatchEvent) => {
             return e.game_seconds ?? ((e.match_minute > 0 ? e.match_minute - 1 : 0) * 60);
        };

        const pastShots = teamShots.filter(e => getEventSeconds(e) <= timerSeconds);
        if (pastShots.length === 0) return timerSeconds;
        
        pastShots.sort((a, b) => getEventSeconds(b) - getEventSeconds(a));
        const lastShotTime = getEventSeconds(pastShots[0]);
        
        const diff = timerSeconds - lastShotTime;
        return diff > 0 ? diff : 0;
    };

    return { home: calcTeamTime('home'), away: calcTeamTime('away') };
  }, [events, timerSeconds]);

  // Initial Load & Subscriptions
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      const { data: matchData } = await supabase.from('matches').select('*').eq('id', id).single();
      if (matchData) {
          setMatch(matchData);
          setTimerSeconds(matchData.current_game_seconds || 0);
          setCurrentHalf(matchData.current_half || 1);
      }
      const { data: playerData } = await supabase.from('players').select('*').eq('match_id', id);
      setPlayers(playerData || []);
      const { data: eventData } = await supabase.from('match_events').select('*, player:players(name, number)').eq('match_id', id).order('created_at', { ascending: false });
      setEvents(eventData || []);
    };
    loadData();

    // 1. Subscribe to Events (Inserts/Deletes)
    const eventSub = supabase
      .channel('dashboard_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, (payload) => {
         if (payload.eventType === 'INSERT') {
            setEvents(prev => [payload.new as MatchEvent, ...prev]);
         } else if (payload.eventType === 'DELETE') {
             setEvents(prev => prev.filter(e => e.id !== payload.old.id));
         }
      })
      .subscribe();

    // 2. Subscribe to Match Updates (Timer, Score, Half, Possession)
    const matchSub = supabase
      .channel('dashboard_match')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
          const newMatch = payload.new as Match;
          setMatch(newMatch);
          if (newMatch.current_game_seconds !== undefined) setTimerSeconds(newMatch.current_game_seconds);
          if (newMatch.current_half !== undefined) setCurrentHalf(newMatch.current_half);
      })
      .subscribe();

    return () => { 
        supabase.removeChannel(eventSub); 
        supabase.removeChannel(matchSub);
    };
  }, [id]);

  // Formatting Helpers
  const formatTimeSimple = (seconds: number) => {
     const m = Math.floor(seconds / 60).toString().padStart(2, '0');
     const s = (seconds % 60).toString().padStart(2, '0');
     return `${m}:${s}`;
  }

  // Calculated Stats
  const stats = useMemo(() => {
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
      }
    };
  }, [events]);

  const displayMinutes = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const displaySeconds = (timerSeconds % 60).toString().padStart(2, '0');
  const currentMatchMinute = Math.floor(timerSeconds / 60) + 1;

  // Lógica de Separação (Active vs Bench) para UI
  const getTeamSquad = (team: 'home' | 'away') => {
      const teamPlayers = players.filter(p => p.team === team).sort((a,b) => a.number - b.number);
      const active: Player[] = [];
      const bench: Player[] = [];

      teamPlayers.forEach(p => {
          const pEvents = events.filter(e => e.player_id === p.id);
          const subOut = pEvents.find(e => e.type === 'sub_out');
          const subIn = pEvents.find(e => e.type === 'sub_in');
          
          let isOnPitch = false;
          
          if (p.is_starter) {
              // Titular está em campo se não saiu
              isOnPitch = !subOut;
          } else {
              // Suplente está em campo se entrou e não saiu.
              // A verificação `!p.is_starter` é redundante aqui porque está no else, mas reforça a lógica.
              isOnPitch = !!subIn && !subOut;
          }
          
          if (isOnPitch) active.push(p);
          else bench.push(p);
      });

      return { active, bench };
  };

  const homeSquad = useMemo(() => getTeamSquad('home'), [players, events]);
  const awaySquad = useMemo(() => getTeamSquad('away'), [players, events]);


  return (
    <div className="flex flex-col h-screen bg-dark-bg text-gray-200 overflow-hidden font-sans">
      {/* Top Bar (Coach View) */}
      <div className="bg-black border-b border-dark-border h-16 flex items-center justify-between px-6 shrink-0 z-20 relative">
        <div className="flex items-center gap-4 w-1/3">
          <button onClick={() => navigate('/matches')} className="text-gray-500 hover:text-brand transition"><ArrowLeft size={18} /></button>
          <img src="https://raw.githubusercontent.com/customartpt-bot/fcbfotos/refs/heads/main/VPRO3.png" className="h-8" alt="Logo" />
          <div className="flex flex-col ml-2 border-l border-gray-800 pl-3">
             <span className="text-[10px] font-bold text-brand uppercase tracking-widest">Live Dashboard</span>
             <span className="text-[10px] text-gray-500 font-mono">Coach View</span>
          </div>
        </div>

        {/* Central Scoreboard (Read Only) */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 bg-dark-surface h-full flex flex-row items-center justify-center gap-4 px-6 border-x border-dark-border/50 shadow-2xl min-w-[500px]">
           
           {/* Nome Equipa Casa */}
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-right w-32 truncate hidden md:block">
              {match?.home_team || 'HOME'}
           </div>

           {/* Resultado */}
           <div className="text-3xl font-mono font-bold text-white tracking-widest leading-none flex items-center">
             <span>{match?.home_score || 0}</span>
             <span className="text-brand mx-2">:</span>
             <span>{match?.away_score || 0}</span>
           </div>

           {/* Nome Equipa Fora */}
           <div className="text-sm font-bold text-gray-400 uppercase tracking-wide text-left w-32 truncate hidden md:block">
              {match?.away_team || 'AWAY'}
           </div>

           <div className="h-8 w-px bg-dark-border mx-2"></div>

           <div className="flex items-center gap-1 bg-black/40 p-1 rounded border border-dark-border/30">
              <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${currentHalf === 1 ? 'bg-brand text-black' : 'text-gray-600'}`}>1ª P</span>
              <span className={`text-[9px] font-bold px-2 py-1 rounded uppercase ${currentHalf === 2 ? 'bg-brand text-black' : 'text-gray-600'}`}>2ª P</span>
           </div>
           
           <div className="h-8 w-px bg-dark-border mx-2"></div>

           <div className="flex items-center text-xl font-mono font-bold text-gray-200 leading-none bg-black px-3 py-1 rounded border border-dark-border">
              <span>{displayMinutes}</span>
              <span className="mx-0.5 text-brand animate-pulse">:</span>
              <span>{displaySeconds}</span>
           </div>
        </div>

        <div className="w-1/3 flex justify-end items-center gap-4">
           {id && <VoiceChat matchId={id} role={role} />}
           <div className="text-right text-[10px] text-gray-600 font-mono uppercase">
              {match?.competition}
           </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Video */}
        <div className="w-5/12 flex flex-col border-r border-dark-border bg-black relative justify-center">
            <div className="aspect-video bg-black relative shadow-lg">
                {match?.youtube_url ? (
                    <ReactPlayer ref={playerRef} url={match.youtube_url} width="100%" height="100%" controls={true} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700 font-mono text-xs uppercase tracking-widest">No Video Signal</div>
                )}
            </div>
        </div>

        {/* Right: Data */}
        <div className="w-7/12 flex flex-col bg-dark-surface">
           {/* Tab Navigation */}
           <div className="flex border-b border-dark-border">
              <button onClick={() => setActiveTab('collective')} className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'collective' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                 <Layers size={14} /> Coletivo
              </button>
              <button onClick={() => setActiveTab('individual')} className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'individual' ? 'border-brand text-brand bg-brand/5' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
                 <User size={14} /> Individual
              </button>
           </div>

           <div className="flex-1 p-6 overflow-y-auto bg-dark-bg/50">
              {activeTab === 'collective' ? (
                 <div className="flex flex-col gap-6">
                     <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 content-start">
                          <StatCard 
                              title="Posse Real (Tempo)"
                              icon={Clock}
                              homeValue={formatTimeSimple(match?.possession_home || 0)}
                              awayValue={formatTimeSimple(match?.possession_away || 0)}
                              progressBar={true}
                              helperText="Tempo"
                          />
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
                          <StatCard title="T. Sem Remate" icon={Timer} homeValue={formatTimeSimple(timeSinceShot.home)} awayValue={formatTimeSimple(timeSinceShot.away)} progressBar={false} helperText="Live Calc" />
                     </div>
                     
                     {/* Event Log Replicated */}
                     <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden shadow-lg flex flex-col h-80 shrink-0">
                         <div className="bg-dark-surface p-3 border-b border-dark-border text-[10px] font-bold uppercase text-gray-500 tracking-wider">
                            Event Log (Clique para rever)
                         </div>
                         <div className="flex-1 overflow-y-auto p-0 divide-y divide-dark-border">
                             {events.length === 0 ? (
                                 <div className="p-4 text-center text-xs text-gray-600 font-mono">A aguardar eventos...</div>
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
                                   <button className="text-gray-500 hover:text-brand transition">
                                       <PlayCircle size={14} />
                                   </button>
                                </div>
                              ))}
                         </div>
                     </div>
                 </div>
              ) : (
                  <div className="grid grid-cols-2 gap-8 h-full overflow-hidden">
                     {/* Home Column */}
                     <div className="flex flex-col h-full overflow-hidden">
                        <div className="bg-dark-surface p-2 border-b border-dark-border mb-2 sticky top-0">
                             <h4 className="text-white font-bold text-xs uppercase tracking-widest border-l-4 border-brand pl-2">{match?.home_team}</h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                             {/* Em Campo */}
                             <div className="mb-6">
                                <h5 className={`text-[10px] font-bold uppercase mb-2 flex items-center gap-2 justify-between ${homeSquad.active.length > 11 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${homeSquad.active.length > 11 ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                                        Em Jogo ({homeSquad.active.length})
                                    </div>
                                    {homeSquad.active.length > 11 && <div className="flex items-center gap-1 bg-red-900/50 px-2 rounded border border-red-500"><AlertOctagon size={10} /> ERRO NUMÉRICO</div>}
                                </h5>
                                <div className="space-y-1">
                                    {homeSquad.active.map(player => (
                                        <PlayerStatsRow key={player.id} player={player} events={events} currentMatchMinute={currentMatchMinute} />
                                    ))}
                                </div>
                             </div>

                             {/* Banco */}
                             <div className="opacity-80">
                                <h5 className="text-[10px] text-gray-500 font-bold uppercase mb-2 border-t border-dark-border pt-2">
                                    Banco / Substituídos
                                </h5>
                                <div className="space-y-1">
                                    {homeSquad.bench.map(player => (
                                        <PlayerStatsRow key={player.id} player={player} events={events} currentMatchMinute={currentMatchMinute} />
                                    ))}
                                </div>
                             </div>
                        </div>
                     </div>
                     
                     {/* Away Column */}
                     <div className="flex flex-col h-full overflow-hidden">
                        <div className="bg-dark-surface p-2 border-b border-dark-border mb-2 sticky top-0">
                             <h4 className="text-gray-400 font-bold text-xs uppercase tracking-widest border-l-4 border-gray-600 pl-2">{match?.away_team}</h4>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                             {/* Em Campo */}
                             <div className="mb-6">
                                <h5 className={`text-[10px] font-bold uppercase mb-2 flex items-center gap-2 justify-between ${awaySquad.active.length > 11 ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${awaySquad.active.length > 11 ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                                        Em Jogo ({awaySquad.active.length})
                                    </div>
                                    {awaySquad.active.length > 11 && <div className="flex items-center gap-1 bg-red-900/50 px-2 rounded border border-red-500"><AlertOctagon size={10} /> ERRO NUMÉRICO</div>}
                                </h5>
                                <div className="space-y-1">
                                    {awaySquad.active.map(player => (
                                        <PlayerStatsRow key={player.id} player={player} events={events} currentMatchMinute={currentMatchMinute} />
                                    ))}
                                </div>
                             </div>

                             {/* Banco */}
                             <div className="opacity-80">
                                <h5 className="text-[10px] text-gray-500 font-bold uppercase mb-2 border-t border-dark-border pt-2">
                                    Banco / Substituídos
                                </h5>
                                <div className="space-y-1">
                                    {awaySquad.bench.map(player => (
                                        <PlayerStatsRow key={player.id} player={player} events={events} currentMatchMinute={currentMatchMinute} />
                                    ))}
                                </div>
                             </div>
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

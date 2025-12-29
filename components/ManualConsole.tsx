
import React, { useState, useEffect, useRef } from 'react';
import { ActionType, MatchEvent, ManualMatchAnalysis, PlayerLineup, AnalystRole } from '../types';
import { VoiceTacticalEngine } from '../services/voiceService';

interface ManualConsoleProps {
  matchData: ManualMatchAnalysis;
  currentTime: number;
  possessionState: 'home' | 'away' | 'none';
  onSetPossession: (state: 'home' | 'away' | 'none') => void;
  onAddEvent: (event: Omit<MatchEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
  onSeek: (time: number) => void;
}

interface ActionConfig {
  type: ActionType;
  label: string;
  icon: string;
  color: string;
}

type TabState = 'terminal' | 'stats';

const ManualConsole: React.FC<ManualConsoleProps> = ({ 
  matchData, 
  currentTime, 
  possessionState,
  onSetPossession,
  onAddEvent, 
  onDeleteEvent,
  onSeek 
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<{ team: 'home' | 'away', player: PlayerLineup } | null>(null);
  const [analystRole, setAnalystRole] = useState<AnalystRole>('individual');
  const [activeTab, setActiveTab] = useState<TabState>('terminal');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [activeActionForVoice, setActiveActionForVoice] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const voiceEngine = useRef<VoiceTacticalEngine | null>(null);

  const [actionList] = useState<ActionConfig[]>([
    { type: 'pass_certo', label: 'Passe Certo', icon: 'fa-check', color: 'bg-emerald-600' },
    { type: 'pass_errado', label: 'Passe Errado', icon: 'fa-xmark', color: 'bg-red-600' },
    { type: 'remate_certo', label: 'Remate Certo', icon: 'fa-bullseye', color: 'bg-orange-500' },
    { type: 'remate_fora', label: 'Remate Fora', icon: 'fa-circle-xmark', color: 'bg-zinc-600' },
    { type: 'falta_cometida', label: 'Falta Comet.', icon: 'fa-hand-back-fist', color: 'bg-amber-700' },
    { type: 'falta_sofrida', label: 'Falta Sofrida', icon: 'fa-person-falling', color: 'bg-amber-500' },
    { type: 'perda_posse', label: 'Perda Posse', icon: 'fa-arrow-right-from-bracket', color: 'bg-rose-800' },
    { type: 'recuperacao', label: 'Recuperação', icon: 'fa-shield-halved', color: 'bg-sky-600' }
  ]);

  const processVoiceCommand = (transcript: string) => {
    setVoiceTranscript(transcript);
    const text = transcript.toLowerCase();
    
    let detectedPlayer: { team: 'home' | 'away', player: PlayerLineup } | null = selectedPlayer;
    let detectedAction: ActionConfig | null = null;

    const allPlayers = [
      ...matchData.homeTeam.lineup.map(p => ({ team: 'home' as const, player: p })),
      ...matchData.awayTeam.lineup.map(p => ({ team: 'away' as const, player: p }))
    ];

    for (const pObj of allPlayers) {
      const name = pObj.player.name.toLowerCase();
      if (name && text.includes(name)) {
        detectedPlayer = pObj;
        setSelectedPlayer(pObj);
        break;
      }
      if (text.includes(`número ${pObj.player.number}`) || text.includes(`#${pObj.player.number}`)) {
        detectedPlayer = pObj;
        setSelectedPlayer(pObj);
        break;
      }
    }

    for (const action of actionList) {
      if (text.includes(action.label.toLowerCase())) {
        detectedAction = action;
        break;
      }
    }
    
    if (text.includes('golo')) detectedAction = { type: 'goal', label: 'GOLO', icon: '', color: '' };

    if (detectedAction) {
      const team = detectedPlayer?.team || (text.includes('casa') ? 'home' : 'away') || 'home';
      handleAction(detectedAction.type, team, detectedPlayer?.player);
      
      setTimeout(() => {
        setIsVoiceActive(false);
        setVoiceTranscript('');
      }, 1000);
    }
  };

  useEffect(() => {
    voiceEngine.current = new VoiceTacticalEngine((command) => {
      processVoiceCommand(command);
    });

    const handleShortcuts = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a') onSetPossession('home');
      if (key === 's') onSetPossession('none');
      if (key === 'd') onSetPossession('away');
    };

    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [matchData, actionList, selectedPlayer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAction = (type: ActionType, team: 'home' | 'away', playerOverride?: PlayerLineup) => {
    if (isEditMode) return;
    
    // Garantir que pegamos o jogador selecionado corretamente
    const player = playerOverride || (selectedPlayer?.team === team ? selectedPlayer.player : undefined);
    
    const desc = `${type.replace('_', ' ').toUpperCase()} | ${player ? `#${player.number} ${player.name}` : 'Equipa ' + team.toUpperCase()}`;
    
    // Registo individual só ocorre se houver um jogador identificado
    onAddEvent({
      type,
      team,
      playerNumber: player?.number,
      playerName: player?.name,
      timestamp: currentTime,
      description: desc,
      analystRole: player ? 'individual' : 'collective'
    });
    
    // Reset da seleção para evitar registos acidentais seguidos no mesmo jogador
    setSelectedPlayer(null);
  };

  const triggerVoice = (initialContext: string) => {
    setActiveActionForVoice(initialContext);
    setVoiceTranscript('A ouvir...');
    setIsVoiceActive(true);
    voiceEngine.current?.start();
    
    setTimeout(() => {
      voiceEngine.current?.stop();
      if (voiceTranscript === 'A ouvir...') {
        setIsVoiceActive(false);
      }
    }, 4000);
  };

  const getPlayerStats = (playerNumber: number, team: 'home' | 'away') => {
    // Filtro rigoroso por número E equipa para garantir precisão
    const events = matchData.events.filter(e => e.playerNumber === playerNumber && e.team === team);
    return {
      goals: events.filter(e => e.type === 'goal').length,
      passes: events.filter(e => e.type === 'pass_certo').length,
      passErr: events.filter(e => e.type === 'pass_errado').length,
      shots: events.filter(e => e.type === 'remate_certo' || e.type === 'remate_fora').length,
      recovery: events.filter(e => e.type === 'recuperacao').length,
      fouls: events.filter(e => e.type === 'falta_cometida').length
    };
  };

  const TeamSection = ({ team }: { team: 'home' | 'away' }) => {
    const teamData = team === 'home' ? matchData.homeTeam : matchData.awayTeam;
    return (
      <div className="flex flex-col gap-2">
        <h4 className={`text-[9px] font-black uppercase tracking-[0.2em] text-center py-2 rounded-t-xl border-x border-t border-white/5 ${team === 'home' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-orange-500'}`}>
          {teamData.name}
        </h4>
        
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 p-2 bg-zinc-950/40 border-x border-white/5">
          {teamData.lineup.map(p => (
            <div key={p.number} className="relative">
              <button 
                onClick={() => setSelectedPlayer({ team, player: p })} 
                className={`w-full h-11 rounded-lg text-[11px] font-black border transition-all flex items-center justify-center ${selectedPlayer?.player.number === p.number && selectedPlayer?.team === team ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] scale-95 z-10 animate-pulse' : p.isStarter ? 'bg-zinc-900 border-white/5 text-zinc-400' : 'bg-black border-white/5 text-zinc-700'}`}
              >
                {p.number}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); triggerVoice(`Comando para #${p.number} ${p.name}`); }}
                className="absolute -top-2.5 -right-2.5 w-9 h-9 bg-zinc-800 border border-white/20 rounded-full flex items-center justify-center shadow-2xl z-20 hover:bg-orange-500 hover:scale-110 transition-all active:scale-90"
              >
                <i className="fas fa-microphone text-[11px] text-white"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 p-2 bg-zinc-900/20 border-x border-b border-white/5 rounded-b-xl overflow-y-auto custom-scrollbar">
          <div className="relative mb-2">
            <button onClick={() => handleAction('goal', team)} className="bg-white text-black w-full py-4 px-3 rounded-lg text-[11px] font-black uppercase flex items-center justify-center gap-2 shadow-2xl hover:bg-orange-50 transition-all active:scale-95">
              <i className="fas fa-futbol text-[13px]"></i> GOLO
            </button>
            <button onClick={(e) => { e.stopPropagation(); triggerVoice(`GOLO ${teamData.name}`); }} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-400 hover:text-orange-500 transition-all border border-black/5">
              <i className="fas fa-microphone text-[11px]"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {actionList.map((a) => (
              <div key={a.type} className="relative">
                <button 
                  onClick={() => handleAction(a.type, team)} 
                  className={`${a.color} w-full py-4 pr-8 pl-3 rounded-lg text-[9px] font-black uppercase flex flex-col items-start justify-center transition-all hover:brightness-110 active:scale-95 shadow-lg min-h-[55px]`}
                >
                  <i className={`fas ${a.icon} text-[11px] mb-1 opacity-80`}></i>
                  <span className="truncate w-full text-left leading-tight">{a.label}</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); triggerVoice(a.label); }} 
                  className="absolute right-1 w-7 h-7 top-1/2 -translate-y-1/2 bg-black/30 rounded flex items-center justify-center text-white/50 hover:text-white hover:bg-orange-500 transition-all border border-white/5"
                >
                  <i className="fas fa-microphone text-[9px]"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-3 max-h-screen overflow-hidden pb-4">
      <div className="flex items-center justify-between p-1 bg-zinc-950 rounded-2xl border border-white/5 shadow-2xl">
        <div className="flex bg-black/50 p-1 rounded-xl gap-1 flex-1">
          <button 
            onClick={() => setActiveTab('terminal')} 
            className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'terminal' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <i className="fas fa-terminal text-[8px]"></i> Terminal
          </button>
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex-1 py-2 text-[9px] font-black uppercase rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'stats' ? 'bg-orange-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <i className="fas fa-chart-line text-[8px]"></i> Performance
          </button>
        </div>
        <button 
          onClick={() => setAnalystRole(analystRole === 'individual' ? 'collective' : 'individual')} 
          className={`ml-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 border transition-all ${analystRole === 'collective' ? 'bg-sky-600 border-sky-400 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500'}`}
        >
          <i className={`fas ${analystRole === 'collective' ? 'fa-users' : 'fa-user'}`}></i>
          {analystRole === 'collective' ? 'Modo Coletivo' : 'Modo Individual'}
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'terminal' ? (
          <div className="flex flex-col h-full gap-3 animate-in fade-in duration-300">
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-900/40 rounded-2xl border border-white/5">
              <button onClick={() => onSetPossession('home')} className={`py-5 rounded-xl transition-all flex flex-col items-center group ${possessionState === 'home' ? 'bg-white text-black scale-[1.03] shadow-2xl' : 'bg-zinc-900 text-zinc-600'}`}>
                <span className="text-2xl font-black mono leading-none mb-1">{formatTime(matchData.possessionTimeHome)}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">CASA [A]</span>
              </button>
              <button onClick={() => onSetPossession('none')} className={`py-5 rounded-xl transition-all flex flex-col items-center justify-center ${possessionState === 'none' ? 'bg-red-600 text-white ring-4 ring-red-600/10' : 'bg-zinc-900 text-zinc-700'}`}>
                <i className="fas fa-stop text-sm mb-1"></i>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">PARAR [S]</span>
              </button>
              <button onClick={() => onSetPossession('away')} className={`py-5 rounded-xl transition-all flex flex-col items-center ${possessionState === 'away' ? 'bg-orange-600 text-white scale-[1.03] shadow-2xl' : 'bg-zinc-900 text-zinc-600'}`}>
                <span className="text-2xl font-black mono leading-none mb-1">{formatTime(matchData.possessionTimeAway)}</span>
                <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">FORA [D]</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
              <TeamSection team="home" />
              <TeamSection team="away" />
            </div>

            <div className="h-[200px] bg-zinc-950/90 border border-white/5 rounded-2xl p-3 flex flex-col shadow-inner">
              <div className="flex justify-between items-center mb-2 px-1">
                 <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2">
                   <i className="fas fa-bolt text-orange-500"></i> Tactical_Live_Feed
                 </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {matchData.events.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <i className="fas fa-inbox text-2xl mb-2"></i>
                    <span className="text-[8px] font-black uppercase tracking-widest">A aguardar eventos...</span>
                  </div>
                ) : (
                  matchData.events.slice().reverse().map(e => (
                    <div key={e.id} className={`group flex items-center justify-between p-2.5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-all ${e.type === 'goal' ? 'bg-orange-600/10 border-orange-600/20' : 'bg-zinc-900/60'}`}>
                      <div className="flex items-center gap-3 flex-1 overflow-hidden" onClick={() => onSeek(e.timestamp)}>
                         <span className="text-[9px] font-black text-orange-500 mono bg-orange-500/5 px-2 py-0.5 rounded shrink-0">{formatTime(e.timestamp)}</span>
                         <span className={`text-[9px] font-black uppercase truncate ${e.team === 'home' ? 'text-white' : 'text-orange-400'}`}>
                           {e.type === 'goal' && <i className="fas fa-star text-yellow-500 mr-2"></i>}
                           {e.description}
                         </span>
                      </div>
                      <button 
                        onClick={(ev) => { ev.stopPropagation(); onDeleteEvent(e.id); }}
                        className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-600/20 hover:text-red-500 text-zinc-600 rounded-lg transition-all"
                      >
                        <i className="fas fa-trash-can text-[10px]"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                {['home', 'away'].map((t) => {
                  const team = t as 'home' | 'away';
                  const teamData = team === 'home' ? matchData.homeTeam : matchData.awayTeam;
                  return (
                    <div key={t} className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <h5 className={`text-[10px] font-black uppercase tracking-[0.2em] ${team === 'home' ? 'text-white' : 'text-orange-500'}`}>
                          Performance Individual: {teamData.name}
                        </h5>
                        <span className="text-[8px] text-zinc-700 mono">TRACK_DATA_LIVE</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {teamData.lineup.filter(p => p.name).map(p => {
                          const stats = getPlayerStats(p.number, team);
                          const totalPasses = stats.passes + stats.passErr;
                          const passAccuracy = totalPasses > 0 ? Math.round((stats.passes / totalPasses) * 100) : 0;
                          
                          return (
                            <div key={p.number} className="bg-zinc-950/40 p-3 rounded-xl border border-white/5 flex flex-col gap-3 group hover:border-orange-500/30 transition-all">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <span className="w-9 h-9 rounded-lg bg-zinc-900 flex items-center justify-center text-[13px] font-black text-white border border-white/10">{p.number}</span>
                                  <div>
                                    <span className="text-[11px] font-black text-white uppercase block leading-none">{p.name}</span>
                                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{p.position}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`text-[14px] font-black ${stats.goals > 0 ? 'text-yellow-500' : 'text-zinc-700'}`}>
                                    {stats.goals} <i className="fas fa-futbol text-[11px]"></i>
                                  </span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-4 gap-2">
                                <div className="bg-black/60 p-2 rounded-lg text-center border border-white/5">
                                  <p className="text-[7px] text-zinc-500 font-black uppercase mb-1">Passes</p>
                                  <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-[11px] font-black text-emerald-500">{stats.passes}</span>
                                    <span className="text-[8px] text-zinc-700">/</span>
                                    <span className="text-[10px] font-black text-white">{passAccuracy}%</span>
                                  </div>
                                </div>
                                <div className="bg-black/60 p-2 rounded-lg text-center border border-white/5">
                                  <p className="text-[7px] text-zinc-500 font-black uppercase mb-1">Remates</p>
                                  <span className="text-[11px] font-black text-orange-500">{stats.shots}</span>
                                </div>
                                <div className="bg-black/60 p-2 rounded-lg text-center border border-white/5">
                                  <p className="text-[7px] text-zinc-500 font-black uppercase mb-1">Recup.</p>
                                  <span className="text-[11px] font-black text-sky-500">{stats.recovery}</span>
                                </div>
                                <div className="bg-black/60 p-2 rounded-lg text-center border border-white/5">
                                  <p className="text-[7px] text-zinc-500 font-black uppercase mb-1">Faltas</p>
                                  <span className="text-[11px] font-black text-amber-600">{stats.fouls}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
             </div>
          </div>
        )}
      </div>

      {isVoiceActive && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center z-[500] animate-in fade-in duration-300">
           <div className="relative mb-10">
              <div className="w-28 h-28 bg-orange-600 rounded-full flex items-center justify-center animate-pulse shadow-[0_0_80px_rgba(249,115,22,0.4)]">
                 <i className="fas fa-microphone text-5xl text-white"></i>
              </div>
              <div className="absolute -inset-6 border-2 border-orange-500/20 rounded-full animate-ping"></div>
           </div>
           <h3 className="text-white font-black uppercase tracking-[0.4em] text-lg text-center px-8 mb-4">{activeActionForVoice}</h3>
           <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl w-full max-w-lg text-center mx-6">
              <p className="text-orange-500 font-black uppercase tracking-widest text-[10px] mb-2">Transcrição em tempo real:</p>
              <p className="text-white text-xl font-bold italic">"{voiceTranscript || '...'}"</p>
           </div>
           <p className="text-zinc-600 text-[11px] mt-8 mono uppercase tracking-[0.5em] animate-pulse">Conjugação_Jogador_Ação_Ativa</p>
        </div>
      )}
    </div>
  );
};

export default ManualConsole;

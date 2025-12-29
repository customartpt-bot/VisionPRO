
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import MatchVideoPlayer from './components/MatchVideoPlayer';
import ManualConsole from './components/ManualConsole';
import IntroPage from './components/IntroPage';
import AuthPage from './components/AuthPage';
import HubPage from './components/HubPage';
import SpectatorDashboard from './components/SpectatorDashboard';
import StatsCard from './components/StatsCard';
import { dbService, supabase } from './services/dbService';
import { ManualMatchAnalysis, MatchEvent, ActionType, PlayerLineup, UserRole } from './types';

type AppViewState = 'intro' | 'auth' | 'hub' | 'setup' | 'analysis';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<AppViewState>('intro');
  const [userRole, setUserRole] = useState<UserRole>('analista');
  const [videoSrc, setVideoSrc] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [history, setHistory] = useState<ManualMatchAnalysis[]>([]);
  
  const [possessionState, setPossessionState] = useState<'home' | 'away' | 'none'>('none');
  const lastPossessionTick = useRef<number>(Date.now());

  const [matchData, setMatchData] = useState<ManualMatchAnalysis>({
    id: '',
    videoSource: '',
    date: new Date().toISOString().split('T')[0],
    time: '20:30',
    location: 'Estádio Pro',
    homeTeam: { name: 'CASA', lineup: [] },
    awayTeam: { name: 'FORA', lineup: [] },
    events: [],
    possessionTimeHome: 0,
    possessionTimeAway: 0
  });

  const loadHistory = async () => {
    try {
      const data = await dbService.fetchMatches();
      setHistory(data);
    } catch (err) {
      console.error("Erro ao carregar histórico:", err);
    }
  };

  useEffect(() => {
    if (viewState === 'hub') loadHistory();
  }, [viewState]);

  useEffect(() => {
    if (viewState === 'analysis' && userRole === 'jogo' && matchData.id) {
      const subscription = dbService.subscribeToMatch(matchData.id, (newEvent) => {
        setMatchData(prev => {
          if (prev.events.some(e => e.id === newEvent.id)) return prev;
          return {
            ...prev,
            events: [...prev.events, newEvent]
          };
        });
      });
      
      return () => {
        if (subscription && typeof (subscription as any).unsubscribe === 'function') {
          (subscription as any).unsubscribe();
        } else if (supabase && subscription) {
          supabase.removeChannel(subscription as any);
        }
      };
    }
  }, [viewState, userRole, matchData.id]);

  useEffect(() => {
    if (viewState !== 'analysis' || possessionState === 'none' || userRole === 'jogo') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = (now - lastPossessionTick.current) / 1000;
      lastPossessionTick.current = now;

      setMatchData(prev => ({
        ...prev,
        possessionTimeHome: possessionState === 'home' ? prev.possessionTimeHome + delta : prev.possessionTimeHome,
        possessionTimeAway: possessionState === 'away' ? prev.possessionTimeAway + delta : prev.possessionTimeAway
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [viewState, possessionState, userRole]);

  const handleAddEvent = async (event: Omit<MatchEvent, 'id'>) => {
    if (userRole === 'jogo') return;
    
    try {
      let currentMatchId = matchData.id;
      
      if (!currentMatchId || currentMatchId.length === 0) {
        const savedMatch = await dbService.saveMatch(matchData);
        currentMatchId = savedMatch.id;
        setMatchData(prev => ({ ...prev, id: currentMatchId }));
      }
      
      await dbService.addEvent(event, currentMatchId);
      
      const newEvent: MatchEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
      setMatchData(prev => ({ ...prev, events: [...prev.events, newEvent] }));
    } catch (e) {
      console.error("Erro ao guardar evento:", e);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (userRole === 'jogo') return;
    setMatchData(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== eventId)
    }));
  };

  const saveToHistory = async () => {
    try {
      await dbService.saveMatch(matchData);
      const isCloud = dbService.isCloudEnabled();
      alert(isCloud ? "Relatório tático sincronizado com a Cloud." : "Relatório guardado localmente (Offline).");
      setViewState('hub');
    } catch (e) {
      console.error(e);
      alert("Erro ao sincronizar dados.");
    }
  };

  const deleteAnalysis = async (id: string) => {
    if (userRole !== 'admin') return;
    if (confirm("Apagar permanentemente este relatório tático?")) {
      try {
        await dbService.deleteMatch(id);
        loadHistory();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const startNewAnalysis = () => {
    const generateFullLineup = () => {
      return [
        ...Array.from({ length: 11 }, (_, i) => ({ number: i + 1, name: '', position: 'Titular', isStarter: true })),
        ...Array.from({ length: 9 }, (_, i) => ({ number: i + 12, name: '', position: 'Suplente', isStarter: false }))
      ];
    };

    setMatchData({
      id: '', 
      videoSource: '',
      date: new Date().toISOString().split('T')[0],
      time: '20:30',
      location: 'Estádio Municipal',
      homeTeam: { name: 'HOME_XI', lineup: generateFullLineup() },
      awayTeam: { name: 'AWAY_XI', lineup: generateFullLineup() },
      events: [],
      possessionTimeHome: 0,
      possessionTimeAway: 0
    });
    setVideoSrc('');
    setViewState('setup');
  };

  const updatePlayer = (team: 'home' | 'away', index: number, field: keyof PlayerLineup, value: any) => {
    setMatchData(prev => {
      const teamKey = team === 'home' ? 'homeTeam' : 'awayTeam';
      const newLineup = [...prev[teamKey].lineup];
      newLineup[index] = { ...newLineup[index], [field]: value };
      return { ...prev, [teamKey]: { ...prev[teamKey], lineup: newLineup } };
    });
  };

  const getStats = (team: 'home' | 'away', type: ActionType) => matchData.events.filter(e => e.team === team && e.type === type).length;
  const getCombinedStats = (team: 'home' | 'away', types: ActionType[]) => matchData.events.filter(e => e.team === team && types.includes(e.type)).length;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTimeSinceLastShot = (team: 'home' | 'away') => {
    const shots = matchData.events.filter(e => e.team === team && ['remate_certo', 'remate_fora'].includes(e.type));
    if (shots.length === 0) return formatTime(currentTime);
    const lastShotTime = shots[shots.length - 1].timestamp;
    return formatTime(Math.max(0, currentTime - lastShotTime));
  };

  const calculatePossessionPerc = () => {
    const total = matchData.possessionTimeHome + matchData.possessionTimeAway;
    if (total === 0) return { home: 50, away: 50 };
    return {
      home: Math.round((matchData.possessionTimeHome / total) * 100),
      away: Math.round((matchData.possessionTimeAway / total) * 100)
    };
  };

  const possessionPerc = calculatePossessionPerc();

  if (viewState === 'intro') return <IntroPage onFinish={() => setViewState('auth')} />;
  
  if (viewState === 'auth') return (
    <AuthPage onLogin={async (role) => {
      setUserRole(role);
      setViewState('hub');
    }} />
  );

  return (
    <div className="min-h-screen metallic-bg">
      <Header 
        viewState={viewState} 
        matchData={viewState === 'analysis' ? matchData : undefined}
        score={viewState === 'analysis' ? { home: getStats('home', 'goal'), away: getStats('away', 'goal') } : undefined}
        onSave={(userRole === 'admin' || userRole === 'analista') ? saveToHistory : undefined}
        onGoToHub={() => setViewState('hub')}
      />
      
      <main className="max-w-[1800px] mx-auto px-6 py-4">
        
        {viewState === 'hub' && (
          <HubPage 
            history={history} 
            userRole={userRole}
            onAddNew={startNewAnalysis} 
            onSelectAnalysis={(a) => { 
              setMatchData(a); 
              setVideoSrc(a.videoSource); 
              setViewState('analysis'); 
            }} 
            onDelete={deleteAnalysis}
          />
        )}

        {viewState === 'setup' && (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setViewState('hub')} className="text-zinc-500 hover:text-white transition-colors"><i className="fas fa-arrow-left"></i></button>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">Configuração_Partida</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-4">
                <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Link Captura Vídeo</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-white font-bold text-xs" value={videoSrc} onChange={e => { setVideoSrc(e.target.value); setMatchData(p => ({...p, videoSource: e.target.value})); }} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Data Jogo</label>
                      <input type="date" className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-white text-xs" value={matchData.date} onChange={e => setMatchData(p => ({...p, date: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Hora</label>
                      <input type="time" className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-white text-xs" value={matchData.time} onChange={e => setMatchData(p => ({...p, time: e.target.value}))} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Equipa Casa</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-white font-black text-xs" value={matchData.homeTeam.name} onChange={e => setMatchData(p => ({...p, homeTeam: {...p.homeTeam, name: e.target.value.toUpperCase()}}))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Equipa Fora</label>
                    <input type="text" className="w-full bg-zinc-900 border border-white/5 rounded-lg p-3 text-white font-black text-xs" value={matchData.awayTeam.name} onChange={e => setMatchData(p => ({...p, awayTeam: {...p.awayTeam, name: e.target.value.toUpperCase()}}))} />
                  </div>
                  <button onClick={() => setViewState('analysis')} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs rounded-xl transition-all shadow-xl shadow-orange-600/20">Iniciar Análise Cloud</button>
                </div>
              </div>
              <div className="lg:col-span-8 grid grid-cols-2 gap-4 h-[70vh] overflow-hidden">
                {['home', 'away'].map((t) => (
                  <div key={t} className="glass-card rounded-2xl p-4 border border-white/5 overflow-y-auto custom-scrollbar flex flex-col">
                    <h3 className="text-[10px] font-black text-orange-500 uppercase mb-3 flex items-center justify-between">
                      {t === 'home' ? matchData.homeTeam.name : matchData.awayTeam.name}
                      <span className="text-[8px] text-zinc-600">Plantel Digital</span>
                    </h3>
                    <div className="space-y-1">
                      {(t === 'home' ? matchData.homeTeam : matchData.awayTeam).lineup.map((p, idx) => (
                        <div key={idx} className={`flex gap-2 p-1 rounded-lg ${p.isStarter ? 'bg-zinc-900/40' : 'bg-black/20'}`}>
                          <input type="number" placeholder="Nº" className="w-12 bg-black/40 border border-white/5 rounded p-1.5 text-white text-[10px] text-center font-black" value={p.number} onChange={e => updatePlayer(t as any, idx, 'number', parseInt(e.target.value))} />
                          <input type="text" placeholder={p.isStarter ? "Nome Titular" : "Nome Suplente"} className="flex-1 bg-black/40 border border-white/5 rounded p-1.5 text-white text-[10px] font-bold" value={p.name} onChange={e => updatePlayer(t as any, idx, 'name', e.target.value)} />
                          <div className={`w-2 h-2 rounded-full mt-3 ${p.isStarter ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewState === 'analysis' && (
          userRole === 'jogo' ? (
            <SpectatorDashboard matchData={matchData} currentTime={currentTime} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
              <div className="lg:col-span-7 space-y-4">
                <div className="w-full">
                  <MatchVideoPlayer src={videoSrc} onTimeUpdate={setCurrentTime} seekTo={seekTo} />
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <StatsCard label="Posse Real" homeValue={possessionPerc.home} awayValue={possessionPerc.away} icon="fa-clock" percentage />
                  <StatsCard label="Passe Certo" homeValue={getStats('home', 'pass_certo')} awayValue={getStats('away', 'pass_certo')} icon="fa-circle-check" />
                  <StatsCard label="Passe Errado" homeValue={getStats('home', 'pass_errado')} awayValue={getStats('away', 'pass_errado')} icon="fa-circle-xmark" />
                  <StatsCard label="Remates" homeValue={getCombinedStats('home', ['remate_certo', 'remate_fora'])} awayValue={getCombinedStats('away', ['remate_certo', 'remate_fora'])} icon="fa-bullseye" />
                  
                  <StatsCard label="Recuperação" homeValue={getStats('home', 'recuperacao')} awayValue={getStats('away', 'recuperacao')} icon="fa-shield-halved" />
                  <StatsCard label="Falta Comet." homeValue={getStats('home', 'falta_cometida')} awayValue={getStats('away', 'falta_cometida')} icon="fa-hand-back-fist" />
                  <StatsCard label="Falta Sofr." homeValue={getStats('home', 'falta_sofrida')} awayValue={getStats('away', 'falta_sofrida')} icon="fa-person-falling" />
                  <StatsCard label="T. Sem Remate" homeValue={getTimeSinceLastShot('home')} awayValue={getTimeSinceLastShot('away')} icon="fa-hourglass-half" />
                </div>
              </div>
              <div className="lg:col-span-5 h-[calc(100vh-100px)] overflow-hidden">
                <ManualConsole 
                  matchData={matchData} 
                  currentTime={currentTime} 
                  possessionState={possessionState}
                  onSetPossession={(s) => {
                    setPossessionState(s);
                    lastPossessionTick.current = Date.now();
                  }}
                  onAddEvent={handleAddEvent} 
                  onDeleteEvent={handleDeleteEvent}
                  onSeek={setSeekTo} 
                />
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default App;

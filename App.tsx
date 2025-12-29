
import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import VideoAnalyzer from './components/VideoAnalyzer';
import Dashboard from './components/Dashboard';
import { AnalysisData } from './types';
import { analyzeFootballVideo } from './services/geminiService';
import { dbService } from './services/dbService';

const STORAGE_KEY_USER = 'visionpro_user_id';

const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [history, setHistory] = useState<AnalysisData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Gerar ou recuperar um ID de utilizador persistente para este navegador
  const userId = useMemo(() => {
    let id = localStorage.getItem(STORAGE_KEY_USER);
    if (!id) {
      id = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(STORAGE_KEY_USER, id);
    }
    return id;
  }, []);

  // Carregar histórico do Neon ao iniciar
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingHistory(true);
      try {
        const data = await dbService.fetchAnalyses();
        setHistory(data);
      } catch (e) {
        console.error("Falha ao sincronizar com Neon", e);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    loadData();
  }, []);

  const handleStartAnalysis = async (description: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = await analyzeFootballVideo(description);
      setAnalysisData(result);
      
      // Guardar no Neon
      await dbService.saveAnalysis(result, userId, description.substring(0, 30));
      
      // Atualizar lista local
      setHistory(prev => [result, ...prev].slice(0, 20));
    } catch (error: any) {
      console.error("Analysis failed:", error);
      setErrorMsg(`Erro na Engine VisionPRO: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectFromHistory = (data: AnalysisData) => {
    setAnalysisData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen metallic-bg">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-400">
              <i className="fas fa-triangle-exclamation"></i>
              <span className="text-sm font-medium">{errorMsg}</span>
            </div>
            <button 
              onClick={() => setErrorMsg(null)}
              className="text-xs text-red-300 hover:text-white"
            >
              Fechar
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <VideoAnalyzer 
              onAnalyze={handleStartAnalysis} 
              isAnalyzing={isAnalyzing} 
            />
            
            {/* Histórico Cloud (Neon DB) */}
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <i className="fas fa-cloud text-sky-500"></i>
                  Recolha Cloud
                </h4>
                {isLoadingHistory && <i className="fas fa-circle-notch animate-spin text-slate-600 text-xs"></i>}
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {history.length === 0 && !isLoadingHistory ? (
                  <p className="text-xs text-slate-500 italic">Nenhuma análise encontrada no servidor.</p>
                ) : (
                  history.map((item, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => selectFromHistory(item)}
                      className={`p-3 rounded-xl border border-white/5 cursor-pointer transition-all hover:bg-white/5 flex items-center justify-between group ${analysisData?.homeTeam.name === item.homeTeam.name ? 'bg-sky-500/10 border-sky-500/30' : 'bg-slate-800/30'}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white group-hover:text-sky-400">
                          {item.homeTeam.name} vs {item.awayTeam.name}
                        </span>
                        <span className="text-[10px] text-slate-500">Recolha VisionPRO</span>
                      </div>
                      <i className="fas fa-chevron-right text-[10px] text-slate-600 group-hover:text-sky-400"></i>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Configurações de IA</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <i className="fas fa-person-running text-orange-500"></i>
                      <span className="text-sm text-slate-200">Geração de Heatmap</span>
                   </div>
                   <div className="w-10 h-5 bg-orange-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <i className="fas fa-microchip text-sky-500"></i>
                      <span className="text-sm text-slate-200">Análise Neural Tática</span>
                   </div>
                   <div className="w-10 h-5 bg-sky-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Dashboard data={analysisData} />
          </div>

        </div>
      </main>

      <footer className="border-t border-white/5 bg-slate-950/50 py-12">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
              <i className="fas fa-shield-halved text-slate-400"></i>
            </div>
            <span className="font-black text-slate-500 tracking-tighter">VisionPRO v3.7 - Neon Cloud</span>
          </div>
          
          <div className="flex items-center gap-8 text-xs text-slate-500 uppercase font-bold">
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Enterprise</a>
            <a href="#" className="hover:text-white transition-colors">API Cloud</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-sky-600 transition-colors">
              <i className="fab fa-twitter text-white"></i>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors">
              <i className="fab fa-linkedin text-white"></i>
            </a>
          </div>
        </div>
        <div className="text-center mt-8 text-[10px] text-slate-600 uppercase tracking-widest font-black">
          &copy; {new Date().getFullYear()} VisionPRO Artificial Intelligence Sports Analytics.
        </div>
      </footer>
    </div>
  );
};

export default App;

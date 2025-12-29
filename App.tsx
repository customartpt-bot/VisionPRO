
import React, { useState } from 'react';
import Header from './components/Header';
import VideoAnalyzer from './components/VideoAnalyzer';
import Dashboard from './components/Dashboard';
import IntroPage from './components/IntroPage';
import AuthPage from './components/AuthPage';
import { AnalysisData } from './types';
import { analyzeFootballVideo } from './services/geminiService';
import { dbService } from './services/dbService';

type AppViewState = 'intro' | 'auth' | 'main';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<AppViewState>('intro');
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartAnalysis = async (description: string) => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const result = await analyzeFootballVideo(description);
      setAnalysisData(result);
      
      if (dbService.isConfigured()) {
        await dbService.saveAnalysis(result, "alpha_analyst_01", description.split(':')[1]?.trim() || "Nova Análise");
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Falha na conexão com o motor tático.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (viewState === 'intro') {
    return <IntroPage onFinish={() => setViewState('auth')} />;
  }

  if (viewState === 'auth') {
    return <AuthPage onLogin={() => setViewState('main')} />;
  }

  return (
    <div className="min-h-screen metallic-bg selection:bg-orange-500/30 animate-in fade-in duration-1000">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-8 py-10 relative z-10">
        {errorMsg && (
          <div className="mb-8 p-5 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 backdrop-blur-md">
            <div className="flex items-center gap-4 text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <i className="fas fa-triangle-exclamation"></i>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest block">System Alert</span>
                <span className="text-xs text-red-300/80 font-bold">{errorMsg}</span>
              </div>
            </div>
            <button onClick={() => setErrorMsg(null)} className="px-4 py-2 bg-black border border-white/10 hover:bg-zinc-900 rounded-lg text-[10px] text-white font-black uppercase transition-colors">Fechar</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-4">
            <VideoAnalyzer onAnalyze={handleStartAnalysis} isAnalyzing={isAnalyzing} />
            
            <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-black/20 hidden xl:block">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Satus de Análise</h4>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">O motor VisionPRO está sincronizado. Carregue um vídeo para iniciar a extração de métricas de alta performance.</p>
            </div>
          </div>

          <div className="xl:col-span-8">
            <Dashboard data={analysisData} />
          </div>
        </div>
      </main>

      <footer className="w-full py-8 border-t border-white/5 mt-auto">
        <div className="max-w-[1600px] mx-auto px-8 flex justify-between items-center opacity-30">
          <span className="text-[9px] font-black text-white uppercase tracking-widest">VisionPRO Pro Series</span>
          <span className="text-[9px] font-black text-white uppercase tracking-widest">V3.0.5</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

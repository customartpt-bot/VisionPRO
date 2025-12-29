
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
        await dbService.saveAnalysis(result, "alpha_analyst_01", "Análise VisionPRO");
      }
    } catch (error: any) {
      const msg = error.message || "Erro de conexão.";
      setErrorMsg(msg);
      
      const aistudio = (window as any).aistudio;
      if (msg.includes("AUTH_") && aistudio) {
        setTimeout(async () => {
          if (typeof aistudio.openSelectKey === 'function') {
            await aistudio.openSelectKey();
            setErrorMsg(null);
          }
        }, 1500);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (viewState === 'intro') return <IntroPage onFinish={() => setViewState('auth')} />;
  if (viewState === 'auth') return <AuthPage onLogin={() => setViewState('main')} />;

  return (
    <div className="min-h-screen metallic-bg selection:bg-orange-500/30">
      <Header />
      <main className="max-w-[1600px] mx-auto px-8 py-10">
        {errorMsg && (
          <div className="mb-8 p-5 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-between animate-in slide-in-from-top-4 backdrop-blur-md">
            <div className="flex items-center gap-4 text-red-400">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <span className="text-[10px] font-black uppercase block">Erro de Sistema</span>
                <span className="text-xs text-red-300/80 font-bold">{errorMsg}</span>
              </div>
            </div>
            <button onClick={() => setErrorMsg(null)} className="px-4 py-2 bg-black border border-white/10 rounded-lg text-[10px] text-white font-black uppercase">Fechar</button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <div className="xl:col-span-4">
            <VideoAnalyzer onAnalyze={handleStartAnalysis} isAnalyzing={isAnalyzing} />
            <div className="mt-8 p-6 rounded-2xl border border-white/5 bg-black/20 hidden xl:block">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Status do Terminal</h4>
              <p className="text-[11px] text-slate-500 leading-tight">O motor VisionPRO está pronto para processamento de alto rendimento.</p>
            </div>
          </div>
          <div className="xl:col-span-8">
            <Dashboard data={analysisData} />
          </div>
        </div>
      </main>
      <footer className="w-full py-8 border-t border-white/5 text-center opacity-30">
        <span className="text-[9px] font-black text-white uppercase tracking-widest">VisionPRO Series V3.0.7</span>
      </footer>
    </div>
  );
};

export default App;

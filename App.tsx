
import React, { useState } from 'react';
import Header from './components/Header';
import VideoAnalyzer from './components/VideoAnalyzer';
import Dashboard from './components/Dashboard';
import { AnalysisData } from './types';
import { analyzeFootballVideo } from './services/geminiService';

const App: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history'>('dashboard');

  const handleStartAnalysis = async (description: string) => {
    setIsAnalyzing(true);
    try {
      // Small artificial delay to allow UI to show "processing" state properly
      await new Promise(r => setTimeout(r, 3000));
      const result = await analyzeFootballVideo(description);
      setAnalysisData(result);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI Analysis service currently busy. Please try again in a moment.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen metallic-bg">
      <Header />
      
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Video Controls */}
          <div className="lg:col-span-4 sticky top-24 space-y-6">
            <VideoAnalyzer 
              onAnalyze={handleStartAnalysis} 
              isAnalyzing={isAnalyzing} 
            />
            
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Analysis Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <i className="fas fa-person-running text-orange-500"></i>
                      <span className="text-sm text-slate-200">Heatmap Generation</span>
                   </div>
                   <div className="w-10 h-5 bg-orange-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                      <i className="fas fa-microchip text-sky-500"></i>
                      <span className="text-sm text-slate-200">Neural Tactical Analysis</span>
                   </div>
                   <div className="w-10 h-5 bg-sky-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-xl overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/20 transition-all"></div>
               <h4 className="text-white font-bold mb-2">Support & Feedback</h4>
               <p className="text-xs text-slate-400 mb-4 leading-relaxed">Need help with high-resolution video ingestion or API integrations?</p>
               <button className="text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition-colors">
                  Contact Support
               </button>
            </div>
          </div>

          {/* Right Column: Dashboard Results */}
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
            <span className="font-black text-slate-500 tracking-tighter">VisionPRO v3.4</span>
          </div>
          
          <div className="flex items-center gap-8 text-xs text-slate-500 uppercase font-bold">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Enterprise Terms</a>
            <a href="#" className="hover:text-white transition-colors">API Docs</a>
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
          &copy; {new Date().getFullYear()} VisionPRO Artificial Intelligence Sports Analytics. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;

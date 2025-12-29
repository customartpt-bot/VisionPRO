
import React, { useState, useRef } from 'react';

interface VideoAnalyzerProps {
  onAnalyze: (description: string) => void;
  isAnalyzing: boolean;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ onAnalyze, isAnalyzing }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleStartAnalysis = () => {
    if (!videoFile) return;
    onAnalyze("Analisando vídeo: " + videoFile.name + ". Extração tática completa.");
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
          <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
          Vision_Core
        </h2>
        {videoFile && (
           <button 
            onClick={() => { setVideoFile(null); setPreviewUrl(null); }}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-orange-500 transition-colors"
          >
            [LIMPAR]
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group border border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all bg-black/40"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <i className="fas fa-video text-xl text-zinc-700 group-hover:text-orange-500"></i>
          </div>
          <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-widest">Carregar Stream de Vídeo</p>
          <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={handleFileChange} />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-white/5 aspect-video bg-black">
          <video src={previewUrl} className="w-full h-full object-cover" controls />
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center z-50">
              <div className="w-16 h-16 border-2 border-orange-500/10 border-t-orange-500 rounded-full animate-spin mb-6"></div>
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">IA_PROCESSANDO_DADOS</h3>
              <div className="mt-4 flex flex-col gap-1 text-[9px] font-bold uppercase mono">
                 <p className="text-emerald-500">>> SCANNING_FIELD</p>
                 <p className="text-orange-500">>> SYNCING_METRICS</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 space-y-4">
        <button
          disabled={!videoFile || isAnalyzing}
          onClick={handleStartAnalysis}
          className={`w-full py-5 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all ${
            !videoFile || isAnalyzing 
              ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed' 
              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-xl shadow-orange-600/20'
          }`}
        >
          {isAnalyzing ? "A PROCESSAR..." : "INICIAR ANÁLISE VISIONPRO"}
        </button>
      </div>
    </div>
  );
};

export default VideoAnalyzer;


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
    onAnalyze(`Analyzing match video: ${videoFile.name}. Full tactical breakdown requested.`);
  };

  return (
    <div className="glass-card rounded-3xl p-8 border border-white/5 shadow-2xl relative">
      <div className="scanline-effect opacity-[0.03]"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
          <div className="w-1.5 h-6 bg-orange-600 rounded-full"></div>
          Video_Intelligence_Core
        </h2>
        {videoFile && (
           <button 
            onClick={() => { setVideoFile(null); setPreviewUrl(null); }}
            className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-orange-500 transition-colors mono"
          >
            [CLEAR_ASSET]
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="group relative border border-dashed border-zinc-800 rounded-2xl p-16 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/[0.02] transition-all bg-black/40 overflow-hidden"
        >
          <div className="absolute top-2 left-2 w-4 h-4 border-t border-l border-zinc-700"></div>
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b border-r border-zinc-700"></div>
          
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600/10 transition-all border border-white/5 shadow-2xl">
            <i className="fas fa-video-slash text-2xl text-zinc-700 group-hover:text-orange-500"></i>
          </div>
          
          <p className="text-zinc-400 font-bold text-[11px] uppercase tracking-[0.3em]">Load_Input_Stream</p>
          <p className="text-zinc-700 text-[9px] mt-2 font-bold mono">SUPPORTED: MP4 / MOV / AV1</p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/*" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-white/5 aspect-video bg-black shadow-inner group">
          <video 
            src={previewUrl} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            controls
          />
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in z-50">
              <div className="relative mb-8">
                <div className="w-20 h-20 border-2 border-orange-500/10 border-t-orange-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <i className="fas fa-brain text-orange-500 text-2xl animate-pulse"></i>
                </div>
              </div>
              
              <div className="space-y-3 mono">
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">NEURAL_EXTRACTION_ACTIVE</h3>
                <div className="flex flex-col gap-1">
                   <p className="text-emerald-500 text-[9px] font-bold uppercase">>> SCANNING_PLAYERS [88%]</p>
                   <p className="text-orange-500 text-[9px] font-bold uppercase">>> CALCULATING_METRICS [ACTIVE]</p>
                </div>
              </div>
              
              <div className="w-full max-w-xs bg-zinc-900 h-[2px] mt-10 rounded-full overflow-hidden">
                <div className="h-full bg-orange-600 animate-[loading_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 space-y-4 relative z-10">
        <button
          disabled={!videoFile || isAnalyzing}
          onClick={handleStartAnalysis}
          className={`w-full py-5 rounded-xl font-black uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-4 transition-all overflow-hidden relative ${
            !videoFile || isAnalyzing 
              ? 'bg-zinc-950 text-zinc-800 cursor-not-allowed border border-zinc-900' 
              : 'bg-orange-600 hover:bg-orange-500 text-white shadow-2xl shadow-orange-600/20 active:translate-y-0.5'
          }`}
        >
          {isAnalyzing ? (
            <>
              <i className="fas fa-circle-notch animate-spin"></i>
              PROCESS_PENDING...
            </>
          ) : (
            <>
              <i className="fas fa-bolt-lightning"></i>
              BOOT_VISION_ENGINE
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-4 mono">
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-600 uppercase">Tracking</span>
                <i className="fas fa-crosshairs text-orange-500/50 text-[10px]"></i>
             </div>
             <p className="text-[10px] font-bold text-white uppercase">Optic_Ready</p>
          </div>
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-900 flex flex-col gap-2">
             <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-zinc-600 uppercase">Detection</span>
                <i className="fas fa-expand text-orange-500/50 text-[10px]"></i>
             </div>
             <p className="text-[10px] font-bold text-white uppercase">Object_AI_On</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyzer;

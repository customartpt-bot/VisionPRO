
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
    // In a real app, we'd send the actual video. Here we'll simulate based on filename or dummy description.
    onAnalyze(`Analyzing match video: ${videoFile.name}. Identifying player tracking for Team A (Home) vs Team B (Away). High intensity game with heavy focus on transition play.`);
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-video text-orange-500"></i>
          Video Source Analysis
        </h2>
        {videoFile && (
           <button 
            onClick={() => { setVideoFile(null); setPreviewUrl(null); }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear Video
          </button>
        )}
      </div>

      {!previewUrl ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <i className="fas fa-cloud-arrow-up text-2xl text-slate-400 group-hover:text-orange-400"></i>
          </div>
          <p className="text-slate-300 font-medium">Upload Match Video</p>
          <p className="text-slate-500 text-xs mt-2">MP4, MOV or WebM supported (Max 2GB)</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="video/*" 
            onChange={handleFileChange}
          />
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
          <video 
            src={previewUrl} 
            className="w-full h-full object-cover"
            controls
          />
          
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                <i className="fas fa-microchip absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-xl"></i>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Neural Processing</h3>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                Scanning player IDs, pitch boundaries, and calculating spatial metrics...
              </p>
              
              <div className="w-full max-w-sm bg-slate-800 h-1.5 rounded-full mt-6 overflow-hidden">
                <div className="h-full bg-orange-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        <button
          disabled={!videoFile || isAnalyzing}
          onClick={handleStartAnalysis}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
            !videoFile || isAnalyzing 
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02]'
          }`}
        >
          {isAnalyzing ? (
            <>
              <i className="fas fa-circle-notch animate-spin"></i>
              Analyzing Data...
            </>
          ) : (
            <>
              <i className="fas fa-bolt"></i>
              Run VisionPRO Engine
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
             <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-check-circle text-sky-400 text-[10px]"></i>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Field Tracking</span>
             </div>
             <p className="text-xs text-white">Dynamic Boundary Recognition</p>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg border border-white/5">
             <div className="flex items-center gap-2 mb-1">
                <i className="fas fa-check-circle text-sky-400 text-[10px]"></i>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Player IDs</span>
             </div>
             <p className="text-xs text-white">Automatic Jersey Identification</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalyzer;

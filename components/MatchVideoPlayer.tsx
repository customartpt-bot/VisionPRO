
import React, { useRef, useEffect, useState } from 'react';

interface MatchVideoPlayerProps {
  src: string;
  onTimeUpdate: (time: number) => void;
  seekTo?: number;
}

const MatchVideoPlayer: React.FC<MatchVideoPlayerProps> = ({ src, onTimeUpdate, seekTo }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (seekTo !== undefined && videoRef.current) {
      videoRef.current.currentTime = seekTo;
      videoRef.current.play();
    }
  }, [seekTo]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
      {src ? (
        <video 
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          controls
          onTimeUpdate={handleTimeUpdate}
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-white/5">
             <i className="fas fa-play text-zinc-700 text-3xl"></i>
          </div>
          <h3 className="text-white text-sm font-black uppercase tracking-[0.3em] mb-2">Aguardando Sinal de Vídeo</h3>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest max-w-xs">Introduza o link ou carregue o ficheiro para iniciar a monitorização tática.</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center p-8 text-center">
          <i className="fas fa-circle-exclamation text-4xl text-red-500 mb-4"></i>
          <p className="text-white font-bold uppercase tracking-widest text-xs">Erro ao carregar o vídeo. Verifique o formato.</p>
        </div>
      )}

      {/* HUD Overlay */}
      <div className="absolute top-6 left-6 flex items-center gap-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded border border-white/10 flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></div>
           <span className="text-[9px] font-black text-white uppercase tracking-widest">LIVE_CAPTURE</span>
        </div>
      </div>
    </div>
  );
};

export default MatchVideoPlayer;

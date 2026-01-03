import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { Mic, MicOff, Headphones, Activity } from 'lucide-react';

interface VoiceChatProps {
  matchId: string;
  role: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ matchId, role }) => {
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(true); // Começa mudo por privacidade
  const [peers, setPeers] = useState<string[]>([]);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<{ [key: string]: RTCPeerConnection }>({});
  const channelRef = useRef<any>(null);
  const myId = useRef(Math.random().toString(36).substr(2, 9));

  // Inicializar Canal de Sinalização
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase.channel(`voice_${matchId}`, {
      config: {
        broadcast: { self: false },
        presence: { key: myId.current },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const onlineUsers = Object.keys(state);
        setPeers(onlineUsers.filter(id => id !== myId.current));
      })
      .on('broadcast', { event: 'signal' }, async ({ payload }) => {
        const { from, signal } = payload;
        if (from === myId.current) return;

        if (!peersRef.current[from]) {
           createPeer(from, false);
        }

        const peer = peersRef.current[from];
        
        try {
            if (signal.type === 'offer') {
                if (peer.signalingState !== 'stable') return; // Evitar colisão
                await peer.setRemoteDescription(new RTCSessionDescription(signal));
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                channel.send({
                    type: 'broadcast',
                    event: 'signal',
                    payload: { from: myId.current, to: from, signal: answer }
                });
            } else if (signal.type === 'answer') {
                if (peer.signalingState === 'have-local-offer') {
                    await peer.setRemoteDescription(new RTCSessionDescription(signal));
                }
            } else if (signal.candidate) {
                await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
            }
        } catch (err) {
            console.error('Signal Error', err);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user: role, id: myId.current });
        }
      });

    channelRef.current = channel;

    return () => {
      stopAudio();
      supabase.removeChannel(channel);
    };
  }, [matchId, role]);

  const createPeer = (targetId: string, initiator: boolean) => {
      if (peersRef.current[targetId]) return peersRef.current[targetId];

      const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      peersRef.current[targetId] = pc;

      // Adicionar stream local se existir
      if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach(track => {
              pc.addTrack(track, localStreamRef.current!);
          });
      }

      pc.onicecandidate = (event) => {
          if (event.candidate) {
              channelRef.current?.send({
                  type: 'broadcast',
                  event: 'signal',
                  payload: { from: myId.current, to: targetId, signal: { candidate: event.candidate } }
              });
          }
      };

      pc.ontrack = (event) => {
          const remoteAudio = document.getElementById(`audio_${targetId}`) as HTMLAudioElement;
          if (remoteAudio && event.streams[0]) {
              remoteAudio.srcObject = event.streams[0];
              remoteAudio.play().catch(e => console.log('Autoplay prevent', e));
          } else {
              // Criar elemento de áudio dinamicamente se não existir
              const audio = document.createElement('audio');
              audio.id = `audio_${targetId}`;
              audio.autoplay = true;
              audio.srcObject = event.streams[0];
              document.body.appendChild(audio);
          }
      };

      if (initiator) {
          pc.createOffer().then(offer => {
              pc.setLocalDescription(offer);
              channelRef.current?.send({
                  type: 'broadcast',
                  event: 'signal',
                  payload: { from: myId.current, to: targetId, signal: offer }
              });
          });
      }

      return pc;
  };

  const startAudio = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = stream;
          stream.getAudioTracks()[0].enabled = !muted;
          setActive(true);

          // Conectar a todos os peers existentes
          peers.forEach(peerId => {
              createPeer(peerId, true);
          });

      } catch (err) {
          console.error("Erro ao aceder microfone", err);
          alert("Não foi possível aceder ao microfone.");
      }
  };

  const stopAudio = () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      // Fix: Cast the Object.values output to RTCPeerConnection[] to resolve the 'unknown' type error in stopAudio
      (Object.values(peersRef.current) as RTCPeerConnection[]).forEach(pc => pc.close());
      peersRef.current = {};
      setActive(false);
  };

  const toggleMute = () => {
      if (localStreamRef.current) {
          const enabled = !localStreamRef.current.getAudioTracks()[0].enabled;
          localStreamRef.current.getAudioTracks()[0].enabled = enabled;
          setMuted(!enabled);
      }
  };

  const toggleSystem = () => {
      if (active) stopAudio();
      else startAudio();
  };

  return (
    <div className="flex items-center gap-2 border-l border-dark-border pl-4 ml-2">
        {peers.length > 0 && active && (
             <div className="flex items-center gap-1 mr-2">
                 <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-[9px] font-bold text-green-500 uppercase">{peers.length} Online</span>
             </div>
        )}
        
        <button 
            onClick={toggleSystem}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${active ? 'bg-green-900/30 text-green-400 border border-green-500/50' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
        >
            <Headphones size={14} />
            {active ? 'COMMS ON' : 'COMMS OFF'}
        </button>

        {active && (
            <button 
                onClick={toggleMute}
                className={`p-2 rounded-full border transition-all ${muted ? 'bg-red-900/20 text-red-500 border-red-500/50' : 'bg-brand/20 text-brand border-brand/50 shadow-[0_0_10px_rgba(255,77,0,0.3)]'}`}
                title={muted ? "Microfone Desligado" : "Microfone Aberto"}
            >
                {muted ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
        )}
    </div>
  );
};

export default VoiceChat;
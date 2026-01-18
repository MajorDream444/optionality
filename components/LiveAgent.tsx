import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { VOICE_SYSTEM_INSTRUCTION } from '../constants';
import { Mic, MicOff, X, Radio, Loader2 } from 'lucide-react';
import { AppMode } from '../types';

interface Props {
  setMode: (m: AppMode) => void;
}

const LiveAgent: React.FC<Props> = ({ setMode }) => {
  const [active, setActive] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualizerData, setVisualizerData] = useState({ rms: 0, peaks: [0, 0, 0] });

  // Refs for audio context and resources
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const volumeRef = useRef(0);

  // Helper: Create PCM Blob
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    return {
      data: btoa(binary),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  // Helper: Decode Audio
  const decodeAudioData = async (
    base64: string,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const dataInt16 = new Int16Array(bytes.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  // Animation Loop for Visualizer
  const updateVisualizer = useCallback(() => {
    const currentRms = volumeRef.current;
    
    // Create organic-feeling variations for rings
    setVisualizerData({
      rms: currentRms,
      peaks: [
        currentRms * (0.8 + Math.random() * 0.4),
        Math.pow(currentRms, 0.8) * 1.2,
        Math.pow(currentRms, 1.2) * 0.9
      ]
    });
    
    // Decay volume slightly over time if no new data
    volumeRef.current *= 0.85;
    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, []);

  useEffect(() => {
    if (connected) {
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
      setVisualizerData({ rms: 0, peaks: [0, 0, 0] });
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [connected, updateVisualizer]);

  const startSession = async () => {
    try {
      setActive(true);
      setError(null);

      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const inputCtx = inputAudioContextRef.current;
      const outputCtx = outputAudioContextRef.current;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: VOICE_SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onopen: () => {
            setConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              volumeRef.current = Math.max(rms, volumeRef.current * 0.9); // Smooth decay

              const pcmBlob = createBlob(inputData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = outputAudioContextRef.current;
              if (!ctx) return;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(base64Audio, ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const src of sourcesRef.current) {
                try { src.stop(); } catch(e) {}
                sourcesRef.current.delete(src);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setConnected(false);
          },
          onerror: (e) => {
            console.error("Live API Error", e);
            setError("Connection disrupted.");
            stopSession();
          }
        }
      });
      
      sessionRef.current = { close: () => sessionPromise.then(s => s.close()) };

    } catch (err) {
      console.error(err);
      setError("Failed to initialize voice session.");
      setActive(false);
    }
  };

  const stopSession = useCallback(() => {
    setActive(false);
    setConnected(false);
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    volumeRef.current = 0;
  }, []);

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6 relative">
      <div className="absolute top-0 right-0">
        <button onClick={() => { stopSession(); setMode(AppMode.LANDING); }} className="p-3 text-zinc-500 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs tracking-widest uppercase mb-4">
          <Radio size={14} className={connected ? "animate-pulse" : ""} />
          Live Neural Interface
        </div>
        <h2 className="text-3xl font-light text-white mb-2">Voice Mode</h2>
        <p className="text-zinc-500">A calm, structural mirror.</p>
      </div>

      <div className="relative mb-16 flex items-center justify-center">
         {/* Dynamic Feedback Rings */}
         {connected && (
           <>
             <div 
               className="absolute w-56 h-56 rounded-full border border-emerald-500/20 transition-transform duration-75 ease-out opacity-40"
               style={{ transform: `scale(${1 + visualizerData.peaks[0] * 1.2})` }}
             />
             <div 
               className="absolute w-64 h-64 rounded-full border border-emerald-500/10 transition-transform duration-100 ease-out opacity-20"
               style={{ transform: `scale(${1 + visualizerData.peaks[1] * 1.5})` }}
             />
             <div 
               className="absolute w-48 h-48 rounded-full bg-emerald-500/5 blur-xl transition-all duration-75"
               style={{ transform: `scale(${1 + visualizerData.rms * 2})`, opacity: visualizerData.rms * 5 }}
             />
           </>
         )}

         <div 
           className="relative z-10 w-48 h-48 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center transition-all duration-100"
           style={{
             boxShadow: connected ? `0 0 ${visualizerData.rms * 100}px rgba(16, 185, 129, ${0.1 + visualizerData.rms})` : 'none',
             transform: connected ? `scale(${1 + visualizerData.rms * 0.3})` : 'scale(1)'
           }}
         >
           {!active ? (
             <button 
               onClick={startSession}
               className="w-full h-full rounded-full flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-all group"
             >
               <div className="p-4 rounded-full bg-zinc-800 group-hover:bg-emerald-500/10 transition-colors">
                <Mic size={32} />
               </div>
               <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Initialize</span>
             </button>
           ) : (
             <div className="flex flex-col items-center justify-center">
               {!connected ? (
                 <div className="space-y-4 text-center">
                    <Loader2 className="animate-spin text-zinc-600 mx-auto" size={32} />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Routing...</span>
                 </div>
               ) : (
                 <div className="space-y-2 text-center animate-fade-in">
                   <div className="relative">
                     <Mic size={32} className="text-emerald-500 mx-auto relative z-10" />
                     <div className="absolute inset-0 bg-emerald-500/20 blur-lg rounded-full animate-pulse" />
                   </div>
                   <div className="text-[10px] text-emerald-500 uppercase tracking-[0.2em] font-bold">Session Active</div>
                 </div>
               )}
             </div>
           )}
         </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        {active && connected && (
          <button 
            onClick={stopSession}
            className="group flex items-center gap-3 px-6 py-2 rounded-full border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/5 text-zinc-500 hover:text-red-400 transition-all"
          >
            <MicOff size={14} />
            <span className="text-xs uppercase tracking-widest font-medium">Terminate Session</span>
          </button>
        )}

        <div className="text-center max-w-xs space-y-4">
          <p className="text-[11px] text-zinc-600 leading-relaxed uppercase tracking-wider">
            Natural language interface enabled via Gemini 2.5 Flash. 
            Calm dialogue is encouraged.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-500/5 border border-red-500/20 text-red-400 text-xs rounded-lg animate-fade-in uppercase tracking-widest text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default LiveAgent;
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
  const [volume, setVolume] = useState(0); // For visualizer

  // Refs for audio context and resources
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const visualizerFrameRef = useRef<number>(0);

  // Helper: Create PCM Blob
  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    // Simple way to get raw bytes for sending
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const b64 = btoa(binary);

    return {
      data: b64,
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

  const startSession = async () => {
    try {
      setActive(true);
      setError(null);

      // 1. Audio Context Setup
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const inputCtx = inputAudioContextRef.current;
      const outputCtx = outputAudioContextRef.current;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // 2. Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // 3. Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 4. Connect Session
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
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
            
            // Start input processing
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (!sessionRef.current) return;
              
              const inputData = e.inputBuffer.getChannelData(0);
              // Calculate volume for visualizer
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i] * inputData[i];
              setVolume(Math.sqrt(sum / inputData.length));

              const pcmBlob = createBlob(inputData);
              
              // Use the resolved session promise to send data
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
              
              const audioBuffer = await decodeAudioData(
                base64Audio,
                ctx,
                24000,
                1
              );

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
                src.stop();
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
      
      // Store session promise wrapper if needed, but SDK handles the connection state mostly
      // Here we just ensure we can reference it if we need to call sendRealtimeInput
      // But we do that inside the callback using the promise variable itself.
      // We store the session object for cleanup if needed (though SDK has close method)
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
    setVolume(0);
  }, []);

  useEffect(() => {
    return () => stopSession();
  }, [stopSession]);


  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6 relative">
      <div className="absolute top-0 right-0">
        <button onClick={() => { stopSession(); setMode(AppMode.LANDING); }} className="p-3 text-zinc-500 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs tracking-widest uppercase mb-4">
          <Radio size={14} className={connected ? "animate-pulse" : ""} />
          Live Neural Interface
        </div>
        <h2 className="text-3xl font-light text-white mb-2">Voice Mode</h2>
        <p className="text-zinc-500">Have a calm, structure-focused conversation.</p>
      </div>

      <div className="relative mb-12 flex items-center justify-center">
         {/* Visualizer Ring */}
         <div 
           className="w-48 h-48 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center transition-all duration-75"
           style={{
             boxShadow: connected ? `0 0 ${volume * 500}px ${volume * 100}px rgba(16, 185, 129, 0.3)` : 'none',
             transform: connected ? `scale(${1 + volume * 0.5})` : 'scale(1)'
           }}
         >
           {!active ? (
             <button 
               onClick={startSession}
               className="w-full h-full rounded-full flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-all"
             >
               <Mic size={32} />
               <span className="text-xs uppercase tracking-widest">Connect</span>
             </button>
           ) : (
             <div className="flex flex-col items-center justify-center">
               {!connected ? (
                 <Loader2 className="animate-spin text-zinc-500" size={32} />
               ) : (
                 <div className="space-y-2 text-center">
                   <Mic size={32} className="text-emerald-500 mx-auto" />
                   <div className="text-xs text-emerald-500 uppercase tracking-widest">Listening</div>
                 </div>
               )}
             </div>
           )}
         </div>
      </div>

      {active && connected && (
        <button 
          onClick={stopSession}
          className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <MicOff size={16} />
          <span className="text-sm">End Session</span>
        </button>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
          {error}
        </div>
      )}

      <div className="mt-12 text-center max-w-sm mx-auto">
        <p className="text-xs text-zinc-600 leading-relaxed">
          The agent uses the Gemini Live API for real-time low-latency interaction. 
          Speak naturally. It is aware of the "Optionality" doctrine.
        </p>
      </div>
    </div>
  );
};

export default LiveAgent;
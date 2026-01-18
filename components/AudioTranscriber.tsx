import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { AppMode } from '../types';
import { ArrowLeft, Mic, Square, Loader2, Copy, Check, MessageSquareQuote } from 'lucide-react';

interface Props {
  setMode: (m: AppMode) => void;
}

const AudioTranscriber: React.FC<Props> = ({ setMode }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendToGemini(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscription('');
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for transcription.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendToGemini = async (blob: Blob) => {
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              inlineData: {
                mimeType: 'audio/webm',
                data: base64Data
              }
            },
            { text: "Transcribe the provided audio accurately. Return only the transcription text, nothing else." }
          ]
        });

        setTranscription(response.text || "No speech detected.");
        setLoading(false);
      };
    } catch (err) {
      console.error("Transcription error:", err);
      setTranscription("Error during transcription.");
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-12 animate-fade-in flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-12">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold">Neural Scribe</div>
      </div>

      <div className="text-center mb-12">
        <div className="p-4 bg-emerald-500/10 rounded-full inline-flex text-emerald-500 mb-6">
          <MessageSquareQuote size={32} />
        </div>
        <h2 className="text-3xl font-light text-white mb-2">Voice Transcription</h2>
        <p className="text-zinc-500 text-sm">Convert your thoughts into structural text using Gemini 3 Flash.</p>
      </div>

      <div className="w-full space-y-8">
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/30">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={loading}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                loading ? 'bg-zinc-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 hover:scale-110 shadow-lg shadow-emerald-500/20'
              }`}
            >
              {loading ? <Loader2 className="animate-spin text-zinc-400" size={32} /> : <Mic className="text-white" size={32} />}
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="w-24 h-24 rounded-full bg-red-500 flex items-center justify-center animate-pulse hover:scale-110 transition-transform"
            >
              <Square className="text-white fill-current" size={32} />
            </button>
          )}
          
          <div className="mt-6 text-center">
            <span className={`text-xs uppercase tracking-[0.2em] font-bold ${isRecording ? 'text-red-400' : 'text-zinc-500'}`}>
              {isRecording ? 'Listening...' : loading ? 'Transcribing...' : 'Tap to Start'}
            </span>
          </div>
        </div>

        {transcription && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 animate-fade-in">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Result</span>
              <button onClick={copyToClipboard} className="text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-zinc-200 text-lg font-light leading-relaxed italic">
              "{transcription}"
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-12 text-center text-[9px] text-zinc-700 uppercase tracking-[0.3em]">
        High-Fidelity Audio Processing Protocol • V1.0
      </div>
    </div>
  );
};

export default AudioTranscriber;
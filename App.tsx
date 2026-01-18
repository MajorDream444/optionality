import React, { useState } from 'react';
import { INITIAL_DECISION, AppMode } from './types';
import AssessmentEngine from './components/AssessmentEngine';
import ResultsDashboard from './components/ResultsDashboard';
import LiveAgent from './components/LiveAgent';
import ChatInterface from './components/ChatInterface';
import MapsScout from './components/MapsScout';
import VisionLab from './components/VisionLab';
import OptionPortfolio from './components/OptionPortfolio';
import DriveSync from './components/DriveSync';
import AudioTranscriber from './components/AudioTranscriber';
import { Activity, Mic, Shield, MessageSquare, Map, Image as ImageIcon, Briefcase, HardDrive, Type } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [answers, setAnswers] = useState(INITIAL_DECISION);

  return (
    <div className="min-h-screen text-zinc-200 selection:bg-emerald-500/30">
      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setMode(AppMode.LANDING)}>
          <Shield size={20} className="text-white" />
          <span className="font-bold tracking-tight text-white uppercase">Optionality OS</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-400 hidden sm:block uppercase tracking-widest">Protocol v1.0 • Neutral System</div>
      </header>

      <main className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-screen">
        {mode === AppMode.LANDING && (
          <div className="max-w-4xl text-center space-y-16 animate-fade-in">
            <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl font-light tracking-tighter text-white">
                Decision<br />Intelligence.
                </h1>
                <p className="text-xl text-zinc-500 font-light max-w-lg mx-auto leading-relaxed">
                A mathematical framework for asymmetric bets, reversibility, and future optionality.
                </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => { setAnswers(INITIAL_DECISION); setMode(AppMode.ASSESSMENT); }}
                className="group relative px-10 py-5 bg-zinc-100 text-zinc-950 font-bold rounded-full hover:bg-white transition-all w-full sm:w-auto overflow-hidden min-w-[240px] uppercase text-xs tracking-widest"
              >
                Start Decision Audit
              </button>

              <button
                onClick={() => setMode(AppMode.PORTFOLIO)}
                className="group px-10 py-5 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-300 font-bold rounded-full transition-all w-full sm:w-auto flex items-center justify-center gap-2 min-w-[240px] uppercase text-xs tracking-widest"
              >
                Option Portfolio
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-12 border-t border-zinc-900/50 max-w-4xl mx-auto">
                <button onClick={() => setMode(AppMode.CHAT)} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        <MessageSquare size={18} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white">Neural</div>
                </button>
                <button onClick={() => setMode(AppMode.MAPS)} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        <Map size={18} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white">Scout</div>
                </button>
                <button onClick={() => setMode(AppMode.VISION)} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        <ImageIcon size={18} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white">Vision</div>
                </button>
                <button onClick={() => setMode(AppMode.LIVE_VOICE)} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        <Mic size={18} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white">Voice</div>
                </button>
                <button onClick={() => setMode(AppMode.AUDIO_TRANSCRIBE)} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        <Type size={18} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white">Scribe</div>
                </button>
                <button onClick={() => setMode(AppMode.DRIVE_SYNC)} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group">
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-400 transition-colors">
                        <HardDrive size={18} />
                    </div>
                    <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-white">Vault</div>
                </button>
            </div>
          </div>
        )}

        {mode === AppMode.ASSESSMENT && (
          <div className="w-full">
             <AssessmentEngine 
               answers={answers} 
               setAnswers={setAnswers} 
               setMode={setMode} 
             />
          </div>
        )}

        {mode === AppMode.RESULTS && (
          <ResultsDashboard answers={answers} setMode={setMode} />
        )}

        {mode === AppMode.LIVE_VOICE && <LiveAgent setMode={setMode} />}
        {mode === AppMode.CHAT && <ChatInterface setMode={setMode} />}
        {mode === AppMode.MAPS && <MapsScout setMode={setMode} />}
        {mode === AppMode.VISION && <VisionLab setMode={setMode} />}
        {mode === AppMode.PORTFOLIO && <OptionPortfolio setMode={setMode} />}
        {mode === AppMode.DRIVE_SYNC && <DriveSync setMode={setMode} />}
        {mode === AppMode.AUDIO_TRANSCRIBE && <AudioTranscriber setMode={setMode} />}
      </main>

      <footer className="fixed bottom-4 w-full text-center pointer-events-none z-0">
        <p className="text-[9px] text-zinc-800 uppercase tracking-[0.4em] font-bold">
          Asymmetric Thinking Systems © 2024
        </p>
      </footer>
    </div>
  );
}
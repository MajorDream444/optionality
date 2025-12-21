import React, { useState } from 'react';
import { INITIAL_ANSWERS, AppMode } from './types';
import AssessmentEngine from './components/AssessmentEngine';
import ResultsDashboard from './components/ResultsDashboard';
import LiveAgent from './components/LiveAgent';
import ChatInterface from './components/ChatInterface';
import MapsScout from './components/MapsScout';
import VisionLab from './components/VisionLab';
import { Activity, Mic, Shield, MessageSquare, Map, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);

  return (
    <div className="min-h-screen text-zinc-200 selection:bg-emerald-500/30">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto cursor-pointer" onClick={() => setMode(AppMode.LANDING)}>
          <Shield size={20} className="text-white" />
          <span className="font-bold tracking-tight text-white">OPTIONALITY</span>
        </div>
        <div className="text-xs font-mono text-zinc-400 hidden sm:block">MVP v2.0 • BALI • GLOBAL</div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-screen">
        
        {mode === AppMode.LANDING && (
          <div className="max-w-4xl text-center space-y-12 animate-fade-in">
            <div className="space-y-6">
                <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
                Measure your<br />structural freedom.
                </h1>
                <p className="text-xl text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">
                Not advice. Not predictions. A mirror for your choices in an uncertain world.
                </p>
            </div>
            
            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setMode(AppMode.ASSESSMENT)}
                className="group relative px-8 py-4 bg-zinc-100 text-zinc-950 font-medium rounded-lg hover:bg-white transition-all w-full sm:w-auto overflow-hidden min-w-[200px]"
              >
                <div className="absolute inset-0 bg-emerald-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <Activity size={18} />
                  Start Assessment
                </span>
              </button>

              <button
                onClick={() => setMode(AppMode.LIVE_VOICE)}
                className="group px-8 py-4 border border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900 text-zinc-300 font-medium rounded-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2 min-w-[200px]"
              >
                <Mic size={18} />
                Talk to Agent
              </button>
            </div>

            {/* Secondary Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-zinc-900/50 max-w-2xl mx-auto">
                <button 
                    onClick={() => setMode(AppMode.CHAT)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
                >
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                        <MessageSquare size={20} />
                    </div>
                    <div className="text-sm font-medium text-zinc-400 group-hover:text-white">Deep Dive Chat</div>
                </button>

                 <button 
                    onClick={() => setMode(AppMode.MAPS)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
                >
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                        <Map size={20} />
                    </div>
                    <div className="text-sm font-medium text-zinc-400 group-hover:text-white">Map Scout</div>
                </button>

                 <button 
                    onClick={() => setMode(AppMode.VISION)}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-zinc-900/30 border border-zinc-800/50 hover:bg-zinc-900 hover:border-zinc-700 transition-all group"
                >
                    <div className="p-3 rounded-full bg-zinc-800/50 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                        <ImageIcon size={20} />
                    </div>
                    <div className="text-sm font-medium text-zinc-400 group-hover:text-white">Vision Lab</div>
                </button>
            </div>
          </div>
        )}

        {mode === AppMode.ASSESSMENT && (
          <div className="w-full animate-fade-in">
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

        {mode === AppMode.LIVE_VOICE && (
          <div className="w-full animate-fade-in">
            <LiveAgent setMode={setMode} />
          </div>
        )}

        {mode === AppMode.CHAT && (
           <ChatInterface setMode={setMode} />
        )}

        {mode === AppMode.MAPS && (
            <MapsScout setMode={setMode} />
        )}

        {mode === AppMode.VISION && (
            <VisionLab setMode={setMode} />
        )}

      </main>

      {/* Footer Disclaimer */}
      <footer className="fixed bottom-4 w-full text-center pointer-events-none z-0">
        <p className="text-[10px] text-zinc-800 uppercase tracking-widest">
          Sovereign Thinking Systems © 2024
        </p>
      </footer>
    </div>
  );
}
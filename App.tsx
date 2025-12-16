import React, { useState } from 'react';
import { INITIAL_ANSWERS, AppMode } from './types';
import AssessmentEngine from './components/AssessmentEngine';
import ResultsDashboard from './components/ResultsDashboard';
import LiveAgent from './components/LiveAgent';
import { Activity, Mic, Shield } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.LANDING);
  const [answers, setAnswers] = useState(INITIAL_ANSWERS);

  return (
    <div className="min-h-screen text-zinc-200 selection:bg-emerald-500/30">
      {/* Header / Nav */}
      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50 mix-blend-difference pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Shield size={20} className="text-white" />
          <span className="font-bold tracking-tight text-white">OPTIONALITY</span>
        </div>
        <div className="text-xs font-mono text-zinc-400 hidden sm:block">MVP v1.0 • BALI • GLOBAL</div>
      </header>

      {/* Main Content Area */}
      <main className="pt-24 pb-12 px-4 flex flex-col items-center justify-center min-h-screen">
        
        {mode === AppMode.LANDING && (
          <div className="max-w-2xl text-center space-y-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-light tracking-tighter text-white">
              Measure your<br />structural freedom.
            </h1>
            <p className="text-xl text-zinc-400 font-light max-w-lg mx-auto leading-relaxed">
              Not advice. Not predictions. A mirror for your choices in an uncertain world.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setMode(AppMode.ASSESSMENT)}
                className="group relative px-8 py-4 bg-zinc-100 text-zinc-950 font-medium rounded-lg hover:bg-white transition-all w-full sm:w-auto overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-400/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  <Activity size={18} />
                  Start Assessment
                </span>
              </button>

              <button
                onClick={() => setMode(AppMode.LIVE_VOICE)}
                className="group px-8 py-4 border border-zinc-800 hover:border-zinc-600 text-zinc-300 font-medium rounded-lg transition-all w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Mic size={18} />
                Talk to Agent
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
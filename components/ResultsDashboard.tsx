
import React, { useMemo } from 'react';
import { DecisionAnswers, AppMode, DecisionResult, PillarScores } from '../types';
import { OPTIONALITY_OS_CONFIG } from '../constants';
import { Zap, ShieldCheck, Download, ArrowLeft, RefreshCw, BarChart3, Target } from 'lucide-react';

interface Props {
  answers: DecisionAnswers;
  setMode: (m: AppMode) => void;
}

const ResultsDashboard: React.FC<Props> = ({ answers, setMode }) => {
  const result: DecisionResult = useMemo(() => {
    const maps = OPTIONALITY_OS_CONFIG.mapping;
    
    const G = (maps.gain as any)[answers.upside] || 0;
    const E = (maps.effort as any)[answers.effort] || 1;
    const R = (maps.reversibility as any)[answers.reversibility] || 1;
    const TP = (maps.time_penalty as any)[answers.time_to_signal] || 1;
    
    let multiplierSum = answers.multipliers.reduce((acc, m) => acc + ((maps.multipliers as any)[m] || 0), 0);
    const M = Math.min(10, multiplierSum);

    // GEM and Effective Optionality
    const gem_score = (G * M) / E;
    const effective_optionality = (G * M * R * TP) / E;

    // Pillar Scores (Mock logic mapping for v1 alignment)
    const pillars: PillarScores = {
      geography: R * (answers.mobilityLevel === 'High' ? 1.2 : 1),
      income: G * (M / 2),
      capabilities: answers.multipliers.length * 2,
      network: answers.multipliers.includes('New relationships') ? 8 : 4,
      assets: (G * R) / 2
    };

    // Sheet Tier Logic
    // Based on sum of pillars (max potential ~50)
    const totalPillarSum = pillars.geography + pillars.income + pillars.capabilities + pillars.network + pillars.assets;
    let tier = "E — Fragile";
    if (totalPillarSum >= 85) tier = "A — Sovereign"; // Note: scaling depends on normalized weights
    else if (totalPillarSum >= 45) tier = "B — Strong";
    else if (totalPillarSum >= 30) tier = "C — Developing";
    else if (totalPillarSum >= 15) tier = "D — Exposed";

    // Client ID Generation Formula: First Initial + YYMMDD + "-" + Last 4 of Email/ID
    const date = new Date();
    const dateStr = date.toISOString().slice(2,10).replace(/-/g,'');
    const emailSuffix = answers.email ? answers.email.slice(-4).replace(/[^0-9]/g, '1') : Math.floor(1000 + Math.random() * 9000);
    const clientId = `${(answers.firstName[0] || 'X').toUpperCase()}${dateStr}-${emailSuffix}`;

    // Classification
    let classification = "Neutral";
    if (effective_optionality >= 12 && R >= 6 && E <= 5) classification = "High Optionality";
    else if (E >= 7 && (M <= 3 || R <= 3)) classification = "Optimization Trap";

    // Recommendation
    let recommendation = "Proceed small";
    if (classification === "High Optionality") recommendation = "Double down carefully";
    else if (classification === "Optimization Trap") recommendation = "Kill or shrink";

    return {
      clientId,
      idea: answers.idea_description,
      scores: {
        gain: G,
        effort: E,
        multiplier: M,
        reversibility: R,
        time_penalty: TP,
        gem_score,
        effective_optionality,
        pillars
      },
      classification,
      tier,
      warnings: [], // Filtered in real use
      recommendation
    };
  }, [answers]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
        <div>
          <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4">
            <ArrowLeft size={16} /> Exit to OS
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-light text-white tracking-tight">{result.tier}</h1>
            <div className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-400 font-mono uppercase tracking-widest">
              ID: {result.clientId}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold border ${
             result.classification === 'High Optionality' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' :
             result.classification === 'Optimization Trap' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
             'bg-zinc-800 border-zinc-700 text-zinc-400'
           }`}>
             {result.classification}
           </div>
           <button className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400">
             <Download size={18} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Metrics */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Target size={100} />
              </div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-2">Effective Optionality</div>
              <div className="text-7xl font-light text-white tracking-tighter mb-4">{result.scores.effective_optionality.toFixed(1)}</div>
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest">GEM: {result.scores.gem_score.toFixed(1)}</div>
           </div>

           <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6">
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                <BarChart3 size={12} /> Pillar Analysis
              </h3>
              <div className="space-y-4">
                {Object.entries(result.scores.pillars).map(([key, val]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[9px] uppercase tracking-widest text-zinc-400 mb-1">
                      <span>{key}</span>
                      <span>{val.toFixed(0)}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500/40" style={{ width: `${Math.min(100, (val / 15) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>

        {/* Narrative & Recommendation */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Proposed Action Profile</div>
              <h2 className="text-2xl font-light text-white leading-relaxed mb-6">
                "{result.idea}"
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-500 uppercase mb-1">Gain</div>
                    <div className="text-xl text-white">{result.scores.gain}</div>
                 </div>
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-500 uppercase mb-1">Effort</div>
                    <div className="text-xl text-white">{result.scores.effort}</div>
                 </div>
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-500 uppercase mb-1">Rev</div>
                    <div className="text-xl text-white">{result.scores.reversibility}</div>
                 </div>
                 <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <div className="text-[8px] text-zinc-500 uppercase mb-1">TP</div>
                    <div className="text-xl text-white">{result.scores.time_penalty}</div>
                 </div>
              </div>
           </div>

           <div className="bg-emerald-500 text-zinc-950 p-10 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <ShieldCheck size={18} />
                   <span className="text-[10px] uppercase tracking-widest font-bold">Protocol Instruction</span>
                </div>
                <p className="text-4xl font-light tracking-tight">{result.recommendation}</p>
              </div>
              <button 
                onClick={() => setMode(AppMode.ASSESSMENT)}
                className="px-6 py-3 bg-zinc-950 text-white rounded-full text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw size={14} /> Re-Sync Logic
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;

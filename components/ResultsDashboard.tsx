import React, { useMemo } from 'react';
import { AssessmentAnswers, AppMode, ReversibleMove } from '../types';
import { SCORING_WEIGHTS } from '../constants';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  answers: AssessmentAnswers;
  setMode: (m: AppMode) => void;
}

const ResultsDashboard: React.FC<Props> = ({ answers, setMode }) => {
  const results = useMemo(() => {
    // Score Calculation Engine
    let incomeScore = Math.min(100, (answers.income_sources / 3) * 100);
    if (answers.income_concentration > 80) incomeScore -= 20;

    const currencyScore = Math.min(100, (answers.currency_count / 3) * 100);
    
    // Simple heuristic for demo
    const timeScore = Math.min(100, (answers.time_buffer / 12) * 100);
    
    let leverageScore = 100;
    if (answers.leverage_debt) leverageScore -= 30;
    if (answers.leverage_guarantees) leverageScore -= 20;

    let reversibilityScore = 50;
    if (answers.commitment_reversibility === 'High') reversibilityScore = 100;
    if (answers.commitment_reversibility === 'Low') reversibilityScore = 20;

    const total = 
      (incomeScore * SCORING_WEIGHTS.income_diversity) +
      (currencyScore * SCORING_WEIGHTS.currency_diversity) +
      (timeScore * SCORING_WEIGHTS.time_buffer) +
      (leverageScore * SCORING_WEIGHTS.leverage_exposure) +
      (reversibilityScore * SCORING_WEIGHTS.jurisdictional_flexibility); // Using reversibility as proxy for flexibility in MVP

    // Path Generation (Rule Based for MVP)
    const moves: ReversibleMove[] = [];

    // Income Concentration: Diversification
    if (answers.income_concentration > 70) {
      moves.push({ 
        area: "Income", 
        option: "Experiment: Research and outline one new service offering that leverages your existing skills but targets a different industry.", 
        reversibility: "High", 
        risk: "None" 
      });
      moves.push({ 
        area: "Income", 
        option: "Action: Propose a 3-month retainer model to your largest client to smooth volatility.", 
        reversibility: "Medium", 
        risk: "Low" 
      });
    } else if (answers.income_concentration > 50) {
      moves.push({ 
        area: "Income", 
        option: "Experiment: Pitch a micro-project to a completely new client type to test demand without quitting your main source.", 
        reversibility: "High", 
        risk: "Low" 
      });
      moves.push({ 
        area: "Income", 
        option: "Action: Propose a 3-month retainer model to your largest client to smooth volatility.", 
        reversibility: "Medium", 
        risk: "Low" 
      });
    }

    // Currency: Diversification
    if (answers.currency_count < 2) {
      moves.push({ 
        area: "Currency", 
        option: "Setup: Open a borderless account (e.g., Wise) and hold $100 in a secondary stable currency.", 
        reversibility: "High", 
        risk: "Low" 
      });
    }

    // Time Buffer: Emergency Fund / Runway
    if (answers.time_buffer < 3) {
      moves.push({ 
        area: "Time / Cash", 
        option: "Experiment: Auto-sweep 5% of every deposit into a separate 'Freedom Fund' for 30 days.", 
        reversibility: "High", 
        risk: "None" 
      });
      moves.push({ 
        area: "Time / Cash", 
        option: "Audit: Review last 90 days of spending. Identify 2 recurring costs to pause for 1 month.", 
        reversibility: "High", 
        risk: "None" 
      });
    }

    // Leverage
    if (answers.leverage_debt) {
       moves.push({
         area: "Leverage",
         option: "Pause: Commit to zero new consumer debt for 30 days to observe impact on stress.",
         reversibility: "High",
         risk: "None"
       });
    }

    return {
      total: Math.round(total),
      chartData: [
        { subject: 'Income', A: incomeScore, fullMark: 100 },
        { subject: 'Currency', A: currencyScore, fullMark: 100 },
        { subject: 'Time', A: timeScore, fullMark: 100 },
        { subject: 'Leverage', A: leverageScore, fullMark: 100 },
        { subject: 'Flex', A: reversibilityScore, fullMark: 100 },
      ],
      moves
    };
  }, [answers]);

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="text-zinc-500 uppercase tracking-widest text-xs">Optionality Snapshot</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        {/* Left Col: The Score & Visual */}
        <div className="flex flex-col items-center">
          <div className="relative w-full aspect-square max-w-md">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={results.chartData}>
                <PolarGrid stroke="#3f3f46" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Optionality"
                  dataKey="A"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="#10b981"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-6xl font-light text-white tracking-tighter">{results.total}</div>
              <div className="text-xs uppercase tracking-widest text-emerald-500 mt-1">Score</div>
            </div>
          </div>
        </div>

        {/* Right Col: The Narrative & Paths */}
        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-light text-white mb-2">Structure Analysis</h3>
            <p className="text-zinc-400 leading-relaxed">
              Your optionality score reflects {results.total > 70 ? 'strong structural freedom' : 'some structural fragility'}. 
              {results.total > 70 
                ? ' You have built significant buffers, but maintain vigilance against complacency.'
                : ' Dependency on specific systems limits your maneuvering room during volatility.'}
              This is not a judgment, but a baseline.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <RefreshCw size={18} className="text-emerald-500" />
              Reversible Moves
            </h3>
            <div className="space-y-4">
              {results.moves.map((move, idx) => (
                <div key={idx} className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{move.area}</span>
                    <span className="text-xs text-zinc-600 border border-zinc-800 px-2 py-0.5 rounded-full">{move.reversibility} Reversibility</span>
                  </div>
                  <p className="text-zinc-200">{move.option}</p>
                </div>
              ))}
              {results.moves.length === 0 && (
                <div className="text-zinc-500 italic">No immediate structural weaknesses detected. Focus on capital preservation.</div>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800">
            <p className="text-xs text-zinc-600 leading-relaxed">
              DISCLAIMER: This system provides an informational framework for decision-making. 
              It is not financial, legal, or tax advice. Do not take irreversible actions based solely on this output.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDashboard;
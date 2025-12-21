import React, { useMemo } from 'react';
import { AssessmentAnswers, AppMode, ReversibleMove } from '../types';
import { SCORING_WEIGHTS } from '../constants';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { RefreshCw, ArrowLeft, Download } from 'lucide-react';

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
    
    // Time Score: 12 months buffer = 100 score
    const timeScore = Math.min(100, (answers.time_buffer / 12) * 100);
    
    let leverageScore = 100;
    if (answers.leverage_debt) leverageScore -= 30;
    if (answers.leverage_guarantees) leverageScore -= 20;

    // Reversibility Logic: The "Exit Door" Metric
    let reversibilityScore = 50; // Medium
    if (answers.commitment_reversibility === 'High') reversibilityScore = 100;
    if (answers.commitment_reversibility === 'Low') reversibilityScore = 0;

    let total = 
      (incomeScore * SCORING_WEIGHTS.income_diversity) +
      (currencyScore * SCORING_WEIGHTS.currency_diversity) +
      (timeScore * SCORING_WEIGHTS.time_buffer) +
      (leverageScore * SCORING_WEIGHTS.leverage_exposure) +
      (reversibilityScore * SCORING_WEIGHTS.jurisdictional_flexibility);

    // Structural Multipliers
    if (answers.commitment_reversibility === 'Low') {
      total -= 15; // Structural Drag Penalty
    }
    if (answers.commitment_reversibility === 'High') {
      total += 10; // Agility Bonus
    }

    total = Math.max(0, Math.min(100, Math.round(total)));

    const moves: ReversibleMove[] = [];

    // Income Concentration Logic
    if (answers.income_concentration > 70) {
      moves.push({ 
        area: "Income", 
        option: "Experiment: Research and outline one new service offering that leverages your existing skills but targets a different industry.", 
        reversibility: "High", 
        risk: "None" 
      });
    }

    // Currency Diversity Logic
    if (answers.currency_count < 2) {
      moves.push({ 
        area: "Currency", 
        option: "Setup: Open a borderless account (e.g., Wise) and hold $100 in a secondary stable currency.", 
        reversibility: "High", 
        risk: "Low" 
      });
    }

    // Time Buffer Logic (< 3 months)
    if (answers.time_buffer < 3) {
      moves.push({ 
        area: "Time / Cash", 
        option: 'Experiment: Auto-sweep 5% of every deposit into a separate "Freedom Fund" for 30 days.', 
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

    // Leverage Debt Logic
    if (answers.leverage_debt) {
       moves.push({
         area: "Leverage",
         option: "Pause: Commit to zero new consumer debt for 30 days to observe impact on stress.",
         reversibility: "High",
         risk: "None"
       });
    }

    const narrative = results?.total > 70 
      ? "Your optionality score reflects strong structural freedom. You have built significant buffers, but maintain vigilance against complacency."
      : "Your optionality score reflects some structural fragility. Dependency on specific systems limits your maneuvering room during volatility.";

    return {
      total,
      narrative,
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

  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(['Optionality Assessment Results']);
    csvRows.push(['Generated', new Date().toLocaleString()]);
    csvRows.push(['']);

    csvRows.push(['--- Raw Data ---']);
    csvRows.push(['Metric', 'Value']);
    Object.entries(answers).forEach(([key, value]) => {
      csvRows.push([key, value]);
    });
    csvRows.push(['']);

    csvRows.push(['--- Analysis ---']);
    csvRows.push(['Overall Score', results.total]);
    csvRows.push(['Analysis Summary', `"${results.narrative}"`]);
    csvRows.push(['']);
    csvRows.push(['Area', 'Score (0-100)']);
    results.chartData.forEach(item => {
      csvRows.push([item.subject, Math.round(item.A)]);
    });
    csvRows.push(['']);

    csvRows.push(['--- Recommended Reversible Moves ---']);
    csvRows.push(['Area', 'Option', 'Reversibility', 'Risk']);
    results.moves.forEach(move => {
      csvRows.push([move.area, `"${move.option}"`, move.reversibility, move.risk]);
    });

    const csvContent = csvRows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `optionality_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-6">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors text-xs uppercase tracking-widest"
          >
            <Download size={14} />
            Export CSV
          </button>
          <div className="text-zinc-500 uppercase tracking-widest text-xs hidden sm:block">Optionality Snapshot</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
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

        <div className="space-y-10">
          <div>
            <h3 className="text-xl font-light text-white mb-2">Structure Analysis</h3>
            <p className="text-zinc-400 leading-relaxed">
              {results.narrative} This is not a judgment, but a baseline.
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
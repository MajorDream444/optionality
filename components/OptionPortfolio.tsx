import React, { useState, useMemo, useEffect } from 'react';
import { PortfolioOption, AppMode, OptionCategory, OptionStatus } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Plus, Trash2, Zap, AlertTriangle, TrendingUp, Sparkles, Lightbulb, Cloud, Loader2, Info } from 'lucide-react';

interface Props {
  setMode: (m: AppMode) => void;
}

const OptionPortfolio: React.FC<Props> = ({ setMode }) => {
  const [options, setOptions] = useState<PortfolioOption[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);
  const [newOpt, setNewOpt] = useState<Partial<PortfolioOption>>({
    title: '',
    description: '',
    gainPotential: 5,
    effortCost: 5,
    multiplierEffect: 1,
    reversibility: 5,
    category: 'project'
  });

  useEffect(() => {
    const saved = localStorage.getItem('opt_portfolio');
    const synced = localStorage.getItem('drive_synced') === 'true';
    if (saved) setOptions(JSON.parse(saved));
    setIsSynced(synced);
    setLoading(false);
  }, []);

  const getGemScore = (o: Partial<PortfolioOption>) => {
    const g = o.gainPotential || 0;
    const m = o.multiplierEffect || 0;
    const e = o.effortCost || 1;
    return (g * m) / e;
  };

  const evaluateOption = (o: PortfolioOption) => {
    const gem = getGemScore(o);
    const warnings: string[] = [];
    let classification = "Neutral";

    if (gem >= 8 && o.reversibility >= 7) classification = "High Optionality";
    if (o.effortCost >= 7 && o.reversibility <= 3) {
      classification = "Optimization Trap";
      warnings.push("High effort with low reversibility");
    }
    if (o.multiplierEffect <= 3) warnings.push("Low future optionality multiplier");
    if (o.effortCost >= 8 && o.gainPotential <= 4) warnings.push("Effort outweighs upside");

    return { gem: gem.toFixed(2), classification, warnings };
  };

  const decayFactor = (lastReviewed: number) => {
    const days = (Date.now() - lastReviewed) / (1000 * 60 * 60 * 24);
    return Math.max(0.5, 1 - days / 90);
  };

  const portfolioScore = useMemo(() => {
    return options
      .filter(o => o.status === 'active')
      .reduce((sum, o) => {
        const gem = getGemScore(o);
        return sum + (gem * o.reversibility * decayFactor(o.lastReviewedAt));
      }, 0)
      .toFixed(1);
  }, [options]);

  const handleAdd = () => {
    if (!newOpt.title) return;
    const newOption: PortfolioOption = {
      id: crypto.randomUUID(),
      title: newOpt.title,
      description: newOpt.description || '',
      gainPotential: newOpt.gainPotential || 5,
      effortCost: newOpt.effortCost || 5,
      multiplierEffect: newOpt.multiplierEffect || 1,
      reversibility: newOpt.reversibility || 5,
      category: (newOpt.category as OptionCategory) || 'project',
      status: 'active' as OptionStatus,
      createdAt: Date.now(),
      lastReviewedAt: Date.now()
    };

    const updatedOptions = [newOption, ...options];
    setOptions(updatedOptions);
    localStorage.setItem('opt_portfolio', JSON.stringify(updatedOptions));
    
    setShowAdd(false);
    setNewOpt({ title: '', description: '', gainPotential: 5, effortCost: 5, multiplierEffect: 1, reversibility: 5, category: 'project' });
  };

  const killOption = (id: string) => {
    const updated = options.map(o => o.id === id ? { ...o, status: 'killed' as OptionStatus, lastReviewedAt: Date.now() } : o);
    setOptions(updated);
    localStorage.setItem('opt_portfolio', JSON.stringify(updated));
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 animate-fade-in">
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setMode(AppMode.LANDING)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1 justify-end">
              {isSynced ? <Cloud size={10} className="text-emerald-500" /> : <Info size={10} />}
              {isSynced ? 'Synced to Drive' : 'Local Only'}
            </div>
            <div className="text-2xl font-light text-emerald-400">{portfolioScore}</div>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 h-[400px]">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={18} className="text-emerald-500" />
              <h3 className="text-sm font-medium uppercase tracking-widest text-zinc-400">GEM Heatmap</h3>
            </div>
            <ResponsiveContainer width="100%" height="85%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <XAxis type="number" dataKey="effortCost" name="Effort" domain={[0, 10]} stroke="#52525b" tick={{fontSize: 10}} />
                <YAxis type="number" dataKey="upside" name="Upside" domain={[0, 100]} stroke="#52525b" tick={{fontSize: 10}} />
                <ZAxis type="number" dataKey="reversibility" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Options" data={options.filter(o => o.status === 'active').map(o => ({ ...o, upside: o.gainPotential * o.multiplierEffect }))}>
                  {options.filter(o => o.status === 'active').map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getGemScore(entry) > 7 ? '#10b981' : '#3f3f46'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
          {options.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-12 text-zinc-600 text-center">
              <TrendingUp size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Portfolio empty.</p>
            </div>
          )}
          {options.map(o => {
            const evalResult = evaluateOption(o);
            return (
              <div key={o.id} className={`p-4 rounded-xl border transition-all ${o.status === 'killed' ? 'bg-zinc-950 opacity-40 border-zinc-900' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {o.category}
                  </span>
                  {o.status === 'active' && (
                    <button onClick={() => killOption(o.id)} className="text-zinc-600 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <h4 className="text-zinc-100 font-medium mb-1">{o.title}</h4>
                <p className="text-zinc-500 text-[11px] mb-3 leading-tight line-clamp-2">{o.description}</p>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-800/50">
                  <div>
                    <div className="text-[8px] uppercase text-zinc-500">GEM</div>
                    <div className="text-sm text-white font-mono">{evalResult.gem}</div>
                  </div>
                  <div>
                    <div className="text-[8px] uppercase text-zinc-500">Rev</div>
                    <div className="text-sm text-white font-mono">{o.reversibility}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-8 space-y-6 shadow-2xl">
            <h3 className="text-xl font-light text-white">Map New Option</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Title</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none"
                  value={newOpt.title}
                  onChange={e => setNewOpt({...newOpt, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Description</label>
                <textarea 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white outline-none"
                  value={newOpt.description}
                  onChange={e => setNewOpt({...newOpt, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Upside (1-10)</label>
                  <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" value={newOpt.gainPotential} onChange={e => setNewOpt({...newOpt, gainPotential: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Effort (1-10)</label>
                  <input type="number" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white" value={newOpt.effortCost} onChange={e => setNewOpt({...newOpt, effortCost: Number(e.target.value)})} />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-3 text-zinc-500">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-3 bg-emerald-600 text-white rounded-lg">Map Option</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionPortfolio;
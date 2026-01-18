
import React, { useState } from 'react';
import { DecisionAnswers, AppMode, LifeMode, PrimaryRole, MobilityLevel, RiskPosture } from '../types';
import { OS_QUIZ_QUESTIONS } from '../constants';
import { ArrowRight, Check, Plus, Minus, User, Globe, Activity } from 'lucide-react';

interface Props {
  answers: DecisionAnswers;
  setAnswers: (a: DecisionAnswers) => void;
  setMode: (m: AppMode) => void;
}

const AssessmentEngine: React.FC<Props> = ({ answers, setAnswers, setMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Steps: 0 = Name/Email, 1 = Life Context, 2+ = Quiz Questions
  const identitySteps = 2; 
  const totalSteps = identitySteps + OS_QUIZ_QUESTIONS.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setMode(AppMode.RESULTS);
    }
  };

  const toggleMulti = (opt: string) => {
    const current = [...answers.multipliers];
    if (current.includes(opt)) {
      setAnswers({ ...answers, multipliers: current.filter(i => i !== opt) });
    } else {
      setAnswers({ ...answers, multipliers: [...current, opt] });
    }
  };

  const renderIdentityStep = () => {
    if (currentStep === 0) {
      return (
        <div className="w-full space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <User className="mx-auto text-emerald-500 mb-4" size={32} />
            <h2 className="text-2xl font-light text-white">Identity & Context</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">First Name</label>
              <input 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white" 
                value={answers.firstName} 
                onChange={e => setAnswers({...answers, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">Last Initial</label>
              <input 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white" 
                maxLength={1}
                value={answers.lastInitial} 
                onChange={e => setAnswers({...answers, lastInitial: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase text-zinc-500">Email (Optional)</label>
            <input 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white" 
              value={answers.email} 
              onChange={e => setAnswers({...answers, email: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">Country Base</label>
              <input 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white" 
                value={answers.country} 
                onChange={e => setAnswers({...answers, country: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">City Base</label>
              <input 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-white" 
                value={answers.city} 
                onChange={e => setAnswers({...answers, city: e.target.value})}
              />
            </div>
          </div>
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="w-full space-y-6 animate-fade-in">
          <div className="text-center mb-8">
            <Globe className="mx-auto text-emerald-500 mb-4" size={32} />
            <h2 className="text-2xl font-light text-white">Life Posture</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">Life Mode</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
                value={answers.lifeMode}
                onChange={e => setAnswers({...answers, lifeMode: e.target.value as LifeMode})}
              >
                <option value="Building">Building</option>
                <option value="Transitioning">Transitioning</option>
                <option value="Stabilizing">Stabilizing</option>
                <option value="Resetting">Resetting</option>
                <option value="Exploring">Exploring</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">Primary Role</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
                value={answers.primaryRole1}
                onChange={e => setAnswers({...answers, primaryRole1: e.target.value as PrimaryRole})}
              >
                <option value="Founder/Operator">Founder/Operator</option>
                <option value="Investor">Investor</option>
                <option value="Creative">Creative</option>
                <option value="Executive">Executive</option>
                <option value="Family Anchor">Family Anchor</option>
                <option value="Nomad">Nomad</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">Mobility</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
                value={answers.mobilityLevel}
                onChange={e => setAnswers({...answers, mobilityLevel: e.target.value as MobilityLevel})}
              >
                <option value="Low">Low Mobility</option>
                <option value="Medium">Medium Mobility</option>
                <option value="High">High Mobility</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase text-zinc-500">Risk Posture</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-white"
                value={answers.riskPosture}
                onChange={e => setAnswers({...answers, riskPosture: e.target.value as RiskPosture})}
              >
                <option value="Conservative">Conservative</option>
                <option value="Balanced">Balanced</option>
                <option value="Asymmetric">Asymmetric</option>
              </select>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderQuizStep = () => {
    const qIndex = currentStep - identitySteps;
    const currentQ = OS_QUIZ_QUESTIONS[qIndex];
    if (!currentQ) return null;

    return (
      <div className="w-full animate-fade-in">
        <h2 className="text-2xl md:text-3xl font-light text-zinc-100 leading-tight text-center mb-10">
          {currentQ.label}
        </h2>
        {currentQ.type === 'text' && (
          <textarea
            value={answers.idea_description}
            onChange={(e) => setAnswers({ ...answers, idea_description: e.target.value })}
            placeholder="e.g. Relocating headquarters to a tax-neutral zone..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-xl text-white focus:border-emerald-500 outline-none transition-all h-40 resize-none font-light"
            autoFocus
          />
        )}
        {currentQ.type === 'single_choice' && (
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => { setAnswers({ ...answers, [currentQ.id]: opt }); handleNext(); }}
                className={`w-full py-5 px-6 rounded-xl border text-left transition-all flex justify-between items-center group ${
                  (answers as any)[currentQ.id] === opt
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-800 hover:border-zinc-600 text-zinc-400 bg-zinc-900/30'
                }`}
              >
                <span className="text-sm md:text-base font-light">{opt}</span>
                <div className={`w-2 h-2 rounded-full transition-all ${(answers as any)[currentQ.id] === opt ? 'bg-emerald-500 scale-125' : 'bg-zinc-800'}`} />
              </button>
            ))}
          </div>
        )}
        {currentQ.type === 'multi_choice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentQ.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => toggleMulti(opt)}
                className={`py-4 px-5 rounded-xl border text-left transition-all flex justify-between items-center ${
                  answers.multipliers.includes(opt)
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-800 hover:border-zinc-700 text-zinc-500 bg-zinc-900/30'
                }`}
              >
                <span className="text-xs md:text-sm font-light">{opt}</span>
                {answers.multipliers.includes(opt) ? <Minus size={14} /> : <Plus size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto px-6 py-12">
      <div className="w-full mb-12">
        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-700 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-3">
          <p className="text-zinc-600 text-[10px] uppercase tracking-widest">Optionality OS 1.0</p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Step {currentStep + 1} / {totalSteps}</p>
        </div>
      </div>

      <div className="w-full mb-16">
        {currentStep < identitySteps ? renderIdentityStep() : renderQuizStep()}
      </div>

      <div className="flex gap-6 items-center">
        {currentStep > 0 && (
          <button 
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="text-zinc-600 hover:text-zinc-400 text-xs uppercase tracking-widest transition-colors"
          >
            Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="group flex items-center gap-3 bg-zinc-100 hover:bg-white text-zinc-950 px-8 py-4 rounded-full transition-all disabled:opacity-30"
        >
          <span className="uppercase tracking-[0.2em] text-xs font-bold">
            {currentStep === totalSteps - 1 ? 'Analyze Decision' : 'Continue'}
          </span>
          {currentStep === totalSteps - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  );
};

export default AssessmentEngine;

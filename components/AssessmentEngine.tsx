import React, { useState } from 'react';
import { AssessmentAnswers, AppMode } from '../types';
import { ASSESSMENT_QUESTIONS } from '../constants';
import { ArrowRight, Check } from 'lucide-react';

interface Props {
  answers: AssessmentAnswers;
  setAnswers: (a: AssessmentAnswers) => void;
  setMode: (m: AppMode) => void;
}

const AssessmentEngine: React.FC<Props> = ({ answers, setAnswers, setMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setMode(AppMode.RESULTS);
    }
  };

  const handleChange = (val: any) => {
    const q = ASSESSMENT_QUESTIONS[currentStep];
    setAnswers({ ...answers, [q.id]: val });
  };

  const currentQ = ASSESSMENT_QUESTIONS[currentStep];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto px-6">
      <div className="w-full mb-8">
        <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep + 1) / ASSESSMENT_QUESTIONS.length) * 100}%` }}
          />
        </div>
        <p className="text-zinc-500 text-xs mt-2 uppercase tracking-widest">
          Signal {currentStep + 1} of {ASSESSMENT_QUESTIONS.length}
        </p>
      </div>

      <h2 className="text-2xl md:text-3xl font-light text-zinc-100 text-center mb-12 leading-relaxed">
        {currentQ.text}
      </h2>

      <div className="w-full max-w-md mb-12">
        {currentQ.type === 'number' && (
          <input
            type="number"
            min={currentQ.min}
            max={currentQ.max}
            value={(answers as any)[currentQ.id]}
            onChange={(e) => handleChange(Number(e.target.value))}
            className="w-full bg-transparent border-b-2 border-zinc-700 text-4xl text-center py-4 text-emerald-400 focus:border-emerald-500 outline-none transition-colors"
            autoFocus
          />
        )}

        {currentQ.type === 'slider' && (
          <div className="space-y-6">
             <div className="text-5xl text-emerald-400 text-center font-light">
              {(answers as any)[currentQ.id]}{currentQ.unit}
            </div>
            <input
              type="range"
              min={currentQ.min}
              max={currentQ.max}
              value={(answers as any)[currentQ.id]}
              onChange={(e) => handleChange(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        )}

        {currentQ.type === 'select' && (
          <div className="grid grid-cols-3 gap-4">
            {currentQ.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => handleChange(opt)}
                className={`py-4 px-2 rounded-lg border transition-all ${
                  (answers as any)[currentQ.id] === opt
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQ.type === 'boolean' && (
          <div className="grid grid-cols-2 gap-6">
            <button
              onClick={() => handleChange(true)}
              className={`py-6 rounded-lg border transition-all ${
                (answers as any)[currentQ.id] === true
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => handleChange(false)}
              className={`py-6 rounded-lg border transition-all ${
                (answers as any)[currentQ.id] === false
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-700 hover:border-zinc-500 text-zinc-400'
              }`}
            >
              No
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleNext}
        className="group flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
      >
        <span className="uppercase tracking-widest text-sm">
          {currentStep === ASSESSMENT_QUESTIONS.length - 1 ? 'Reveal Optionality' : 'Next Signal'}
        </span>
        <div className="p-2 rounded-full border border-zinc-700 group-hover:border-white transition-colors">
          {currentStep === ASSESSMENT_QUESTIONS.length - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
        </div>
      </button>
    </div>
  );
};

export default AssessmentEngine;
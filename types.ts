export interface AssessmentAnswers {
  income_sources: number;
  income_concentration: number; // Percentage
  currency_primary: string;
  currency_count: number;
  jurisdiction_tax: string;
  jurisdiction_income: string;
  time_buffer: number; // Months
  commitment_reversibility: 'Low' | 'Medium' | 'High';
  leverage_debt: boolean;
  leverage_guarantees: boolean;
}

export interface OptionalityScore {
  total: number;
  breakdown: {
    income: number;
    currency: number;
    jurisdiction: number;
    time: number;
    leverage: number;
  };
  moves: ReversibleMove[];
}

export interface ReversibleMove {
  area: string;
  option: string;
  reversibility: string;
  risk: string;
}

export enum AppMode {
  LANDING = 'LANDING',
  ASSESSMENT = 'ASSESSMENT',
  RESULTS = 'RESULTS',
  LIVE_VOICE = 'LIVE_VOICE'
}

export const INITIAL_ANSWERS: AssessmentAnswers = {
  income_sources: 1,
  income_concentration: 100,
  currency_primary: 'USD',
  currency_count: 1,
  jurisdiction_tax: 'USA',
  jurisdiction_income: 'USA',
  time_buffer: 3,
  commitment_reversibility: 'Medium',
  leverage_debt: false,
  leverage_guarantees: false,
};
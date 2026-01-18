export type LifeMode = 'Building' | 'Transitioning' | 'Stabilizing' | 'Resetting' | 'Exploring';
export type MobilityLevel = 'Low' | 'Medium' | 'High';
export type RiskPosture = 'Conservative' | 'Balanced' | 'Asymmetric';
export type PrimaryRole = 'Founder/Operator' | 'Investor' | 'Creative' | 'Executive' | 'Family Anchor' | 'Nomad' | 'Other';

export interface DecisionAnswers {
  // Identity & Context (Columns A-P)
  firstName: string;
  lastInitial: string;
  email: string;
  timezone: string;
  country: string;
  city: string;
  lifeMode: LifeMode;
  primaryRole1: PrimaryRole;
  mobilityLevel: MobilityLevel;
  familyStatus: 'Solo' | 'Partner' | 'Family';
  riskPosture: RiskPosture;
  source: 'Friend' | 'Event' | 'Social' | 'Invite' | 'Other';

  // Assessment Inputs
  idea_description: string;
  upside: string;
  effort: string;
  multipliers: string[];
  reversibility: string;
  time_to_signal: string;
}

export interface PillarScores {
  geography: number;
  income: number;
  capabilities: number;
  network: number;
  assets: number;
}

export interface DecisionResult {
  clientId: string;
  idea: string;
  scores: {
    gain: number;
    effort: number;
    multiplier: number;
    reversibility: number;
    time_penalty: number;
    gem_score: number;
    effective_optionality: number;
    pillars: PillarScores;
  };
  classification: string;
  tier: string;
  warnings: string[];
  recommendation: string;
}

export type OptionCategory = 'project' | 'skill' | 'relationship' | 'investment';
export type OptionStatus = 'active' | 'killed' | 'harvested';

export interface PortfolioOption {
  id: string;
  title: string;
  description: string;
  gainPotential: number;
  effortCost: number;
  multiplierEffect: number;
  reversibility: number;
  category: OptionCategory;
  status: OptionStatus;
  createdAt: number;
  lastReviewedAt: number;
}

export enum AppMode {
  LANDING = 'LANDING',
  ASSESSMENT = 'ASSESSMENT',
  RESULTS = 'RESULTS',
  LIVE_VOICE = 'LIVE_VOICE',
  CHAT = 'CHAT',
  MAPS = 'MAPS',
  VISION = 'VISION',
  PORTFOLIO = 'PORTFOLIO',
  DRIVE_SYNC = 'DRIVE_SYNC',
  AUDIO_TRANSCRIBE = 'AUDIO_TRANSCRIBE'
}

export const INITIAL_DECISION: DecisionAnswers = {
  firstName: '',
  lastInitial: '',
  email: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  country: '',
  city: '',
  lifeMode: 'Building',
  primaryRole1: 'Founder/Operator',
  mobilityLevel: 'Medium',
  familyStatus: 'Solo',
  riskPosture: 'Balanced',
  source: 'Other',
  idea_description: '',
  upside: 'Noticeable but capped benefit',
  effort: 'Moderate (weeks, manageable)',
  multipliers: [],
  reversibility: 'Some cost but recoverable',
  time_to_signal: 'Weeks'
};
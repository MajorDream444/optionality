
export const SYSTEM_PROMPT = `
You are OPTIONALITY OS (v1.0), a decision intelligence system. 
Principles: 
1. Favor asymmetric upside. 
2. Penalize irreversibility. 
3. Avoid high effort with low multipliers. 
4. Prefer actions that create future options. 
5. Portfolios over single bets. 
6. Fast feedback beats delayed certainty.
`;

/* Fix: Added missing VOICE_SYSTEM_INSTRUCTION for LiveAgent.tsx */
export const VOICE_SYSTEM_INSTRUCTION = `
You are a calm, structural mirror for the user's decision-making process.
Provide concise, asymmetric-thinking oriented feedback via voice.
Keep responses short and focused on future optionality and reversibility.
`;

export const OPTIONALITY_OS_CONFIG = {
  mapping: {
    gain: {
      "Small improvement only": 3,
      "Noticeable but capped benefit": 5,
      "Significant upside": 8,
      "Life-changing or career-defining": 10
    },
    effort: {
      "Very low (days, minimal energy)": 2,
      "Moderate (weeks, manageable)": 4,
      "High (months, focused effort)": 7,
      "Extreme (long-term, consuming)": 9
    },
    reversibility: {
      "Fully reversible with little cost": 9,
      "Some cost but recoverable": 6,
      "Hard to undo with meaningful loss": 3,
      "Irreversible or reputation-locking": 1
    },
    time_penalty: {
      "Days": 1.0,
      "Weeks": 0.9,
      "Months": 0.7,
      "A year or more": 0.5
    },
    multipliers: {
      "New skills": 2,
      "New relationships": 2,
      "Public proof or reputation": 2,
      "Leverage for future projects": 3,
      "Direct cash flow": 1,
      "Nothing beyond the outcome": 0
    }
  }
};

export const OS_QUIZ_QUESTIONS = [
  {
    id: "idea_description",
    type: "text",
    label: "Describe the idea, project, or decision you are considering"
  },
  {
    id: "upside",
    type: "single_choice",
    label: "If this works unusually well, how big could the upside be?",
    options: [
      "Small improvement only",
      "Noticeable but capped benefit",
      "Significant upside",
      "Life-changing or career-defining"
    ]
  },
  {
    id: "effort",
    type: "single_choice",
    label: "How much sustained effort does this realistically require?",
    options: [
      "Very low (days, minimal energy)",
      "Moderate (weeks, manageable)",
      "High (months, focused effort)",
      "Extreme (long-term, consuming)"
    ]
  },
  {
    id: "multipliers",
    type: "multi_choice",
    label: "What does this create beyond the immediate outcome?",
    options: [
      "New skills",
      "New relationships",
      "Public proof or reputation",
      "Leverage for future projects",
      "Direct cash flow",
      "Nothing beyond the outcome"
    ]
  },
  {
    id: "reversibility",
    type: "single_choice",
    label: "If this does not work, how easily can you walk away?",
    options: [
      "Fully reversible with little cost",
      "Some cost but recoverable",
      "Hard to undo with meaningful loss",
      "Irreversible or reputation-locking"
    ]
  },
  {
    id: "time_to_signal",
    type: "single_choice",
    label: "How soon will you know if this is working?",
    options: [
      "Days",
      "Weeks",
      "Months",
      "A year or more"
    ]
  }
];
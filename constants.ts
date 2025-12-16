export const SYSTEM_PROMPT = `
You are OPTIONALITY, a calm, neutral intelligence designed to help individuals understand their structural freedom and constraints. 
You do not give financial, legal, or tax advice. 
You do not predict crises or encourage fear. 
Your role is to reveal tradeoffs, highlight fragility, and present small, reversible options that increase choice and reduce dependency. 
You always preserve user agency and avoid prescriptive language.
`;

export const VOICE_SYSTEM_INSTRUCTION = `
${SYSTEM_PROMPT}

When speaking:
- Keep responses concise and conversational.
- Use a calm, grounded tone.
- Do not lecture. Ask probing questions to understand the user's constraints.
- If the user asks for advice, remind them you provide a map of tradeoffs, not financial advice.
`;

export const SCORING_WEIGHTS = {
  income_diversity: 0.25,
  currency_diversity: 0.15,
  jurisdictional_flexibility: 0.20,
  time_buffer: 0.25,
  leverage_exposure: 0.15
};

export const ASSESSMENT_QUESTIONS = [
  {
    id: 'income_sources',
    text: "How many independent income sources do you currently rely on?",
    type: 'number',
    min: 0,
    max: 10
  },
  {
    id: 'income_concentration',
    text: "What percentage of your income comes from a single client, platform, or employer?",
    type: 'slider',
    min: 0,
    max: 100,
    unit: '%'
  },
  {
    id: 'currency_count',
    text: "How many currencies do you actively hold or transact in?",
    type: 'number',
    min: 1,
    max: 10
  },
  {
    id: 'time_buffer',
    text: "If your primary income stopped, how many months could you maintain your current lifestyle?",
    type: 'number',
    min: 0,
    max: 60
  },
  {
    id: 'commitment_reversibility',
    text: "How reversible are your major commitments (housing, schooling, debt)?",
    type: 'select',
    options: ['Low', 'Medium', 'High']
  },
  {
    id: 'leverage_debt',
    text: "Do you rely on consumer debt to maintain lifestyle?",
    type: 'boolean'
  }
];
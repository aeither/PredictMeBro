// Test data samples for pool creation
export const testPoolSamples = [
  {
    question: "Will Bitcoin reach $100,000 by end of 2024?",
    participationAmount: "0.01",
    durationHours: "2",
    description: "Basic crypto prediction with 0.01 ETH participation fee"
  },
  {
    question: "Will it rain tomorrow in San Francisco?",
    participationAmount: "0.005",
    durationHours: "24",
    description: "Weather prediction with 0.005 ETH participation fee"
  },
  {
    question: "Will Ethereum 2.0 staking rewards exceed 5% APY this month?",
    participationAmount: "0.02",
    durationHours: "168", // 1 week
    description: "DeFi prediction with 0.02 ETH participation fee"
  },
  {
    question: "Will the next US President be a Democrat?",
    participationAmount: "0.01",
    durationHours: "720", // 30 days
    description: "Political prediction with 0.01 ETH participation fee"
  },
  {
    question: "Will OpenAI release GPT-5 before 2025?",
    participationAmount: "0.015",
    durationHours: "8760", // 1 year
    description: "Tech prediction with 0.015 ETH participation fee"
  }
];

// Working dummy data for quick testing
export const quickTestData = {
  question: "Will Bitcoin reach $100,000 by end of 2024?",
  participationAmount: "0.01",
  durationHours: "2",
  expectedCost: 0.1 // 10x participation amount
};

// Function to calculate pool creation cost
export const calculatePoolCost = (participationAmount: string): number => {
  const amount = parseFloat(participationAmount);
  return isNaN(amount) ? 0 : amount * 10;
};

// Function to generate test walrus hash
export const generateTestWalrusHash = (question: string): string => {
  const timestamp = Date.now();
  const questionSnippet = question.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_');
  return `pool_${timestamp}_${questionSnippet}`;
};

// Validation helpers
export const validatePoolData = (
  question: string,
  participationAmount: string,
  durationHours: string
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!question.trim()) {
    errors.push("Question is required");
  }
  
  if (question.length < 10) {
    errors.push("Question must be at least 10 characters");
  }
  
  const amount = parseFloat(participationAmount);
  if (isNaN(amount) || amount <= 0) {
    errors.push("Participation amount must be greater than 0");
  }
  
  if (amount < 0.001) {
    errors.push("Participation amount must be at least 0.001 ETH");
  }
  
  const duration = parseFloat(durationHours);
  if (isNaN(duration) || duration <= 0) {
    errors.push("Duration must be greater than 0 hours");
  }
  
  if (duration < 0.1) {
    errors.push("Duration must be at least 0.1 hours (6 minutes)");
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}; 
export interface UserProfile {
  age: number;
  income: number;
  monthlyExpenses: number;
  monthlySavings: number;
  currentSavings: number;
  goals: FinancialGoal[];
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetYear: number;
  priority: 'high' | 'medium' | 'low';
  category: 'home' | 'education' | 'travel' | 'retirement' | 'business' | 'other';
}

export interface TimelineScenario {
  name: string;
  description: string;
  savingsRate: number;
  investmentReturn: number;
  inflationRate: number;
  color: string;
}

export interface SimulationResult {
  year: number;
  age: number;
  totalSavings: number;
  investmentValue: number;
  netWorth: number;
  goalsAchieved: string[];
  events: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
}

export interface EducationalTip {
  id: string;
  title: string;
  content: string;
  category: string;
  triggerCondition: string;
}

export interface InsuranceAdvice {
  id: string;
  userId: string;
  insuranceType: 'health' | 'life' | 'disability' | 'auto' | 'home' | 'umbrella';
  currentCoverage: number;
  recommendedCoverage: number;
  monthlyPremium: number;
  provider: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'researching';
  createdAt: string;
  updatedAt: string;
}

export interface SavedAIAdvice {
  id: string;
  userId: string;
  prompt: string;
  response: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}
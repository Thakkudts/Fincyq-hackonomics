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
  category: 'home' | 'education' | 'travel' | 'retirement' | 'business' | 'other' | 'car';
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

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'savings' | 'planning' | 'protection' | 'exploration' | 'achievement';
  criteria: BadgeCriteria;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface BadgeCriteria {
  type: 'savings_amount' | 'emergency_fund' | 'goals_count' | 'disaster_survival' | 'risk_assessment' | 'insurance_usage' | 'timeline_exploration' | 'dream_goals' | 'expense_tracking' | 'ai_usage';
  threshold: number;
  description: string;
}

export interface UserProgress {
  totalSavings: number;
  emergencyFundMonths: number;
  goalsCount: number;
  dreamGoalsCount: number;
  disasterSurvivalScore: number;
  riskAssessmentComplete: boolean;
  insuranceToolUsed: boolean;
  timelinesExplored: string[];
  expenseTrackingDays: number;
  aiQuestionsAsked: number;
  badgesEarned: string[];
}
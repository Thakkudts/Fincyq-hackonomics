import { Badge } from '../types';

export const availableBadges: Badge[] = [
  {
    id: 'money-magnet',
    name: 'Money Magnet',
    description: 'Save ₹50,000 total across all accounts',
    emoji: '💰',
    category: 'savings',
    criteria: {
      type: 'savings_amount',
      threshold: 50000,
      description: 'Accumulate ₹50,000 in total savings'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 50000,
    rarity: 'common'
  },
  {
    id: 'crisis-crusher',
    name: 'Crisis Crusher',
    description: 'Survive disaster mode with 6+ months emergency buffer',
    emoji: '📉',
    category: 'protection',
    criteria: {
      type: 'disaster_survival',
      threshold: 70,
      description: 'Score 70+ in disaster mode simulation'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 100,
    rarity: 'rare'
  },
  {
    id: 'risk-ready',
    name: 'Risk Ready',
    description: 'Complete comprehensive risk assessment',
    emoji: '🧠',
    category: 'planning',
    criteria: {
      type: 'risk_assessment',
      threshold: 1,
      description: 'Complete all risk assessment questions'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'planner-pro',
    name: 'Planner Pro',
    description: 'Set 3 or more financial goals',
    emoji: '📆',
    category: 'planning',
    criteria: {
      type: 'goals_count',
      threshold: 3,
      description: 'Create at least 3 financial goals'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rarity: 'common'
  },
  {
    id: 'emergency-ace',
    name: 'Emergency Ace',
    description: 'Build a 6-month emergency fund',
    emoji: '🚨',
    category: 'protection',
    criteria: {
      type: 'emergency_fund',
      threshold: 6,
      description: 'Save 6 months worth of expenses'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 6,
    rarity: 'rare'
  },
  {
    id: 'insurance-insider',
    name: 'Insurance Insider',
    description: 'Use financial protection tools and calculators',
    emoji: '🛡️',
    category: 'protection',
    criteria: {
      type: 'insurance_usage',
      threshold: 1,
      description: 'Complete insurance assessment or use protection tools'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    rarity: 'common'
  },
  {
    id: 'dream-builder',
    name: 'Dream Builder',
    description: 'Add 3+ dream goals in Dream Mode',
    emoji: '🌠',
    category: 'planning',
    criteria: {
      type: 'dream_goals',
      threshold: 3,
      description: 'Create 3 or more dream goals'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rarity: 'common'
  },
  {
    id: 'timeline-explorer',
    name: 'Timeline Explorer',
    description: 'Try all 3 life path simulations',
    emoji: '⏳',
    category: 'exploration',
    criteria: {
      type: 'timeline_exploration',
      threshold: 3,
      description: 'Explore all timeline scenarios'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    rarity: 'rare'
  },
  {
    id: 'expense-tracker',
    name: 'Expense Tracker',
    description: 'Track expenses for 7 consecutive days',
    emoji: '📊',
    category: 'planning',
    criteria: {
      type: 'expense_tracking',
      threshold: 7,
      description: 'Log expenses for 7 days in a row'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 7,
    rarity: 'common'
  },
  {
    id: 'ai-advisor',
    name: 'AI Advisor',
    description: 'Ask 10 questions to the AI financial advisor',
    emoji: '🤖',
    category: 'exploration',
    criteria: {
      type: 'ai_usage',
      threshold: 10,
      description: 'Engage with AI advisor 10 times'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    rarity: 'common'
  },
  {
    id: 'millionaire-mindset',
    name: 'Millionaire Mindset',
    description: 'Reach ₹10 lakh in total savings',
    emoji: '💎',
    category: 'achievement',
    criteria: {
      type: 'savings_amount',
      threshold: 1000000,
      description: 'Accumulate ₹10 lakh in savings'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 1000000,
    rarity: 'epic'
  },
  {
    id: 'financial-guru',
    name: 'Financial Guru',
    description: 'Complete all major financial milestones',
    emoji: '🏆',
    category: 'achievement',
    criteria: {
      type: 'goals_count',
      threshold: 10,
      description: 'Achieve 10 financial goals'
    },
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    rarity: 'legendary'
  }
];

export const badgeCategories = {
  savings: { name: 'Savings Master', color: 'bg-green-500', icon: '💰' },
  planning: { name: 'Strategic Planner', color: 'bg-blue-500', icon: '📋' },
  protection: { name: 'Risk Guardian', color: 'bg-red-500', icon: '🛡️' },
  exploration: { name: 'Financial Explorer', color: 'bg-purple-500', icon: '🔍' },
  achievement: { name: 'Elite Achiever', color: 'bg-yellow-500', icon: '🏆' }
};

export const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
};

export const rarityGlow = {
  common: 'shadow-gray-500/25',
  rare: 'shadow-blue-500/25',
  epic: 'shadow-purple-500/25',
  legendary: 'shadow-yellow-500/25'
};
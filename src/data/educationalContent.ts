import { EducationalTip } from '../types';

export const educationalTips: EducationalTip[] = [
  {
    id: 'compound-interest',
    title: 'The Magic of Compound Interest',
    content: 'Compound interest is earning interest on your interest. Starting early can turn small amounts into large sums over time. Even $100/month at 7% return becomes $264,000 over 30 years!',
    category: 'investing',
    triggerCondition: 'low_savings_rate'
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund Essentials',
    content: 'An emergency fund should cover 3-6 months of expenses. It protects you from debt when unexpected costs arise and provides peace of mind.',
    category: 'saving',
    triggerCondition: 'low_liquid_savings'
  },
  {
    id: 'inflation-impact',
    title: 'Inflation: The Silent Wealth Killer',
    content: 'Inflation erodes purchasing power over time. Money sitting in low-interest accounts loses value. Investing helps your money grow faster than inflation.',
    category: 'investing',
    triggerCondition: 'conservative_portfolio'
  },
  {
    id: 'diversification',
    title: 'Don\'t Put All Eggs in One Basket',
    content: 'Diversification spreads risk across different investments. A mix of stocks, bonds, and other assets can provide steadier returns over time.',
    category: 'investing',
    triggerCondition: 'concentrated_portfolio'
  },
  {
    id: 'dollar-cost-averaging',
    title: 'Dollar-Cost Averaging Strategy',
    content: 'Investing the same amount regularly, regardless of market conditions, can reduce the impact of volatility and lower your average cost per share.',
    category: 'investing',
    triggerCondition: 'market_timing_concerns'
  },
  {
    id: 'retirement-early',
    title: 'The Power of Starting Early',
    content: 'Starting retirement savings in your 20s vs 30s can mean hundreds of thousands more by retirement. Time is your greatest asset in building wealth.',
    category: 'retirement',
    triggerCondition: 'young_age'
  }
];

export const achievements = [
  {
    id: 'first-savings',
    name: 'First Steps',
    description: 'Completed your first financial simulation',
    icon: '🎯',
    unlocked: false,
    progress: 0
  },
  {
    id: 'emergency-fund',
    name: 'Safety Net',
    description: 'Built an emergency fund of 6 months expenses',
    icon: '🛡️',
    unlocked: false,
    progress: 0
  },
  {
    id: 'millionaire',
    name: 'Seven Figures',
    description: 'Reached $1 million net worth',
    icon: '💎',
    unlocked: false,
    progress: 0
  },
  {
    id: 'goal-achiever',
    name: 'Dream Achiever',
    description: 'Achieved your first major financial goal',
    icon: '⭐',
    unlocked: false,
    progress: 0
  },
  {
    id: 'financial-guru',
    name: 'Financial Guru',
    description: 'Learned 10 financial concepts',
    icon: '🧠',
    unlocked: false,
    progress: 0
  }
];
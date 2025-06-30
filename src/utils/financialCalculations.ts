import { UserProfile, TimelineScenario, SimulationResult, FinancialGoal } from '../types';

export const scenarios: TimelineScenario[] = [
  {
    name: 'Current Path',
    description: 'Continue with your current habits',
    savingsRate: 1.0,
    investmentReturn: 0.07,
    inflationRate: 0.03,
    color: '#EF4444'
  },
  {
    name: 'Improved Path',
    description: 'Small improvements to your financial habits',
    savingsRate: 1.5,
    investmentReturn: 0.08,
    inflationRate: 0.03,
    color: '#F59E0B'
  },
  {
    name: 'Expert Path',
    description: 'Following expert financial advice',
    savingsRate: 2.0,
    investmentReturn: 0.09,
    inflationRate: 0.03,
    color: '#10B981'
  }
];

export function calculateTimeline(
  profile: UserProfile,
  scenario: TimelineScenario,
  yearsToSimulate: number = 40
): SimulationResult[] {
  const results: SimulationResult[] = [];
  
  let currentSavings = profile.currentSavings;
  let investmentValue = 0;
  const annualSavings = profile.monthlySavings * 12 * scenario.savingsRate;
  
  for (let year = 0; year <= yearsToSimulate; year++) {
    const currentYear = new Date().getFullYear() + year;
    const currentAge = profile.age + year;
    
    // Apply investment returns
    if (investmentValue > 0) {
      investmentValue *= (1 + scenario.investmentReturn);
    }
    
    // Add new savings (80% goes to investments, 20% stays liquid)
    if (year > 0) {
      const newSavings = annualSavings;
      investmentValue += newSavings * 0.8;
      currentSavings += newSavings * 0.2;
    }
    
    // Apply inflation to liquid savings
    currentSavings *= (1 - scenario.inflationRate / 2);
    
    const netWorth = currentSavings + investmentValue;
    
    // Check achieved goals
    const goalsAchieved = profile.goals
      .filter(goal => goal.targetYear <= currentYear && netWorth >= goal.targetAmount)
      .map(goal => goal.name);
    
    // Generate events
    const events = generateLifeEvents(currentAge, year, netWorth);
    
    results.push({
      year: currentYear,
      age: currentAge,
      totalSavings: currentSavings,
      investmentValue,
      netWorth,
      goalsAchieved,
      events
    });
  }
  
  return results;
}

function generateLifeEvents(age: number, yearsFromNow: number, netWorth: number): string[] {
  const events: string[] = [];
  
  if (age === 30 && yearsFromNow > 0) events.push('Career advancement opportunities');
  if (age === 35 && yearsFromNow > 0) events.push('Peak earning years begin');
  if (age === 40 && yearsFromNow > 0) events.push('Mid-life financial review');
  if (age === 50 && yearsFromNow > 0) events.push('Pre-retirement planning phase');
  if (age === 65 && yearsFromNow > 0) events.push('Traditional retirement age');
  
  // Random events based on probability
  if (yearsFromNow > 0 && Math.random() < 0.1) {
    const randomEvents = [
      'Market correction (-15%)',
      'Unexpected medical expense',
      'Job promotion (+20% income)',
      'Economic boom (+25% returns)',
      'Home repair needed'
    ];
    events.push(randomEvents[Math.floor(Math.random() * randomEvents.length)]);
  }
  
  return events;
}

export function calculateGoalFeasibility(profile: UserProfile, goal: FinancialGoal): {
  feasible: boolean;
  monthlyRequired: number;
  shortfall: number;
} {
  const yearsToGoal = goal.targetYear - new Date().getFullYear();
  const monthsToGoal = yearsToGoal * 12;
  
  if (monthsToGoal <= 0) {
    return { feasible: false, monthlyRequired: 0, shortfall: goal.targetAmount };
  }
  
  // Simple calculation assuming 7% annual return
  const monthlyReturn = 0.07 / 12;
  const futureValue = profile.currentSavings * Math.pow(1 + monthlyReturn, monthsToGoal);
  const requiredMonthly = (goal.targetAmount - futureValue) / 
    (((Math.pow(1 + monthlyReturn, monthsToGoal) - 1) / monthlyReturn));
  
  const feasible = requiredMonthly <= profile.monthlySavings * 1.5; // Can achieve with 50% increase
  const shortfall = Math.max(0, requiredMonthly - profile.monthlySavings);
  
  return {
    feasible,
    monthlyRequired: Math.max(0, requiredMonthly),
    shortfall
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
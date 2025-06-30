import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { formatCurrency } from '../utils/financialCalculations';
import { 
  X, 
  GitBranch, 
  TrendingUp, 
  Users, 
  Home, 
  Briefcase, 
  GraduationCap,
  Heart,
  Building,
  Plane,
  Trophy,
  Star,
  ChevronRight,
  RotateCcw,
  Play,
  Pause,
  SkipForward
} from 'lucide-react';

interface LifeDecision {
  id: string;
  age: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  options: {
    id: string;
    label: string;
    description: string;
    impact: {
      savingsMultiplier?: number;
      expenseMultiplier?: number;
      incomeMultiplier?: number;
      oneTimeExpense?: number;
      oneTimeIncome?: number;
      investmentReturnBonus?: number;
    };
    consequences: string[];
  }[];
}

interface TimelinePath {
  id: string;
  name: string;
  description: string;
  color: string;
  decisions: { [decisionId: string]: string };
  finalNetWorth: number;
  milestones: string[];
}

interface BranchingPathsProps {
  profile: UserProfile;
  onClose: () => void;
}

const lifeDecisions: LifeDecision[] = [
  {
    id: 'career-switch',
    age: 27,
    title: 'Career Opportunity',
    description: 'A high-paying tech job offer comes your way, but it requires relocating and longer hours.',
    icon: Briefcase,
    options: [
      {
        id: 'take-job',
        label: 'Take the High-Paying Job',
        description: 'Move to the new city, earn 40% more but work longer hours',
        impact: {
          incomeMultiplier: 1.4,
          expenseMultiplier: 1.2,
          savingsMultiplier: 1.3
        },
        consequences: ['Higher stress levels', 'Better financial growth', 'New city, new opportunities']
      },
      {
        id: 'stay-current',
        label: 'Stay in Current Job',
        description: 'Maintain work-life balance and current lifestyle',
        impact: {
          incomeMultiplier: 1.05,
          savingsMultiplier: 1.0
        },
        consequences: ['Better work-life balance', 'Steady but slower growth', 'Familiar environment']
      }
    ]
  },
  {
    id: 'family-decision',
    age: 30,
    title: 'Starting a Family',
    description: 'You and your partner are considering starting a family. This will impact your finances significantly.',
    icon: Heart,
    options: [
      {
        id: 'start-family',
        label: 'Start a Family Now',
        description: 'Begin your family journey with all the joys and expenses',
        impact: {
          expenseMultiplier: 1.5,
          savingsMultiplier: 0.7,
          oneTimeExpense: 200000
        },
        consequences: ['Increased monthly expenses', 'Reduced savings rate', 'Life insurance needs', 'Immense personal joy']
      },
      {
        id: 'delay-family',
        label: 'Focus on Career First',
        description: 'Delay family plans to focus on career and financial growth',
        impact: {
          savingsMultiplier: 1.4,
          investmentReturnBonus: 0.01
        },
        consequences: ['Higher savings rate', 'More investment opportunities', 'Career advancement', 'Delayed family plans']
      }
    ]
  },
  {
    id: 'housing-decision',
    age: 35,
    title: 'Housing Choice',
    description: 'You have enough for a down payment. Buy a house or continue investing in the market?',
    icon: Home,
    options: [
      {
        id: 'buy-house',
        label: 'Buy Your Dream Home',
        description: 'Purchase a home with a substantial down payment',
        impact: {
          oneTimeExpense: 1000000,
          expenseMultiplier: 1.1,
          savingsMultiplier: 0.8
        },
        consequences: ['Homeownership stability', 'Property appreciation', 'Higher monthly expenses', 'Reduced liquidity']
      },
      {
        id: 'keep-investing',
        label: 'Continue Renting & Investing',
        description: 'Keep renting and invest the down payment money',
        impact: {
          savingsMultiplier: 1.2,
          investmentReturnBonus: 0.015
        },
        consequences: ['Higher investment returns', 'Flexibility to move', 'No property ownership', 'Continued rent payments']
      }
    ]
  },
  {
    id: 'business-opportunity',
    age: 40,
    title: 'Entrepreneurial Venture',
    description: 'A business opportunity arises. You could start your own company or invest in a friend\'s startup.',
    icon: Building,
    options: [
      {
        id: 'start-business',
        label: 'Start Your Own Business',
        description: 'Quit your job and start your dream business',
        impact: {
          oneTimeExpense: 800000,
          incomeMultiplier: 0.5,
          savingsMultiplier: 0.3
        },
        consequences: ['High risk, high reward', 'Potential for massive returns', 'Income uncertainty', 'Personal fulfillment']
      },
      {
        id: 'safe-investment',
        label: 'Make Safe Investments',
        description: 'Continue with your job and make conservative investments',
        impact: {
          savingsMultiplier: 1.1,
          incomeMultiplier: 1.1
        },
        consequences: ['Steady income growth', 'Lower risk', 'Predictable returns', 'Missed entrepreneurial opportunity']
      }
    ]
  },
  {
    id: 'education-investment',
    age: 45,
    title: 'Education Investment',
    description: 'Consider pursuing an executive MBA or advanced certification to boost your career.',
    icon: GraduationCap,
    options: [
      {
        id: 'pursue-education',
        label: 'Pursue Advanced Education',
        description: 'Invest in an executive MBA or advanced certification',
        impact: {
          oneTimeExpense: 500000,
          incomeMultiplier: 1.3,
          savingsMultiplier: 1.2
        },
        consequences: ['Higher earning potential', 'Better career prospects', 'Networking opportunities', 'Short-term financial strain']
      },
      {
        id: 'focus-savings',
        label: 'Focus on Retirement Savings',
        description: 'Skip education and maximize retirement contributions',
        impact: {
          savingsMultiplier: 1.3,
          investmentReturnBonus: 0.01
        },
        consequences: ['Accelerated retirement savings', 'Compound interest benefits', 'Limited career growth', 'Early retirement possibility']
      }
    ]
  }
];

export default function BranchingPaths({ profile, onClose }: BranchingPathsProps) {
  const [currentDecisionIndex, setCurrentDecisionIndex] = useState(0);
  const [userChoices, setUserChoices] = useState<{ [decisionId: string]: string }>({});
  const [timelines, setTimelines] = useState<TimelinePath[]>([]);
  const [selectedTimeline, setSelectedTimeline] = useState<string>('current');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentDecision = lifeDecisions[currentDecisionIndex];
  const isLastDecision = currentDecisionIndex === lifeDecisions.length - 1;

  useEffect(() => {
    // Generate initial timelines
    generateTimelines();
  }, [profile]);

  const generateTimelines = () => {
    const baseTimelines: TimelinePath[] = [
      {
        id: 'current',
        name: 'Current Path',
        description: 'Continue with your current financial habits',
        color: '#EF4444',
        decisions: {},
        finalNetWorth: 0,
        milestones: []
      },
      {
        id: 'conservative',
        name: 'Conservative Path',
        description: 'Make safe, low-risk financial decisions',
        color: '#3B82F6',
        decisions: {},
        finalNetWorth: 0,
        milestones: []
      },
      {
        id: 'aggressive',
        name: 'Aggressive Path',
        description: 'Take calculated risks for higher returns',
        color: '#10B981',
        decisions: {},
        finalNetWorth: 0,
        milestones: []
      }
    ];

    // Calculate net worth for each timeline
    baseTimelines.forEach(timeline => {
      const result = calculateTimelineNetWorth(timeline);
      timeline.finalNetWorth = result.finalNetWorth;
      timeline.milestones = result.milestones;
    });

    setTimelines(baseTimelines);
  };

  const calculateTimelineNetWorth = (timeline: TimelinePath) => {
    let netWorth = profile.currentSavings;
    let monthlyIncome = profile.income / 12;
    let monthlyExpenses = profile.monthlyExpenses;
    let monthlySavings = profile.monthlySavings;
    let investmentReturn = 0.07; // Base 7% return
    const milestones: string[] = [];

    const yearsToSimulate = 30;
    const startAge = profile.age;

    for (let year = 0; year < yearsToSimulate; year++) {
      const currentAge = startAge + year;
      
      // Apply life decisions based on timeline
      lifeDecisions.forEach(decision => {
        if (currentAge === decision.age) {
          let chosenOption;
          
          if (timeline.id === 'current') {
            // Current path: make moderate choices
            chosenOption = decision.options[0];
          } else if (timeline.id === 'conservative') {
            // Conservative path: choose safer options
            chosenOption = decision.options.find(opt => 
              opt.label.toLowerCase().includes('safe') || 
              opt.label.toLowerCase().includes('current') ||
              opt.label.toLowerCase().includes('stay')
            ) || decision.options[1] || decision.options[0];
          } else if (timeline.id === 'aggressive') {
            // Aggressive path: choose riskier, higher-reward options
            chosenOption = decision.options.find(opt => 
              opt.label.toLowerCase().includes('business') || 
              opt.label.toLowerCase().includes('high') ||
              opt.label.toLowerCase().includes('start')
            ) || decision.options[0];
          }

          if (chosenOption) {
            // Apply impacts
            if (chosenOption.impact.incomeMultiplier) {
              monthlyIncome *= chosenOption.impact.incomeMultiplier;
            }
            if (chosenOption.impact.expenseMultiplier) {
              monthlyExpenses *= chosenOption.impact.expenseMultiplier;
            }
            if (chosenOption.impact.savingsMultiplier) {
              monthlySavings *= chosenOption.impact.savingsMultiplier;
            }
            if (chosenOption.impact.oneTimeExpense) {
              netWorth -= chosenOption.impact.oneTimeExpense;
            }
            if (chosenOption.impact.oneTimeIncome) {
              netWorth += chosenOption.impact.oneTimeIncome;
            }
            if (chosenOption.impact.investmentReturnBonus) {
              investmentReturn += chosenOption.impact.investmentReturnBonus;
            }

            milestones.push(`Age ${currentAge}: ${chosenOption.label}`);
          }
        }
      });

      // Annual calculations
      const annualSavings = monthlySavings * 12;
      netWorth += annualSavings;
      netWorth *= (1 + investmentReturn);

      // Add major milestones
      if (netWorth >= 1000000 && !milestones.some(m => m.includes('Millionaire'))) {
        milestones.push(`Age ${currentAge}: Became a Millionaire! 🎉`);
      }
      if (netWorth >= 5000000 && !milestones.some(m => m.includes('Multi-Millionaire'))) {
        milestones.push(`Age ${currentAge}: Multi-Millionaire Status! 💎`);
      }
    }

    return { finalNetWorth: netWorth, milestones };
  };

  const makeChoice = (optionId: string) => {
    const newChoices = { ...userChoices, [currentDecision.id]: optionId };
    setUserChoices(newChoices);

    if (isLastDecision) {
      // Generate custom timeline based on user choices
      setIsSimulating(true);
      setTimeout(() => {
        generateCustomTimeline(newChoices);
        setShowResults(true);
        setIsSimulating(false);
      }, 2000);
    } else {
      setCurrentDecisionIndex(prev => prev + 1);
    }
  };

  const generateCustomTimeline = (choices: { [decisionId: string]: string }) => {
    let netWorth = profile.currentSavings;
    let monthlyIncome = profile.income / 12;
    let monthlyExpenses = profile.monthlyExpenses;
    let monthlySavings = profile.monthlySavings;
    let investmentReturn = 0.07;
    const milestones: string[] = [];

    const yearsToSimulate = 30;
    const startAge = profile.age;

    for (let year = 0; year < yearsToSimulate; year++) {
      const currentAge = startAge + year;
      
      // Apply user's chosen decisions
      lifeDecisions.forEach(decision => {
        if (currentAge === decision.age && choices[decision.id]) {
          const chosenOption = decision.options.find(opt => opt.id === choices[decision.id]);
          
          if (chosenOption) {
            // Apply impacts
            if (chosenOption.impact.incomeMultiplier) {
              monthlyIncome *= chosenOption.impact.incomeMultiplier;
            }
            if (chosenOption.impact.expenseMultiplier) {
              monthlyExpenses *= chosenOption.impact.expenseMultiplier;
            }
            if (chosenOption.impact.savingsMultiplier) {
              monthlySavings *= chosenOption.impact.savingsMultiplier;
            }
            if (chosenOption.impact.oneTimeExpense) {
              netWorth -= chosenOption.impact.oneTimeExpense;
            }
            if (chosenOption.impact.oneTimeIncome) {
              netWorth += chosenOption.impact.oneTimeIncome;
            }
            if (chosenOption.impact.investmentReturnBonus) {
              investmentReturn += chosenOption.impact.investmentReturnBonus;
            }

            milestones.push(`Age ${currentAge}: ${chosenOption.label}`);
          }
        }
      });

      // Annual calculations
      const annualSavings = monthlySavings * 12;
      netWorth += annualSavings;
      netWorth *= (1 + investmentReturn);

      // Add major milestones
      if (netWorth >= 1000000 && !milestones.some(m => m.includes('Millionaire'))) {
        milestones.push(`Age ${currentAge}: Became a Millionaire! 🎉`);
      }
      if (netWorth >= 5000000 && !milestones.some(m => m.includes('Multi-Millionaire'))) {
        milestones.push(`Age ${currentAge}: Multi-Millionaire Status! 💎`);
      }
    }

    const customTimeline: TimelinePath = {
      id: 'custom',
      name: 'Your Chosen Path',
      description: 'Based on your life decisions',
      color: '#8B5CF6',
      decisions: choices,
      finalNetWorth: netWorth,
      milestones
    };

    setTimelines(prev => [...prev, customTimeline]);
    setSelectedTimeline('custom');
  };

  const resetJourney = () => {
    setCurrentDecisionIndex(0);
    setUserChoices({});
    setShowResults(false);
    setSelectedTimeline('current');
    setTimelines(prev => prev.filter(t => t.id !== 'custom'));
  };

  if (isSimulating) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-4">Calculating Your Future</h2>
          <p className="text-white/80">Analyzing the impact of your life decisions...</p>
          <div className="mt-6 space-y-2">
            <div className="text-purple-400 text-sm">Processing life events...</div>
            <div className="text-blue-400 text-sm">Calculating compound returns...</div>
            <div className="text-green-400 text-sm">Generating timeline...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <GitBranch size={20} className="text-white" />
                </div>
                Branching Life Paths - Choose Your Future
              </h2>
              <p className="text-white/60 mt-1">Explore how different life decisions shape your financial destiny</p>
            </div>
            
            <div className="flex items-center gap-3">
              {showResults && (
                <button
                  onClick={resetJourney}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  Start Over
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {!showResults && (
            <div className="mt-6">
              <div className="flex justify-between text-white/60 text-sm mb-2">
                <span>Decision {currentDecisionIndex + 1} of {lifeDecisions.length}</span>
                <span>{Math.round(((currentDecisionIndex + 1) / lifeDecisions.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentDecisionIndex + 1) / lifeDecisions.length) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!showResults ? (
            /* Decision Making Interface */
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                {/* Current Decision */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(currentDecision.icon, { size: 32, className: "text-white" })}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Age {currentDecision.age}: {currentDecision.title}</h3>
                  <p className="text-white/80 text-lg max-w-2xl mx-auto">{currentDecision.description}</p>
                </div>

                {/* Decision Options */}
                <div className="grid md:grid-cols-2 gap-6">
                  {currentDecision.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => makeChoice(option.id)}
                      className="p-6 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 hover:border-purple-400/50 transition-all text-left group hover:scale-105"
                    >
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                          {option.label}
                        </h4>
                        <p className="text-white/70">{option.description}</p>
                      </div>

                      {/* Impact Preview */}
                      <div className="mb-4 space-y-2">
                        <div className="text-white/60 text-sm font-medium">Financial Impact:</div>
                        <div className="space-y-1 text-sm">
                          {option.impact.incomeMultiplier && option.impact.incomeMultiplier !== 1 && (
                            <div className={`flex items-center gap-2 ${option.impact.incomeMultiplier > 1 ? 'text-green-400' : 'text-red-400'}`}>
                              <TrendingUp size={14} />
                              Income: {option.impact.incomeMultiplier > 1 ? '+' : ''}{((option.impact.incomeMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                          )}
                          {option.impact.savingsMultiplier && option.impact.savingsMultiplier !== 1 && (
                            <div className={`flex items-center gap-2 ${option.impact.savingsMultiplier > 1 ? 'text-green-400' : 'text-red-400'}`}>
                              <Star size={14} />
                              Savings: {option.impact.savingsMultiplier > 1 ? '+' : ''}{((option.impact.savingsMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                          )}
                          {option.impact.oneTimeExpense && (
                            <div className="flex items-center gap-2 text-red-400">
                              <TrendingUp size={14} className="rotate-180" />
                              One-time cost: {formatCurrency(option.impact.oneTimeExpense)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Consequences */}
                      <div>
                        <div className="text-white/60 text-sm font-medium mb-2">Life Consequences:</div>
                        <div className="space-y-1">
                          {option.consequences.map((consequence, index) => (
                            <div key={index} className="text-white/70 text-sm flex items-center gap-2">
                              <div className="w-1 h-1 bg-white/40 rounded-full" />
                              {consequence}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-end text-purple-400 group-hover:text-purple-300 transition-colors">
                        <span className="text-sm font-medium">Choose this path</span>
                        <ChevronRight size={16} className="ml-1" />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Previous Decisions Summary */}
                {Object.keys(userChoices).length > 0 && (
                  <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Your Journey So Far:</h4>
                    <div className="space-y-2">
                      {Object.entries(userChoices).map(([decisionId, choiceId]) => {
                        const decision = lifeDecisions.find(d => d.id === decisionId);
                        const choice = decision?.options.find(o => o.id === choiceId);
                        return (
                          <div key={decisionId} className="flex items-center gap-3 text-white/80">
                            <div className="w-6 h-6 bg-purple-500/30 rounded-full flex items-center justify-center">
                              {decision?.icon && React.createElement(decision.icon, { size: 12, className: "text-purple-400" })}
                            </div>
                            <span className="text-sm">
                              Age {decision?.age}: {choice?.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Results Interface */
            <div className="p-8">
              <div className="max-w-6xl mx-auto space-y-8">
                {/* Timeline Comparison */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Trophy className="text-yellow-400" />
                    Your Financial Futures Compared
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {timelines.map((timeline) => (
                      <button
                        key={timeline.id}
                        onClick={() => setSelectedTimeline(timeline.id)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedTimeline === timeline.id
                            ? 'border-purple-400 bg-purple-400/20 scale-105'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div 
                            className="w-4 h-4 rounded-full mx-auto mb-2"
                            style={{ backgroundColor: timeline.color }}
                          />
                          <div className="font-semibold text-white text-sm">{timeline.name}</div>
                          <div className="text-white/60 text-xs mb-2">{timeline.description}</div>
                          <div className="text-lg font-bold" style={{ color: timeline.color }}>
                            {formatCurrency(timeline.finalNetWorth)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Selected Timeline Details */}
                  {selectedTimeline && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <div 
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: timelines.find(t => t.id === selectedTimeline)?.color }}
                        />
                        <h4 className="text-xl font-bold text-white">
                          {timelines.find(t => t.id === selectedTimeline)?.name}
                        </h4>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h5 className="text-lg font-semibold text-white mb-4">Final Net Worth</h5>
                          <div className="text-3xl font-bold mb-2" style={{ color: timelines.find(t => t.id === selectedTimeline)?.color }}>
                            {formatCurrency(timelines.find(t => t.id === selectedTimeline)?.finalNetWorth || 0)}
                          </div>
                          <div className="text-white/60">At age {profile.age + 30}</div>
                        </div>

                        <div>
                          <h5 className="text-lg font-semibold text-white mb-4">Key Milestones</h5>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {timelines.find(t => t.id === selectedTimeline)?.milestones.map((milestone, index) => (
                              <div key={index} className="text-white/80 text-sm flex items-center gap-2">
                                <div className="w-1 h-1 bg-white/40 rounded-full" />
                                {milestone}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Insights and Recommendations */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <TrendingUp size={20} />
                      Best Performing Path
                    </h4>
                    <div className="space-y-2">
                      {(() => {
                        const bestTimeline = timelines.reduce((best, current) => 
                          current.finalNetWorth > best.finalNetWorth ? current : best
                        );
                        return (
                          <div>
                            <div className="text-white font-semibold">{bestTimeline.name}</div>
                            <div className="text-green-400 text-xl font-bold">
                              {formatCurrency(bestTimeline.finalNetWorth)}
                            </div>
                            <div className="text-white/80 text-sm mt-2">
                              This path maximizes your long-term wealth through strategic decisions and calculated risks.
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
                    <h4 className="text-lg font-semibold text-blue-400 mb-4 flex items-center gap-2">
                      <Star size={20} />
                      Key Insights
                    </h4>
                    <div className="space-y-3 text-white/80 text-sm">
                      <div>• Early career decisions have the biggest long-term impact due to compound interest</div>
                      <div>• Taking calculated risks in your 30s and 40s can significantly boost wealth</div>
                      <div>• Family decisions affect both expenses and life satisfaction</div>
                      <div>• Education investments often pay off through higher earning potential</div>
                    </div>
                  </div>
                </div>

                {/* Action Items */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30">
                  <h4 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                    <Briefcase size={20} />
                    What You Can Do Today
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-white font-medium">Short-term (1-2 years):</div>
                      <div className="space-y-1 text-white/80 text-sm">
                        <div>• Increase your savings rate by 5-10%</div>
                        <div>• Build a 6-month emergency fund</div>
                        <div>• Research higher-yield investment options</div>
                        <div>• Consider skill development for career growth</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-white font-medium">Long-term (5+ years):</div>
                      <div className="space-y-1 text-white/80 text-sm">
                        <div>• Plan for major life events (family, home)</div>
                        <div>• Diversify your investment portfolio</div>
                        <div>• Consider entrepreneurial opportunities</div>
                        <div>• Maximize retirement contributions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
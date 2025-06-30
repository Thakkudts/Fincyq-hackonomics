import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { formatCurrency, calculateTimeline, scenarios } from '../utils/financialCalculations';
import { 
  X, 
  AlertTriangle, 
  Heart, 
  Briefcase, 
  TrendingDown, 
  Wrench, 
  Zap, 
  DollarSign,
  Clock,
  Shield,
  RefreshCw,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';

interface DisasterScenario {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  impact: {
    type: 'expense' | 'income_loss' | 'investment_loss' | 'monthly_increase';
    amount: number;
    duration?: number; // months for income loss or monthly increases
  };
  color: string;
  severity: 'low' | 'medium' | 'high';
}

const disasterScenarios: DisasterScenario[] = [
  {
    id: 'medical',
    name: 'Medical Emergency',
    description: 'Sudden hospital expense requiring immediate payment',
    icon: Heart,
    impact: { type: 'expense', amount: 200000 },
    color: 'bg-red-500',
    severity: 'high'
  },
  {
    id: 'job_loss',
    name: 'Job Loss',
    description: 'Unemployment for 6 months without income',
    icon: Briefcase,
    impact: { type: 'income_loss', amount: 0, duration: 6 },
    color: 'bg-orange-500',
    severity: 'high'
  },
  {
    id: 'market_crash',
    name: 'Market Crash',
    description: 'Investment portfolio drops by 30%',
    icon: TrendingDown,
    impact: { type: 'investment_loss', amount: 0.3 },
    color: 'bg-purple-500',
    severity: 'medium'
  },
  {
    id: 'repair',
    name: 'Unexpected Repair',
    description: 'Major home or car repair needed urgently',
    icon: Wrench,
    impact: { type: 'expense', amount: 50000 },
    color: 'bg-blue-500',
    severity: 'medium'
  },
  {
    id: 'inflation',
    name: 'Inflation Spike',
    description: 'Monthly expenses increase by 25% for 12 months',
    icon: TrendingUp,
    impact: { type: 'monthly_increase', amount: 0.25, duration: 12 },
    color: 'bg-yellow-500',
    severity: 'medium'
  },
  {
    id: 'utility_crisis',
    name: 'Utility Crisis',
    description: 'Sudden utility bills and emergency repairs',
    icon: Zap,
    impact: { type: 'expense', amount: 20000 },
    color: 'bg-green-500',
    severity: 'low'
  }
];

interface DisasterModeProps {
  profile: UserProfile;
  onClose: () => void;
}

export default function DisasterMode({ profile, onClose }: DisasterModeProps) {
  const [selectedDisasters, setSelectedDisasters] = useState<string[]>([]);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const toggleDisaster = (disasterId: string) => {
    setSelectedDisasters(prev => 
      prev.includes(disasterId) 
        ? prev.filter(id => id !== disasterId)
        : [...prev, disasterId]
    );
  };

  const runSimulation = () => {
    if (selectedDisasters.length === 0) return;

    setIsSimulating(true);
    
    // Simulate delay for dramatic effect
    setTimeout(() => {
      const results = calculateDisasterImpact(profile, selectedDisasters);
      setSimulationResults(results);
      setIsSimulating(false);
    }, 1500);
  };

  const calculateDisasterImpact = (userProfile: UserProfile, disasterIds: string[]) => {
    const selectedScenarios = disasterScenarios.filter(d => disasterIds.includes(d.id));
    
    // Create modified profile with disaster impacts
    let modifiedProfile = { ...userProfile };
    let totalImmediateExpense = 0;
    let investmentLoss = 0;
    let monthsWithoutIncome = 0;
    let monthlyExpenseIncrease = 0;
    let expenseIncreaseDuration = 0;

    selectedScenarios.forEach(disaster => {
      switch (disaster.impact.type) {
        case 'expense':
          totalImmediateExpense += disaster.impact.amount;
          break;
        case 'income_loss':
          monthsWithoutIncome = Math.max(monthsWithoutIncome, disaster.impact.duration || 0);
          break;
        case 'investment_loss':
          investmentLoss = Math.max(investmentLoss, disaster.impact.amount);
          break;
        case 'monthly_increase':
          monthlyExpenseIncrease = Math.max(monthlyExpenseIncrease, disaster.impact.amount);
          expenseIncreaseDuration = Math.max(expenseIncreaseDuration, disaster.impact.duration || 0);
          break;
      }
    });

    // Apply immediate impacts
    modifiedProfile.currentSavings = Math.max(0, modifiedProfile.currentSavings - totalImmediateExpense);
    
    // Calculate original timeline
    const originalTimeline = calculateTimeline(userProfile, scenarios[0], 20);
    
    // Calculate disaster timeline with modifications
    const disasterTimeline = calculateDisasterTimeline(
      modifiedProfile, 
      scenarios[0], 
      20,
      {
        investmentLoss,
        monthsWithoutIncome,
        monthlyExpenseIncrease,
        expenseIncreaseDuration
      }
    );

    // Calculate recovery metrics
    const recoveryAnalysis = calculateRecoveryTime(originalTimeline, disasterTimeline, userProfile);

    return {
      originalTimeline,
      disasterTimeline,
      selectedScenarios,
      impacts: {
        totalImmediateExpense,
        investmentLoss,
        monthsWithoutIncome,
        monthlyExpenseIncrease,
        expenseIncreaseDuration
      },
      recovery: recoveryAnalysis,
      emergencyFundStatus: analyzeEmergencyFund(userProfile, totalImmediateExpense)
    };
  };

  const calculateDisasterTimeline = (profile: UserProfile, scenario: any, years: number, disasters: any) => {
    const results = [];
    let currentSavings = profile.currentSavings;
    let investmentValue = 0;
    let monthlyIncome = profile.income / 12;
    let monthlyExpenses = profile.monthlyExpenses;
    
    // Apply investment loss immediately
    if (disasters.investmentLoss > 0) {
      investmentValue *= (1 - disasters.investmentLoss);
    }

    for (let year = 0; year <= years; year++) {
      for (let month = 0; month < 12; month++) {
        const totalMonths = year * 12 + month;
        
        // Apply income loss
        const currentIncome = totalMonths < disasters.monthsWithoutIncome ? 0 : monthlyIncome;
        
        // Apply expense increase
        const currentExpenses = totalMonths < disasters.expenseIncreaseDuration 
          ? monthlyExpenses * (1 + disasters.monthlyExpenseIncrease)
          : monthlyExpenses;
        
        // Monthly calculations
        const monthlySavings = currentIncome - currentExpenses;
        currentSavings += monthlySavings;
        
        // Investment growth (monthly)
        if (investmentValue > 0) {
          investmentValue *= (1 + scenario.investmentReturn / 12);
        }
        
        // Add to investments if positive savings
        if (monthlySavings > 0) {
          investmentValue += monthlySavings * 0.8;
          currentSavings += monthlySavings * 0.2;
        }
      }
      
      results.push({
        year: new Date().getFullYear() + year,
        age: profile.age + year,
        totalSavings: Math.max(0, currentSavings),
        investmentValue: Math.max(0, investmentValue),
        netWorth: Math.max(0, currentSavings + investmentValue),
        goalsAchieved: [],
        events: []
      });
    }
    
    return results;
  };

  const calculateRecoveryTime = (original: any[], disaster: any[], profile: UserProfile) => {
    const originalNetWorth = original[5]?.netWorth || 0; // 5 years out
    
    for (let i = 0; i < disaster.length; i++) {
      if (disaster[i].netWorth >= originalNetWorth) {
        return {
          recoveryYears: i,
          canRecover: true,
          originalNetWorth,
          finalNetWorth: disaster[disaster.length - 1]?.netWorth || 0
        };
      }
    }
    
    return {
      recoveryYears: -1,
      canRecover: false,
      originalNetWorth,
      finalNetWorth: disaster[disaster.length - 1]?.netWorth || 0
    };
  };

  const analyzeEmergencyFund = (profile: UserProfile, immediateExpense: number) => {
    const recommendedFund = profile.monthlyExpenses * 6;
    const currentFund = profile.currentSavings;
    const shortfall = Math.max(0, immediateExpense - currentFund);
    
    return {
      recommended: recommendedFund,
      current: currentFund,
      sufficient: currentFund >= immediateExpense,
      shortfall,
      coverage: currentFund / recommendedFund
    };
  };

  const resetSimulation = () => {
    setSelectedDisasters([]);
    setSimulationResults(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                Disaster Mode Simulation
              </h2>
              <p className="text-white/60 mt-1">Test your financial resilience against unexpected events</p>
            </div>
            
            <div className="flex items-center gap-3">
              {simulationResults && (
                <button
                  onClick={resetSimulation}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Reset
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
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(95vh-140px)] overflow-y-auto">
          {!simulationResults ? (
            <div className="space-y-8">
              {/* Scenario Selection */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" />
                  Choose Your Disasters
                </h3>
                <p className="text-white/60 mb-6">Select one or more scenarios to simulate their impact on your finances</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {disasterScenarios.map((disaster) => (
                    <button
                      key={disaster.id}
                      onClick={() => toggleDisaster(disaster.id)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        selectedDisasters.includes(disaster.id)
                          ? 'border-red-400 bg-red-400/20 scale-105 shadow-lg shadow-red-500/25'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${disaster.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <disaster.icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">{disaster.name}</div>
                          <div className="text-white/60 text-sm mb-2">{disaster.description}</div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              disaster.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              disaster.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {disaster.severity.toUpperCase()}
                            </span>
                            <span className="text-white/60 text-xs">
                              {disaster.impact.type === 'expense' && formatCurrency(disaster.impact.amount)}
                              {disaster.impact.type === 'income_loss' && `${disaster.impact.duration} months`}
                              {disaster.impact.type === 'investment_loss' && `${(disaster.impact.amount * 100).toFixed(0)}% loss`}
                              {disaster.impact.type === 'monthly_increase' && `+${(disaster.impact.amount * 100).toFixed(0)}%`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulation Button */}
              {selectedDisasters.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={runSimulation}
                    disabled={isSimulating}
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-3 mx-auto text-lg shadow-xl"
                  >
                    {isSimulating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Simulating Disaster Impact...
                      </>
                    ) : (
                      <>
                        <BarChart3 size={20} />
                        Run Disaster Simulation
                      </>
                    )}
                  </button>
                  
                  <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-red-400 text-sm">
                      ⚠️ Selected {selectedDisasters.length} disaster scenario{selectedDisasters.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Impact Summary */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-400/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-red-400" />
                  Disaster Impact Analysis
                </h3>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {simulationResults.impacts.totalImmediateExpense > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/60 text-sm">Immediate Expense</div>
                      <div className="text-xl font-bold text-red-400">
                        {formatCurrency(simulationResults.impacts.totalImmediateExpense)}
                      </div>
                    </div>
                  )}
                  
                  {simulationResults.impacts.investmentLoss > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/60 text-sm">Investment Loss</div>
                      <div className="text-xl font-bold text-purple-400">
                        {(simulationResults.impacts.investmentLoss * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                  
                  {simulationResults.impacts.monthsWithoutIncome > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/60 text-sm">Income Loss</div>
                      <div className="text-xl font-bold text-orange-400">
                        {simulationResults.impacts.monthsWithoutIncome} months
                      </div>
                    </div>
                  )}
                  
                  {simulationResults.impacts.monthlyExpenseIncrease > 0 && (
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="text-white/60 text-sm">Expense Increase</div>
                      <div className="text-xl font-bold text-yellow-400">
                        +{(simulationResults.impacts.monthlyExpenseIncrease * 100).toFixed(0)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Fund Analysis */}
              <div className={`rounded-xl p-6 border ${
                simulationResults.emergencyFundStatus.sufficient 
                  ? 'bg-green-500/20 border-green-400/30' 
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className={simulationResults.emergencyFundStatus.sufficient ? 'text-green-400' : 'text-red-400'} />
                  Emergency Fund Status
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-white/60 text-sm">Current Emergency Fund</div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(simulationResults.emergencyFundStatus.current)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Recommended (6 months)</div>
                    <div className="text-lg font-bold text-blue-400">
                      {formatCurrency(simulationResults.emergencyFundStatus.recommended)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Coverage</div>
                    <div className={`text-lg font-bold ${
                      simulationResults.emergencyFundStatus.coverage >= 1 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {(simulationResults.emergencyFundStatus.coverage * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
                
                {!simulationResults.emergencyFundStatus.sufficient && (
                  <div className="mt-4 p-4 bg-red-500/20 rounded-lg border border-red-400/30">
                    <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                      <XCircle size={16} />
                      Emergency Fund Insufficient
                    </div>
                    <p className="text-white/80 text-sm">
                      You're short {formatCurrency(simulationResults.emergencyFundStatus.shortfall)} to cover these disasters. 
                      Having 6 months of expenses saved ({formatCurrency(simulationResults.emergencyFundStatus.recommended)}) 
                      would have protected you from going into debt.
                    </p>
                  </div>
                )}
              </div>

              {/* Recovery Analysis */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="text-blue-400" />
                  Recovery Timeline
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-white/60 text-sm mb-2">Time to Recover</div>
                    {simulationResults.recovery.canRecover ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-400" size={20} />
                        <span className="text-lg font-bold text-green-400">
                          {simulationResults.recovery.recoveryYears} years
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <XCircle className="text-red-400" size={20} />
                        <span className="text-lg font-bold text-red-400">
                          May not fully recover
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm mb-2">Net Worth Impact</div>
                    <div className="text-lg font-bold text-white">
                      {formatCurrency(simulationResults.recovery.originalNetWorth)} → {formatCurrency(simulationResults.recovery.finalNetWorth)}
                    </div>
                    <div className={`text-sm ${
                      simulationResults.recovery.finalNetWorth >= simulationResults.recovery.originalNetWorth 
                        ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {simulationResults.recovery.finalNetWorth >= simulationResults.recovery.originalNetWorth ? '+' : ''}
                      {formatCurrency(simulationResults.recovery.finalNetWorth - simulationResults.recovery.originalNetWorth)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Comparison Chart */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="text-purple-400" />
                  Financial Timeline Comparison
                </h3>
                
                <div className="relative h-64 bg-white/5 rounded-xl p-4">
                  <svg width="100%" height="100%" className="overflow-visible">
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                      <line
                        key={ratio}
                        x1="0"
                        y1={`${ratio * 100}%`}
                        x2="100%"
                        y2={`${ratio * 100}%`}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                      />
                    ))}
                    
                    {/* Timeline paths */}
                    {[
                      { data: simulationResults.originalTimeline, color: '#10B981', label: 'Original Plan' },
                      { data: simulationResults.disasterTimeline, color: '#EF4444', label: 'With Disasters' }
                    ].map((timeline, index) => {
                      const maxNetWorth = Math.max(
                        ...simulationResults.originalTimeline.map((p: any) => p.netWorth),
                        ...simulationResults.disasterTimeline.map((p: any) => p.netWorth)
                      );
                      
                      const points = timeline.data.map((point: any, i: number) => {
                        const x = (i / (timeline.data.length - 1)) * 100;
                        const y = 100 - (point.netWorth / maxNetWorth) * 100;
                        return `${x},${y}`;
                      }).join(' ');
                      
                      return (
                        <polyline
                          key={timeline.label}
                          points={points}
                          fill="none"
                          stroke={timeline.color}
                          strokeWidth="3"
                          opacity={0.8}
                          className="transition-all duration-300"
                        />
                      );
                    })}
                  </svg>
                  
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-white/60 text-xs">
                    {[1, 0.75, 0.5, 0.25, 0].map((ratio) => {
                      const maxNetWorth = Math.max(
                        ...simulationResults.originalTimeline.map((p: any) => p.netWorth),
                        ...simulationResults.disasterTimeline.map((p: any) => p.netWorth)
                      );
                      return (
                        <span key={ratio}>
                          {formatCurrency(maxNetWorth * ratio)}
                        </span>
                      );
                    })}
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-white/80">Original Plan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-white/80">With Disasters</span>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="text-blue-400" />
                  Recommendations
                </h3>
                
                <div className="space-y-3">
                  {simulationResults.emergencyFundStatus.coverage < 1 && (
                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                      <DollarSign className="text-green-400 flex-shrink-0 mt-0.5" size={16} />
                      <div>
                        <div className="text-white font-medium">Build Emergency Fund</div>
                        <div className="text-white/60 text-sm">
                          Increase your emergency fund to {formatCurrency(simulationResults.emergencyFundStatus.recommended)} 
                          (6 months of expenses) to better handle unexpected costs.
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <Shield className="text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <div className="text-white font-medium">Consider Insurance</div>
                      <div className="text-white/60 text-sm">
                        Health, disability, and property insurance can protect against major financial disasters.
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <TrendingUp className="text-purple-400 flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <div className="text-white font-medium">Diversify Investments</div>
                      <div className="text-white/60 text-sm">
                        Spread investments across different asset classes to reduce impact of market crashes.
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
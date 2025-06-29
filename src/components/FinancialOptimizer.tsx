import React, { useState, useEffect } from 'react';
import { UserProfile, FinancialGoal } from '../types';
import { formatCurrency, calculateGoalFeasibility } from '../utils/financialCalculations';
import { 
  X, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  PieChart,
  Clock,
  ArrowRight,
  Scissors,
  Plus,
  Minus,
  BarChart3,
  Star,
  RefreshCw
} from 'lucide-react';

interface OptimizationSuggestion {
  id: string;
  type: 'expense_reduction' | 'goal_adjustment' | 'savings_increase' | 'investment_reallocation';
  title: string;
  description: string;
  impact: {
    monthlySavings?: number;
    goalDelay?: { goalId: string; months: number };
    newSavingsRate?: number;
  };
  priority: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'moderate' | 'hard';
  category: string;
}

interface FinancialOptimizerProps {
  profile: UserProfile;
  onClose: () => void;
  onApplyOptimization?: (suggestions: OptimizationSuggestion[]) => void;
}

export default function FinancialOptimizer({ profile, onClose, onApplyOptimization }: FinancialOptimizerProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'suggestions' | 'scenarios'>('analysis');
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    analyzeProfile();
  }, [profile]);

  const analyzeProfile = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedSuggestions = generateOptimizationSuggestions(profile);
    setSuggestions(generatedSuggestions);
    setIsAnalyzing(false);
  };

  const generateOptimizationSuggestions = (userProfile: UserProfile): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = [];
    const savingsRate = (userProfile.monthlySavings * 12) / userProfile.income;
    const emergencyMonths = userProfile.currentSavings / userProfile.monthlyExpenses;

    // Expense reduction suggestions
    if (userProfile.monthlyExpenses > userProfile.income * 0.7) {
      suggestions.push({
        id: 'reduce-dining',
        type: 'expense_reduction',
        title: 'Optimize Dining & Entertainment',
        description: 'Reduce dining out and entertainment expenses by 25%. Cook more meals at home and find free/low-cost entertainment options.',
        impact: { monthlySavings: Math.round(userProfile.monthlyExpenses * 0.15 * 0.25) },
        priority: 'high',
        difficulty: 'easy',
        category: 'Lifestyle'
      });

      suggestions.push({
        id: 'subscription-audit',
        type: 'expense_reduction',
        title: 'Cancel Unused Subscriptions',
        description: 'Review and cancel unused streaming services, gym memberships, and app subscriptions. Keep only what you actively use.',
        impact: { monthlySavings: Math.round(userProfile.monthlyExpenses * 0.05) },
        priority: 'high',
        difficulty: 'easy',
        category: 'Subscriptions'
      });

      suggestions.push({
        id: 'transportation-optimize',
        type: 'expense_reduction',
        title: 'Optimize Transportation Costs',
        description: 'Use public transport, carpooling, or bike for short distances. Consider fuel-efficient routes and maintenance.',
        impact: { monthlySavings: Math.round(userProfile.monthlyExpenses * 0.1) },
        priority: 'medium',
        difficulty: 'moderate',
        category: 'Transportation'
      });
    }

    // Savings rate improvement
    if (savingsRate < 0.2) {
      const targetIncrease = Math.round((0.2 - savingsRate) * userProfile.income / 12);
      suggestions.push({
        id: 'increase-savings-rate',
        type: 'savings_increase',
        title: 'Boost Savings Rate to 20%',
        description: `Increase monthly savings by ₹${targetIncrease.toLocaleString()} to reach the recommended 20% savings rate.`,
        impact: { 
          monthlySavings: targetIncrease,
          newSavingsRate: 0.2 
        },
        priority: 'high',
        difficulty: 'moderate',
        category: 'Savings Strategy'
      });
    }

    // Goal adjustment suggestions
    userProfile.goals.forEach(goal => {
      const feasibility = calculateGoalFeasibility(userProfile, goal);
      
      if (!feasibility.feasible && feasibility.shortfall > userProfile.monthlySavings * 0.5) {
        const delayMonths = Math.ceil(feasibility.shortfall / (userProfile.monthlySavings * 0.1)) * 6;
        const delayYears = Math.floor(delayMonths / 12);
        const remainingMonths = delayMonths % 12;
        
        suggestions.push({
          id: `delay-goal-${goal.id}`,
          type: 'goal_adjustment',
          title: `Adjust Timeline for "${goal.name}"`,
          description: `Delay this goal by ${delayYears > 0 ? `${delayYears} year${delayYears > 1 ? 's' : ''}` : ''}${delayYears > 0 && remainingMonths > 0 ? ' and ' : ''}${remainingMonths > 0 ? `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}` : ''} to reduce monthly financial strain by ₹${Math.round(feasibility.shortfall * 0.7).toLocaleString()}.`,
          impact: { 
            goalDelay: { goalId: goal.id, months: delayMonths },
            monthlySavings: Math.round(feasibility.shortfall * 0.7)
          },
          priority: 'medium',
          difficulty: 'easy',
          category: 'Goal Planning'
        });
      }
    });

    // Emergency fund priority
    if (emergencyMonths < 3) {
      suggestions.push({
        id: 'emergency-fund-priority',
        type: 'investment_reallocation',
        title: 'Prioritize Emergency Fund',
        description: 'Temporarily reduce investment allocation to build emergency fund faster. Aim for 6 months of expenses before aggressive investing.',
        impact: { monthlySavings: Math.round(userProfile.monthlySavings * 0.3) },
        priority: 'high',
        difficulty: 'easy',
        category: 'Risk Management'
      });
    }

    // Income optimization
    if (userProfile.age < 35) {
      suggestions.push({
        id: 'skill-development',
        type: 'savings_increase',
        title: 'Invest in Skill Development',
        description: 'Allocate ₹2,000/month for courses, certifications, or skills that can increase your income by 15-25% within 1-2 years.',
        impact: { monthlySavings: -2000 }, // Short-term cost for long-term gain
        priority: 'medium',
        difficulty: 'moderate',
        category: 'Career Growth'
      });
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const calculateOptimizedProfile = () => {
    let optimizedProfile = { ...profile };
    let totalMonthlySavings = 0;
    let adjustedGoals = [...profile.goals];

    selectedSuggestions.forEach(suggestionId => {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (!suggestion) return;

      if (suggestion.impact.monthlySavings) {
        totalMonthlySavings += suggestion.impact.monthlySavings;
      }

      if (suggestion.impact.goalDelay) {
        const goalIndex = adjustedGoals.findIndex(g => g.id === suggestion.impact.goalDelay!.goalId);
        if (goalIndex !== -1) {
          adjustedGoals[goalIndex] = {
            ...adjustedGoals[goalIndex],
            targetYear: adjustedGoals[goalIndex].targetYear + Math.ceil(suggestion.impact.goalDelay!.months / 12)
          };
        }
      }
    });

    optimizedProfile.monthlySavings += totalMonthlySavings;
    optimizedProfile.monthlyExpenses -= Math.max(0, totalMonthlySavings);
    optimizedProfile.goals = adjustedGoals;

    return optimizedProfile;
  };

  const currentSavingsRate = (profile.monthlySavings * 12) / profile.income * 100;
  const optimizedProfile = calculateOptimizedProfile();
  const optimizedSavingsRate = (optimizedProfile.monthlySavings * 12) / optimizedProfile.income * 100;
  const totalMonthlySavings = selectedSuggestions.reduce((total, id) => {
    const suggestion = suggestions.find(s => s.id === id);
    return total + (suggestion?.impact.monthlySavings || 0);
  }, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <Zap size={20} className="text-white" />
                </div>
                Financial Plan Optimizer
              </h2>
              <p className="text-white/60 mt-1">AI-powered analysis and personalized recommendations</p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Current Savings Rate</div>
              <div className={`text-2xl font-bold ${currentSavingsRate >= 20 ? 'text-green-400' : currentSavingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                {currentSavingsRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Emergency Fund</div>
              <div className={`text-2xl font-bold ${profile.currentSavings >= profile.monthlyExpenses * 6 ? 'text-green-400' : 'text-orange-400'}`}>
                {(profile.currentSavings / profile.monthlyExpenses).toFixed(1)}mo
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Active Goals</div>
              <div className="text-2xl font-bold text-blue-400">{profile.goals.length}</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Optimization Potential</div>
              <div className="text-2xl font-bold text-purple-400">
                +{formatCurrency(totalMonthlySavings)}/mo
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {[
            { id: 'analysis', label: 'Financial Analysis', icon: BarChart3 },
            { id: 'suggestions', label: 'Optimization Plan', icon: Lightbulb },
            { id: 'scenarios', label: 'Impact Scenarios', icon: TrendingUp }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border-b-2 border-purple-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeTab === 'analysis' && (
              <div className="space-y-8">
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 border-4 border-white/30 border-t-purple-400 rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-semibold text-white mb-2">Analyzing Your Financial Profile</h3>
                    <p className="text-white/60">Crunching numbers and identifying optimization opportunities...</p>
                  </div>
                ) : (
                  <>
                    {/* Financial Health Score */}
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Star className="text-yellow-400" />
                        Financial Health Score
                      </h3>
                      
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-yellow-400 mb-2">
                            {Math.round((currentSavingsRate / 20 * 40) + (Math.min(profile.currentSavings / (profile.monthlyExpenses * 6), 1) * 30) + (profile.goals.length > 0 ? 30 : 0))}
                          </div>
                          <div className="text-white/60">Overall Score</div>
                          <div className="text-white/80 text-sm mt-1">
                            {Math.round((currentSavingsRate / 20 * 40) + (Math.min(profile.currentSavings / (profile.monthlyExpenses * 6), 1) * 30) + (profile.goals.length > 0 ? 30 : 0)) >= 80 ? 'Excellent' :
                             Math.round((currentSavingsRate / 20 * 40) + (Math.min(profile.currentSavings / (profile.monthlyExpenses * 6), 1) * 30) + (profile.goals.length > 0 ? 30 : 0)) >= 60 ? 'Good' :
                             Math.round((currentSavingsRate / 20 * 40) + (Math.min(profile.currentSavings / (profile.monthlyExpenses * 6), 1) * 30) + (profile.goals.length > 0 ? 30 : 0)) >= 40 ? 'Fair' : 'Needs Work'}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-white/80 text-sm mb-3">Score Breakdown:</div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Savings Rate</span>
                              <span className="text-white">{Math.round(currentSavingsRate / 20 * 40)}/40</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Emergency Fund</span>
                              <span className="text-white">{Math.round(Math.min(profile.currentSavings / (profile.monthlyExpenses * 6), 1) * 30)}/30</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Goal Planning</span>
                              <span className="text-white">{profile.goals.length > 0 ? 30 : 0}/30</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-white/80 text-sm mb-3">Key Metrics:</div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              {currentSavingsRate >= 20 ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-orange-400" />}
                              <span className="text-white/80">Savings Rate: {currentSavingsRate.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {profile.currentSavings >= profile.monthlyExpenses * 6 ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-orange-400" />}
                              <span className="text-white/80">Emergency Fund: {(profile.currentSavings / profile.monthlyExpenses).toFixed(1)}mo</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {profile.goals.length >= 3 ? <CheckCircle size={14} className="text-green-400" /> : <AlertTriangle size={14} className="text-orange-400" />}
                              <span className="text-white/80">Financial Goals: {profile.goals.length}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expense Breakdown Analysis */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <PieChart className="text-blue-400" />
                          Income Allocation
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white/80">Monthly Expenses</span>
                            <span className="text-white font-medium">{formatCurrency(profile.monthlyExpenses)}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div 
                              className="bg-red-500 h-3 rounded-full"
                              style={{ width: `${(profile.monthlyExpenses / (profile.income / 12)) * 100}%` }}
                            />
                          </div>
                          <div className="text-white/60 text-sm">{((profile.monthlyExpenses / (profile.income / 12)) * 100).toFixed(1)}% of income</div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-white/80">Monthly Savings</span>
                            <span className="text-white font-medium">{formatCurrency(profile.monthlySavings)}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full"
                              style={{ width: `${(profile.monthlySavings / (profile.income / 12)) * 100}%` }}
                            />
                          </div>
                          <div className="text-white/60 text-sm">{((profile.monthlySavings / (profile.income / 12)) * 100).toFixed(1)}% of income</div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Target className="text-green-400" />
                          Goal Feasibility
                        </h4>
                        
                        <div className="space-y-3">
                          {profile.goals.length === 0 ? (
                            <p className="text-white/60 text-sm">No financial goals set. Consider adding some goals to track your progress.</p>
                          ) : (
                            profile.goals.slice(0, 3).map(goal => {
                              const feasibility = calculateGoalFeasibility(profile, goal);
                              return (
                                <div key={goal.id} className="bg-white/5 rounded-lg p-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-medium text-sm">{goal.name}</span>
                                    {feasibility.feasible ? 
                                      <CheckCircle size={16} className="text-green-400" /> : 
                                      <AlertTriangle size={16} className="text-orange-400" />
                                    }
                                  </div>
                                  <div className="text-white/60 text-xs">
                                    Target: {formatCurrency(goal.targetAmount)} by {goal.targetYear}
                                  </div>
                                  <div className="text-white/60 text-xs">
                                    Required: {formatCurrency(feasibility.monthlyRequired)}/month
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white">Optimization Recommendations</h3>
                  <div className="text-white/60 text-sm">
                    {selectedSuggestions.length} of {suggestions.length} selected
                  </div>
                </div>

                <div className="space-y-4">
                  {suggestions.map((suggestion) => {
                    const isSelected = selectedSuggestions.includes(suggestion.id);
                    
                    return (
                      <div 
                        key={suggestion.id}
                        className={`bg-white/5 rounded-xl p-6 border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-purple-400/50 bg-purple-400/10' 
                            : 'border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                        onClick={() => toggleSuggestion(suggestion.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {suggestion.type === 'expense_reduction' ? <Scissors size={16} /> :
                                 suggestion.type === 'goal_adjustment' ? <Calendar size={16} /> :
                                 suggestion.type === 'savings_increase' ? <TrendingUp size={16} /> :
                                 <RefreshCw size={16} />}
                              </div>
                              
                              <div>
                                <h4 className="text-white font-semibold">{suggestion.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                    suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {suggestion.priority.toUpperCase()}
                                  </span>
                                  <span className="text-white/60 text-xs">{suggestion.category}</span>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    suggestion.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                                    suggestion.difficulty === 'moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-red-500/20 text-red-400'
                                  }`}>
                                    {suggestion.difficulty}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-white/80 text-sm mb-3">{suggestion.description}</p>
                            
                            <div className="flex items-center gap-4">
                              {suggestion.impact.monthlySavings && (
                                <div className="flex items-center gap-2">
                                  <DollarSign size={16} className="text-green-400" />
                                  <span className="text-green-400 font-medium">
                                    {suggestion.impact.monthlySavings > 0 ? '+' : ''}{formatCurrency(suggestion.impact.monthlySavings)}/month
                                  </span>
                                </div>
                              )}
                              
                              {suggestion.impact.goalDelay && (
                                <div className="flex items-center gap-2">
                                  <Clock size={16} className="text-orange-400" />
                                  <span className="text-orange-400 font-medium">
                                    +{Math.ceil(suggestion.impact.goalDelay.months / 12)} year delay
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'border-purple-400 bg-purple-400' 
                              : 'border-white/30'
                          }`}>
                            {isSelected && <CheckCircle size={16} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'scenarios' && (
              <div className="space-y-8">
                <h3 className="text-xl font-semibold text-white">Impact Analysis</h3>
                
                {/* Before vs After Comparison */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="text-red-400" />
                      Current Financial State
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/80">Monthly Savings</span>
                        <span className="text-white font-medium">{formatCurrency(profile.monthlySavings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Savings Rate</span>
                        <span className="text-white font-medium">{currentSavingsRate.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Monthly Expenses</span>
                        <span className="text-white font-medium">{formatCurrency(profile.monthlyExpenses)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Achievable Goals</span>
                        <span className="text-white font-medium">
                          {profile.goals.filter(g => calculateGoalFeasibility(profile, g).feasible).length}/{profile.goals.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <BarChart3 className="text-green-400" />
                      Optimized Financial State
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-white/80">Monthly Savings</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{formatCurrency(optimizedProfile.monthlySavings)}</span>
                          {totalMonthlySavings > 0 && (
                            <span className="text-green-400 text-sm">+{formatCurrency(totalMonthlySavings)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Savings Rate</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{optimizedSavingsRate.toFixed(1)}%</span>
                          {optimizedSavingsRate > currentSavingsRate && (
                            <span className="text-green-400 text-sm">+{(optimizedSavingsRate - currentSavingsRate).toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Monthly Expenses</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{formatCurrency(optimizedProfile.monthlyExpenses)}</span>
                          {optimizedProfile.monthlyExpenses < profile.monthlyExpenses && (
                            <span className="text-green-400 text-sm">-{formatCurrency(profile.monthlyExpenses - optimizedProfile.monthlyExpenses)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Achievable Goals</span>
                        <span className="text-white font-medium">
                          {optimizedProfile.goals.filter(g => calculateGoalFeasibility(optimizedProfile, g).feasible).length}/{optimizedProfile.goals.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10-Year Projection */}
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-400/30">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-green-400" />
                    10-Year Wealth Projection
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-white/80 mb-2">Current Path</div>
                      <div className="text-2xl font-bold text-white mb-1">
                        {formatCurrency((profile.monthlySavings * 12 * ((Math.pow(1.08, 10) - 1) / 0.08)))}
                      </div>
                      <div className="text-white/60 text-sm">With 8% annual returns</div>
                    </div>
                    
                    <div>
                      <div className="text-white/80 mb-2">Optimized Path</div>
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {formatCurrency((optimizedProfile.monthlySavings * 12 * ((Math.pow(1.08, 10) - 1) / 0.08)))}
                      </div>
                      <div className="text-green-300 text-sm">
                        +{formatCurrency(((optimizedProfile.monthlySavings - profile.monthlySavings) * 12 * ((Math.pow(1.08, 10) - 1) / 0.08)))} more
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="text-white/60 text-sm">
              {selectedSuggestions.length > 0 && (
                <>Selected optimizations will save {formatCurrency(totalMonthlySavings)}/month</>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
              >
                Close
              </button>
              
              {selectedSuggestions.length > 0 && (
                <button
                  onClick={() => {
                    const selectedSuggestionObjects = suggestions.filter(s => selectedSuggestions.includes(s.id));
                    onApplyOptimization?.(selectedSuggestionObjects);
                    onClose();
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                >
                  <Zap size={16} />
                  Apply {selectedSuggestions.length} Optimization{selectedSuggestions.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
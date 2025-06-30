import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { formatCurrency } from '../utils/financialCalculations';
import { 
  X, 
  Shield, 
  Heart, 
  Home, 
  Car, 
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Briefcase,
  Calculator,
  Target,
  Award,
  Bell,
  Brain,
  PieChart,
  BarChart3,
  Info,
  ExternalLink,
  Plus,
  Minus
} from 'lucide-react';

interface FinancialProtectionProps {
  profile: UserProfile;
  onClose: () => void;
}

interface InsuranceRecommendation {
  type: string;
  recommended: boolean;
  coverage: number;
  monthlyCost: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

interface RiskProfile {
  score: number;
  level: 'Conservative' | 'Moderate' | 'Aggressive';
  description: string;
  recommendations: string[];
}

export default function FinancialProtection({ profile, onClose }: FinancialProtectionProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'insurance' | 'emergency' | 'risk'>('overview');
  const [insuranceAnswers, setInsuranceAnswers] = useState({
    dependents: 0,
    employmentStatus: 'employed',
    hasHealthInsurance: false,
    hasLifeInsurance: false,
    hasPropertyInsurance: false,
    monthlyEMI: 0
  });
  const [emergencyTarget, setEmergencyTarget] = useState(profile.monthlyExpenses * 6);
  const [riskAnswers, setRiskAnswers] = useState({
    investmentExperience: 'beginner',
    riskComfort: 3,
    timeHorizon: 'long',
    primaryGoal: 'wealth_building',
    marketReaction: 'hold'
  });
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [compareModal, setCompareModal] = useState<null | { type: string, coverage: number, monthlyCost: number }>(null);

  const { user } = useAuth();

  // Calculate insurance recommendations
  const getInsuranceRecommendations = (): InsuranceRecommendation[] => {
    const recommendations: InsuranceRecommendation[] = [];
    
    // Term Life Insurance
    if (profile.age < 60 && profile.income > 0) {
      const coverage = Math.max(profile.income * 10, 1000000); // 10x annual income or 10L minimum
      recommendations.push({
        type: 'Term Life Insurance',
        recommended: true,
        coverage,
        monthlyCost: Math.round((coverage / 1000000) * 500), // Approx ₹500 per 10L coverage
        priority: insuranceAnswers.dependents > 0 ? 'high' : 'medium',
        reason: insuranceAnswers.dependents > 0 
          ? 'Essential for protecting your dependents financially'
          : 'Important for covering debts and final expenses'
      });
    }

    // Health Insurance
    const healthCoverage = Math.max(500000, profile.income * 0.5); // 5L minimum or 50% of income
    recommendations.push({
      type: 'Health Insurance',
      recommended: !insuranceAnswers.hasHealthInsurance,
      coverage: healthCoverage,
      monthlyCost: Math.round(healthCoverage / 100000 * 800), // Approx ₹800 per 1L coverage
      priority: 'high',
      reason: 'Medical emergencies can drain your savings quickly'
    });

    // Property Insurance
    if (profile.currentSavings > 1000000) { // If significant assets
      recommendations.push({
        type: 'Property Insurance',
        recommended: !insuranceAnswers.hasPropertyInsurance,
        coverage: Math.min(profile.currentSavings, 2000000),
        monthlyCost: 1500,
        priority: 'medium',
        reason: 'Protect your valuable assets from damage or theft'
      });
    }

    return recommendations;
  };

  // Calculate risk profile
  const calculateRiskProfile = (): RiskProfile => {
    let score = 0;
    
    // Age factor (younger = higher risk tolerance)
    if (profile.age < 30) score += 3;
    else if (profile.age < 45) score += 2;
    else if (profile.age < 60) score += 1;
    
    // Investment experience
    if (riskAnswers.investmentExperience === 'expert') score += 3;
    else if (riskAnswers.investmentExperience === 'intermediate') score += 2;
    else if (riskAnswers.investmentExperience === 'beginner') score += 1;
    
    // Risk comfort (1-5 scale)
    score += riskAnswers.riskComfort;
    
    // Time horizon
    if (riskAnswers.timeHorizon === 'long') score += 3;
    else if (riskAnswers.timeHorizon === 'medium') score += 2;
    else score += 1;
    
    // Market reaction
    if (riskAnswers.marketReaction === 'buy_more') score += 3;
    else if (riskAnswers.marketReaction === 'hold') score += 2;
    else score += 1;

    // Determine risk level
    let level: 'Conservative' | 'Moderate' | 'Aggressive';
    let description: string;
    let recommendations: string[];

    if (score <= 8) {
      level = 'Conservative';
      description = 'You prefer stability and capital preservation over high returns';
      recommendations = [
        'Focus on fixed deposits and government bonds',
        'Keep 80% in safe investments, 20% in equity',
        'Build a larger emergency fund (8-12 months)',
        'Consider guaranteed return products'
      ];
    } else if (score <= 12) {
      level = 'Moderate';
      description = 'You seek balanced growth with manageable risk';
      recommendations = [
        'Balanced portfolio: 60% equity, 40% debt',
        'Diversify across large-cap and mid-cap funds',
        'Maintain 6-month emergency fund',
        'Regular SIP investments for rupee cost averaging'
      ];
    } else {
      level = 'Aggressive';
      description = 'You can handle volatility for potentially higher returns';
      recommendations = [
        'Equity-heavy portfolio: 80% equity, 20% debt',
        'Include small-cap and international funds',
        'Maintain 3-6 month emergency fund',
        'Consider direct equity investments'
      ];
    }

    return { score, level, description, recommendations };
  };

  useEffect(() => {
    setRiskProfile(calculateRiskProfile());
  }, [riskAnswers, profile]);

  const emergencyFundProgress = (profile.currentSavings / emergencyTarget) * 100;
  const insuranceRecommendations = getInsuranceRecommendations();
  const totalInsuranceCost = insuranceRecommendations
    .filter(r => r.recommended)
    .reduce((sum, r) => sum + r.monthlyCost, 0);

  // Protection Score Calculation
  const calculateProtectionScore = () => {
    let score = 0;
    let maxScore = 100;

    // Emergency Fund (40 points)
    score += Math.min(emergencyFundProgress, 100) * 0.4;

    // Insurance Coverage (40 points)
    const hasEssentialInsurance = insuranceAnswers.hasHealthInsurance && 
      (insuranceAnswers.hasLifeInsurance || insuranceAnswers.dependents === 0);
    if (hasEssentialInsurance) score += 40;
    else if (insuranceAnswers.hasHealthInsurance) score += 20;

    // Risk Management (20 points)
    if (riskProfile) {
      if (riskProfile.level === 'Moderate') score += 20;
      else if (riskProfile.level === 'Conservative' || riskProfile.level === 'Aggressive') score += 15;
    }

    return Math.round(score);
  };

  const protectionScore = calculateProtectionScore();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col border border-white/20">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                Financial Protection Center
              </h2>
              <p className="text-white/60 mt-1">Secure your financial future with smart protection strategies</p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Protection Score Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Protection Score</div>
              <div className={`text-2xl font-bold ${
                protectionScore >= 80 ? 'text-green-400' : 
                protectionScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {protectionScore}/100
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Award className={`${protectionScore >= 80 ? 'text-yellow-400' : 'text-white/40'}`} size={16} />
                <span className="text-white/60 text-sm">
                  {protectionScore >= 80 ? 'Expert' : protectionScore >= 60 ? 'Good' : 'Needs Work'}
                </span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Emergency Fund</div>
              <div className={`text-lg font-bold ${emergencyFundProgress >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                {emergencyFundProgress.toFixed(0)}%
              </div>
              <div className="text-white/60 text-sm">
                {formatCurrency(profile.currentSavings)} of {formatCurrency(emergencyTarget)}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Insurance Status</div>
              <div className={`text-lg font-bold ${
                insuranceAnswers.hasHealthInsurance && insuranceAnswers.hasLifeInsurance ? 'text-green-400' : 'text-red-400'
              }`}>
                {insuranceAnswers.hasHealthInsurance && insuranceAnswers.hasLifeInsurance ? 'Protected' : 'At Risk'}
              </div>
              <div className="text-white/60 text-sm">
                {totalInsuranceCost > 0 ? `${formatCurrency(totalInsuranceCost)}/mo needed` : 'Review required'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Risk Profile</div>
              <div className={`text-lg font-bold ${
                riskProfile?.level === 'Moderate' ? 'text-green-400' : 
                riskProfile?.level === 'Conservative' ? 'text-blue-400' : 'text-orange-400'
              }`}>
                {riskProfile?.level || 'Unknown'}
              </div>
              <div className="text-white/60 text-sm">Score: {riskProfile?.score || 0}/15</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Fixed */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {[
            { id: 'overview', label: 'Overview', icon: Shield },
            { id: 'insurance', label: 'Insurance Advice', icon: Heart },
            { id: 'emergency', label: 'Emergency Fund', icon: DollarSign },
            { id: 'risk', label: 'Risk Assessment', icon: BarChart3 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeSection === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Quick Action Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={() => setActiveSection('insurance')}
                    className="p-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-400/30 hover:border-red-400/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                        <Heart size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                          Insurance Advice
                        </h3>
                        <p className="text-white/60 text-sm">Get personalized recommendations</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-white/80">
                      <div>• Life & Health Insurance</div>
                      <div>• Coverage Amount Calculator</div>
                      <div>• Provider Comparisons</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveSection('emergency')}
                    className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30 hover:border-green-400/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                        <DollarSign size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-green-400 transition-colors">
                          Emergency Fund
                        </h3>
                        <p className="text-white/60 text-sm">Build your safety net</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-white/80">
                      <div>• 3-6 Month Expense Calculator</div>
                      <div>• Automated Savings Tips</div>
                      <div>• Progress Tracking</div>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveSection('risk')}
                    className="p-6 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30 hover:border-purple-400/50 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                        <BarChart3 size={24} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                          Risk Assessment
                        </h3>
                        <p className="text-white/60 text-sm">Understand your risk profile</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-white/80">
                      <div>• Risk Tolerance Quiz</div>
                      <div>• Investment Recommendations</div>
                      <div>• Portfolio Allocation</div>
                    </div>
                  </button>
                </div>

                {/* Protection Gaps */}
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-400/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-orange-400" />
                    Protection Gaps Identified
                  </h3>
                  
                  <div className="space-y-3">
                    {emergencyFundProgress < 100 && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <DollarSign className="text-orange-400" size={20} />
                          <div>
                            <div className="text-white font-medium">Emergency Fund Shortfall</div>
                            <div className="text-white/60 text-sm">
                              Need {formatCurrency(emergencyTarget - profile.currentSavings)} more
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('emergency')}
                          className="px-3 py-1 bg-orange-500 hover:bg-orange-600 rounded text-white text-sm transition-colors"
                        >
                          Fix Now
                        </button>
                      </div>
                    )}

                    {!insuranceAnswers.hasHealthInsurance && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="text-red-400" size={20} />
                          <div>
                            <div className="text-white font-medium">No Health Insurance</div>
                            <div className="text-white/60 text-sm">
                              Medical emergencies can be financially devastating
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('insurance')}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-sm transition-colors"
                        >
                          Get Advice
                        </button>
                      </div>
                    )}

                    {!insuranceAnswers.hasLifeInsurance && insuranceAnswers.dependents > 0 && (
                      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="text-yellow-400" size={20} />
                          <div>
                            <div className="text-white font-medium">No Life Insurance</div>
                            <div className="text-white/60 text-sm">
                              Your dependents need financial protection
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setActiveSection('insurance')}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 rounded text-white text-sm transition-colors"
                        >
                          Protect Family
                        </button>
                      </div>
                    )}

                    {emergencyFundProgress >= 100 && insuranceAnswers.hasHealthInsurance && 
                     (insuranceAnswers.hasLifeInsurance || insuranceAnswers.dependents === 0) && (
                      <div className="flex items-center gap-3 p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                        <CheckCircle className="text-green-400" size={20} />
                        <div>
                          <div className="text-green-400 font-medium">Great Job! No Major Gaps Found</div>
                          <div className="text-white/60 text-sm">
                            Your financial protection looks solid. Consider reviewing annually.
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Badges */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Award className="text-yellow-400" />
                    Your Protection Badges
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl border ${
                      emergencyFundProgress >= 100 
                        ? 'bg-green-500/20 border-green-400/30' 
                        : 'bg-gray-500/20 border-gray-400/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          emergencyFundProgress >= 100 ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                          <DollarSign size={16} className="text-white" />
                        </div>
                        <span className={`font-medium ${
                          emergencyFundProgress >= 100 ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          Emergency Fund Master
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">
                        {emergencyFundProgress >= 100 ? 'Achieved!' : `${emergencyFundProgress.toFixed(0)}% complete`}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border ${
                      insuranceAnswers.hasHealthInsurance && insuranceAnswers.hasLifeInsurance
                        ? 'bg-blue-500/20 border-blue-400/30' 
                        : 'bg-gray-500/20 border-gray-400/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          insuranceAnswers.hasHealthInsurance && insuranceAnswers.hasLifeInsurance ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          <Shield size={16} className="text-white" />
                        </div>
                        <span className={`font-medium ${
                          insuranceAnswers.hasHealthInsurance && insuranceAnswers.hasLifeInsurance ? 'text-blue-400' : 'text-gray-400'
                        }`}>
                          Insurance Pro
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">
                        {insuranceAnswers.hasHealthInsurance && insuranceAnswers.hasLifeInsurance 
                          ? 'Fully protected!' 
                          : 'Complete insurance setup'
                        }
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border ${
                      protectionScore >= 80
                        ? 'bg-purple-500/20 border-purple-400/30' 
                        : 'bg-gray-500/20 border-gray-400/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          protectionScore >= 80 ? 'bg-purple-500' : 'bg-gray-500'
                        }`}>
                          <Award size={16} className="text-white" />
                        </div>
                        <span className={`font-medium ${
                          protectionScore >= 80 ? 'text-purple-400' : 'text-gray-400'
                        }`}>
                          Financial Guardian
                        </span>
                      </div>
                      <p className="text-white/60 text-sm">
                        {protectionScore >= 80 ? 'Expert level!' : `Reach 80+ protection score`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'insurance' && (
              <div className="space-y-8">
                {/* Insurance Questionnaire */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Heart className="text-red-400" />
                    Tell Us About Your Situation
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2">Number of Dependents</label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setInsuranceAnswers(prev => ({ ...prev, dependents: Math.max(0, prev.dependents - 1) }))}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-white font-bold text-xl w-8 text-center">{insuranceAnswers.dependents}</span>
                        <button
                          onClick={() => setInsuranceAnswers(prev => ({ ...prev, dependents: prev.dependents + 1 }))}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Employment Status</label>
                      <select
                        value={insuranceAnswers.employmentStatus}
                        onChange={(e) => setInsuranceAnswers(prev => ({ ...prev, employmentStatus: e.target.value }))}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      >
                        <option value="employed" className="bg-gray-800">Employed</option>
                        <option value="self_employed" className="bg-gray-800">Self Employed</option>
                        <option value="unemployed" className="bg-gray-800">Unemployed</option>
                        <option value="retired" className="bg-gray-800">Retired</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Monthly EMI/Loans</label>
                      <input
                        type="number"
                        value={insuranceAnswers.monthlyEMI}
                        onChange={(e) => setInsuranceAnswers(prev => ({ ...prev, monthlyEMI: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <h4 className="text-white font-medium">Current Insurance Coverage</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={insuranceAnswers.hasHealthInsurance}
                          onChange={(e) => setInsuranceAnswers(prev => ({ ...prev, hasHealthInsurance: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">Health Insurance</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={insuranceAnswers.hasLifeInsurance}
                          onChange={(e) => setInsuranceAnswers(prev => ({ ...prev, hasLifeInsurance: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">Life Insurance</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input
                          type="checkbox"
                          checked={insuranceAnswers.hasPropertyInsurance}
                          onChange={(e) => setInsuranceAnswers(prev => ({ ...prev, hasPropertyInsurance: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-white">Property Insurance</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Insurance Recommendations */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="text-blue-400" />
                    Personalized Insurance Recommendations
                  </h3>

                  {insuranceRecommendations.map((rec, index) => (
                    <div key={index} className={`p-6 rounded-xl border ${
                      rec.priority === 'high' ? 'bg-red-500/20 border-red-400/30' :
                      rec.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-400/30' :
                      'bg-blue-500/20 border-blue-400/30'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            rec.type.includes('Life') ? 'bg-red-500' :
                            rec.type.includes('Health') ? 'bg-green-500' :
                            'bg-blue-500'
                          }`}>
                            {rec.type.includes('Life') ? <Users size={20} className="text-white" /> :
                             rec.type.includes('Health') ? <Heart size={20} className="text-white" /> :
                             <Home size={20} className="text-white" />}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{rec.type}</h4>
                            <p className={`text-sm ${
                              rec.priority === 'high' ? 'text-red-400' :
                              rec.priority === 'medium' ? 'text-yellow-400' :
                              'text-blue-400'
                            }`}>
                              {rec.priority.toUpperCase()} PRIORITY
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-bold">{formatCurrency(rec.coverage)}</div>
                          <div className="text-white/60 text-sm">Coverage</div>
                        </div>
                      </div>

                      <p className="text-white/80 mb-4">{rec.reason}</p>

                      <div className="flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                          Estimated cost: <span className="text-white font-medium">{formatCurrency(rec.monthlyCost)}/month</span>
                        </div>
                        
                        {rec.recommended && (
                          <div className="flex gap-2">
                            <button
                              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
                              onClick={() => setCompareModal({ type: rec.type, coverage: rec.coverage, monthlyCost: rec.monthlyCost })}
                            >
                              <ExternalLink size={14} />
                              Compare Plans
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insurance Comparison Table */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChart className="text-purple-400" />
                    Insurance Types Comparison
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-white/80 py-3">Type</th>
                          <th className="text-left text-white/80 py-3">Purpose</th>
                          <th className="text-left text-white/80 py-3">Typical Coverage</th>
                          <th className="text-left text-white/80 py-3">Monthly Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-white font-medium">Term Life</td>
                          <td className="py-3 text-white/60">Income replacement for dependents</td>
                          <td className="py-3 text-white/60">10-20x annual income</td>
                          <td className="py-3 text-white/60">₹500-2000</td>
                        </tr>
                        <tr className="border-b border-white/5">
                          <td className="py-3 text-white font-medium">Health</td>
                          <td className="py-3 text-white/60">Medical expenses coverage</td>
                          <td className="py-3 text-white/60">₹5L-50L</td>
                          <td className="py-3 text-white/60">₹800-5000</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-white font-medium">Property</td>
                          <td className="py-3 text-white/60">Asset protection</td>
                          <td className="py-3 text-white/60">Asset value</td>
                          <td className="py-3 text-white/60">₹1000-3000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'emergency' && (
              <div className="space-y-8">
                {/* Emergency Fund Calculator */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calculator className="text-green-400" />
                    Emergency Fund Calculator
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-white/80 mb-2">Monthly Expenses</label>
                      <input
                        type="number"
                        value={profile.monthlyExpenses}
                        readOnly
                        className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 mb-2">Target Months</label>
                      <select
                        value={emergencyTarget / profile.monthlyExpenses}
                        onChange={(e) => setEmergencyTarget(profile.monthlyExpenses * parseInt(e.target.value))}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        <option value="3" className="bg-gray-800">3 months (Minimum)</option>
                        <option value="6" className="bg-gray-800">6 months (Recommended)</option>
                        <option value="9" className="bg-gray-800">9 months (Conservative)</option>
                        <option value="12" className="bg-gray-800">12 months (Very Safe)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30">
                    <div className="grid md:grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-white/60 text-sm">Target Amount</div>
                        <div className="text-2xl font-bold text-green-400">{formatCurrency(emergencyTarget)}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm">Current Savings</div>
                        <div className="text-2xl font-bold text-white">{formatCurrency(profile.currentSavings)}</div>
                      </div>
                      <div>
                        <div className="text-white/60 text-sm">Still Needed</div>
                        <div className={`text-2xl font-bold ${
                          profile.currentSavings >= emergencyTarget ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {profile.currentSavings >= emergencyTarget 
                            ? '✅ Complete!' 
                            : formatCurrency(emergencyTarget - profile.currentSavings)
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex justify-between text-white/60 text-sm mb-2">
                      <span>Progress</span>
                      <span>{emergencyFundProgress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          emergencyFundProgress >= 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(emergencyFundProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-400" />
                    Tips to Build Emergency Fund Quickly
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Target size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Automate Your Savings</h4>
                          <p className="text-white/60 text-sm">Set up automatic transfers to a separate emergency fund account</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <DollarSign size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Cut Non-Essential Spending</h4>
                          <p className="text-white/60 text-sm">Temporarily reduce entertainment and luxury expenses</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Use Windfalls</h4>
                          <p className="text-white/60 text-sm">Direct bonuses, tax refunds, and gifts to emergency fund</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
                      <h4 className="text-yellow-400 font-medium mb-3">💡 Smart Calculation</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/60">If you save extra:</span>
                          <span className="text-white font-medium">{formatCurrency(1000)}/month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">You'll reach target in:</span>
                          <span className="text-white font-medium">
                            {Math.ceil((emergencyTarget - profile.currentSavings) / 1000)} months
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/60">Total monthly savings:</span>
                          <span className="text-green-400 font-medium">
                            {formatCurrency(profile.monthlySavings + 1000)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="text-green-400" />
                    Emergency Fund Milestones
                  </h3>
                  
                  <div className="space-y-4">
                    {[1, 3, 6, 12].map((months) => {
                      const milestoneAmount = profile.monthlyExpenses * months;
                      const achieved = profile.currentSavings >= milestoneAmount;
                      
                      return (
                        <div key={months} className={`flex items-center gap-4 p-4 rounded-xl border ${
                          achieved ? 'bg-green-500/20 border-green-400/30' : 'bg-white/5 border-white/10'
                        }`}>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            achieved ? 'bg-green-500' : 'bg-gray-500'
                          }`}>
                            {achieved ? <CheckCircle size={20} className="text-white" /> : <Target size={20} className="text-white" />}
                          </div>
                          
                          <div className="flex-1">
                            <div className={`font-medium ${achieved ? 'text-green-400' : 'text-white'}`}>
                              {months} Month{months > 1 ? 's' : ''} Emergency Fund
                            </div>
                            <div className="text-white/60 text-sm">
                              {formatCurrency(milestoneAmount)} • {achieved ? 'Achieved!' : 'In Progress'}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-sm ${achieved ? 'text-green-400' : 'text-white/60'}`}>
                              {achieved ? '100%' : `${Math.min((profile.currentSavings / milestoneAmount) * 100, 100).toFixed(0)}%`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'risk' && (
              <div className="space-y-8">
                {/* Risk Assessment Quiz */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Brain className="text-purple-400" />
                    Risk Tolerance Assessment
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/80 mb-3">Investment Experience</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { value: 'beginner', label: 'Beginner', desc: 'New to investing' },
                          { value: 'intermediate', label: 'Intermediate', desc: '2-5 years experience' },
                          { value: 'expert', label: 'Expert', desc: '5+ years experience' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setRiskAnswers(prev => ({ ...prev, investmentExperience: option.value }))}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              riskAnswers.investmentExperience === option.value
                                ? 'border-purple-400 bg-purple-400/20'
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-medium text-white">{option.label}</div>
                            <div className="text-white/60 text-sm">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-3">Risk Comfort Level (1-5)</label>
                      <div className="flex items-center gap-4">
                        <span className="text-white/60 text-sm">Conservative</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => setRiskAnswers(prev => ({ ...prev, riskComfort: level }))}
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                riskAnswers.riskComfort >= level
                                  ? 'border-purple-400 bg-purple-400'
                                  : 'border-white/20 hover:border-white/40'
                              }`}
                            >
                              <span className="text-white font-bold">{level}</span>
                            </button>
                          ))}
                        </div>
                        <span className="text-white/60 text-sm">Aggressive</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-3">Investment Time Horizon</label>
                      <div className="grid md:grid-cols-3 gap-3">
                        {[
                          { value: 'short', label: 'Short Term', desc: '< 3 years' },
                          { value: 'medium', label: 'Medium Term', desc: '3-10 years' },
                          { value: 'long', label: 'Long Term', desc: '10+ years' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setRiskAnswers(prev => ({ ...prev, timeHorizon: option.value }))}
                            className={`p-4 rounded-xl border text-left transition-all ${
                              riskAnswers.timeHorizon === option.value
                                ? 'border-purple-400 bg-purple-400/20'
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <div className="font-medium text-white">{option.label}</div>
                            <div className="text-white/60 text-sm">{option.desc}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-3">If market drops 20%, you would:</label>
                      <div className="space-y-2">
                        {[
                          { value: 'sell', label: 'Sell everything to avoid further losses' },
                          { value: 'hold', label: 'Hold and wait for recovery' },
                          { value: 'buy_more', label: 'Buy more at lower prices' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setRiskAnswers(prev => ({ ...prev, marketReaction: option.value }))}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              riskAnswers.marketReaction === option.value
                                ? 'border-purple-400 bg-purple-400/20'
                                : 'border-white/20 bg-white/5 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-white">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Profile Results */}
                {riskProfile && (
                  <div className={`rounded-xl p-6 border ${
                    riskProfile.level === 'Conservative' ? 'bg-blue-500/20 border-blue-400/30' :
                    riskProfile.level === 'Moderate' ? 'bg-green-500/20 border-green-400/30' :
                    'bg-orange-500/20 border-orange-400/30'
                  }`}>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Award className={`${
                        riskProfile.level === 'Conservative' ? 'text-blue-400' :
                        riskProfile.level === 'Moderate' ? 'text-green-400' :
                        'text-orange-400'
                      }`} />
                      Your Risk Profile: {riskProfile.level}
                    </h3>
                    
                    <p className="text-white/80 mb-4">{riskProfile.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-white font-medium mb-3">Risk Score Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-white/60">Total Score:</span>
                            <span className="text-white font-bold">{riskProfile.score}/15</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                riskProfile.level === 'Conservative' ? 'bg-blue-500' :
                                riskProfile.level === 'Moderate' ? 'bg-green-500' :
                                'bg-orange-500'
                              }`}
                              style={{ width: `${(riskProfile.score / 15) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-white font-medium mb-3">Recommended Portfolio</h4>
                        <div className="space-y-2">
                          {riskProfile.level === 'Conservative' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white/60">Fixed Deposits/Bonds:</span>
                                <span className="text-blue-400 font-bold">80%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Equity:</span>
                                <span className="text-blue-400 font-bold">20%</span>
                              </div>
                            </>
                          )}
                          {riskProfile.level === 'Moderate' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white/60">Equity:</span>
                                <span className="text-green-400 font-bold">60%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Debt:</span>
                                <span className="text-green-400 font-bold">40%</span>
                              </div>
                            </>
                          )}
                          {riskProfile.level === 'Aggressive' && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-white/60">Equity:</span>
                                <span className="text-orange-400 font-bold">80%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/60">Debt:</span>
                                <span className="text-orange-400 font-bold">20%</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {riskProfile && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="text-blue-400" />
                      Personalized Recommendations
                    </h3>
                    
                    <div className="space-y-3">
                      {riskProfile.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <span className="text-white/80">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Risk Reduction Tips */}
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-400/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-red-400" />
                    Tips to Reduce Financial Risk
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingUp size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Diversify Income Sources</h4>
                          <p className="text-white/60 text-sm">Don't rely on single income stream</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PieChart size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Invest Safely</h4>
                          <p className="text-white/60 text-sm">Spread investments across asset classes</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertTriangle size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Avoid High-Interest Debt</h4>
                          <p className="text-white/60 text-sm">Pay off credit cards and personal loans first</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Shield size={16} className="text-white" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium">Regular Review</h4>
                          <p className="text-white/60 text-sm">Reassess risk profile annually</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Place the modal here, inside the main parent div */}
        {compareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full p-0 relative">
              <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield size={24} className="text-blue-400" />
                  Compare {compareModal.type} Plans
                </h2>
                <button
                  className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg p-2 transition-colors"
                  onClick={() => setCompareModal(null)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="px-8 py-6">
                {/* Dynamic content based on insurance type */}
                {compareModal.type === 'Term Life Insurance' && (
                  <>
                    <p className="mb-6 text-white/80">Based on your profile, a recommended coverage is <b className='text-blue-300'>{formatCurrency(compareModal.coverage)}</b> with an estimated monthly cost of <b className='text-blue-300'>{formatCurrency(compareModal.monthlyCost)}</b>.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm mb-4 bg-white/5 rounded-xl border border-white/10">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/80 py-3">Provider</th>
                            <th className="text-left text-white/80 py-3">Coverage</th>
                            <th className="text-left text-white/80 py-3">Claim Settlement</th>
                            <th className="text-left text-white/80 py-3">Monthly Premium</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/10">
                            <td className="py-3 text-white font-medium">LIC</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">98.7%</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 100)}</td>
                          </tr>
                          <tr className="border-b border-white/10">
                            <td className="py-3 text-white font-medium">HDFC Life</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">99.4%</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 150)}</td>
                          </tr>
                          <tr>
                            <td className="py-3 text-white font-medium">ICICI Prudential</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">97.9%</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 120)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-white/50">* Actual premiums may vary based on age, health, and policy term.</p>
                  </>
                )}
                {compareModal.type === 'Health Insurance' && (
                  <>
                    <p className="mb-6 text-white/80">Recommended health coverage for you: <b className='text-blue-300'>{formatCurrency(compareModal.coverage)}</b>. Estimated monthly cost: <b className='text-blue-300'>{formatCurrency(compareModal.monthlyCost)}</b>.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm mb-4 bg-white/5 rounded-xl border border-white/10">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/80 py-3">Provider</th>
                            <th className="text-left text-white/80 py-3">Coverage</th>
                            <th className="text-left text-white/80 py-3">Network Hospitals</th>
                            <th className="text-left text-white/80 py-3">Monthly Premium</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/10">
                            <td className="py-3 text-white font-medium">Star Health</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">12,000+</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 80)}</td>
                          </tr>
                          <tr className="border-b border-white/10">
                            <td className="py-3 text-white font-medium">Apollo Munich</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">10,000+</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 120)}</td>
                          </tr>
                          <tr>
                            <td className="py-3 text-white font-medium">HDFC Ergo</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">13,000+</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 100)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-white/50">* Premiums and coverage may vary by age, city, and pre-existing conditions.</p>
                  </>
                )}
                {compareModal.type === 'Property Insurance' && (
                  <>
                    <p className="mb-6 text-white/80">Recommended property coverage: <b className='text-blue-300'>{formatCurrency(compareModal.coverage)}</b>. Estimated monthly cost: <b className='text-blue-300'>{formatCurrency(compareModal.monthlyCost)}</b>.</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm mb-4 bg-white/5 rounded-xl border border-white/10">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left text-white/80 py-3">Provider</th>
                            <th className="text-left text-white/80 py-3">Coverage</th>
                            <th className="text-left text-white/80 py-3">Key Features</th>
                            <th className="text-left text-white/80 py-3">Monthly Premium</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-white/10">
                            <td className="py-3 text-white font-medium">Bajaj Allianz</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">Fire, Theft, Natural Calamities</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 60)}</td>
                          </tr>
                          <tr className="border-b border-white/10">
                            <td className="py-3 text-white font-medium">ICICI Lombard</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">Fire, Burglary, Earthquake</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 80)}</td>
                          </tr>
                          <tr>
                            <td className="py-3 text-white font-medium">HDFC Ergo</td>
                            <td className="py-3 text-blue-200">{formatCurrency(compareModal.coverage)}</td>
                            <td className="py-3 text-green-400">Fire, Flood, Theft</td>
                            <td className="py-3 text-blue-300">{formatCurrency(compareModal.monthlyCost + 70)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-white/50">* Premiums and features may vary by property type and location.</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
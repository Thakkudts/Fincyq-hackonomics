import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useInsuranceAdvice } from '../hooks/useInsuranceAdvice';
import { formatCurrency } from '../utils/financialCalculations';
import { 
  X, 
  Shield, 
  Heart, 
  Car, 
  Home, 
  Briefcase, 
  DollarSign,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Save,
  Edit3,
  Trash2,
  Plus,
  TrendingUp,
  Users,
  Clock,
  FileText,
  Target
} from 'lucide-react';

interface InsuranceAdvice {
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

interface FinancialProtectionProps {
  profile: UserProfile;
  onClose: () => void;
}

const insuranceTypes = [
  { 
    id: 'health', 
    name: 'Health Insurance', 
    icon: Heart, 
    color: 'bg-red-500',
    description: 'Medical expenses and healthcare coverage',
    recommendedCoverage: (profile: UserProfile) => profile.income * 0.1 // 10% of income for health
  },
  { 
    id: 'life', 
    name: 'Life Insurance', 
    icon: Users, 
    color: 'bg-blue-500',
    description: 'Financial protection for your family',
    recommendedCoverage: (profile: UserProfile) => profile.income * 10 // 10x annual income
  },
  { 
    id: 'disability', 
    name: 'Disability Insurance', 
    icon: Shield, 
    color: 'bg-purple-500',
    description: 'Income protection if unable to work',
    recommendedCoverage: (profile: UserProfile) => profile.income * 0.6 // 60% of income
  },
  { 
    id: 'auto', 
    name: 'Auto Insurance', 
    icon: Car, 
    color: 'bg-green-500',
    description: 'Vehicle and liability coverage',
    recommendedCoverage: (profile: UserProfile) => Math.max(100000, profile.income * 2) // Minimum $100k or 2x income
  },
  { 
    id: 'home', 
    name: 'Home Insurance', 
    icon: Home, 
    color: 'bg-orange-500',
    description: 'Property and personal belongings protection',
    recommendedCoverage: (profile: UserProfile) => profile.currentSavings * 2 // 2x current savings as proxy for home value
  },
  { 
    id: 'umbrella', 
    name: 'Umbrella Policy', 
    icon: Briefcase, 
    color: 'bg-indigo-500',
    description: 'Additional liability protection',
    recommendedCoverage: (profile: UserProfile) => Math.max(1000000, profile.income * 5) // Minimum $1M or 5x income
  }
];

export default function FinancialProtection({ profile, onClose }: FinancialProtectionProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'advice'>('overview');
  const [selectedInsurance, setSelectedInsurance] = useState<string>('health');
  const [editingAdvice, setEditingAdvice] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [newAdvice, setNewAdvice] = useState({
    insuranceType: 'health' as const,
    currentCoverage: '',
    recommendedCoverage: '',
    monthlyPremium: '',
    provider: '',
    notes: '',
    priority: 'medium' as const,
    status: 'researching' as const
  });

  const { user } = useAuth();
  const { 
    insuranceAdvice, 
    loading, 
    error, 
    addInsuranceAdvice, 
    updateInsuranceAdvice, 
    deleteInsuranceAdvice 
  } = useInsuranceAdvice(user?.id);

  const handleAddAdvice = async () => {
    if (!user || !newAdvice.insuranceType) return;

    const advice = {
      userId: user.id,
      insuranceType: newAdvice.insuranceType,
      currentCoverage: parseFloat(newAdvice.currentCoverage) || 0,
      recommendedCoverage: parseFloat(newAdvice.recommendedCoverage) || 0,
      monthlyPremium: parseFloat(newAdvice.monthlyPremium) || 0,
      provider: newAdvice.provider.trim(),
      notes: newAdvice.notes.trim(),
      priority: newAdvice.priority,
      status: newAdvice.status
    };

    const result = await addInsuranceAdvice(advice);
    
    if (result.success) {
      setNewAdvice({
        insuranceType: 'health',
        currentCoverage: '',
        recommendedCoverage: '',
        monthlyPremium: '',
        provider: '',
        notes: '',
        priority: 'medium',
        status: 'researching'
      });
      setShowAddForm(false);
    }
  };

  const handleUpdateAdvice = async (adviceId: string, updates: Partial<InsuranceAdvice>) => {
    await updateInsuranceAdvice(adviceId, updates);
    setEditingAdvice(null);
  };

  const calculateProtectionGap = () => {
    const totalRecommended = insuranceTypes.reduce((sum, type) => {
      const existing = insuranceAdvice.find(advice => advice.insuranceType === type.id);
      const recommended = type.recommendedCoverage(profile);
      return sum + (recommended - (existing?.currentCoverage || 0));
    }, 0);
    
    return Math.max(0, totalRecommended);
  };

  const calculateTotalPremiums = () => {
    return insuranceAdvice.reduce((sum, advice) => sum + advice.monthlyPremium, 0);
  };

  const getInsuranceTypeInfo = (typeId: string) => {
    return insuranceTypes.find(type => type.id === typeId);
  };

  const protectionGap = calculateProtectionGap();
  const totalPremiums = calculateTotalPremiums();
  const protectionScore = Math.max(0, 100 - (protectionGap / (profile.income * 10)) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Shield size={20} className="text-white" />
                </div>
                Financial Protection Center
              </h2>
              <p className="text-white/60 mt-1">Secure your financial future with proper insurance coverage</p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Protection Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Protection Score</div>
              <div className={`text-2xl font-bold ${protectionScore >= 80 ? 'text-green-400' : protectionScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                {protectionScore.toFixed(0)}%
              </div>
              <div className="text-white/60 text-sm">
                {protectionScore >= 80 ? 'Well Protected' : protectionScore >= 60 ? 'Needs Improvement' : 'High Risk'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Monthly Premiums</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(totalPremiums)}</div>
              <div className="text-white/60 text-sm">
                {((totalPremiums * 12 / profile.income) * 100).toFixed(1)}% of income
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Coverage Gap</div>
              <div className={`text-2xl font-bold ${protectionGap > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {protectionGap > 0 ? formatCurrency(protectionGap) : '✓ Covered'}
              </div>
              <div className="text-white/60 text-sm">
                {protectionGap > 0 ? 'Additional coverage needed' : 'Adequately protected'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {[
            { id: 'overview', label: 'Coverage Overview', icon: Shield },
            { id: 'calculator', label: 'Insurance Calculator', icon: Calculator },
            { id: 'advice', label: 'My Insurance Plans', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
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
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Insurance Types Grid */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="text-blue-400" />
                    Insurance Coverage Analysis
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {insuranceTypes.map((type) => {
                      const existing = insuranceAdvice.find(advice => advice.insuranceType === type.id);
                      const recommended = type.recommendedCoverage(profile);
                      const coverage = existing ? (existing.currentCoverage / recommended) * 100 : 0;
                      const isAdequate = coverage >= 80;
                      
                      return (
                        <div key={type.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                              <type.icon size={18} className="text-white" />
                            </div>
                            <div>
                              <div className="text-white font-semibold">{type.name}</div>
                              <div className="text-white/60 text-sm">{type.description}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Current</span>
                              <span className="text-white">{formatCurrency(existing?.currentCoverage || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-white/60">Recommended</span>
                              <span className="text-blue-400">{formatCurrency(recommended)}</span>
                            </div>
                            
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all ${isAdequate ? 'bg-green-500' : 'bg-red-500'}`}
                                style={{ width: `${Math.min(coverage, 100)}%` }}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${isAdequate ? 'text-green-400' : 'text-red-400'}`}>
                                {coverage.toFixed(0)}% covered
                              </span>
                              {existing ? (
                                <span className="text-white/60 text-sm">{formatCurrency(existing.monthlyPremium)}/mo</span>
                              ) : (
                                <span className="text-red-400 text-sm">No coverage</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-400/30">
                  <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Priority Recommendations
                  </h3>
                  
                  <div className="space-y-3">
                    {insuranceTypes.map((type) => {
                      const existing = insuranceAdvice.find(advice => advice.insuranceType === type.id);
                      const recommended = type.recommendedCoverage(profile);
                      const gap = recommended - (existing?.currentCoverage || 0);
                      
                      if (gap <= 0) return null;
                      
                      return (
                        <div key={type.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center`}>
                              <type.icon size={14} className="text-white" />
                            </div>
                            <div>
                              <div className="text-white font-medium">{type.name}</div>
                              <div className="text-white/60 text-sm">
                                Increase coverage by {formatCurrency(gap)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-red-400 font-bold">High Priority</div>
                            <div className="text-white/60 text-sm">Est. +$50-200/mo</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="space-y-8">
                {/* Insurance Type Selector */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Calculator className="text-purple-400" />
                    Insurance Coverage Calculator
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                    {insuranceTypes.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setSelectedInsurance(type.id)}
                        className={`p-3 rounded-xl border transition-all ${
                          selectedInsurance === type.id
                            ? 'border-purple-400 bg-purple-400/20 scale-105'
                            : 'border-white/20 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className={`w-8 h-8 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                          <type.icon size={16} className="text-white" />
                        </div>
                        <div className="text-white text-sm font-medium text-center">{type.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculator Results */}
                {selectedInsurance && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">
                          {insuranceTypes.find(t => t.id === selectedInsurance)?.name} Calculator
                        </h4>
                        
                        <div className="space-y-4">
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/60 text-sm">Recommended Coverage</div>
                            <div className="text-2xl font-bold text-blue-400">
                              {formatCurrency(insuranceTypes.find(t => t.id === selectedInsurance)?.recommendedCoverage(profile) || 0)}
                            </div>
                          </div>
                          
                          <div className="bg-white/5 rounded-lg p-4">
                            <div className="text-white/60 text-sm">Estimated Monthly Premium</div>
                            <div className="text-xl font-bold text-white">
                              $150 - $400
                            </div>
                            <div className="text-white/60 text-sm">Varies by provider and coverage</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4">Coverage Factors</h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-white/60">Your Age</span>
                            <span className="text-white">{profile.age} years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Annual Income</span>
                            <span className="text-white">{formatCurrency(profile.income)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Risk Level</span>
                            <span className="text-white capitalize">{profile.riskTolerance}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/60">Current Savings</span>
                            <span className="text-white">{formatCurrency(profile.currentSavings)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-500/20 rounded-lg border border-blue-400/30">
                          <div className="text-blue-400 font-medium mb-2">💡 Pro Tip</div>
                          <div className="text-white/80 text-sm">
                            {selectedInsurance === 'life' && "Life insurance is cheapest when you're young and healthy. Consider term life for affordability."}
                            {selectedInsurance === 'health' && "High-deductible plans with HSAs can save money while providing tax benefits."}
                            {selectedInsurance === 'disability' && "Disability insurance through your employer is often the most cost-effective option."}
                            {selectedInsurance === 'auto' && "Bundle auto and home insurance for potential discounts of 10-25%."}
                            {selectedInsurance === 'home' && "Consider replacement cost coverage rather than actual cash value for better protection."}
                            {selectedInsurance === 'umbrella' && "Umbrella policies provide excellent value for high-net-worth individuals."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'advice' && (
              <div className="space-y-6">
                {/* Add New Insurance Button */}
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="text-green-400" />
                    My Insurance Portfolio
                  </h3>
                  
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Insurance
                  </button>
                </div>

                {/* Add Insurance Form */}
                {showAddForm && (
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-white mb-4">Add New Insurance Coverage</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-white/80 mb-2">Insurance Type</label>
                        <select
                          value={newAdvice.insuranceType}
                          onChange={(e) => setNewAdvice(prev => ({ ...prev, insuranceType: e.target.value as any }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          {insuranceTypes.map(type => (
                            <option key={type.id} value={type.id} className="bg-gray-800">
                              {type.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 mb-2">Provider</label>
                        <input
                          type="text"
                          value={newAdvice.provider}
                          onChange={(e) => setNewAdvice(prev => ({ ...prev, provider: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Insurance company name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 mb-2">Current Coverage</label>
                        <input
                          type="number"
                          value={newAdvice.currentCoverage}
                          onChange={(e) => setNewAdvice(prev => ({ ...prev, currentCoverage: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 mb-2">Monthly Premium</label>
                        <input
                          type="number"
                          step="0.01"
                          value={newAdvice.monthlyPremium}
                          onChange={(e) => setNewAdvice(prev => ({ ...prev, monthlyPremium: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 mb-2">Priority</label>
                        <select
                          value={newAdvice.priority}
                          onChange={(e) => setNewAdvice(prev => ({ ...prev, priority: e.target.value as any }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="high" className="bg-gray-800">High Priority</option>
                          <option value="medium" className="bg-gray-800">Medium Priority</option>
                          <option value="low" className="bg-gray-800">Low Priority</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 mb-2">Status</label>
                        <select
                          value={newAdvice.status}
                          onChange={(e) => setNewAdvice(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="active" className="bg-gray-800">Active</option>
                          <option value="pending" className="bg-gray-800">Pending</option>
                          <option value="researching" className="bg-gray-800">Researching</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-white/80 mb-2">Notes</label>
                      <textarea
                        value={newAdvice.notes}
                        onChange={(e) => setNewAdvice(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Additional notes about this insurance..."
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={handleAddAdvice}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
                      >
                        <Save size={16} />
                        Save Insurance
                      </button>
                      <button
                        onClick={() => setShowAddForm(false)}
                        className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Insurance List */}
                <div className="space-y-3">
                  {loading && (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-white/60">Loading insurance data...</p>
                    </div>
                  )}

                  {!loading && insuranceAdvice.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield size={48} className="text-white/20 mx-auto mb-4" />
                      <h4 className="text-xl font-semibold text-white mb-2">No Insurance Records</h4>
                      <p className="text-white/60 mb-6">Start building your insurance portfolio for better financial protection</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-lg text-white font-medium transition-colors"
                      >
                        Add Your First Insurance
                      </button>
                    </div>
                  ) : (
                    insuranceAdvice.map((advice) => {
                      const typeInfo = getInsuranceTypeInfo(advice.insuranceType);
                      const isEditing = editingAdvice === advice.id;
                      
                      return (
                        <div key={advice.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                          {isEditing ? (
                            <EditInsuranceForm
                              advice={advice}
                              onSave={(updates) => handleUpdateAdvice(advice.id, updates)}
                              onCancel={() => setEditingAdvice(null)}
                            />
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${typeInfo?.color || 'bg-gray-500'} rounded-xl flex items-center justify-center`}>
                                  {typeInfo?.icon && <typeInfo.icon size={20} className="text-white" />}
                                </div>
                                <div>
                                  <div className="text-white font-semibold">{typeInfo?.name}</div>
                                  <div className="text-white/60 text-sm">{advice.provider}</div>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-white/80 text-sm">
                                      Coverage: {formatCurrency(advice.currentCoverage)}
                                    </span>
                                    <span className="text-white/80 text-sm">
                                      Premium: {formatCurrency(advice.monthlyPremium)}/mo
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      advice.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                      advice.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-blue-500/20 text-blue-400'
                                    }`}>
                                      {advice.status.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingAdvice(advice.id)}
                                  className="p-2 text-white/60 hover:text-blue-400 transition-colors"
                                  title="Edit insurance"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteInsuranceAdvice(advice.id)}
                                  className="p-2 text-white/60 hover:text-red-400 transition-colors"
                                  title="Delete insurance"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4">
                    <p className="text-red-400">{error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Insurance Form Component
function EditInsuranceForm({ advice, onSave, onCancel }: {
  advice: InsuranceAdvice;
  onSave: (updates: Partial<InsuranceAdvice>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    currentCoverage: advice.currentCoverage.toString(),
    monthlyPremium: advice.monthlyPremium.toString(),
    provider: advice.provider,
    notes: advice.notes,
    priority: advice.priority,
    status: advice.status
  });

  const handleSave = () => {
    onSave({
      currentCoverage: parseFloat(formData.currentCoverage),
      monthlyPremium: parseFloat(formData.monthlyPremium),
      provider: formData.provider,
      notes: formData.notes,
      priority: formData.priority,
      status: formData.status
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          value={formData.currentCoverage}
          onChange={(e) => setFormData(prev => ({ ...prev, currentCoverage: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Coverage amount"
        />
        <input
          type="number"
          step="0.01"
          value={formData.monthlyPremium}
          onChange={(e) => setFormData(prev => ({ ...prev, monthlyPremium: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Monthly premium"
        />
      </div>
      
      <input
        type="text"
        value={formData.provider}
        onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Provider"
      />
      
      <div className="grid grid-cols-2 gap-4">
        <select
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="high" className="bg-gray-800">High Priority</option>
          <option value="medium" className="bg-gray-800">Medium Priority</option>
          <option value="low" className="bg-gray-800">Low Priority</option>
        </select>
        
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="active" className="bg-gray-800">Active</option>
          <option value="pending" className="bg-gray-800">Pending</option>
          <option value="researching" className="bg-gray-800">Researching</option>
        </select>
      </div>
      
      <textarea
        value={formData.notes}
        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Notes"
        rows={2}
      />
      
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Save size={14} />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg text-white text-sm transition-colors flex items-center justify-center gap-2"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
}
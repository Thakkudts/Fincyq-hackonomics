import React, { useState } from 'react';
import { UserProfile, FinancialGoal } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { DollarSign, Target, TrendingUp, User, Plus, X, LogOut, Cloud, CheckCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const goalCategories = [
  { id: 'home', name: 'Buy a Home', icon: '🏠' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'retirement', name: 'Retirement', icon: '🏖️' },
  { id: 'business', name: 'Start Business', icon: '🚀' },
  { id: 'other', name: 'Other', icon: '🎯' }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    age: 25,
    income: 50000,
    monthlyExpenses: 3000,
    monthlySavings: 500,
    currentSavings: 5000,
    goals: [],
    riskTolerance: 'moderate'
  });

  const [newGoal, setNewGoal] = useState<Partial<FinancialGoal>>({
    name: '',
    targetAmount: 0,
    targetYear: new Date().getFullYear() + 5,
    priority: 'medium',
    category: 'other'
  });

  const [isCompleting, setIsCompleting] = useState(false);
  const [completionStatus, setCompletionStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { user, signOut } = useAuth();
  const { saveProfile, loading: saveLoading } = useUserProfile();

  const addGoal = () => {
    if (newGoal.name && newGoal.targetAmount) {
      const goal: FinancialGoal = {
        id: Date.now().toString(),
        name: newGoal.name,
        targetAmount: newGoal.targetAmount,
        targetYear: newGoal.targetYear || new Date().getFullYear() + 5,
        priority: newGoal.priority || 'medium',
        category: newGoal.category || 'other'
      };
      
      setProfile(prev => ({
        ...prev,
        goals: [...(prev.goals || []), goal]
      }));
      
      setNewGoal({
        name: '',
        targetAmount: 0,
        targetYear: new Date().getFullYear() + 5,
        priority: 'medium',
        category: 'other'
      });
    }
  };

  const removeGoal = (id: string) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals?.filter(goal => goal.id !== id) || []
    }));
  };

  const handleComplete = async () => {
    if (profile.age && profile.income && profile.monthlyExpenses && profile.monthlySavings !== undefined && user) {
      const completeProfile = profile as UserProfile;
      
      setIsCompleting(true);
      setCompletionStatus('saving');
      
      try {
        // Save to Supabase
        const result = await saveProfile(completeProfile, user.id);
        
        if (result.success) {
          setCompletionStatus('success');
          
          // Small delay to show success state
          setTimeout(() => {
            onComplete(completeProfile);
          }, 1500);
        } else {
          setCompletionStatus('error');
          console.error('Failed to save profile:', result.error);
          
          // Still proceed to dashboard after a delay, even if save failed
          setTimeout(() => {
            onComplete(completeProfile);
          }, 2000);
        }
      } catch (error) {
        setCompletionStatus('error');
        console.error('Failed to save profile:', error);
        
        // Still proceed to dashboard after a delay, even if save failed
        setTimeout(() => {
          onComplete(completeProfile);
        }, 2000);
      }
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSignOut = async () => {
    await signOut();
  };

  // Show completion screen
  if (isCompleting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full border border-white/20 text-center">
          <div className="mb-8">
            {completionStatus === 'saving' && (
              <>
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-white mb-2">Saving Your Profile</h2>
                <p className="text-white/80">Setting up your financial time machine...</p>
              </>
            )}
            
            {completionStatus === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-400 mb-2">Profile Saved!</h2>
                <p className="text-white/80">Redirecting to your dashboard...</p>
              </>
            )}
            
            {completionStatus === 'error' && (
              <>
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud size={32} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-orange-400 mb-2">Almost Ready!</h2>
                <p className="text-white/80">Taking you to your dashboard...</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border border-white/20">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
                Let's Plan Your Future
              </h1>
              <p className="text-white/80">Tell us about your financial situation</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-white/60 text-sm flex items-center gap-1">
                  <Cloud size={12} />
                  Signed in as
                </div>
                <div className="text-white font-medium">{user?.name}</div>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 bg-white/10 hover:bg-red-500/20 hover:border-red-400/30 rounded-lg text-white/60 hover:text-red-400 transition-colors border border-white/20"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
            <p className="text-green-400 text-sm">
              ✅ Your progress will be automatically saved to the cloud and synced across devices
            </p>
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i <= step ? 'bg-purple-400' : 'bg-white/20'
                } transition-colors duration-300`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <User className="text-purple-400" />
              Tell us about yourself
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white/80 mb-2">Age</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="25"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Annual Income</label>
                <input
                  type="number"
                  value={profile.income}
                  onChange={(e) => setProfile(prev => ({ ...prev, income: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="50000"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <DollarSign className="text-green-400" />
              Your current finances
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Monthly Expenses</label>
                <input
                  type="number"
                  value={profile.monthlyExpenses}
                  onChange={(e) => setProfile(prev => ({ ...prev, monthlyExpenses: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="3000"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Monthly Savings</label>
                <input
                  type="number"
                  value={profile.monthlySavings}
                  onChange={(e) => setProfile(prev => ({ ...prev, monthlySavings: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="500"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2">Current Savings</label>
                <input
                  type="number"
                  value={profile.currentSavings}
                  onChange={(e) => setProfile(prev => ({ ...prev, currentSavings: parseInt(e.target.value) }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="5000"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Target className="text-yellow-400" />
              Your financial goals
            </h2>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Goal name"
                />
                <input
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetAmount: parseInt(e.target.value) }))}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Target amount"
                />
                <input
                  type="number"
                  value={newGoal.targetYear}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, targetYear: parseInt(e.target.value) }))}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="Target year"
                />
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, category: e.target.value as any }))}
                  className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  {goalCategories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-800">
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={addGoal}
                className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm transition-colors"
              >
                <Plus size={16} />
                Add Goal
              </button>
            </div>

            <div className="space-y-2">
              {(profile.goals || []).map((goal) => (
                <div key={goal.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                  <div>
                    <span className="text-white font-medium">{goal.name}</span>
                    <span className="text-white/60 ml-2">${goal.targetAmount.toLocaleString()}</span>
                    <span className="text-white/60 ml-2">by {goal.targetYear}</span>
                  </div>
                  <button
                    onClick={() => removeGoal(goal.id)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <TrendingUp className="text-blue-400" />
              Investment preference
            </h2>
            
            <div className="space-y-4">
              {[
                { value: 'conservative', label: 'Conservative', desc: 'Lower risk, steady returns' },
                { value: 'moderate', label: 'Moderate', desc: 'Balanced risk and return' },
                { value: 'aggressive', label: 'Aggressive', desc: 'Higher risk, potential for higher returns' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setProfile(prev => ({ ...prev, riskTolerance: option.value as any }))}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    profile.riskTolerance === option.value
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
        )}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
            >
              Previous
            </button>
          )}
          
          <div className="ml-auto">
            {step < 4 ? (
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={saveLoading || isCompleting}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 rounded-xl text-white font-medium transition-colors flex items-center gap-2"
              >
                {saveLoading || isCompleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting Time Travel...
                  </>
                ) : (
                  <>
                    <Cloud size={16} />
                    Start Time Travel
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
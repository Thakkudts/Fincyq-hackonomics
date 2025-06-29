import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import Timeline from './Timeline';
import LifeMap from './LifeMap';
import EducationalTip from './EducationalTip';
import SimulationCard from './SimulationCard';
import ExpenseTracker from './ExpenseTracker';
import DisasterMode from './DisasterMode';
import DreamMode from './DreamMode';
import FinancialProtection from './FinancialProtection';
import BranchingPaths from './BranchingPaths';
import { calculateTimeline, scenarios, formatCurrency } from '../utils/financialCalculations';
import { Clock, Brain, Target, Zap, Settings, LogOut, Save, Cloud, CloudOff, Receipt, AlertTriangle, Sparkles, Shield, GitBranch } from 'lucide-react';

interface DashboardProps {
  profile: UserProfile;
  onReset: () => void;
}

export default function Dashboard({ profile, onReset }: DashboardProps) {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [disasterMode, setDisasterMode] = useState(false);
  const [dreamMode, setDreamMode] = useState(false);
  const [showExpenseTracker, setShowExpenseTracker] = useState(false);
  const [showDisasterMode, setShowDisasterMode] = useState(false);
  const [showDreamMode, setShowDreamMode] = useState(false);
  const [showFinancialProtection, setShowFinancialProtection] = useState(false);
  const [showBranchingPaths, setShowBranchingPaths] = useState(false);
  const [timelineData, setTimelineData] = useState<any[]>([]);

  const { user, signOut } = useAuth();
  const { saveProfile, loading: profileLoading } = useUserProfile();

  useEffect(() => {
    // Calculate timeline for all scenarios
    const allTimelines = scenarios.map(scenario => ({
      scenario: scenario.name,
      data: calculateTimeline(profile, scenario, 40),
      color: scenario.color
    }));
    setTimelineData(allTimelines);
  }, [profile, disasterMode]);

  const currentScenario = scenarios[selectedScenario];
  const currentTimeline = timelineData.find(t => t.scenario === currentScenario?.name);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      await saveProfile(profile, user.id);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                Fincyq Time Machine
              </h1>
              <p className="text-white/60 mt-1">
                Exploring {profile.age}-year-old you's financial future
                {user && (
                  <span className="ml-2 text-green-400 flex items-center gap-1">
                    <Cloud size={14} />
                    {user.name}
                  </span>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {user && (
                <button
                  onClick={handleSaveProfile}
                  disabled={profileLoading}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
                >
                  {profileLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save to Cloud
                    </>
                  )}
                </button>
              )}

              {user && (
                <button
                  onClick={handleSignOut}
                  className="p-2 bg-white/10 hover:bg-red-500/20 hover:border-red-400/30 rounded-lg text-white hover:text-red-400 transition-colors border border-white/20"
                  title="Sign Out"
                >
                  <LogOut size={20} />
                </button>
              )}
              
              <button
                onClick={onReset}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                title="Reset Profile"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Tools Container */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white mb-1">Financial Tools & Scenarios</h2>
              <p className="text-white/60 text-sm">Explore different financial scenarios and track your progress</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {/* Track Expenses Button */}
              <button
                onClick={() => setShowExpenseTracker(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <Receipt size={16} />
                Track Expenses
              </button>

              {/* Financial Protection Button */}
              <button
                onClick={() => setShowFinancialProtection(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <Shield size={16} />
                Financial Protection
              </button>

              {/* Dream Mode Button */}
              <button
                onClick={() => setShowDreamMode(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                  dreamMode 
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/25' 
                    : 'bg-white/10 text-white hover:bg-yellow-500/20 hover:border-yellow-400/30 border border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={16} />
                  Dream Mode
                </div>
              </button>

              {/* Branching Paths Button */}
              <button
                onClick={() => setShowBranchingPaths(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-lg text-white font-medium transition-colors flex items-center gap-2 shadow-lg"
              >
                <GitBranch size={16} />
                Life Paths
              </button>

              {/* Disaster Mode Button */}
              <button
                onClick={() => setShowDisasterMode(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all shadow-lg ${
                  disasterMode 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/25' 
                    : 'bg-white/10 text-white hover:bg-red-500/20 hover:border-red-400/30 border border-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Disaster Mode
                </div>
              </button>
            </div>
          </div>

          {/* Active Mode Indicators */}
          {(disasterMode || dreamMode) && (
            <div className="mt-4 flex gap-3">
              {dreamMode && (
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Sparkles size={16} className="text-yellow-400" />
                  <span className="text-yellow-400 font-medium">Dream Mode Active</span>
                  <span className="text-yellow-300 text-sm">- Planning your big goals</span>
                </div>
              )}
              
              {disasterMode && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg px-4 py-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-400" />
                  <span className="text-red-400 font-medium">Disaster Mode Active</span>
                  <span className="text-red-300 text-sm">- Simulating financial emergencies</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Timeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scenario Selector */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Clock className="text-purple-400" />
                Choose Your Timeline
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {scenarios.map((scenario, index) => (
                  <button
                    key={scenario.name}
                    onClick={() => setSelectedScenario(index)}
                    className={`p-4 rounded-xl text-left transition-all ${
                      selectedScenario === index
                        ? 'bg-gradient-to-br from-purple-500/30 to-blue-500/30 border-2 border-purple-400'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-medium text-white">{scenario.name}</div>
                    <div className="text-white/60 text-sm mt-1">{scenario.description}</div>
                    <div className="flex items-center mt-2">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: scenario.color }}
                      />
                      <span className="text-xs text-white/80">
                        {(scenario.investmentReturn * 100).toFixed(1)}% return
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Visualization */}
            {timelineData.length > 0 && (
              <Timeline 
                data={timelineData} 
                selectedScenario={selectedScenario}
                profile={profile}
              />
            )}

            {/* Life Map */}
            {currentTimeline && (
              <LifeMap 
                timeline={currentTimeline.data} 
                profile={profile}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cloud Status */}
            {user && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-green-400">
                  <Cloud size={16} />
                  <span className="text-sm font-medium">Synced to Cloud</span>
                </div>
                <p className="text-white/60 text-xs mt-1">
                  Your progress is automatically saved and synced across devices
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target className="text-green-400" />
                Quick Stats
              </h3>
              
              {currentTimeline && (
                <div className="space-y-4">
                  <div>
                    <div className="text-white/60 text-sm">Net Worth in 10 years</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(currentTimeline.data[10]?.netWorth || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Net Worth at 65</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {formatCurrency(currentTimeline.data[65 - profile.age]?.netWorth || 0)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Goals Achievable</div>
                    <div className="text-lg font-semibold text-purple-400">
                      {profile.goals.length > 0 
                        ? `${Math.round((profile.goals.length / profile.goals.length) * 100)}%`
                        : 'Add goals to see'
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Educational Tips */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Brain className="text-yellow-400" />
                Learning Moment
              </h3>
              <EducationalTip profile={profile} currentScenario={currentScenario} />
            </div>

            {/* Simulation Cards */}
            <div className="space-y-4">
              <SimulationCard 
                title="Emergency Fund Status"
                value={formatCurrency(profile.currentSavings)}
                target={formatCurrency(profile.monthlyExpenses * 6)}
                progress={(profile.currentSavings / (profile.monthlyExpenses * 6)) * 100}
                color="bg-gradient-to-r from-blue-500 to-cyan-500"
              />
              
              <SimulationCard 
                title="Savings Rate"
                value={`${((profile.monthlySavings * 12 / profile.income) * 100).toFixed(1)}%`}
                target="20%"
                progress={((profile.monthlySavings * 12 / profile.income) * 100) / 20 * 100}
                color="bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>

            {/* Action Button */}
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2">
              <Zap size={20} />
              Optimize My Plan
            </button>
          </div>
        </div>
      </div>

      {/* Expense Tracker Modal */}
      {showExpenseTracker && (
        <ExpenseTracker 
          profile={profile}
          onClose={() => setShowExpenseTracker(false)}
        />
      )}

      {/* Financial Protection Modal */}
      {showFinancialProtection && (
        <FinancialProtection 
          profile={profile}
          onClose={() => setShowFinancialProtection(false)}
        />
      )}

      {/* Dream Mode Modal */}
      {showDreamMode && (
        <DreamMode 
          profile={profile}
          onClose={() => setShowDreamMode(false)}
        />
      )}

      {/* Branching Paths Modal */}
      {showBranchingPaths && (
        <BranchingPaths 
          profile={profile}
          onClose={() => setShowBranchingPaths(false)}
        />
      )}

      {/* Disaster Mode Modal */}
      {showDisasterMode && (
        <DisasterMode 
          profile={profile}
          onClose={() => setShowDisasterMode(false)}
        />
      )}
    </div>
  );
}
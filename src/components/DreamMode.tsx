import React, { useState, useEffect } from 'react';
import { UserProfile, FinancialGoal } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { formatCurrency } from '../utils/financialCalculations';
import { 
  X, 
  Sparkles, 
  Plus, 
  Target, 
  Calendar, 
  DollarSign,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Home,
  Plane,
  GraduationCap,
  Car,
  Building,
  Heart,
  Trophy,
  Star,
  Calculator,
  Zap,
  Edit3,
  Trash2,
  Save,
  Loader2
} from 'lucide-react';

interface Dream {
  id: string;
  name: string;
  cost: number;
  targetYear: number;
  category: 'home' | 'travel' | 'education' | 'car' | 'business' | 'other';
  progress?: number;
  achievable?: boolean;
  monthlyRequired?: number;
  shortfall?: number;
}

interface DreamModeProps {
  profile: UserProfile;
  onClose: () => void;
}

const dreamCategories = [
  { id: 'home', name: 'Home & Property', icon: Home, color: 'bg-blue-500', examples: ['Buy a Home', 'Down Payment', 'Home Renovation'] },
  { id: 'travel', name: 'Travel & Adventure', icon: Plane, color: 'bg-green-500', examples: ['Europe Trip', 'World Tour', 'Honeymoon'] },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-purple-500', examples: ['Masters Abroad', 'MBA', 'Certification Course'] },
  { id: 'car', name: 'Vehicle', icon: Car, color: 'bg-red-500', examples: ['Dream Car', 'Electric Vehicle', 'Motorcycle'] },
  { id: 'business', name: 'Business & Investment', icon: Building, color: 'bg-orange-500', examples: ['Start Business', 'Investment Property', 'Franchise'] },
  { id: 'other', name: 'Other Dreams', icon: Heart, color: 'bg-pink-500', examples: ['Wedding', 'Emergency Fund', 'Gadgets'] }
];

const dreamExamples = [
  { name: 'Buy a Home in Goa', cost: 2500000, category: 'home' as const },
  { name: 'Europe Trip', cost: 400000, category: 'travel' as const },
  { name: 'Launch My Startup', cost: 800000, category: 'business' as const },
  { name: 'Masters Abroad', cost: 3000000, category: 'education' as const },
  { name: 'Tesla Model 3', cost: 6000000, category: 'car' as const },
  { name: 'Dream Wedding', cost: 1500000, category: 'other' as const }
];

export default function DreamMode({ profile, onClose }: DreamModeProps) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [activeTab, setActiveTab] = useState<'add' | 'timeline' | 'calculator'>('add');
  const [editingDream, setEditingDream] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [newDream, setNewDream] = useState({
    name: '',
    cost: '',
    targetYear: new Date().getFullYear() + 5,
    category: 'home' as const
  });

  const { user } = useAuth();
  const { saveProfile } = useUserProfile();

  // Convert existing goals to dreams on mount
  useEffect(() => {
    const existingDreams: Dream[] = profile.goals.map(goal => ({
      id: goal.id,
      name: goal.name,
      cost: goal.targetAmount,
      targetYear: goal.targetYear,
      category: goal.category,
      ...calculateDreamFeasibility(goal.targetAmount, goal.targetYear, profile)
    }));
    setDreams(existingDreams);
  }, [profile]);

  const calculateDreamFeasibility = (cost: number, targetYear: number, userProfile: UserProfile) => {
    const yearsToGoal = targetYear - new Date().getFullYear();
    const monthsToGoal = yearsToGoal * 12;
    
    if (monthsToGoal <= 0) {
      return { achievable: false, monthlyRequired: 0, shortfall: cost, progress: 0 };
    }
    
    // Calculate with 7% annual return (compound interest)
    const monthlyReturn = 0.07 / 12;
    const futureValueOfCurrentSavings = userProfile.currentSavings * Math.pow(1 + monthlyReturn, monthsToGoal);
    
    // Calculate required monthly investment
    const remainingAmount = Math.max(0, cost - futureValueOfCurrentSavings);
    const monthlyRequired = remainingAmount / (((Math.pow(1 + monthlyReturn, monthsToGoal) - 1) / monthlyReturn) || 1);
    
    // Calculate current progress
    const projectedTotal = futureValueOfCurrentSavings + (userProfile.monthlySavings * ((Math.pow(1 + monthlyReturn, monthsToGoal) - 1) / monthlyReturn));
    const progress = Math.min((projectedTotal / cost) * 100, 100);
    
    const achievable = monthlyRequired <= userProfile.monthlySavings * 1.5; // Achievable with 50% increase
    const shortfall = Math.max(0, monthlyRequired - userProfile.monthlySavings);
    
    return {
      achievable,
      monthlyRequired: Math.max(0, monthlyRequired),
      shortfall,
      progress
    };
  };

  const addDream = () => {
    if (!newDream.name || !newDream.cost) return;
    
    const cost = parseFloat(newDream.cost);
    if (cost <= 0) return;
    
    const dream: Dream = {
      id: Date.now().toString(),
      name: newDream.name,
      cost,
      targetYear: newDream.targetYear,
      category: newDream.category,
      ...calculateDreamFeasibility(cost, newDream.targetYear, profile)
    };
    
    setDreams(prev => [...prev, dream]);
    setNewDream({
      name: '',
      cost: '',
      targetYear: new Date().getFullYear() + 5,
      category: 'home'
    });
  };

  const updateDream = (dreamId: string, updates: Partial<Dream>) => {
    setDreams(prev => prev.map(dream => {
      if (dream.id === dreamId) {
        const updatedDream = { ...dream, ...updates };
        return {
          ...updatedDream,
          ...calculateDreamFeasibility(updatedDream.cost, updatedDream.targetYear, profile)
        };
      }
      return dream;
    }));
    setEditingDream(null);
  };

  const deleteDream = (dreamId: string) => {
    setDreams(prev => prev.filter(dream => dream.id !== dreamId));
  };

  const addExampleDream = (example: typeof dreamExamples[0]) => {
    const dream: Dream = {
      id: Date.now().toString(),
      name: example.name,
      cost: example.cost,
      targetYear: new Date().getFullYear() + 5,
      category: example.category,
      ...calculateDreamFeasibility(example.cost, new Date().getFullYear() + 5, profile)
    };
    setDreams(prev => [...prev, dream]);
  };

  const saveDreamsToProfile = async () => {
    if (!user) {
      setSaveStatus('error');
      return;
    }
    
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Convert dreams to goals format with proper validation
      const updatedGoals: FinancialGoal[] = dreams.map(dream => ({
        id: dream.id,
        name: dream.name.trim(),
        targetAmount: Math.round(dream.cost), // Ensure it's an integer
        targetYear: dream.targetYear,
        priority: dream.achievable ? 'high' : dream.progress && dream.progress > 50 ? 'medium' : 'low',
        category: dream.category // This should now work with the updated enum
      }));
      
      const updatedProfile: UserProfile = {
        ...profile,
        goals: updatedGoals
      };
      
      console.log('Saving profile with goals:', updatedGoals);
      
      const result = await saveProfile(updatedProfile, user.id);
      
      if (result.success) {
        setSaveStatus('success');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } else {
        console.error('Save failed:', result.error);
        setSaveStatus('error');
        setTimeout(() => {
          setSaveStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving dreams:', error);
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const achievableDreams = dreams.filter(d => d.achievable).length;
  const totalDreams = dreams.length;
  const totalDreamCost = dreams.reduce((sum, dream) => sum + dream.cost, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col border border-white/20">
        {/* Header - Fixed */}
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                Dream Mode - Plan Your Big Goals
              </h2>
              <p className="text-white/60 mt-1">Turn your dreams into achievable financial goals</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={saveDreamsToProfile}
                disabled={isSaving || dreams.length === 0}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center gap-2 ${
                  isSaving 
                    ? 'bg-blue-600 cursor-wait' 
                    : saveStatus === 'success'
                      ? 'bg-green-600'
                      : saveStatus === 'error'
                        ? 'bg-red-600'
                        : dreams.length === 0
                          ? 'bg-gray-600 cursor-not-allowed opacity-50'
                          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving Dreams...
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle size={16} />
                    Dreams Saved!
                  </>
                ) : saveStatus === 'error' ? (
                  <>
                    <XCircle size={16} />
                    Save Failed
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Dreams ({dreams.length})
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Dream Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Total Dreams</div>
              <div className="text-2xl font-bold text-white">{totalDreams}</div>
              <div className="text-white/60 text-sm">Worth {formatCurrency(totalDreamCost)}</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Achievable Dreams</div>
              <div className={`text-2xl font-bold ${achievableDreams === totalDreams ? 'text-green-400' : achievableDreams > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                {achievableDreams} of {totalDreams}
              </div>
              <div className="text-white/60 text-sm">
                {totalDreams > 0 ? `${Math.round((achievableDreams / totalDreams) * 100)}% success rate` : 'Add dreams to see'}
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Dream Score</div>
              <div className="flex items-center gap-2">
                <div className={`text-2xl font-bold ${achievableDreams >= totalDreams * 0.8 ? 'text-green-400' : achievableDreams >= totalDreams * 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {achievableDreams >= totalDreams * 0.8 ? 'Excellent' : achievableDreams >= totalDreams * 0.5 ? 'Good' : 'Needs Work'}
                </div>
                <Trophy className={`${achievableDreams >= totalDreams * 0.8 ? 'text-yellow-400' : 'text-white/40'}`} size={20} />
              </div>
            </div>
          </div>

          {/* Save Status Messages */}
          {saveStatus === 'error' && (
            <div className="mt-4 bg-red-500/20 border border-red-400/30 rounded-lg p-3 flex items-center gap-2">
              <XCircle size={16} className="text-red-400" />
              <span className="text-red-400 text-sm">Failed to save dreams. Please try again.</span>
            </div>
          )}
          
          {saveStatus === 'success' && (
            <div className="mt-4 bg-green-500/20 border border-green-400/30 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-400 text-sm">Dreams saved successfully! Your goals have been updated.</span>
            </div>
          )}
        </div>

        {/* Tabs - Fixed */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {[
            { id: 'add', label: 'Add Dreams', icon: Plus },
            { id: 'timeline', label: 'Dream Timeline', icon: Calendar },
            { id: 'calculator', label: 'SIP Calculator', icon: Calculator }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 transition-colors ${
                activeTab === tab.id
                  ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
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
            {activeTab === 'add' && (
              <div className="space-y-8">
                {/* Quick Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-400" />
                    Quick Start - Popular Dreams
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dreamExamples.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => addExampleDream(example)}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-yellow-400/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-8 h-8 ${dreamCategories.find(c => c.id === example.category)?.color} rounded-lg flex items-center justify-center`}>
                            {React.createElement(dreamCategories.find(c => c.id === example.category)?.icon || Heart, { size: 16, className: "text-white" })}
                          </div>
                          <div className="text-white font-medium group-hover:text-yellow-400 transition-colors">{example.name}</div>
                        </div>
                        <div className="text-white/60 text-sm">{formatCurrency(example.cost)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add Custom Dream */}
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="text-blue-400" />
                    Add Your Custom Dream
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-white/80 mb-2 font-medium">Dream Name *</label>
                      <input
                        type="text"
                        value={newDream.name}
                        onChange={(e) => setNewDream(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="e.g., Buy a Home in Goa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 mb-2 font-medium">Estimated Cost *</label>
                      <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                        <input
                          type="number"
                          value={newDream.cost}
                          onChange={(e) => setNewDream(prev => ({ ...prev, cost: e.target.value }))}
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          placeholder="2500000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-white/80 mb-2 font-medium">Target Year *</label>
                      <input
                        type="number"
                        value={newDream.targetYear}
                        onChange={(e) => setNewDream(prev => ({ ...prev, targetYear: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        min={new Date().getFullYear()}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/80 mb-2 font-medium">Category</label>
                      <select
                        value={newDream.category}
                        onChange={(e) => setNewDream(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                      >
                        {dreamCategories.map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-gray-800">
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={addDream}
                    disabled={!newDream.name || !newDream.cost}
                    className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Add Dream to Timeline
                  </button>
                </div>

                {/* Current Dreams List */}
                {dreams.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Star className="text-purple-400" />
                      Your Dreams ({dreams.length})
                    </h3>
                    
                    <div className="space-y-3">
                      {dreams.map((dream) => {
                        const category = dreamCategories.find(c => c.id === dream.category);
                        const isEditing = editingDream === dream.id;
                        
                        return (
                          <div key={dream.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            {isEditing ? (
                              <EditDreamForm
                                dream={dream}
                                onSave={(updates) => updateDream(dream.id, updates)}
                                onCancel={() => setEditingDream(null)}
                              />
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 ${category?.color} rounded-xl flex items-center justify-center`}>
                                    {category?.icon && React.createElement(category.icon, { size: 20, className: "text-white" })}
                                  </div>
                                  <div>
                                    <div className="text-white font-semibold">{dream.name}</div>
                                    <div className="text-white/60 text-sm">
                                      {formatCurrency(dream.cost)} by {dream.targetYear}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      {dream.achievable ? (
                                        <div className="flex items-center gap-1 text-green-400 text-sm">
                                          <CheckCircle size={14} />
                                          Achievable
                                        </div>
                                      ) : dream.progress && dream.progress > 50 ? (
                                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                                          <AlertTriangle size={14} />
                                          At Risk
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-1 text-red-400 text-sm">
                                          <XCircle size={14} />
                                          Not Achievable
                                        </div>
                                      )}
                                      <span className="text-white/60 text-sm">
                                        {dream.progress?.toFixed(1)}% progress
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <div className="text-right">
                                    <div className="text-white/60 text-sm">Monthly Required</div>
                                    <div className="text-white font-bold">
                                      {formatCurrency(dream.monthlyRequired || 0)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => setEditingDream(dream.id)}
                                      className="p-2 text-white/60 hover:text-blue-400 transition-colors"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      onClick={() => deleteDream(dream.id)}
                                      className="p-2 text-white/60 hover:text-red-400 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="space-y-8">
                {dreams.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles size={64} className="text-white/20 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Dreams Added Yet</h3>
                    <p className="text-white/60 mb-6">Add some dreams to see your achievement timeline</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg text-white font-medium transition-colors"
                    >
                      Add Your First Dream
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Timeline Visualization */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                        <Calendar className="text-blue-400" />
                        Dream Achievement Timeline
                      </h3>
                      
                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 opacity-30"></div>
                        
                        <div className="space-y-6">
                          {dreams
                            .sort((a, b) => a.targetYear - b.targetYear)
                            .map((dream, index) => {
                              const category = dreamCategories.find(c => c.id === dream.category);
                              const yearsFromNow = dream.targetYear - new Date().getFullYear();
                              
                              return (
                                <div key={dream.id} className="flex items-center gap-4">
                                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                                    dream.achievable 
                                      ? 'bg-gradient-to-br from-green-500 to-emerald-500 scale-110 shadow-lg shadow-green-500/25' 
                                      : dream.progress && dream.progress > 50
                                        ? 'bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-500/25'
                                        : 'bg-gray-600/50 grayscale'
                                  }`}>
                                    {category?.icon && React.createElement(category.icon, { size: 24, className: "text-white" })}
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className={`font-semibold ${dream.achievable ? 'text-green-400' : dream.progress && dream.progress > 50 ? 'text-yellow-400' : 'text-white/50'}`}>
                                      {dream.name}
                                    </div>
                                    <div className="text-white/60 text-sm">
                                      {formatCurrency(dream.cost)} • {dream.targetYear} ({yearsFromNow} years)
                                    </div>
                                    <div className="flex items-center gap-4 mt-2">
                                      <div className="flex-1 bg-white/10 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full transition-all ${
                                            dream.achievable ? 'bg-green-500' : 
                                            dream.progress && dream.progress > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                          }`}
                                          style={{ width: `${Math.min(dream.progress || 0, 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-white/60 text-sm w-12">
                                        {dream.progress?.toFixed(0)}%
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-right">
                                    <div className="text-white/60 text-sm">Need to save</div>
                                    <div className={`font-bold ${dream.achievable ? 'text-green-400' : 'text-red-400'}`}>
                                      {formatCurrency(dream.monthlyRequired || 0)}/mo
                                    </div>
                                    {dream.shortfall && dream.shortfall > 0 && (
                                      <div className="text-red-400 text-sm">
                                        +{formatCurrency(dream.shortfall)}/mo needed
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    </div>

                    {/* Achievement Summary */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-400/30">
                        <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                          <CheckCircle size={20} />
                          Achievable Dreams
                        </h4>
                        <div className="space-y-2">
                          {dreams.filter(d => d.achievable).map(dream => (
                            <div key={dream.id} className="text-white/80 text-sm">
                              • {dream.name} ({dream.targetYear})
                            </div>
                          ))}
                          {dreams.filter(d => d.achievable).length === 0 && (
                            <p className="text-green-300 text-sm">No dreams are currently achievable with your current savings rate.</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-400/30">
                        <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                          <AlertTriangle size={20} />
                          Dreams Needing Attention
                        </h4>
                        <div className="space-y-2">
                          {dreams.filter(d => !d.achievable).map(dream => (
                            <div key={dream.id} className="text-white/80 text-sm">
                              • {dream.name} - Need {formatCurrency((dream.shortfall || 0) + (dream.monthlyRequired || 0))}/mo
                            </div>
                          ))}
                          {dreams.filter(d => !d.achievable).length === 0 && (
                            <p className="text-red-300 text-sm">All your dreams are on track! 🎉</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="space-y-8">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Calculator className="text-purple-400" />
                    SIP Calculator for Your Dreams
                  </h3>
                  
                  {dreams.length === 0 ? (
                    <div className="text-center py-8">
                      <Calculator size={48} className="text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">Add dreams to see SIP calculations</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {dreams.map(dream => {
                        const yearsToGoal = dream.targetYear - new Date().getFullYear();
                        const monthsToGoal = yearsToGoal * 12;
                        const category = dreamCategories.find(c => c.id === dream.category);
                        
                        return (
                          <div key={dream.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="flex items-center gap-4 mb-4">
                              <div className={`w-10 h-10 ${category?.color} rounded-lg flex items-center justify-center`}>
                                {category?.icon && React.createElement(category.icon, { size: 18, className: "text-white" })}
                              </div>
                              <div>
                                <div className="text-white font-semibold">{dream.name}</div>
                                <div className="text-white/60 text-sm">{formatCurrency(dream.cost)} in {yearsToGoal} years</div>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-white/60 text-sm">Monthly SIP Required</div>
                                <div className="text-lg font-bold text-blue-400">
                                  {formatCurrency(dream.monthlyRequired || 0)}
                                </div>
                              </div>
                              
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-white/60 text-sm">Current Savings Contribution</div>
                                <div className="text-lg font-bold text-white">
                                  {formatCurrency(profile.monthlySavings)}
                                </div>
                              </div>
                              
                              <div className="bg-white/5 rounded-lg p-3">
                                <div className="text-white/60 text-sm">Additional Required</div>
                                <div className={`text-lg font-bold ${dream.shortfall && dream.shortfall > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                  {dream.shortfall && dream.shortfall > 0 ? formatCurrency(dream.shortfall) : '✅ Covered'}
                                </div>
                              </div>
                            </div>
                            
                            {dream.shortfall && dream.shortfall > 0 && (
                              <div className="mt-4 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                                <div className="text-yellow-400 font-medium mb-1">💡 Suggestions:</div>
                                <div className="text-white/80 text-sm space-y-1">
                                  <div>• Increase monthly savings by {formatCurrency(dream.shortfall)}</div>
                                  <div>• Delay target by {Math.ceil(dream.shortfall / profile.monthlySavings * 12)} months</div>
                                  <div>• Consider higher-return investments (current: 7% assumed)</div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Edit Dream Form Component
function EditDreamForm({ dream, onSave, onCancel }: {
  dream: Dream;
  onSave: (updates: Partial<Dream>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: dream.name,
    cost: dream.cost.toString(),
    targetYear: dream.targetYear,
    category: dream.category
  });

  const handleSave = () => {
    onSave({
      name: formData.name,
      cost: parseFloat(formData.cost),
      targetYear: formData.targetYear,
      category: formData.category
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Dream name"
        />
        <input
          type="number"
          value={formData.cost}
          onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          placeholder="Cost"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          value={formData.targetYear}
          onChange={(e) => setFormData(prev => ({ ...prev, targetYear: parseInt(e.target.value) }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          min={new Date().getFullYear()}
        />
        <select
          value={formData.category}
          onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {dreamCategories.map(cat => (
            <option key={cat.id} value={cat.id} className="bg-gray-800">
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
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
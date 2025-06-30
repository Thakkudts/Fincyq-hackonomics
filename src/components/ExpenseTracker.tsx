import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useExpenses } from '../hooks/useExpenses';
import { formatCurrency } from '../utils/financialCalculations';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingDown, 
  TrendingUp, 
  PieChart, 
  Filter,
  Search,
  Edit3,
  Trash2,
  Save,
  X,
  ShoppingCart,
  Home,
  Car,
  Utensils,
  Gamepad2,
  Heart,
  MoreHorizontal,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ExpenseTrackerProps {
  profile: UserProfile;
  onClose: () => void;
}

const expenseCategories = [
  { id: 'food', name: 'Food & Dining', icon: Utensils, color: 'bg-orange-500', hexColor: '#f97316' },
  { id: 'housing', name: 'Housing', icon: Home, color: 'bg-blue-500', hexColor: '#3b82f6' },
  { id: 'transportation', name: 'Transportation', icon: Car, color: 'bg-green-500', hexColor: '#22c55e' },
  { id: 'shopping', name: 'Shopping', icon: ShoppingCart, color: 'bg-purple-500', hexColor: '#a855f7' },
  { id: 'entertainment', name: 'Entertainment', icon: Gamepad2, color: 'bg-pink-500', hexColor: '#ec4899' },
  { id: 'healthcare', name: 'Healthcare', icon: Heart, color: 'bg-red-500', hexColor: '#ef4444' },
  { id: 'other', name: 'Other', icon: MoreHorizontal, color: 'bg-gray-500', hexColor: '#6b7280' }
];

// Simple SVG Pie Chart Component
function CustomPieChart({ data, size = 200 }: { data: Array<{ category: string; amount: number; color: string; name: string }>, size?: number }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <PieChart size={48} className="text-white/20 mx-auto mb-2" />
          <p className="text-white/60 text-sm">No data</p>
        </div>
      </div>
    );
  }

  let cumulativePercentage = 0;
  const radius = size / 2 - 10;
  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {data.map((item, index) => {
          const percentage = (item.amount / total) * 100;
          const strokeDasharray = `${percentage} ${100 - percentage}`;
          const strokeDashoffset = -cumulativePercentage;
          
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={item.category}
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 hover:stroke-width-[25] cursor-pointer"
              style={{
                pathLength: 100,
              }}
            />
          );
        })}
      </svg>
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white font-bold text-lg">{formatCurrency(total)}</div>
          <div className="text-white/60 text-sm">Total</div>
        </div>
      </div>
    </div>
  );
}

export default function ExpenseTracker({ profile, onClose }: ExpenseTrackerProps) {
  const [activeTab, setActiveTab] = useState<'add' | 'view' | 'analytics'>('add');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0]
  });

  const { user } = useAuth();
  const { expenses, loading, addExpense, updateExpense, deleteExpense, getMonthlyTotal, getCategoryTotals } = useExpenses(user?.id);

  const handleAddExpense = async () => {
    // Reset previous states
    setSubmitStatus('idle');
    setErrorMessage('');

    // Validation
    if (!newExpense.amount || !newExpense.description || !user) {
      setSubmitStatus('error');
      setErrorMessage('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(newExpense.amount);
    if (amount <= 0) {
      setSubmitStatus('error');
      setErrorMessage('Amount must be greater than 0');
      return;
    }

    setSubmitStatus('loading');

    const expense = {
      amount: amount,
      description: newExpense.description.trim(),
      category: newExpense.category,
      date: newExpense.date,
      userId: user.id
    };

    const result = await addExpense(expense);
    
    if (result.success) {
      setSubmitStatus('success');
      setNewExpense({
        amount: '',
        description: '',
        category: 'food',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Show success for 1.5 seconds, then switch to view tab
      setTimeout(() => {
        setSubmitStatus('idle');
        setActiveTab('view');
      }, 1500);
    } else {
      setSubmitStatus('error');
      setErrorMessage(result.error || 'Failed to add expense');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage('');
      }, 3000);
    }
  };

  const handleUpdateExpense = async (expenseId: string, updates: any) => {
    await updateExpense(expenseId, updates);
    setEditingExpense(null);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentMonthTotal = getMonthlyTotal();
  const categoryTotals = getCategoryTotals();
  const budgetUsed = (currentMonthTotal / profile.monthlyExpenses) * 100;

  // Check if form is valid
  const isFormValid = newExpense.amount && newExpense.description && parseFloat(newExpense.amount || '0') > 0;

  // Prepare pie chart data
  const pieChartData = Object.entries(categoryTotals).map(([categoryId, amount]) => {
    const category = expenseCategories.find(c => c.id === categoryId);
    return {
      category: categoryId,
      amount,
      color: category?.hexColor || '#6b7280',
      name: category?.name || 'Unknown'
    };
  }).filter(item => item.amount > 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl max-w-5xl w-full max-h-[95vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                Track Your Expenses
              </h2>
              <p className="text-white/60 mt-1">Monitor your spending and stay on budget</p>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Budget Overview */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">This Month</div>
              <div className="text-2xl font-bold text-white">{formatCurrency(currentMonthTotal)}</div>
              <div className="text-white/60 text-sm">of {formatCurrency(profile.monthlyExpenses)} budget</div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Budget Used</div>
              <div className={`text-2xl font-bold ${budgetUsed > 100 ? 'text-red-400' : budgetUsed > 80 ? 'text-yellow-400' : 'text-green-400'}`}>
                {budgetUsed.toFixed(1)}%
              </div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-white/60 text-sm">Remaining</div>
              <div className={`text-2xl font-bold ${profile.monthlyExpenses - currentMonthTotal < 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(profile.monthlyExpenses - currentMonthTotal)}
              </div>
              <div className="text-white/60 text-sm">
                {profile.monthlyExpenses - currentMonthTotal < 0 ? 'Over budget' : 'Available'}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'add', label: 'Add Expense', icon: Plus },
            { id: 'view', label: 'View Expenses', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: PieChart }
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

        {/* Content - Increased height and better scrolling */}
        <div className="p-6 h-[calc(95vh-320px)] overflow-y-auto">
          {activeTab === 'add' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/80 mb-2 font-medium">
                    Amount <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white/80 mb-2 font-medium">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2 font-medium">
                  Description <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  placeholder="What did you spend on? (e.g., Rent, Groceries, Gas)"
                  required
                />
              </div>

              <div>
                <label className="block text-white/80 mb-3 font-medium">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  {expenseCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setNewExpense(prev => ({ ...prev, category: category.id }))}
                      className={`p-4 rounded-xl border transition-all ${
                        newExpense.category === category.id
                          ? 'border-purple-400 bg-purple-400/20 scale-105 shadow-lg shadow-purple-500/25'
                          : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30 hover:scale-102'
                      }`}
                    >
                      <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <category.icon size={18} className="text-white" />
                      </div>
                      <div className="text-white text-sm font-medium text-center">{category.name}</div>
                    </button>
                  ))}
                </div>

                {/* Submit Button - Prominently placed */}
                <button
                  onClick={handleAddExpense}
                  disabled={!isFormValid || submitStatus === 'loading'}
                  className={`w-full px-8 py-4 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-3 text-lg shadow-xl ${
                    !isFormValid 
                      ? 'bg-gray-600/50 cursor-not-allowed opacity-50 border border-gray-500/30' 
                      : submitStatus === 'loading'
                        ? 'bg-blue-600 cursor-wait animate-pulse'
                        : submitStatus === 'success'
                          ? 'bg-green-600 scale-105'
                          : submitStatus === 'error'
                            ? 'bg-red-600 animate-shake'
                            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-purple-500/25 transform hover:scale-105 active:scale-95'
                  }`}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding Expense...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <CheckCircle size={20} />
                      Expense Added Successfully!
                    </>
                  ) : submitStatus === 'error' ? (
                    <>
                      <AlertCircle size={20} />
                      Try Again
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Submit Expense
                    </>
                  )}
                </button>
                
                {!isFormValid && (
                  <div className="mt-4 bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                    <p className="text-blue-400 text-sm text-center">
                      💡 Please fill in all required fields marked with <span className="text-red-400">*</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Error/Success Messages */}
              {(submitStatus === 'error' && errorMessage) && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                  <p className="text-red-400 font-medium">{errorMessage}</p>
                </div>
              )}

              {submitStatus === 'success' && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle size={20} className="text-green-400 flex-shrink-0" />
                  <p className="text-green-400 font-medium">Expense added successfully! Redirecting to view expenses...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'view' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    placeholder="Search expenses..."
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="all" className="bg-gray-800">All Categories</option>
                  {expenseCategories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-gray-800">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expenses List */}
              <div className="space-y-3">
                {loading && (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Loading expenses...</p>
                  </div>
                )}

                {!loading && filteredExpenses.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign size={48} className="text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-lg font-medium">No expenses found</p>
                    <p className="text-white/40 text-sm mt-2">
                      {expenses.length === 0 
                        ? "Start tracking your spending to see insights" 
                        : "Try adjusting your search or category filter"
                      }
                    </p>
                    {expenses.length === 0 && (
                      <button
                        onClick={() => setActiveTab('add')}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-colors"
                      >
                        Add Your First Expense
                      </button>
                    )}
                  </div>
                ) : (
                  filteredExpenses.map((expense) => {
                    const category = expenseCategories.find(c => c.id === expense.category);
                    const isEditing = editingExpense === expense.id;
                    
                    return (
                      <div key={expense.id} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-colors">
                        {isEditing ? (
                          <EditExpenseForm
                            expense={expense}
                            onSave={(updates) => handleUpdateExpense(expense.id, updates)}
                            onCancel={() => setEditingExpense(null)}
                          />
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 ${category?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                                {category?.icon && <category.icon size={16} className="text-white" />}
                              </div>
                              <div>
                                <div className="text-white font-medium">{expense.description}</div>
                                <div className="text-white/60 text-sm">
                                  {category?.name} • {new Date(expense.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="text-white font-bold">{formatCurrency(expense.amount)}</div>
                              </div>
                              
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setEditingExpense(expense.id)}
                                  className="p-1 text-white/60 hover:text-blue-400 transition-colors"
                                  title="Edit expense"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteExpense(expense.id)}
                                  className="p-1 text-white/60 hover:text-red-400 transition-colors"
                                  title="Delete expense"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
              {/* Pie Chart Section */}
              {pieChartData.length > 0 ? (
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Pie Chart */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                      <PieChart className="text-purple-400" />
                      Spending Distribution
                    </h3>
                    
                    <div className="flex justify-center">
                      <CustomPieChart data={pieChartData} size={280} />
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-6">Category Breakdown</h3>
                    
                    <div className="space-y-4">
                      {pieChartData
                        .sort((a, b) => b.amount - a.amount)
                        .map((item) => {
                          const percentage = ((item.amount / currentMonthTotal) * 100);
                          const category = expenseCategories.find(c => c.id === item.category);
                          
                          return (
                            <div key={item.category} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: item.color }}
                                />
                                <div className="flex items-center gap-2">
                                  {category?.icon && (
                                    <div className={`w-6 h-6 ${category.color} rounded-md flex items-center justify-center`}>
                                      <category.icon size={12} className="text-white" />
                                    </div>
                                  )}
                                  <span className="text-white font-medium">{item.name}</span>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-white font-bold">{formatCurrency(item.amount)}</div>
                                <div className="text-white/60 text-sm">{percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <PieChart size={64} className="text-white/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Spending Data</h3>
                  <p className="text-white/60 mb-6">Add some expenses to see your spending analytics</p>
                  <button
                    onClick={() => setActiveTab('add')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-colors"
                  >
                    Add Your First Expense
                  </button>
                </div>
              )}

              {/* Category Breakdown List */}
              {Object.entries(categoryTotals).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Detailed Breakdown</h3>
                  <div className="space-y-3">
                    {Object.entries(categoryTotals).map(([categoryId, amount]) => {
                      const category = expenseCategories.find(c => c.id === categoryId);
                      const percentage = currentMonthTotal > 0 ? (amount / currentMonthTotal) * 100 : 0;
                      
                      return (
                        <div key={categoryId} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 ${category?.color || 'bg-gray-500'} rounded-lg flex items-center justify-center`}>
                                {category?.icon && <category.icon size={14} className="text-white" />}
                              </div>
                              <span className="text-white font-medium">{category?.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-white font-bold">{formatCurrency(amount)}</div>
                              <div className="text-white/60 text-sm">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${category?.color || 'bg-gray-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Spending Insights */}
              {currentMonthTotal > 0 && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-400/30">
                  <h3 className="text-lg font-semibold text-white mb-4">💡 Spending Insights</h3>
                  <div className="space-y-3 text-white/80">
                    {budgetUsed > 100 && (
                      <p className="flex items-center gap-2">
                        <TrendingUp className="text-red-400" size={16} />
                        You're over budget by {formatCurrency(currentMonthTotal - profile.monthlyExpenses)}
                      </p>
                    )}
                    {budgetUsed < 80 && (
                      <p className="flex items-center gap-2">
                        <TrendingDown className="text-green-400" size={16} />
                        Great job! You're under budget with {formatCurrency(profile.monthlyExpenses - currentMonthTotal)} remaining
                      </p>
                    )}
                    {Object.entries(categoryTotals).length > 0 && (
                      <p>
                        Your largest expense category is{' '}
                        <span className="font-semibold text-white">
                          {expenseCategories.find(c => c.id === Object.entries(categoryTotals).sort(([,a], [,b]) => b - a)[0]?.[0])?.name || 'Unknown'}
                        </span>{' '}
                        at {formatCurrency(Math.max(...Object.values(categoryTotals)))}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Edit Expense Form Component
function EditExpenseForm({ expense, onSave, onCancel }: {
  expense: any;
  onSave: (updates: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    amount: expense.amount.toString(),
    description: expense.description,
    category: expense.category,
    date: expense.date
  });

  const handleSave = () => {
    onSave({
      amount: parseFloat(formData.amount),
      description: formData.description,
      category: formData.category,
      date: formData.date
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>
      
      <input
        type="text"
        value={formData.description}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      />
      
      <select
        value={formData.category}
        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
        className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
      >
        {expenseCategories.map(cat => (
          <option key={cat.id} value={cat.id} className="bg-gray-800">
            {cat.name}
          </option>
        ))}
      </select>
      
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
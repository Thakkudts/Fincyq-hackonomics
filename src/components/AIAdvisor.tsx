import React, { useState } from 'react';
import { UserProfile, SavedAIAdvice } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useAIAdvice, categorizePrompt } from '../hooks/useAIAdvice';
import { isHuggingFaceConfigured } from '../lib/huggingface';
import { formatCurrency } from '../utils/financialCalculations';
import { 
  Brain, 
  Send, 
  Save, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Clock, 
  Tag, 
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle,
  Star,
  TrendingUp,
  X,
  Copy,
  ExternalLink,
  RefreshCw,
  Zap,
  Settings,
  Cpu
} from 'lucide-react';

interface AIAdvisorProps {
  profile: UserProfile;
  onConvertToDream?: (advice: SavedAIAdvice) => void;
}

export default function AIAdvisor({ profile, onConvertToDream }: AIAdvisorProps) {
  const [activeTab, setActiveTab] = useState<'ask' | 'saved'>('ask');
  const [question, setQuestion] = useState('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');

  const { user } = useAuth();
  const { 
    savedAdvice, 
    loading, 
    saveAdvice, 
    updateAdvice, 
    deleteAdvice, 
    generateAIAdvice, 
    regenerateAdvice,
    isOpenAIConfigured: apiConfigured 
  } = useAIAdvice(user?.id);

  const handleAskQuestion = async () => {
    if (!question.trim() || isGenerating) return;

    setIsGenerating(true);
    setCurrentResponse('');
    setLastPrompt(question.trim());

    const result = await generateAIAdvice(question.trim(), profile);
    
    if (result.success && result.advice) {
      setCurrentResponse(result.advice);
    } else {
      setCurrentResponse(`**Error generating advice:**\n\n${result.error || 'Please try again.'}`);
    }
    
    setIsGenerating(false);
  };

  const handleRegenerateAdvice = async () => {
    if (!lastPrompt || isGenerating) return;

    setIsGenerating(true);
    setCurrentResponse('');

    const result = await regenerateAdvice(lastPrompt, profile);
    
    if (result.success && result.advice) {
      setCurrentResponse(result.advice);
    } else {
      setCurrentResponse(`**Error regenerating advice:**\n\n${result.error || 'Please try again.'}`);
    }
    
    setIsGenerating(false);
  };

  const handleSaveAdvice = async () => {
    if (!currentResponse || !user || isSaving) return;

    setIsSaving(true);

    const category = categorizePrompt(lastPrompt || question);
    const result = await saveAdvice({
      userId: user.id,
      prompt: lastPrompt || question,
      response: currentResponse,
      category
    });

    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setQuestion('');
      setCurrentResponse('');
      setLastPrompt('');
    }

    setIsSaving(false);
  };

  const handleUpdateCategory = async (adviceId: string, newCategory: string) => {
    await updateAdvice(adviceId, { category: newCategory });
    setEditingAdvice(null);
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(currentResponse);
  };

  const formatResponse = (response: string) => {
    // Format the response with proper styling for bold text and structure
    return response
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          // Main headings
          return (
            <h3 key={index} className="text-lg font-bold text-white mt-4 mb-2">
              {line.replace(/\*\*/g, '')}
            </h3>
          );
        } else if (line.includes('**')) {
          // Inline bold text
          const parts = line.split(/(\*\*[^*]+\*\*)/);
          return (
            <p key={index} className="text-white/90 mb-2 leading-relaxed">
              {parts.map((part, partIndex) => 
                part.startsWith('**') && part.endsWith('**') ? (
                  <span key={partIndex} className="font-bold text-yellow-400">
                    {part.replace(/\*\*/g, '')}
                  </span>
                ) : (
                  part
                )
              )}
            </p>
          );
        } else if (line.startsWith('•')) {
          // Bullet points
          return (
            <div key={index} className="flex items-start gap-2 mb-1 ml-4">
              <div className="w-1 h-1 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
              <span className="text-white/80 text-sm">{line.substring(1).trim()}</span>
            </div>
          );
        } else if (line.trim() === '') {
          return <div key={index} className="h-2" />;
        } else {
          return (
            <p key={index} className="text-white/90 mb-2 leading-relaxed">
              {line}
            </p>
          );
        }
      });
  };

  const categoryColors = {
    'Retirement': 'bg-purple-500',
    'Investment': 'bg-green-500',
    'Real Estate': 'bg-blue-500',
    'Travel': 'bg-orange-500',
    'Tax Planning': 'bg-red-500',
    'Emergency Fund': 'bg-yellow-500',
    'Insurance': 'bg-pink-500',
    'Debt Management': 'bg-gray-500',
    'Business': 'bg-indigo-500',
    'Education': 'bg-teal-500',
    'General': 'bg-slate-500'
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Brain size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">AI-Powered Financial Advisor</h2>
            <p className="text-white/60">Get personalized financial advice powered by Mistral AI</p>
          </div>
          
          {/* API Status Indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isHuggingFaceConfigured ? 'bg-green-400' : 'bg-yellow-400'}`} />
            <span className="text-white/60 text-xs flex items-center gap-1">
              <Cpu size={12} />
              {isHuggingFaceConfigured ? 'Mistral AI' : 'Fallback Mode'}
            </span>
          </div>
        </div>

        {/* Configuration Notice */}
        {!isHuggingFaceConfigured && (
          <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <Settings size={16} />
              <span className="font-medium">Using Fallback Mode</span>
            </div>
            <p className="text-yellow-300 text-xs mt-1">
              Add VITE_HUGGINGFACE_API_KEY to your .env file for real AI-powered responses from Mistral AI
            </p>
            <p className="text-yellow-300 text-xs mt-1">
              Get your free API key at: <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">huggingface.co/settings/tokens</a>
            </p>
          </div>
        )}

        {isHuggingFaceConfigured && (
          <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-green-400 text-sm">
              <Cpu size={16} />
              <span className="font-medium">Powered by Mistral AI via Hugging Face</span>
            </div>
            <p className="text-green-300 text-xs mt-1">
              Using advanced language models for personalized financial advice
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'ask'
                ? 'bg-purple-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <MessageSquare size={16} />
            Ask Question
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-purple-500 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Save size={16} />
            Saved Advice ({savedAdvice.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'ask' && (
          <div className="space-y-6">
            {/* Question Input */}
            <div>
              <label className="block text-white/80 mb-3 font-medium">
                What would you like to know about your finances?
              </label>
              <div className="space-y-4">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                  rows={3}
                  placeholder="Hey, I want to retire at 40 and travel to 10 countries. What should I start doing?"
                />
                
                <button
                  onClick={handleAskQuestion}
                  disabled={!question.trim() || isGenerating}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {isHuggingFaceConfigured ? 'Generating AI Advice...' : 'Generating Advice...'}
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      🤖 Get AI Advice
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            {!currentResponse && !isGenerating && (
              <div>
                <h3 className="text-white font-medium mb-3">💡 Quick Questions:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "How can I save ₹1 crore by age 35?",
                    "Should I buy a house or keep renting?",
                    "What's the best investment strategy for my age?",
                    "How much should I invest in mutual funds?",
                    "How to plan for early retirement?",
                    "Best tax-saving investments for this year?"
                  ].map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestion(suggestion)}
                      className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white text-left text-sm transition-colors border border-white/10 hover:border-purple-400/30"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Response */}
            {(currentResponse || isGenerating) && (
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-6 border border-blue-400/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Sparkles className="text-yellow-400" />
                    {isHuggingFaceConfigured ? 'Mistral AI Financial Advisor' : 'Financial Advisor (Fallback)'}
                  </h3>
                  
                  {currentResponse && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyResponse}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors"
                        title="Copy response"
                      >
                        <Copy size={16} />
                      </button>
                      {lastPrompt && (
                        <button
                          onClick={handleRegenerateAdvice}
                          disabled={isGenerating}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/60 hover:text-white transition-colors disabled:opacity-50"
                          title="Regenerate advice"
                        >
                          <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                
                {isGenerating ? (
                  <div className="flex items-center gap-3 py-8">
                    <Loader2 size={24} className="animate-spin text-purple-400" />
                    <div>
                      <div className="text-white font-medium">
                        {isHuggingFaceConfigured ? 'Analyzing your financial profile with Mistral AI...' : 'Analyzing your financial profile...'}
                      </div>
                      <div className="text-white/60 text-sm">
                        {isHuggingFaceConfigured ? 'This may take 10-30 seconds for the model to load' : 'This may take a few seconds'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-invert max-w-none">
                    {formatResponse(currentResponse)}
                  </div>
                )}
                
                {currentResponse && !isGenerating && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                    <button
                      onClick={handleSaveAdvice}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          💾 Save Advice
                        </>
                      )}
                    </button>
                    
                    {lastPrompt && (
                      <button
                        onClick={handleRegenerateAdvice}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} className={isGenerating ? 'animate-spin' : ''} />
                        🔁 Regenerate
                      </button>
                    )}
                    
                    {onConvertToDream && (
                      <button
                        onClick={() => {
                          // This would open Dream Mode with pre-filled data
                          console.log('Convert to dream plan');
                        }}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Star size={16} />
                        Turn into Dream
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle size={20} className="text-green-400" />
                <span className="text-green-400 font-medium">Advice saved successfully!</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="space-y-6">
            {loading && (
              <div className="text-center py-8">
                <Loader2 size={32} className="animate-spin text-purple-400 mx-auto mb-4" />
                <p className="text-white/60">Loading your saved advice...</p>
              </div>
            )}

            {!loading && savedAdvice.length === 0 && (
              <div className="text-center py-12">
                <Brain size={64} className="text-white/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Saved Advice Yet</h3>
                <p className="text-white/60 mb-6">Ask your first question to get personalized financial advice</p>
                <button
                  onClick={() => setActiveTab('ask')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-lg text-white font-medium transition-colors"
                >
                  Ask Your First Question
                </button>
              </div>
            )}

            {!loading && savedAdvice.length > 0 && (
              <div className="space-y-4">
                {savedAdvice.map((advice) => (
                  <div key={advice.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {editingAdvice === advice.id ? (
                              <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="px-2 py-1 rounded bg-white/10 border border-white/20 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                              >
                                {Object.keys(categoryColors).map(cat => (
                                  <option key={cat} value={cat} className="bg-gray-800">
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded text-xs font-medium text-white ${categoryColors[advice.category as keyof typeof categoryColors] || 'bg-slate-500'}`}>
                                {advice.category || 'General'}
                              </span>
                            )}
                          </div>
                          <span className="text-white/40 text-xs flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(advice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <h4 className="text-white font-medium mb-3 leading-relaxed">
                          "{advice.prompt}"
                        </h4>
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        {editingAdvice === advice.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateCategory(advice.id, editCategory)}
                              className="p-2 text-green-400 hover:text-green-300 transition-colors"
                              title="Save category"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => setEditingAdvice(null)}
                              className="p-2 text-white/60 hover:text-white transition-colors"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingAdvice(advice.id);
                                setEditCategory(advice.category);
                              }}
                              className="p-2 text-white/60 hover:text-blue-400 transition-colors"
                              title="Edit category"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteAdvice(advice.id)}
                              className="p-2 text-white/60 hover:text-red-400 transition-colors"
                              title="Delete advice"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="prose prose-invert max-w-none text-sm">
                        {formatResponse(advice.response)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => navigator.clipboard.writeText(advice.response)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white/60 hover:text-white text-xs transition-colors flex items-center gap-1"
                      >
                        <Copy size={12} />
                        Copy
                      </button>
                      
                      {onConvertToDream && (
                        <button
                          onClick={() => onConvertToDream(advice)}
                          className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 rounded text-yellow-400 hover:text-yellow-300 text-xs transition-colors flex items-center gap-1"
                        >
                          <Star size={12} />
                          Turn into Dream
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
import React from 'react';
import { Badge } from '../types';
import { badgeCategories, rarityColors } from '../data/badges';
import { X, Star, Trophy, Target, Calendar, CheckCircle, Lock } from 'lucide-react';

interface BadgeModalProps {
  badge: Badge;
  onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  const category = badgeCategories[badge.category];
  const progressPercentage = (badge.progress / badge.maxProgress) * 100;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl max-w-md w-full border border-white/20 overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${rarityColors[badge.rarity]} p-6 relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors"
          >
            <X size={16} />
          </button>

          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              {badge.unlocked ? (
                <span className="text-4xl">{badge.emoji}</span>
              ) : (
                <Lock size={32} className="text-white/60" />
              )}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{badge.name}</h2>
            
            <div className="flex items-center justify-center gap-2 text-white/80">
              <Star size={16} className="fill-current" />
              <span className="text-sm font-medium uppercase tracking-wide">
                {badge.rarity} Badge
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-white font-semibold mb-2">Description</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              {badge.description}
            </p>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-white font-semibold mb-2">Category</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${category.color} text-white`}>
              <span>{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          </div>

          {/* Criteria */}
          <div>
            <h3 className="text-white font-semibold mb-2">How to Unlock</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <Target size={16} className="text-blue-400" />
                <span className="text-white/80 text-sm">{badge.criteria.description}</span>
              </div>
              
              {!badge.unlocked && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-white/60">
                    <span>Progress</span>
                    <span>{badge.progress.toLocaleString()} / {badge.maxProgress.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-center text-xs text-white/60">
                    {progressPercentage.toFixed(1)}% Complete
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <h3 className="text-white font-semibold mb-2">Status</h3>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
              badge.unlocked 
                ? 'bg-green-500/20 border border-green-400/30' 
                : 'bg-orange-500/20 border border-orange-400/30'
            }`}>
              {badge.unlocked ? (
                <>
                  <CheckCircle size={16} className="text-green-400" />
                  <span className="text-green-400 text-sm font-medium">Unlocked</span>
                  {badge.unlockedAt && (
                    <span className="text-green-300 text-xs ml-auto">
                      {new Date(badge.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Lock size={16} className="text-orange-400" />
                  <span className="text-orange-400 text-sm font-medium">Locked</span>
                </>
              )}
            </div>
          </div>

          {/* Tips */}
          {!badge.unlocked && (
            <div>
              <h3 className="text-white font-semibold mb-2">Tips to Unlock</h3>
              <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                <p className="text-blue-300 text-sm">
                  {getBadgeTips(badge)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Trophy size={16} />
            {badge.unlocked ? 'Celebrate Achievement' : 'Start Working Toward This Badge'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getBadgeTips(badge: Badge): string {
  const tips = {
    'money-magnet': 'Start by setting up automatic transfers to your savings account. Even small amounts add up over time!',
    'crisis-crusher': 'Build your emergency fund first, then practice disaster scenarios to improve your financial resilience.',
    'risk-ready': 'Take time to understand your investment comfort level. This helps you make better financial decisions.',
    'planner-pro': 'Set SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound) for better success rates.',
    'emergency-ace': 'Aim to save one month of expenses at a time. Break it down into smaller, manageable targets.',
    'insurance-insider': 'Explore the Financial Protection section to learn about different types of insurance and coverage.',
    'dream-builder': 'Use Dream Mode to turn your aspirations into concrete financial plans with timelines.',
    'timeline-explorer': 'Try different scenarios in the timeline simulator to see how choices affect your future.',
    'expense-tracker': 'Log every expense, no matter how small. Consistency is key to building this habit.',
    'ai-advisor': 'Ask specific questions about your financial situation to get personalized advice.',
    'millionaire-mindset': 'Focus on increasing your income and savings rate. Invest consistently for compound growth.',
    'financial-guru': 'Complete all sections of the app and maintain good financial habits consistently.'
  };

  return tips[badge.id as keyof typeof tips] || 'Keep working on your financial goals and you\'ll unlock this badge soon!';
}
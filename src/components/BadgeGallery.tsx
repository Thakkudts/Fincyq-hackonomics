import React, { useState } from 'react';
import { Badge } from '../types';
import { badgeCategories, rarityColors, rarityGlow } from '../data/badges';
import { Trophy, Lock, Star, Award, Target, Shield } from 'lucide-react';

interface BadgeGalleryProps {
  badges: Badge[];
  earnedCount: number;
  totalCount: number;
  completionPercentage: number;
  onBadgeClick?: (badge: Badge) => void;
}

export default function BadgeGallery({ 
  badges, 
  earnedCount, 
  totalCount, 
  completionPercentage,
  onBadgeClick 
}: BadgeGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyEarned, setShowOnlyEarned] = useState(false);

  const filteredBadges = badges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const earnedMatch = !showOnlyEarned || badge.unlocked;
    return categoryMatch && earnedMatch;
  });

  const categories = Object.entries(badgeCategories);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy size={20} className="text-white" />
              </div>
              Financial Safeguard Badges
            </h2>
            <p className="text-white/60 mt-1">Unlock achievements as you master your finances</p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">{earnedCount}/{totalCount}</div>
            <div className="text-white/60 text-sm">Badges Earned</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-white/60 text-sm mb-2">
            <span>Overall Progress</span>
            <span>{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            All Categories
          </button>
          
          {categories.map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                selectedCategory === key
                  ? `${category.color} text-white`
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
          
          <button
            onClick={() => setShowOnlyEarned(!showOnlyEarned)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              showOnlyEarned
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award size={16} />
            Earned Only
          </button>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="p-6">
        {filteredBadges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy size={64} className="text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No badges found</h3>
            <p className="text-white/60">Try adjusting your filters or start completing financial milestones!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onClick={() => onBadgeClick?.(badge)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BadgeCardProps {
  badge: Badge;
  onClick?: () => void;
}

function BadgeCard({ badge, onClick }: BadgeCardProps) {
  const progressPercentage = (badge.progress / badge.maxProgress) * 100;
  const isUnlocked = badge.unlocked;
  const category = badgeCategories[badge.category];

  return (
    <button
      onClick={onClick}
      className={`relative p-6 rounded-2xl border transition-all duration-300 text-left group hover:scale-105 ${
        isUnlocked
          ? `bg-gradient-to-br ${rarityColors[badge.rarity]} border-white/30 ${rarityGlow[badge.rarity]} shadow-xl`
          : 'bg-white/5 border-white/10 hover:bg-white/10 grayscale'
      }`}
    >
      {/* Rarity Indicator */}
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]} animate-pulse`} />
        </div>
      )}

      {/* Badge Icon */}
      <div className="flex items-center justify-center mb-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all ${
          isUnlocked 
            ? 'bg-white/20 scale-110' 
            : 'bg-white/5'
        }`}>
          {isUnlocked ? badge.emoji : <Lock size={24} className="text-white/40" />}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center mb-4">
        <h3 className={`font-bold mb-2 ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
          {badge.name}
        </h3>
        <p className={`text-sm ${isUnlocked ? 'text-white/80' : 'text-white/40'}`}>
          {badge.description}
        </p>
      </div>

      {/* Category Badge */}
      <div className="flex justify-center mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isUnlocked ? category.color : 'bg-white/10'
        } text-white`}>
          {category.icon} {category.name}
        </span>
      </div>

      {/* Progress Bar */}
      {!isUnlocked && (
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

      {/* Unlocked Indicator */}
      {isUnlocked && (
        <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-medium">
          <Star size={16} className="fill-current" />
          Unlocked!
        </div>
      )}

      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity ${
        isUnlocked 
          ? 'bg-white/10 opacity-0 group-hover:opacity-100' 
          : 'bg-white/5 opacity-0 group-hover:opacity-100'
      }`} />
    </button>
  );
}
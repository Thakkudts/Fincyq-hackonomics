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
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 w-full h-full flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy size={16} className="text-white" />
              </div>
              Financial Safeguard Badges
            </h2>
            <p className="text-white/60 text-sm mt-1">Unlock achievements as you master your finances</p>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-yellow-400">{earnedCount}/{totalCount}</div>
            <div className="text-white/60 text-xs">Badges Earned</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-white/60 text-xs mb-1">
            <span>Overall Progress</span>
            <span>{completionPercentage}% Complete</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors text-sm ${
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
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm ${
                selectedCategory === key
                  ? `${category.color} text-white`
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xs">{category.icon}</span>
              {category.name}
            </button>
          ))}
          
          <button
            onClick={() => setShowOnlyEarned(!showOnlyEarned)}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm ${
              showOnlyEarned
                ? 'bg-green-500 text-white'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award size={12} />
            Earned Only
          </button>
        </div>
      </div>

      {/* Badge Grid - Scrollable with proper height */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {filteredBadges.length === 0 ? (
            <div className="text-center py-12">
              <Trophy size={48} className="text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No badges found</h3>
              <p className="text-white/60 text-sm">Try adjusting your filters or start completing financial milestones!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      className={`relative p-4 rounded-xl border transition-all duration-300 text-left group hover:scale-105 w-full h-auto min-h-[200px] flex flex-col ${
        isUnlocked
          ? `bg-gradient-to-br ${rarityColors[badge.rarity]} border-white/30 ${rarityGlow[badge.rarity]} shadow-lg`
          : 'bg-white/5 border-white/10 hover:bg-white/10 grayscale'
      }`}
    >
      {/* Rarity Indicator */}
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${rarityColors[badge.rarity]} animate-pulse`} />
        </div>
      )}

      {/* Badge Icon */}
      <div className="flex items-center justify-center mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
          isUnlocked 
            ? 'bg-white/20 scale-110' 
            : 'bg-white/5'
        }`}>
          {isUnlocked ? badge.emoji : <Lock size={20} className="text-white/40" />}
        </div>
      </div>

      {/* Badge Info */}
      <div className="text-center mb-3 flex-1">
        <h3 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-white' : 'text-white/50'}`}>
          {badge.name}
        </h3>
        <p className={`text-xs leading-tight ${isUnlocked ? 'text-white/80' : 'text-white/40'}`}>
          {badge.description}
        </p>
      </div>

      {/* Category Badge */}
      <div className="flex justify-center mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          isUnlocked ? category.color : 'bg-white/10'
        } text-white`}>
          <span className="text-xs">{category.icon}</span> {category.name}
        </span>
      </div>

      {/* Progress Bar */}
      {!isUnlocked && (
        <div className="space-y-1 mt-auto">
          <div className="flex justify-between text-xs text-white/60">
            <span>Progress</span>
            <span>{badge.progress.toLocaleString()} / {badge.maxProgress.toLocaleString()}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-500"
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
        <div className="flex items-center justify-center gap-1 text-green-400 text-xs font-medium mt-auto">
          <Star size={12} className="fill-current" />
          Unlocked!
        </div>
      )}

      {/* Hover Effect */}
      <div className={`absolute inset-0 rounded-xl transition-opacity ${
        isUnlocked 
          ? 'bg-white/10 opacity-0 group-hover:opacity-100' 
          : 'bg-white/5 opacity-0 group-hover:opacity-100'
      }`} />
    </button>
  );
}
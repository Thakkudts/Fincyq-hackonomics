import React from 'react';
import { Badge } from '../types';
import { Trophy, Star, Target, Award } from 'lucide-react';

interface BadgeSummaryWidgetProps {
  earnedBadges: Badge[];
  totalBadges: number;
  completionPercentage: number;
  recentBadges: Badge[];
  onViewAll: () => void;
}

export default function BadgeSummaryWidget({
  earnedBadges,
  totalBadges,
  completionPercentage,
  recentBadges,
  onViewAll
}: BadgeSummaryWidgetProps) {
  const earnedCount = earnedBadges.length;
  const nextBadge = getNextBadgeToUnlock(earnedBadges, totalBadges);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="text-yellow-400" />
          Achievement Progress
        </h3>
        <button
          onClick={onViewAll}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white/80">Badges Earned</span>
          <span className="text-white font-bold">{earnedCount}/{totalBadges}</span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-3 mb-2">
          <div 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <div className="text-center text-sm text-white/60">
          {completionPercentage}% Complete
        </div>
      </div>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
            <Star className="text-yellow-400" size={16} />
            Recently Earned
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {recentBadges.slice(0, 3).map((badge) => (
              <div
                key={badge.id}
                className="flex-shrink-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-400/30 min-w-[100px]"
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{badge.emoji}</div>
                  <div className="text-white text-xs font-medium truncate">
                    {badge.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Badge to Unlock */}
      {nextBadge && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h4 className="text-white/80 text-sm font-medium mb-3 flex items-center gap-2">
            <Target className="text-blue-400" size={16} />
            Next Achievement
          </h4>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-lg grayscale">
              {nextBadge.emoji}
            </div>
            <div className="flex-1">
              <div className="text-white font-medium text-sm">{nextBadge.name}</div>
              <div className="text-white/60 text-xs">{nextBadge.description}</div>
              <div className="mt-1">
                <div className="w-full bg-white/10 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-400 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${(nextBadge.progress / nextBadge.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <button
        onClick={onViewAll}
        className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
      >
        <Award size={16} />
        View All Achievements
      </button>
    </div>
  );
}

function getNextBadgeToUnlock(earnedBadges: Badge[], totalBadges: number): Badge | null {
  // This would typically come from the badges hook
  // For now, return null as placeholder
  return null;
}
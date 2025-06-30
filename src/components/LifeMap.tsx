import React from 'react';
import { UserProfile } from '../types';
import { formatCurrency } from '../utils/financialCalculations';
import { Home, GraduationCap, Plane, Building, Trophy, MapPin } from 'lucide-react';

interface LifeMapProps {
  timeline: any[];
  profile: UserProfile;
}

const goalIcons = {
  home: Home,
  education: GraduationCap,
  travel: Plane,
  business: Building,
  retirement: Trophy,
  other: MapPin
};

export default function LifeMap({ timeline, profile }: LifeMapProps) {
  const milestones = [
    { age: 30, label: 'Career Peak', icon: '🚀' },
    { age: 35, label: 'Prime Years', icon: '⭐' },
    { age: 50, label: 'Pre-Retirement', icon: '🎯' },
    { age: 65, label: 'Retirement', icon: '🏖️' }
  ];

  const achievedGoals = profile.goals.map(goal => {
    const achievementYear = timeline.findIndex(year => year.netWorth >= goal.targetAmount);
    return {
      ...goal,
      achievedAt: achievementYear !== -1 ? timeline[achievementYear]?.age : null
    };
  });

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <MapPin className="text-blue-400" />
        Your Life Journey Map
      </h2>

      <div className="relative">
        {/* Timeline path */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-blue-400 to-green-400 opacity-30"></div>
        
        <div className="space-y-8">
          {/* Current position */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl animate-pulse">
              👤
            </div>
            <div>
              <div className="text-white font-semibold">You are here</div>
              <div className="text-white/60">Age {profile.age} • {formatCurrency(profile.currentSavings)} saved</div>
            </div>
          </div>

          {/* Goal achievements */}
          {achievedGoals.map((goal) => {
            const IconComponent = goalIcons[goal.category] || MapPin;
            const isAchievable = goal.achievedAt !== null;
            
            return (
              <div key={goal.id} className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                  isAchievable 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-500 scale-110' 
                    : 'bg-gray-600/50 grayscale'
                }`}>
                  <IconComponent size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${isAchievable ? 'text-green-400' : 'text-white/50'}`}>
                    {goal.name}
                  </div>
                  <div className="text-white/60">
                    {formatCurrency(goal.targetAmount)} • Target: {goal.targetYear}
                  </div>
                  {isAchievable ? (
                    <div className="text-green-400 text-sm">
                      ✅ Achievable at age {goal.achievedAt}
                    </div>
                  ) : (
                    <div className="text-red-400 text-sm">
                      ❌ May not be achievable with current plan
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Life milestones */}
          {milestones.map((milestone) => {
            const timelinePoint = timeline.find(t => t.age === milestone.age);
            const isReached = timelinePoint !== undefined;
            
            return (
              <div key={milestone.age} className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all ${
                  isReached 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                    : 'bg-white/10 border border-white/20'
                }`}>
                  {milestone.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-semibold ${isReached ? 'text-yellow-400' : 'text-white/60'}`}>
                    {milestone.label}
                  </div>
                  <div className="text-white/60">
                    Age {milestone.age}
                  </div>
                  {isReached && timelinePoint && (
                    <div className="text-yellow-400 text-sm">
                      Net Worth: {formatCurrency(timelinePoint.netWorth)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary card */}
      <div className="mt-8 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-4 border border-purple-400/30">
        <h3 className="text-white font-semibold mb-2">Journey Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-white/60">Goals Achievable</div>
            <div className="text-green-400 font-medium">
              {achievedGoals.filter(g => g.achievedAt).length} of {profile.goals.length}
            </div>
          </div>
          <div>
            <div className="text-white/60">Retirement Readiness</div>
            <div className="text-blue-400 font-medium">
              {timeline[65 - profile.age] ? formatCurrency(timeline[65 - profile.age].netWorth) : 'Calculate needed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
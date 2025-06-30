import { useState, useEffect } from 'react';
import { Badge, UserProgress, UserProfile } from '../types';
import { availableBadges } from '../data/badges';
import { useExpenses } from './useExpenses';
import { useAIAdvice } from './useAIAdvice';

export function useBadges(userProfile?: UserProfile, userId?: string) {
  const [badges, setBadges] = useState<Badge[]>(availableBadges);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalSavings: 0,
    emergencyFundMonths: 0,
    goalsCount: 0,
    dreamGoalsCount: 0,
    disasterSurvivalScore: 0,
    riskAssessmentComplete: false,
    insuranceToolUsed: false,
    timelinesExplored: [],
    expenseTrackingDays: 0,
    aiQuestionsAsked: 0,
    badgesEarned: []
  });
  const [newlyUnlockedBadges, setNewlyUnlockedBadges] = useState<Badge[]>([]);

  const { expenses } = useExpenses(userId);
  const { savedAdvice } = useAIAdvice(userId);

  // Calculate user progress based on profile and activities
  useEffect(() => {
    if (!userProfile) return;

    const emergencyFundMonths = userProfile.currentSavings / userProfile.monthlyExpenses;
    const expenseTrackingDays = calculateConsecutiveExpenseDays(expenses);

    const newProgress: UserProgress = {
      totalSavings: userProfile.currentSavings,
      emergencyFundMonths,
      goalsCount: userProfile.goals.length,
      dreamGoalsCount: userProfile.goals.filter(g => g.category !== 'retirement').length,
      disasterSurvivalScore: calculateDisasterScore(userProfile),
      riskAssessmentComplete: checkRiskAssessmentComplete(userProfile),
      insuranceToolUsed: checkInsuranceToolUsage(),
      timelinesExplored: getExploredTimelines(),
      expenseTrackingDays,
      aiQuestionsAsked: savedAdvice.length,
      badgesEarned: userProgress.badgesEarned
    };

    setUserProgress(newProgress);
  }, [userProfile, expenses, savedAdvice]);

  // Update badge progress and unlock status
  useEffect(() => {
    const updatedBadges = badges.map(badge => {
      const progress = calculateBadgeProgress(badge, userProgress);
      const wasUnlocked = badge.unlocked;
      const isNowUnlocked = progress >= badge.maxProgress;

      const updatedBadge = {
        ...badge,
        progress,
        unlocked: isNowUnlocked,
        unlockedAt: isNowUnlocked && !wasUnlocked ? new Date().toISOString() : badge.unlockedAt
      };

      // Track newly unlocked badges
      if (isNowUnlocked && !wasUnlocked) {
        setNewlyUnlockedBadges(prev => [...prev, updatedBadge]);
        // Auto-remove from newly unlocked after 5 seconds
        setTimeout(() => {
          setNewlyUnlockedBadges(prev => prev.filter(b => b.id !== badge.id));
        }, 5000);
      }

      return updatedBadge;
    });

    setBadges(updatedBadges);
  }, [userProgress]);

  const calculateBadgeProgress = (badge: Badge, progress: UserProgress): number => {
    switch (badge.criteria.type) {
      case 'savings_amount':
        return Math.min(progress.totalSavings, badge.maxProgress);
      case 'emergency_fund':
        return Math.min(progress.emergencyFundMonths, badge.maxProgress);
      case 'goals_count':
        return Math.min(progress.goalsCount, badge.maxProgress);
      case 'dream_goals':
        return Math.min(progress.dreamGoalsCount, badge.maxProgress);
      case 'disaster_survival':
        return Math.min(progress.disasterSurvivalScore, badge.maxProgress);
      case 'risk_assessment':
        return progress.riskAssessmentComplete ? 1 : 0;
      case 'insurance_usage':
        return progress.insuranceToolUsed ? 1 : 0;
      case 'timeline_exploration':
        return Math.min(progress.timelinesExplored.length, badge.maxProgress);
      case 'expense_tracking':
        return Math.min(progress.expenseTrackingDays, badge.maxProgress);
      case 'ai_usage':
        return Math.min(progress.aiQuestionsAsked, badge.maxProgress);
      default:
        return 0;
    }
  };

  const calculateConsecutiveExpenseDays = (expenses: any[]): number => {
    if (expenses.length === 0) return 0;

    const sortedDates = [...new Set(expenses.map(e => e.date))].sort();
    let consecutiveDays = 1;
    let maxConsecutive = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currentDate = new Date(sortedDates[i]);
      const dayDiff = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (dayDiff === 1) {
        consecutiveDays++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
      } else {
        consecutiveDays = 1;
      }
    }

    return maxConsecutive;
  };

  const calculateDisasterScore = (profile: UserProfile): number => {
    const emergencyMonths = profile.currentSavings / profile.monthlyExpenses;
    const savingsRate = (profile.monthlySavings * 12) / profile.income;
    
    let score = 0;
    if (emergencyMonths >= 6) score += 40;
    else if (emergencyMonths >= 3) score += 20;
    
    if (savingsRate >= 0.2) score += 30;
    else if (savingsRate >= 0.1) score += 15;
    
    if (profile.goals.length >= 3) score += 20;
    if (profile.riskTolerance === 'moderate') score += 10;
    
    return Math.min(score, 100);
  };

  const checkRiskAssessmentComplete = (profile: UserProfile): boolean => {
    // Check if user has completed risk assessment (has risk tolerance set)
    return profile.riskTolerance !== undefined;
  };

  const checkInsuranceToolUsage = (): boolean => {
    // This would be tracked when user uses insurance tools
    // For now, return false - will be updated when tools are used
    return false;
  };

  const getExploredTimelines = (): string[] => {
    // This would be tracked when user explores different timelines
    // For now, return empty array - will be updated when timelines are explored
    return [];
  };

  const markInsuranceToolUsed = () => {
    setUserProgress(prev => ({ ...prev, insuranceToolUsed: true }));
  };

  const markTimelineExplored = (timelineName: string) => {
    setUserProgress(prev => ({
      ...prev,
      timelinesExplored: [...new Set([...prev.timelinesExplored, timelineName])]
    }));
  };

  const getEarnedBadges = () => badges.filter(badge => badge.unlocked);
  const getLockedBadges = () => badges.filter(badge => !badge.unlocked);
  const getBadgesByCategory = (category: string) => badges.filter(badge => badge.category === category);
  const getCompletionPercentage = () => {
    const earnedCount = getEarnedBadges().length;
    return Math.round((earnedCount / badges.length) * 100);
  };

  return {
    badges,
    userProgress,
    newlyUnlockedBadges,
    getEarnedBadges,
    getLockedBadges,
    getBadgesByCategory,
    getCompletionPercentage,
    markInsuranceToolUsed,
    markTimelineExplored,
    clearNewlyUnlocked: () => setNewlyUnlockedBadges([])
  };
}
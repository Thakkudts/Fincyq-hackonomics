import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, FinancialGoal } from '../types';
import { Database } from '../types/database';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type FinancialGoalRow = Database['public']['Tables']['financial_goals']['Row'];

export function useUserProfile(userId?: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (userIdToLoad: string) => {
    if (!userIdToLoad) return { success: false, error: 'User ID is required' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      // Load user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userIdToLoad)
        .single();

      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw profileError;
      }

      if (!profileData) {
        setProfile(null);
        return { success: false, error: 'Profile not found' };
      }

      // Load financial goals
      const { data: goalsData, error: goalsError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', userIdToLoad)
        .order('created_at', { ascending: true });

      if (goalsError) {
        throw goalsError;
      }

      // Convert database format to app format
      const goals: FinancialGoal[] = (goalsData || []).map((goal: FinancialGoalRow) => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.target_amount,
        targetYear: goal.target_year,
        priority: goal.priority,
        category: goal.category
      }));

      const userProfile: UserProfile = {
        age: profileData.age,
        income: profileData.income,
        monthlyExpenses: profileData.monthly_expenses,
        monthlySavings: profileData.monthly_savings,
        currentSavings: profileData.current_savings,
        riskTolerance: profileData.risk_tolerance,
        goals
      };

      setProfile(userProfile);
      return { success: true, profile: userProfile };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load profile';
      setError(errorMessage);
      setProfile(null);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (userProfile: UserProfile, userIdToSave: string) => {
    if (!userIdToSave) return { success: false, error: 'User ID is required' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      // Save user profile (upsert)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userIdToSave,
          age: userProfile.age,
          income: userProfile.income,
          monthly_expenses: userProfile.monthlyExpenses,
          monthly_savings: userProfile.monthlySavings,
          current_savings: userProfile.currentSavings,
          risk_tolerance: userProfile.riskTolerance,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (profileError) {
        throw profileError;
      }

      // Delete existing goals and insert new ones
      const { error: deleteError } = await supabase
        .from('financial_goals')
        .delete()
        .eq('user_id', userIdToSave);

      if (deleteError) {
        throw deleteError;
      }

      // Insert new goals if any exist
      if (userProfile.goals && userProfile.goals.length > 0) {
        const goalsToInsert = userProfile.goals.map(goal => ({
          user_id: userIdToSave,
          name: goal.name,
          target_amount: goal.targetAmount,
          target_year: goal.targetYear,
          priority: goal.priority,
          category: goal.category
        }));

        const { error: goalsError } = await supabase
          .from('financial_goals')
          .insert(goalsToInsert);

        if (goalsError) {
          throw goalsError;
        }
      }

      setProfile(userProfile);
      return { success: true, profileId: profileData.id };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (userIdToDelete: string) => {
    if (!userIdToDelete) return { success: false, error: 'User ID is required' };
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      // Delete goals first (due to foreign key constraint)
      const { error: goalsError } = await supabase
        .from('financial_goals')
        .delete()
        .eq('user_id', userIdToDelete);

      if (goalsError) {
        throw goalsError;
      }

      // Delete profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userIdToDelete);

      if (profileError) {
        throw profileError;
      }

      setProfile(null);
      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Auto-load profile when userId changes
  useEffect(() => {
    if (userId && isSupabaseConfigured) {
      loadProfile(userId);
    } else {
      setProfile(null);
    }
  }, [userId]);

  return {
    profile,
    loading,
    error,
    saveProfile,
    loadProfile,
    deleteProfile,
  };
}
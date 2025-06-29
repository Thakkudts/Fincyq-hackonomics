import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface InsuranceAdvice {
  id: string;
  userId: string;
  insuranceType: 'health' | 'life' | 'disability' | 'auto' | 'home' | 'umbrella';
  currentCoverage: number;
  recommendedCoverage: number;
  monthlyPremium: number;
  provider: string;
  notes: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'pending' | 'researching';
  createdAt: string;
  updatedAt: string;
}

export function useInsuranceAdvice(userId?: string) {
  const [insuranceAdvice, setInsuranceAdvice] = useState<InsuranceAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInsuranceAdvice = async (userIdToLoad: string) => {
    if (!userIdToLoad || !isSupabaseConfigured) return { success: false, error: 'Configuration error' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('insurance_advice')
        .select('*')
        .eq('user_id', userIdToLoad)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedAdvice: InsuranceAdvice[] = (data || []).map(advice => ({
        id: advice.id,
        userId: advice.user_id,
        insuranceType: advice.insurance_type,
        currentCoverage: advice.current_coverage,
        recommendedCoverage: advice.recommended_coverage,
        monthlyPremium: advice.monthly_premium,
        provider: advice.provider,
        notes: advice.notes,
        priority: advice.priority,
        status: advice.status,
        createdAt: advice.created_at,
        updatedAt: advice.updated_at
      }));

      setInsuranceAdvice(formattedAdvice);
      return { success: true, advice: formattedAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load insurance advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const addInsuranceAdvice = async (advice: Omit<InsuranceAdvice, 'id' | 'createdAt' | 'updatedAt' | 'recommendedCoverage'>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('insurance_advice')
        .insert({
          user_id: advice.userId,
          insurance_type: advice.insuranceType,
          current_coverage: advice.currentCoverage,
          recommended_coverage: advice.currentCoverage, // Default to current for now
          monthly_premium: advice.monthlyPremium,
          provider: advice.provider,
          notes: advice.notes,
          priority: advice.priority,
          status: advice.status
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const newAdvice: InsuranceAdvice = {
        id: data.id,
        userId: data.user_id,
        insuranceType: data.insurance_type,
        currentCoverage: data.current_coverage,
        recommendedCoverage: data.recommended_coverage,
        monthlyPremium: data.monthly_premium,
        provider: data.provider,
        notes: data.notes,
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setInsuranceAdvice(prev => [newAdvice, ...prev]);
      return { success: true, advice: newAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add insurance advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateInsuranceAdvice = async (adviceId: string, updates: Partial<Omit<InsuranceAdvice, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const updateData: any = {};
      
      if (updates.insuranceType) updateData.insurance_type = updates.insuranceType;
      if (updates.currentCoverage !== undefined) updateData.current_coverage = updates.currentCoverage;
      if (updates.recommendedCoverage !== undefined) updateData.recommended_coverage = updates.recommendedCoverage;
      if (updates.monthlyPremium !== undefined) updateData.monthly_premium = updates.monthlyPremium;
      if (updates.provider !== undefined) updateData.provider = updates.provider;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.priority) updateData.priority = updates.priority;
      if (updates.status) updateData.status = updates.status;

      const { data, error: updateError } = await supabase
        .from('insurance_advice')
        .update(updateData)
        .eq('id', adviceId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedAdvice: InsuranceAdvice = {
        id: data.id,
        userId: data.user_id,
        insuranceType: data.insurance_type,
        currentCoverage: data.current_coverage,
        recommendedCoverage: data.recommended_coverage,
        monthlyPremium: data.monthly_premium,
        provider: data.provider,
        notes: data.notes,
        priority: data.priority,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setInsuranceAdvice(prev => prev.map(advice => 
        advice.id === adviceId ? updatedAdvice : advice
      ));

      return { success: true, advice: updatedAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update insurance advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteInsuranceAdvice = async (adviceId: string) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('insurance_advice')
        .delete()
        .eq('id', adviceId);

      if (deleteError) {
        throw deleteError;
      }

      setInsuranceAdvice(prev => prev.filter(advice => advice.id !== adviceId));
      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete insurance advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Auto-load insurance advice when userId changes
  useEffect(() => {
    if (userId && isSupabaseConfigured) {
      loadInsuranceAdvice(userId);
    } else {
      setInsuranceAdvice([]);
    }
  }, [userId]);

  return {
    insuranceAdvice,
    loading,
    error,
    addInsuranceAdvice,
    updateInsuranceAdvice,
    deleteInsuranceAdvice,
    loadInsuranceAdvice,
  };
}
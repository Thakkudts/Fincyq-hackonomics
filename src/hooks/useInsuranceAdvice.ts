import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InsuranceAdvice } from '../types';

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

  const saveInsuranceAdvice = async (advice: Omit<InsuranceAdvice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      // Check if advice for this insurance type already exists
      const { data: existingData } = await supabase
        .from('insurance_advice')
        .select('id')
        .eq('user_id', advice.userId)
        .eq('insurance_type', advice.insuranceType)
        .single();

      let result;
      if (existingData) {
        // Update existing record
        const { data, error: updateError } = await supabase
          .from('insurance_advice')
          .update({
            current_coverage: advice.currentCoverage,
            recommended_coverage: advice.recommendedCoverage,
            monthly_premium: advice.monthlyPremium,
            provider: advice.provider,
            notes: advice.notes,
            priority: advice.priority,
            status: advice.status
          })
          .eq('id', existingData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        result = data;
      } else {
        // Insert new record
        const { data, error: insertError } = await supabase
          .from('insurance_advice')
          .insert({
            user_id: advice.userId,
            insurance_type: advice.insuranceType,
            current_coverage: advice.currentCoverage,
            recommended_coverage: advice.recommendedCoverage,
            monthly_premium: advice.monthlyPremium,
            provider: advice.provider,
            notes: advice.notes,
            priority: advice.priority,
            status: advice.status
          })
          .select()
          .single();

        if (insertError) throw insertError;
        result = data;
      }

      const savedAdvice: InsuranceAdvice = {
        id: result.id,
        userId: result.user_id,
        insuranceType: result.insurance_type,
        currentCoverage: result.current_coverage,
        recommendedCoverage: result.recommended_coverage,
        monthlyPremium: result.monthly_premium,
        provider: result.provider,
        notes: result.notes,
        priority: result.priority,
        status: result.status,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };

      // Update local state
      setInsuranceAdvice(prev => {
        const filtered = prev.filter(item => item.insuranceType !== advice.insuranceType);
        return [savedAdvice, ...filtered];
      });

      return { success: true, advice: savedAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save insurance advice';
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

  const getAdviceByType = (insuranceType: InsuranceAdvice['insuranceType']) => {
    return insuranceAdvice.find(advice => advice.insuranceType === insuranceType);
  };

  const getTotalMonthlyCost = () => {
    return insuranceAdvice.reduce((total, advice) => total + advice.monthlyPremium, 0);
  };

  const getCoverageGaps = () => {
    return insuranceAdvice.filter(advice => 
      advice.currentCoverage < advice.recommendedCoverage
    );
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
    saveInsuranceAdvice,
    deleteInsuranceAdvice,
    loadInsuranceAdvice,
    getAdviceByType,
    getTotalMonthlyCost,
    getCoverageGaps,
  };
}
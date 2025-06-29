```
import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { generateFinancialAdvice, generateFallbackAdvice, isOpenAIConfigured } from '../lib/openai';
import { SavedAIAdvice, UserProfile } from '../types';

export function useAIAdvice(userId?: string) {
  const [savedAdvice, setSavedAdvice] = useState<SavedAIAdvice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSavedAdvice = async (userIdToLoad: string) => {
    if (!userIdToLoad || !isSupabaseConfigured) return { success: false, error: 'Configuration error' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('saved_ai_advice')
        .select('*')
        .eq('user_id', userIdToLoad)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const formattedAdvice: SavedAIAdvice[] = (data || []).map(advice => ({
        id: advice.id,
        userId: advice.user_id,
        prompt: advice.prompt,
        response: advice.response,
        category: advice.category,
        createdAt: advice.created_at,
        updatedAt: advice.updated_at
      }));

      setSavedAdvice(formattedAdvice);
      return { success: true, advice: formattedAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load saved advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const saveAdvice = async (advice: Omit<SavedAIAdvice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from('saved_ai_advice')
        .insert({
          user_id: advice.userId,
          prompt: advice.prompt,
          response: advice.response,
          category: advice.category
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      const newAdvice: SavedAIAdvice = {
        id: data.id,
        userId: data.user_id,
        prompt: data.prompt,
        response: data.response,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setSavedAdvice(prev => [newAdvice, ...prev]);
      return { success: true, advice: newAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateAdvice = async (adviceId: string, updates: Partial<Pick<SavedAIAdvice, 'prompt' | 'response' | 'category'>>) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('saved_ai_advice')
        .update(updates)
        .eq('id', adviceId)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedAdvice: SavedAIAdvice = {
        id: data.id,
        userId: data.user_id,
        prompt: data.prompt,
        response: data.response,
        category: data.category,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setSavedAdvice(prev => prev.map(advice => 
        advice.id === adviceId ? updatedAdvice : advice
      ));

      return { success: true, advice: updatedAdvice };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deleteAdvice = async (adviceId: string) => {
    if (!isSupabaseConfigured) return { success: false, error: 'Supabase not configured' };

    setLoading(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('saved_ai_advice')
        .delete()
        .eq('id', adviceId);

      if (deleteError) {
        throw deleteError;
      }

      setSavedAdvice(prev => prev.filter(advice => advice.id !== adviceId));
      return { success: true };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const generateAIAdvice = async (prompt: string, userProfile: UserProfile): Promise<{ success: boolean; advice?: string; error?: string }> => {
    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (isOpenAIConfigured) {
        // Use real OpenAI API
        result = await generateFinancialAdvice(prompt, {
          age: userProfile.age,
          income: userProfile.income,
          currentSavings: userProfile.currentSavings,
          monthlySavings: userProfile.monthlySavings,
          monthlyExpenses: userProfile.monthlyExpenses,
          goals: userProfile.goals,
          riskTolerance: userProfile.riskTolerance
        });
      } else {
        // Use fallback simulation
        result = await generateFallbackAdvice(prompt, userProfile);
      }
      
      if (result.success && result.response) {
        return { success: true, advice: result.response };
      } else {
        return { success: false, error: result.error || 'Failed to generate advice' };
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const regenerateAdvice = async (originalPrompt: string, userProfile: UserProfile): Promise<{ success: boolean; advice?: string; error?: string }> => {
    // Add slight variation to get different response
    const modifiedPrompt = `${originalPrompt}\n\nPlease provide a fresh perspective on this question.`;
    return generateAIAdvice(modifiedPrompt, userProfile);
  };

  // Auto-load saved advice when userId changes
  useEffect(() => {
    if (userId && isSupabaseConfigured) {
      loadSavedAdvice(userId);
    } else {
      setSavedAdvice([]);
    }
  }, [userId]);

  return {
    savedAdvice,
    loading,
    error,
    saveAdvice,
    updateAdvice,
    deleteAdvice,
    loadSavedAdvice,
    generateAIAdvice,
    regenerateAdvice,
    isOpenAIConfigured,
  };
}

export function categorizePrompt(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('retire') || lowerPrompt.includes('retirement')) return 'Retirement';
  if (lowerPrompt.includes('house') || lowerPrompt.includes('home') || lowerPrompt.includes('property')) return 'Real Estate';
  if (lowerPrompt.includes('invest') || lowerPrompt.includes('mutual fund') || lowerPrompt.includes('stock')) return 'Investment';
  if (lowerPrompt.includes('travel') || lowerPrompt.includes('vacation')) return 'Travel';
  if (lowerPrompt.includes('tax') || lowerPrompt.includes('save tax')) return 'Tax Planning';
  if (lowerPrompt.includes('emergency') || lowerPrompt.includes('fund')) return 'Emergency Fund';
  if (lowerPrompt.includes('insurance') || lowerPrompt.includes('health') || lowerPrompt.includes('life')) return 'Insurance';
  if (lowerPrompt.includes('debt') || lowerPrompt.includes('loan') || lowerPrompt.includes('emi')) return 'Debt Management';
  if (lowerPrompt.includes('business') || lowerPrompt.includes('startup')) return 'Business';
  if (lowerPrompt.includes('education') || lowerPrompt.includes('study')) return 'Education';
  
  return 'General';
}
```
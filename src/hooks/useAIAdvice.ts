import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
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
      // Create a comprehensive context about the user
      const userContext = `
User Profile:
- Age: ${userProfile.age}
- Annual Income: ₹${userProfile.income.toLocaleString()}
- Monthly Expenses: ₹${userProfile.monthlyExpenses.toLocaleString()}
- Monthly Savings: ₹${userProfile.monthlySavings.toLocaleString()}
- Current Savings: ₹${userProfile.currentSavings.toLocaleString()}
- Risk Tolerance: ${userProfile.riskTolerance}
- Financial Goals: ${userProfile.goals.map(g => `${g.name} (₹${g.targetAmount.toLocaleString()} by ${g.targetYear})`).join(', ')}

Savings Rate: ${((userProfile.monthlySavings * 12 / userProfile.income) * 100).toFixed(1)}%
Emergency Fund Coverage: ${(userProfile.currentSavings / userProfile.monthlyExpenses).toFixed(1)} months
`;

      // Simulate AI response (replace with actual OpenAI API call)
      const aiResponse = await simulateAIResponse(prompt, userContext);
      
      return { success: true, advice: aiResponse };

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI advice';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
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
  };
}

// Simulate AI response (replace with actual OpenAI API integration)
async function simulateAIResponse(prompt: string, userContext: string): Promise<string> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Generate contextual response based on common financial questions
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('retire') && lowerPrompt.includes('40')) {
    return `**Early Retirement at 40 - Here's Your Roadmap:**

Based on your current profile, retiring at 40 is ambitious but achievable with the right strategy:

**Current Analysis:**
• Your savings rate is strong, but you'll need to **increase it to 50-60%** of income
• Target net worth needed: **₹2.5-3 crores** (25x annual expenses)
• Time remaining: **${40 - parseInt(userContext.match(/Age: (\d+)/)?.[1] || '25')} years**

**Action Plan:**
1. **Boost Income:** Focus on career growth to reach ₹15-20 lakhs annually
2. **Maximize Savings:** Aim for ₹8-10 lakhs per year in investments
3. **Investment Strategy:** 80% equity, 20% debt for aggressive growth
4. **Side Income:** Consider freelancing or passive income streams

**Travel Fund Strategy:**
• Allocate **₹5-8 lakhs** for your 10-country travel goal
• Consider travel-friendly investment options
• Plan for **₹50,000-80,000 per country** depending on destinations

**Next Steps:**
• Increase monthly SIP to **₹60,000-70,000**
• Build emergency fund of **₹6 lakhs** first
• Consider ELSS, PPF, and international equity funds

*Start today - every year you delay adds 2-3 years to your retirement timeline!*`;
  }
  
  if (lowerPrompt.includes('house') || lowerPrompt.includes('home')) {
    return `**Home Buying Strategy - Tailored for You:**

**Affordability Analysis:**
• Based on your income, you can afford a home worth **₹40-50 lakhs**
• Recommended down payment: **₹10-15 lakhs** (20-30%)
• Monthly EMI capacity: **₹25,000-30,000** (keeping 40% of income free)

**Timeline Recommendation:**
• **Save for 2-3 years** to build a solid down payment
• Target down payment fund: **₹15 lakhs**
• Additional costs (registration, etc.): **₹3-5 lakhs**

**Savings Strategy:**
1. **Home Fund SIP:** ₹35,000/month in debt funds
2. **Continue regular investments:** ₹15,000/month for other goals
3. **Emergency fund:** Maintain ₹6 lakhs separately

**Location Tips:**
• Consider emerging areas for better appreciation
• Factor in commute costs and time
• Look for ready-to-move properties to avoid delays

**Tax Benefits:**
• Home loan interest: Up to ₹2 lakhs deduction
• Principal repayment: Up to ₹1.5 lakhs under 80C

*Pro tip: Don't compromise your other financial goals for a bigger house!*`;
  }

  if (lowerPrompt.includes('invest') || lowerPrompt.includes('mutual fund')) {
    return `**Investment Strategy - Optimized for Your Profile:**

**Current Portfolio Recommendation:**
• **Equity (70%):** ₹${Math.round(parseInt(userContext.match(/Monthly Savings: ₹([\d,]+)/)?.[1]?.replace(/,/g, '') || '0') * 0.7).toLocaleString()}/month
• **Debt (20%):** ₹${Math.round(parseInt(userContext.match(/Monthly Savings: ₹([\d,]+)/)?.[1]?.replace(/,/g, '') || '0') * 0.2).toLocaleString()}/month  
• **Gold/REITs (10%):** ₹${Math.round(parseInt(userContext.match(/Monthly Savings: ₹([\d,]+)/)?.[1]?.replace(/,/g, '') || '0') * 0.1).toLocaleString()}/month

**Recommended Funds:**
1. **Large Cap:** Axis Bluechip, Mirae Asset Large Cap
2. **Mid Cap:** Axis Midcap, Kotak Emerging Equity
3. **Small Cap:** SBI Small Cap, Axis Small Cap
4. **Debt:** HDFC Corporate Bond, ICICI Prudential Corporate Bond
5. **International:** Motilal Oswal Nasdaq 100, Parag Parikh Flexi Cap

**Tax Optimization:**
• **ELSS Funds:** ₹12,500/month (₹1.5L annual 80C limit)
• **PPF:** ₹12,500/month for long-term wealth
• **NPS:** Consider for additional tax benefits

**Review Schedule:**
• **Monthly:** Track performance and SIP dates
• **Quarterly:** Rebalance if allocation drifts >5%
• **Annually:** Review and adjust based on goals

*Remember: Time in market > Timing the market!*`;
  }

  // Default response for other queries
  return `**Personalized Financial Advice:**

Based on your profile analysis, here are my recommendations:

**Your Financial Health Score: 7.5/10**

**Strengths:**
• Good savings discipline with regular monthly savings
• Diversified financial goals showing planning mindset
• Reasonable expense management

**Areas for Improvement:**
• **Emergency Fund:** Build up to **₹${(parseInt(userContext.match(/Monthly Expenses: ₹([\d,]+)/)?.[1]?.replace(/,/g, '') || '0') * 6).toLocaleString()}** (6 months expenses)
• **Investment Diversification:** Consider international exposure
• **Insurance Coverage:** Ensure adequate life and health insurance

**Immediate Action Items:**
1. **Increase SIP by 10%** to accelerate wealth building
2. **Start systematic debt fund** for stability
3. **Review and optimize** existing investments
4. **Create specific timelines** for each financial goal

**Long-term Strategy:**
• Focus on **equity investments** for wealth creation
• Maintain **20-30% debt allocation** for stability  
• Consider **real estate** once you have ₹50L+ portfolio
• Plan for **tax-efficient** investment structures

**Goal-Specific Advice:**
${userContext.includes('Goals:') ? 
  userContext.match(/Goals: (.+)/)?.[1]?.split(', ').slice(0, 2).map(goal => 
    `• **${goal.split(' (')[0]}:** Increase monthly allocation by ₹5,000-10,000`
  ).join('\n') || '' : 
  '• Set specific, measurable financial goals with timelines'
}

*Remember: Consistency beats perfection in financial planning!*`;
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
// OpenAI API integration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const isOpenAIConfigured = !!(OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key');

export interface OpenAIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

export async function generateFinancialAdvice(
  userQuestion: string,
  userProfile: {
    age: number;
    income: number;
    currentSavings: number;
    monthlySavings: number;
    monthlyExpenses: number;
    goals: Array<{ name: string; targetAmount: number; targetYear: number }>;
    riskTolerance: string;
  }
): Promise<OpenAIResponse> {
  if (!isOpenAIConfigured) {
    return {
      success: false,
      error: 'OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.'
    };
  }

  try {
    // Construct the dynamic prompt with user profile
    const systemPrompt = `You are FutureFundr, a friendly and smart financial advisor. Give clear, actionable, personalized financial guidance using Indian currency (₹) and relevant strategies. 

Always format your responses with:
- **Bold headings** for main sections
- **Bold text** for important amounts, timelines, and key strategies
- Bullet points (•) for action items
- Clear structure with numbered steps when appropriate
- Specific ₹ amounts and realistic timelines
- Consider Indian financial products (SIP, ELSS, PPF, NPS, etc.)

Keep responses comprehensive but concise, focusing on actionable advice.`;

    const userContext = `
User Profile:
• Age: ${userProfile.age}
• Annual Income: ₹${userProfile.income.toLocaleString()}
• Monthly Expenses: ₹${userProfile.monthlyExpenses.toLocaleString()}
• Monthly Savings: ₹${userProfile.monthlySavings.toLocaleString()}
• Current Savings: ₹${userProfile.currentSavings.toLocaleString()}
• Risk Tolerance: ${userProfile.riskTolerance}
• Financial Goals: ${userProfile.goals.map(g => `${g.name} (₹${g.targetAmount.toLocaleString()} by ${g.targetYear})`).join(', ') || 'None specified'}

Additional Context:
• Savings Rate: ${((userProfile.monthlySavings * 12 / userProfile.income) * 100).toFixed(1)}%
• Emergency Fund Coverage: ${(userProfile.currentSavings / userProfile.monthlyExpenses).toFixed(1)} months of expenses

Question: ${userQuestion}

Please give step-by-step financial advice with timelines, monthly savings targets, and investment strategies tailored to this user's profile.`;

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userContext
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI API');
    }

    return {
      success: true,
      response: data.choices[0].message.content.trim()
    };

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    
    // Provide helpful error messages
    if (error.message?.includes('401')) {
      return {
        success: false,
        error: 'Invalid OpenAI API key. Please check your VITE_OPENAI_API_KEY environment variable.'
      };
    } else if (error.message?.includes('429')) {
      return {
        success: false,
        error: 'OpenAI API rate limit exceeded. Please try again in a moment.'
      };
    } else if (error.message?.includes('insufficient_quota')) {
      return {
        success: false,
        error: 'OpenAI API quota exceeded. Please check your OpenAI account billing.'
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to generate AI advice. Please try again.'
      };
    }
  }
}

// Fallback function for when OpenAI is not configured
export async function generateFallbackAdvice(
  userQuestion: string,
  userProfile: any
): Promise<OpenAIResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const lowerQuestion = userQuestion.toLowerCase();
  
  if (lowerQuestion.includes('retire') && lowerQuestion.includes('40')) {
    return {
      success: true,
      response: `**Early Retirement at 40 - Here's Your Roadmap:**

Based on your current profile, retiring at 40 is ambitious but achievable with the right strategy:

**Current Analysis:**
• Your savings rate is ${((userProfile.monthlySavings * 12 / userProfile.income) * 100).toFixed(1)}%, but you'll need to **increase it to 50-60%** of income
• Target net worth needed: **₹2.5-3 crores** (25x annual expenses)
• Time remaining: **${40 - userProfile.age} years**

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
• Build emergency fund of **₹${(userProfile.monthlyExpenses * 6).toLocaleString()}** first
• Consider ELSS, PPF, and international equity funds

*Start today - every year you delay adds 2-3 years to your retirement timeline!*`
    };
  }

  // Default fallback response
  return {
    success: true,
    response: `**Personalized Financial Advice:**

Based on your profile analysis, here are my recommendations:

**Your Financial Health Score: 7.5/10**

**Current Situation:**
• Age: ${userProfile.age} years
• Monthly Savings: ₹${userProfile.monthlySavings.toLocaleString()}
• Savings Rate: ${((userProfile.monthlySavings * 12 / userProfile.income) * 100).toFixed(1)}%
• Emergency Fund: ${(userProfile.currentSavings / userProfile.monthlyExpenses).toFixed(1)} months coverage

**Immediate Action Items:**
1. **Emergency Fund:** Build up to **₹${(userProfile.monthlyExpenses * 6).toLocaleString()}** (6 months expenses)
2. **Increase SIP by 10%** to accelerate wealth building
3. **Diversify investments** across equity and debt
4. **Review insurance coverage** for adequate protection

**Investment Strategy:**
• **Equity (70%):** ₹${Math.round(userProfile.monthlySavings * 0.7).toLocaleString()}/month
• **Debt (20%):** ₹${Math.round(userProfile.monthlySavings * 0.2).toLocaleString()}/month
• **Gold/REITs (10%):** ₹${Math.round(userProfile.monthlySavings * 0.1).toLocaleString()}/month

**Note:** This is a fallback response. For personalized AI advice, please configure your OpenAI API key.

*Remember: Consistency beats perfection in financial planning!*`
  };
}
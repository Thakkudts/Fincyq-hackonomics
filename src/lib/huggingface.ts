// Hugging Face Inference API integration with Mistral AI
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

// Available models on Hugging Face (free tier)
const MODELS = {
  MISTRAL_7B: 'mistralai/Mistral-7B-Instruct-v0.1',
  MISTRAL_7B_V2: 'mistralai/Mistral-7B-Instruct-v0.2',
  ZEPHYR_7B: 'HuggingFaceH4/zephyr-7b-beta',
  OPENCHAT: 'openchat/openchat-3.5-0106',
  CODELLAMA: 'codellama/CodeLlama-7b-Instruct-hf'
};

export const isHuggingFaceConfigured = !!(HUGGINGFACE_API_KEY && 
  HUGGINGFACE_API_KEY !== 'your_huggingface_api_key' &&
  HUGGINGFACE_API_KEY.length > 10 &&
  HUGGINGFACE_API_KEY.startsWith('hf_'));

export interface HuggingFaceResponse {
  success: boolean;
  response?: string;
  error?: string;
}

async function queryHuggingFace(model: string, prompt: string, maxRetries = 3): Promise<any> {
  const url = `${HUGGINGFACE_API_URL}/${model}`;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle model loading (503 error)
        if (response.status === 503 && attempt < maxRetries) {
          console.log(`Model loading, attempt ${attempt}/${maxRetries}. Retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      console.log(`Attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
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
): Promise<HuggingFaceResponse> {
  if (!isHuggingFaceConfigured) {
    console.log('Hugging Face not configured, using fallback mode');
    return generateFallbackAdvice(userQuestion, userProfile);
  }

  try {
    // Construct the prompt for Mistral AI
    const systemPrompt = `You are FutureFundr, a friendly and expert financial advisor. Provide clear, actionable, personalized financial guidance using Indian currency (₹) and relevant strategies.

Format your response with:
- **Bold headings** for main sections
- **Bold text** for important amounts and key strategies
- Bullet points for action items
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

Please provide step-by-step financial advice with timelines, monthly savings targets, and investment strategies tailored to this user's profile.`;

    const fullPrompt = `<s>[INST] ${systemPrompt}

${userContext} [/INST]`;

    // Try Mistral 7B first, fallback to other models if needed
    let result;
    try {
      console.log('Trying Mistral 7B v0.2...');
      result = await queryHuggingFace(MODELS.MISTRAL_7B_V2, fullPrompt);
    } catch (error) {
      console.log('Mistral 7B v0.2 failed, trying Zephyr 7B...');
      try {
        result = await queryHuggingFace(MODELS.ZEPHYR_7B, fullPrompt);
      } catch (error2) {
        console.log('Zephyr 7B failed, trying OpenChat...');
        result = await queryHuggingFace(MODELS.OPENCHAT, fullPrompt);
      }
    }

    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid response format from Hugging Face API');
    }

    let responseText = result[0].generated_text || result[0].text || '';
    
    // Clean up the response
    responseText = responseText.trim();
    
    // Remove any instruction artifacts
    responseText = responseText.replace(/\[INST\].*?\[\/INST\]/g, '').trim();
    responseText = responseText.replace(/^<s>|<\/s>$/g, '').trim();
    
    if (!responseText) {
      throw new Error('Empty response from model');
    }

    console.log('✅ Successfully generated AI response from Hugging Face');
    return {
      success: true,
      response: responseText
    };

  } catch (error: any) {
    console.error('Hugging Face API Error:', error);
    
    // Fallback to enhanced local responses
    console.log('Falling back to local response generation');
    return generateFallbackAdvice(userQuestion, userProfile);
  }
}

// Enhanced fallback function with more realistic responses
export async function generateFallbackAdvice(
  userQuestion: string,
  userProfile: any
): Promise<HuggingFaceResponse> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const lowerQuestion = userQuestion.toLowerCase();
  const savingsRate = ((userProfile.monthlySavings * 12 / userProfile.income) * 100);
  const emergencyMonths = (userProfile.currentSavings / userProfile.monthlyExpenses);
  
  // Retirement planning
  if (lowerQuestion.includes('retire') || lowerQuestion.includes('retirement')) {
    const targetAge = lowerQuestion.includes('40') ? 40 : 
                     lowerQuestion.includes('50') ? 50 : 60;
    const yearsToRetire = targetAge - userProfile.age;
    
    return {
      success: true,
      response: `**Early Retirement at ${targetAge} - Strategic Roadmap:**

**Current Financial Health Analysis:**
• Your savings rate: **${savingsRate.toFixed(1)}%** (Recommended: 50%+ for early retirement)
• Emergency fund: **${emergencyMonths.toFixed(1)} months** coverage
• Time horizon: **${yearsToRetire} years** to build wealth

**Target Calculation:**
• Required corpus: **₹${(userProfile.monthlyExpenses * 12 * 25 / 100000).toFixed(0)} crores** (25x annual expenses)
• Monthly investment needed: **₹${Math.round((userProfile.monthlyExpenses * 12 * 25) / (yearsToRetire * 12 * 1.5) / 1000) * 1000}**

**Action Plan:**
1. **Boost Income:** Target 15-20% annual growth through skills/career advancement
2. **Optimize Expenses:** Reduce to ₹${Math.round(userProfile.monthlyExpenses * 0.8 / 1000) * 1000}/month
3. **Investment Strategy:** 80% equity, 20% debt for aggressive growth
4. **Tax Optimization:** Maximize ELSS, PPF, NPS contributions

**Investment Allocation:**
• **Large Cap Equity:** ₹${Math.round(userProfile.monthlySavings * 0.4 / 1000) * 1000}/month
• **Mid/Small Cap:** ₹${Math.round(userProfile.monthlySavings * 0.3 / 1000) * 1000}/month
• **International Funds:** ₹${Math.round(userProfile.monthlySavings * 0.1 / 1000) * 1000}/month
• **Debt Funds:** ₹${Math.round(userProfile.monthlySavings * 0.2 / 1000) * 1000}/month

*🤖 Enhanced AI Response - Add your Hugging Face API key for real-time Mistral AI advice!*`
    };
  }

  // Investment advice
  if (lowerQuestion.includes('invest') || lowerQuestion.includes('mutual fund') || lowerQuestion.includes('sip')) {
    return {
      success: true,
      response: `**Smart Investment Strategy for Your Profile:**

**Current Investment Capacity:**
• Monthly investable surplus: **₹${userProfile.monthlySavings.toLocaleString()}**
• Risk tolerance: **${userProfile.riskTolerance}**
• Investment horizon: **Long-term (${Math.max(65 - userProfile.age, 10)}+ years)**

**Recommended Portfolio Allocation:**
${userProfile.riskTolerance === 'aggressive' ? 
  '• **Equity (80%):** ₹' + Math.round(userProfile.monthlySavings * 0.8).toLocaleString() + '/month\n• **Debt (20%):** ₹' + Math.round(userProfile.monthlySavings * 0.2).toLocaleString() + '/month' :
  userProfile.riskTolerance === 'moderate' ?
  '• **Equity (70%):** ₹' + Math.round(userProfile.monthlySavings * 0.7).toLocaleString() + '/month\n• **Debt (30%):** ₹' + Math.round(userProfile.monthlySavings * 0.3).toLocaleString() + '/month' :
  '• **Equity (60%):** ₹' + Math.round(userProfile.monthlySavings * 0.6).toLocaleString() + '/month\n• **Debt (40%):** ₹' + Math.round(userProfile.monthlySavings * 0.4).toLocaleString() + '/month'
}

**Top Fund Recommendations:**
1. **Large Cap:** Axis Bluechip, Mirae Asset Large Cap
2. **Mid Cap:** Axis Midcap, Kotak Emerging Equity
3. **Small Cap:** SBI Small Cap, Axis Small Cap
4. **International:** Motilal Oswal Nasdaq 100, Parag Parikh Flexi Cap
5. **Debt:** Axis Banking & PSU Debt, ICICI Prudential Corporate Bond

**Tax-Saving Options (80C):**
• **ELSS Funds:** ₹12,500/month (₹1.5L annually)
• **PPF:** ₹12,500/month for 15-year lock-in
• **NPS:** Additional ₹4,167/month (₹50K under 80CCD)

**Next Steps:**
1. Start SIPs on 1st of every month
2. Increase SIP by 10% annually
3. Review and rebalance quarterly
4. Stay invested for minimum 7-10 years

*🤖 Enhanced AI Response - Add your Hugging Face API key for real-time Mistral AI advice!*`
    };
  }

  // House buying advice
  if (lowerQuestion.includes('house') || lowerQuestion.includes('home') || lowerQuestion.includes('property')) {
    const affordablePrice = userProfile.income * 5; // 5x annual income rule
    const downPayment = affordablePrice * 0.2; // 20% down payment
    
    return {
      success: true,
      response: `**Home Buying Strategy Analysis:**

**Affordability Assessment:**
• **Maximum home price:** ₹${(affordablePrice / 100000).toFixed(0)} lakhs (5x annual income)
• **Down payment needed:** ₹${(downPayment / 100000).toFixed(0)} lakhs (20%)
• **Current savings:** ₹${(userProfile.currentSavings / 100000).toFixed(0)} lakhs

**EMI Analysis:**
• **Maximum EMI:** ₹${Math.round(userProfile.income * 0.4 / 12 / 1000) * 1000} (40% of income)
• **Loan amount:** ₹${((affordablePrice - downPayment) / 100000).toFixed(0)} lakhs
• **Estimated EMI:** ₹${Math.round((affordablePrice - downPayment) * 0.0075 / 1000) * 1000} (9% interest, 20 years)

**Rent vs Buy Analysis:**
${userProfile.monthlyExpenses * 0.3 < (affordablePrice - downPayment) * 0.0075 ?
  '• **Recommendation:** Continue renting and invest the difference\n• **Reason:** Renting is more cost-effective currently' :
  '• **Recommendation:** Consider buying if you plan to stay 7+ years\n• **Reason:** EMI is reasonable compared to rent'
}

**Action Plan:**
1. **Build down payment:** Save ₹${Math.round((downPayment - userProfile.currentSavings) / 24 / 1000) * 1000}/month for 2 years
2. **Improve credit score:** Maintain 750+ for best interest rates
3. **Research locations:** Focus on areas with good connectivity and growth potential
4. **Get pre-approved:** Understand exact loan eligibility

**Investment Alternative:**
If you continue renting and invest ₹${Math.round(downPayment * 0.1 / 1000) * 1000}/month in equity:
• **Potential value in 10 years:** ₹${((downPayment * 0.1 * 12 * ((Math.pow(1.12, 10) - 1) / 0.12)) / 100000).toFixed(0)} lakhs

*🤖 Enhanced AI Response - Add your Hugging Face API key for real-time Mistral AI advice!*`
    };
  }

  // Default comprehensive advice
  return {
    success: true,
    response: `**Comprehensive Financial Health Check & Recommendations:**

**Current Financial Snapshot:**
• **Age:** ${userProfile.age} years
• **Savings Rate:** ${savingsRate.toFixed(1)}% (Target: 20%+)
• **Emergency Fund:** ${emergencyMonths.toFixed(1)} months (Target: 6 months)
• **Monthly Surplus:** ₹${userProfile.monthlySavings.toLocaleString()}

**Priority Action Items:**

**1. Emergency Fund (Priority: High)**
${emergencyMonths < 6 ? 
  `• **Gap:** ₹${((userProfile.monthlyExpenses * 6) - userProfile.currentSavings).toLocaleString()}\n• **Timeline:** Build in ${Math.ceil(((userProfile.monthlyExpenses * 6) - userProfile.currentSavings) / userProfile.monthlySavings)} months\n• **Strategy:** Keep in liquid funds or high-yield savings` :
  '• ✅ **Well-funded** - You have adequate emergency coverage'
}

**2. Investment Strategy (Priority: High)**
• **Equity Allocation:** ₹${Math.round(userProfile.monthlySavings * 0.7).toLocaleString()}/month
• **Debt Allocation:** ₹${Math.round(userProfile.monthlySavings * 0.3).toLocaleString()}/month
• **Expected Returns:** 12-15% annually (equity), 7-9% (debt)

**3. Tax Optimization (Priority: Medium)**
• **80C Limit:** Utilize full ₹1.5L through ELSS, PPF
• **80D:** Health insurance premiums
• **NPS:** Additional ₹50K deduction under 80CCD(1B)

**4. Insurance Review (Priority: Medium)**
• **Life Insurance:** ${userProfile.income * 10 / 100000}x income (₹${(userProfile.income * 10 / 100000).toFixed(0)} lakhs)
• **Health Insurance:** ₹10-15 lakhs family floater
• **Disability Insurance:** Consider if not covered by employer

**Wealth Projection (10 Years):**
With consistent ₹${userProfile.monthlySavings.toLocaleString()}/month investment:
• **Conservative (8%):** ₹${((userProfile.monthlySavings * 12 * ((Math.pow(1.08, 10) - 1) / 0.08)) / 100000).toFixed(0)} lakhs
• **Moderate (12%):** ₹${((userProfile.monthlySavings * 12 * ((Math.pow(1.12, 10) - 1) / 0.12)) / 100000).toFixed(0)} lakhs
• **Aggressive (15%):** ₹${((userProfile.monthlySavings * 12 * ((Math.pow(1.15, 10) - 1) / 0.15)) / 100000).toFixed(0)} lakhs

**Next Steps:**
1. Set up automatic SIPs for systematic investing
2. Review and increase investments annually by 10%
3. Monitor progress quarterly
4. Rebalance portfolio annually

*🤖 Enhanced AI Response - Add your Hugging Face API key for real-time Mistral AI advice!*`
  };
}

// Utility function to get available models
export function getAvailableModels() {
  return Object.entries(MODELS).map(([key, value]) => ({
    id: key,
    name: value,
    description: getModelDescription(key)
  }));
}

function getModelDescription(modelKey: string): string {
  switch (modelKey) {
    case 'MISTRAL_7B':
      return 'Mistral 7B Instruct v0.1 - Fast and efficient for general tasks';
    case 'MISTRAL_7B_V2':
      return 'Mistral 7B Instruct v0.2 - Improved version with better reasoning';
    case 'ZEPHYR_7B':
      return 'Zephyr 7B Beta - Fine-tuned for helpful conversations';
    case 'OPENCHAT':
      return 'OpenChat 3.5 - Optimized for chat and instruction following';
    case 'CODELLAMA':
      return 'Code Llama 7B - Specialized for code generation and analysis';
    default:
      return 'Advanced language model for various tasks';
  }
}
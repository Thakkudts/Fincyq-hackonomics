// Hugging Face API integration (replacing OpenAI)
import { generateFinancialAdvice as hfGenerateAdvice, generateFallbackAdvice as hfFallbackAdvice, isHuggingFaceConfigured } from './huggingface';

// Keep the same interface for backward compatibility
export const isOpenAIConfigured = isHuggingFaceConfigured;

export interface OpenAIResponse {
  success: boolean;
  response?: string;
  error?: string;
}

// Redirect to Hugging Face implementation
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
  return await hfGenerateAdvice(userQuestion, userProfile);
}

// Enhanced fallback function
export async function generateFallbackAdvice(
  userQuestion: string,
  userProfile: any
): Promise<OpenAIResponse> {
  return await hfFallbackAdvice(userQuestion, userProfile);
}
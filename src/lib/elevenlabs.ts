// ElevenLabs API integration via secure backend
import { supabase, isSupabaseConfigured } from './supabase';

// Check if ElevenLabs is configured by testing the backend function
export const isElevenLabsConfigured = isSupabaseConfigured; // Depends on Supabase for backend functions

export interface ElevenLabsResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export async function generateSpeech(
  text: string,
  voiceId: string = 'pNInz6obpgDQGcFmaJgB',
  options: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  } = {}
): Promise<ElevenLabsResponse> {
  if (!isSupabaseConfigured) {
    console.warn('Supabase not configured - ElevenLabs backend unavailable');
    return { success: false, error: 'Backend not configured' };
  }

  try {
    // Get the current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return { success: false, error: 'Authentication required' };
    }

    console.log('Calling text-to-speech function with:', { text: text.substring(0, 50) + '...', voiceId });

    // Call the secure backend function with proper error handling
    const { data, error } = await supabase.functions.invoke('text-to-speech', {
      body: {
        text,
        voiceId,
        options
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      
      // Handle specific error types
      if (error.message?.includes('Failed to fetch')) {
        return { 
          success: false, 
          error: 'Unable to connect to audio service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Backend function failed' 
      };
    }

    // Check if we received an error response from the function
    if (data && typeof data === 'object' && 'error' in data) {
      return {
        success: false,
        error: data.error as string
      };
    }

    // The response should be audio data
    if (data instanceof ArrayBuffer || data instanceof Blob) {
      // Convert to blob if needed
      const audioBlob = data instanceof Blob ? data : new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('Successfully generated audio, blob size:', audioBlob.size);

      return {
        success: true,
        audioUrl
      };
    } else {
      console.error('Unexpected response format:', typeof data, data);
      return {
        success: false,
        error: 'Invalid response format from audio service'
      };
    }

  } catch (error: any) {
    console.error('ElevenLabs Backend Error:', error);
    
    // Handle network errors specifically
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return {
        success: false,
        error: 'Network error: Unable to reach audio service. Please check your connection.'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to generate speech'
    };
  }
}

// Available voices (you can expand this list)
export const availableVoices = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, authoritative male voice' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Warm, friendly female voice' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Smooth, professional male voice' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Strong, confident male voice' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', description: 'Casual, conversational male voice' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', description: 'Clear, articulate male voice' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', description: 'Young, energetic male voice' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', description: 'Friendly, approachable male voice' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', description: 'Professional female voice' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', description: 'Versatile male voice' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', description: 'Calm, reassuring male voice' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', description: 'Mature, wise male voice' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', description: 'Distinguished male voice' },
  { id: 'YEUXwZHP2ZvOWK4nZtGz', name: 'Gigi', description: 'Bubbly, enthusiastic female voice' },
  { id: 'jsCqWAovK2LkecY7zXl4', name: 'Glinda', description: 'Elegant female voice' },
  { id: 'Z034UuNtJn7xCnyv2p0f', name: 'Grace', description: 'Gentle, soothing female voice' },
  { id: 'CYw3kZ02Hs0563khs1Fj', name: 'James', description: 'Authoritative male voice' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', description: 'Young, dynamic male voice' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', description: 'Sweet, melodic female voice' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', description: 'Warm, maternal female voice' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'Nicole', description: 'Professional, clear female voice' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'Patrick', description: 'Friendly, reliable male voice' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Rachel', description: 'Articulate female voice' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', description: 'Casual, relatable male voice' },
  { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena', description: 'Sophisticated female voice' },
  { id: 'Yko7PKHZNXotIFUBG7I9', name: 'Thomas', description: 'Calm, measured male voice' },
  { id: 'jBpfuIE2acCO8z3wKNLl', name: 'Will', description: 'Energetic, upbeat male voice' }
];

// Utility function to clean text for better speech synthesis
export function cleanTextForSpeech(text: string): string {
  return text
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Replace currency symbols with words
    .replace(/₹/g, 'rupees ')
    .replace(/\$/g, 'dollars ')
    // Add pauses for better pacing
    .replace(/\. /g, '. ... ')
    .replace(/! /g, '! ... ')
    .replace(/\? /g, '? ... ')
    // Replace numbers with more natural speech
    .replace(/(\d+)%/g, '$1 percent')
    .replace(/(\d+),(\d+)/g, '$1 thousand $2')
    // Clean up extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Cache for generated audio to avoid re-generating the same text
const audioCache = new Map<string, string>();

// Request queue to prevent concurrent requests
let requestQueue: Promise<ElevenLabsResponse> | null = null;

export async function getCachedSpeech(text: string, voiceId?: string): Promise<ElevenLabsResponse> {
  const cacheKey = `${text}-${voiceId || 'pNInz6obpgDQGcFmaJgB'}`;
  
  if (audioCache.has(cacheKey)) {
    return {
      success: true,
      audioUrl: audioCache.get(cacheKey)
    };
  }

  // If there's already a request in progress, wait for it to complete
  if (requestQueue) {
    await requestQueue;
  }

  // Create new request and add to queue
  requestQueue = generateSpeech(cleanTextForSpeech(text), voiceId);
  
  try {
    const result = await requestQueue;
    
    if (result.success && result.audioUrl) {
      audioCache.set(cacheKey, result.audioUrl);
    }
    
    return result;
  } finally {
    // Clear the queue when request completes
    requestQueue = null;
  }
}

// Cleanup function to revoke object URLs and clear cache
export function clearAudioCache(): void {
  audioCache.forEach(url => {
    URL.revokeObjectURL(url);
  });
  audioCache.clear();
}
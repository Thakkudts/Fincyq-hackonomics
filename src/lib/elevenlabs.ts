// ElevenLabs API integration for text-to-speech
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default voice ID (you can change this to your preferred voice)
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Adam voice

export const isElevenLabsConfigured = !!(ELEVENLABS_API_KEY && 
  ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key' &&
  ELEVENLABS_API_KEY.length > 10);

export interface ElevenLabsResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

export async function generateSpeech(
  text: string,
  voiceId: string = DEFAULT_VOICE_ID,
  options: {
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  } = {}
): Promise<ElevenLabsResponse> {
  if (!isElevenLabsConfigured) {
    console.warn('ElevenLabs API key not configured');
    return { success: false, error: 'ElevenLabs API key not configured' };
  }

  try {
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: options.stability || 0.5,
          similarity_boost: options.similarityBoost || 0.75,
          style: options.style || 0.0,
          use_speaker_boost: options.useSpeakerBoost || true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    // Convert response to blob and create object URL
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    return {
      success: true,
      audioUrl
    };

  } catch (error: any) {
    console.error('ElevenLabs API Error:', error);
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

export async function getCachedSpeech(text: string, voiceId?: string): Promise<ElevenLabsResponse> {
  const cacheKey = `${text}-${voiceId || DEFAULT_VOICE_ID}`;
  
  if (audioCache.has(cacheKey)) {
    return {
      success: true,
      audioUrl: audioCache.get(cacheKey)
    };
  }

  const result = await generateSpeech(cleanTextForSpeech(text), voiceId);
  
  if (result.success && result.audioUrl) {
    audioCache.set(cacheKey, result.audioUrl);
  }
  
  return result;
}

// Cleanup function to revoke object URLs and clear cache
export function clearAudioCache(): void {
  audioCache.forEach(url => {
    URL.revokeObjectURL(url);
  });
  audioCache.clear();
}
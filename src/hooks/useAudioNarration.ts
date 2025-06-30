import { useState, useEffect, useRef } from 'react';
import { generateSpeech, isElevenLabsConfigured, cleanTextForSpeech } from '../lib/elevenlabs';
import { useAudioCache } from './useAudioCache';

export interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
  hasAudio: boolean;
}

export function useAudioNarration(voiceId?: string) {
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    error: null,
    duration: 0,
    currentTime: 0,
    hasAudio: false
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTextRef = useRef<string>('');
  const isGeneratingRef = useRef<boolean>(false);
  const { getCachedAudio, cacheAudio } = useAudioCache();

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setAudioState(prev => ({
        ...prev,
        duration: audio.duration,
        hasAudio: true,
        isLoading: false
      }));
    };

    const handleTimeUpdate = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime
      }));
    };

    const handleEnded = () => {
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0
      }));
    };

    const handleError = () => {
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        isLoading: false,
        error: 'Failed to load audio',
        hasAudio: false
      }));
    };

    const handleCanPlay = () => {
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        hasAudio: true
      }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      
      // Cleanup
      audio.pause();
      if (audio.src) {
        URL.revokeObjectURL(audio.src);
      }
    };
  }, []);

  const generateAudio = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    
    // Prevent concurrent requests
    if (isGeneratingRef.current || audioState.isLoading) {
      console.log('Audio generation already in progress, skipping request');
      return false;
    }
    
    // Don't regenerate if it's the same text
    if (currentTextRef.current === text && audioState.hasAudio) {
      return true;
    }

    if (!isElevenLabsConfigured) {
      setAudioState(prev => ({
        ...prev,
        error: 'ElevenLabs API not configured. Voice narration requires backend setup.',
        hasAudio: false
      }));
      return false;
    }

    isGeneratingRef.current = true;
    
    setAudioState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      hasAudio: false
    }));

    try {
      const cleanedText = cleanTextForSpeech(text);
      const selectedVoiceId = voiceId || 'pNInz6obpgDQGcFmaJgB';

      // First, check if we have cached audio
      console.log('Checking cache for audio...');
      const cachedAudio = await getCachedAudio(cleanedText, selectedVoiceId);
      
      if (cachedAudio && cachedAudio.audioUrl && audioRef.current) {
        console.log('Using cached audio');
        
        // Clean up previous audio URL
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = cachedAudio.audioUrl;
        currentTextRef.current = text;
        
        setAudioState(prev => ({
          ...prev,
          isLoading: false,
          hasAudio: true
        }));
        
        return true;
      }

      // If not cached, generate new audio
      console.log('Generating new audio...');
      const result = await generateSpeech(cleanedText, selectedVoiceId);
      
      if (result.success && result.audioUrl && audioRef.current) {
        // Clean up previous audio URL
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = result.audioUrl;
        currentTextRef.current = text;
        
        // Cache the audio for future use
        try {
          // Convert blob URL back to ArrayBuffer for caching
          const response = await fetch(result.audioUrl);
          const audioData = await response.arrayBuffer();
          await cacheAudio(cleanedText, audioData, selectedVoiceId);
          console.log('Audio cached successfully');
        } catch (cacheError) {
          console.warn('Failed to cache audio:', cacheError);
          // Don't fail the whole operation if caching fails
        }
        
        setAudioState(prev => ({
          ...prev,
          isLoading: false,
          hasAudio: true
        }));
        
        return true;
      } else {
        // Provide more user-friendly error messages
        let errorMessage = result.error || 'Failed to generate audio';
        
        if (result.error?.includes('429')) {
          errorMessage = 'Audio service is busy. Please try again in a moment.';
        } else if (result.error?.includes('401') || result.error?.includes('unusual_activity')) {
          errorMessage = 'Audio service temporarily unavailable. Please check your API configuration.';
        } else if (result.error?.includes('quota') || result.error?.includes('limit')) {
          errorMessage = 'Audio service quota exceeded. Please try again later.';
        }
        
        setAudioState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          hasAudio: false
        }));
        return false;
      }
    } catch (error: any) {
      let errorMessage = error.message || 'Failed to generate audio';
      
      // Handle network errors gracefully
      if (error.message?.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        hasAudio: false
      }));
      return false;
    } finally {
      isGeneratingRef.current = false;
    }
  };

  const play = async () => {
    if (!audioRef.current || !audioState.hasAudio) return;

    try {
      await audioRef.current.play();
      setAudioState(prev => ({
        ...prev,
        isPlaying: true,
        error: null
      }));
    } catch (error: any) {
      setAudioState(prev => ({
        ...prev,
        error: 'Failed to play audio',
        isPlaying: false
      }));
    }
  };

  const pause = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    setAudioState(prev => ({
      ...prev,
      isPlaying: false
    }));
  };

  const stop = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0
    }));
  };

  const replay = async () => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    if (audioState.hasAudio) {
      await play();
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current || !audioState.hasAudio) return;

    audioRef.current.currentTime = Math.max(0, Math.min(time, audioState.duration));
  };

  const setVolume = (volume: number) => {
    if (!audioRef.current) return;

    audioRef.current.volume = Math.max(0, Math.min(1, volume));
  };

  return {
    audioState,
    generateAudio,
    play,
    pause,
    stop,
    replay,
    seek,
    setVolume,
    isConfigured: isElevenLabsConfigured
  };
}
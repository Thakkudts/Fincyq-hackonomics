import { useState, useEffect, useRef } from 'react';
import { getCachedSpeech, isElevenLabsConfigured, clearAudioCache } from '../lib/elevenlabs';

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAudioCache();
    };
  }, []);

  const generateAudio = async (text: string): Promise<boolean> => {
    if (!text.trim()) return false;
    
    // Don't regenerate if it's the same text
    if (currentTextRef.current === text && audioState.hasAudio) {
      return true;
    }

    if (!isElevenLabsConfigured) {
      setAudioState(prev => ({
        ...prev,
        error: 'ElevenLabs API not configured. Add VITE_ELEVENLABS_API_KEY to your .env file.',
        hasAudio: false
      }));
      return false;
    }

    setAudioState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      hasAudio: false
    }));

    try {
      const result = await getCachedSpeech(text, voiceId);
      
      if (result.success && result.audioUrl && audioRef.current) {
        // Clean up previous audio URL
        if (audioRef.current.src) {
          URL.revokeObjectURL(audioRef.current.src);
        }
        
        audioRef.current.src = result.audioUrl;
        currentTextRef.current = text;
        
        return true;
      } else {
        setAudioState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Failed to generate audio',
          hasAudio: false
        }));
        return false;
      }
    } catch (error: any) {
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to generate audio',
        hasAudio: false
      }));
      return false;
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
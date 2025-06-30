import { useRef, useState, useCallback } from 'react';

export function useBrowserTTS() {
  const synth = window.speechSynthesis;
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported) {
      setError('Speech synthesis not supported in this browser.');
      return;
    }
    if (synth.speaking) {
      synth.cancel();
    }
    setError(null);
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setIsSpeaking(true);
    };
    utter.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utter.onerror = (e) => {
      setError('Speech synthesis error');
      setIsPlaying(false);
      setIsPaused(false);
      setIsSpeaking(false);
    };
    utteranceRef.current = utter;
    synth.speak(utter);
  }, [isSupported, synth]);

  const pause = useCallback(() => {
    if (isSupported && synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
      setIsPlaying(false);
    }
  }, [isSupported, synth]);

  const resume = useCallback(() => {
    if (isSupported && synth.paused) {
      synth.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  }, [isSupported, synth]);

  const stop = useCallback(() => {
    if (isSupported && synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      setIsSpeaking(false);
    }
  }, [isSupported, synth]);

  return {
    isSupported,
    isPlaying,
    isPaused,
    isSpeaking,
    error,
    speak,
    pause,
    resume,
    stop,
  };
} 
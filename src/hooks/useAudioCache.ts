import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CachedAudio {
  id: string;
  textHash: string;
  voiceId: string;
  audioUrl?: string;
  audioData?: ArrayBuffer;
  contentType: string;
  fileSize: number;
  createdAt: string;
  expiresAt: string;
}

export function useAudioCache() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate a hash for the text content
  const generateTextHash = async (text: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // Check if audio exists in cache
  const getCachedAudio = async (text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB'): Promise<CachedAudio | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      setLoading(true);
      setError(null);

      const textHash = await generateTextHash(text);

      const { data, error: fetchError } = await supabase
        .from('audio_cache')
        .select('*')
        .eq('text_hash', textHash)
        .eq('voice_id', voiceId)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!data) return null;

      // Convert audio data to blob URL if we have binary data
      let audioUrl = data.audio_url;
      if (data.audio_data && !audioUrl) {
        const audioBlob = new Blob([data.audio_data], { type: data.content_type });
        audioUrl = URL.createObjectURL(audioBlob);
      }

      return {
        id: data.id,
        textHash: data.text_hash,
        voiceId: data.voice_id,
        audioUrl,
        audioData: data.audio_data,
        contentType: data.content_type,
        fileSize: data.file_size,
        createdAt: data.created_at,
        expiresAt: data.expires_at
      };

    } catch (err: any) {
      console.error('Error fetching cached audio:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Store audio in cache
  const cacheAudio = async (
    text: string, 
    audioData: ArrayBuffer, 
    voiceId: string = 'pNInz6obpgDQGcFmaJgB',
    contentType: string = 'audio/mpeg'
  ): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;

    try {
      setLoading(true);
      setError(null);

      const textHash = await generateTextHash(text);

      // Convert ArrayBuffer to Uint8Array for storage
      const audioBytes = new Uint8Array(audioData);

      const { error: insertError } = await supabase
        .from('audio_cache')
        .upsert({
          text_hash: textHash,
          voice_id: voiceId,
          audio_data: audioBytes,
          content_type: contentType,
          file_size: audioData.byteLength,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }, {
          onConflict: 'text_hash,voice_id'
        });

      if (insertError) {
        throw insertError;
      }

      return true;

    } catch (err: any) {
      console.error('Error caching audio:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clean up expired cache entries
  const cleanupExpiredCache = async (): Promise<void> => {
    if (!isSupabaseConfigured) return;

    try {
      const { error } = await supabase.rpc('cleanup_expired_audio_cache');
      if (error) {
        console.error('Error cleaning up cache:', error);
      }
    } catch (err) {
      console.error('Error cleaning up cache:', err);
    }
  };

  return {
    loading,
    error,
    getCachedAudio,
    cacheAudio,
    cleanupExpiredCache,
    generateTextHash
  };
}
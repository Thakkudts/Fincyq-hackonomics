/*
  # Create audio cache table for storing generated speech

  1. New Tables
    - `audio_cache`
      - `id` (uuid, primary key)
      - `text_hash` (text, unique hash of the text content)
      - `voice_id` (text, ElevenLabs voice ID)
      - `audio_url` (text, URL to the stored audio file)
      - `audio_data` (bytea, binary audio data)
      - `content_type` (text, MIME type)
      - `file_size` (integer, size in bytes)
      - `created_at` (timestamp)
      - `expires_at` (timestamp, for cache expiration)

  2. Security
    - Enable RLS on audio_cache table
    - Add policies for authenticated users to read cached audio
    - Only allow system to insert/update cache entries

  3. Indexes
    - Add indexes for efficient querying by text_hash and voice_id
*/

-- Create audio_cache table
CREATE TABLE IF NOT EXISTS audio_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text_hash text NOT NULL,
  voice_id text NOT NULL DEFAULT 'pNInz6obpgDQGcFmaJgB',
  audio_url text,
  audio_data bytea,
  content_type text DEFAULT 'audio/mpeg',
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz DEFAULT (now() + interval '30 days') NOT NULL,
  UNIQUE(text_hash, voice_id)
);

-- Enable Row Level Security
ALTER TABLE audio_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for audio_cache
CREATE POLICY "Anyone can read audio cache"
  ON audio_cache
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage audio cache"
  ON audio_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS audio_cache_text_hash_idx ON audio_cache(text_hash);
CREATE INDEX IF NOT EXISTS audio_cache_voice_id_idx ON audio_cache(voice_id);
CREATE INDEX IF NOT EXISTS audio_cache_hash_voice_idx ON audio_cache(text_hash, voice_id);
CREATE INDEX IF NOT EXISTS audio_cache_expires_at_idx ON audio_cache(expires_at);

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_audio_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM audio_cache WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired entries (optional)
-- This would need to be set up separately in Supabase dashboard
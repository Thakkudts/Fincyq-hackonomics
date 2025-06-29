/*
  # Create saved_ai_advice table for AI-powered financial advisor

  1. New Tables
    - `saved_ai_advice`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text)
      - `response` (text)
      - `category` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on saved_ai_advice table
    - Add policies for authenticated users to manage their own advice

  3. Indexes
    - Add indexes for better query performance
*/

-- Create saved_ai_advice table
CREATE TABLE IF NOT EXISTS saved_ai_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt text NOT NULL CHECK (length(prompt) > 0),
  response text NOT NULL CHECK (length(response) > 0),
  category text DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE saved_ai_advice ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_ai_advice
CREATE POLICY "Users can read own AI advice"
  ON saved_ai_advice
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI advice"
  ON saved_ai_advice
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI advice"
  ON saved_ai_advice
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI advice"
  ON saved_ai_advice
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS saved_ai_advice_user_id_idx ON saved_ai_advice(user_id);
CREATE INDEX IF NOT EXISTS saved_ai_advice_category_idx ON saved_ai_advice(category);
CREATE INDEX IF NOT EXISTS saved_ai_advice_created_at_idx ON saved_ai_advice(created_at DESC);
CREATE INDEX IF NOT EXISTS saved_ai_advice_user_created_idx ON saved_ai_advice(user_id, created_at DESC);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_ai_advice_updated_at
  BEFORE UPDATE ON saved_ai_advice
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
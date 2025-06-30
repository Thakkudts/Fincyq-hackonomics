/*
  # Create saved_ai_advice table

  1. New Tables
    - `saved_ai_advice`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `prompt` (text, required)
      - `response` (text, required)
      - `category` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `saved_ai_advice` table
    - Add policies for authenticated users to manage their own AI advice

  3. Indexes
    - Add indexes for efficient querying by user_id, category, and created_at
*/

-- Create the saved_ai_advice table
CREATE TABLE IF NOT EXISTS saved_ai_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prompt text NOT NULL,
  response text NOT NULL,
  category text DEFAULT ''::text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'saved_ai_advice_user_id_fkey'
  ) THEN
    ALTER TABLE saved_ai_advice 
    ADD CONSTRAINT saved_ai_advice_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'saved_ai_advice_prompt_check'
  ) THEN
    ALTER TABLE saved_ai_advice 
    ADD CONSTRAINT saved_ai_advice_prompt_check 
    CHECK (length(prompt) > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'saved_ai_advice_response_check'
  ) THEN
    ALTER TABLE saved_ai_advice 
    ADD CONSTRAINT saved_ai_advice_response_check 
    CHECK (length(response) > 0);
  END IF;
END $$;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS saved_ai_advice_user_id_idx ON saved_ai_advice(user_id);
CREATE INDEX IF NOT EXISTS saved_ai_advice_category_idx ON saved_ai_advice(category);
CREATE INDEX IF NOT EXISTS saved_ai_advice_created_at_idx ON saved_ai_advice(created_at DESC);
CREATE INDEX IF NOT EXISTS saved_ai_advice_user_created_idx ON saved_ai_advice(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_ai_advice ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_saved_ai_advice_updated_at
  BEFORE UPDATE ON saved_ai_advice
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
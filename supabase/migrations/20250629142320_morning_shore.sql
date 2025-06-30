/*
  # Create saved_ai_advice table for AI financial advice storage

  1. New Tables
    - `saved_ai_advice`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `prompt` (text, user's question)
      - `response` (text, AI's response)
      - `category` (text, categorized advice type)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `saved_ai_advice` table
    - Add policies for authenticated users to manage their own advice
    - Foreign key constraint to auth.users with cascade delete

  3. Performance
    - Indexes on user_id, category, and created_at for efficient querying
    - Composite index for user-specific queries

  4. Data Integrity
    - Check constraints to ensure prompt and response are not empty
    - Trigger to automatically update updated_at timestamp
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
      AND table_name = 'saved_ai_advice'
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

-- Create RLS policies with conditional checks
DO $$
BEGIN
  -- Policy for SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_ai_advice' 
      AND policyname = 'Users can read own AI advice'
  ) THEN
    CREATE POLICY "Users can read own AI advice"
      ON saved_ai_advice
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Policy for INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_ai_advice' 
      AND policyname = 'Users can insert own AI advice'
  ) THEN
    CREATE POLICY "Users can insert own AI advice"
      ON saved_ai_advice
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_ai_advice' 
      AND policyname = 'Users can update own AI advice'
  ) THEN
    CREATE POLICY "Users can update own AI advice"
      ON saved_ai_advice
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Policy for DELETE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_ai_advice' 
      AND policyname = 'Users can delete own AI advice'
  ) THEN
    CREATE POLICY "Users can delete own AI advice"
      ON saved_ai_advice
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger with conditional check
DO $$
BEGIN
  -- Drop the trigger if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_saved_ai_advice_updated_at'
      AND event_object_table = 'saved_ai_advice'
  ) THEN
    DROP TRIGGER update_saved_ai_advice_updated_at ON saved_ai_advice;
  END IF;
  
  -- Create the trigger
  CREATE TRIGGER update_saved_ai_advice_updated_at
    BEFORE UPDATE ON saved_ai_advice
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;
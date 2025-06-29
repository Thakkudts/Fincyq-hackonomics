/*
  # Create insurance advice table

  1. New Tables
    - `insurance_advice`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `insurance_type` (enum)
      - `current_coverage` (decimal)
      - `recommended_coverage` (decimal)
      - `monthly_premium` (decimal)
      - `provider` (text)
      - `notes` (text)
      - `priority` (enum)
      - `status` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on insurance_advice table
    - Add policies for authenticated users to manage their own insurance advice

  3. Indexes
    - Add indexes for better query performance
*/

-- Create enums for insurance advice
CREATE TYPE insurance_type AS ENUM ('health', 'life', 'disability', 'auto', 'home', 'umbrella');
CREATE TYPE insurance_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE insurance_status AS ENUM ('active', 'pending', 'researching');

-- Create insurance_advice table
CREATE TABLE IF NOT EXISTS insurance_advice (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insurance_type insurance_type NOT NULL,
  current_coverage decimal(12,2) NOT NULL DEFAULT 0 CHECK (current_coverage >= 0),
  recommended_coverage decimal(12,2) NOT NULL DEFAULT 0 CHECK (recommended_coverage >= 0),
  monthly_premium decimal(10,2) NOT NULL DEFAULT 0 CHECK (monthly_premium >= 0),
  provider text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  priority insurance_priority NOT NULL DEFAULT 'medium',
  status insurance_status NOT NULL DEFAULT 'researching',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE insurance_advice ENABLE ROW LEVEL SECURITY;

-- Create policies for insurance_advice
CREATE POLICY "Users can read own insurance advice"
  ON insurance_advice
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insurance advice"
  ON insurance_advice
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insurance advice"
  ON insurance_advice
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insurance advice"
  ON insurance_advice
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS insurance_advice_user_id_idx ON insurance_advice(user_id);
CREATE INDEX IF NOT EXISTS insurance_advice_type_idx ON insurance_advice(insurance_type);
CREATE INDEX IF NOT EXISTS insurance_advice_priority_idx ON insurance_advice(priority);
CREATE INDEX IF NOT EXISTS insurance_advice_status_idx ON insurance_advice(status);
CREATE INDEX IF NOT EXISTS insurance_advice_user_type_idx ON insurance_advice(user_id, insurance_type);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_insurance_advice_updated_at
  BEFORE UPDATE ON insurance_advice
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
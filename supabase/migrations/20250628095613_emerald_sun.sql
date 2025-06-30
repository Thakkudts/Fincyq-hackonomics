/*
  # Create user profiles and financial goals tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `age` (integer)
      - `income` (integer)
      - `monthly_expenses` (integer)
      - `monthly_savings` (integer)
      - `current_savings` (integer)
      - `risk_tolerance` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `financial_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `target_amount` (integer)
      - `target_year` (integer)
      - `priority` (enum)
      - `category` (enum)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create enums
CREATE TYPE risk_tolerance AS ENUM ('conservative', 'moderate', 'aggressive');
CREATE TYPE goal_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE goal_category AS ENUM ('home', 'education', 'travel', 'retirement', 'business', 'other');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age < 150),
  income integer NOT NULL CHECK (income >= 0),
  monthly_expenses integer NOT NULL CHECK (monthly_expenses >= 0),
  monthly_savings integer NOT NULL CHECK (monthly_savings >= 0),
  current_savings integer NOT NULL DEFAULT 0 CHECK (current_savings >= 0),
  risk_tolerance risk_tolerance NOT NULL DEFAULT 'moderate',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- Create financial_goals table
CREATE TABLE IF NOT EXISTS financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL CHECK (length(name) > 0),
  target_amount integer NOT NULL CHECK (target_amount > 0),
  target_year integer NOT NULL CHECK (target_year >= EXTRACT(YEAR FROM CURRENT_DATE)),
  priority goal_priority NOT NULL DEFAULT 'medium',
  category goal_category NOT NULL DEFAULT 'other',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for financial_goals
CREATE POLICY "Users can read own goals"
  ON financial_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON financial_goals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON financial_goals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON financial_goals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS financial_goals_user_id_idx ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS financial_goals_category_idx ON financial_goals(category);
CREATE INDEX IF NOT EXISTS financial_goals_priority_idx ON financial_goals(priority);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at
  BEFORE UPDATE ON financial_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
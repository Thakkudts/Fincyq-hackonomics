/*
  # Add car category to goal_category enum

  1. Changes
    - Add 'car' to goal_category enum if it doesn't already exist
    - Use conditional logic to avoid duplicate enum value error

  2. Safety
    - Check if enum value exists before adding
    - No destructive operations
*/

-- Add 'car' to the goal_category enum only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'car' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'goal_category'
    )
  ) THEN
    ALTER TYPE goal_category ADD VALUE 'car';
  END IF;
END $$;
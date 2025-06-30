/*
  # Add 'car' to goal_category enum

  1. Changes
    - Add 'car' as a valid value to the goal_category enum type
    - This allows users to save financial goals with 'car' as the category

  2. Security
    - No security changes needed, existing RLS policies remain in effect
*/

-- Add 'car' to the goal_category enum
ALTER TYPE goal_category ADD VALUE 'car';
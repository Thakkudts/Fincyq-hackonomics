/*
  # Add Car Category to Goal System

  1. Schema Changes
    - Add 'car' to the goal_category enum type
    - This will allow users to set car-related financial goals

  2. Security
    - No changes needed to existing RLS policies
    - Existing policies will automatically cover the new category
*/

-- Add 'car' to the goal_category enum
ALTER TYPE goal_category ADD VALUE 'car';
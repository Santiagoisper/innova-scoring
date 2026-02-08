-- Migration: Remove criteria with ID 2 and 3 (CUMPLIMIENTO NORMATIVA related)
-- Date: 2026-02-08
-- Description: Remove obsolete criteria from the criteria table

-- First, delete any responses referencing these criteria from evaluations
-- This prevents foreign key constraint violations
UPDATE evaluations 
SET responses = (
  SELECT jsonb_object_agg(key, value)
  FROM jsonb_each(responses)
  WHERE key::int NOT IN (2, 3)
)
WHERE responses IS NOT NULL;

-- Now delete the criteria records
DELETE FROM criteria WHERE id IN (2, 3);

-- Log the change
SELECT 'Successfully removed criteria with IDs 2 and 3' AS result;

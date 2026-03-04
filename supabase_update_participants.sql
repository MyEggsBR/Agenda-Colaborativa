-- Add event_id to participants table
ALTER TABLE participants ADD COLUMN IF NOT EXISTS event_id bigint REFERENCES events(id) ON DELETE CASCADE;

-- Update existing participants to link to the first event if exists
UPDATE participants SET event_id = (SELECT id FROM events ORDER BY created_at DESC LIMIT 1) WHERE event_id IS NULL;

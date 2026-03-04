-- Function to delete an event and all its related data safely
-- Run this in your Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_event_cascade(target_event_id bigint)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. Delete participants linked to this event
  -- We do this explicitly in case ON DELETE CASCADE is missing
  DELETE FROM participants WHERE event_id = target_event_id;
  
  -- 2. Try to delete from other potential tables (ignoring errors if they don't exist)
  BEGIN
    EXECUTE 'DELETE FROM votes WHERE event_id = $1' USING target_event_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  
  BEGIN
    EXECUTE 'DELETE FROM availabilities WHERE event_id = $1' USING target_event_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  
  BEGIN
    EXECUTE 'DELETE FROM event_availability WHERE event_id = $1' USING target_event_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- 3. Delete the event itself
  DELETE FROM events WHERE id = target_event_id;
END;
$$;


import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Could not read .env.local');
  process.exit(1);
}

const envVars: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1]] = match[2].replace(/^"(.*)"$/, '$1');
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDuplicates() {
  console.log('Checking for duplicate events...');
  
  // Fetch all events
  const { data: events, error } = await supabase.from('events').select('*');
  
  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  if (!events || events.length === 0) {
    console.log('No events found.');
    return;
  }

  // Group by ID
  const eventsById: Record<string, any[]> = {};
  events.forEach(event => {
    const id = String(event.id);
    if (!eventsById[id]) eventsById[id] = [];
    eventsById[id].push(event);
  });

  let duplicateCount = 0;

  for (const [id, duplicates] of Object.entries(eventsById)) {
    if (duplicates.length > 1) {
      console.log(`Found ${duplicates.length} duplicates for ID ${id}`);
      duplicateCount++;
      
      // 1. Fetch participants
      const { data: participants } = await supabase.from('participants').select('*').eq('event_id', id);
      console.log(`Found ${participants?.length || 0} participants for event ${id}`);
      
      // 2. Delete participants (to allow event deletion if no cascade, or just to be safe)
      if (participants && participants.length > 0) {
        const { error: delPartError } = await supabase.from('participants').delete().eq('event_id', id);
        if (delPartError) {
            console.error(`Error deleting participants for ID ${id}:`, delPartError);
            continue; // Skip this event if we can't delete participants
        }
      }
      
      // 3. Delete events
      const { error: deleteError } = await supabase.from('events').delete().eq('id', id);
      if (deleteError) {
        console.error(`Error deleting duplicates for ID ${id}:`, deleteError);
        // Try to restore participants
        if (participants && participants.length > 0) {
             await supabase.from('participants').insert(participants);
        }
        continue;
      }
      
      // 4. Re-insert ONE event
      const toKeep = duplicates[0];
      const { error: insertError } = await supabase.from('events').insert(toKeep);
      if (insertError) {
        console.error(`Error re-inserting event ID ${id}:`, insertError);
      } else {
          console.log(`Re-inserted event ID ${id}`);
      }
      
      // 5. Re-insert participants
      if (participants && participants.length > 0) {
        const { error: partInsertError } = await supabase.from('participants').insert(participants);
        if (partInsertError) {
             console.error(`Error re-inserting participants for event ${id}:`, partInsertError);
        } else {
            console.log(`Re-inserted ${participants.length} participants for event ${id}`);
        }
      }
      
      console.log(`Fixed ID ${id}`);
    }
  }

  if (duplicateCount === 0) {
    console.log('No duplicates found.');
  } else {
    console.log(`Fixed ${duplicateCount} sets of duplicates.`);
  }
}

fixDuplicates();

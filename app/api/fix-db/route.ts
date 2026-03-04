
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('Checking for duplicate events...');
  
  const { data: events, error } = await supabase.from('events').select('*');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!events || events.length === 0) {
    return NextResponse.json({ message: 'No events found' });
  }

  const eventsById: Record<string, any[]> = {};
  events.forEach(event => {
    const id = String(event.id);
    if (!eventsById[id]) eventsById[id] = [];
    eventsById[id].push(event);
  });

  let duplicateCount = 0;
  const logs: string[] = [];

  for (const [id, duplicates] of Object.entries(eventsById)) {
    if (duplicates.length > 1) {
      logs.push(`Found ${duplicates.length} duplicates for ID ${id}`);
      duplicateCount++;
      
      // 1. Fetch participants
      const { data: participants } = await supabase.from('participants').select('*').eq('event_id', id);
      logs.push(`Found ${participants?.length || 0} participants for event ${id}`);
      
      // 2. Delete participants
      if (participants && participants.length > 0) {
        const { error: delPartError } = await supabase.from('participants').delete().eq('event_id', id);
        if (delPartError) {
            logs.push(`Error deleting participants: ${delPartError.message}`);
            continue;
        }
      }
      
      // 3. Delete events
      const { error: delEventError } = await supabase.from('events').delete().eq('id', id);
      if (delEventError) {
          logs.push(`Error deleting events: ${delEventError.message}`);
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
          logs.push(`Error re-inserting event: ${insertError.message}`);
      }
      
      // 5. Re-insert participants
      if (participants && participants.length > 0) {
        const { error: partInsertError } = await supabase.from('participants').insert(participants);
        if (partInsertError) {
             logs.push(`Error re-inserting participants: ${partInsertError.message}`);
        }
      }
      
      logs.push(`Fixed ID ${id}`);
    }
  }

  return NextResponse.json({ 
    message: duplicateCount > 0 ? `Fixed ${duplicateCount} duplicates` : 'No duplicates found',
    logs 
  });
}

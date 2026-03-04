
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
      
      // 1. Fetch related data to restore later if needed
      // Note: We only backup participants if they are linked to this event. 
      // Global users (no event_id) won't be fetched here, which is correct.
      const { data: participants } = await supabase.from('participants').select('*').eq('event_id', id);
      const { data: votes } = await supabase.from('votes').select('*').eq('event_id', id);
      
      logs.push(`Found ${participants?.length || 0} participants and ${votes?.length || 0} votes for event ${id}`);
      
      // 2. Delete related data (to avoid FK constraints)
      // We try-catch these deletes to be safe
      if (votes && votes.length > 0) {
          const { error: delVotesError } = await supabase.from('votes').delete().eq('event_id', id);
          if (delVotesError) logs.push(`Error deleting votes: ${delVotesError.message}`);
      }

      // Also try deleting from other potential tables
      try { await supabase.from('availabilities').delete().eq('event_id', id); } catch {}
      try { await supabase.from('event_availability').delete().eq('event_id', id); } catch {}

      if (participants && participants.length > 0) {
        const { error: delPartError } = await supabase.from('participants').delete().eq('event_id', id);
        if (delPartError) {
            logs.push(`Error deleting participants: ${delPartError.message}`);
            // If we can't delete participants, we probably can't delete the event due to FK
            continue; 
        }
      }
      
      // 3. Delete ALL events with this ID
      const { error: delEventError } = await supabase.from('events').delete().eq('id', id);
      if (delEventError) {
          logs.push(`Error deleting events: ${delEventError.message}`);
          // Try to restore participants/votes if event deletion failed
          if (participants && participants.length > 0) await supabase.from('participants').insert(participants);
          if (votes && votes.length > 0) await supabase.from('votes').insert(votes);
          continue;
      }
      
      // 4. Re-insert ONE event
      const toKeep = duplicates[0];
      const { error: insertError } = await supabase.from('events').insert(toKeep);
      if (insertError) {
          logs.push(`Error re-inserting event: ${insertError.message}`);
      }
      
      // 5. Re-insert related data
      if (participants && participants.length > 0) {
        const { error: partInsertError } = await supabase.from('participants').insert(participants);
        if (partInsertError) logs.push(`Error re-inserting participants: ${partInsertError.message}`);
      }

      if (votes && votes.length > 0) {
        const { error: voteInsertError } = await supabase.from('votes').insert(votes);
        if (voteInsertError) logs.push(`Error re-inserting votes: ${voteInsertError.message}`);
      }
      
      logs.push(`Fixed ID ${id}`);
    }
  }

  return NextResponse.json({ 
    message: duplicateCount > 0 ? `Fixed ${duplicateCount} duplicates` : 'No duplicates found',
    logs 
  });
}

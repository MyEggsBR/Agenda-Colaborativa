
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // 1. Check participants table structure by fetching one row
  const { data: participants, error: partError } = await supabase.from('participants').select('*').limit(1);
  
  // 2. Check events table
  const { data: events, error: eventError } = await supabase.from('events').select('*').limit(1);

  return NextResponse.json({
    participantsStructure: participants?.[0] ? Object.keys(participants[0]) : 'empty',
    participantsError: partError,
    eventsStructure: events?.[0] ? Object.keys(events[0]) : 'empty',
    eventsError: eventError
  });
}


import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Try to insert a participant without event_id
  const { data, error } = await supabase.from('participants').insert({
    name: 'Test User Global',
    role: 'Tester'
  }).select();

  return NextResponse.json({
    success: !error,
    error,
    data
  });
}


import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvents() {
  console.log('Checking events...');
  const { data, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Error fetching events:', error);
    return;
  }
  console.log(`Found ${data.length} events.`);
  
  // Check for duplicate IDs
  const ids = data.map(e => e.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.error('DUPLICATE IDS FOUND!');
  const counts: Record<string, number> = {};
  ids.forEach((id: any) => {
    const key = String(id);
    counts[key] = (counts[key] || 0) + 1;
  });
  Object.entries(counts).forEach(([id, count]) => {
    if (count > 1) console.log(`ID ${id} appears ${count} times`);
  });
  } else {
    console.log('No duplicate IDs found.');
  }

  console.log('Events:', JSON.stringify(data, null, 2));
}

checkEvents();

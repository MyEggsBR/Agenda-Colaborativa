
-- Copie e cole este código no Editor SQL do seu painel Supabase

create table if not exists votes (
  id bigint primary key generated always as identity,
  event_id bigint references events(id) on delete cascade,
  user_id bigint references participants(id) on delete cascade,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id, date)
);

alter table votes enable row level security;

create policy "Enable read access for all users" on votes for select using (true);
create policy "Enable insert for all users" on votes for insert with check (true);
create policy "Enable update for all users" on votes for update using (true);
create policy "Enable delete for all users" on votes for delete using (true);

-- Create participants table
create table if not exists participants (
  id bigint primary key generated always as identity,
  name text not null,
  role text,
  avatar_url text,
  phone text,
  birthday date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up storage for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies
-- Allow public read access to participants
create policy "Public participants are viewable by everyone"
  on participants for select
  using ( true );

-- Allow public insert/update/delete
create policy "Public participants are insertable by everyone"
  on participants for insert
  with check ( true );

create policy "Public participants are updateable by everyone"
  on participants for update
  using ( true );

create policy "Public participants are deletable by everyone"
  on participants for delete
  using ( true );

-- Storage policies
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar"
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Anyone can update an avatar"
  on storage.objects for update
  with check ( bucket_id = 'avatars' );

create policy "Anyone can delete an avatar"
  on storage.objects for delete
  using ( bucket_id = 'avatars' );

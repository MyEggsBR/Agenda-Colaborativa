-- Copie e cole este código no Editor SQL do seu painel Supabase para configurar o banco de dados.

-- 1. Criação da tabela de participantes
create table if not exists participants (
  id bigint primary key generated always as identity,
  name text not null,
  role text,
  avatar_url text,
  phone text,
  birthday text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Habilitar Row Level Security (RLS)
alter table participants enable row level security;

-- 3. Criar políticas de acesso (Permitindo acesso público para facilitar o teste)
-- ATENÇÃO: Em produção, você deve restringir isso apenas para usuários autenticados/admins.

-- Permitir leitura para todos
create policy "Enable read access for all users" on participants for select using (true);

-- Permitir inserção para todos
create policy "Enable insert for all users" on participants for insert with check (true);

-- Permitir atualização para todos
create policy "Enable update for all users" on participants for update using (true);

-- Permitir exclusão para todos
create policy "Enable delete for all users" on participants for delete using (true);

-- 4. Configuração do Storage para Avatares
-- Cria o bucket 'avatars' se não existir
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Políticas de acesso ao Storage
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- 5. Criação da tabela de eventos (para configurações do evento)
create table if not exists events (
  id bigint primary key generated always as identity,
  title text not null default 'Evento',
  description text,
  location text,
  start_date date,
  end_date date,
  date_display text default '10-15 de Outubro',
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS para eventos
alter table events enable row level security;

-- Políticas para eventos (Público para leitura, Admin para escrita - simplificado para demo)
create policy "Enable read access for all users" on events for select using (true);
create policy "Enable insert for all users" on events for insert with check (true);
create policy "Enable update for all users" on events for update using (true);
create policy "Enable delete for all users" on events for delete using (true);

-- 6. Criação da tabela de votos
create table if not exists votes (
  id bigint primary key generated always as identity,
  event_id bigint references events(id) on delete cascade,
  user_id bigint references participants(id) on delete cascade,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id, date)
);

-- Habilitar RLS para votos
alter table votes enable row level security;

-- Políticas para votos (Público para leitura/escrita - simplificado para demo)
create policy "Enable read access for all users" on votes for select using (true);
create policy "Enable insert for all users" on votes for insert with check (true);
create policy "Enable update for all users" on votes for update using (true);
create policy "Enable delete for all users" on votes for delete using (true);

-- Inserir um evento padrão se não existir
insert into events (title, description, location, start_date, end_date, status)
select 'Churrasco de Confraternização', 'Vamos celebrar o fim de ano juntos!', 'Área de Lazer da Empresa', '2023-11-10', '2023-11-15', 'active'
where not exists (select 1 from events limit 1);


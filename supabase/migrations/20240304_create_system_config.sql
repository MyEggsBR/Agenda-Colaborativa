-- Create system_config table
CREATE TABLE IF NOT EXISTS public.system_config (
    key TEXT PRIMARY KEY,
    value TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow public read access (so everyone can see system name/logo)
CREATE POLICY "Allow public read access" ON public.system_config
    FOR SELECT
    USING (true);

-- Allow authenticated users (admins) to insert/update
CREATE POLICY "Allow authenticated insert/update" ON public.system_config
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Insert default values if they don't exist
INSERT INTO public.system_config (key, value)
VALUES 
    ('system_name', 'Agenda de encontros Circulo Céu Azul'),
    ('primary_color', '#2563eb'),
    ('secondary_color', '#1e293b')
ON CONFLICT (key) DO NOTHING;

-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to avatars bucket
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Allow authenticated users to upload avatars
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );


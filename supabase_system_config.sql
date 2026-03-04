-- Create a table for system configuration
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert default values if they don't exist
INSERT INTO system_config (key, value) VALUES
  ('system_name', 'Agenda de encontros Circulo Céu Azul'),
  ('logo_url', ''), -- Empty by default, can be updated
  ('primary_color', '#2563eb'), -- Default blue-600
  ('secondary_color', '#1e293b') -- Default slate-800
ON CONFLICT (key) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow everyone to read config
CREATE POLICY "Allow public read access" ON system_config
  FOR SELECT USING (true);

-- Allow authenticated users (admin) to update config
CREATE POLICY "Allow authenticated update access" ON system_config
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert (if needed)
CREATE POLICY "Allow authenticated insert access" ON system_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

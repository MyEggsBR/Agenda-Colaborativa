import { supabase } from '@/lib/supabase';

export interface SystemConfig {
  system_name: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
}

export const defaultConfig: SystemConfig = {
  system_name: 'Agenda de encontros Circulo Céu Azul',
  logo_url: '',
  primary_color: '#2563eb',
  secondary_color: '#1e293b'
};

export async function getSystemConfig(): Promise<SystemConfig> {
  try {
    const { data, error } = await supabase
      .from('system_config')
      .select('*');
    
    if (error || !data) {
      console.warn('Error fetching system config:', error);
      return defaultConfig;
    }

    const config = { ...defaultConfig };
    data.forEach((item: any) => {
      if (item.key in config) {
        // @ts-ignore
        config[item.key] = item.value;
      }
    });

    return config;
  } catch (error) {
    console.error('Unexpected error fetching config:', error);
    return defaultConfig;
  }
}

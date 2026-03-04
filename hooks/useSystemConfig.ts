import { useState, useEffect } from 'react';
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

export function useSystemConfig() {
  const [config, setConfig] = useState<SystemConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*');
        
        if (error) {
          console.warn('Error fetching system config:', error);
        } else if (data) {
          const newConfig = { ...defaultConfig };
          data.forEach((item: any) => {
            if (item.key in newConfig) {
              // @ts-ignore
              newConfig[item.key] = item.value;
            }
          });
          setConfig(newConfig);
          
          // Update CSS variables for primary/secondary colors
          if (newConfig.primary_color) {
            document.documentElement.style.setProperty('--primary', newConfig.primary_color);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
}

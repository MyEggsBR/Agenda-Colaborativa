'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Save, Upload, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export default function SystemConfigPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState({
    system_name: 'Agenda de encontros Circulo Céu Azul',
    logo_url: '',
    primary_color: '#2563eb',
    secondary_color: '#1e293b'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('*');
      
      if (error) {
        // If table doesn't exist, we might get an error. 
        // We'll just use defaults if fetch fails, but log it.
        console.warn('Error fetching config (table might not exist yet):', error);
      } else if (data) {
        const newConfig = { ...config };
        data.forEach((item: any) => {
          if (item.key in newConfig) {
            // @ts-ignore
            newConfig[item.key] = item.value;
          }
        });
        setConfig(newConfig);
      }
    } catch (err) {
      console.error('Unexpected error fetching config:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const uploadLogo = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `system-logo-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars') // Reusing avatars bucket for simplicity, or create a 'system' bucket
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let logoUrl = config.logo_url;

      if (logoFile) {
        logoUrl = await uploadLogo(logoFile);
      }

      const updates = [
        { key: 'system_name', value: config.system_name },
        { key: 'logo_url', value: logoUrl },
        { key: 'primary_color', value: config.primary_color },
        { key: 'secondary_color', value: config.secondary_color }
      ];

      // Upsert each config item
      for (const update of updates) {
        const { error } = await supabase
          .from('system_config')
          .upsert(update, { onConflict: 'key' });
        
        if (error) throw error;
      }

      setConfig(prev => ({ ...prev, logo_url: logoUrl }));
      setSuccess('Configurações salvas com sucesso!');
      
      // Update CSS variables immediately for preview (optional, requires reload usually)
      document.documentElement.style.setProperty('--primary', config.primary_color);
      
    } catch (err: any) {
      console.error('Error saving config:', err);
      setError('Erro ao salvar configurações: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="mx-auto max-w-2xl">
        <Link 
          href="/admin"
          className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para o Painel
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="mb-6 text-2xl font-bold">Configuração do Sistema</h1>
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400 flex items-center gap-2">
              <Save className="h-4 w-4" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Sistema</label>
              <input 
                type="text"
                required
                value={config.system_name}
                onChange={(e) => setConfig({...config, system_name: e.target.value})}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Ex: Agenda de encontros"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Logo do Sistema</label>
              <div className="flex flex-col gap-4">
                {config.logo_url && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                    <Image 
                      src={config.logo_url} 
                      alt="Logo Preview" 
                      fill 
                      className="object-contain p-2"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                    <Upload className="h-4 w-4" />
                    <span>{logoFile ? 'Arquivo selecionado' : 'Upload de nova logo'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {logoFile && (
                    <span className="text-xs text-slate-500">{logoFile.name}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                    className="h-10 w-10 cursor-pointer rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input 
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({...config, primary_color: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cor Secundária</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({...config, secondary_color: e.target.value})}
                    className="h-10 w-10 cursor-pointer rounded border border-slate-300 p-1 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input 
                    type="text"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({...config, secondary_color: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, UserCircle, Plus, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export default function LoginPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserName, setNewUserName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { config, loading: configLoading } = useSystemConfig();

  useEffect(() => {
    const fetchParticipants = async () => {
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching participants:', error);
      } else {
        setParticipants(data || []);
      }
      setIsLoading(false);
    };

    fetchParticipants();
  }, []);

  const handleLogin = (participant: any) => {
    localStorage.setItem('syncup_user', JSON.stringify(participant));
    router.push('/');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    const { data, error } = await supabase
      .from('participants')
      .insert({ name: newUserName.trim() })
      .select()
      .single();

    if (error) {
      alert('Erro ao criar usuário: ' + error.message);
    } else {
      handleLogin(data);
    }
  };

  if (isLoading || configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 font-sans">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 overflow-hidden relative">
            {config.logo_url ? (
              <Image 
                src={`${config.logo_url}?t=${Date.now()}`} 
                alt="Logo" 
                fill 
                className="object-contain p-2" 
              />
            ) : (
              <Calendar className="h-10 w-10 text-blue-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bem-vindo ao {config.system_name}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Quem é você? Selecione seu nome para continuar.</p>
        </div>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {participants.map((participant) => (
            <button
              key={participant.id}
              onClick={() => handleLogin(participant)}
              className="flex w-full items-center gap-4 rounded-xl border border-slate-200 p-4 transition-all hover:border-blue-600 hover:bg-blue-50 dark:border-slate-800 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
            >
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-slate-100">
                <Image 
                  src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`} 
                  alt={participant.name} 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="text-left flex-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">{participant.name}</p>
                <p className="text-xs text-slate-500 capitalize">{participant.role || 'Participante'}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </button>
          ))}
          
          {participants.length === 0 && !isCreating && (
            <p className="text-center text-sm text-slate-500">Nenhum participante encontrado.</p>
          )}
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateUser} className="space-y-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Seu Nome</label>
              <input 
                type="text"
                required
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                placeholder="Ex: João Silva"
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                Criar Conta
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 p-4 text-sm font-medium text-slate-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all dark:border-slate-700 dark:hover:bg-blue-900/10"
          >
            <Plus className="h-4 w-4" />
            Não encontrei meu nome
          </button>
        )}
        
        <div className="mt-8 flex justify-center border-t border-slate-100 pt-6 dark:border-slate-800">
          <Link href="/admin" className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors">
            <UserCircle className="h-4 w-4" />
            <span>Acessar Painel Administrativo</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

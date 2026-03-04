
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  ChevronRight, 
  UserCircle,
  LogOut,
  Settings,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export default function EventsListPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { config, loading: configLoading } = useSystemConfig();

  useEffect(() => {
    const init = async () => {
      // 1. Check user login
      const storedUser = localStorage.getItem('syncup_user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      setCurrentUser(JSON.parse(storedUser));

      // 2. Fetch events
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
      setIsLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('syncup_user');
    router.push('/login');
  };

  if (isLoading || configLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 relative overflow-hidden">
            {config.logo_url ? (
              <Image 
                src={`${config.logo_url}?t=${Date.now()}`} 
                alt="Logo" 
                fill 
                className="object-contain p-1" 
              />
            ) : (
              <Calendar className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{config.system_name}</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Painel Admin</Link>
          </nav>
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">{currentUser?.name}</span>
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-100">
               <Image 
                 src={currentUser?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'User')}&background=random`} 
                 alt={currentUser?.name || 'User'} 
                 fill 
                 className="object-cover" 
               />
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 lg:p-10 flex justify-center">
        <div className="w-full max-w-4xl space-y-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Eventos Disponíveis</h2>
              <p className="text-slate-500 dark:text-slate-400">Selecione um evento para votar na sua disponibilidade.</p>
            </div>
          </div>

          <div className="grid gap-4">
            {events.map((event) => (
              <Link 
                key={event.id} 
                href={`/vote/${event.id}`}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">
                      {event.description || 'Sem descrição.'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      {event.date_display && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.date_display}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <UserCircle className="h-3 w-3" />
                        Organizado por Admin
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 group-hover:bg-blue-600 group-hover:text-white dark:bg-slate-800 dark:text-slate-300 transition-colors">
                    Votar
                  </span>
                </div>
              </Link>
            ))}

            {events.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Nenhum evento encontrado</h3>
                <p className="mt-1 text-sm text-slate-500">Aguarde o administrador criar novos eventos.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

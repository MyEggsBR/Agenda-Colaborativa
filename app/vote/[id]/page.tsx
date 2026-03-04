
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  UserCircle,
  Lock,
  RefreshCw,
  Settings,
  MoreHorizontal,
  ArrowLeft
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Check user login
      const storedUser = localStorage.getItem('syncup_user');
      if (!storedUser) {
        router.push('/login');
        return;
      }
      setCurrentUser(JSON.parse(storedUser));

      // 2. Fetch event details
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();
      
      if (error) {
        console.error('Error fetching event:', error);
        alert('Evento não encontrado.');
        router.push('/');
      } else {
        setEventDetails(data);
        // Set initial calendar date to event start date if available
        if (data.start_date) {
            setCurrentDate(new Date(data.start_date));
        }
      }
      setIsLoading(false);
    };

    init();
  }, [eventId, router]);

  // 3. Fetch existing votes for this user and event
  useEffect(() => {
    if (!currentUser || !eventDetails) return;

    const fetchVotes = async () => {
      const { data, error } = await supabase
        .from('votes')
        .select('date')
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Error fetching votes:', error);
      } else if (data) {
        setSelectedDates(data.map((v: any) => new Date(v.date)));
      }
    };

    fetchVotes();
  }, [currentUser, eventDetails, eventId]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const toggleDate = (day: Date) => {
    const isSelected = selectedDates.some(d => isSameDay(d, day));
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, day)));
    } else {
      setSelectedDates([...selectedDates, day]);
    }
  };

  const handleSave = async () => {
    if (!currentUser || !eventDetails) return;
    setIsSaving(true);

    try {
      // 1. Delete existing votes for this user/event
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', currentUser.id);
      
      if (deleteError) throw deleteError;

      // 2. Insert new votes
      if (selectedDates.length > 0) {
        const votesToInsert = selectedDates.map(date => ({
          event_id: eventId,
          user_id: currentUser.id,
          date: format(date, 'yyyy-MM-dd')
        }));

        const { error: insertError } = await supabase
          .from('votes')
          .insert(votesToInsert);
        
        if (insertError) throw insertError;
      }

      alert('Disponibilidade salva com sucesso!');
      router.push('/');
    } catch (error: any) {
      console.error('Error saving votes:', error);
      if (error.message?.includes('Could not find the table')) {
        alert('Erro: A tabela de votos não existe. Por favor, contate o administrador para executar o script de configuração do banco de dados.');
      } else {
        alert('Erro ao salvar: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (isLoading || !eventDetails || !currentUser) {
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
          <Link href="/" className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 hidden md:block">SyncUp</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">{currentUser.name}</span>
            <div className="relative h-9 w-9 overflow-hidden rounded-full bg-slate-100">
               <Image 
                 src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`} 
                 alt={currentUser.name} 
                 fill 
                 className="object-cover" 
               />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 lg:p-10 flex justify-center">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Sidebar */}
          <aside className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6">
                <span className="mb-2 inline-block rounded bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {eventDetails.status === 'cancelled' ? 'Cancelado' : 'Evento'}
                </span>
                <h2 className="text-2xl font-black leading-tight tracking-tight">{eventDetails.title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <UserCircle className="h-4 w-4" /> Organizado por Admin
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">Descrição</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {eventDetails.description || 'Sem descrição.'}
                  </p>
                  {eventDetails.date_display && (
                    <p className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      Datas sugeridas: {eventDetails.date_display}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* PRIVACY: Removed participants list from public view as requested */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2">Privacidade</h3>
                <p className="text-xs text-slate-500">
                    Seus votos são confidenciais e visíveis apenas para o organizador.
                </p>
            </div>
          </aside>

          {/* Main Calendar Area */}
          <section className="flex flex-col gap-6 lg:col-span-8">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
              <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Selecione Sua Disponibilidade</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Escolha todas as datas que funcionam para você.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                    <span className="text-xs font-medium text-slate-500">Disponível</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"></div>
                    <span className="text-xs font-medium text-slate-500">Indisponível</span>
                  </div>
                </div>
              </div>

              {/* Calendar Controls */}
              <div className="mb-4 flex items-center justify-between">
                <button onClick={prevMonth} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100 capitalize">
                  {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </p>
                <button onClick={nextMonth} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="flex h-10 items-center justify-center text-xs font-bold uppercase tracking-wider text-slate-400">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, idx) => {
                  const isSelected = selectedDates.some(d => isSameDay(d, day));
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => toggleDate(day)}
                      disabled={!isCurrentMonth}
                      className={cn(
                        "group relative h-14 w-full md:h-16",
                        !isCurrentMonth && "opacity-0 pointer-events-none"
                      )}
                    >
                      <div className={cn(
                        "flex h-full w-full items-center justify-center rounded-xl border transition-all text-sm font-medium",
                        isSelected 
                          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold" 
                          : "border-transparent bg-slate-50 text-slate-400 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:bg-slate-800/50 dark:hover:bg-blue-900/20 dark:hover:border-blue-800",
                        isTodayDate && !isSelected && "border-slate-300 dark:border-slate-600"
                      )}>
                        {format(day, 'd')}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedDates.length} dias selecionados
                </span>
                <span className="text-xs text-slate-500">Clique em salvar para confirmar</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedDates([])}
                  className="hidden rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:block transition-colors"
                >
                  Limpar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Disponibilidade'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

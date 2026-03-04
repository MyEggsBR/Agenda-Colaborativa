'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  LogOut,
  User,
  Mail,
  ArrowRight,
  Loader2,
  CalendarDays,
  Clock
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// --- Types ---
type User = {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
  role?: string;
};

type Event = {
  id: number;
  title: string;
  description: string;
  status: string;
  date_display?: string;
  created_at: string;
};

// --- Components ---

// 1. Auth Screen
const AuthScreen = ({ onLogin }: { onLogin: (user: User) => void }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Check if user exists by email
      const { data, error } = await supabase
        .from('participants')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        onLogin(data);
      } else {
        setIsRegistering(true); // User not found, show registration fields
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Erro ao entrar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const newUser = {
        name,
        email,
        role: 'user',
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };

      const { data, error } = await supabase
        .from('participants')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;
      onLogin(data);
    } catch (error: any) {
      console.error('Registration error:', error);
      alert('Erro ao registrar: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isRegistering) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Criar Conta</h2>
            <p className="mt-2 text-sm text-slate-500">Preencha seus dados para continuar</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email"
                required
                value={email}
                disabled
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/50"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Criando...' : 'Confirmar Cadastro'}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(false)}
              className="w-full text-sm text-slate-500 hover:text-slate-700"
            >
              Voltar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bem-vindo ao SyncUp</h2>
          <p className="mt-2 text-sm text-slate-500">Entre com seu email para acessar os eventos</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="block w-full rounded-lg border border-slate-300 pl-10 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

// 2. Event List Screen
const EventList = ({ onSelect, user, onLogout }: { onSelect: (event: Event) => void, user: User, onLogout: () => void }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {user.name.charAt(0)}
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Olá, {user.name}</h1>
                <p className="text-sm text-slate-500">Selecione um evento para votar</p>
            </div>
        </div>
        <button onClick={onLogout} className="text-slate-500 hover:text-red-600 transition-colors">
            <LogOut className="h-5 w-5" />
        </button>
      </header>

      {isLoading ? (
        <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map(event => (
                <button
                    key={event.id}
                    onClick={() => onSelect(event)}
                    className="group relative flex flex-col items-start rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500"
                >
                    <div className="mb-4 rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-900/20">
                        <CalendarDays className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">{event.title}</h3>
                    <p className="mb-4 text-sm text-slate-500 line-clamp-2 text-left">{event.description}</p>
                    <div className="mt-auto flex w-full items-center justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-500 dark:border-slate-800">
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {event.status === 'active' ? 'Em andamento' : 'Finalizado'}
                        </span>
                        <span className="flex items-center gap-1 text-blue-600 group-hover:translate-x-1 transition-transform">
                            Votar <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                </button>
            ))}
            {events.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                    Nenhum evento encontrado.
                </div>
            )}
        </div>
      )}
    </div>
  );
};

// 3. Calendar/Voting Screen
const EventCalendar = ({ event, user, onBack }: { event: Event, user: User, onBack: () => void }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const { data, error } = await supabase
          .from('votes')
          .select('date')
          .eq('event_id', event.id)
          .eq('participant_id', user.id); // Only fetch MY votes

        if (error) throw error;

        if (data) {
          setSelectedDates(data.map((v: any) => parseISO(v.date))); // Assuming date is stored as ISO string or timestamp
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVotes();
  }, [event.id, user.id]);

  const toggleDate = (day: Date) => {
    const isSelected = selectedDates.some(d => isSameDay(d, day));
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => !isSameDay(d, day)));
    } else {
      setSelectedDates([...selectedDates, day]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Delete old votes for this user/event
      const { error: deleteError } = await supabase
        .from('votes')
        .delete()
        .eq('event_id', event.id)
        .eq('participant_id', user.id);

      if (deleteError) throw deleteError;

      // 2. Insert new votes
      if (selectedDates.length > 0) {
        const votesToInsert = selectedDates.map(date => ({
          event_id: event.id,
          participant_id: user.id,
          date: format(date, 'yyyy-MM-dd') // Store as YYYY-MM-DD
        }));

        const { error: insertError } = await supabase
          .from('votes')
          .insert(votesToInsert);

        if (insertError) throw insertError;
      }

      alert('Disponibilidade salva com sucesso!');
    } catch (error: any) {
      console.error('Error saving votes:', error);
      alert('Erro ao salvar: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        <button onClick={onBack} className="mb-6 flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600">
            <ChevronLeft className="h-4 w-4" /> Voltar para eventos
        </button>

        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-slate-900">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{event.title}</h1>
            <p className="mt-2 text-slate-500">{event.description}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
            {/* Calendar Header */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Sua Disponibilidade</h2>
                    <p className="text-sm text-slate-500">Selecione os dias que você pode participar.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                        <span className="text-xs font-medium text-slate-500">Selecionado</span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="mb-4 flex items-center justify-between">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronLeft className="h-5 w-5" /></button>
                <span className="font-bold capitalize">{format(currentDate, 'MMMM yyyy', { locale: ptBR })}</span>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="h-5 w-5" /></button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-slate-400 py-2">{d}</div>
                ))}
                {calendarDays.map(day => {
                    const isSelected = selectedDates.some(d => isSameDay(d, day));
                    const isCurrentMonth = isSameMonth(day, currentDate);
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => toggleDate(day)}
                            disabled={!isCurrentMonth}
                            className={cn(
                                "h-14 w-full rounded-lg border text-sm transition-all",
                                !isCurrentMonth && "opacity-0 pointer-events-none",
                                isSelected 
                                    ? "bg-blue-600 text-white border-blue-600 font-bold shadow-md" 
                                    : "bg-slate-50 text-slate-500 border-transparent hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800/50"
                            )}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                <span className="text-sm font-medium text-slate-600">
                    {selectedDates.length} dias selecionados
                </span>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Salvar Disponibilidade
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'auth' | 'events' | 'calendar'>('auth');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Check for stored user session (simple localStorage for demo)
  useEffect(() => {
    const storedUser = localStorage.getItem('syncup_user');
    if (storedUser) {
      // eslint-disable-next-line
      setUser(JSON.parse(storedUser));
      setView('events');
    }

    // Check for invalid Supabase session (e.g. from Admin login) that might block requests
    const checkSupabaseSession = async () => {
        const { error } = await supabase.auth.getSession();
        if (error && (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token'))) {
            console.warn('Invalid Supabase refresh token detected in App. Signing out to clear state...');
            await supabase.auth.signOut();
        }
    };
    checkSupabaseSession();

  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('syncup_user', JSON.stringify(loggedInUser));
    setView('events');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('syncup_user');
    setView('auth');
    setSelectedEvent(null);
  };

  if (!user) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  if (view === 'events') {
    return <EventList user={user} onSelect={(e) => { setSelectedEvent(e); setView('calendar'); }} onLogout={handleLogout} />;
  }

  if (view === 'calendar' && selectedEvent) {
    return <EventCalendar event={selectedEvent} user={user} onBack={() => setView('events')} />;
  }

  return <div>Loading...</div>;
}

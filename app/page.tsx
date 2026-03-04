'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  MoreHorizontal, 
  Bell, 
  UserCircle,
  Lock,
  RefreshCw,
  Settings
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

export default function ParticipantView() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date(2023, 10, 1)); // November 2023
  const [selectedDates, setSelectedDates] = useState<Date[]>([
    new Date(2023, 10, 6),
    new Date(2023, 10, 7),
    new Date(2023, 10, 8),
    new Date(2023, 10, 14),
    new Date(2023, 10, 15),
  ]);

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
    };

    const fetchEventDetails = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .single();
      
      if (error) {
        console.error('Error fetching event details:', error);
      } else {
        setEventDetails(data);
      }
    };

    fetchParticipants();
    fetchEventDetails();
  }, []);

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

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950 font-sans">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Bem-vindo ao SyncUp</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Quem é você? Selecione seu nome para continuar.</p>
          </div>
          <div className="space-y-3">
            {participants.map((participant) => (
              <button
                key={participant.id}
                onClick={() => setCurrentUser(participant)}
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
                <div className="text-left">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{participant.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{participant.role || 'Participante'}</p>
                </div>
              </button>
            ))}
            {participants.length === 0 && (
              <p className="text-center text-sm text-slate-500">Nenhum participante encontrado.</p>
            )}
          </div>
          
          <div className="mt-8 flex justify-center border-t border-slate-100 pt-6 dark:border-slate-800">
            <Link href="/admin" className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-600 transition-colors">
              <Settings className="h-4 w-4" />
              <span>Acessar Painel Administrativo</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 text-blue-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <Calendar className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">SyncUp</h1>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">Painel</Link>
          </nav>
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
            <button 
              onClick={() => setCurrentUser(null)}
              className="ml-2 text-xs text-slate-500 hover:text-blue-600"
            >
              Sair
            </button>
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
                  {eventDetails?.status === 'cancelled' ? 'Cancelado' : 'Reunião'}
                </span>
                <h2 className="text-2xl font-black leading-tight tracking-tight">{eventDetails?.title || 'Planejamento Estratégico Anual'}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                  <UserCircle className="h-4 w-4" /> Organizado por Sarah Miller
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <h3 className="mb-2 text-sm font-bold text-slate-900 dark:text-slate-100">Descrição</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {eventDetails?.description || 'Finalizar metas do Q4 e visão para 2024. Precisamos alinhar os objetivos de todos os departamentos antes do final do mês.'}
                  </p>
                  {eventDetails?.date_display && (
                    <p className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                      Datas sugeridas: {eventDetails.date_display}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Participantes (4/6 Votaram)
              </h3>
              <div className="space-y-4">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8 overflow-hidden rounded-full bg-slate-100">
                        <Image 
                          src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`} 
                          alt={participant.name}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{participant.name}</span>
                    </div>
                    {/* Mock status for now as we don't have voting data yet */}
                    <MoreHorizontal className="h-4 w-4 text-slate-300" />
                  </div>
                ))}
              </div>
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
                <span className="text-xs text-slate-500">Última atualização: Agora mesmo</span>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedDates([])}
                  className="hidden rounded-lg bg-slate-100 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 sm:block transition-colors"
                >
                  Limpar Seleção
                </button>
                <button className="rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all">
                  Salvar Minha Disponibilidade
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-10 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <a href="#" className="hover:text-blue-600">Reuniões</a>
          <span>/</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">Planejamento Estratégico Anual</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Lock className="h-3 w-3" /> Votação Segura
          </span>
          <span className="flex items-center gap-1">
            <RefreshCw className="h-3 w-3" /> Sincronização automática ativada
          </span>
          <Link href="/admin" className="ml-4 flex items-center gap-1 text-slate-400 hover:text-blue-600 dark:text-slate-600 dark:hover:text-blue-400 transition-colors">
            <Settings className="h-3 w-3" />
            <span>Admin</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}

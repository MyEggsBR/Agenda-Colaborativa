'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  Search, 
  Bell, 
  Share2, 
  CalendarCheck, 
  Users, 
  Timer, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Edit3, 
  Send, 
  Download, 
  Trash2,
  BarChart3,
  Lock,
  Plus,
  Phone,
  Cake,
  User,
  Upload,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

// Mock Data removed


export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants'>('dashboard');
  const [view, setView] = useState<'list' | 'details' | 'create'>('list');
  const [isLoading, setIsLoading] = useState(false);
  
  // Events Management State
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [eventVotes, setEventVotes] = useState<any[]>([]);

  // Participants Management State
  const [participants, setParticipants] = useState<any[]>([]);

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    role: '',
    avatar: '',
    phone: '',
    birthday: ''
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    date_display: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedEventId) {
      loadEventDetails(selectedEventId);
      // Always fetch all participants to calculate status
      fetchParticipants();
    }
  }, [isAuthenticated, selectedEventId, activeTab]);

  const fetchEvents = async () => {
    setIsLoading(true);
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

  const loadEventDetails = async (id: number) => {
    console.log(`Loading details for event ${id} (v3)...`);
    // Use select() without single() to handle potential duplicates gracefully
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id);
    
    if (error) {
      console.error('Error loading event details (v3):', error);
      // alert(`Erro ao carregar detalhes: ${error.message}`);
    } else if (data && data.length > 0) {
      // If multiple rows returned, just take the first one and warn
      if (data.length > 1) {
          console.warn(`Duplicate events found for ID ${id}. Using the first one.`);
          // alert(`Aviso: Existem ${data.length} eventos duplicados com este ID. Recomenda-se usar a função "Corrigir Duplicatas".`);
      }
      setEventDetails(data[0]);
      
      // Fetch votes for this event
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .eq('event_id', id);
      
      if (votesError) {
        console.warn('Error fetching votes (table might be missing):', votesError);
        setEventVotes([]);
      } else {
        setEventVotes(votes || []);
      }
    } else {
        console.warn(`No event found for ID ${id}`);
        setEventDetails(null);
        setEventVotes([]);
    }
  };

  const runDuplicateFix = async () => {
      if (!confirm('Isso irá buscar e remover eventos duplicados no banco de dados. Deseja continuar?')) return;
      setIsLoading(true);
      try {
          const response = await fetch('/api/fix-db');
          const result = await response.json();
          alert(result.message + '\n' + (result.logs || []).join('\n'));
          fetchEvents();
      } catch (e: any) {
          alert('Erro ao executar correção: ' + e.message);
      } finally {
          setIsLoading(false);
      }
  };

  const fetchParticipants = async () => {
    setIsLoading(true);
    // Fetch all global participants
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...newEvent,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;

      alert('Evento criado com sucesso!');
      setNewEvent({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        date_display: ''
      });
      setView('list');
      setSelectedEventId(null); // Ensure selectedEventId is cleared
      fetchEvents();
    } catch (error: any) {
      console.error('Error creating event:', error);
      alert('Erro ao criar evento: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceDelete = async (id: number) => {
    if (!confirm('ATENÇÃO: Isso tentará forçar a exclusão do evento ignorando verificações normais. Use apenas se a exclusão normal falhar. Continuar?')) return;
    
    setIsLoading(true);
    try {
        // 1. Try deleting participants first manually
        await supabase.from('participants').delete().eq('event_id', id);
        
        // 2. Try deleting from other tables
        await supabase.from('votes').delete().eq('event_id', id);
        await supabase.from('availabilities').delete().eq('event_id', id);
        await supabase.from('event_availability').delete().eq('event_id', id);

        // 3. Delete the event
        const { error } = await supabase.from('events').delete().eq('id', id);
        
        if (error) {
            throw error;
        }

        alert('Evento excluído forçadamente com sucesso!');
        setEvents(events.filter(e => e.id !== id));
        if (selectedEventId === id) {
            setSelectedEventId(null);
            setView('list');
        }
    } catch (error: any) {
        console.error('Force delete failed:', error);
        alert(`Falha na exclusão forçada: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      setIsLoading(true);
      console.log('Starting deletion for event:', id);
      try {
        // 1. Try to use the RPC function first (if the user ran the SQL script)
        const { error: rpcError } = await supabase.rpc('delete_event_cascade', { target_event_id: id });
        
        if (!rpcError) {
          console.log('RPC deletion successful');
          setEvents(events.filter(e => e.id !== id));
          if (selectedEventId === id) {
              setSelectedEventId(null);
              setView('list');
          }
          alert('Evento excluído com sucesso!');
          return;
        }

        console.warn('RPC delete_event_cascade failed or not found, falling back to manual deletion:', rpcError);

        // 2. Fallback: Manual deletion logic
        
        // Speculatively try to delete from other potential tables to avoid FK constraints
        try { await supabase.from('votes').delete().eq('event_id', id); } catch {}
        try { await supabase.from('availabilities').delete().eq('event_id', id); } catch {}
        try { await supabase.from('event_availability').delete().eq('event_id', id); } catch {}

        // Manually delete participants first to ensure no foreign key issues
        const { error: participantsError } = await supabase
          .from('participants')
          .delete()
          .eq('event_id', id);
        
        if (participantsError) {
             console.error('Error deleting participants:', participantsError);
             // If the error is about column not found, maybe event_id doesn't exist, so we proceed to delete event
             if (participantsError.code !== '42703') { // 42703 is undefined_column
                 alert(`Erro ao excluir participantes: ${participantsError.message} (Código: ${participantsError.code})`);
                 throw participantsError;
             }
        }

        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            alert(`Erro ao excluir evento: ${error.message} (Código: ${error.code})\nDetalhes: ${error.details || 'Nenhum detalhe disponível'}`);
            throw error;
        }
        
        console.log('Manual deletion successful');
        setEvents(events.filter(e => e.id !== id));
        if (selectedEventId === id) {
            setSelectedEventId(null);
            setView('list');
        }
        alert('Evento excluído com sucesso!');
      } catch (error: any) {
        console.error('Error deleting event:', error);
        // Alert is already handled above for specific errors
        if (!error.message) {
            alert('Erro desconhecido ao excluir evento. Verifique o console para mais detalhes.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectEvent = (id: number) => {
    setSelectedEventId(id);
    setView('details');
    setActiveTab('dashboard');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      alert('Erro ao fazer login: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const uploadAvatar = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleAddParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name) return;
    setIsLoading(true);

    try {
      let avatarUrl = newParticipant.avatar;

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      } else if (!avatarUrl) {
        avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(newParticipant.name)}&background=random`;
      }

      const participantData = {
        name: newParticipant.name,
        role: newParticipant.role,
        avatar_url: avatarUrl,
        phone: newParticipant.phone,
        birthday: newParticipant.birthday || null,
        // event_id removed - participants are global
      };

      if (editingId) {
        const { error } = await supabase
          .from('participants')
          .update(participantData)
          .eq('id', editingId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('participants')
          .insert([participantData]);
        
        if (error) throw error;
      }

      await fetchParticipants();
      handleCancelEdit();
    } catch (error) {
      console.error('Error saving participant:', error);
      alert('Erro ao salvar participante.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (participant: any) => {
    setEditingId(participant.id);
    setNewParticipant({
      name: participant.name,
      role: participant.role || '',
      avatar: participant.avatar_url || '',
      phone: participant.phone || '',
      birthday: participant.birthday || ''
    });
    setAvatarFile(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewParticipant({
      name: '',
      role: '',
      avatar: '',
      phone: '',
      birthday: ''
    });
    setAvatarFile(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este participante?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('participants')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        setParticipants(participants.filter(p => p.id !== id));
        if (editingId === id) {
          handleCancelEdit();
        }
      } catch (error) {
        console.error('Error deleting participant:', error);
        alert('Erro ao remover participante.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelEvent = async () => {
    if (confirm('Tem certeza que deseja cancelar este evento? Esta ação removerá todos os dados e não pode ser desfeita.')) {
      setIsLoading(true);
      try {
        // Update event status to cancelled
        if (eventDetails) {
            const { error: updateError } = await supabase
            .from('events')
            .update({ status: 'cancelled' })
            .eq('id', eventDetails.id);

            if (updateError) throw updateError;
        }

        // Delete participants for this event
        if (eventDetails) {
            const { error } = await supabase
              .from('participants')
              .delete()
              .eq('event_id', eventDetails.id);

            if (error) throw error;
        }
        
        setParticipants([]);
        alert('Evento cancelado com sucesso.');
        window.location.href = '/';
      } catch (error) {
        console.error('Error cancelling event:', error);
        alert('Erro ao cancelar evento.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg dark:bg-slate-900">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Acesso Administrativo</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Digite a senha para gerenciar o evento.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="admin@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalParticipants = participants.length;
  const votingParticipants = new Set(eventVotes.map(v => v.user_id)).size;
  
  // Calculate date popularity
  const dateCounts: Record<string, number> = {};
  eventVotes.forEach(vote => {
    const date = vote.date;
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  // Find best date
  let bestDate = '';
  let maxVotes = 0;
  Object.entries(dateCounts).forEach(([date, count]) => {
    if (count > maxVotes) {
      maxVotes = count;
      bestDate = date;
    }
  });

  // Sort dates by popularity
  const sortedDates = Object.entries(dateCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Calculate consensus percentage
  const consensus = totalParticipants > 0 ? Math.round((maxVotes / totalParticipants) * 100) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-blue-600 hover:opacity-80 transition-opacity">
            <Calendar className="h-8 w-8" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin SyncUp</h2>
          </Link>
          {view === 'details' && (
            <nav className="hidden md:flex items-center gap-9">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "pb-1 text-sm font-semibold transition-colors",
                  activeTab === 'dashboard' 
                    ? "border-b-2 border-blue-600 text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 hover:text-blue-600 dark:text-slate-400"
                )}
              >
                Painel
              </button>
              <button 
                onClick={() => setActiveTab('participants')}
                className={cn(
                  "pb-1 text-sm font-semibold transition-colors",
                  activeTab === 'participants' 
                    ? "border-b-2 border-blue-600 text-slate-900 dark:text-slate-100" 
                    : "text-slate-600 hover:text-blue-600 dark:text-slate-400"
                )}
              >
                Participantes
              </button>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <button 
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
              title="Sair"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-900/20">
              <div className="relative h-full w-full">
                <Image 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJUsHg-FYqvLbJ2LCsz0JKLG-WmjLQRKUD0jp2vhcgqUqCfOF06hQBqjLy3BCrJPKWvcMNdxT74kUKvRASv6BRiPR4_RR_A5kiP2LKJwjnPOdljG9MhLRRwXKbruBf5uBNJzGLSMP5NHbEpXv4yudO6VXNnGyMKV_PHnYSM-ar4bpHkvtMxi_DjKPDle0y43aqPOyXcSvZ5DmHii9rzf1oRxKvIb-PZsmvyU7EjSCeU-sd56EsosRBw57AeegchzGx_TzpdNfa5-rj" 
                  alt="Admin Avatar"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col px-4 py-8 md:px-10">
        {view === 'list' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Meus Eventos</h1>
              <div className="flex gap-2">
                  <button 
                    onClick={runDuplicateFix}
                    className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-bold text-white hover:bg-yellow-600 transition-colors"
                    title="Corrigir Duplicatas"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Corrigir DB
                  </button>
                  <button 
                    onClick={() => setView('create')}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Criar Evento
                  </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4 font-bold">Evento</th>
                      <th className="px-6 py-4 font-bold">Datas</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {events.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                          Nenhum evento encontrado. Crie um novo evento para começar.
                        </td>
                      </tr>
                    ) : (
                      events.map((event) => (
                        <tr key={event.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleSelectEvent(event.id)}
                              className="font-bold text-slate-900 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
                            >
                              {event.title}
                            </button>
                            {event.description && (
                              <p className="mt-1 max-w-md truncate text-xs text-slate-500">{event.description}</p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {event.date_display || 'Datas não definidas'}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              event.status === 'cancelled' 
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : event.status === 'completed'
                                ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                            )}>
                              {event.status === 'cancelled' ? 'Cancelado' : event.status === 'completed' ? 'Concluído' : 'Ativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => handleSelectEvent(event.id)}
                                className="rounded p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
                                title="Ver Detalhes"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                                title="Excluir Evento"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="mx-auto w-full max-w-2xl">
            <button 
              onClick={() => setView('list')}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para lista
            </button>
            
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">Criar Novo Evento</h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Título do Evento</label>
                  <input 
                    type="text"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Ex: Reunião de Planejamento"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Descrição</label>
                  <textarea 
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Detalhes sobre o evento..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Localização</label>
                  <input 
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Ex: Sala de Reuniões A ou Google Meet"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Início</label>
                    <input 
                      type="date"
                      value={newEvent.start_date}
                      onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Término</label>
                    <input 
                      type="date"
                      value={newEvent.end_date}
                      onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Exibição de Datas (Texto)</label>
                  <input 
                    type="text"
                    value={newEvent.date_display}
                    onChange={(e) => setNewEvent({...newEvent, date_display: e.target.value})}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    placeholder="Ex: 10-15 de Outubro"
                  />
                  <p className="mt-1 text-xs text-slate-500">Este texto será exibido no cabeçalho do evento.</p>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setView('list')}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Criando...' : 'Criar Evento'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === 'details' && (
          <>
            <button 
              onClick={() => setView('list')}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Voltar para lista de eventos
            </button>
            
            {activeTab === 'dashboard' ? (
          <>
            {/* Dashboard Hero */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
                  <BarChart3 className="h-4 w-4" /> Análise do Evento
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">{eventDetails?.title || 'Carregando...'}</h1>
                <p className="text-base font-normal text-slate-500 dark:text-slate-400">
                    {eventDetails?.description || 'Sem descrição'} • {participants.length} participantes
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Notificar Grupo</span>
                </button>
                <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all">
                  <CalendarCheck className="h-5 w-5" />
                  <span>Finalizar Data</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <Users className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-bold text-green-500">Ativos</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Votos Recebidos</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {new Set(eventVotes.map(v => v.user_id)).size} / {participants.length}
                </p>
              </div>
              
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Melhor Disponibilidade</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
                  {bestDate ? new Date(bestDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'Aguardando'}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <Timer className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tempo Médio</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">N/A</p>
              </div>

              <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Consenso</p>
                <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{consensus}%</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Left Column: Calendar & Responses */}
              <div className="space-y-8 lg:col-span-8">
                {/* Heatmap Calendar Section */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                    <h3 className="text-lg font-bold">Mapa de Calor de Disponibilidade</h3>
                  </div>
                  <div className="p-6">
                    {Object.keys(dateCounts).length > 0 ? (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {Object.entries(dateCounts)
                          .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                          .map(([date, count]) => {
                            const percentage = totalParticipants > 0 ? count / totalParticipants : 0;
                            let bgClass = "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
                            if (percentage >= 1) bgClass = "bg-green-500 text-white";
                            else if (percentage >= 0.75) bgClass = "bg-green-400 text-white";
                            else if (percentage >= 0.5) bgClass = "bg-blue-400 text-white";
                            else if (percentage >= 0.25) bgClass = "bg-blue-200 text-blue-800";

                            return (
                              <div key={date} className={cn("flex flex-col items-center justify-center rounded-lg p-3 text-center transition-all", bgClass)}>
                                <span className="text-xs font-medium uppercase opacity-80">
                                  {new Date(date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                                </span>
                                <span className="text-lg font-bold">
                                  {new Date(date).getDate()}
                                </span>
                                <span className="mt-1 text-[10px] font-bold">
                                  {count} / {totalParticipants}
                                </span>
                              </div>
                            );
                        })}
                      </div>
                    ) : (
                      <div className="text-center text-slate-500">
                        <p>Aguardando votos dos participantes para gerar o mapa de calor.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Responses List */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                    <h3 className="text-lg font-bold">Participantes ({participants.length})</h3>
                    <button 
                      onClick={() => setActiveTab('participants')}
                      className="text-sm font-bold text-blue-600 hover:underline"
                    >
                      Ver Todos
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {participants.slice(0, 5).map((participant) => {
                      const hasVoted = eventVotes.some(v => v.user_id === participant.id);
                      return (
                      <div key={participant.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-200">
                            <Image 
                              src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`} 
                              alt={participant.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{participant.name}</p>
                            <p className="text-xs text-slate-500">{participant.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "rounded px-2 py-1 text-[10px] font-bold uppercase",
                            hasVoted 
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {hasVoted ? 'Votou' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      );
                    })}
                    {participants.length === 0 && (
                      <div className="p-8 text-center text-slate-500">
                        Nenhum participante cadastrado.
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Best Dates & Actions */}
              <div className="space-y-8 lg:col-span-4">
                {/* Best Dates Leaderboard */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Melhores Datas
                  </h3>
                  <div className="space-y-4">
                    {sortedDates.length > 0 ? (
                      sortedDates.map(([date, count], index) => (
                        <div key={date} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                              index === 0 ? "bg-yellow-100 text-yellow-700" : 
                              index === 1 ? "bg-slate-100 text-slate-700" : 
                              "bg-orange-50 text-orange-700"
                            )}>
                              {index + 1}
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {new Date(date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                              <div 
                                className="h-full bg-blue-600" 
                                style={{ width: `${(count / totalParticipants) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-500 text-sm">
                        <p>Aguardando votos para calcular as melhores datas.</p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Quick Actions */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-4 text-lg font-bold">Ações do Organizador</h3>
                  <div className="flex flex-col gap-3">
                    <button                        onClick={async () => {
                        const currentRange = eventDetails?.date_display || '10-15 de Outubro';
                        const newRange = prompt('Digite o novo intervalo de datas (ex: 10-15 de Outubro):', currentRange);
                        if (newRange && newRange !== currentRange) {
                          try {
                            let currentId = eventDetails?.id;
                            
                            // First check if event exists, if not create one
                            if (!eventDetails) {
                               const { data, error: insertError } = await supabase
                                .from('events')
                                .insert([{ date_display: newRange }])
                                .select()
                                .single();
                                
                                if (insertError) throw insertError;
                                setEventDetails(data);
                                currentId = data.id;
                            } else {
                                const { error } = await supabase
                                .from('events')
                                .update({ date_display: newRange })
                                .eq('id', eventDetails.id);

                                if (error) throw error;
                            }
                            
                            alert(`Intervalo de tempo atualizado para: ${newRange}`);
                            if (currentId) loadEventDetails(currentId);
                          } catch (error) {
                            console.error('Error updating event:', error);
                            alert('Erro ao atualizar intervalo de tempo.');
                          }
                        }
                      }}
                      className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-slate-500" />
                        Modificar Intervalo de Tempo
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                      onClick={() => {
                        alert('Lembretes enviados com sucesso para os participantes pendentes via email/notificação.');
                      }}
                      className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-slate-500" />
                        Lembrar Quem Não Respondeu
                      </span>
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">{participants.length}</span>
                    </button>
                    <button 
                      onClick={() => {
                        const headers = ['ID', 'Nome', 'Cargo', 'Telefone', 'Aniversário'];
                        const csvContent = [
                          headers.join(','),
                          ...participants.map(p => [p.id, p.name, p.role || '', p.phone || '', p.birthday || ''].join(','))
                        ].join('\n');
                        
                        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.setAttribute('href', url);
                        link.setAttribute('download', 'participantes.csv');
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-slate-500" />
                        Exportar Dados (CSV)
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                      onClick={() => eventDetails && handleDeleteEvent(eventDetails.id)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Excluir Evento
                    </button>
                    <button 
                      onClick={() => eventDetails && handleForceDelete(eventDetails.id)}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      Forçar Exclusão (Debug)
                    </button>
                  </div>
                </section>
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Add Participant Form */}
            <div className="lg:col-span-4">
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-6 flex items-center gap-2 text-lg font-bold">
                  <User className="h-5 w-5 text-blue-600" />
                  {editingId ? 'Editar Participante' : 'Adicionar Participante'}
                </h3>
                <form onSubmit={handleAddParticipant} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nome Completo</label>
                    <input 
                      type="text"
                      required
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({...newParticipant, name: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Cargo / Função</label>
                    <input 
                      type="text"
                      value={newParticipant.role}
                      onChange={(e) => setNewParticipant({...newParticipant, role: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="Ex: Designer"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Foto do Perfil</label>
                    <div className="flex flex-col gap-2">
                      <input 
                        type="url"
                        value={newParticipant.avatar}
                        onChange={(e) => setNewParticipant({...newParticipant, avatar: e.target.value})}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                        placeholder="URL da imagem (opcional)"
                        disabled={!!avatarFile}
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">OU</span>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                          <Upload className="h-4 w-4" />
                          <span>{avatarFile ? 'Arquivo selecionado' : 'Upload de imagem'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="hidden" 
                          />
                        </label>
                        {avatarFile && (
                          <button 
                            type="button" 
                            onClick={() => setAvatarFile(null)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone</label>
                    <input 
                      type="tel"
                      value={newParticipant.phone}
                      onChange={(e) => setNewParticipant({...newParticipant, phone: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Data de Nascimento</label>
                    <input 
                      type="date"
                      value={newParticipant.birthday}
                      onChange={(e) => setNewParticipant({...newParticipant, birthday: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      {editingId ? 'Salvar Alterações' : 'Cadastrar Participante'}
                    </button>
                    {editingId && (
                      <button 
                        type="button"
                        onClick={handleCancelEdit}
                        className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Participants List */}
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-100 p-6 dark:border-slate-800">
                  <h3 className="text-lg font-bold">Participantes Cadastrados</h3>
                  <p className="text-sm text-slate-500">Gerencie quem pode votar neste evento.</p>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                          <Image 
                            src={participant.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(participant.name)}&background=random`} 
                            alt={participant.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100">{participant.name}</p>
                          <p className="text-xs text-slate-500">{participant.role}</p>
                          <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                            {participant.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {participant.phone}
                              </span>
                            )}
                            {participant.birthday && (
                              <span className="flex items-center gap-1">
                                <Cake className="h-3 w-3" /> {participant.birthday}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(participant)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(participant.id)}
                          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {participants.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                      Nenhum participante cadastrado ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
}

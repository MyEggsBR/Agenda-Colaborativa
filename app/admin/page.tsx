'use client';

import { useState } from 'react';
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
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data for Admin Dashboard Metrics
const RECENT_RESPONSES = [
  { 
    id: 1, 
    name: 'Alex Johnson', 
    role: 'Líder de Design', 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLmdpgHTOrHKXrtbwHDuQh7pCo5VXlF87aJH1Ehh8fFRxdhucvR3KJgHrsWJIUWLYFU5OiKqN8gTkQhTOdNYFLc-vTre86V1D8maFafFskB2Y_NHrsffrYV3KZfjrSWyXcOiURmyjRYfCHEgacbpEJaYVZdzuX3fsn72cRMpmyhDkXA-sgRaUPJXKBXMKJMSRA3U_dREUfh8TtRUte825d1Yf1KSqBza2zkQbNeIF0NFtm4_I55BgzVsnSrCXpTYXdq0XH2qIN_Ag9',
    dates: 'Oct 10, 12, 14',
    status: 'Enviado'
  },
  { 
    id: 2, 
    name: 'Sarah Chen', 
    role: 'Gerente de Produto', 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD72BXxtwjojBgM4QWwHC_THpMZzC3UV7d7W1bYojpO30dwJQYWYcGuPqakjBbzwU_0-Vurz_fP6vY6gAZMxX8XdZEYNZOgcpfc8vljrs9aErGokbzxwfEAq0h8VniYhCyf_yXd2OlR_IgQX2QrADeXceb-F335anLYjNe7AY_O_N8novoeILJM2Z1QKjLaAx9ESPZzkrFxWnSs0eFf4o3dXWy7X4Xe_3L0pWzgKLO7Dx_4eCgNi_b7JbBuix0j-QAWE47bQGla0zwt',
    dates: 'Oct 12, 13',
    status: 'Enviado'
  },
  { 
    id: 3, 
    name: 'Marcus Wright', 
    role: 'CTO', 
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAst3G5YTjMrKzMeI3roXZ-5-kS0ZIErOuUl3UR-4qqg3-OkrGCM_jciirq_vzqclq3ESBUdht2vKPFLWh-6rYFYxdmY9--PMvd3FQtRo8DzPHhso9HMMsN1bnmYrDXx4IdhGETA8DPUFI-bDJIT35A0boqso3N-Wh3Aq8Qs66TJeB1k-WE8KAk1gkLF9mSJx7u0FStmoGrg-WRhpmxpmiA31pwf6cq4ZHBtWL0s1QfwSdUh2c9i-1vgUooglLJQVtupLDsxh59R_jj',
    dates: 'Precisa de mais informações',
    status: 'Pendente'
  },
];

const BEST_DATES = [
  { date: '12 de Outubro', score: '10/12', percentage: 83, label: 'Maior Consenso' },
  { date: '10 de Outubro', score: '8/12', percentage: 66, label: null },
  { date: '09 de Outubro', score: '7/12', percentage: 58, label: null },
];

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'participants'>('dashboard');
  
  // Participants Management State
  const [participants, setParticipants] = useState([
    { 
      id: 1, 
      name: 'Alex Johnson', 
      role: 'Líder de Design', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLmdpgHTOrHKXrtbwHDuQh7pCo5VXlF87aJH1Ehh8fFRxdhucvR3KJgHrsWJIUWLYFU5OiKqN8gTkQhTOdNYFLc-vTre86V1D8maFafFskB2Y_NHrsffrYV3KZfjrSWyXcOiURmyjRYfCHEgacbpEJaYVZdzuX3fsn72cRMpmyhDkXA-sgRaUPJXKBXMKJMSRA3U_dREUfh8TtRUte825d1Yf1KSqBza2zkQbNeIF0NFtm4_I55BgzVsnSrCXpTYXdq0XH2qIN_Ag9',
      phone: '(11) 99876-5432',
      birthday: '1990-05-15'
    },
    { 
      id: 2, 
      name: 'Sarah Chen', 
      role: 'Gerente de Produto', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD72BXxtwjojBgM4QWwHC_THpMZzC3UV7d7W1bYojpO30dwJQYWYcGuPqakjBbzwU_0-Vurz_fP6vY6gAZMxX8XdZEYNZOgcpfc8vljrs9aErGokbzxwfEAq0h8VniYhCyf_yXd2OlR_IgQX2QrADeXceb-F335anLYjNe7AY_O_N8novoeILJM2Z1QKjLaAx9ESPZzkrFxWnSs0eFf4o3dXWy7X4Xe_3L0pWzgKLO7Dx_4eCgNi_b7JbBuix0j-QAWE47bQGla0zwt',
      phone: '(11) 98765-4321',
      birthday: '1992-08-22'
    },
  ]);

  const [newParticipant, setNewParticipant] = useState({
    name: '',
    role: '',
    avatar: '',
    phone: '',
    birthday: ''
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setIsAuthenticated(true);
    } else {
      alert('Senha incorreta. Tente "admin".');
    }
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParticipant.name) return;

    if (editingId) {
      setParticipants(participants.map(p => 
        p.id === editingId 
          ? { ...p, ...newParticipant, avatar: newParticipant.avatar || p.avatar }
          : p
      ));
      setEditingId(null);
    } else {
      setParticipants([
        ...participants,
        {
          id: Date.now(),
          ...newParticipant,
          avatar: newParticipant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newParticipant.name)}&background=random`
        }
      ]);
    }

    setNewParticipant({
      name: '',
      role: '',
      avatar: '',
      phone: '',
      birthday: ''
    });
  };

  const handleEdit = (participant: any) => {
    setEditingId(participant.id);
    setNewParticipant({
      name: participant.name,
      role: participant.role,
      avatar: participant.avatar,
      phone: participant.phone || '',
      birthday: participant.birthday || ''
    });
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
  };

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja remover este participante?')) {
      setParticipants(participants.filter(p => p.id !== id));
      if (editingId === id) {
        handleCancelEdit();
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
              className="flex w-full justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900 md:px-10">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 text-blue-600 hover:opacity-80 transition-opacity">
            <Calendar className="h-8 w-8" />
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin SyncUp</h2>
          </Link>
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
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="flex gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <Bell className="h-5 w-5" />
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
        {activeTab === 'dashboard' ? (
          <>
            {/* Dashboard Hero */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-600">
                  <BarChart3 className="h-4 w-4" /> Análise do Evento
                </div>
                <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 dark:text-slate-100">Estratégia de Revisão Trimestral</h1>
                <p className="text-base font-normal text-slate-500 dark:text-slate-400">Organizado pelo Time de Produto • 12 participantes • 10/12 responderam (83%)</p>
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
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-bold text-green-500">+2 novos</span>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Respostas</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">10 / 12</p>
              </div>
              
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Melhor Disponibilidade</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">12 de Out</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <Timer className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Tempo Médio de Conclusão</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">1.4 min</p>
              </div>

              <div className="rounded-xl border border-slate-200 border-l-4 border-l-blue-600 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-4 flex items-start justify-between">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pontuação de Consenso</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Alta (88%)</p>
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
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-blue-100 dark:bg-blue-900/20"></div>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Baixo</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-blue-400"></div>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Méd</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-3 w-3 rounded-sm bg-blue-600"></div>
                        <span className="text-[10px] font-bold uppercase text-slate-500">Alto</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6 flex items-center justify-between">
                      <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <span className="text-base font-bold">Outubro 2023</span>
                      <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="py-2 text-center text-xs font-bold uppercase text-slate-400">{day}</div>
                      ))}
                      
                      {/* Mock Calendar Grid for Heatmap */}
                      {/* Previous month days */}
                      {[24, 25, 26, 27, 28, 29, 30].map(d => (
                        <div key={`prev-${d}`} className="flex h-14 items-start justify-end rounded-lg border border-slate-50 bg-slate-50/50 p-2 text-slate-300 dark:border-slate-800 dark:bg-slate-800/30 md:h-20">{d}</div>
                      ))}
                      
                      {/* Current month days */}
                      {[1, 2, 3, 4].map(d => (
                        <div key={d} className="flex h-14 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:h-20">{d}</div>
                      ))}

                      {/* Heatmap days */}
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border border-blue-200 bg-blue-50 p-2 font-bold text-blue-600 dark:border-blue-900/30 dark:bg-blue-900/20 md:h-20">
                        5 <span className="mt-1 text-[9px] text-blue-600/70">2/12</span>
                      </div>
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border border-blue-300 bg-blue-100 p-2 font-bold text-blue-700 dark:border-blue-800/50 dark:bg-blue-800/30 md:h-20">
                        6 <span className="mt-1 text-[9px] text-blue-700/70">4/12</span>
                      </div>
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border border-blue-400 bg-blue-200 p-2 font-bold text-blue-800 dark:border-blue-700/50 dark:bg-blue-700/30 md:h-20">
                        7 <span className="mt-1 text-[9px] text-blue-800/80">6/12</span>
                      </div>
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border border-blue-400 bg-blue-200 p-2 font-bold text-blue-800 dark:border-blue-700/50 dark:bg-blue-700/30 md:h-20">
                        8 <span className="mt-1 text-[9px] text-blue-800/80">6/12</span>
                      </div>
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border border-blue-500 bg-blue-500 p-2 font-bold text-white md:h-20">
                        9 <span className="mt-1 text-[9px] text-white/80">7/12</span>
                      </div>
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border border-blue-600 bg-blue-600 p-2 font-bold text-white md:h-20">
                        10 <span className="mt-1 text-[9px] text-white/90">8/12</span>
                      </div>
                      <div className="flex h-14 flex-col items-center justify-center rounded-lg border-2 border-blue-600 bg-blue-600 p-2 font-bold text-white ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-slate-900 md:h-20">
                        12 <span className="mt-1 text-[9px] text-white">10/12</span>
                      </div>

                      {[13, 14, 15].map(d => (
                        <div key={d} className="flex h-14 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-2 font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:h-20">{d}</div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Responses List */}
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-slate-800">
                    <h3 className="text-lg font-bold">Respostas Recentes</h3>
                    <button className="text-sm font-bold text-blue-600 hover:underline">Ver Tudo</button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {RECENT_RESPONSES.map((response) => (
                      <div key={response.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-slate-200">
                            <Image 
                              src={response.avatar} 
                              alt={response.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{response.name}</p>
                            <p className="text-xs text-slate-500">{response.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="hidden text-xs font-medium text-slate-500 sm:inline-block">
                            {response.dates === 'Precisa de mais informações' ? 'Precisa de mais informações' : `Disponível: ${response.dates}`}
                          </span>
                          <span className={cn(
                            "rounded px-2 py-1 text-[10px] font-bold uppercase",
                            response.status === 'Enviado' 
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {response.status}
                          </span>
                        </div>
                      </div>
                    ))}
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
                    {BEST_DATES.map((date, idx) => (
                      <div key={idx} className="group relative">
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{date.date}</span>
                          <span className={cn("text-xs font-bold", idx === 0 ? "text-blue-600" : "text-slate-500")}>{date.score}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div 
                            className={cn("h-full rounded-full", idx === 0 ? "bg-blue-600" : "bg-blue-600/60")} 
                            style={{ width: `${date.percentage}%` }}
                          ></div>
                        </div>
                        {date.label && (
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-slate-400">{date.label}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/20 dark:bg-blue-900/10">
                      <div className="flex items-start gap-3">
                        <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                          <strong>Recomendação:</strong> Quinta-feira, 12 de outubro tem a maior participação. Considere o horário da manhã para acomodar 2 convidados internacionais.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Quick Actions */}
                <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-4 text-lg font-bold">Ações do Organizador</h3>
                  <div className="flex flex-col gap-3">
                    <button className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="flex items-center gap-2">
                        <Edit3 className="h-4 w-4 text-slate-500" />
                        Modificar Intervalo de Tempo
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4 text-slate-500" />
                        Lembrar Quem Não Respondeu
                      </span>
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] text-white">2</span>
                    </button>
                    <button className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-4 py-3 text-sm font-bold text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-slate-500" />
                        Exportar Dados (CSV)
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </button>
                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors">
                      <Trash2 className="h-4 w-4" />
                      Cancelar Evento
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
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">URL da Foto (Opcional)</label>
                    <input 
                      type="url"
                      value={newParticipant.avatar}
                      onChange={(e) => setNewParticipant({...newParticipant, avatar: e.target.value})}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
                      placeholder="https://..."
                    />
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
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
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
                            src={participant.avatar} 
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
      </main>
    </div>
  );
}

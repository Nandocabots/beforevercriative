import React, { useState, useEffect } from 'react';
import { DatabaseProvider, useDatabase } from './databaseService';
import DashboardTab from './components/DashboardTab';
import ClientsTab from './components/ClientsTab';
import ScheduleTab from './components/ScheduleTab';
import ProductsTab from './components/ProductsTab';
import UsersTab from './components/UsersTab';
import bfLogo from './assets/images/bf_logo_1783625561882.jpg';
import { 
  LayoutDashboard, 
  Users as UsersIcon, 
  Calendar, 
  Moon, 
  Sun, 
  Sparkles,
  UserCheck,
  Package,
  Shield,
  LogOut,
  Lock,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'dashboard' | 'clients' | 'schedule' | 'products' | 'users';

function AppContent() {
  const { currentUser, login, logout } = useDatabase();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('spa_dark_mode');
    return saved === 'true';
  });

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Toggle dark class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('spa_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Ensure non-master users do not stay on the users tab
  useEffect(() => {
    if (currentUser && currentUser.role !== 'master' && activeTab === 'users') {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = login(loginUsername, loginPassword);
    if (!success) {
      setLoginError('Usuário ou senha incorretos.');
    }
  };

  // If NOT logged in, show the beautiful premium login page
  if (!currentUser) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-zinc-950 px-4 transition-all duration-300`}>
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-[#C2B280]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#0B1B3D]/10 rounded-full blur-3xl" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-xl rounded-3xl max-w-md w-full p-8 relative z-10"
        >
          {/* Logo */}
          <div className="flex flex-col items-center justify-center text-center gap-2 mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md shrink-0 border border-slate-100 dark:border-zinc-800">
              <img 
                src={bfLogo} 
                alt="BE FOREVER CRIATIVE" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="leading-tight mt-2">
              <h1 className="font-display font-bold text-xl tracking-wider text-[#0B1B3D] dark:text-blue-300">
                BE FOREVER CRIATIVE
              </h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest font-mono">
                Profissional: João Victor
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Nome de Usuário
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Seu usuário (Ex: Fernanda.botelho)"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha numérica"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 focus:border-[#0B1B3D] text-gray-900 dark:text-zinc-100 font-mono"
                />
              </div>
            </div>

            {loginError && (
              <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold bg-rose-50 dark:bg-rose-950/20 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/30 text-center">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-[#0B1B3D] hover:bg-[#152952] dark:bg-blue-900 dark:hover:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              Entrar no Sistema
            </button>
          </form>

          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-zinc-800/60 text-center">
            <span className="text-[10px] text-gray-400 font-mono">
              Controle de Acesso Biométrico e Executivo
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filter tabs: common user cannot see "users" tab
  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients' as const, label: 'Pessoas', icon: UsersIcon },
    { id: 'schedule' as const, label: 'Agenda', icon: Calendar },
    { id: 'products' as const, label: 'Produtos', icon: Package },
    ...(currentUser.role === 'master' ? [{ id: 'users' as const, label: 'Usuários', icon: Shield }] : [])
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-300 font-sans flex flex-col antialiased">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-100 dark:border-zinc-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-100 dark:border-zinc-800">
                <img 
                  src={bfLogo} 
                  alt="BE FOREVER CRIATIVE" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="leading-tight">
                <h1 className="font-display font-bold text-base tracking-tight text-[#0B1B3D] dark:text-blue-300">
                  Be Forever Criative
                </h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest font-mono">
                  Profissional: João Victor
                </p>
              </div>
            </div>

            {/* Desktop Nav Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/60 dark:bg-zinc-800/40 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="relative px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-zinc-100"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicator"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="absolute inset-0 bg-white dark:bg-zinc-700 rounded-lg shadow-sm"
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 relative z-10 ${isActive ? 'text-[#0B1B3D] dark:text-blue-300' : 'text-gray-400'}`} />
                    <span className={`relative z-10 ${isActive ? 'text-gray-900 dark:text-white font-bold' : ''}`}>
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Theme toggle & Profile & Logout */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-gray-500 dark:text-gray-400 rounded-xl transition-all active:scale-95 border border-slate-100 dark:border-zinc-800/80"
                title={isDarkMode ? 'Mudar para o Modo Claro' : 'Mudar para o Tema Noturno'}
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </button>

              {/* Profile section */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-zinc-800/60 rounded-xl border border-slate-100 dark:border-zinc-800/80 shrink-0">
                <UserCheck className="w-4 h-4 text-[#C2B280]" />
                <div className="text-[10px] leading-none">
                  <span className="block font-medium text-gray-400 font-mono">
                    {currentUser.role === 'master' ? 'Master' : 'Comum'}
                  </span>
                  <span className="block font-semibold text-gray-700 dark:text-zinc-300 mt-0.5 truncate max-w-[100px]">
                    {currentUser.username}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl transition-all active:scale-95 border border-rose-100/55 dark:border-rose-900/30"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <div className="lg:hidden bg-white dark:bg-zinc-900 border-b border-slate-100 dark:border-zinc-800 overflow-x-auto custom-scrollbar">
        <div className="flex px-4 py-2 gap-1 whitespace-nowrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive 
                    ? 'bg-[#0B1B3D] text-white shadow-sm' 
                    : 'bg-slate-50 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="outline-none"
          >
            {activeTab === 'dashboard' && <DashboardTab isDarkMode={isDarkMode} />}
            {activeTab === 'clients' && <ClientsTab />}
            {activeTab === 'schedule' && <ScheduleTab />}
            {activeTab === 'products' && <ProductsTab />}
            {activeTab === 'users' && <UsersTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium footer */}
      <footer className="mt-auto py-6 border-t border-slate-100 dark:border-zinc-900 bg-white/40 dark:bg-zinc-950 text-center text-[11px] text-gray-400 dark:text-gray-500 font-mono tracking-wide">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>© 2026 Be Forever Criative. Todos os direitos reservados.</span>
          <span className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Ambiente de Controle Executivo • Alta Performance</span>
          </span>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <AppContent />
    </DatabaseProvider>
  );
}

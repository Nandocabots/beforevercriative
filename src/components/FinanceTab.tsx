import React, { useState, useMemo } from 'react';
import { useDatabase } from '../databaseService';
import { Transaction, TransactionType, TransactionStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Package, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  Clock, 
  Filter, 
  CalendarDays, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid,
  Cell,
  PieChart,
  Pie
} from 'recharts';

interface FinanceTabProps {
  isDarkMode?: boolean;
}

export default function FinanceTab({ isDarkMode = false }: FinanceTabProps) {
  const { 
    appointments, 
    transactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    clients
  } = useDatabase();

  // Date filter states
  const [filterType, setFilterType] = useState<'this-month' | 'last-month' | 'jun-26' | 'jul-26' | 'all' | 'custom'>('custom');
  
  // Custom range states (Defaults to a useful preset matching simulated date: 17/05/2026 - 28/06/2026)
  const [startDate, setStartDate] = useState<string>('2026-05-17');
  const [endDate, setEndDate] = useState<string>('2026-06-28');

  // Transaction form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [formDescription, setFormDescription] = useState('');
  const [formValue, setFormValue] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<TransactionType>('Receita');
  const [formStatus, setFormStatus] = useState<TransactionStatus>('Pago');
  const [formCategory, setFormCategory] = useState('Serviços');
  const [formClientId, setFormClientId] = useState('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Compute active date range based on filterType
  const activeRange = useMemo(() => {
    const today = new Date('2026-06-20'); // aligned with existing app baseline date
    
    let start = '';
    let end = '';

    if (filterType === 'this-month') {
      // June 2026
      start = '2026-06-01';
      end = '2026-06-30';
    } else if (filterType === 'last-month') {
      // May 2026
      start = '2026-05-01';
      end = '2026-05-31';
    } else if (filterType === 'jun-26') {
      start = '2026-06-01';
      end = '2026-06-30';
    } else if (filterType === 'jul-26') {
      start = '2026-07-01';
      end = '2026-07-31';
    } else if (filterType === 'all') {
      start = '1970-01-01';
      end = '2099-12-31';
    } else {
      start = startDate || '2026-01-01';
      end = endDate || '2026-12-31';
    }

    return { start, end };
  }, [filterType, startDate, endDate]);

  // Calculations for filtered data
  const stats = useMemo(() => {
    const { start, end } = activeRange;

    // 1. FILTER APPOINTMENTS IN PERIOD
    const periodApps = appointments.filter(app => app.date >= start && app.date <= end);

    // QUANTIDADE DE PRODUTO MENSAL / NO PERÍODO (Count of main appointments/packages)
    const productQty = periodApps.length;
    
    // VALOR FINANCEIRO DE PRODUTO MENSAL (Total value of packages minus any added services custom costs)
    const productValue = periodApps.reduce((sum, app) => {
      const totalVal = app.packageValue ?? app.value ?? 0;
      const servicesCost = app.includedServices?.reduce((sCost, s) => sCost + (s.customCost || 0), 0) || 0;
      return sum + Math.max(0, totalVal - servicesCost);
    }, 0);

    // QUANTIDADE DE SERVIÇO MENSAL / NO PERÍODO (Count of included additional services)
    const serviceQty = periodApps.reduce((sum, app) => {
      return sum + (app.includedServices?.length ?? 0);
    }, 0);
    
    // VALOR FINANCEIRO DE SERVIÇO MENSAL (Sum of custom costs of included additional services)
    const serviceValue = periodApps.reduce((sum, app) => {
      const servicesCost = app.includedServices?.reduce((sCost, s) => sCost + (s.customCost || 0), 0) || 0;
      return sum + servicesCost;
    }, 0);

    // 2. PAGAMENTOS RECEBIDOS NO PERÍODO (Puxando diretamente dos pagamentos cadastrados na agenda)
    let receivedQty = 0;
    let receivedValue = 0;
    let pendingReceivedValue = 0;

    appointments.forEach(app => {
      // Received payments in this period (cash-flow: based on payment date)
      if (app.payments && Array.isArray(app.payments)) {
        app.payments.forEach(p => {
          if (p.date >= start && p.date <= end) {
            receivedQty++;
            receivedValue += p.value || 0;
          }
        });
      }

      // Unpaid pending values (accrual-flow: based on appointment date in period)
      if (app.date >= start && app.date <= end) {
        const totalVal = app.packageValue ?? app.value ?? 0;
        const totalPaid = app.payments?.reduce((sum, p) => sum + (p.value || 0), 0) || 0;
        const unpaid = Math.max(0, totalVal - totalPaid);
        pendingReceivedValue += unpaid;
      }
    });

    // 3. DESPESAS PAGAS NO PERÍODO (Puxando da coleção de transações)
    const paidDespesas = transactions.filter(t => t.type === 'Despesa' && t.status === 'Pago' && t.date >= start && t.date <= end);
    const paidQty = paidDespesas.length;
    const paidExpenseValue = paidDespesas.reduce((sum, t) => sum + (t.value || 0), 0);

    const pendingDespesas = transactions.filter(t => t.type === 'Despesa' && t.status === 'Pendente' && t.date >= start && t.date <= end);
    let pendingExpenseValue = pendingDespesas.reduce((sum, t) => sum + (t.value || 0), 0);

    // Sum agenda expenses in the period to pendingExpenseValue
    appointments.forEach(app => {
      if (app.date >= start && app.date <= end && app.expenses && Array.isArray(app.expenses)) {
        app.expenses.forEach(exp => {
          pendingExpenseValue += exp.value || 0;
        });
      }
    });

    // 4. CONSOLIDATED LEDGER LIST (VIRTUAL REVENUE PAYMENTS + REAL MANUAL EXPENSES + AGENDA EXPENSES)
    const ledgerItems: any[] = [];

    // A) Add Agenda payments in period
    appointments.forEach(app => {
      if (app.payments && Array.isArray(app.payments)) {
        app.payments.forEach(p => {
          if (p.date >= start && p.date <= end) {
            ledgerItems.push({
              id: `app-payment-${app.id}-${p.id}`,
              description: `Pagamento de Agenda - ${app.patientName} (${app.service || 'Serviço'})`,
              date: p.date,
              category: 'Agenda / Serviços',
              value: p.value,
              type: 'Receita',
              status: 'Pago',
              clientId: app.clientId,
              isFromAgenda: true,
              appointmentId: app.id
            });
          }
        });
      }
    });

    // B) Add Agenda-registered expenses in the period as ledgerItems
    appointments.forEach(app => {
      if (app.expenses && Array.isArray(app.expenses)) {
        app.expenses.forEach(exp => {
          if (app.date >= start && app.date <= end) {
            ledgerItems.push({
              id: `app-expense-${app.id}-${exp.id}`,
              description: `Despesa - ${exp.description} (${app.patientName})`,
              date: app.date,
              category: 'Despesas de Agenda',
              value: exp.value,
              type: 'Despesa',
              status: 'Pendente',
              isFromAgenda: true,
              appointmentId: app.id
            });
          }
        });
      }
    });

    // C) Add manual expenses (and manual revenues, if any exist that aren't virtualized)
    const periodTransactions = transactions.filter(t => t.date >= start && t.date <= end);
    periodTransactions.forEach(t => {
      ledgerItems.push({
        ...t,
        isFromAgenda: false
      });
    });

    // Sort by date descending
    ledgerItems.sort((a, b) => b.date.localeCompare(a.date));

    return {
      productQty,
      productValue,
      serviceQty,
      serviceValue,
      receivedQty,
      receivedValue,
      paidQty,
      paidExpenseValue,
      pendingReceivedValue,
      pendingExpenseValue,
      periodApps,
      periodTrans: ledgerItems
    };
  }, [appointments, transactions, activeRange]);

  // Format currency
  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Helper to format date nicely
  const formatBrazilianDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch (e) {}
    return dateStr;
  };

  // Save Transaction
  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || !formValue) return;

    const val = parseFloat(formValue) || 0;

    if (editingTransaction) {
      updateTransaction({
        ...editingTransaction,
        description: formDescription.trim(),
        value: val,
        date: formDate,
        type: formType,
        status: formStatus,
        category: formCategory,
        clientId: formClientId || undefined
      });
    } else {
      addTransaction({
        description: formDescription.trim(),
        value: val,
        date: formDate,
        type: formType,
        status: formStatus,
        category: formCategory,
        clientId: formClientId || undefined
      });
    }

    // Reset Form
    setEditingTransaction(null);
    setFormDescription('');
    setFormValue('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormType('Receita');
    setFormStatus('Pago');
    setFormCategory('Serviços');
    setFormClientId('');
    setIsModalOpen(false);
  };

  // Open Edit Modal
  const handleEditClick = (t: Transaction) => {
    setEditingTransaction(t);
    setFormDescription(t.description);
    setFormValue(t.value.toString());
    setFormDate(t.date);
    setFormType(t.type);
    setFormStatus(t.status);
    setFormCategory(t.category);
    setFormClientId(t.clientId || '');
    setIsModalOpen(true);
  };

  // Quick status toggle
  const handleToggleStatus = (t: Transaction) => {
    updateTransaction({
      ...t,
      status: t.status === 'Pago' ? 'Pendente' : 'Pago'
    });
  };

  // Categories for transactions dropdown
  const categories = [
    'Serviços',
    'Pacotes',
    'Marketing',
    'Infraestrutura',
    'Equipamentos',
    'Software / Ferramentas',
    'Acessórios',
    'Impostos',
    'Salários / Comissões',
    'Outros'
  ];

  // Chart data for comparing Receipts (Recebido) vs Expenses (Pago)
  const chartComparisonData = [
    {
      name: 'Recebido',
      valor: stats.receivedValue,
      color: '#10B981' // emerald
    },
    {
      name: 'Pago (Despesas)',
      valor: stats.paidExpenseValue,
      color: '#F43F5E' // rose
    }
  ];

  // Chart data for Products vs Additional Services
  const chartProductionData = [
    {
      name: 'Pacotes (Produtos)',
      valor: stats.productValue,
      count: stats.productQty,
    },
    {
      name: 'Serviços Adicionais',
      valor: stats.serviceValue,
      count: stats.serviceQty,
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-gray-900 dark:text-white">
            Painel Financeiro
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Controle de faturamento de produtos, serviços executados, receitas recebidas e despesas pagas.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {transactions.length > 0 && (
            <button
              onClick={() => setIsClearConfirmOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-semibold text-xs rounded-xl shadow-sm transition-all active:scale-[0.98]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Zerar Livro Caixa</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingTransaction(null);
              setFormDescription('');
              setFormValue('');
              setFormDate(new Date().toISOString().split('T')[0]);
              setFormType('Receita');
              setFormStatus('Pago');
              setFormCategory('Serviços');
              setFormClientId('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1B3D] hover:bg-[#152952] dark:bg-blue-900 dark:hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Lançar Transação</span>
          </button>
        </div>
      </div>

      {/* Filter and Date Range Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" />
              Período de Análise:
            </span>
            {[
              { id: 'custom', label: 'Mini Calendário (Período)' },
              { id: 'this-month', label: 'Este Mês' },
              { id: 'last-month', label: 'Mês Passado' },
              { id: 'jun-26', label: 'Junho/26' },
              { id: 'jul-26', label: 'Julho/26' },
              { id: 'all', label: 'Compilado todos os meses' }
            ].map(preset => (
              <button
                key={preset.id}
                onClick={() => setFilterType(preset.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterType === preset.id
                    ? 'bg-[#0B1B3D] text-white dark:bg-blue-900 dark:text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-gray-600 dark:text-zinc-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Mini Calendar inputs for custom period */}
          {filterType === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-slate-50/50 dark:bg-zinc-800/30 p-2 rounded-xl border border-slate-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-xs text-gray-700 dark:text-zinc-200 focus:outline-none font-mono"
                  title="Data Inicial"
                />
              </div>
              <span className="text-xs text-gray-400 font-semibold">até</span>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-xs text-gray-700 dark:text-zinc-200 focus:outline-none font-mono"
                  title="Data Final"
                />
              </div>
            </motion.div>
          )}

          {/* Preset Active range display */}
          {filterType !== 'custom' && (
            <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2 self-start lg:self-auto">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span>{formatBrazilianDate(activeRange.start)} — {formatBrazilianDate(activeRange.end)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Resumo Consolidado de Fluxo de Caixa */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-display font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wider">
          <DollarSign className="w-4 h-4 text-indigo-500" />
          <span>Fluxo de Caixa Consolidado do Período</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-zinc-800">
          {/* 1. Recebido (Realizado) */}
          <div className="flex flex-col justify-center pt-4 sm:pt-0">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Recebido (Entradas)
            </span>
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {formatBRL(stats.receivedValue)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
              {stats.receivedQty} recebimentos confirmados
            </span>
          </div>

          {/* 2. Pago (Saídas Realizadas) */}
          <div className="flex flex-col justify-center pt-4 sm:pt-0 lg:pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Pago (Saídas)
            </span>
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {formatBRL(stats.paidExpenseValue)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
              {stats.paidQty} despesas pagas
            </span>
          </div>

          {/* 3. Saldo Líquido Real */}
          <div className="flex flex-col justify-center pt-4 sm:pt-0 lg:pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Saldo Real (Líquido)
            </span>
            <span className={`text-2xl font-bold font-mono ${
              (stats.receivedValue - stats.paidExpenseValue) >= 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-rose-600 dark:text-rose-400'
            }`}>
              {formatBRL(stats.receivedValue - stats.paidExpenseValue)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
              Diferença entre recebidos e pagos
            </span>
          </div>

          {/* 4. A Receber (Projetado) */}
          <div className="flex flex-col justify-center pt-4 sm:pt-0 lg:pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              A Receber (Agenda)
            </span>
            <span className="text-2xl font-bold font-mono text-amber-500">
              {formatBRL(stats.pendingReceivedValue)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
              Valores em aberto na agenda
            </span>
          </div>

          {/* 5. A Pagar (Projetado) */}
          <div className="flex flex-col justify-center pt-4 sm:pt-0 lg:pl-6">
            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              A Pagar (Geral/Agenda)
            </span>
            <span className="text-2xl font-bold font-mono text-orange-500">
              {formatBRL(stats.pendingExpenseValue)}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-zinc-500 mt-1">
              Despesas pendentes estimadas
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Section */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-display font-semibold text-gray-900 dark:text-white mb-4">
          Comparativo de Caixa: Recebido (Entradas) vs Pago (Saídas)
        </h3>
        <div className="h-[250px] w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartComparisonData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f1f5f9'} />
              <XAxis 
                dataKey="name" 
                stroke={isDarkMode ? '#52525b' : '#a1a1aa'} 
                fontSize={11}
                fontFamily="JetBrains Mono"
              />
              <YAxis 
                stroke={isDarkMode ? '#52525b' : '#a1a1aa'} 
                fontSize={11}
                fontFamily="JetBrains Mono"
              />
              <Tooltip 
                formatter={(value) => [formatBRL(Number(value)), 'Valor']}
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                  borderColor: isDarkMode ? '#27272a' : '#f1f5f9',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                {chartComparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Ledger & Register List */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-zinc-900/50">
          <div>
            <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white">
              Livro Caixa / Transações do Período
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Listagem completa de entradas e saídas correspondentes ao intervalo selecionado.
            </p>
          </div>
        </div>

        {stats.periodTrans.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm italic">
            Nenhuma transação financeira cadastrada no período selecionado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest font-mono bg-slate-100/45 dark:bg-zinc-800/10">
                  <th className="py-3.5 px-6">Data</th>
                  <th className="py-3.5 px-6">Descrição</th>
                  <th className="py-3.5 px-6">Categoria</th>
                  <th className="py-3.5 px-6">Tipo</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Valor</th>
                  <th className="py-3.5 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {stats.periodTrans
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t) => (
                    <tr 
                      key={t.id} 
                      className="hover:bg-slate-50/35 dark:hover:bg-zinc-800/25 transition-colors text-xs"
                    >
                      <td className="py-4 px-6 font-mono font-medium text-gray-500 dark:text-zinc-400">
                        {formatBrazilianDate(t.date)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                        <div className="flex flex-col">
                          <span>{t.description}</span>
                          {t.clientId && (
                            <span className="text-[10px] text-[#C2B280] font-medium mt-0.5">
                              Cliente: {clients.find(c => c.id === t.clientId)?.name || 'Carregando...'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-500 dark:text-zinc-400">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 font-medium">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {t.type === 'Receita' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Receita
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Despesa
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {t.isFromAgenda ? (
                          t.type === 'Despesa' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 font-bold">
                              <Clock className="w-3.5 h-3.5 text-amber-500" />
                              <span>A Pagar</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Pago</span>
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(t)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all ${
                              t.status === 'Pago'
                                ? 'bg-emerald-100/70 hover:bg-emerald-200/60 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-amber-100/70 hover:bg-amber-200/60 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                            title="Clique para alternar status"
                          >
                            {t.status === 'Pago' ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Pago</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3.5 h-3.5" />
                                <span>Pendente</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>
                      <td className={`py-4 px-6 text-right font-mono font-bold text-sm ${
                        t.type === 'Receita' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {t.type === 'Receita' ? '+' : '-'}&nbsp;{formatBRL(t.value)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {t.isFromAgenda ? (
                            <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-500 px-2 py-1 rounded-md" title="Este pagamento é gerenciado na aba Agenda">
                              Agenda 📅
                            </span>
                          ) : (
                            <>
                              {/* Edit Button */}
                              <button
                                type="button"
                                onClick={() => handleEditClick(t)}
                                className="p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-zinc-800 dark:hover:bg-indigo-950/40 dark:text-zinc-400 dark:hover:text-indigo-400 rounded-lg transition-all"
                                title="Editar Transação"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Action with simple confirmation state */}
                              {deleteConfirmId === t.id ? (
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      deleteTransaction(t.id);
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-1 text-[10px] bg-rose-600 text-white rounded font-bold hover:bg-rose-700 transition-colors"
                                  >
                                    Sim
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-1 text-[10px] bg-slate-200 dark:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded font-bold transition-colors"
                                  >
                                    Não
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(t.id)}
                                  className="p-1.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 dark:bg-zinc-800 dark:hover:bg-rose-950/40 dark:text-zinc-400 dark:hover:text-rose-400 rounded-lg transition-all"
                                  title="Excluir Transação"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Modal (Add / Edit) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white mb-2">
                {editingTransaction ? 'Editar Transação' : 'Nova Transação Financeira'}
              </h3>
              <p className="text-xs text-gray-400 mb-6">
                Insira as informações de receitas ou despesas para manter o controle contábil.
              </p>

              <form onSubmit={handleSaveTransaction} className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormType('Receita')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      formType === 'Receita'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
                        : 'bg-white border-slate-100 text-gray-400 hover:text-gray-600 dark:bg-zinc-800/40 dark:border-zinc-800'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    Receita (Entrada)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormType('Despesa')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                      formType === 'Despesa'
                        ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-400'
                        : 'bg-white border-slate-100 text-gray-400 hover:text-gray-600 dark:bg-zinc-800/40 dark:border-zinc-800'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    Despesa (Saída)
                  </button>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                    Descrição da Transação
                  </label>
                  <input
                    type="text"
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Ex: Atendimento Noiva Camila, Compra de Ring Light..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-gray-900 dark:text-zinc-100"
                  />
                </div>

                {/* Value & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Valor Financeiro (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formValue}
                      onChange={(e) => setFormValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Data do Fluxo
                    </label>
                    <input
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Categoria
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-gray-900 dark:text-zinc-100"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Status de Liquidação
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as TransactionStatus)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-gray-900 dark:text-zinc-100 font-semibold"
                    >
                      <option value="Pago">Pago / Liquidado</option>
                      <option value="Pendente">Pendente / Em Aberto</option>
                    </select>
                  </div>
                </div>

                {/* Optional Client Link */}
                {formType === 'Receita' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                      Vincular Cliente (Opcional)
                    </label>
                    <select
                      value={formClientId}
                      onChange={(e) => setFormClientId(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/40 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1B3D]/30 text-gray-900 dark:text-zinc-100"
                    >
                      <option value="">Nenhum cliente vinculado</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-200 font-semibold text-xs rounded-xl hover:bg-slate-200/85 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#0B1B3D] hover:bg-[#152952] dark:bg-blue-900 dark:hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                  >
                    Salvar Lançamento
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
        {isClearConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl overflow-hidden relative"
            >
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white">
                  Zerar Livro Caixa?
                </h3>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Tem certeza de que deseja apagar permanentemente todas as transações manuais salvas no livro caixa? 
                <br /><br />
                <strong className="text-rose-600 dark:text-rose-400">Esta ação é irreversível.</strong> Os dados de atendimentos e pagamentos vinculados diretamente na agenda não serão afetados.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-200 font-semibold text-xs rounded-xl hover:bg-slate-200/85 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    transactions.forEach((t) => deleteTransaction(t.id));
                    setIsClearConfirmOpen(false);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all active:scale-[0.98]"
                >
                  Sim, apagar tudo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

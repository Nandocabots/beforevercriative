import { useMemo } from 'react';
import { useDatabase } from '../databaseService';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Activity, 
  Package, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  Briefcase
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  Legend,
  CartesianGrid
} from 'recharts';

interface DashboardTabProps {
  isDarkMode: boolean;
}

export default function DashboardTab({ isDarkMode }: DashboardTabProps) {
  const { clients, appointments, services, products } = useDatabase();

  // Metrics calculations
  const metrics = useMemo(() => {
    const nowStr = '2026-06-20'; // simulated today
    
    // Total Pacotes (appointments)
    const totalAppointments = appointments.length;

    // Total Services Included (sum of all includedServiceIds/includedServices)
    const totalServicesCount = appointments.reduce((sum, app) => {
      return sum + (app.includedServices?.length ?? app.includedServiceIds?.length ?? 0);
    }, 0);

    // Próximos Atendimentos Count (Count of all upcoming appointments)
    const upcomingAppointments = appointments.filter(a => a.date >= nowStr);
    const upcomingAppointmentsCount = upcomingAppointments.length;

    // Total Clients
    const totalClients = clients.length;

    return {
      totalAppointments,
      totalServicesCount,
      upcomingAppointmentsCount,
      totalClients
    };
  }, [clients, appointments]);

  // Chart: Pacotes & Serviços por Mês
  const monthlyData = useMemo(() => {
    const monthsMap: { [key: string]: { monthName: string, pacotes: number, servicos: number } } = {};
    
    const PORTUGUESE_MONTHS = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    appointments.forEach(app => {
      try {
        const parts = app.date.split('-');
        if (parts.length === 3) {
          const monthNum = parseInt(parts[1]) - 1; // 0-11
          const year = parts[0];
          const key = `${year}-${parts[1]}`;
          const monthLabel = `${PORTUGUESE_MONTHS[monthNum]}/${year.slice(-2)}`;

          if (!monthsMap[key]) {
            monthsMap[key] = {
              monthName: monthLabel,
              pacotes: 0,
              servicos: 0
            };
          }

          monthsMap[key].pacotes += 1;
          const servCount = app.includedServices?.length ?? app.includedServiceIds?.length ?? 0;
          monthsMap[key].servicos += servCount;
        }
      } catch (e) {}
    });

    const sortedKeys = Object.keys(monthsMap).sort();
    
    if (sortedKeys.length === 0) {
      // Dynamic clean fallback to match empty state realistically
      return [
        { monthName: 'Jun/26', pacotes: 0, servicos: 0 },
        { monthName: 'Jul/26', pacotes: 0, servicos: 0 },
      ];
    }

    return sortedKeys.map(k => monthsMap[k]);
  }, [appointments]);

  // Forecast of next upcoming clients
  const upcomingForecast = useMemo(() => {
    const nowStr = '2026-06-20'; // simulated today
    
    return appointments
      .filter(app => app.date >= nowStr)
      .sort((a, b) => {
        const dateA = `${a.date}T${a.time}`;
        const dateB = `${b.date}T${b.time}`;
        return dateA.localeCompare(dateB);
      })
      .slice(0, 5); // Display top 5 closest
  }, [appointments]);

  // Helper to format date beautifully
  const formatBrazilianDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return dateObj.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        });
      }
    } catch (e) {}
    return dateStr;
  };

  // Formatting helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold tracking-tight text-gray-900 dark:text-white">
            Dashboard Operacional
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Métricas de produção de pacotes, serviços e previsão de atendimentos futuros.
          </p>
        </div>
        <div className="text-xs font-mono px-3 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 self-start md:self-auto">
          Hoje: 20 de Junho, 2026
        </div>
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Pacotes */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total de Pacotes</span>
            <div className="p-2.5 bg-[#0B1B3D]/5 text-[#0B1B3D] dark:text-blue-300 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold tracking-tight text-gray-900 dark:text-white">
              {metrics.totalAppointments}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Agendamentos cadastrados</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Serviços Adicionais */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Serviços Executados</span>
            <div className="p-2.5 bg-[#8B5A2B]/5 text-[#8B5A2B] dark:text-[#E6D8B8] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold tracking-tight text-gray-900 dark:text-white">
              {metrics.totalServicesCount}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <Activity className="w-3.5 h-3.5 text-[#8B5A2B]" />
              <span>Serviços adicionados aos pacotes</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Próximos Atendimentos */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Próximos Atendimentos</span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {metrics.upcomingAppointmentsCount}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sessões futuras planejadas</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total de Clientes */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pessoas Cadastradas</span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-[#C2B280] rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-mono font-bold tracking-tight text-gray-900 dark:text-white">
              {metrics.totalClients}
            </span>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Clientes, assessores e cerimonialistas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Forecast section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Packages & Services by Month Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-display font-medium text-gray-900 dark:text-white mb-4">
            Pacotes & Serviços Adicionais por Mês
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#27272a' : '#f1f5f9'} />
                <XAxis 
                  dataKey="monthName" 
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
                  contentStyle={{ 
                    backgroundColor: isDarkMode ? '#18181b' : '#ffffff',
                    borderColor: isDarkMode ? '#27272a' : '#f1f5f9',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar name="Pacotes agendados" dataKey="pacotes" fill={isDarkMode ? '#60a5fa' : '#0B1B3D'} radius={[6, 6, 0, 0]} />
                <Bar name="Serviços inclusos" dataKey="servicos" fill={isDarkMode ? '#f59e0b' : '#8B5A2B'} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Forecast / Next Clients section */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-medium text-gray-900 dark:text-white mb-1">
              Previsão de Próximos Clientes
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              Cronograma dos próximos atendimentos.
            </p>

            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {upcomingForecast.length === 0 ? (
                <div className="py-8 text-center text-gray-400 text-xs italic">
                  Nenhum atendimento futuro cadastrado.
                </div>
              ) : (
                upcomingForecast.map((app) => (
                  <div 
                    key={app.id} 
                    className="p-3 bg-slate-50/50 dark:bg-zinc-800/30 rounded-xl border border-slate-100/50 dark:border-zinc-800/40 flex flex-col gap-2 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-gray-900 dark:text-zinc-100 truncate">
                        {app.patientName}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        <span>{formatBrazilianDate(app.date)}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-[#C2B280]" />
                        <span>{app.time}</span>
                      </span>
                    </div>

                    {/* Included services micro list */}
                    {((app.includedServices && app.includedServices.length > 0) || (app.includedServiceIds && app.includedServiceIds.length > 0)) && (
                      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-dashed border-gray-200/60 dark:border-zinc-800">
                        {app.includedServices && app.includedServices.length > 0 ? (
                          app.includedServices.map((is) => {
                            const s = services.find(item => item.id === is.serviceId);
                            if (!s) return null;
                            return (
                              <span key={is.serviceId} className="text-[8px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded border border-emerald-100/30 flex items-center gap-1">
                                <span>{s.name}</span>
                                <span className="font-bold">R$ {is.customCost}</span>
                              </span>
                            );
                          })
                        ) : (
                          app.includedServiceIds?.map((id) => {
                            const s = services.find(item => item.id === id);
                            if (!s) return null;
                            return (
                              <span key={id} className="text-[8px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded border border-emerald-100/30">
                                {s.name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="text-[10px] text-gray-400 mt-4 pt-3 border-t border-slate-50 dark:border-zinc-800 flex items-center gap-1.5 font-mono">
            <Briefcase className="w-3.5 h-3.5 text-[#C2B280]" />
            <span>Sessões futuras agendadas.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useDatabase } from '../databaseService';
import { Appointment, AppointmentStatus, Client, PaymentRecord } from '../types';
import { 
  Calendar, 
  Clock, 
  User, 
  Coins, 
  StickyNote, 
  Plus, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Sparkles,
  X,
  Phone,
  MapPin,
  UserCheck,
  DollarSign,
  Briefcase,
  Info,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ScheduleTab() {
  const { 
    clients, 
    appointments, 
    addAppointment, 
    updateAppointment, 
    deleteAppointment,
    addClient,
    products,
    services
  } = useDatabase();

  // Selected date defaults to simulated today: 2026-06-20
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-20');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  
  // Custom context menu for right-click on day
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; date: string } | null>(null);

  // New Appointment modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('2026-06-20');
  const [time, setTime] = useState('14:00');
  const [endTime, setEndTime] = useState('');
  const [value, setValue] = useState('320');
  const [status, setStatus] = useState<AppointmentStatus>('Pendente');
  const [notes, setNotes] = useState('');
  const [contact, setContact] = useState('');
  const [service, setService] = useState('Noiva');
  const [includedServiceIds, setIncludedServiceIds] = useState<string[]>([]);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState('');
  const [formError, setFormError] = useState('');

  // Bride specific creation states
  const [packageValue, setPackageValue] = useState('1500');
  const [partyLocation, setPartyLocation] = useState('');
  const [ceremonyPlannerName, setCeremonyPlannerName] = useState('');
  const [ceremonyPlannerPhone, setCeremonyPlannerPhone] = useState('');
  const [savePlannerAsClient, setSavePlannerAsClient] = useState(false);
  const [downpaymentValue, setDownpaymentValue] = useState('500');
  const [postpaymentValue, setPostpaymentValue] = useState('0');
  const [payments, setPayments] = useState<PaymentRecord[]>([
    { id: '1', value: 0, date: new Date().toISOString().split('T')[0] }
  ]);

  // Appointment Details View / Edit modal state
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Edit form states for Details modal
  const [editClientId, setEditClientId] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editService, setEditService] = useState('Noiva');
  const [editPackageValue, setEditPackageValue] = useState('');
  const [editPartyLocation, setEditPartyLocation] = useState('');
  const [editCeremonyPlannerName, setEditCeremonyPlannerName] = useState('');
  const [editCeremonyPlannerPhone, setEditCeremonyPlannerPhone] = useState('');
  const [editSavePlannerAsClient, setEditSavePlannerAsClient] = useState(false);
  const [editDownpaymentValue, setEditDownpaymentValue] = useState('');
  const [editPostpaymentValue, setEditPostpaymentValue] = useState('');
  const [editPayments, setEditPayments] = useState<PaymentRecord[]>([]);
  const [editNotes, setEditNotes] = useState('');
  const [editValue, setEditValue] = useState('');
  const [editStatus, setEditStatus] = useState<AppointmentStatus>('Pendente');
  const [editTime, setEditTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editIncludedServiceIds, setEditIncludedServiceIds] = useState<string[]>([]);
  const [editSelectedServiceToAdd, setEditSelectedServiceToAdd] = useState('');
  const [editFormError, setEditFormError] = useState('');

  // Delete appointment confirm states
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteModalConfirm, setDeleteModalConfirm] = useState(false);

  // Close context menu on any global window click
  useEffect(() => {
    const handleClose = () => setContextMenu(null);
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  // Compute 42 days (6 weeks) for full month calendar grid view, aligned on Sunday
  const monthDays = useMemo(() => {
    try {
      const [year, month] = selectedDate.split('-').map(Number);
      
      // First day of selected month
      const firstDay = new Date(year, month - 1, 1);
      const dayOfWeekOfFirst = firstDay.getDay(); // 0 is Sunday, 1 is Monday...
      
      // Start of grid is Sunday before or on the 1st
      const startDate = new Date(year, month - 1, 1 - dayOfWeekOfFirst);
      
      const days = [];
      for (let i = 0; i < 42; i++) {
        const current = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
        const yyyy = current.getFullYear();
        const mm = String(current.getMonth() + 1).padStart(2, '0');
        const dd = String(current.getDate()).padStart(2, '0');
        
        days.push({
          dateString: `${yyyy}-${mm}-${dd}`,
          dayNumber: current.getDate(),
          monthIndex: current.getMonth(),
          year: current.getFullYear(),
          isCurrentMonth: current.getMonth() === month - 1,
          dayName: ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][i % 7]
        });
      }
      return days;
    } catch (e) {
      return [];
    }
  }, [selectedDate]);

  // Active month year text label in Portuguese (e.g., "Junho 2026")
  const activeMonthYearLabel = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const monthIndex = parseInt(parts[1]) - 1;
        const PORTUGUESE_MONTHS = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return `${PORTUGUESE_MONTHS[monthIndex]} ${year}`;
      }
    } catch (e) {}
    return '';
  }, [selectedDate]);

  // Quick navigation helpers to adjust active month
  const adjustMonth = (offsetMonths: number) => {
    try {
      const [year, month] = selectedDate.split('-').map(Number);
      const targetDate = new Date(year, month - 1 + offsetMonths, 1);
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      setSelectedDate(`${yyyy}-${mm}-01`);
    } catch (e) {}
  };

  // Jump to simulated today (2026-06-20)
  const jumpToSimulatedToday = () => {
    setSelectedDate('2026-06-20');
  };

  // Premium colors presets for calendar dots and service badges
  const getPillColor = (patientName: string) => {
    const PILL_COLORS = [
      { bg: 'bg-[#2e6930] text-white', hover: 'hover:bg-[#235324]', dot: 'bg-[#2e6930]' }, // Dark green
      { bg: 'bg-[#06b6d4] text-white', hover: 'hover:bg-[#0891b2]', dot: 'bg-[#06b6d4]' }, // Cyan
      { bg: 'bg-[#4f46e5] text-white', hover: 'hover:bg-[#4338ca]', dot: 'bg-[#4f46e5]' }, // Indigo
      { bg: 'bg-[#f97316] text-white', hover: 'hover:bg-[#ea580c]', dot: 'bg-[#f97316]' }, // Orange
      { bg: 'bg-[#f59e0b] text-white', hover: 'hover:bg-[#d97706]', dot: 'bg-[#f59e0b]' }, // Yellow-Orange
      { bg: 'bg-[#10b981] text-white', hover: 'hover:bg-[#059669]', dot: 'bg-[#10b981]' }, // Emerald
      { bg: 'bg-[#ec4899] text-white', hover: 'hover:bg-[#db2777]', dot: 'bg-[#ec4899]' }, // Pink
      { bg: 'bg-[#8b5cf6] text-white', hover: 'hover:bg-[#7c3aed]', dot: 'bg-[#8b5cf6]' }, // Purple
    ];

    let hash = 0;
    for (let i = 0; i < patientName.length; i++) {
      hash = patientName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % PILL_COLORS.length;
    return PILL_COLORS[index];
  };

  // Filtered appointments for the active day list
  const displayedAppointments = useMemo(() => {
    return appointments
      .filter((app) => {
        const matchesDate = app.date === selectedDate;
        const matchesStatus = filterStatus === 'Todos' || app.status === filterStatus;
        return matchesDate && matchesStatus;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate, filterStatus]);

  // Handle right-click context menu triggering
  const handleDayContextMenu = (e: React.MouseEvent, dateString: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      date: dateString
    });
  };

  // Open creation modal pre-filled with context date
  const openNewAppointmentWithDate = (targetDate: string) => {
    setClientId(clients[0]?.id || '');
    setDate(targetDate);
    setTime('14:00');
    setEndTime('15:00');
    setValue('320');
    setStatus('Pendente');
    setNotes('');
    setContact('');
    setService('Noiva');
    setFormError('');
    
    // Reset bride specific creation fields
    setPackageValue('1500');
    setPartyLocation('');
    setCeremonyPlannerName('');
    setCeremonyPlannerPhone('');
    setSavePlannerAsClient(false);
    setDownpaymentValue('0');
    setPostpaymentValue('1500');
    setPayments([
      { id: '1', value: 0, date: targetDate }
    ]);

    setIsModalOpen(true);
  };

  // Handle saving brand-new appointment
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setFormError('Por favor, selecione um paciente cadastrado.');
      return;
    }

    const selectedClient = clients.find((c) => c.id === clientId);
    if (!selectedClient) {
      setFormError('Paciente não encontrado.');
      return;
    }

    // Save planner as client if selected and info is present
    if (service === 'Noiva' && savePlannerAsClient && ceremonyPlannerName.trim()) {
      const plannerExists = clients.some(c => c.name.toLowerCase() === ceremonyPlannerName.trim().toLowerCase());
      if (!plannerExists) {
        addClient({
          name: ceremonyPlannerName.trim(),
          phone: ceremonyPlannerPhone.trim(),
          email: '',
          birthDate: '',
          notes: `Cerimonialista contratado pela noiva ${selectedClient.name}. Cadastrado via fluxo de agendamento.`,
          category: 'cerimonialistas'
        });
      }
    }

    // Determine final financial value for persistence with included service costs
    const servicesCost = includedServiceIds.reduce((sum, id) => {
      const svcObj = services.find(s => s.id === id);
      return sum + (svcObj ? svcObj.cost : 0);
    }, 0);

    const basePkgVal = parseFloat(packageValue) || 0;
    const baseValueVal = parseFloat(value) || 0;

    const finalPackageValue = service === 'Noiva' ? (basePkgVal + servicesCost) : undefined;
    const finalValue = service === 'Noiva' ? (basePkgVal + servicesCost) : (baseValueVal + servicesCost);

    const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.value as any) || 0), 0);
    const restToPay = Math.max(0, finalValue - totalPaid);

    addAppointment({
      clientId,
      patientName: selectedClient.name,
      date,
      time,
      endTime,
      status,
      value: finalValue,
      notes: notes.trim(),
      contact: contact.trim() || selectedClient.phone,
      service,
      packageValue: finalPackageValue,
      partyLocation: service === 'Noiva' ? partyLocation.trim() : undefined,
      ceremonyPlannerName: service === 'Noiva' ? ceremonyPlannerName.trim() : undefined,
      ceremonyPlannerPhone: service === 'Noiva' ? ceremonyPlannerPhone.trim() : undefined,
      downpaymentValue: totalPaid,
      postpaymentValue: restToPay,
      payments,
      includedServiceIds,
    });

    setIsModalOpen(false);
    setIncludedServiceIds([]);
    setSelectedServiceToAdd('');
    setSelectedDate(date);
  };

  // Open Details & Edit Modal
  const handleOpenDetails = (app: Appointment) => {
    setSelectedApp(app);
    setEditClientId(app.clientId);
    setEditContact(app.contact || '');
    setEditService(app.service || 'Noiva');
    setEditPackageValue(app.packageValue?.toString() || app.value?.toString() || '1500');
    setEditPartyLocation(app.partyLocation || '');
    setEditCeremonyPlannerName(app.ceremonyPlannerName || '');
    setEditCeremonyPlannerPhone(app.ceremonyPlannerPhone || '');
    setEditSavePlannerAsClient(false);
    setEditDownpaymentValue(app.downpaymentValue?.toString() || '0');
    setEditPostpaymentValue(app.postpaymentValue?.toString() || '0');
    
    // Migrate or load payments
    const initialPayments: PaymentRecord[] = [];
    if (app.payments && app.payments.length > 0) {
      initialPayments.push(...app.payments);
    } else {
      if (app.downpaymentValue && app.downpaymentValue > 0) {
        initialPayments.push({
          id: 'pay-1',
          value: app.downpaymentValue,
          date: app.date || new Date().toISOString().split('T')[0]
        });
      } else {
        initialPayments.push({
          id: 'pay-1',
          value: 0,
          date: app.date || new Date().toISOString().split('T')[0]
        });
      }
    }
    setEditPayments(initialPayments);

    setEditNotes(app.notes || '');
    setEditValue(app.value?.toString() || '320');
    setEditStatus(app.status || 'Pendente');
    setEditTime(app.time || '14:00');
    setEditEndTime(app.endTime || '');
    setEditDate(app.date || '');
    setEditIncludedServiceIds(app.includedServiceIds || []);
    setEditSelectedServiceToAdd('');
    setEditFormError('');
    setIsDetailsModalOpen(true);
  };

  // Handle saving edited appointment
  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    const updatedClientObj = clients.find((c) => c.id === editClientId);
    if (!updatedClientObj) {
      setEditFormError('Por favor, selecione um cliente válido.');
      return;
    }

    // Save planner as client if selected and info is present
    if (editService === 'Noiva' && editSavePlannerAsClient && editCeremonyPlannerName.trim()) {
      const plannerExists = clients.some(c => c.name.toLowerCase() === editCeremonyPlannerName.trim().toLowerCase());
      if (!plannerExists) {
        addClient({
          name: editCeremonyPlannerName.trim(),
          phone: editCeremonyPlannerPhone.trim(),
          email: '',
          birthDate: '',
          notes: `Cerimonialista contratado pela noiva ${updatedClientObj.name}. Cadastrado via edição de agendamento.`,
          category: 'cerimonialistas'
        });
      }
    }

    // Compute final value with included service costs
    const editServicesCost = editIncludedServiceIds.reduce((sum, id) => {
      const svcObj = services.find(s => s.id === id);
      return sum + (svcObj ? svcObj.cost : 0);
    }, 0);

    const basePkgVal = parseFloat(editPackageValue) || 0;
    const baseValueVal = parseFloat(editValue) || 0;

    const finalPackageValue = editService === 'Noiva' ? (basePkgVal + editServicesCost) : undefined;
    const finalValue = editService === 'Noiva' ? (basePkgVal + editServicesCost) : (baseValueVal + editServicesCost);

    const totalPaid = editPayments.reduce((sum, p) => sum + (parseFloat(p.value as any) || 0), 0);
    const restToPay = Math.max(0, finalValue - totalPaid);

    updateAppointment({
      ...selectedApp,
      clientId: editClientId,
      patientName: updatedClientObj.name,
      contact: editContact.trim() || updatedClientObj.phone,
      service: editService,
      packageValue: finalPackageValue,
      partyLocation: editService === 'Noiva' ? editPartyLocation.trim() : undefined,
      ceremonyPlannerName: editService === 'Noiva' ? editCeremonyPlannerName.trim() : undefined,
      ceremonyPlannerPhone: editService === 'Noiva' ? editCeremonyPlannerPhone.trim() : undefined,
      downpaymentValue: totalPaid,
      postpaymentValue: restToPay,
      payments: editPayments,
      notes: editNotes.trim(),
      value: finalValue,
      status: editStatus,
      time: editTime,
      endTime: editEndTime,
      date: editDate,
      includedServiceIds: editIncludedServiceIds,
    });

    setIsDetailsModalOpen(false);
  };

  // Quick save payments for Noiva without closing the details modal
  const handleQuickSavePayments = () => {
    if (!selectedApp) return;

    const pkgVal = parseFloat(editPackageValue) || 0;

    // Optional: save planner as client if checked at this point
    if (editSavePlannerAsClient && editCeremonyPlannerName.trim()) {
      const plannerExists = clients.some(c => c.name.toLowerCase() === editCeremonyPlannerName.trim().toLowerCase());
      if (!plannerExists) {
        addClient({
          name: editCeremonyPlannerName.trim(),
          phone: editCeremonyPlannerPhone.trim(),
          email: '',
          birthDate: '',
          notes: `Cerimonialista contratado pela noiva ${selectedApp.patientName}. Cadastrado via salvamento rápido de valores.`,
          category: 'cerimonialistas'
        });
      }
      setEditSavePlannerAsClient(false);
    }

    const finalVal = editService === 'Noiva' ? pkgVal : (parseFloat(editValue) || 0);
    const totalPaid = editPayments.reduce((sum, p) => sum + (parseFloat(p.value as any) || 0), 0);
    const restToPay = Math.max(0, finalVal - totalPaid);

    const updatedApp = {
      ...selectedApp,
      packageValue: editService === 'Noiva' ? pkgVal : undefined,
      downpaymentValue: totalPaid,
      postpaymentValue: restToPay,
      payments: editPayments,
      value: finalVal,
      partyLocation: editService === 'Noiva' ? editPartyLocation.trim() : undefined,
      ceremonyPlannerName: editService === 'Noiva' ? editCeremonyPlannerName.trim() : undefined,
      ceremonyPlannerPhone: editService === 'Noiva' ? editCeremonyPlannerPhone.trim() : undefined,
      contact: editContact.trim(),
      notes: editNotes.trim(),
    };

    updateAppointment(updatedApp);
    setSelectedApp(updatedApp);
  };

  // Quick toggle status directly on the list card
  const handleQuickStatusChange = (app: Appointment, newStatus: AppointmentStatus) => {
    updateAppointment({
      ...app,
      status: newStatus
    });
  };

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val);
  };

  // Formatted date string for selected header (e.g., "Sábado, 20 de Junho de 2026")
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return dateObj.toLocaleDateString('pt-BR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      }
    } catch (e) {}
    return selectedDate;
  }, [selectedDate]);

  // Helper to determine contrast text color (either navy blue or white)
  const getContrastColor = (hexColor?: string) => {
    if (!hexColor || hexColor.charAt(0) !== '#') return '#ffffff';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#0B1B3D' : '#ffffff';
  };

  const getCardStyle = (svc?: string) => {
    // If it's Noiva: solid AREIA background, text AZUL MARINHO, border slightly darker areia
    if (svc === 'Noiva') {
      return {
        style: { backgroundColor: '#C2B280', color: '#0B1B3D', borderColor: '#B2A270' },
        className: 'text-[#0B1B3D]'
      };
    }
    
    // Check custom products
    const prod = products?.find(p => p.name === svc);
    if (prod && prod.bgColor) {
      const textColor = getContrastColor(prod.bgColor);
      return {
        style: { backgroundColor: prod.bgColor, color: textColor, borderColor: `${prod.bgColor}dd` },
        className: ''
      };
    }

    return {
      style: {},
      className: 'bg-white dark:bg-zinc-900 border-slate-100 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 text-gray-900 dark:text-white'
    };
  };

  // Service Badge styling mapper
  const getServiceBadgeStyle = (svc?: string) => {
    if (svc === 'Noiva') {
      return 'bg-[#FAF7F0] text-[#0B1B3D] border-[#C2B280]/40';
    }
    const prod = products?.find(p => p.name === svc);
    if (prod && prod.bgColor) {
      return `border-opacity-30`;
    }
    return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border-slate-200/30';
  };

  // Google Calendar style compact event colors
  const getCompactServiceStyle = (svc?: string) => {
    if (svc === 'Noiva') {
      return {
        style: { backgroundColor: '#C2B280', color: '#0B1B3D', borderColor: '#B2A270' },
        className: ''
      };
    }
    const prod = products?.find(p => p.name === svc);
    if (prod && prod.bgColor) {
      const textColor = getContrastColor(prod.bgColor);
      return {
        style: { backgroundColor: prod.bgColor, color: textColor, borderColor: `${prod.bgColor}dd` },
        className: 'border'
      };
    }
    if (svc === 'Maquiagem') {
      return {
        style: { backgroundColor: '#0B1B3D', color: '#ffffff', borderColor: '#051026' },
        className: 'border'
      };
    }
    if (svc === 'Cabelo') {
      return {
        style: { backgroundColor: '#8B5A2B', color: '#ffffff', borderColor: '#734921' },
        className: 'border'
      };
    }
    return {
      style: {},
      className: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-zinc-800/40 dark:text-zinc-200 dark:border-zinc-700 hover:bg-indigo-100'
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-semibold tracking-tight">
            Agenda Integrada
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Calendário completo mensal padrão iPhone com preenchimento de serviços, detalhamento de noivas e balanços.
          </p>
        </div>
        <button
          onClick={() => openNewAppointmentWithDate(selectedDate)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-all duration-200 shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Novo Agendamento</span>
        </button>
      </div>

      {/* Navegação Temporal & Control Bar */}
      <div className="bg-[#fafafc] dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400 block uppercase mb-1">
            Calendário Mensal
          </span>
          <h3 className="text-2xl font-bold font-display text-gray-900 dark:text-white capitalize">
            {activeMonthYearLabel}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustMonth(-1)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm text-gray-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            title="Mês Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button
            onClick={jumpToSimulatedToday}
            className="px-5 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center font-semibold bg-white dark:bg-zinc-900 shadow-sm text-gray-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 text-sm transition-all active:scale-95"
          >
            Hoje
          </button>

          <button
            onClick={() => adjustMonth(1)}
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center bg-white dark:bg-zinc-900 shadow-sm text-gray-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all active:scale-95"
            title="Próximo Mês"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* iPhone Calendar Grid Header (DOM, SEG... SÁB) */}
      <div className="grid grid-cols-7 gap-1 px-2 text-center text-xs font-bold text-gray-400 tracking-wider">
        <div>DOM</div>
        <div>SEG</div>
        <div>TER</div>
        <div>QUA</div>
        <div>QUI</div>
        <div>SEX</div>
        <div>SÁB</div>
      </div>

      {/* 42-day standard monthly grid */}
      <div className="grid grid-cols-7 gap-1.5 md:gap-2.5">
        {monthDays.map((card, idx) => {
          const dayAppointments = appointments.filter((app) => app.date === card.dateString);
          const isSelected = selectedDate === card.dateString;
          const isToday = card.dateString === '2026-06-20'; // simulated today for aesthetic parity
          
          return (
            <div
              key={`${card.dateString}-${idx}`}
              onClick={() => setSelectedDate(card.dateString)}
              onContextMenu={(e) => handleDayContextMenu(e, card.dateString)}
              className={`bg-white dark:bg-zinc-900 border rounded-2xl md:rounded-3xl p-1 md:p-2 flex flex-col items-stretch justify-start cursor-pointer transition-all relative min-h-[75px] md:min-h-[120px] lg:min-h-[145px] ${
                isSelected
                  ? 'border-indigo-600 ring-2 ring-indigo-500/10 dark:border-indigo-400 bg-indigo-50/5'
                  : card.isCurrentMonth
                    ? 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/40 dark:border-zinc-800/80 dark:hover:bg-zinc-800/30'
                    : 'border-slate-50/40 bg-slate-50/20 dark:border-zinc-900 dark:bg-zinc-950/20 opacity-30 hover:opacity-50'
              }`}
              title="Clique para selecionar. Botão direito para Novo Agendamento."
            >
              {/* Day Header */}
              <div className="w-full flex justify-between items-center mb-1 shrink-0">
                <span
                  className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-xs md:text-sm rounded-full font-display transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-bold shadow-sm'
                      : isToday
                        ? 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                        : card.isCurrentMonth
                          ? 'text-gray-800 dark:text-zinc-200 font-medium'
                          : 'text-gray-400 dark:text-zinc-600'
                  }`}
                >
                  {card.dayNumber}
                </span>

                {dayAppointments.length > 0 && (
                  <span className="text-[9px] md:text-[10px] font-mono text-indigo-500 font-bold hidden lg:inline">
                    {dayAppointments.length} {dayAppointments.length === 1 ? 'atend.' : 'atends.'}
                  </span>
                )}
              </div>

              {/* Scheduled items: Google Calendar style (Desktop) */}
              <div className="hidden md:flex flex-col gap-1 w-full overflow-hidden flex-1 justify-start">
                {dayAppointments.slice(0, 3).map((app) => {
                  const styleObj = getCompactServiceStyle(app.service);
                  return (
                    <div
                      key={app.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(app);
                      }}
                      style={styleObj.style}
                      className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-lg truncate font-medium flex items-center gap-1 transition-all ${styleObj.className}`}
                      title={`${app.time}${app.endTime ? ` - ${app.endTime}` : ''} - ${app.patientName} (${app.service})`}
                    >
                      <span className="font-bold shrink-0">{app.time}{app.endTime ? `-${app.endTime}` : ''}</span>
                      <span className="truncate">{app.patientName}</span>
                    </div>
                  );
                })}
                {dayAppointments.length > 3 && (
                  <div className="text-[9px] font-semibold text-gray-400 dark:text-zinc-500 text-center">
                    +{dayAppointments.length - 3} mais
                  </div>
                )}
              </div>

              {/* iPhone style color dots (Mobile only) */}
              <div className="flex md:hidden gap-1 items-center justify-center h-4 w-full mt-auto">
                {dayAppointments.slice(0, 3).map((app) => {
                  const themeColors = getPillColor(app.patientName);
                  return (
                    <span 
                      key={app.id} 
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${app.service === 'Noiva' ? 'bg-[#C2B280]' : themeColors.dot}`} 
                      title={`${app.time}${app.endTime ? ` - ${app.endTime}` : ''} - ${app.patientName}`}
                    />
                  );
                })}
                {dayAppointments.length > 3 && (
                  <span className="text-[8px] md:text-[9px] font-bold text-gray-400 dark:text-zinc-500 shrink-0 leading-none">
                    +
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Right-Click Custom Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: 'fixed', 
              left: contextMenu.x, 
              top: contextMenu.y,
              zIndex: 100 
            }}
            className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl py-1.5 min-w-[190px] backdrop-blur-md"
          >
            <button
              onClick={() => {
                openNewAppointmentWithDate(contextMenu.date);
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-xs md:text-sm text-slate-800 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>Novo Agendamento</span>
            </button>
            <div className="border-t border-slate-100 dark:border-zinc-800 my-1" />
            <div className="px-4 py-1 text-[10px] text-gray-400 font-mono">
              Dia: {contextMenu.date.split('-').reverse().join('/')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date Detail Agenda Panel & Quick presence toggles */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800/60">
          <div>
            <h4 className="text-lg font-bold font-display text-gray-900 dark:text-white capitalize flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <span>Agenda de {formattedSelectedDate}</span>
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Dica: Clique em qualquer agendamento na lista abaixo para visualizar/editar as informações detalhadas em pop-up.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Direct date picker */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-1.5 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-800 dark:text-zinc-300"
            />

            {/* Filter by Presence status */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/50 p-1 rounded-xl">
              {['Todos', 'Realizado', 'Falta', 'Pendente'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    filterStatus === st
                      ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed List of Appointments */}
        <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
          {displayedAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-zinc-500 text-sm italic">
              Nenhum atendimento registrado para este dia com o filtro selecionado.
            </div>
          ) : (
            displayedAppointments.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => handleOpenDetails(app)}
                style={getCardStyle(app.service).style}
                className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${getCardStyle(app.service).className}`}
              >
                {/* Left Column: Time, Patient Name, Service Badge, and Notes */}
                <div className="flex items-start gap-4">
                  <div className={`flex flex-col items-center justify-center p-3.5 rounded-xl shrink-0 border ${
                    app.service === 'Noiva'
                      ? 'bg-white/20 text-[#0B1B3D] border-white/20'
                      : 'bg-slate-50 dark:bg-zinc-800/60 text-indigo-600 dark:text-indigo-400 border-slate-100/55 dark:border-zinc-800/30'
                  }`}>
                    <Clock className={`w-5 h-5 mb-1 ${app.service === 'Noiva' ? 'text-[#0B1B3D]' : 'text-indigo-500'}`} />
                    <span className="font-mono text-xs font-bold whitespace-nowrap">{app.time}{app.endTime ? ` - ${app.endTime}` : ''}</span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className={`font-display font-semibold text-base truncate ${app.service === 'Noiva' ? 'text-[#0B1B3D]' : 'text-gray-900 dark:text-white'}`}>
                        {app.patientName}
                      </h4>
                      
                      {/* Service Badge */}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase ${
                        app.service === 'Noiva'
                          ? 'bg-[#FAF7F0] text-[#0B1B3D] border-[#C2B280]/40'
                          : getServiceBadgeStyle(app.service)
                      }`}
                      style={app.service !== 'Noiva' ? getCompactServiceStyle(app.service).style : {}}
                      >
                        {app.service || 'Maquiagem'}
                      </span>
 
                      {/* Currency Value */}
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        app.service === 'Noiva'
                          ? 'text-[#0B1B3D] bg-white/45 shadow-sm'
                          : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                      }`}>
                        {formatCurrency(app.value)}
                      </span>
                    </div>
 
                    {/* Contact Number, if available */}
                    {app.contact && (
                      <p className={`text-xs flex items-center gap-1 ${
                        app.service === 'Noiva' ? 'text-[#0B1B3D]/80' : 'text-gray-500 dark:text-zinc-400'
                      }`}>
                        <Phone className={`w-3.5 h-3.5 ${app.service === 'Noiva' ? 'text-[#0B1B3D]/70' : 'text-gray-400'}`} />
                        <span>{app.contact}</span>
                      </p>
                    )}
 
                    {/* Notes preview */}
                    {app.notes ? (
                      <p className={`text-xs flex items-start gap-1 ${
                        app.service === 'Noiva' ? 'text-[#0B1B3D]/90' : 'text-gray-500 dark:text-zinc-400'
                      }`}>
                        <StickyNote className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${app.service === 'Noiva' ? 'text-[#0B1B3D]/70' : 'text-gray-400'}`} />
                        <span className="italic truncate max-w-[280px] md:max-w-[450px]">{app.notes}</span>
                      </p>
                    ) : (
                      <p className={`text-xs italic ${app.service === 'Noiva' ? 'text-[#0B1B3D]/60' : 'text-gray-400 dark:text-gray-500'}`}>Sem observações adicionais.</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Quick Presence Control Buttons */}
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  className={`flex flex-wrap items-center gap-3 self-end md:self-auto pt-3 md:pt-0 border-t md:border-t-0 ${
                    app.service === 'Noiva' ? 'border-[#0B1B3D]/15' : 'border-slate-50 dark:border-zinc-800/60'
                  }`}
                >
                  <div className={`text-xs font-semibold mr-1 ${app.service === 'Noiva' ? 'text-[#0B1B3D]/85' : 'text-gray-400'}`}>Presença:</div>
                  
                  <div className={`flex items-center gap-1 p-1 rounded-xl ${
                    app.service === 'Noiva' ? 'bg-[#0B1B3D]/10' : 'bg-slate-100 dark:bg-zinc-800/70'
                  }`}>
                    {/* Realizado */}
                    <button
                      onClick={() => handleQuickStatusChange(app, 'Realizado')}
                      title="Marcar como Realizado"
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        app.status === 'Realizado'
                          ? app.service === 'Noiva'
                            ? 'bg-[#0B1B3D] text-[#C2B280] font-bold shadow-sm'
                            : 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                          : app.service === 'Noiva'
                            ? 'text-[#0B1B3D]/70 hover:text-[#0B1B3D]'
                            : 'text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Realizado</span>
                    </button>

                    {/* Falta */}
                    <button
                      onClick={() => handleQuickStatusChange(app, 'Falta')}
                      title="Marcar como Falta"
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        app.status === 'Falta'
                          ? app.service === 'Noiva'
                            ? 'bg-rose-600 text-white font-bold shadow-sm'
                            : 'bg-white dark:bg-zinc-700 text-rose-500 dark:text-rose-400 shadow-sm'
                          : app.service === 'Noiva'
                            ? 'text-[#0B1B3D]/70 hover:text-[#0B1B3D]'
                            : 'text-gray-500 hover:text-rose-500 dark:hover:text-rose-400'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Falta</span>
                    </button>

                    {/* Pendente */}
                    <button
                      onClick={() => handleQuickStatusChange(app, 'Pendente')}
                      title="Marcar como Pendente"
                      className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                        app.status === 'Pendente'
                          ? app.service === 'Noiva'
                            ? 'bg-amber-600 text-white font-bold shadow-sm'
                            : 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                          : app.service === 'Noiva'
                            ? 'text-[#0B1B3D]/70 hover:text-[#0B1B3D]'
                            : 'text-gray-500 hover:text-amber-600 dark:hover:text-amber-400'
                      }`}
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Pendente</span>
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      if (deleteConfirmId === app.id) {
                        deleteAppointment(app.id);
                        setDeleteConfirmId(null);
                      } else {
                        setDeleteConfirmId(app.id);
                        setTimeout(() => setDeleteConfirmId(null), 3000);
                      }
                    }}
                    className={`p-2 border rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                      deleteConfirmId === app.id
                        ? 'bg-rose-100 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 animate-pulse'
                        : app.service === 'Noiva'
                          ? 'border-[#0B1B3D]/20 text-[#0B1B3D]/75 hover:text-[#0B1B3D] hover:bg-[#0B1B3D]/10'
                          : 'border-slate-100 dark:border-zinc-800 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    }`}
                    title={deleteConfirmId === app.id ? "Clique novamente para confirmar exclusão" : "Excluir Agendamento"}
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                    {deleteConfirmId === app.id && <span>Excluir?</span>}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* NEW APPOINTMENT BOOKING MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
                <h3 className="text-lg font-display font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Novo Agendamento</span>
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {formError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-xs rounded-xl font-medium">
                    {formError}
                  </div>
                )}

                {clients.length === 0 ? (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs rounded-xl text-center">
                    Você precisa primeiro cadastrar pacientes na aba "Clientes & Pacientes" para realizar agendamentos!
                  </div>
                ) : (
                  <>
                    {/* Patient Name selection */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Paciente cadastrado *
                      </label>
                      <select
                        value={clientId}
                        onChange={(e) => {
                          setClientId(e.target.value);
                          const client = clients.find(c => c.id === e.target.value);
                          if (client) setContact(client.phone);
                        }}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-medium"
                      >
                        <option value="" disabled>Escolha um paciente...</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact field */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Contato / Telefone
                      </label>
                      <input
                        type="text"
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        placeholder="Ex: (11) 98765-4321"
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                      />
                    </div>

                    {/* Service Type Dropdown menu suspenso */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Serviço / Atendimento *
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-medium"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.name}>{p.name}</option>
                        ))}
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    {/* DYNAMIC BRIDE FIELDS IF SERVIÇO == "Noiva" */}
                    {service === 'Noiva' && (
                      <fieldset className="p-4 border border-[#C2B280]/40 dark:border-[#C2B280]/20 bg-[#FAF7F0]/40 dark:bg-[#C2B280]/5 rounded-2xl space-y-4">
                        <legend className="text-xs font-bold text-[#0B1B3D] dark:text-blue-300 px-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#C2B280]" />
                          <span>Ficha Detalhada Noiva</span>
                        </legend>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1">
                              Valor do Pacote (R$)
                            </label>
                            <input
                              type="number"
                              value={packageValue}
                              onChange={(e) => setPackageValue(e.target.value)}
                              placeholder="Ex: 1500"
                              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm font-mono text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1">
                              Local da Festa
                            </label>
                            <input
                              type="text"
                              value={partyLocation}
                              onChange={(e) => setPartyLocation(e.target.value)}
                              placeholder="Ex: Recanto das Noivas"
                              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1">
                              Nome do Cerimonialista
                            </label>
                            <input
                              type="text"
                              value={ceremonyPlannerName}
                              onChange={(e) => setCeremonyPlannerName(e.target.value)}
                              placeholder="Ex: Marcos Cerimonial"
                              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1">
                              Contato Cerimonialista
                            </label>
                            <input
                              type="text"
                              value={ceremonyPlannerPhone}
                              onChange={(e) => setCeremonyPlannerPhone(e.target.value)}
                              placeholder="Ex: (27) 9988-7766"
                              className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            />
                          </div>
                        </div>

                        {/* Save Ceremony Planner as client Checkbox option */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                             type="checkbox"
                             id="savePlannerAsClient"
                             checked={savePlannerAsClient}
                             onChange={(e) => setSavePlannerAsClient(e.target.checked)}
                             className="w-4 h-4 rounded border-[#C2B280] text-[#0B1B3D] focus:ring-indigo-500"
                           />
                          <label htmlFor="savePlannerAsClient" className="text-xs text-[#0B1B3D] dark:text-blue-300 font-medium cursor-pointer">
                            Cadastrar cerimonialista
                          </label>
                        </div>
                      </fieldset>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Date */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          Data do Atendimento
                        </label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                        />
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          Horário de Início
                        </label>
                        <input
                          type="time"
                          required
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                          Horário de Término
                        </label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                        />
                      </div>
                    </div>

                    {/* SEÇÃO FINANCEIRA UNIVERSAL */}
                    <fieldset className="p-4 border border-indigo-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl space-y-4">
                      <legend className="text-xs font-bold text-indigo-500 px-2 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5" />
                        <span>Controle Financeiro</span>
                      </legend>

                      {/* Valor Cobrado */}
                      <div className="max-w-xs">
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                          Valor Total Cobrado (R$) {service === 'Noiva' && '(Ficha)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          disabled={service === 'Noiva'}
                          value={service === 'Noiva' ? packageValue : value}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (service === 'Noiva') {
                              setPackageValue(val);
                            } else {
                              setValue(val);
                            }
                          }}
                          placeholder="Ex: 320.00"
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
                        />
                      </div>

                      {/* Histórico de Pagamentos */}
                      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                            Histórico de Pagamentos ({payments.length})
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setPayments([
                                ...payments,
                                { id: Date.now().toString(), value: 0, date: date || new Date().toISOString().split('T')[0] }
                              ]);
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-indigo-200 dark:border-zinc-800 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Adicionar Pagamento</span>
                          </button>
                        </div>

                        {payments.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-zinc-500 italic py-1">Nenhum pagamento registrado.</p>
                        ) : (
                          <div className="space-y-2">
                            {payments.map((pmt, idx) => (
                              <div key={pmt.id} className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-xs">
                                <span className="text-[11px] font-bold text-indigo-500 w-8 shrink-0">
                                  #{idx + 1}
                                </span>
                                
                                <div className="grid grid-cols-2 gap-2 flex-1">
                                  {/* Valor */}
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 mb-0.5">
                                      Valor Pago (R$)
                                    </label>
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={pmt.value || ''}
                                      onChange={(e) => {
                                        const val = parseFloat(e.target.value) || 0;
                                        setPayments(payments.map(p => p.id === pmt.id ? { ...p, value: val } : p));
                                      }}
                                      placeholder="Ex: 500"
                                      className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs font-mono text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>

                                  {/* Data Pago */}
                                  <div>
                                    <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 mb-0.5">
                                      Data de Pagamento
                                    </label>
                                    <input
                                      type="date"
                                      value={pmt.date}
                                      onChange={(e) => {
                                        setPayments(payments.map(p => p.id === pmt.id ? { ...p, date: e.target.value } : p));
                                      }}
                                      className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                    />
                                  </div>
                                </div>

                                {/* Deletar parcela */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayments(payments.filter(p => p.id !== pmt.id));
                                  }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all active:scale-95 self-end mb-0.5"
                                  title="Remover este pagamento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* BALANCE SHEET PREVIEW */}
                      <div className="p-2.5 bg-indigo-50/50 dark:bg-zinc-800/40 rounded-xl flex items-center justify-between text-xs border border-indigo-100/30 dark:border-zinc-800">
                        <span className="font-bold text-indigo-500">Resta pagar:</span>
                        <span className={`font-mono font-bold text-xs ${
                          (parseFloat(service === 'Noiva' ? packageValue : value) || 0) - payments.reduce((sum, p) => sum + (p.value || 0), 0) > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {formatCurrency(
                            (parseFloat(service === 'Noiva' ? packageValue : value) || 0) - payments.reduce((sum, p) => sum + (p.value || 0), 0)
                          )}
                        </span>
                      </div>
                    </fieldset>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Presença Inicial
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-medium"
                      >
                        <option value="Pendente">Pendente (Agendado)</option>
                        <option value="Realizado">Realizado</option>
                        <option value="Falta">Falta (Confirmou falta)</option>
                      </select>
                    </div>

                    {/* INCLUDED SERVICES (Serviços Adicionais) */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-3">
                      <label className="block text-xs font-bold text-gray-700 dark:text-zinc-200 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Serviços / Adicionais Inclusos</span>
                      </label>
                      
                      <div className="flex gap-2">
                        <select
                          value={selectedServiceToAdd}
                          onChange={(e) => setSelectedServiceToAdd(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-zinc-100"
                        >
                          <option value="">Selecione um serviço para adicionar...</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({formatCurrency(s.cost)})
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (!selectedServiceToAdd) return;
                            if (includedServiceIds.includes(selectedServiceToAdd)) {
                              alert('Este serviço já foi adicionado.');
                              return;
                            }
                            setIncludedServiceIds([...includedServiceIds, selectedServiceToAdd]);
                            setSelectedServiceToAdd('');
                          }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs transition-all active:scale-95"
                        >
                          + Adicionar
                        </button>
                      </div>

                      {includedServiceIds.length > 0 ? (
                        <div className="space-y-1.5 pt-1.5">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Serviços adicionados:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {includedServiceIds.map((sid) => {
                              const s = services.find(item => item.id === sid);
                              if (!s) return null;
                              return (
                                <div
                                  key={sid}
                                  className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-gray-700 dark:text-zinc-200"
                                >
                                  <span>{s.name}</span>
                                  <span className="font-bold text-indigo-500">{formatCurrency(s.cost)}</span>
                                  <button
                                    type="button"
                                    onClick={() => setIncludedServiceIds(includedServiceIds.filter(id => id !== sid))}
                                    className="p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-500 rounded-md transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                            Adicional de Serviços: +{formatCurrency(
                              includedServiceIds.reduce((sum, sid) => {
                                const s = services.find(item => item.id === sid);
                                return sum + (s ? s.cost : 0);
                              }, 0)
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-400 italic">Nenhum serviço adicional incluído ainda.</p>
                      )}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Notas de Sessão / Observações
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ex: Maquiagem marcante com tons terrosos e cílios volumosos..."
                        rows={3}
                        className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800/60 mt-6 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium rounded-xl"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm"
                      >
                        Agendar Sessão
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAIL AND EDIT APPOINTMENT POPUP MODAL */}
      <AnimatePresence>
        {isDetailsModalOpen && selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 w-full max-w-lg rounded-3xl shadow-xl overflow-hidden relative z-10 max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg border uppercase ${getServiceBadgeStyle(editService)}`}>
                    {editService}
                  </span>
                  <h3 className="text-base font-display font-semibold text-gray-900 dark:text-white truncate">
                    Detalhes do Agendamento
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-slate-50 dark:hover:bg-zinc-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Popup Form */}
              <form onSubmit={handleSaveDetails} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                {editFormError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-500 text-xs rounded-xl font-medium">
                    {editFormError}
                  </div>
                )}

                {/* Patient dropdown menu */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Cliente / Pessoa Atendida *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3 z-10" />
                    <select
                      value={editClientId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setEditClientId(newId);
                        const found = clients.find(c => c.id === newId);
                        if (found) {
                          setEditContact(found.phone);
                        }
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-semibold"
                    >
                      {clients.map((c) => {
                        const catLabel = c.category === 'cerimonialistas' ? ' (Cerimonialista)' : c.category === 'terceiros' ? ' (Terceiro)' : ' (Cliente)';
                        return (
                          <option key={c.id} value={c.id}>
                            {c.name}{catLabel}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Contact phone number */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Contato / Telefone
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      placeholder="Nenhum número registrado"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                {/* Service Type Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Serviço de Atendimento *
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <select
                      value={editService}
                      onChange={(e) => setEditService(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-medium"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                      <option value="Outros">Outros</option>
                    </select>
                  </div>
                </div>

                {/* DYNAMIC BRIDE DETAILS POPUP SECTION */}
                {editService === 'Noiva' && (
                  <fieldset className="p-4 border border-[#C2B280]/40 dark:border-[#C2B280]/20 bg-[#FAF7F0]/40 dark:bg-[#C2B280]/5 rounded-2xl space-y-4">
                    <legend className="text-xs font-bold text-[#0B1B3D] dark:text-blue-300 px-2 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#C2B280]" />
                      <span>Ficha Detalhada Noiva</span>
                    </legend>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1">
                          Valor do Pacote (R$)
                        </label>
                        <input
                          type="number"
                          value={editPackageValue}
                          onChange={(e) => setEditPackageValue(e.target.value)}
                          placeholder="Ex: 1500"
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm font-mono text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C2B280]" />
                          <span>Local da Festa</span>
                        </label>
                        <input
                          type="text"
                          value={editPartyLocation}
                          onChange={(e) => setEditPartyLocation(e.target.value)}
                          placeholder="Ex: Espaço Sol da Manhã"
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-[#C2B280]" />
                          <span>Nome do Cerimonialista</span>
                        </label>
                        <input
                          type="text"
                          value={editCeremonyPlannerName}
                          onChange={(e) => setEditCeremonyPlannerName(e.target.value)}
                          placeholder="Ex: Cerimonial Sônia"
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-[#0B1B3D] dark:text-blue-300 mb-1">
                          Contato Cerimonialista
                        </label>
                        <input
                          type="text"
                          value={editCeremonyPlannerPhone}
                          onChange={(e) => setEditCeremonyPlannerPhone(e.target.value)}
                          placeholder="Ex: (27) 9988-1122"
                          className="w-full px-3.5 py-2 bg-white dark:bg-zinc-900 border border-[#C2B280]/30 dark:border-zinc-800 rounded-xl text-sm text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        />
                      </div>
                    </div>

                    {/* Checkbox to save ceremony planner as Client */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="editSavePlannerAsClient"
                        checked={editSavePlannerAsClient}
                        onChange={(e) => setEditSavePlannerAsClient(e.target.checked)}
                        className="w-4 h-4 rounded border-[#C2B280] text-[#0B1B3D] focus:ring-indigo-500"
                      />
                      <label htmlFor="editSavePlannerAsClient" className="text-xs text-[#0B1B3D] dark:text-blue-300 font-medium cursor-pointer">
                        Cadastrar cerimonialista
                      </label>
                    </div>

                    {/* DYNAMIC REAL-TIME BALANCE SHEET PREVIEW IN POPUP */}
                    <div className="p-3 bg-[#FAF7F0] dark:bg-zinc-800/40 rounded-xl flex items-center justify-between text-xs border border-[#C2B280]/20">
                      <div className="flex items-center gap-1 text-[#0B1B3D] dark:text-blue-300">
                        <Info className="w-3.5 h-3.5 text-[#C2B280]" />
                        <span className="font-bold">Balanço do Pacote (Resta Pagar):</span>
                      </div>
                      <span className={`font-mono font-bold text-sm ${
                        (parseFloat(editPackageValue) || 0) - editPayments.reduce((sum, p) => sum + (p.value || 0), 0) > 0
                          ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                          : 'text-[#0B1B3D] dark:text-[#C2B280]'
                      }`}>
                        {formatCurrency(
                          (parseFloat(editPackageValue) || 0) - editPayments.reduce((sum, p) => sum + (p.value || 0), 0)
                        )}
                      </span>
                    </div>
                  </fieldset>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Edit Date */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Data do Atendimento
                    </label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  {/* Edit Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Horário de Início
                    </label>
                    <input
                      type="time"
                      required
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>

                  {/* Edit End Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Horário de Término
                    </label>
                    <input
                      type="time"
                      value={editEndTime}
                      onChange={(e) => setEditEndTime(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                {/* SEÇÃO FINANCEIRA UNIVERSAL DO AGENDAMENTO (EDIT) */}
                <fieldset className="p-4 border border-indigo-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/20 rounded-2xl space-y-4">
                  <legend className="text-xs font-bold text-indigo-500 px-2 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    <span>Controle Financeiro</span>
                  </legend>

                  {/* Valor Cobrado */}
                  <div className="max-w-xs">
                    <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                      Valor Total Cobrado (R$) {editService === 'Noiva' && '(Ficha)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      disabled={editService === 'Noiva'}
                      value={editService === 'Noiva' ? editPackageValue : editValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (editService === 'Noiva') {
                          setEditPackageValue(val);
                        } else {
                          setEditValue(val);
                        }
                      }}
                      placeholder="Ex: 320.00"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-mono text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60"
                    />
                  </div>

                  {/* Histórico de Pagamentos */}
                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                        Histórico de Pagamentos ({editPayments.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setEditPayments([
                            ...editPayments,
                            { id: Date.now().toString(), value: 0, date: editDate || new Date().toISOString().split('T')[0] }
                          ]);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border border-indigo-200 dark:border-zinc-800 rounded-lg flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Pagamento</span>
                      </button>
                    </div>

                    {editPayments.length === 0 ? (
                      <p className="text-xs text-gray-400 dark:text-zinc-500 italic py-1">Nenhum pagamento registrado.</p>
                    ) : (
                      <div className="space-y-2">
                        {editPayments.map((pmt, idx) => (
                          <div key={pmt.id} className="flex items-center gap-2.5 p-2 bg-white dark:bg-zinc-900/60 border border-slate-100 dark:border-zinc-800 rounded-xl shadow-xs">
                            <span className="text-[11px] font-bold text-indigo-500 w-8 shrink-0">
                              #{idx + 1}
                            </span>
                            
                            <div className="grid grid-cols-2 gap-2 flex-1">
                              {/* Valor */}
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 mb-0.5">
                                  Valor Pago (R$)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={pmt.value || ''}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setEditPayments(editPayments.map(p => p.id === pmt.id ? { ...p, value: val } : p));
                                  }}
                                  placeholder="Ex: 500"
                                  className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs font-mono text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>

                              {/* Data Pago */}
                              <div>
                                <label className="block text-[9px] font-bold text-gray-400 dark:text-zinc-500 mb-0.5">
                                  Data de Pagamento
                                </label>
                                <input
                                  type="date"
                                  value={pmt.date}
                                  onChange={(e) => {
                                    setEditPayments(editPayments.map(p => p.id === pmt.id ? { ...p, date: e.target.value } : p));
                                  }}
                                  className="w-full px-2 py-1 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                />
                              </div>
                            </div>

                            {/* Deletar parcela */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditPayments(editPayments.filter(p => p.id !== pmt.id));
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all active:scale-95 self-end mb-0.5"
                              title="Remover este pagamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    {/* Real-time balance status */}
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-gray-500 dark:text-gray-400">Resta pagar:</span>
                      <span className={`font-mono font-bold ${
                        (parseFloat(editService === 'Noiva' ? editPackageValue : editValue) || 0) - editPayments.reduce((sum, p) => sum + (p.value || 0), 0) > 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {formatCurrency(
                          (parseFloat(editService === 'Noiva' ? editPackageValue : editValue) || 0) - editPayments.reduce((sum, p) => sum + (p.value || 0), 0)
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleQuickSavePayments}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-semibold rounded-xl shadow-sm flex items-center gap-1 transition-all"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Salvar Valores Rapidamente</span>
                    </button>
                  </div>
                </fieldset>

                {/* Edit Presence Status */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Presença / Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AppointmentStatus)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100 font-medium"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Realizado">Realizado</option>
                    <option value="Falta">Falta</option>
                  </select>
                </div>

                {/* EDIT INCLUDED SERVICES (Serviços Adicionais no Edição) */}
                <div className="p-4 bg-slate-50 dark:bg-zinc-800/20 rounded-2xl border border-slate-100 dark:border-zinc-800 space-y-3">
                  <label className="block text-xs font-bold text-gray-700 dark:text-zinc-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Serviços Adicionais Inclusos</span>
                  </label>
                  
                  <div className="flex gap-2">
                    <select
                      value={editSelectedServiceToAdd}
                      onChange={(e) => setEditSelectedServiceToAdd(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-gray-900 dark:text-zinc-100"
                    >
                      <option value="">Selecione um serviço para adicionar...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({formatCurrency(s.cost)})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!editSelectedServiceToAdd) return;
                        if (editIncludedServiceIds.includes(editSelectedServiceToAdd)) {
                          alert('Este serviço já foi adicionado.');
                          return;
                        }
                        setEditIncludedServiceIds([...editIncludedServiceIds, editSelectedServiceToAdd]);
                        setEditSelectedServiceToAdd('');
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs transition-all active:scale-95"
                    >
                      + Adicionar
                    </button>
                  </div>

                  {editIncludedServiceIds.length > 0 ? (
                    <div className="space-y-1.5 pt-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Serviços adicionados:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {editIncludedServiceIds.map((sid) => {
                          const s = services.find(item => item.id === sid);
                          if (!s) return null;
                          return (
                            <div
                              key={sid}
                              className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg text-xs font-medium text-gray-700 dark:text-zinc-200"
                            >
                              <span>{s.name}</span>
                              <span className="font-bold text-indigo-500">{formatCurrency(s.cost)}</span>
                              <button
                                type="button"
                                onClick={() => setEditIncludedServiceIds(editIncludedServiceIds.filter(id => id !== sid))}
                                className="p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-500 rounded-md transition-colors"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                        Adicional de Serviços: +{formatCurrency(
                          editIncludedServiceIds.reduce((sum, sid) => {
                            const s = services.find(item => item.id === sid);
                            return sum + (s ? s.cost : 0);
                          }, 0)
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-400 italic">Nenhum serviço adicional incluído ainda.</p>
                  )}
                </div>

                {/* Edit Notes */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Notas de Sessão / Observações
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Ex: Alergias, preferências de batom..."
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-gray-900 dark:text-zinc-100"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/60 mt-6 shrink-0">
                  {/* Delete button inside Details Modal */}
                  <button
                    type="button"
                    onClick={() => {
                      if (deleteModalConfirm) {
                        deleteAppointment(selectedApp.id);
                        setIsDetailsModalOpen(false);
                        setDeleteModalConfirm(false);
                      } else {
                        setDeleteModalConfirm(true);
                        setTimeout(() => setDeleteModalConfirm(false), 3500);
                      }
                    }}
                    className={`px-4 py-2 text-xs md:text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all duration-200 ${
                      deleteModalConfirm
                        ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                        : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deleteModalConfirm ? 'Confirmar Exclusão?' : 'Excluir Agendamento'}</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDetailsModalOpen(false)}
                      className="px-4 py-2 text-xs md:text-sm text-gray-500 hover:text-gray-700 font-medium rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs md:text-sm font-medium rounded-xl shadow-sm"
                    >
                      Salvar Alterações
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

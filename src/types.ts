/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  notes: string;
  createdAt: string;
  category?: 'clientes' | 'cerimonialistas' | 'terceiros';
}

export type AppointmentStatus = 'Realizado' | 'Falta' | 'Pendente';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: 'master' | 'comum';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  bgColor: string; // e.g., "#0B1B3D", "#8B5A2B", "#C2B280"
}

export interface Service {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface PaymentRecord {
  id: string;
  value: number;
  date: string; // YYYY-MM-DD
}

export interface Appointment {
  id: string;
  clientId: string; // Linked patient
  patientName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  value: number;
  notes: string;
  createdAt: string;
  
  // Custom newly requested fields
  contact?: string;
  service?: string; // "Noiva", "Maquiagem", "Cabelo", etc. Or a customized Product name
  packageValue?: number;
  partyLocation?: string;
  ceremonyPlannerName?: string;
  ceremonyPlannerPhone?: string;
  downpaymentValue?: number;
  postpaymentValue?: number;
  payments?: PaymentRecord[]; // Up to 3 payments (value and date)
  includedServiceIds?: string[]; // IDs of services added to this agendamento
  includedServices?: { serviceId: string; customCost: number }[]; // Custom-priced services added to this agendamento
  endTime?: string; // HH:MM end time
}

export type TransactionType = 'Receita' | 'Despesa';
export type TransactionStatus = 'Pago' | 'Pendente';

export interface Transaction {
  id: string;
  description: string;
  date: string; // YYYY-MM-DD
  category: string;
  value: number;
  type: TransactionType;
  status: TransactionStatus;
  appointmentId?: string; // Optional link to appointment
  clientId?: string;      // Optional link to client (essential for billing balance math)
  createdAt: string;
}

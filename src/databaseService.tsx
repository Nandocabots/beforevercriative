/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Client, Appointment, Transaction, User, Product, Service } from './types';

// Initial Seed Data for Be Forever Criative
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Camila Vasconcellos',
    email: 'camila.v@luxurymail.com',
    phone: '(11) 98765-4321',
    birthDate: '1992-05-14',
    notes: 'Prefere fotos externas, iluminação natural de fim de tarde. Foco em branding profissional.',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Bruno Alencar',
    email: 'bruno.alencar@outlook.com',
    phone: '(11) 99122-3344',
    birthDate: '1985-11-23',
    notes: 'Acompanhamento mensal de stories para consultoria financeira. Prefere tom sóbrio e minimalista.',
    createdAt: '2026-06-02T11:00:00Z',
  },
  {
    id: 'c3',
    name: 'Amanda Rodrigues',
    email: 'amanda.rodrigues@gmail.com',
    phone: '(21) 98144-5566',
    birthDate: '1995-09-02',
    notes: 'Fotos de estúdio para marca de moda autoral. Necessita de entrega expressa em 48h.',
    createdAt: '2026-06-03T12:00:00Z',
  },
  {
    id: 'c4',
    name: 'Diogo Santos',
    email: 'diogo.santos@terra.com.br',
    phone: '(11) 97555-8899',
    birthDate: '1980-03-30',
    notes: 'Gravação de conteúdo técnico de fisioterapia para Reels e Stories.',
    createdAt: '2026-06-04T13:00:00Z',
  },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    clientId: 'c1',
    patientName: 'Camila Vasconcellos',
    date: '2026-06-15',
    time: '14:00',
    status: 'Realizado',
    value: 350.00,
    notes: 'Sessão de fotos corporativas ao ar livre completada com sucesso.',
    createdAt: '2026-06-15T09:00:00Z',
    service: 'Ensaios Fotográficos',
    includedServiceIds: ['s2'],
  },
  {
    id: 'a2',
    clientId: 'c1',
    patientName: 'Camila Vasconcellos',
    date: '2026-06-22',
    time: '10:30',
    status: 'Realizado',
    value: 250.00,
    notes: 'Design de 15 templates personalizados de stories de alto engajamento.',
    createdAt: '2026-06-22T08:00:00Z',
    service: 'Acompanhamento de Stories',
    includedServiceIds: ['s4'],
  },
  {
    id: 'a3',
    clientId: 'c1',
    patientName: 'Camila Vasconcellos',
    date: '2026-07-02',
    time: '15:00',
    status: 'Pendente',
    value: 200.00,
    notes: 'Reunião de alinhamento estratégico para o feed do próximo mês.',
    createdAt: '2026-06-28T14:30:00Z',
    service: 'Acompanhamento de Stories',
    includedServiceIds: [],
  },
  {
    id: 'a4',
    clientId: 'c2',
    patientName: 'Bruno Alencar',
    date: '2026-06-18',
    time: '16:00',
    status: 'Realizado',
    value: 320.00,
    notes: 'Direção e captação de vídeo para lançamento de infoproduto.',
    createdAt: '2026-06-18T10:00:00Z',
    service: 'Produção de Reels',
    includedServiceIds: ['s1'],
  },
  {
    id: 'a5',
    clientId: 'c2',
    patientName: 'Bruno Alencar',
    date: '2026-06-25',
    time: '09:00',
    status: 'Falta',
    value: 180.00,
    notes: 'Cliente solicitou adiamento por imprevisto profissional. Cobrada taxa de reagendamento.',
    createdAt: '2026-06-24T18:00:00Z',
    service: 'Produção de Reels',
    includedServiceIds: [],
  },
  {
    id: 'a6',
    clientId: 'c3',
    patientName: 'Amanda Rodrigues',
    date: '2026-06-20',
    time: '11:00',
    status: 'Realizado',
    value: 400.00,
    notes: 'Sessão completa de fotos de produtos em estúdio climatizado.',
    createdAt: '2026-06-20T08:30:00Z',
    service: 'Ensaios Fotográficos',
    includedServiceIds: ['s2'],
  },
  {
    id: 'a7',
    clientId: 'c3',
    patientName: 'Amanda Rodrigues',
    date: '2026-07-01',
    time: '14:00',
    status: 'Pendente',
    value: 320.00,
    notes: 'Sessão de fotos adicionais para feed de lançamento.',
    createdAt: '2026-06-29T10:15:00Z',
    service: 'Ensaios Fotográficos',
    includedServiceIds: ['s2'],
  },
  {
    id: 'a8',
    clientId: 'c4',
    patientName: 'Diogo Santos',
    date: '2026-06-24',
    time: '17:00',
    status: 'Realizado',
    value: 450.00,
    notes: 'Gravação e montagem de 5 Reels dinâmicos de alta conversão.',
    createdAt: '2026-06-24T15:00:00Z',
    service: 'Produção de Reels',
    includedServiceIds: ['s1'],
  },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    description: 'Atendimento - Camila Vasconcellos',
    date: '2026-06-15',
    category: 'Produção Digital',
    value: 350.00,
    type: 'Receita',
    status: 'Pago',
    appointmentId: 'a1',
    clientId: 'c1',
    createdAt: '2026-06-15T15:00:00Z',
  },
  {
    id: 't2',
    description: 'Atendimento - Bruno Alencar',
    date: '2026-06-20',
    category: 'Produção Digital',
    value: 500.00,
    type: 'Receita',
    status: 'Pago',
    clientId: 'c2',
    createdAt: '2026-06-20T17:30:00Z',
  },
  {
    id: 't3',
    description: 'Atendimento - Amanda Rodrigues',
    date: '2026-06-20',
    category: 'Produção Digital',
    value: 400.00,
    type: 'Receita',
    status: 'Pago',
    appointmentId: 'a6',
    clientId: 'c3',
    createdAt: '2026-06-20T12:30:00Z',
  },
  {
    id: 't4',
    description: 'Atendimento - Diogo Santos',
    date: '2026-06-24',
    category: 'Produção Digital',
    value: 200.00,
    type: 'Receita',
    status: 'Pago',
    appointmentId: 'a8',
    clientId: 'c4',
    createdAt: '2026-06-24T18:30:00Z',
  },
  {
    id: 't5',
    description: 'Aluguel do Estúdio Fotográfico (Mensal)',
    date: '2026-06-05',
    category: 'Infraestrutura',
    value: 1800.00,
    type: 'Despesa',
    status: 'Pago',
    createdAt: '2026-06-05T09:00:00Z',
  },
  {
    id: 't6',
    description: 'Equipamento de Iluminação (Softbox, Tripés)',
    date: '2026-06-10',
    category: 'Equipamentos',
    value: 420.00,
    type: 'Despesa',
    status: 'Pago',
    createdAt: '2026-06-10T11:45:00Z',
  },
  {
    id: 't7',
    description: 'Assinatura Creative Cloud (Photoshop, Premiere)',
    date: '2026-06-12',
    category: 'Software / Ferramentas',
    value: 290.00,
    type: 'Despesa',
    status: 'Pago',
    createdAt: '2026-06-12T14:20:00Z',
  },
  {
    id: 't8',
    description: 'Cartão de Memória SanDisk Extreme Pro 128GB',
    date: '2026-06-28',
    category: 'Acessórios',
    value: 120.00,
    type: 'Despesa',
    status: 'Pendente',
    createdAt: '2026-06-28T16:00:00Z',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p0', name: 'Noiva', description: 'Atendimento especial completo para noivas (com ficha de cerimonial, local da festa, etc.)', bgColor: '#C2B280' },
  { id: 'p1', name: 'Ensaios Fotográficos', description: 'Direção, captação e tratamento de imagem profissional', bgColor: '#0B1B3D' },
  { id: 'p2', name: 'Acompanhamento de Stories', description: 'Consultoria diária, roteiros e acompanhamento de engajamento', bgColor: '#8B5A2B' },
  { id: 'p3', name: 'Produção de Reels', description: 'Captação, edição de vídeo, escolha de áudio e roteirização', bgColor: '#2B6CB0' },
  { id: 'p4', name: 'Identidade Visual & Design', description: 'Branding, capas de destaques, posts para feed e fontes autorais', bgColor: '#4A5568' }
];

const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Roteiro Adicional para Reels', description: 'Script completo estruturado com gancho e chamada para ação', cost: 50 },
  { id: 's2', name: 'Edição de Foto Extra', description: 'Tratamento de cor e retoques avançados por imagem', cost: 30 },
  { id: 's3', name: 'Filtro de Instagram Exclusivo', description: 'Criação de filtro Spark AR personalizado para a marca', cost: 250 },
  { id: 's4', name: 'Design de Capa de Destaques', description: 'Ícones personalizados alinhados ao branding', cost: 25 }
];

const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'Fernanda.botelho', password: '1705', role: 'master' },
  { id: 'u2', username: 'Atendente', password: '123', role: 'comum' }
];

interface DatabaseContextType {
  clients: Client[];
  appointments: Appointment[];
  transactions: Transaction[];
  products: Product[];
  services: Service[];
  users: User[];
  currentUser: User | null;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (appointment: Appointment) => void;
  deleteAppointment: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  registerClientPayment: (clientId: string, amount: number, description: string) => void;
  
  // Products, Services, Users operations
  addProduct: (product: Omit<Product, 'id'>) => Product;
  deleteProduct: (id: string) => void;
  addServiceItem: (service: Omit<Service, 'id'>) => Service;
  deleteServiceItem: (id: string) => void;
  addUser: (user: Omit<User, 'id'>) => User;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const storedClients = localStorage.getItem('spa_clients');
    const storedAppointments = localStorage.getItem('spa_appointments');
    const storedTransactions = localStorage.getItem('spa_transactions');
    const storedProducts = localStorage.getItem('spa_products');
    const storedServices = localStorage.getItem('spa_services');
    const storedUsers = localStorage.getItem('spa_users');
    const storedCurrentUser = localStorage.getItem('spa_current_user');

    let shouldResetToCreative = false;
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        if (parsedProducts.some((p: any) => p.name === 'Maquiagem' || p.name === 'Limpeza de Pele')) {
          shouldResetToCreative = true;
        } else {
          // Soft-migration: if they have creative agency data but Noiva is missing, inject it
          if (!parsedProducts.some((p: any) => p.name === 'Noiva')) {
            const updatedProducts = [
              { id: 'p0', name: 'Noiva', description: 'Atendimento especial completo para noivas (com ficha de cerimonial, local da festa, etc.)', bgColor: '#C2B280' },
              ...parsedProducts
            ];
            localStorage.setItem('spa_products', JSON.stringify(updatedProducts));
          }
        }
      } catch (e) {
        shouldResetToCreative = true;
      }
    }

    if (shouldResetToCreative) {
      // Perform automated upgrade migration to Be Forever Criative data
      setClients(INITIAL_CLIENTS);
      setAppointments(INITIAL_APPOINTMENTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setProducts(INITIAL_PRODUCTS);
      setServices(INITIAL_SERVICES);
      setUsers(INITIAL_USERS);

      localStorage.setItem('spa_clients', JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem('spa_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      localStorage.setItem('spa_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('spa_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('spa_services', JSON.stringify(INITIAL_SERVICES));
      localStorage.setItem('spa_users', JSON.stringify(INITIAL_USERS));
    } else {
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      } else {
        setClients(INITIAL_CLIENTS);
        localStorage.setItem('spa_clients', JSON.stringify(INITIAL_CLIENTS));
      }

      if (storedAppointments) {
        try {
          const loaded = JSON.parse(storedAppointments);
          let needsMigration = false;
          const migrated = loaded.map((app: any) => {
            if (!app.service) {
              needsMigration = true;
              if (app.id === 'a1') return { ...app, service: 'Ensaios Fotográficos', includedServiceIds: ['s2'] };
              if (app.id === 'a2') return { ...app, service: 'Acompanhamento de Stories', includedServiceIds: ['s4'] };
              if (app.id === 'a3') return { ...app, service: 'Acompanhamento de Stories', includedServiceIds: [] };
              if (app.id === 'a4') return { ...app, service: 'Produção de Reels', includedServiceIds: ['s1'] };
              if (app.id === 'a5') return { ...app, service: 'Produção de Reels', includedServiceIds: [] };
              if (app.id === 'a6') return { ...app, service: 'Ensaios Fotográficos', includedServiceIds: ['s2'] };
              if (app.id === 'a7') return { ...app, service: 'Ensaios Fotográficos', includedServiceIds: ['s2'] };
              if (app.id === 'a8') return { ...app, service: 'Produção de Reels', includedServiceIds: ['s1'] };
              return { ...app, service: 'Ensaios Fotográficos', includedServiceIds: [] };
            }
            return app;
          });
          if (needsMigration) {
            setAppointments(migrated);
            localStorage.setItem('spa_appointments', JSON.stringify(migrated));
          } else {
            setAppointments(loaded);
          }
        } catch (e) {
          setAppointments(INITIAL_APPOINTMENTS);
          localStorage.setItem('spa_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
        }
      } else {
        setAppointments(INITIAL_APPOINTMENTS);
        localStorage.setItem('spa_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      }

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions(INITIAL_TRANSACTIONS);
        localStorage.setItem('spa_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      }

      if (storedProducts) {
        const currentProducts = localStorage.getItem('spa_products') || storedProducts;
        setProducts(JSON.parse(currentProducts));
      } else {
        setProducts(INITIAL_PRODUCTS);
        localStorage.setItem('spa_products', JSON.stringify(INITIAL_PRODUCTS));
      }

      if (storedServices) {
        setServices(JSON.parse(storedServices));
      } else {
        setServices(INITIAL_SERVICES);
        localStorage.setItem('spa_services', JSON.stringify(INITIAL_SERVICES));
      }

      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      } else {
        setUsers(INITIAL_USERS);
        localStorage.setItem('spa_users', JSON.stringify(INITIAL_USERS));
      }
    }

    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
  }, []);

  // Sync to localStorage helpers
  const saveClientsToStore = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem('spa_clients', JSON.stringify(newClients));
  };

  const saveAppointmentsToStore = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem('spa_appointments', JSON.stringify(newAppointments));
  };

  const saveTransactionsToStore = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    localStorage.setItem('spa_transactions', JSON.stringify(newTransactions));
  };

  const saveProductsToStore = (newProducts: Product[]) => {
    setProducts(newProducts);
    localStorage.setItem('spa_products', JSON.stringify(newProducts));
  };

  const saveServicesToStore = (newServices: Service[]) => {
    setServices(newServices);
    localStorage.setItem('spa_services', JSON.stringify(newServices));
  };

  const saveUsersToStore = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('spa_users', JSON.stringify(newUsers));
  };

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: 'c_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...clients, newClient];
    saveClientsToStore(updated);
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    const updated = clients.map((c) => (c.id === updatedClient.id ? updatedClient : c));
    saveClientsToStore(updated);

    // Also update patientName in existing appointments if name was changed
    const updatedAppointments = appointments.map((app) => {
      if (app.clientId === updatedClient.id) {
        return { ...app, patientName: updatedClient.name };
      }
      return app;
    });
    if (JSON.stringify(appointments) !== JSON.stringify(updatedAppointments)) {
      saveAppointmentsToStore(updatedAppointments);
    }
  };

  const deleteClient = (id: string) => {
    const updated = clients.filter((c) => c.id !== id);
    saveClientsToStore(updated);
  };

  // Appointment operations
  const addAppointment = (appData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newApp: Appointment = {
      ...appData,
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...appointments, newApp];
    saveAppointmentsToStore(updated);
    return newApp;
  };

  const updateAppointment = (updatedApp: Appointment) => {
    const updated = appointments.map((app) => (app.id === updatedApp.id ? updatedApp : app));
    saveAppointmentsToStore(updated);
  };

  const deleteAppointment = (id: string) => {
    const updated = appointments.filter((app) => app.id !== id);
    saveAppointmentsToStore(updated);
  };

  // Transaction operations
  const addTransaction = (transData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newTrans: Transaction = {
      ...transData,
      id: 't_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    const updated = [...transactions, newTrans];
    saveTransactionsToStore(updated);
    return newTrans;
  };

  const updateTransaction = (updatedTrans: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTrans.id ? updatedTrans : t));
    saveTransactionsToStore(updated);
  };

  const deleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    saveTransactionsToStore(updated);
  };

  // Quick register client payment
  const registerClientPayment = (clientId: string, amount: number, description: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    addTransaction({
      description,
      date: new Date().toISOString().split('T')[0],
      category: 'Sessões de Spa',
      value: amount,
      type: 'Receita',
      status: 'Pago',
      clientId: clientId,
    });
  };

  // Product operations
  const addProduct = (pData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...pData,
      id: 'p_' + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...products, newProduct];
    saveProductsToStore(updated);
    return newProduct;
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProductsToStore(updated);
  };

  // Service item operations
  const addServiceItem = (sData: Omit<Service, 'id'>): Service => {
    const newService: Service = {
      ...sData,
      id: 's_' + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...services, newService];
    saveServicesToStore(updated);
    return newService;
  };

  const deleteServiceItem = (id: string) => {
    const updated = services.filter((s) => s.id !== id);
    saveServicesToStore(updated);
  };

  // User operations
  const addUser = (uData: Omit<User, 'id'>): User => {
    const newUser: User = {
      ...uData,
      id: 'u_' + Math.random().toString(36).substr(2, 9),
    };
    const updated = [...users, newUser];
    saveUsersToStore(updated);
    return newUser;
  };

  const updateUser = (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    saveUsersToStore(updated);
    
    // If the master user edits their own profile/password, keep their session updated
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('spa_current_user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    saveUsersToStore(updated);
  };

  // Simple Auth
  const login = (username: string, password: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('spa_current_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('spa_current_user');
  };

  return (
    <DatabaseContext.Provider
      value={{
        clients,
        appointments,
        transactions,
        products,
        services,
        users,
        currentUser,
        addClient,
        updateClient,
        deleteClient,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        registerClientPayment,
        addProduct,
        deleteProduct,
        addServiceItem,
        deleteServiceItem,
        addUser,
        updateUser,
        deleteUser,
        login,
        logout,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}

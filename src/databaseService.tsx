/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Client, Appointment, Transaction, User, Product, Service } from './types';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => typeof item === 'object' ? cleanUndefined(item) : item).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const newObj: any = {};
    Object.keys(obj).forEach((key) => {
      const val = cleanUndefined(obj[key]);
      if (val !== undefined) {
        newObj[key] = val;
      }
    });
    return newObj;
  }
  return obj;
}


// Initial Seed Data for Be Forever Criative
const INITIAL_CLIENTS: Client[] = [];

const INITIAL_APPOINTMENTS: Appointment[] = [];

const INITIAL_TRANSACTIONS: Transaction[] = [];

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
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addServiceItem: (service: Omit<Service, 'id'>) => Service;
  updateServiceItem: (service: Service) => void;
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

  // Load from localStorage for currentUser on mount, and subscribe to Firestore collections
  useEffect(() => {
    const storedCurrentUser = localStorage.getItem('spa_current_user');
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }

    // 1. Clients
    const unsubscribeClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      const list: Client[] = [];
      const mockIds = ['c1', 'c2', 'c3', 'c4'];
      snapshot.forEach((snapshotDoc) => {
        const id = snapshotDoc.id;
        if (mockIds.includes(id)) {
          deleteDoc(doc(db, 'clients', id)).catch(err => console.error("Error deleting mock client", err));
        } else {
          list.push({ id, ...snapshotDoc.data() } as Client);
        }
      });
      setClients(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'clients');
    });

    // 2. Appointments
    const unsubscribeAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const list: Appointment[] = [];
      const mockIds = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
      snapshot.forEach((snapshotDoc) => {
        const id = snapshotDoc.id;
        if (mockIds.includes(id)) {
          deleteDoc(doc(db, 'appointments', id)).catch(err => console.error("Error deleting mock appointment", err));
        } else {
          list.push({ id, ...snapshotDoc.data() } as Appointment);
        }
      });
      setAppointments(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'appointments');
    });

    // 3. Transactions
    const unsubscribeTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      if (list.length === 0) {
        INITIAL_TRANSACTIONS.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'transactions', item.id), item);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `transactions/${item.id}`);
          }
        });
      } else {
        setTransactions(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'transactions');
    });

    // 4. Products
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Product);
      });
      if (list.length === 0) {
        INITIAL_PRODUCTS.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'products', item.id), item);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `products/${item.id}`);
          }
        });
      } else {
        setProducts(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    // 5. Services
    const unsubscribeServices = onSnapshot(collection(db, 'services'), (snapshot) => {
      const list: Service[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Service);
      });
      if (list.length === 0) {
        INITIAL_SERVICES.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'services', item.id), item);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `services/${item.id}`);
          }
        });
      } else {
        setServices(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'services');
    });

    // 6. Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as User);
      });
      if (list.length === 0) {
        INITIAL_USERS.forEach(async (item) => {
          try {
            await setDoc(doc(db, 'users', item.id), item);
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${item.id}`);
          }
        });
      } else {
        setUsers(list);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => {
      unsubscribeClients();
      unsubscribeAppointments();
      unsubscribeTransactions();
      unsubscribeProducts();
      unsubscribeServices();
      unsubscribeUsers();
    };
  }, []);

  // Client operations
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newId = 'c_' + Math.random().toString(36).substr(2, 9);
    const newClient: Client = {
      ...clientData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    try {
      setDoc(doc(db, 'clients', newId), cleanUndefined(newClient));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${newId}`);
    }
    return newClient;
  };

  const updateClient = (updatedClient: Client) => {
    try {
      setDoc(doc(db, 'clients', updatedClient.id), cleanUndefined(updatedClient));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${updatedClient.id}`);
    }

    // Also update patientName in existing appointments if name was changed
    appointments.forEach((app) => {
      if (app.clientId === updatedClient.id && app.patientName !== updatedClient.name) {
        try {
          setDoc(doc(db, 'appointments', app.id), cleanUndefined({ ...app, patientName: updatedClient.name }));
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `appointments/${app.id}`);
        }
      }
    });
  };

  const deleteClient = (id: string) => {
    try {
      deleteDoc(doc(db, 'clients', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${id}`);
    }
  };

  // Appointment operations
  const addAppointment = (appData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newId = 'a_' + Math.random().toString(36).substr(2, 9);
    const newApp: Appointment = {
      ...appData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    try {
      setDoc(doc(db, 'appointments', newId), cleanUndefined(newApp));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${newId}`);
    }
    return newApp;
  };

  const updateAppointment = (updatedApp: Appointment) => {
    try {
      setDoc(doc(db, 'appointments', updatedApp.id), cleanUndefined(updatedApp));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `appointments/${updatedApp.id}`);
    }
  };

  const deleteAppointment = (id: string) => {
    try {
      deleteDoc(doc(db, 'appointments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `appointments/${id}`);
    }
  };

  // Transaction operations
  const addTransaction = (transData: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const newId = 't_' + Math.random().toString(36).substr(2, 9);
    const newTrans: Transaction = {
      ...transData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    try {
      setDoc(doc(db, 'transactions', newId), cleanUndefined(newTrans));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `transactions/${newId}`);
    }
    return newTrans;
  };

  const updateTransaction = (updatedTrans: Transaction) => {
    try {
      setDoc(doc(db, 'transactions', updatedTrans.id), cleanUndefined(updatedTrans));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `transactions/${updatedTrans.id}`);
    }
  };

  const deleteTransaction = (id: string) => {
    try {
      deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
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
    const newId = 'p_' + Math.random().toString(36).substr(2, 9);
    const newProduct: Product = {
      ...pData,
      id: newId,
    };
    try {
      setDoc(doc(db, 'products', newId), cleanUndefined(newProduct));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${newId}`);
    }
    return newProduct;
  };

  const deleteProduct = (id: string) => {
    try {
      deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateProduct = (updatedProduct: Product) => {
    try {
      setDoc(doc(db, 'products', updatedProduct.id), cleanUndefined(updatedProduct));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${updatedProduct.id}`);
    }
  };

  // Service item operations
  const addServiceItem = (sData: Omit<Service, 'id'>): Service => {
    const newId = 's_' + Math.random().toString(36).substr(2, 9);
    const newService: Service = {
      ...sData,
      id: newId,
    };
    try {
      setDoc(doc(db, 'services', newId), cleanUndefined(newService));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${newId}`);
    }
    return newService;
  };

  const deleteServiceItem = (id: string) => {
    try {
      deleteDoc(doc(db, 'services', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  };

  const updateServiceItem = (updatedService: Service) => {
    try {
      setDoc(doc(db, 'services', updatedService.id), cleanUndefined(updatedService));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${updatedService.id}`);
    }
  };

  // User operations
  const addUser = (uData: Omit<User, 'id'>): User => {
    const newId = 'u_' + Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      ...uData,
      id: newId,
    };
    try {
      setDoc(doc(db, 'users', newId), newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${newId}`);
    }
    return newUser;
  };

  const updateUser = (updatedUser: User) => {
    try {
      setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${updatedUser.id}`);
    }
    if (currentUser && currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
      localStorage.setItem('spa_current_user', JSON.stringify(updatedUser));
    }
  };

  const deleteUser = (id: string) => {
    try {
      deleteDoc(doc(db, 'users', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${id}`);
    }
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
        updateProduct,
        deleteProduct,
        addServiceItem,
        updateServiceItem,
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

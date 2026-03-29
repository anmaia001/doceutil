import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InteractionType =
  | 'oferta'
  | 'pos_venda'
  | 'pedido'
  | 'reclamacao'
  | 'sugestao'
  | 'outro';

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  oferta: '🎯 Oferta de Produto',
  pos_venda: '✅ Pós Venda',
  pedido: '🛒 Pedido Realizado',
  reclamacao: '⚠️ Reclamação',
  sugestao: '💡 Sugestão',
  outro: '💬 Outro',
};

export interface Interaction {
  id: string;
  type: InteractionType;
  date: string;           // ISO string
  note: string;
  products?: string;      // produtos mencionados
  value?: number;         // valor envolvido (opcional)
  followUp?: string;      // data de retorno (opcional)
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  city?: string;
  email?: string;
  note?: string;
  createdAt: string;
  interactions: Interaction[];
}

interface CustomersStore {
  customers: Customer[];
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => string;
  updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'interactions'>>) => void;
  deleteCustomer: (id: string) => void;
  addInteraction: (customerId: string, data: Omit<Interaction, 'id'>) => void;
  updateInteraction: (customerId: string, interactionId: string, data: Partial<Omit<Interaction, 'id'>>) => void;
  deleteInteraction: (customerId: string, interactionId: string) => void;
}

export const useCustomers = create<CustomersStore>()(
  persist(
    (set) => ({
      customers: [] as Customer[],

      addCustomer: (data) => {
        const id = `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newCustomer: Customer = {
          id,
          ...data,
          createdAt: new Date().toISOString(),
          interactions: [],
        };
        set(state => ({ customers: [...state.customers, newCustomer] }));
        return id;
      },

      updateCustomer: (id, data) => {
        set(state => ({
          customers: state.customers.map(c =>
            c.id === id ? { ...c, ...data } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set(state => ({ customers: state.customers.filter(c => c.id !== id) }));
      },

      addInteraction: (customerId, data) => {
        const id = `i_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        set(state => ({
          customers: state.customers.map(c =>
            c.id === customerId
              ? { ...c, interactions: [{ id, ...data }, ...c.interactions] }
              : c
          ),
        }));
      },

      updateInteraction: (customerId, interactionId, data) => {
        set(state => ({
          customers: state.customers.map(c =>
            c.id === customerId
              ? {
                  ...c,
                  interactions: c.interactions.map(i =>
                    i.id === interactionId ? { ...i, ...data } : i
                  ),
                }
              : c
          ),
        }));
      },

      deleteInteraction: (customerId, interactionId) => {
        set(state => ({
          customers: state.customers.map(c =>
            c.id === customerId
              ? { ...c, interactions: c.interactions.filter(i => i.id !== interactionId) }
              : c
          ),
        }));
      },
    }),
    { name: 'doceutil-customers' }
  )
);

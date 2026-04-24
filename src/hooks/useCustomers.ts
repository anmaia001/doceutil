import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

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
  date: string;
  note: string;
  products?: string;
  value?: number;
  followUp?: string;
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

// ─── Helpers de mapeamento ─────────────────────────────────────────────────

const mapRow = (row: Record<string, unknown>): Customer => ({
  id: String(row.id),
  name: String(row.name ?? ''),
  phone: String(row.phone ?? ''),
  address: String(row.address ?? ''),
  city: String(row.city ?? ''),
  email: String(row.email ?? ''),
  note: String(row.note ?? ''),
  createdAt: String(row.created_at ?? new Date().toISOString()),
  interactions: Array.isArray(row.interactions)
    ? (row.interactions as Interaction[])
    : [],
});

// ─── Store ─────────────────────────────────────────────────────────────────

interface CustomersStore {
  customers: Customer[];
  loading: boolean;
  initialized: boolean;
  loadCustomers: () => Promise<void>;
  addCustomer: (data: Omit<Customer, 'id' | 'createdAt' | 'interactions'>) => Promise<string>;
  upsertCustomerFromOrder: (data: {
    name: string;
    phone: string;
    address?: string;
    city?: string;
    products: string;
    total: number;
  }) => Promise<void>;
  updateCustomer: (id: string, data: Partial<Omit<Customer, 'id' | 'interactions'>>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addInteraction: (customerId: string, data: Omit<Interaction, 'id'>) => Promise<void>;
  updateInteraction: (customerId: string, interactionId: string, data: Partial<Omit<Interaction, 'id'>>) => void;
  deleteInteraction: (customerId: string, interactionId: string) => Promise<void>;
}

export const useCustomers = create<CustomersStore>()((set, get) => ({
  customers: [],
  loading: false,
  initialized: false,

  // ── Carregar todos os clientes do Supabase ──────────────────────────────
  loadCustomers: async () => {
    if (get().initialized) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        set({ customers: data.map(mapRow), initialized: true, loading: false });
      } else {
        // Fallback: tentar carregar de orders se tabela customers não existir
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (orders && orders.length > 0) {
          // Deduplica por telefone
          const seen = new Set<string>();
          const deduped = orders.filter(o => {
            const key = o.customer_phone || o.customer_name;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          const mapped: Customer[] = deduped.map(o => ({
            id: String(o.id),
            name: String(o.customer_name ?? ''),
            phone: String(o.customer_phone ?? ''),
            address: `${o.customer_address ?? ''}, ${o.customer_neighborhood ?? ''}, ${o.customer_city ?? ''}`.replace(/^,\s*|,\s*$/g, ''),
            city: String(o.customer_city ?? ''),
            email: '',
            note: 'Importado automaticamente via pedido',
            createdAt: String(o.created_at ?? new Date().toISOString()),
            interactions: [{
              id: `i_${o.id}`,
              type: 'pedido' as InteractionType,
              date: String(o.created_at ?? ''),
              note: `Pedido #${o.id}. Status: ${o.status}`,
              value: Number(o.total ?? 0),
            }],
          }));
          set({ customers: mapped, initialized: true, loading: false });
        } else {
          set({ initialized: true, loading: false });
        }
      }
    } catch {
      set({ initialized: true, loading: false });
    }
  },

  // ── Cadastrar novo cliente manualmente ─────────────────────────────────
  addCustomer: async (data) => {
    const tempId = `c_${Date.now()}`;
    const newCustomer: Customer = {
      id: tempId,
      ...data,
      createdAt: new Date().toISOString(),
      interactions: [],
    };
    set(state => ({ customers: [newCustomer, ...state.customers] }));

    try {
      const { data: inserted } = await supabase
        .from('customers')
        .insert({
          name: data.name,
          phone: data.phone,
          address: data.address ?? '',
          city: data.city ?? '',
          email: data.email ?? '',
          note: data.note ?? '',
          interactions: [],
        })
        .select()
        .single();

      if (inserted) {
        set(state => ({
          customers: state.customers.map(c =>
            c.id === tempId ? { ...c, id: String(inserted.id) } : c
          ),
        }));
        return String(inserted.id);
      }
    } catch { /* continua com id local */ }

    return tempId;
  },

  // ── Cadastro automático ao fazer pedido (upsert por telefone) ──────────
  upsertCustomerFromOrder: async ({ name, phone, address, city, products, total }) => {
    const now = new Date().toISOString();
    const newInteraction: Interaction = {
      id: `i_${Date.now()}`,
      type: 'pedido',
      date: now,
      note: `Pedido via site. Endereço: ${address ?? ''}`,
      products,
      value: total,
    };

    const existing = get().customers.find(
      c => (phone && c.phone === phone) ||
           c.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      // Atualiza interações localmente
      const updatedInteractions = [newInteraction, ...existing.interactions];
      set(state => ({
        customers: state.customers.map(c =>
          c.id === existing.id
            ? { ...c, interactions: updatedInteractions }
            : c
        ),
      }));
      // Persiste no Supabase
      try {
        await supabase
          .from('customers')
          .update({ interactions: updatedInteractions })
          .eq('id', existing.id);
      } catch { /* ignore */ }
    } else {
      // Novo cliente
      const newCustomer: Customer = {
        id: `c_${Date.now()}`,
        name,
        phone: phone ?? '',
        address: address ?? '',
        city: city ?? '',
        email: '',
        note: 'Cadastrado automaticamente via pedido',
        createdAt: now,
        interactions: [newInteraction],
      };
      set(state => ({ customers: [newCustomer, ...state.customers] }));
      // Persiste no Supabase
      try {
        const { data: inserted } = await supabase
          .from('customers')
          .insert({
            name,
            phone: phone ?? '',
            address: address ?? '',
            city: city ?? '',
            email: '',
            note: 'Cadastrado automaticamente via pedido',
            interactions: [newInteraction],
          })
          .select()
          .single();

        if (inserted) {
          set(state => ({
            customers: state.customers.map(c =>
              c.id === newCustomer.id ? { ...c, id: String(inserted.id) } : c
            ),
          }));
        }
      } catch { /* ignore */ }
    }
  },

  // ── Atualizar cliente ──────────────────────────────────────────────────
  updateCustomer: async (id, data) => {
    set(state => ({
      customers: state.customers.map(c => c.id === id ? { ...c, ...data } : c),
    }));
    try {
      await supabase.from('customers').update({
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        email: data.email,
        note: data.note,
      }).eq('id', id);
    } catch { /* ignore */ }
  },

  // ── Excluir cliente ────────────────────────────────────────────────────
  deleteCustomer: async (id) => {
    set(state => ({ customers: state.customers.filter(c => c.id !== id) }));
    try {
      await supabase.from('customers').delete().eq('id', id);
    } catch { /* ignore */ }
  },

  // ── Adicionar interação ────────────────────────────────────────────────
  addInteraction: async (customerId, data) => {
    const id = `i_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const interaction = { id, ...data };

    set(state => ({
      customers: state.customers.map(c =>
        c.id === customerId
          ? { ...c, interactions: [interaction, ...c.interactions] }
          : c
      ),
    }));

    try {
      const customer = get().customers.find(c => c.id === customerId);
      if (customer) {
        await supabase
          .from('customers')
          .update({ interactions: customer.interactions })
          .eq('id', customerId);
      }
    } catch { /* ignore */ }
  },

  updateInteraction: (customerId, interactionId, data) => {
    set(state => ({
      customers: state.customers.map(c =>
        c.id === customerId
          ? { ...c, interactions: c.interactions.map(i => i.id === interactionId ? { ...i, ...data } : i) }
          : c
      ),
    }));
  },

  deleteInteraction: async (customerId, interactionId) => {
    set(state => ({
      customers: state.customers.map(c =>
        c.id === customerId
          ? { ...c, interactions: c.interactions.filter(i => i.id !== interactionId) }
          : c
      ),
    }));
    try {
      const customer = get().customers.find(c => c.id === customerId);
      if (customer) {
        await supabase
          .from('customers')
          .update({ interactions: customer.interactions })
          .eq('id', customerId);
      }
    } catch { /* ignore */ }
  },
}));

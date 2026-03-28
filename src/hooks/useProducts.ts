import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, products as defaultProducts } from '@/data/products';

interface ProductsStore {
  products: Product[];
  initialized: boolean;
  init: () => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetToDefault: () => void;
}

export const useProducts = create<ProductsStore>()(
  persist(
    (set, get) => ({
      products: defaultProducts,
      initialized: false,

      init: () => {
        if (!get().initialized) {
          set({ products: defaultProducts, initialized: true });
        }
      },

      addProduct: (productData) => {
        const id = `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        const newProduct: Product = { id, ...productData };
        set(state => ({ products: [...state.products, newProduct] }));
      },

      updateProduct: (id, data) => {
        set(state => ({
          products: state.products.map(p => p.id === id ? { ...p, ...data } : p),
        }));
      },

      deleteProduct: (id) => {
        set(state => ({ products: state.products.filter(p => p.id !== id) }));
      },

      resetToDefault: () => {
        set({ products: defaultProducts });
      },
    }),
    {
      name: 'casadoce-products',
    }
  )
);

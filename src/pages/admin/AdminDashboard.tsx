import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag, LogOut, Home, Package, Users, Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import ProductsPanel from './ProductsPanel';
import CRMPage from './CRMPage';

type Tab = 'products' | 'crm';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const { products } = useProducts();
  const { customers } = useCustomers();
  const [activeTab, setActiveTab] = useState<Tab>('products');

  const totalUtilidades = products.filter(p => p.category === 'utilidades').length;
  const totalDoces = products.filter(p => p.category === 'doces').length;
  const totalInteractions = customers.reduce((s, c) => s + c.interactions.length, 0);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'products',
      label: 'Produtos',
      icon: <ShoppingBag size={16} />,
    },
    {
      id: 'crm',
      label: 'CRM Clientes',
      icon: <Users size={16} />,
      badge: customers.length,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-card/95 border-b border-border" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag size={17} className="text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">Doce &amp; Útil</p>
              <p className="text-xs text-muted-foreground">Área Administrativa</p>
            </div>
          </div>

          {/* Tabs (desktop) */}
          <nav className="hidden sm:flex items-center gap-1 bg-muted rounded-xl p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge != null && tab.badge > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Home size={15} />
              <span className="hidden sm:block">Ver Site</span>
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Sair</span>
            </button>
          </div>
        </div>

        {/* Tabs (mobile) */}
        <div className="sm:hidden flex border-t border-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge != null && tab.badge > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center gap-6 text-xs text-muted-foreground overflow-x-auto">
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <ShoppingBag size={13} className="text-primary" />
            <strong className="text-foreground">{products.length}</strong> produtos
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <Package size={13} className="text-blue-500" />
            <strong className="text-foreground">{totalUtilidades}</strong> utilidades
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <Heart size={13} className="text-rose-500" />
            <strong className="text-foreground">{totalDoces}</strong> doces
          </span>
          <span className="w-px h-4 bg-border flex-shrink-0" />
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <Users size={13} className="text-primary" />
            <strong className="text-foreground">{customers.length}</strong> clientes
          </span>
          <span className="flex items-center gap-1.5 flex-shrink-0">
            <motion.div
              animate={{ scale: totalInteractions > 0 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-green-500">●</span>
            </motion.div>
            <strong className="text-foreground">{totalInteractions}</strong> interações
          </span>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'products' ? <ProductsPanel /> : <CRMPage />}
        </motion.div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, LogOut, Package, Heart,
  Search, X, Save, RotateCcw, Home, CheckCircle,
  AlertTriangle, Image as ImageIcon, Tag, DollarSign,
  AlignLeft, ShoppingBag, Star,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { Product } from '@/data/products';
import { formatCurrency } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── Types ─────────────────────────────────────────────
type Category = 'utilidades' | 'doces';
type BadgeOption = '' | 'Mais Vendido' | 'Promoção' | 'Premium' | 'Novidade' | 'Personalizado';

const BADGE_OPTIONS: BadgeOption[] = ['', 'Mais Vendido', 'Promoção', 'Premium', 'Novidade', 'Personalizado'];

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: 'doces' as Category,
  badge: '' as BadgeOption,
  featured: false,
};

// ── Toast ──────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-destructive'
      }`}
    >
      {type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
      {msg}
    </motion.div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────
function ConfirmDialog({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl"
      >
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
          <Trash2 size={22} className="text-destructive" />
        </div>
        <h3 className="font-bold text-foreground text-lg mb-1">Excluir Produto</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Tem certeza que deseja excluir <span className="font-semibold text-foreground">"{product.name}"</span>? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            Excluir
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Product Form Modal ─────────────────────────────────
function ProductFormModal({
  editProduct,
  onClose,
  onSave,
}: {
  editProduct: Product | null;
  onClose: () => void;
  onSave: (data: typeof EMPTY_FORM) => void;
}) {
  const [form, setForm] = useState(
    editProduct
      ? {
          name: editProduct.name,
          description: editProduct.description,
          price: String(editProduct.price),
          image: editProduct.image,
          category: editProduct.category,
          badge: (editProduct.badge ?? '') as BadgeOption,
          featured: editProduct.featured ?? false,
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.description.trim()) e.description = 'Descrição obrigatória';
    const p = parseFloat(form.price.replace(',', '.'));
    if (isNaN(p) || p <= 0) e.price = 'Preço inválido';
    if (!form.image.trim()) e.image = 'URL da imagem obrigatória';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  };

  const field = (key: keyof typeof form, label: string, icon: React.ReactNode, placeholder: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <Input
        placeholder={placeholder}
        value={form[key] as string}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`bg-background ${errors[key] ? 'border-destructive' : ''}`}
        {...extra}
      />
      {errors[key] && <p className="text-xs text-destructive mt-1">{errors[key]}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              {editProduct ? <Pencil size={15} className="text-primary" /> : <Plus size={15} className="text-primary" />}
            </div>
            <h2 className="font-bold text-foreground">
              {editProduct ? 'Editar Produto' : 'Novo Produto'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1">
          <div className="px-6 py-5 flex flex-col gap-4">
            {field('name', 'Nome do Produto', <Package size={12} />, 'Ex: Pote de Doce de Leite 400g')}
            {field('description', 'Descrição', <AlignLeft size={12} />, 'Descreva o produto brevemente...')}

            <div className="grid grid-cols-2 gap-3">
              {/* Price */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={12} /> Preço (R$)
                </label>
                <Input
                  placeholder="Ex: 12.90"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  className={`bg-background ${errors.price ? 'border-destructive' : ''}`}
                />
                {errors.price && <p className="text-xs text-destructive mt-1">{errors.price}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Tag size={12} /> Categoria
                </label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as Category }))}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="utilidades">🏠 Utilidades</option>
                  <option value="doces">🍫 Doces</option>
                </select>
              </div>
            </div>

            {field('image', 'URL da Imagem', <ImageIcon size={12} />, 'https://images.unsplash.com/...')}

            {/* Image preview */}
            {form.image && (
              <div className="relative rounded-xl overflow-hidden border border-border h-32">
                <img
                  src={form.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                  <span className="text-white text-xs font-semibold">Preview</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* Badge */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Star size={12} /> Etiqueta
                </label>
                <select
                  value={form.badge}
                  onChange={e => setForm(f => ({ ...f, badge: e.target.value as BadgeOption }))}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Sem etiqueta</option>
                  {BADGE_OPTIONS.filter(Boolean).map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Featured */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                  <Star size={12} /> Destaque
                </label>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                  className={`w-full h-9 rounded-md border text-sm font-medium transition-all ${
                    form.featured
                      ? 'bg-accent/20 border-accent text-accent-foreground'
                      : 'border-input bg-background text-muted-foreground'
                  }`}
                >
                  {form.featured ? '⭐ Em Destaque' : 'Sem Destaque'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="flex-1 gap-2">
            <Save size={16} />
            {editProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Product Row ────────────────────────────────────────
function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center gap-3 bg-background border border-border rounded-2xl p-3 hover:border-primary/30 transition-colors group"
    >
      {/* Thumb */}
      <img
        src={product.image}
        alt={product.name}
        className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-muted"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
          {product.badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex-shrink-0">
              {product.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{product.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-sm font-bold text-primary">{formatCurrency(product.price)}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            product.category === 'doces'
              ? 'bg-rose-100 text-rose-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {product.category === 'doces' ? '🍫 Doce' : '🏠 Utilidade'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={onEdit}
          className="p-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
          title="Editar"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
          title="Excluir"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

// ── MAIN ADMIN DASHBOARD ───────────────────────────────
export default function AdminDashboard() {
  const { logout } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct, resetToDefault } = useProducts();

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<'all' | 'utilidades' | 'doces'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredProducts = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (form: typeof EMPTY_FORM) => {
    const price = parseFloat(form.price.replace(',', '.'));
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      image: form.image.trim(),
      category: form.category,
      ...(form.badge ? { badge: form.badge } : {}),
      ...(form.featured ? { featured: true } : {}),
    };

    if (editProduct) {
      updateProduct(editProduct.id, data);
      showToast('Produto atualizado com sucesso!');
    } else {
      addProduct(data);
      showToast('Produto adicionado com sucesso!');
    }

    setShowForm(false);
    setEditProduct(null);
  };

  const handleDelete = (product: Product) => {
    setDeleteTarget(product);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    showToast(`"${deleteTarget.name}" excluído com sucesso.`);
    setDeleteTarget(null);
  };

  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const totalUtilidades = products.filter(p => p.category === 'utilidades').length;
  const totalDoces = products.filter(p => p.category === 'doces').length;

  return (
    <div className="min-h-screen bg-background">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* Confirm Dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <ConfirmDialog
            product={deleteTarget}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>

      {/* Product Form Modal */}
      <AnimatePresence>
        {showForm && (
          <ProductFormModal
            editProduct={editProduct}
            onClose={() => { setShowForm(false); setEditProduct(null); }}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <header className="sticky top-0 z-40 bg-card/95 border-b border-border" style={{ backdropFilter: 'blur(12px)' }}>
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag size={17} className="text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-foreground leading-none">Casa&Doce</p>
              <p className="text-xs text-muted-foreground">Área Administrativa</p>
            </div>
          </div>

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
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <ShoppingBag size={20} className="text-primary" />, value: products.length, label: 'Total de Produtos', bg: 'bg-primary/10' },
            { icon: <Package size={20} className="text-blue-600" />, value: totalUtilidades, label: 'Utilidades', bg: 'bg-blue-50' },
            { icon: <Heart size={20} className="text-rose-500" />, value: totalDoces, label: 'Doces', bg: 'bg-rose-50' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3"
            >
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-card"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'utilidades', 'doces'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  filterCat === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat === 'all' ? 'Todos' : cat === 'utilidades' ? '🏠' : '🍫'}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <Button
            onClick={() => { setEditProduct(null); setShowForm(true); }}
            className="gap-2 flex-shrink-0"
          >
            <Plus size={16} />
            Novo Produto
          </Button>
        </div>

        {/* ── PRODUCT LIST ── */}
        <div className="flex flex-col gap-2.5">
          <AnimatePresence mode="popLayout">
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-muted-foreground"
              >
                <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Nenhum produto encontrado</p>
                <p className="text-sm mt-1">
                  {search ? 'Tente uma busca diferente' : 'Adicione o primeiro produto!'}
                </p>
              </motion.div>
            ) : (
              filteredProducts.map(product => (
                <ProductRow
                  key={product.id}
                  product={product}
                  onEdit={() => handleEdit(product)}
                  onDelete={() => handleDelete(product)}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* ── RESET ── */}
        {products.length !== 12 && (
          <div className="mt-8 pt-6 border-t border-border text-center">
            <button
              onClick={() => {
                if (confirm('Isso restaurará todos os produtos padrão. Continuar?')) {
                  resetToDefault();
                  showToast('Catálogo restaurado para o padrão!');
                }
              }}
              className="flex items-center gap-2 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RotateCcw size={14} />
              Restaurar catálogo padrão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

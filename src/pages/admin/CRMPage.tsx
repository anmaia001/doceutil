import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, X, Phone, MapPin, Mail, FileText,
  MessageCircle, Trash2, Pencil, ChevronDown, ChevronUp,
  Calendar, DollarSign, Tag, CheckCircle, AlertTriangle,
  Clock, ShoppingBag, Star, Lightbulb,
} from 'lucide-react';
import { useCustomers, Customer, Interaction, InteractionType, INTERACTION_LABELS } from '@/hooks/useCustomers';
import { formatCurrency } from '@/lib/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });

const TYPE_COLORS: Record<InteractionType, string> = {
  oferta:     'bg-blue-100 text-blue-700 border-blue-200',
  pos_venda:  'bg-green-100 text-green-700 border-green-200',
  pedido:     'bg-primary/10 text-primary border-primary/20',
  reclamacao: 'bg-red-100 text-red-700 border-red-200',
  sugestao:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  outro:      'bg-muted text-muted-foreground border-border',
};

const TYPE_ICONS: Record<InteractionType, React.ReactNode> = {
  oferta:     <Tag size={12} />,
  pos_venda:  <CheckCircle size={12} />,
  pedido:     <ShoppingBag size={12} />,
  reclamacao: <AlertTriangle size={12} />,
  sugestao:   <Lightbulb size={12} />,
  outro:      <MessageCircle size={12} />,
};

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ msg, type }: { msg: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-destructive'
      }`}
    >
      {type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
      {msg}
    </motion.div>
  );
}

// ─── Customer Form Modal ─────────────────────────────────────────────────────
const EMPTY_CUST = { name: '', phone: '', address: '', city: '', email: '', note: '' };

function CustomerModal({
  edit,
  onClose,
  onSave,
}: {
  edit: Customer | null;
  onClose: () => void;
  onSave: (d: typeof EMPTY_CUST) => void;
}) {
  const [form, setForm] = useState(
    edit
      ? { name: edit.name, phone: edit.phone, address: edit.address ?? '', city: edit.city ?? '', email: edit.email ?? '', note: edit.note ?? '' }
      : EMPTY_CUST
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome obrigatório';
    if (!form.phone.trim()) e.phone = 'Telefone obrigatório';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const f = (key: keyof typeof form, label: string, icon: React.ReactNode, placeholder: string) => (
    <div>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">{icon} {label}</label>
      <Input
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`bg-background ${errors[key] ? 'border-destructive' : ''}`}
      />
      {errors[key] && <p className="text-xs text-destructive mt-0.5">{errors[key]}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Users size={16} className="text-primary" />
            {edit ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X size={16} /></button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {f('name',    'Nome Completo', <Users size={12} />,       'Ex: Maria da Silva')}
          {f('phone',   'Telefone / WhatsApp', <Phone size={12} />, '(24) 99999-9999')}
          {f('address', 'Endereço',     <MapPin size={12} />,       'Rua, nº, bairro')}
          {f('city',    'Cidade',       <MapPin size={12} />,       'Ex: Volta Redonda - RJ')}
          {f('email',   'E-mail',       <Mail size={12} />,         'exemplo@email.com')}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> Observações
            </label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Preferências, informações importantes..."
              rows={3}
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => validate() && onSave(form)} className="flex-1 gap-2">
            <CheckCircle size={15} />
            {edit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Interaction Form Modal ───────────────────────────────────────────────────
const EMPTY_INT = { type: 'oferta' as InteractionType, note: '', products: '', value: '', followUp: '' };

function InteractionModal({
  customer,
  editInteraction,
  onClose,
  onSave,
}: {
  customer: Customer;
  editInteraction: Interaction | null;
  onClose: () => void;
  onSave: (d: typeof EMPTY_INT) => void;
}) {
  const [form, setForm] = useState(
    editInteraction
      ? {
          type: editInteraction.type,
          note: editInteraction.note,
          products: editInteraction.products ?? '',
          value: editInteraction.value ? String(editInteraction.value) : '',
          followUp: editInteraction.followUp ?? '',
        }
      : EMPTY_INT
  );
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!form.note.trim()) { setError('Descreva a interação'); return; }
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="bg-card w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-border shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <MessageCircle size={16} className="text-primary" />
              {editInteraction ? 'Editar Interação' : 'Nova Interação'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Cliente: {customer.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {/* Type */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2 block">Tipo de Interação</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(INTERACTION_LABELS) as [InteractionType, string][]).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: k }))}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                    form.type === k
                      ? `${TYPE_COLORS[k]} border-2`
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> Descrição *
            </label>
            <textarea
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="Descreva detalhadamente a interação..."
              rows={4}
              className={`w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none ${
                error ? 'border-destructive' : 'border-input'
              }`}
            />
            {error && <p className="text-xs text-destructive mt-0.5">{error}</p>}
          </div>

          {/* Products */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
              <ShoppingBag size={12} /> Produtos Mencionados
            </label>
            <Input
              value={form.products}
              onChange={e => setForm(f => ({ ...f, products: e.target.value }))}
              placeholder="Ex: Brigadeiro gourmet, Kit panelas..."
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Value */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <DollarSign size={12} /> Valor (R$)
              </label>
              <Input
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="Ex: 89.90"
                className="bg-background"
              />
            </div>

            {/* Follow-up */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} /> Retorno Agendado
              </label>
              <Input
                type="date"
                value={form.followUp}
                onChange={e => setForm(f => ({ ...f, followUp: e.target.value }))}
                className="bg-background"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} className="flex-1 gap-2">
            <CheckCircle size={15} />
            {editInteraction ? 'Salvar' : 'Registrar Interação'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({
  customer,
  onEdit,
  onDelete,
  onAddInteraction,
  onEditInteraction,
  onDeleteInteraction,
}: {
  customer: Customer;
  onEdit: () => void;
  onDelete: () => void;
  onAddInteraction: () => void;
  onEditInteraction: (i: Interaction) => void;
  onDeleteInteraction: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totalValue = customer.interactions.reduce((s, i) => s + (i.value ?? 0), 0);
  const lastInteraction = customer.interactions[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-background border border-border rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold text-lg">
          {customer.name.charAt(0).toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-sm text-foreground">{customer.name}</p>
            {customer.interactions.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {customer.interactions.length} interação{customer.interactions.length > 1 ? 'ões' : ''}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Phone size={10} /> {customer.phone}
            </span>
            {customer.city && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin size={10} /> {customer.city}
              </span>
            )}
            {totalValue > 0 && (
              <span className="text-xs text-green-600 font-semibold">
                Total: {formatCurrency(totalValue)}
              </span>
            )}
          </div>
          {lastInteraction && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Última interação: {fmtDate(lastInteraction.date)}
              {' · '}{INTERACTION_LABELS[lastInteraction.type].replace(/^.+\s/, '')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onAddInteraction}
            title="Nova interação"
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} />
          </button>
          <button onClick={onEdit} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="p-2 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
            <Trash2 size={15} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          >
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {/* Interactions list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3 bg-muted/30">
              {/* Customer details */}
              {(customer.address || customer.email || customer.note) && (
                <div className="flex flex-wrap gap-x-5 gap-y-1 mb-3 text-xs text-muted-foreground">
                  {customer.address && <span><MapPin size={10} className="inline mr-1" />{customer.address}</span>}
                  {customer.email && <span><Mail size={10} className="inline mr-1" />{customer.email}</span>}
                  {customer.note && <span><FileText size={10} className="inline mr-1" />{customer.note}</span>}
                </div>
              )}

              {/* Interactions */}
              {customer.interactions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Nenhuma interação registrada. Clique em <strong>+</strong> para adicionar.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {customer.interactions.map(interaction => (
                    <div
                      key={interaction.id}
                      className="bg-card rounded-xl border border-border p-3 flex gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Type badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-semibold ${TYPE_COLORS[interaction.type]}`}>
                            {TYPE_ICONS[interaction.type]}
                            {INTERACTION_LABELS[interaction.type].replace(/^.+\s/, '')}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {fmtDateTime(interaction.date)}
                          </span>
                          {interaction.value && (
                            <span className="text-xs font-bold text-green-600">
                              {formatCurrency(interaction.value)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground leading-relaxed">{interaction.note}</p>
                        {interaction.products && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <ShoppingBag size={10} className="inline mr-1" />
                            {interaction.products}
                          </p>
                        )}
                        {interaction.followUp && (
                          <p className="text-xs text-blue-600 font-semibold mt-1">
                            <Calendar size={10} className="inline mr-1" />
                            Retorno: {new Date(interaction.followUp + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          onClick={() => onEditInteraction(interaction)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteInteraction(interaction.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MAIN CRM PAGE ────────────────────────────────────────────────────────────
export default function CRMPage() {
  const {
    customers, addCustomer, updateCustomer, deleteCustomer,
    addInteraction, updateInteraction, deleteInteraction,
  } = useCustomers();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<InteractionType | 'all'>('all');

  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const [interactionTarget, setInteractionTarget] = useState<Customer | null>(null);
  const [editInteraction, setEditInteraction] = useState<Interaction | null>(null);

  const [confirmDelete, setConfirmDelete] = useState<{ type: 'customer' | 'interaction'; customerId: string; interactionId?: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Stats
  const totalInteractions = customers.reduce((s, c) => s + c.interactions.length, 0);
  const totalValue = customers.reduce((s, c) => s + c.interactions.reduce((ss, i) => ss + (i.value ?? 0), 0), 0);
  const pendingFollowUps = customers.reduce((s, c) =>
    s + c.interactions.filter(i => i.followUp && new Date(i.followUp) >= new Date()).length, 0);

  // Filter
  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.city ?? '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || c.interactions.some(i => i.type === filterType);
    return matchSearch && matchType;
  });

  const handleSaveCustomer = (form: typeof EMPTY_CUST & { name: string; phone: string }) => {
    const data = { name: form.name.trim(), phone: form.phone.trim(), address: form.address, city: form.city, email: form.email, note: form.note };
    if (editCustomer) {
      updateCustomer(editCustomer.id, data);
      showToast('Cliente atualizado!');
    } else {
      addCustomer(data);
      showToast('Cliente cadastrado!');
    }
    setShowCustomerModal(false);
    setEditCustomer(null);
  };

  const handleSaveInteraction = (form: { type: InteractionType; note: string; products: string; value: string; followUp: string }) => {
    if (!interactionTarget) return;
    const data = {
      type: form.type,
      note: form.note,
      date: new Date().toISOString(),
      ...(form.products ? { products: form.products } : {}),
      ...(form.value ? { value: parseFloat(form.value.replace(',', '.')) } : {}),
      ...(form.followUp ? { followUp: form.followUp } : {}),
    };
    if (editInteraction) {
      updateInteraction(interactionTarget.id, editInteraction.id, data);
      showToast('Interação atualizada!');
    } else {
      addInteraction(interactionTarget.id, data);
      showToast('Interação registrada!');
    }
    setInteractionTarget(null);
    setEditInteraction(null);
  };

  const EMPTY_CUST_TYPED = { name: '', phone: '', address: '', city: '', email: '', note: '' };

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCustomerModal && (
          <CustomerModal
            edit={editCustomer}
            onClose={() => { setShowCustomerModal(false); setEditCustomer(null); }}
            onSave={handleSaveCustomer as (d: typeof EMPTY_CUST_TYPED) => void}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {interactionTarget && (
          <InteractionModal
            customer={interactionTarget}
            editInteraction={editInteraction}
            onClose={() => { setInteractionTarget(null); setEditInteraction(null); }}
            onSave={handleSaveInteraction as (d: { type: InteractionType; note: string; products: string; value: string; followUp: string }) => void}
          />
        )}
      </AnimatePresence>

      {/* Confirm delete */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <Trash2 size={22} className="text-destructive" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-1">Confirmar Exclusão</h3>
              <p className="text-sm text-muted-foreground mb-5">
                {confirmDelete.type === 'customer'
                  ? 'Isso excluirá o cliente e todas as suas interações. Não pode ser desfeito.'
                  : 'Excluir esta interação permanentemente?'}
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setConfirmDelete(null)} className="flex-1">Cancelar</Button>
                <Button
                  className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  onClick={() => {
                    if (confirmDelete.type === 'customer') {
                      deleteCustomer(confirmDelete.customerId);
                      showToast('Cliente excluído.');
                    } else if (confirmDelete.interactionId) {
                      deleteInteraction(confirmDelete.customerId, confirmDelete.interactionId);
                      showToast('Interação excluída.');
                    }
                    setConfirmDelete(null);
                  }}
                >Excluir</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Users size={18} className="text-primary" />, value: customers.length, label: 'Clientes', bg: 'bg-primary/10' },
          { icon: <MessageCircle size={18} className="text-blue-600" />, value: totalInteractions, label: 'Interações', bg: 'bg-blue-50' },
          { icon: <DollarSign size={18} className="text-green-600" />, value: formatCurrency(totalValue), label: 'Volume Total', bg: 'bg-green-50', small: true },
          { icon: <Calendar size={18} className="text-orange-500" />, value: pendingFollowUps, label: 'Retornos Pendentes', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card border border-border rounded-2xl p-3 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className={`font-bold text-foreground truncate ${s.small ? 'text-base' : 'text-xl'}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou cidade..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={13} />
            </button>
          )}
        </div>

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value as InteractionType | 'all')}
          className="h-9 px-3 rounded-md border border-input bg-card text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">Todas as interações</option>
          {(Object.entries(INTERACTION_LABELS) as [InteractionType, string][]).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <Button onClick={() => { setEditCustomer(null); setShowCustomerModal(true); }} className="gap-2 flex-shrink-0">
          <Plus size={15} /> Novo Cliente
        </Button>
      </div>

      {/* ── List ── */}
      <div className="flex flex-col gap-2.5">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-16 text-muted-foreground"
            >
              <Users size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">{search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}</p>
              <p className="text-sm mt-1">{search ? 'Tente outra busca' : 'Clique em "Novo Cliente" para começar!'}</p>
            </motion.div>
          ) : (
            filtered.map(customer => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                onEdit={() => { setEditCustomer(customer); setShowCustomerModal(true); }}
                onDelete={() => setConfirmDelete({ type: 'customer', customerId: customer.id })}
                onAddInteraction={() => { setInteractionTarget(customer); setEditInteraction(null); }}
                onEditInteraction={(i) => { setInteractionTarget(customer); setEditInteraction(i); }}
                onDeleteInteraction={(iid) => setConfirmDelete({ type: 'interaction', customerId: customer.id, interactionId: iid })}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

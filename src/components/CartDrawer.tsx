import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2, Plus, Minus, MessageCircle, User, MapPin, Phone, ChevronRight } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, buildWhatsAppMessage, openWhatsApp } from '@/lib/whatsapp';
import { useCustomers } from '@/hooks/useCustomers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, clearCart } = useCart();
  const { addCustomer, customers, addInteraction } = useCustomers();
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  const total = totalPrice();

  const handleSendOrder = () => {
    if (!customerName.trim() || !address.trim()) return;

    // Cadastrar ou atualizar cliente no CRM automaticamente
    const productNames = items.map(i => `${i.quantity}x ${i.product.name}`).join(', ');
    const existing = customers.find(
      c => c.name.toLowerCase() === customerName.trim().toLowerCase() ||
           (phone.trim() && c.phone === phone.trim())
    );

    if (existing) {
      // Cliente já existe: apenas registra nova interação
      addInteraction(existing.id, {
        type: 'pedido',
        date: new Date().toISOString(),
        note: `Pedido via site. Endereço: ${address}`,
        products: productNames,
        value: total,
      });
    } else {
      // Novo cliente: cadastra e registra pedido
      const newId = addCustomer({
        name: customerName.trim(),
        phone: phone.trim() || '',
        address: address.trim(),
        city: '',
        email: '',
        note: 'Cadastrado automaticamente via carrinho',
      });
      addInteraction(newId, {
        type: 'pedido',
        date: new Date().toISOString(),
        note: `Primeiro pedido via site. Endereço: ${address}`,
        products: productNames,
        value: total,
      });
    }

    const message = buildWhatsAppMessage(items, customerName, address);
    openWhatsApp(message);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-card flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  {step === 'cart' ? 'Meu Carrinho' : 'Finalizar Pedido'}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <ShoppingBag size={36} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground">Carrinho vazio</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Adicione produtos ao carrinho para continuar
                    </p>
                  </div>
                  <Button onClick={closeCart} className="mt-2">
                    Ver Produtos
                  </Button>
                </div>
              ) : step === 'cart' ? (
                <div className="p-4 flex flex-col gap-3">
                  {items.map(item => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 bg-background rounded-xl p-3 border border-border"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-primary font-bold mt-1">
                          {formatCurrency(item.product.price)} / un
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-card transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-card transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                            <button
                              onClick={() => removeItem(item.product.id)}
                              className="p-1 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-5 flex flex-col gap-5">
                  <div className="bg-muted/50 rounded-xl p-4 border border-border">
                    <p className="text-sm font-semibold text-muted-foreground mb-2">Resumo do Pedido</p>
                    {items.map(item => (
                      <div key={item.product.id} className="flex justify-between text-sm py-1">
                        <span className="text-foreground/80 truncate mr-2">
                          {item.quantity}x {item.product.name}
                        </span>
                        <span className="font-semibold text-foreground flex-shrink-0">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border mt-2 pt-2 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary text-lg">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                        <User size={14} className="text-primary" /> Seu Nome *
                      </label>
                      <Input
                        placeholder="Digite seu nome completo"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                        <Phone size={14} className="text-primary" /> WhatsApp / Telefone
                      </label>
                      <Input
                        placeholder="(24) 99999-9999"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                        <MapPin size={14} className="text-primary" /> Endereço de Entrega *
                      </label>
                      <Input
                        placeholder="Rua, número, bairro, cidade - RJ"
                        value={address}
                        onChange={e => setAddress(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <div className="bg-accent/20 border border-accent/30 rounded-xl p-4">
                    <p className="text-sm font-bold text-foreground mb-2">💬 Pagamento combinado via WhatsApp</p>
                    <p className="text-xs text-muted-foreground">
                      Após enviar o pedido, a forma de pagamento será combinada diretamente pelo WhatsApp.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-4 border-t border-border bg-card">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-muted-foreground">Total do pedido</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                </div>

                {step === 'cart' ? (
                  <Button
                    onClick={() => setStep('checkout')}
                    className="w-full gap-2 h-12 text-base"
                    size="lg"
                  >
                    Continuar
                    <ChevronRight size={18} />
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      onClick={handleSendOrder}
                      disabled={!customerName.trim() || !address.trim()}
                      className="w-full gap-2 h-12 text-base font-bold"
                      style={{ background: '#25D366', color: '#fff' }}
                      size="lg"
                    >
                      <MessageCircle size={20} />
                      Enviar Pedido pelo WhatsApp
                    </Button>
                    <button
                      onClick={() => setStep('cart')}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors text-center py-1"
                    >
                      ← Voltar ao carrinho
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

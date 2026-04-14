import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/hooks/useCart';
import { formatCurrency } from '@/lib/whatsapp';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const badgeColorMap: Record<string, string> = {
  'Mais Vendido': 'bg-primary text-primary-foreground',
  'Promoção': 'bg-destructive text-destructive-foreground',
  'Premium': 'bg-accent text-accent-foreground',
  'Novidade': 'bg-chart-3 text-primary-foreground',
  'Personalizado': 'bg-chart-2 text-foreground',
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCart();
  const cartItem = items.find(i => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleDecrease = () => {
    updateQuantity(product.id, quantity - 1);
  };

  const handleIncrease = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const subtotal = quantity * product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group bg-card rounded-2xl overflow-hidden border border-border/60 hover:border-primary/30 transition-all duration-300"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}
      onHoverStart={() => {}}
      onHoverEnd={() => {}}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {product.badge && (
          <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${badgeColorMap[product.badge] ?? 'bg-primary text-primary-foreground'}`}>
            {product.badge === 'Mais Vendido' && '⭐ '}
            {product.badge === 'Promoção' && '🔥 '}
            {product.badge}
          </div>
        )}

        {/* Quick Add overlay */}
        {quantity === 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg"
          >
            <ShoppingCart size={18} />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 min-h-[2.5rem] mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem] mb-3">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xl font-bold text-primary" style={{ fontFamily: 'Lato, sans-serif' }}>
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">/ unidade</span>
        </div>

        {/* Quantity Controls */}
        {quantity > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-muted rounded-xl p-1.5">
              <button
                onClick={handleDecrease}
                className="w-8 h-8 rounded-lg bg-card hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors font-bold"
              >
                <Minus size={14} />
              </button>
              <span className="font-bold text-foreground tabular-nums">{quantity}</span>
              <button
                onClick={handleIncrease}
                className="w-8 h-8 rounded-lg bg-card hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-colors font-bold"
              >
                <Plus size={14} />
              </button>
            </div>
            {subtotal > 0 && (
              <div className="text-center">
                <span className="text-xs text-muted-foreground">Subtotal: </span>
                <span className="text-sm font-bold text-primary">{formatCurrency(subtotal)}</span>
              </div>
            )}
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.96 }}
            animate={added ? { scale: [1, 1.05, 1] } : {}}
            onClick={handleAdd}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            <ShoppingCart size={16} />
            {added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

import { CartItem } from '@/hooks/useCart';

const WHATSAPP_NUMBER = '5524992575555';
const PIX_KEY = '5524992575555';
const PIX_FAVORECIDO = 'Doce & Útil';

export const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const buildWhatsAppMessage = (
  items: CartItem[],
  customerName: string,
  address: string
): string => {
  const lines: string[] = [
    '🛒 *NOVO PEDIDO - Doce & Útil* 🛒',
    '',
    '━━━━━━━━━━━━━━━━━━',
    '*📦 ITENS DO PEDIDO:*',
    '',
  ];

  items.forEach(item => {
    const subtotal = item.product.price * item.quantity;
    lines.push(
      `• ${item.product.name}`,
      `  Qtd: ${item.quantity} × ${formatCurrency(item.product.price)} = *${formatCurrency(subtotal)}*`,
      ''
    );
  });

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  lines.push(
    '━━━━━━━━━━━━━━━━━━',
    `💰 *TOTAL GERAL: ${formatCurrency(total)}*`,
    '━━━━━━━━━━━━━━━━━━',
    '',
    '👤 *DADOS DO CLIENTE:*',
    `Nome: ${customerName}`,
    `Endereço: ${address}`,
    '',
    '💳 *PAGAMENTO:*',
    'Exclusivamente por PIX',
    `Chave PIX: ${PIX_KEY}`,
    `Favorecido: ${PIX_FAVORECIDO}`,
    '',
    '📦 Entrega porta a porta em todo o estado do Rio de Janeiro.',
    '',
    '⚡ Aguardo confirmação! Obrigado pela preferência! 🏠🍫'
  );

  return encodeURIComponent(lines.join('\n'));
};

export const openWhatsApp = (message: string): void => {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
};

export { WHATSAPP_NUMBER, PIX_KEY, PIX_FAVORECIDO };

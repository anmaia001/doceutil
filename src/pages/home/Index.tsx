import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  MessageCircle,
  Truck,
  Shield,
  Star,
  ChevronRight,
  Copy,
  Check,
  Phone,
  Instagram,
  Clock,
  MapPin,
  Zap,
  Award,
  Heart,
  Package,
} from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { formatCurrency, WHATSAPP_NUMBER } from '@/lib/whatsapp';
import Header from '@/components/Header';
import CartDrawer from '@/components/CartDrawer';
import ProductCard from '@/components/ProductCard';

// ── REVIEWS ───────────────────────────────────────────
const _reviews = [
  {
    id: 1,
    name: 'Ana Paula Silva',
    city: 'Rio de Janeiro - RJ',
    rating: 5,
    comment:
      'Amei os brigadeiros! Chegaram fresquinhos, embalagem linda e sabor incrível. Já fiz o segundo pedido! Super recomendo!',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&q=80&fit=crop&face',
  },
  {
    id: 2,
    name: 'Carlos Eduardo',
    city: 'Niterói - RJ',
    rating: 5,
    comment:
      'Panelas de excelente qualidade! Chegaram rápido e bem embaladas. Atendimento via WhatsApp foi muito atencioso. Nota 10!',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&q=80&fit=crop&face',
  },
  {
    id: 3,
    name: 'Mariana Oliveira',
    city: 'São Gonçalo - RJ',
    rating: 5,
    comment:
      'A cesta de doces foi um presente incrível! Minha mãe amou. Qualidade dos produtos é muito alta e entrega pontual.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&q=80&fit=crop&face',
  },
  {
    id: 4,
    name: 'Roberto Ferreira',
    city: 'Duque de Caxias - RJ',
    rating: 5,
    comment:
      'Comprei o kit de facas e ficou impressionado com a qualidade. Vale muito o investimento. Ótimos produtos a preço justo!',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&q=80&fit=crop&face',
  },
  {
    id: 5,
    name: 'Fernanda Costa',
    city: 'Nova Iguaçu - RJ',
    rating: 5,
    comment:
      'As trufas de chocolate belga são simplesmente divinas! Pedi para o aniversário do meu marido e ele adorou. Já virou cliente fiel!',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&q=80&fit=crop&face',
  },
];

// ── TRUST BADGES ──────────────────────────────────────
const trustItems = [
  {
    icon: <MessageCircle size={28} className="text-primary" />,
    title: 'Atendimento Rápido',
    desc: 'Respondemos em até 5 minutos via WhatsApp',
  },
  {
    icon: <Truck size={28} className="text-primary" />,
    title: 'Entrega Segura',
    desc: 'Entregamos com cuidado em todo o estado do RJ',
  },
  {
    icon: <Award size={28} className="text-primary" />,
    title: 'Produtos Selecionados',
    desc: 'Curadoria rigorosa de qualidade em cada item',
  },
  {
    icon: <Shield size={28} className="text-primary" />,
    title: '100% Garantido',
    desc: 'Satisfação garantida ou devolvemos seu dinheiro',
  },
];

// ── HERO SLIDES ───────────────────────────────────────
// Imagens rotativas de doces para o 1º slide
const docesRotativas = [
  'https://cdn.awsli.com.br/300x300/2885/2885655/produto/381847382/pote-13-bj70n6hhtj.jpg',   // Caixinha Mista
  'https://cdn.awsli.com.br/300x300/2885/2885655/produto/378729682/pote-6qojycdti3.jpg',       // Doce de Leite Pastoso
  'https://cdn.awsli.com.br/300x300/2885/2885655/produto/381573112/pote-20-1uk63fah9y.jpg',    // Goiabada Cascão
  'https://cdn.awsli.com.br/300x300/2885/2885655/produto/382612841/pote-11-udqczbvsrt.png',    // Paçoca Diet
  'https://cdn.awsli.com.br/300x300/2885/2885655/produto/381571544/pote-4-ka94iyp9zb.jpg',    // Doce de Leite com Chocolate
  'https://cdn.awsli.com.br/300x300/2885/2885655/produto/382587351/pote-cm2zfakqgd.png',      // Goiabada Cascão Barra
];

const heroSlides = [
  {
    image: '/queijo-frescal.png',
    badge: '🧀 Queijo Minas Frescal',
    title: 'Doce & Útil',
    subtitle: 'Doces artesanais e queijos selecionados\ncom entrega porta a porta no RJ',
    cta: 'Ver Produtos',
    section: 'produtos',
    overlay: 'from-black/60 via-black/30 to-transparent',
  },
  {
    image: '/hero-doce-leite.png',
    badge: '🍬 Doces Artesanais',
    title: 'Doce & Útil',
    subtitle: 'Doce de leite artesanal e muito mais\ncom entrega porta a porta no RJ',
    cta: 'Ver Produtos',
    section: 'produtos',
    overlay: 'from-black/60 via-black/30 to-transparent',
  },
];

export default function HomePage() {
  const { products, init } = useProducts();
  useEffect(() => { init(); }, []);
  const utilidades = products.filter(p => p.category === 'utilidades');
  const doces = products.filter(p => p.category === 'doces');
  const { openCart, totalItems } = useCart();
  const [activeTab, setActiveTab] = useState<'todos' | 'utilidades' | 'doces'>('todos');
  const [copied, setCopied] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [rotatingImgIndex, setRotatingImgIndex] = useState(0);

  const displayProducts =
    activeTab === 'todos'
      ? products
      : activeTab === 'utilidades'
      ? utilidades
      : doces;

  // Auto-rotate hero
  useEffect(() => {
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroSlides.length), 5000);
    return () => clearInterval(t);
  }, []);

  // Auto-rotate product images on slide 1
  useEffect(() => {
    const t = setInterval(() => setRotatingImgIndex(i => (i + 1) % docesRotativas.length), 2000);
    return () => clearInterval(t);
  }, []);



  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  // PIX removido

  const slide = heroSlides[heroIndex];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CartDrawer />

      {/* ═══════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section id="inicio" className="relative h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt="Hero"
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />

            {/* Imagens rotativas de doces — slide 1 */}
            {'rotatingImages' in slide && slide.rotatingImages && (
              <div className="absolute right-8 bottom-12 hidden lg:flex items-end gap-4 z-10">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={rotatingImgIndex}
                    initial={{ opacity: 0, y: 20, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, rotate: -4 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="w-52 h-64 rounded-3xl overflow-hidden border-4 border-white/80 shadow-2xl"
                    style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}
                  >
                    <img src={slide.rotatingImages[rotatingImgIndex]} alt="Produto doce" className="w-full h-full object-cover" />
                  </motion.div>
                </AnimatePresence>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`b_${rotatingImgIndex}`}
                    initial={{ opacity: 0, y: 20, rotate: 5 }}
                    animate={{ opacity: 1, y: 0, rotate: 5 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="w-40 h-48 rounded-2xl overflow-hidden border-4 border-white/70 shadow-2xl mb-8"
                    style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
                  >
                    <img src={slide.rotatingImages[(rotatingImgIndex + 1) % slide.rotatingImages.length]} alt="Produto doce 2" className="w-full h-full object-cover" />
                  </motion.div>
                </AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
                  className="absolute -top-6 right-24 bg-primary text-primary-foreground px-3 py-2 rounded-2xl text-xs font-bold shadow-lg"
                >
                  🍮 Doces Artesanais
                </motion.div>
              </div>
            )}

            {/* Imagens sobrepostas do produto — slide 3 */}
            {'extraImages' in slide && slide.extraImages && (
              <div className="absolute right-8 bottom-12 hidden lg:flex items-end gap-4 z-10">
                {/* Card principal grande */}
                <motion.div
                  initial={{ opacity: 0, y: 30, rotate: -4 }}
                  animate={{ opacity: 1, y: 0, rotate: -4 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="w-52 h-64 rounded-3xl overflow-hidden border-4 border-white/80 shadow-2xl"
                  style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.4)' }}
                >
                  <img src={slide.extraImages[0]} alt="Produto destaque" className="w-full h-full object-cover" />
                </motion.div>
                {/* Card menor com rotação oposta */}
                <motion.div
                  initial={{ opacity: 0, y: 30, rotate: 5 }}
                  animate={{ opacity: 1, y: 0, rotate: 5 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="w-40 h-48 rounded-2xl overflow-hidden border-4 border-white/70 shadow-2xl mb-8"
                  style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.35)' }}
                >
                  <img src={slide.extraImages[1]} alt="Produto destaque 2" className="w-full h-full object-cover scale-110" style={{ objectPosition: '60% 40%' }} />
                </motion.div>
                {/* Badge flutuante */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.9, type: 'spring', stiffness: 300 }}
                  className="absolute -top-6 right-24 bg-primary text-primary-foreground px-3 py-2 rounded-2xl text-xs font-bold shadow-lg"
                >
                  🍮 Pote 400g
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="max-w-2xl"
              >
                <span className="inline-block px-4 py-1.5 bg-white/20 text-white text-sm font-semibold rounded-full mb-5 border border-white/30">
                  {slide.badge}
                </span>
                <h1
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-none mb-6 whitespace-pre-line"
                  style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}
                >
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed whitespace-pre-line max-w-xl">
                  {slide.subtitle}
                </p>
                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => scrollTo(slide.section)}
                    className="flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-base shadow-lg hover:opacity-90 transition-all"
                  >
                    <ShoppingCart size={18} />
                    {slide.cta}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
                    className="flex items-center gap-2 px-7 py-3.5 bg-white/15 text-white rounded-xl font-bold text-base border border-white/30 hover:bg-white/25 transition-all"
                  >
                    <MessageCircle size={18} />
                    Falar no WhatsApp
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Hero dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIndex(i)}
              className={`transition-all duration-300 rounded-full ${
                i === heroIndex ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
              }`}
            />
          ))}
        </div>

      </section>

      {/* ═══════════════════════════════════════════
          TRUST BADGES
      ════════════════════════════════════════════ */}
      <section className="py-14 bg-secondary/40 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {trustItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          PRODUTOS
      ════════════════════════════════════════════ */}
      <section id="produtos" className="py-16 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full mb-3">
              🛍️ Nosso Catálogo
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Todos os Produtos
            </h2>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              Qualidade premium com preços acessíveis. Entrega em todo o Rio de Janeiro.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-card rounded-2xl p-1.5 border border-border gap-1">
              {[
                { key: 'todos', label: '🛒 Todos', count: products.length },
                { key: 'doces', label: '🍫 Doces', count: doces.length },
                { key: 'utilidades', label: '🏠 Utilidades', count: utilidades.length },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as typeof activeTab)}
                  className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key ? 'bg-white/20' : 'bg-muted text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Doces Section — primeiro */}
          {(activeTab === 'todos' || activeTab === 'doces') && (
            <div className="mb-12">
              {activeTab === 'todos' && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart size={16} className="text-primary" />
                  </div>
                  <h3
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Doces Artesanais
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(activeTab === 'todos' ? doces : displayProducts).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Utilidades Section — depois */}
          {(activeTab === 'todos' || activeTab === 'utilidades') && (
            <div className="mb-12">
              {activeTab === 'todos' && (
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package size={16} className="text-primary" />
                  </div>
                  <h3
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Utilidades Domésticas
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {(activeTab === 'todos' ? utilidades : displayProducts).map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          {/* Cart CTA */}
          {totalItems() > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 flex justify-center"
            >
              <button
                onClick={openCart}
                className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base shadow-lg hover:opacity-90 transition-all"
              >
                <ShoppingCart size={20} />
                Ver Carrinho ({totalItems()} {totalItems() === 1 ? 'item' : 'itens'}) —{' '}
                {formatCurrency(useCart.getState().totalPrice())}
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          COMO COMPRAR
      ════════════════════════════════════════════ */}
      <section id="como-comprar" className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-full mb-3">
              📋 Passo a Passo
            </span>
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Como Comprar
            </h2>
            <p className="text-muted-foreground mt-2">Simples, rápido e seguro!</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: '1',
                icon: <Package size={24} className="text-primary" />,
                title: 'Escolha os Produtos',
                desc: 'Navegue pelo catálogo e selecione os produtos que deseja. Ajuste as quantidades com os botões + e −.',
              },
              {
                step: '2',
                icon: <ShoppingCart size={24} className="text-primary" />,
                title: 'Confira o Carrinho',
                desc: 'Veja todos os itens adicionados, quantidades e o total calculado automaticamente.',
              },
              {
                step: '3',
                icon: <MessageCircle size={24} className="text-primary" />,
                title: 'Envie pelo WhatsApp',
                desc: 'Informe seu nome e endereço, clique em "Enviar Pedido" e a mensagem é gerada automaticamente!',
              },
              {
                step: '4',
                icon: <Zap size={24} className="text-primary" />,
                title: 'Pague via PIX',
                desc: 'Realize o pagamento pela chave PIX e envie o comprovante. Pronto! Seu pedido está confirmado.',
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center p-6 bg-background rounded-2xl border border-border"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-md">
                  {s.step}
                </div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mt-4 mb-4">
                  {s.icon}
                </div>
                <h3 className="font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                {i < 3 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                    <ChevronRight size={20} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ═══════════════════════════════════════════
          ENTREGA
      ════════════════════════════════════════════ */}
      <section className="py-14 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                <Truck size={32} className="text-primary-foreground" />
                <h2
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Entrega Porta a Porta
                </h2>
              </div>
              <p className="text-primary-foreground/85 text-base sm:text-lg max-w-lg leading-relaxed">
                Entregamos em todo o estado do{' '}
                <span className="font-bold text-primary-foreground">Rio de Janeiro</span>.
                Seus produtos chegam com segurança e cuidado até a sua porta.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4 min-w-[280px]"
            >
              {[
                { icon: <MapPin size={20} />, text: 'Capital e Interior do RJ' },
                { icon: <Clock size={20} />, text: 'Prazo: 1 a 5 dias úteis' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white/15 rounded-xl px-3 py-2.5 text-sm font-medium"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          AVALIAÇÕES
      ════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════
          CTA FINAL
      ════════════════════════════════════════════ */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2
              className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Pronto para Fazer seu Pedido?
            </h2>
            <p className="text-muted-foreground mb-8 text-base sm:text-lg">
              Escolha seus produtos, adicione ao carrinho e envie pelo WhatsApp. Simples assim!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollTo('produtos')}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-base shadow-lg hover:opacity-90 transition-all"
              >
                <ShoppingCart size={20} />
                Ver Todos os Produtos
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base border-2 border-border hover:border-primary hover:text-primary transition-all"
                style={{ background: 'transparent' }}
              >
                <MessageCircle size={20} />
                Chamar no WhatsApp
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER / CONTATO
      ════════════════════════════════════════════ */}
      <footer id="contato" className="bg-foreground text-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">C</span>
                </div>
                <span
                  className="text-2xl font-bold text-background"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Doce<span className="text-accent"> & </span>Útil
                </span>
              </div>
              <p className="text-background/65 text-sm leading-relaxed max-w-sm mb-5">
                Trazemos para o seu lar os melhores produtos de utilidades domésticas e doces artesanais, com entrega segura em todo o estado do Rio de Janeiro.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: '#25D366', color: '#fff' }}
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com/doceeutilrj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 transition-all text-background"
                >
                  <Instagram size={16} />
                  Instagram
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-bold text-background mb-4 text-sm">Navegação</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Início', id: 'inicio' },
                  { label: 'Produtos', id: 'produtos' },
                  { label: 'Produtos', id: 'produtos' },
                  { label: 'Como Comprar', id: 'como-comprar' },
                ].map(link => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="text-sm text-background/65 hover:text-background transition-colors"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-bold text-background mb-4 text-sm">Informações</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-background/65">
                  <Clock size={15} className="mt-0.5 flex-shrink-0 text-accent" />
                  <div>
                    <span className="block text-background/90 font-medium">Atendimento</span>
                    Seg–Sáb: 8h às 20h<br/>Dom: 9h às 17h
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-background/65">
                  <MapPin size={15} className="mt-0.5 flex-shrink-0 text-accent" />
                  <div>
                    <span className="block text-background/90 font-medium">Região Atendida</span>
                    Todo o Estado do Rio de Janeiro
                  </div>
                </li>
                <li className="flex items-start gap-2 text-sm text-background/65">
                  <Phone size={15} className="mt-0.5 flex-shrink-0 text-accent" />
                  <div>
                    <span className="block text-background/90 font-medium">WhatsApp</span>
                    (24) 99257-5555
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-background/45">
              © {new Date().getFullYear()} Doce & Útil. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <p className="text-xs text-background/45">
                Feito com ❤️ para o Rio de Janeiro
              </p>
              <Link
                to="/admin"
                className="text-xs font-semibold text-background/80 hover:text-white transition-colors flex items-center gap-1.5 border border-white/30 hover:border-white/70 hover:bg-white/10 px-3 py-1.5 rounded-lg"
              >
                🔐 Área Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════════════════════
          FLOATING WHATSAPP BUTTON
      ════════════════════════════════════════════ */}
      {/* Floating Admin Button */}
      <Link
        to="/admin"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg text-xs font-semibold transition-all bg-foreground/80 hover:bg-foreground text-background border border-white/10"
      >
        🔐 <span className="hidden sm:block">Área Admin</span>
      </Link>

      <motion.a
        href={`https://wa.me/${WHATSAPP_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 20 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl text-white font-semibold text-sm"
        style={{ background: '#25D366' }}
      >
        <MessageCircle size={22} />
        <span className="hidden sm:block">Falar no WhatsApp</span>
      </motion.a>
    </div>
  );
}

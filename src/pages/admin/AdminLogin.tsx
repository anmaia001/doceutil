import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLogin() {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const ok = login(password);
    if (!ok) {
      setError('Senha incorreta. Tente novamente.');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-primary px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
              <Lock size={28} className="text-white" />
            </div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Área Administrativa
            </h1>
            <p className="text-white/75 text-sm mt-1">Doce & Útil — Gerenciamento</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-sm font-semibold text-foreground mb-2 block">
                  Senha de Acesso
                </label>
                <div className="relative">
                  <Input
                    type={show ? 'text' : 'password'}
                    placeholder="Digite a senha..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pr-12 h-12 text-base bg-background"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-sm text-destructive font-medium"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={!password || loading}
                className="h-12 text-base font-bold gap-2"
                size="lg"
              >
                {loading ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {loading ? 'Verificando...' : 'Entrar'}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border">
              <div className="bg-muted/60 rounded-xl px-4 py-3 mb-4 text-center">
                <p className="text-xs text-muted-foreground mb-1 font-medium">🔑 Senha padrão de acesso:</p>
                <p className="text-sm font-bold text-foreground tracking-widest select-all">doceutil@2025</p>
                <p className="text-xs text-muted-foreground mt-1">Clique na senha acima para selecionar e copiar</p>
              </div>
              <div className="text-center">
                <a
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  ← Voltar ao site
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Acesso restrito a administradores
        </p>
      </motion.div>
    </div>
  );
}

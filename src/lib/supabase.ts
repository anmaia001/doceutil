import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gvtzxzwikjfwygsxxoes.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_kOFLKuCt-NMEGV-cG2pVfQ_yZbvYPSb';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

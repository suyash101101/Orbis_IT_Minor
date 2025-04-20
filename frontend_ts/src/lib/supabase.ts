import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vunlepqcjoywpimxdica.supabase.co';  
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseKey) {
  console.error('Missing Supabase key in environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey); 
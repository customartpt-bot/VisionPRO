import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas
const SUPABASE_URL = 'https://ardhmsmidmiyalrovprm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyZGhtc21pZG1peWFscm92cHJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcwNzIzMDUsImV4cCI6MjA4MjY0ODMwNX0.4BB3r494AftONhlpGA_E0WBkGdRN-vs6phYmSvceRco';

export const isConfigured = true;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveCredentials = (url: string, key: string) => {
    // Função mantida para compatibilidade, mas as chaves estão hardcoded agora.
    console.log('Credenciais configuradas internamente.');
};
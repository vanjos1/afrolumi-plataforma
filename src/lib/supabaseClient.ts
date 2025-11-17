import { createClient } from "@supabase/supabase-js";

/**
 * ATENÇÃO:
 * Para funcionar amanhã sem dor de cabeça no Vercel,
 * vamos colocar a URL e a ANON KEY direto aqui.
 *
 * Depois, com calma, podemos voltar para variáveis de ambiente.
 */

// ⬇️ SUBSTITUA pelas informações do seu painel do Supabase
const supabaseUrl = "https://tznblrsebljqqdnhtfsz.supabase.co";
// CHAVE ANON INSERIDA: Agora a aplicação deve conseguir se conectar.
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bmJscnNlYmxqcXFkbmh0ZnN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjA1ODAsImV4cCI6MjA3ODg5NjU4MH0.epFiUdr-GxLX6rO0jJ5iVorMYwAmotKUr6IfX6Ob6cs"; 

// NÃO ALTERAR DAQUI PARA BAIXO
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
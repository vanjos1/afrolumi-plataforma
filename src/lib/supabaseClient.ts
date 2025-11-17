import { createClient } from "@supabase/supabase-js";

// Lê as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Se não tiver, lança erro claro (foi o que você viu no build)
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Variáveis de ambiente do Supabase não configuradas. Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

// Cliente compartilhado pela aplicação
export const supabase = createClient(supabaseUrl, supabaseKey);

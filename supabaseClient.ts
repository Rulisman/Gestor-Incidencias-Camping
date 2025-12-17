/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificación de seguridad por si las claves no cargan
if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Faltan las claves de Supabase. Revisa tu archivo .env.local')
}

// Usamos cadenas vacías como fallback para que TS no se queje, 
// aunque la app fallará si no hay claves.
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseKey || ''
)
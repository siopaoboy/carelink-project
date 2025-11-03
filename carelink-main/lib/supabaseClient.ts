import { createClient } from '@supabase/supabase-js'

// Reads env vars from Next.js runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// if (!supabaseUrl || !supabaseAnonKey) {
//   // Soft warn: project may still run in localStorage mode
//   console.warn('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
// }

export const supabase = createClient(supabaseUrl || 'http://localhost', supabaseAnonKey || 'anon')

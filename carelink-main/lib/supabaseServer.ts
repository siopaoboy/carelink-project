import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE as string

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase server env vars missing: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE')
}

export const supabaseServer = createClient(supabaseUrl || 'http://localhost', serviceRoleKey || 'service')

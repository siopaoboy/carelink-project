import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE
  let supabaseOk = false
  let error: any = null
  try {
    // Try a very cheap query; if table missing, it will error, but env still valid
    const { error: e } = await supabaseServer
      .from('profiles')
      .select('email', { count: 'exact', head: true })
      .limit(1)
    if (!e) supabaseOk = true
    else error = { message: e.message, code: (e as any).code }
  } catch (e: any) {
    error = { message: e?.message || String(e) }
  }
  return NextResponse.json({
    env: { hasUrl, hasAnon, hasService },
    supabaseOk,
    error,
  })
}

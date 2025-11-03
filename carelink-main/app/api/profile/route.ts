import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

// Expected table: profiles (email text primary key, data jsonb)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const { data, error } = await supabaseServer.from('profiles').select('data').eq('email', email).single()
  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ profile: data?.data || null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, profile } = body || {}
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const { error } = await supabaseServer.from('profiles').upsert({ email, data: profile }, { onConflict: 'email' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

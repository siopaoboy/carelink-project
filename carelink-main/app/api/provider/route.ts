import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const { data, error } = await supabaseServer.from('provider_profiles').select('data').eq('email', email).single()
  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ provider: data?.data || null })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, provider } = body || {}
  if (!email || !provider) return NextResponse.json({ error: 'email and provider required' }, { status: 400 })
  const { error } = await supabaseServer.from('provider_profiles').upsert({ email, data: provider }, { onConflict: 'email' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

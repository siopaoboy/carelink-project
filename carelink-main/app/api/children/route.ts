import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { normalizeChildKeys, upgradeChildV1toV2 } from "@/lib/children"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
  const { data, error } = await supabaseServer.from('children').select('id, data').eq('parent_email', email).order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const rows: any[] = data ?? []
  const normalized = rows.map(upgradeChildV1toV2)

  return NextResponse.json({ children: normalized })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any))

  // normalize incoming payload
  if (body?.child) body.child = normalizeChildKeys(body.child)
  if (Array.isArray(body?.children)) body.children = body.children.map(normalizeChildKeys)

  const { email, children } = body || {}
  if (!email || !Array.isArray(children)) return NextResponse.json({ error: 'email and children[] required' }, { status: 400 })
  // naive replace-all: delete then insert
  const del = await supabaseServer.from('children').delete().eq('parent_email', email)
  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 })
  if (children.length > 0) {
    const rows = children.map((c: any) => ({ parent_email: email, data: c }))
    const ins = await supabaseServer.from('children').insert(rows)
    if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

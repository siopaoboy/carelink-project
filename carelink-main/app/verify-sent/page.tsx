"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VerifySentPage() {
  const sp = useSearchParams();
  const emailParam = sp.get('email') || '';
  const [state, setState] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [msg, setMsg] = useState<string>('');

  async function resend() {
    if (!emailParam) return;
    try {
      setState('sending'); setMsg('');
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailParam,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      });
      if (error) throw error;
      setState('sent'); setMsg('Verification email has been resent. Please check your inbox.');
    } catch (e: any) {
      setState('error'); setMsg(e?.message || 'Failed to resend.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p>
          {emailParam ? (
            <>We sent a verification link to <strong>{emailParam}</strong>. Open it to finish setting up your account.</>
          ) : (
            <>We sent a verification link. Please open it to finish setting up your account.</>
          )}
        </p>
        {emailParam && (
          <button
            onClick={resend}
            disabled={state==='sending'}
            className="inline-flex items-center justify-center px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {state==='sending' ? 'Resending…' : 'Resend email'}
          </button>
        )}
        {msg && <p className={`text-sm ${state==='error' ? 'text-red-600' : 'text-green-600'}`}>{msg}</p>}
        <a href="/login" className="inline-block text-primary underline">Back to sign in</a>
      </div>
    </div>
  )
}

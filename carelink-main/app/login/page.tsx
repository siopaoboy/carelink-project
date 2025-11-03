"use client";


import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaApple } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { login as authLogin, createVerifyToken, getUser, createUser } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Auto redirect if already logged in
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage.getItem('user')) {
      router.replace('/search');
    }
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    try {
      const rec = await authLogin(email, password);
      // If not verified, send verification link and redirect to verify-sent
      if (!rec.verified) {
        // Supabase handles email verification; send user to verify-sent
        router.push(`/verify-sent?email=${encodeURIComponent(email)}`)
        return;
      }
  // Role selection if missing
  if (!rec.role) {
        router.push('/role');
        return;
      }
  // Parent onboarding step if profile missing
  if (rec.role === 'Parent' && !rec.profile) {
        router.push('/onboarding/parent/step-a');
        return;
      }
  // Go to role-specific dashboard
  if (rec.role === 'Provider') router.push('/provider/dashboard');
  else if (rec.role === 'Parent') router.push('/dashboard');
  else router.push('/role');
    } catch (err: any) {
      const msg = String(err?.message || '')
      if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('confirm')) {
        // Unconfirmed email per Supabase; direct to verify-sent
        router.push(`/verify-sent?email=${encodeURIComponent(email)}`)
        return;
      }
      // Fallback for demo: if account doesn't exist, create it and send verification link
      try {
        const exists = !!getUser(email);
        if (!exists) {
          createUser(email, password);
          const token = createVerifyToken(email);
          router.push(`/verify-sent?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
          return;
        }
        // Legacy migration: if old demo localStorage 'user' exists with this email
        const legacy = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
        const legacyEmail = legacy ? (JSON.parse(legacy).email as string | undefined) : undefined;
        if (legacyEmail && legacyEmail === email) {
          createUser(email, password);
          const token = createVerifyToken(email);
          router.push(`/verify-sent?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
          return;
        }
      } catch {}
  alert('Invalid email or password');
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6 bg-background rounded">
        <h2 className="text-2xl font-bold text-center">Login CareLink</h2>
        <p className="text-center text-lg font-semibold mb-4">Welcome Back to Child Care Search!</p>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input type="email" className="w-full px-3 py-2 border rounded" required value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input type="password" className="w-full px-3 py-2 border rounded" required value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex justify-end mb-2">
            <Link href="/forgot-password" className="text-primary text-sm hover:underline">Forgot your password?</Link>
          </div>
          <button type="submit" className="w-full py-2 font-bold text-primary-foreground bg-primary rounded hover:bg-primary/90">Sign in</button>
        </form>
        <div className="my-6">
          <div className="flex items-center mb-4">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-sm font-medium">Or continue with</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <div className="flex justify-center gap-4 mb-2">
            <button
              type="button"
              className="p-3 rounded-full border hover:bg-gray-100 shadow-sm"
              aria-label="Sign in with Google"
              onClick={async () => {
                const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
                await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
              }}
            >
              <FcGoogle size={28} />
            </button>
            <button
              type="button"
              className="p-3 rounded-full border hover:bg-gray-100 text-primary shadow-sm"
              aria-label="Sign in with Facebook"
              onClick={async () => {
                const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
                await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo } })
              }}
            >
              <FaFacebook size={26} />
            </button>
            <button
              type="button"
              className="p-3 rounded-full border hover:bg-gray-100 text-black shadow-sm"
              aria-label="Sign in with Apple"
              onClick={async () => {
                const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
                await supabase.auth.signInWithOAuth({ provider: 'apple', options: { redirectTo } })
              }}
            >
              <FaApple size={26} />
            </button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500">
          Create new account{' '}
          <Link href="/register" className="text-primary hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}

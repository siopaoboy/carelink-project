"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { consumeResetToken, getUser, saveUsers } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sp.get('token');
    const em = token ? consumeResetToken(token) : null;
    if (em) setEmail(em);
    else setError('Invalid or expired reset link');
  }, [sp]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (pwd !== pwd2) { setError('Passwords do not match'); return; }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[email]) { setError('User not found'); return; }
    users[email].password = pwd;
    localStorage.setItem('users', JSON.stringify(users));
    router.replace('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Reset password</h1>
        {error && <p className="text-red-600">{error}</p>}
        <input type="password" className="w-full px-3 py-2 border rounded" placeholder="New password" required value={pwd} onChange={e=>setPwd(e.target.value)} />
        <input type="password" className="w-full px-3 py-2 border rounded" placeholder="Confirm password" required value={pwd2} onChange={e=>setPwd2(e.target.value)} />
        <button className="w-full py-2 bg-primary text-primary-foreground rounded" type="submit">Set password</button>
      </form>
    </div>
  );
}

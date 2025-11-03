"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getUser, createResetToken } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rec = getUser(email);
    if (!rec) {
      alert('No account for this email');
      return;
    }
    const token = createResetToken(email);
    router.push(`/reset-sent?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="max-w-md w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <input type="email" required className="w-full px-3 py-2 border rounded" value={email} onChange={e=>setEmail(e.target.value)} />
        <button className="w-full py-2 bg-primary text-primary-foreground rounded" type="submit">Send reset link</button>
      </form>
    </div>
  );
}

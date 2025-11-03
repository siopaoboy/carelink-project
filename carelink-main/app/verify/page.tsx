"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { consumeVerifyToken, setVerified, setCurrentUser, getUser } from "@/lib/auth";

export default function VerifyPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [status, setStatus] = useState<'pending'|'success'|'error'>('pending');

  useEffect(() => {
    const token = sp.get('token');
    if (!token) {
      setStatus('error');
      return;
    }
    const email = consumeVerifyToken(token);
    if (email) {
      setVerified(email, true);
      setCurrentUser(email);
      setStatus('success');
      // If role already chosen, route to next step/dashboard accordingly
      setTimeout(()=>{
        const rec = getUser(email);
        if (!rec?.role) { router.replace('/role'); return; }
        if (rec.role === 'Parent') {
          if (!rec.profile) router.replace('/onboarding/parent/step-a'); else router.replace('/dashboard');
        } else if (rec.role === 'Provider') {
          router.replace('/provider/dashboard');
        } else {
          router.replace('/role');
        }
      }, 800);
    } else {
      setStatus('error');
    }
  }, [sp, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-background rounded text-center">
        {status === 'pending' && <p>Verifying…</p>}
        {status === 'success' && <p className="text-green-600">Email verified! Redirecting…</p>}
        {status === 'error' && <p className="text-red-600">Invalid or expired link.</p>}
      </div>
    </div>
  );
}

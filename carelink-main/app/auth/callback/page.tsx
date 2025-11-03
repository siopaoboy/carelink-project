"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { setCurrentUser, setVerified } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handle() {
      // Try to exchange any URL code/hash for a session first
      try {
        // Works for OAuth PKCE and email link confirmations with code in URL
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {
        // no-op; getSession may still succeed if already logged in
      }
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error", error);
        router.replace("/login");
        return;
      }
      const email = session?.user?.email || null;
      if (!email) { router.replace("/login"); return; }
      setCurrentUser(email);
      // Mark verified in local bridge so legacy checks pass
      if (session?.user?.email_confirmed_at) {
        setVerified(email, true);
      }

      // Ensure base rows exist so you can see data in DB right after verification/login
      try {
        await Promise.all([
          fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, profile: { email } }),
          }),
          fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, notify: { applicationUpdates: true, messageNotifications: true } }),
          }),
        ])
      } catch {}

      // Optionally, you could fetch profile from Supabase here and merge.
      // Route users to role selection/dashboard like password flow
      router.replace("/role");
    }
    handle();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Signing you in...</p>
    </div>
  );
}

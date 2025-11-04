"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { setCurrentUser, setVerified } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handle() {
      try {
        await supabase.auth.exchangeCodeForSession(window.location.href);
      } catch (e) {}
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Auth callback error", error);
        router.replace("/login");
        return;
      }
      const email = session?.user?.email || null;
      if (!email) {
        router.replace("/login");
        return;
      }
      setCurrentUser(email);
      if (session?.user?.email_confirmed_at) {
        setVerified(email, true);
      }

      try {
        await Promise.all([
          fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, profile: { email } }),
          }),
          fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              notify: { applicationUpdates: true, messageNotifications: true },
            }),
          }),
        ]);
      } catch {}

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

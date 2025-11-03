"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { setCurrentUser } from "@/lib/auth";

export default function SessionBridge() {
  useEffect(() => {
    let mounted = true;
    // Initial sync
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const email = data.session?.user?.email || null;
      setCurrentUser(email);
    });
    // Subscribe to auth changes
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;
      setCurrentUser(email);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  return null;
}

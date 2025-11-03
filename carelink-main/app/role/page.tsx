"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUserEmail, isAuthenticated, setRole, getUser } from "@/lib/auth";

export default function RolePage() {
  const router = useRouter();
  const [selected, setSelected] = useState<'Parent'|'Provider'|null>(null);

  useEffect(() => {
    if (!isAuthenticated()) router.replace('/login');
  }, [router]);

  function save() {
    const email = getCurrentUserEmail();
    if (!email || !selected) return;
    setRole(email, selected);
  if (selected === 'Parent') router.push('/onboarding/parent/step-a');
  else router.push('/onboarding/provider/step-a');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Select your role</h1>
        <div className="flex gap-3">
          <button className={`flex-1 py-3 rounded border ${selected==='Parent'?'bg-primary text-primary-foreground':''}`} onClick={()=>setSelected('Parent')}>Parent</button>
          <button className={`flex-1 py-3 rounded border ${selected==='Provider'?'bg-primary text-primary-foreground':''}`} onClick={()=>setSelected('Provider')}>Provider</button>
        </div>
        <button className="w-full py-2 bg-primary text-primary-foreground rounded" onClick={save} disabled={!selected}>Continue</button>
      </div>
    </div>
  );
}

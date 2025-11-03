"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserEmail, isAuthenticated, setProfile } from "@/lib/auth";

export default function ParentStepA() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    homeAddress: '', homePostal: '', workAddress: '', workPostal: '',
    preferredContact: '', emergencyContact: '', consent: false,
  });

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    const email = getCurrentUserEmail();
    setForm(f => ({ ...f, email: email || '' }));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const email = getCurrentUserEmail();
    if (!email) return;
    // E.164 validation for +1 country code (basic)
    const normalized = form.phone.replace(/[^+\d]/g, '');
    const e164US = /^\+1\d{10}$/;
    if (!e164US.test(normalized)) {
      alert('Please enter phone in E.164 format, e.g., +12045550123');
      return;
    }
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, profile: form }) });
    } else {
      setProfile(email, form);
    }
    router.push('/onboarding/parent/step-b');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="max-w-2xl w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Parent Profile</h1>
        <div className="grid grid-cols-2 gap-4">
          <div><label>First name</label><input className="w-full px-3 py-2 border rounded" value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})} required /></div>
          <div><label>Last name</label><input className="w-full px-3 py-2 border rounded" value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})} required /></div>
          <div className="col-span-2"><label>Email</label><input className="w-full px-3 py-2 border rounded" value={form.email} disabled /></div>
          <div className="col-span-2"><label>Phone (+1…)</label><input className="w-full px-3 py-2 border rounded" placeholder="+1 204 555 0123" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required /></div>
          <div className="col-span-2"><label>Home address</label><input className="w-full px-3 py-2 border rounded" value={form.homeAddress} onChange={e=>setForm({...form, homeAddress:e.target.value})} required /></div>
          <div><label>Home postal</label><input className="w-full px-3 py-2 border rounded" value={form.homePostal} onChange={e=>setForm({...form, homePostal:e.target.value})} required /></div>
          <div><label>Work address</label><input className="w-full px-3 py-2 border rounded" value={form.workAddress} onChange={e=>setForm({...form, workAddress:e.target.value})} /></div>
          <div><label>Work postal</label><input className="w-full px-3 py-2 border rounded" value={form.workPostal} onChange={e=>setForm({...form, workPostal:e.target.value})} /></div>
          <div><label>Preferred contact</label><input className="w-full px-3 py-2 border rounded" value={form.preferredContact} onChange={e=>setForm({...form, preferredContact:e.target.value})} /></div>
          <div className="col-span-2"><label>Secondary emergency contact</label><input className="w-full px-3 py-2 border rounded" value={form.emergencyContact} onChange={e=>setForm({...form, emergencyContact:e.target.value})} /></div>
          <div className="col-span-2 flex items-center gap-2"><input type="checkbox" checked={form.consent} onChange={e=>setForm({...form, consent:e.target.checked})} required /><span>I consent to share my data with providers</span></div>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded" type="submit">Continue</button>
        </div>
      </form>
    </div>
  );
}

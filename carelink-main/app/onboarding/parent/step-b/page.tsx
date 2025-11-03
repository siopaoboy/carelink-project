"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserEmail, isAuthenticated, setChildren } from "@/lib/auth";
import { normalizeChildKeys } from "@/lib/children";

export default function ParentStepB() {
  const router = useRouter();
  const [children, setChildrenState] = useState<any[]>([]);
  function calcAge(dob: string) {
    if (!dob) return '';
    const d = new Date(dob);
    if (isNaN(d.getTime())) return '';
    const now = new Date();
    let years = now.getFullYear() - d.getFullYear();
    let months = now.getMonth() - d.getMonth();
    if (months < 0) { years--; months += 12; }
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
  }

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setChildren?.((arr: any[]) => (arr || []).map(normalizeChildKeys))
  }, []);

  function addChild() {
    setChildrenState(prev => [...prev, { id: Math.random().toString(36).slice(2), name: '', dob: '', gender: '', special: '', startDate: '', days: '' }]);
  }
  function updateChild(id: string, key: string, value: string) {
    setChildrenState(prev => prev.map(c => c.id===id?{...c,[key]:value}:c));
  }
  function removeChild(id: string) {
    setChildrenState(prev => prev.filter(c=>c.id!==id));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const email = getCurrentUserEmail();
    if (!email) return;
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      await fetch('/api/children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, children }) });
    } else {
      setChildren(email, children);
    }
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={submit} className="max-w-3xl w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Child Profiles</h1>
        <div className="space-y-3">
          {children.map((child, idx) => (
            <div key={child.id} className="border p-4 rounded space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div><label>Name</label><input className="w-full px-3 py-2 border rounded" value={child.name} onChange={e=>updateChild(child.id,'name',e.target.value)} required /></div>
                <div>
                  <label>Date of birth</label>
                  <input type="date" className="w-full px-3 py-2 border rounded" value={child.dob} onChange={e=>updateChild(child.id,'dob',e.target.value)} required />
                  <p className="text-xs text-muted-foreground mt-1">Age: {calcAge(child.dob)}</p>
                </div>
                <div><label>Gender (optional)</label><input className="w-full px-3 py-2 border rounded" value={child.gender} onChange={e=>updateChild(child.id,'gender',e.target.value)} /></div>
                <div>
                  <label className="block text-sm font-medium">Special Details</label>
                  <textarea
                    className="mt-1 w-full rounded-md border p-2 placeholder:opacity-60"
                    placeholder="Anything important to share about your child (health, behavior, routines, learning, other notes)"
                    value={(child.specialDetails ?? "")}
                    onChange={(e) => updateChild(idx, { specialDetails: e.target.value })}
                    rows={3}
                  />
                </div>
                <div><label>Preferred start date</label><input type="date" className="w-full px-3 py-2 border rounded" value={child.startDate} onChange={e=>updateChild(child.id,'startDate',e.target.value)} /></div>
                <div><label>Preferred days/hours</label><input className="w-full px-3 py-2 border rounded" value={child.days} onChange={e=>updateChild(child.id,'days',e.target.value)} /></div>
              </div>
              <div className="text-right"><button type="button" className="text-red-600" onClick={()=>removeChild(child.id)}>Remove</button></div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={addChild} className="px-3 py-2 border rounded">Add child</button>
          <div className="flex-1" />
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded" type="submit">Finish</button>
        </div>
      </form>
    </div>
  );
}

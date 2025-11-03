"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserEmail, isAuthenticated, mergeProviderProfile } from "@/lib/auth";

export default function ProviderStepB() {
  const router = useRouter();
  const [services, setServices] = useState({
    ageGroups: { infant: false, toddler: false, preschool: false, schoolAge: false },
    subsidyAccepted: false,
    capacity: '',
    tuitionRange: '',
    features: { meals: false, transportation: false, outdoor: false, nap: false, pottyTraining: false },
    businessHours: {
      Monday:    { open: '08:00', close: '17:30', closed: false },
      Tuesday:   { open: '08:00', close: '17:30', closed: false },
      Wednesday: { open: '08:00', close: '17:30', closed: false },
      Thursday:  { open: '08:00', close: '17:30', closed: false },
      Friday:    { open: '08:00', close: '17:30', closed: false },
      Saturday:  { open: '08:30', close: '12:30', closed: true },
      Sunday:    { open: '08:30', close: '12:30', closed: true },
    },
  });
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] as const;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const email = getCurrentUserEmail();
    if (!email) return;
    // Simple validation: open < close when not closed
    for (const d of days) {
      const bh = (services as any).businessHours[d];
      if (!bh.closed && bh.open >= bh.close) { setError(`${d}: open time must be before close time`); return; }
    }
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      await fetch('/api/provider', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, provider: { services } }) });
    } else {
      mergeProviderProfile(email, { services });
    }
    router.push('/provider/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={submit} className="max-w-2xl w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Services & Availability</h1>
        <div className="space-y-3">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div>
            <div className="font-medium mb-1">Age groups accepted</div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={services.ageGroups.infant} onChange={e=>setServices(s=>({...s, ageGroups:{...s.ageGroups, infant:e.target.checked}}))} /> Infant</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={services.ageGroups.toddler} onChange={e=>setServices(s=>({...s, ageGroups:{...s.ageGroups, toddler:e.target.checked}}))} /> Toddler</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={services.ageGroups.preschool} onChange={e=>setServices(s=>({...s, ageGroups:{...s.ageGroups, preschool:e.target.checked}}))} /> Preschool</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={services.ageGroups.schoolAge} onChange={e=>setServices(s=>({...s, ageGroups:{...s.ageGroups, schoolAge:e.target.checked}}))} /> School Age</label>
          </div>
          <div>
            <div className="font-medium mb-2">Business hours</div>
            <div className="grid grid-cols-1 gap-2">
              {days.map(d => (
                <div key={d} className="flex items-center gap-3 text-sm">
                  <div className="w-28 shrink-0 font-medium">{d}</div>
                  <label className="flex items-center gap-2">
                    <span className="text-muted-foreground">Closed</span>
                    <input type="checkbox" checked={(services as any).businessHours[d].closed} onChange={e=>setServices(s=>({
                      ...s,
                      businessHours: { ...s.businessHours, [d]: { ...s.businessHours[d as keyof typeof s.businessHours], closed: e.target.checked } }
                    }))} />
                  </label>
                  <input type="time" className="px-2 py-1 border rounded" disabled={(services as any).businessHours[d].closed} value={(services as any).businessHours[d].open} onChange={e=>setServices(s=>({
                    ...s,
                    businessHours: { ...s.businessHours, [d]: { ...s.businessHours[d as keyof typeof s.businessHours], open: e.target.value } }
                  }))} />
                  <span className="text-muted-foreground">to</span>
                  <input type="time" className="px-2 py-1 border rounded" disabled={(services as any).businessHours[d].closed} value={(services as any).businessHours[d].close} onChange={e=>setServices(s=>({
                    ...s,
                    businessHours: { ...s.businessHours, [d]: { ...s.businessHours[d as keyof typeof s.businessHours], close: e.target.value } }
                  }))} />
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={services.subsidyAccepted} onChange={e=>setServices(s=>({...s, subsidyAccepted:e.target.checked}))} /> Subsidy accepted</label>
          <div>
            <div className="font-medium mb-1">Amenities & Services</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={services.features.meals} onChange={e=>setServices(s=>({...s, features:{...s.features, meals:e.target.checked}}))} /> Meals provided</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={services.features.transportation} onChange={e=>setServices(s=>({...s, features:{...s.features, transportation:e.target.checked}}))} /> Transportation</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={services.features.outdoor} onChange={e=>setServices(s=>({...s, features:{...s.features, outdoor:e.target.checked}}))} /> Outdoor space</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={services.features.nap} onChange={e=>setServices(s=>({...s, features:{...s.features, nap:e.target.checked}}))} /> Nap time</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={services.features.pottyTraining} onChange={e=>setServices(s=>({...s, features:{...s.features, pottyTraining:e.target.checked}}))} /> Potty training</label>
            </div>
          </div>
          <div><label>Capacity</label><input className="w-full px-3 py-2 border rounded" value={services.capacity} onChange={e=>setServices(s=>({...s, capacity:e.target.value}))} /></div>
          <div><label>Tuition range</label><input className="w-full px-3 py-2 border rounded" placeholder="$600-1200/month" value={services.tuitionRange} onChange={e=>setServices(s=>({...s, tuitionRange:e.target.value}))} /></div>
        </div>
        <div className="flex justify-end"><button className="px-4 py-2 bg-primary text-primary-foreground rounded" type="submit">Finish</button></div>
      </form>
    </div>
  );
}

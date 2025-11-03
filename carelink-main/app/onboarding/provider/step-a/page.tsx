"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserEmail, isAuthenticated, mergeProviderProfile } from "@/lib/auth";
import { useRef } from "react";

export default function ProviderStepA() {
  const router = useRouter();
  const [form, setForm] = useState({
    orgName: '', licenseId: '', contactName: '', contactEmail: '', contactPhone: '',
    address: '', postal: '', description: '', website: '', languages: '' as string,
    tags: '' as string,
  });
  const [logo, setLogo] = useState<string | null>(null);
  const [licenses, setLicenses] = useState<Array<{id:string,name:string,size:string,dataUrl:string}>>([]);
  const logoInputRef = useRef<HTMLInputElement|null>(null);
  const licenseInputRef = useRef<HTMLInputElement|null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/login'); return; }
    const email = getCurrentUserEmail();
    setForm(f => ({ ...f, contactEmail: email || '' }));
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const email = getCurrentUserEmail();
    if (!email) return;
    // Basic E.164 validation for phone (optional)
    const normalized = form.contactPhone.replace(/[^+\d]/g, '');
    if (normalized && !/^\+\d{8,15}$/.test(normalized)) { setError('Phone must be E.164 format, e.g., +12045550123'); return; }
    const payload = { ...form, contactPhone: normalized, logo, licenses, languages: form.languages.split(',').map(s=>s.trim()).filter(Boolean), tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean) };
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      await fetch('/api/provider', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, provider: payload }) });
    } else {
      mergeProviderProfile(email, payload);
    }
    router.push('/onboarding/provider/step-b');
  }

  function onLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function persistLogo() {
    const email = getCurrentUserEmail();
    if (!email || !logo) return;
    const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (hasSupabase) {
      await fetch('/api/provider', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, provider: { logo } }) });
    } else {
      mergeProviderProfile(email, { logo });
    }
  }

  function onLicensesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files; if (!files) return;
    const arr = Array.from(files);
    arr.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setLicenses(prev => [...prev, { id: Math.random().toString(36).slice(2), name: file.name, size: `${(file.size/1024).toFixed(1)} KB`, dataUrl: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <form onSubmit={submit} className="max-w-2xl w-full p-6 bg-background rounded space-y-4">
        <h1 className="text-2xl font-bold">Provider Profile</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label>Organization logo</label>
            <div className="flex items-center gap-3 mt-1">
              <input ref={logoInputRef} hidden type="file" accept="image/*" onChange={onLogoChange} />
              <button type="button" className="px-3 py-2 border rounded" onClick={()=>logoInputRef.current?.click()}>Upload</button>
              <button type="button" className="px-3 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50" disabled={!logo} onClick={persistLogo}>Set Logo</button>
              {logo && <img src={logo} alt="logo" className="w-12 h-12 rounded object-cover border" />}
            </div>
          </div>
          <div className="col-span-2"><label>Organization name</label><input className="w-full px-3 py-2 border rounded" value={form.orgName} onChange={e=>setForm({...form, orgName:e.target.value})} required /></div>
          <div><label>License ID</label><input className="w-full px-3 py-2 border rounded" value={form.licenseId} onChange={e=>setForm({...form, licenseId:e.target.value})} required /></div>
          <div><label>Contact name</label><input className="w-full px-3 py-2 border rounded" value={form.contactName} onChange={e=>setForm({...form, contactName:e.target.value})} required /></div>
          <div className="col-span-2"><label>Contact email</label><input className="w-full px-3 py-2 border rounded" value={form.contactEmail} onChange={e=>setForm({...form, contactEmail:e.target.value})} required /></div>
          <div><label>Contact phone</label><input className="w-full px-3 py-2 border rounded" placeholder="+1 204 555 0123" value={form.contactPhone} onChange={e=>setForm({...form, contactPhone:e.target.value})} required /></div>
          <div className="col-span-2"><label>Address</label><input className="w-full px-3 py-2 border rounded" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} required /></div>
          <div><label>Postal code</label><input className="w-full px-3 py-2 border rounded" value={form.postal} onChange={e=>setForm({...form, postal:e.target.value})} required /></div>
          <div className="col-span-2"><label>Website</label><input className="w-full px-3 py-2 border rounded" placeholder="https://" value={form.website} onChange={e=>setForm({...form, website:e.target.value})} /></div>
          <div className="col-span-2"><label>Description</label><textarea className="w-full px-3 py-2 border rounded" rows={3} value={form.description} onChange={e=>setForm({...form, description:e.target.value})} /></div>
          <div className="col-span-2"><label>Languages (comma separated)</label><input className="w-full px-3 py-2 border rounded" placeholder="English, French" value={form.languages} onChange={e=>setForm({...form, languages:e.target.value})} /></div>
          <div className="col-span-2"><label>Service tags (comma separated)</label><input className="w-full px-3 py-2 border rounded" placeholder="Licensed, Inclusive, Outdoor Play" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} /></div>
          <div className="col-span-2">
            <label>Upload licenses (PDF/image)</label>
            <div className="mt-1 flex items-center gap-3">
              <input ref={licenseInputRef} hidden type="file" multiple accept="application/pdf,image/*" onChange={onLicensesChange} />
              <button type="button" className="px-3 py-2 border rounded" onClick={()=>licenseInputRef.current?.click()}>Add License</button>
            </div>
            {licenses.length>0 && (
              <ul className="mt-2 text-sm">
                {licenses.map(l => (
                  <li key={l.id} className="flex items-center gap-2"><span>📄</span><span>{l.name}</span><span className="text-muted-foreground">({l.size})</span></li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex justify-end"><button className="px-4 py-2 bg-primary text-primary-foreground rounded" type="submit">Continue</button></div>
      </form>
    </div>
  );
}

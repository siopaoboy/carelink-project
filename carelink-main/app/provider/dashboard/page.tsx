"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserEmail, getUser, logout as authLogout } from "@/lib/auth";
import { Users, Bell } from "lucide-react";

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const em = getCurrentUserEmail();
    if (!em) { router.replace('/login'); return; }
    const rec = getUser(em);
    if (!rec?.verified) { router.replace('/verify-sent?email='+encodeURIComponent(em)); return; }
    if (rec?.role !== 'Provider') { router.replace('/dashboard'); return; }
    setEmail(em);
    setAuthChecked(true);
  }, [router]);

  function handleLogout() {
    authLogout();
    router.push('/');
  }

  if (!authChecked) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => router.push('/search')}>
              <div className="flex items-center gap-2">
                <img src="/CareLink%20logo4.png" alt="CareLink" className="h-8 w-auto" onError={(e)=>{(e.currentTarget as HTMLImageElement).src='/placeholder-logo.png'}} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon"><Bell className="w-5 h-5" /></Button>
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Provider Dashboard</h1>
            <p className="text-muted-foreground">Manage your center profile, openings, and applications</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3"><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Edit organization info and license details</p>
              <Link href="/onboarding/provider/step-a"><Button variant="outline">Edit Profile</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle>Services & Availability</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Set age groups, hours, capacity, tuition</p>
              <Link href="/onboarding/provider/step-b"><Button variant="outline">Edit Services</Button></Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle>Incoming Applications</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">Review and respond to new applications</p>
              <Button>Open Applications</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

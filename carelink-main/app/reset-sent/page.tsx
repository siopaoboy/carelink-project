"use client";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetSentPage() {
  const sp = useSearchParams();
  const email = sp.get('email');
  const token = sp.get('token');
  const resetUrl = token ? `/reset-password?token=${encodeURIComponent(token)}` : '/reset-password';
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-6 bg-background rounded">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-4">We sent a password reset link to {email}</p>
        <Link href={resetUrl} className="text-primary underline">Open reset link (demo)</Link>
      </div>
    </div>
  );
}

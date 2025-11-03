"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-6">
        <img
          src="/bright-colorful-daycare-center-exterior.jpg"
          alt="Childcare Illustration"
          className="w-4/5 mx-auto mb-2 mt-2"
          style={{ maxHeight: 180, objectFit: 'contain' }}
        />
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-2">Find the Right Childcare</h1>
        <p className="text-base text-gray-500 mb-6">
          Real-time openings, easy applications, all in one place.
        </p>
        <div className="flex gap-4 justify-center">
          <Button className="flex-1 bg-primary text-primary-foreground font-bold rounded py-3 text-base hover:bg-primary/90" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button className="flex-1 bg-background text-primary border border-primary font-bold rounded py-3 text-base hover:bg-primary/5" onClick={() => router.push('/register')}>
            Register
          </Button>
        </div>
      </div>
    </div>
  );
}

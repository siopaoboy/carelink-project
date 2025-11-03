"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function HomeSimple() {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/30 text-foreground">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-background/95 rounded-2xl shadow-lg ring-2 ring-primary/20">
        <h1 className="text-3xl md:text-4xl font-bold text-primary drop-shadow mb-2">Find the Right Childcare</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Real-time openings, easy applications, all in one place.
        </p>
        <div className="flex flex-col gap-4">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-primary" onClick={() => router.push('/login')}>
            Login
          </Button>
          <Button className="w-full bg-primary/10 text-primary border border-primary hover:bg-primary/20 focus:ring-2 focus:ring-primary" onClick={() => router.push('/register')}>
            Register
          </Button>
        </div>
      </div>
    </div>
  )
}

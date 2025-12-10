"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Accept any credentials for now - will integrate API later
    router.push("/dashboard/calendar");
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6 sm:py-12" style={{ background: 'linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via), var(--gradient-to))' }}>
      {/* Pattern Overlay - Dot Grid */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, oklch(20% 0.02 255) 1.5px, transparent 1.5px)`,
          backgroundSize: '32px 32px',
          backgroundPosition: '0 0, 16px 16px',
        }}
      />
      {/* Pattern Overlay - Subtle Grid Lines */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(to right, oklch(20% 0.02 255) 1px, transparent 1px),
            linear-gradient(to bottom, oklch(20% 0.02 255) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-[32px] font-bold tracking-wide">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full rounded-xl">
                Sign In
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}


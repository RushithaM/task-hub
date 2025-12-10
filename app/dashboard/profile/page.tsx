"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles, User, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[var(--gradient-via)] to-[var(--gradient-to)]">
      {/* Sticky Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-card/90 backdrop-blur-xl shadow-sm"
      >
        <div className="mx-auto max-w-screen-xl px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-wide">TASK HUB</h1>
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard/analytics"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Analytics
              </Link>
              <Sparkles className="h-5 w-5 stroke-[1.5] text-primary" />
              <Link
                href="/dashboard/calendar"
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-3 py-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                  <User className="h-4 w-4 stroke-[1.5] text-primary" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-tight">John doe</p>
                  <p className="text-xs text-muted-foreground leading-tight">Engineer</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mx-auto max-w-screen-xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Profile Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-wide">Profile</h2>
            <Link
              href="/dashboard/calendar"
              className="rounded-lg p-1.5 transition-colors hover:bg-accent"
            >
              <X className="h-5 w-5 stroke-[1.5] text-muted-foreground" />
            </Link>
          </div>

          {/* Profile Card */}
          <Card className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex flex-col items-center space-y-6">
              {/* Avatar */}
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
                <User className="h-12 w-12 stroke-[1.5] text-primary" />
              </div>

              {/* Name and Title */}
              <div className="text-center">
                <h3 className="text-2xl font-bold tracking-wide">John doe</h3>
                <p className="mt-1 text-muted-foreground">Engineer</p>
              </div>

              {/* Task Statistics */}
              <Card className="w-full rounded-xl border border-border bg-muted/30 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Tasks</span>
                    <span className="text-sm font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completed</span>
                    <span className="text-sm font-semibold">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <span className="text-sm font-semibold">0%</span>
                  </div>
                </div>
              </Card>

              {/* Profile Information */}
              <div className="w-full space-y-4">
                <h4 className="text-lg font-bold tracking-wide">Profile Information</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      type="text"
                      defaultValue="John doe"
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      type="text"
                      defaultValue="Engineer"
                      className="rounded-xl"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <Button className="w-full rounded-xl" size="lg">
                  Edit Profile
                </Button>
                <Button variant="outline" className="w-full rounded-xl" size="lg">
                  Change Password
                </Button>
                <Button
                  variant="destructive"
                  className="w-full rounded-xl"
                  size="lg"
                >
                  <LogOut className="mr-2 h-4 w-4 stroke-[1.5]" />
                  Log Out
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}


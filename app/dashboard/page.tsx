"use client";

import { motion } from "framer-motion";
import { Plus, CheckSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via), var(--gradient-to))' }}>
      <div className="px-6 py-10">
        <div className="mx-auto max-w-screen-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[32px] font-bold tracking-wide">
                  Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your tasks and stay productive
                </p>
              </div>
              <Button className="rounded-xl">
                <Plus className="mr-2 h-4 w-4 stroke-[1.5]" />
                New Task
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3">
                    <CheckSquare className="h-5 w-5 stroke-[1.5] text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-secondary p-3">
                    <Clock className="h-5 w-5 stroke-[1.5] text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold">5</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="rounded-2xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-bold tracking-wide">
                Recent Tasks
              </h2>
              <div className="space-y-3">
                <p className="text-center text-muted-foreground">
                  No tasks yet. Create your first task to get started!
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}


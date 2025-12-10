"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sparkles,
  User,
  TrendingUp,
  AlertCircle,
  Brain,
  CheckCircle2,
  BarChart3,
  Clock,
  Target,
  Zap,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="bg-gradient-to-br from-background via-[var(--gradient-via)] to-[var(--gradient-to)]">
      {/* Sticky Navigation Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-card/90 backdrop-blur-xl shadow-sm"
      >
        <div className="w-full px-6 py-4 relative">
          {/* Pattern Design - Fades to edges */}
          <div className="absolute inset-0 left-0 right-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle, oklch(60% 0.12 280) 1px, transparent 1px)`,
                backgroundSize: '16px 16px',
                backgroundPosition: 'center',
                maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                opacity: 0.15,
              }}
            />
          </div>

          <div className="relative flex items-center z-10">
            {/* Left - TASK HUB */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold tracking-wide">TASK HUB</h1>
            </div>
            
            {/* Right - Navigation Items */}
            <div className="ml-auto flex items-center gap-6">
              <Link
                href="/dashboard/calendar"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Dashboard
              </Link>
              <Sparkles className="h-5 w-5 stroke-[1.5] text-primary" />
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-3 py-2 transition-colors hover:bg-accent/30"
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

      <div className="mx-auto max-w-screen-xl px-6 pt-8 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3"
            >
              <div className="inline-flex rounded-xl bg-primary/10 p-2">
                <BarChart3 className="h-4 w-4 stroke-[1.5] text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-wide">Analytics</h2>
                <p className="text-sm text-muted-foreground">
                  Track your productivity and task management
                </p>
              </div>
            </motion.div>
          </div>

          {/* Overview Cards - Top Row */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-3 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Total Tasks</p>
                </div>
                <p className="text-center text-2xl font-bold tracking-tight">60</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">This month</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-3 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-1.5">
                    <TrendingUp className="h-3.5 w-3.5 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">Completion Rate</p>
                </div>
                <p className="text-center text-2xl font-bold tracking-tight">78%</p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-primary">+5%</span> from last month
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-lg hover:border-destructive/30">
                <div className="mb-3 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-destructive/10 p-1.5">
                    <AlertCircle className="h-3.5 w-3.5 stroke-[1.5] text-destructive" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">High Priority</p>
                </div>
                <p className="text-center text-2xl font-bold tracking-tight text-destructive">12</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">Requires attention</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-3 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-1.5">
                    <Brain className="h-3.5 w-3.5 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground">AI Suggestions</p>
                </div>
                <p className="text-center text-2xl font-bold tracking-tight">24</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">Tasks optimized</p>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section - Larger Graphs */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {/* Donut Chart - Task Status - Larger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -4 }}
              className="md:col-span-1 lg:col-span-1"
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-4 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-2">
                    <Clock className="h-4 w-4 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Task Status</p>
                </div>
                <div className="relative mx-auto h-64 w-64">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    {/* Completed - 60% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="oklch(60% 0.12 280)"
                      strokeWidth="20"
                      strokeDasharray={`${60 * 2.2} ${100 * 2.2}`}
                      strokeDashoffset="0"
                      className="transition-all hover:opacity-80"
                    />
                    {/* In Progress - 25% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="oklch(70% 0.10 280)"
                      strokeWidth="20"
                      strokeDasharray={`${25 * 2.2} ${100 * 2.2}`}
                      strokeDashoffset={`-${60 * 2.2}`}
                      className="transition-all hover:opacity-80"
                    />
                    {/* Pending - 15% */}
                    <circle
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke="oklch(85% 0.05 280)"
                      strokeWidth="20"
                      strokeDasharray={`${15 * 2.2} ${100 * 2.2}`}
                      strokeDashoffset={`-${85 * 2.2}`}
                      className="transition-all hover:opacity-80"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">60%</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[oklch(60%_0.12_280)]"></div>
                      <span className="text-muted-foreground">Completed</span>
                    </div>
                    <span className="font-semibold">60%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[oklch(70%_0.10_280)]"></div>
                      <span className="text-muted-foreground">In Progress</span>
                    </div>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[oklch(85%_0.05_280)]"></div>
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                    <span className="font-semibold">15%</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Bar Chart - Weekly Tasks - Larger */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ y: -4 }}
              className="md:col-span-1 lg:col-span-2"
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-4 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-2">
                    <Target className="h-4 w-4 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Weekly Tasks Distribution</p>
                </div>
                <div className="flex items-end justify-between gap-2 h-64">
                  {[4, 7, 5, 8, 6, 2, 1].map((value, index) => {
                    const maxValue = 8;
                    const height = (value / maxValue) * 100;
                    return (
                      <div key={index} className="flex flex-1 flex-col items-center gap-2 group/bar">
                        <div className="relative w-full flex flex-col items-center">
                          <div
                            className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer group-hover/bar:shadow-lg"
                            style={{
                              height: `${height}%`,
                              minHeight: "8px",
                              background: `linear-gradient(to top, 
                                oklch(60% 0.12 280) 0%, 
                                oklch(70% 0.08 280) 100%)`,
                            }}
                          />
                          <div className="absolute -top-6 opacity-0 group-hover/bar:opacity-100 transition-opacity">
                            <div className="rounded-lg bg-foreground px-2 py-1 text-xs font-semibold text-background shadow-lg">
                              {value}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Tasks This Week</span>
                    <span className="text-xl font-bold">33</span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Priority Distribution and Monthly Trend - Half and Half */}
            <div className="md:col-span-2 lg:col-span-3 grid gap-6 md:grid-cols-2">
            {/* Donut Chart - Priority Distribution - Smaller */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              whileHover={{ y: -4 }}
              className="md:col-span-1"
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-4 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-2">
                    <Zap className="h-4 w-4 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Priority Distribution</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative mx-auto h-48 w-48">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      {/* High - 20% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="oklch(0.577 0.245 27.325)"
                        strokeWidth="20"
                        strokeDasharray={`${20 * 2.2} ${100 * 2.2}`}
                        strokeDashoffset="0"
                        className="transition-all hover:opacity-80"
                      />
                      {/* Medium - 40% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="oklch(0.7 0.15 50)"
                        strokeWidth="20"
                        strokeDasharray={`${40 * 2.2} ${100 * 2.2}`}
                        strokeDashoffset={`-${20 * 2.2}`}
                        className="transition-all hover:opacity-80"
                      />
                      {/* Low - 40% */}
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        fill="none"
                        stroke="oklch(0.65 0.15 150)"
                        strokeWidth="20"
                        strokeDasharray={`${40 * 2.2} ${100 * 2.2}`}
                        strokeDashoffset={`-${60 * 2.2}`}
                        className="transition-all hover:opacity-80"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold">60</p>
                        <p className="text-[10px] text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </div>
                  <div className="w-full space-y-2">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[oklch(0.577_0.245_27.325)]"></div>
                        <span className="text-xs font-medium">High</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">12</span>
                        <span className="text-[10px] text-muted-foreground ml-1">20%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[oklch(0.7_0.15_50)]"></div>
                        <span className="text-xs font-medium">Medium</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">24</span>
                        <span className="text-[10px] text-muted-foreground ml-1">40%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[oklch(0.65_0.15_150)]"></div>
                        <span className="text-xs font-medium">Low</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold">24</span>
                        <span className="text-[10px] text-muted-foreground ml-1">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Monthly Completion Trend - Line/Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ y: -4 }}
              className="md:col-span-1"
            >
              <Card className="group h-full rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary/30">
                <div className="mb-4 flex items-center gap-2">
                  <div className="inline-flex rounded-xl bg-primary/10 p-2">
                    <Activity className="h-4 w-4 stroke-[1.5] text-primary" />
                  </div>
                  <p className="text-sm font-bold text-muted-foreground">Monthly Trend</p>
                </div>
                <div className="relative h-64 w-full">
                  <svg viewBox="0 0 300 200" className="h-full w-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="30"
                        y1={40 + i * 40}
                        x2="270"
                        y2={40 + i * 40}
                        stroke="oklch(0.5 0 0 / 0.1)"
                        strokeWidth="1"
                        strokeDasharray="2 2"
                      />
                    ))}
                    {/* Y-axis labels */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <text
                        key={i}
                        x="25"
                        y={45 + i * 40}
                        textAnchor="end"
                        className="text-[10px] fill-muted-foreground"
                        fontSize="10"
                      >
                        {(4 - i) * 20}
                      </text>
                    ))}
                    {/* Area under the curve */}
                    <path
                      d="M 30 160 L 60 140 L 90 100 L 120 80 L 150 60 L 180 70 L 210 50 L 240 40 L 270 40 L 270 160 Z"
                      fill="url(#gradient)"
                      opacity="0.3"
                    />
                    {/* Line */}
                    <path
                      d="M 30 160 L 60 140 L 90 100 L 120 80 L 150 60 L 180 70 L 210 50 L 240 40 L 270 40"
                      fill="none"
                      stroke="oklch(60% 0.12 280)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Data points */}
                    {[
                      { x: 30, y: 160 },
                      { x: 60, y: 140 },
                      { x: 90, y: 100 },
                      { x: 120, y: 80 },
                      { x: 150, y: 60 },
                      { x: 180, y: 70 },
                      { x: 210, y: 50 },
                      { x: 240, y: 40 },
                      { x: 270, y: 40 },
                    ].map((point, i) => (
                      <circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill="oklch(60% 0.12 280)"
                        className="transition-all hover:r-6"
                      />
                    ))}
                    {/* X-axis labels */}
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((month, i) => (
                      <text
                        key={i}
                        x={30 + i * 30}
                        y="195"
                        textAnchor="middle"
                        className="text-[10px] fill-muted-foreground"
                        fontSize="10"
                      >
                        {month}
                      </text>
                    ))}
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="oklch(60% 0.12 280)" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="oklch(60% 0.12 280)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                      <p className="text-xl font-bold mt-1">47</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">This Month</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-sm font-semibold text-primary">+12%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

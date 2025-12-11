"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { apiClient } from "@/lib/api-client";

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; title: string | null } | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const [weeklyDistribution, setWeeklyDistribution] = useState<any>(null);
  const [priorityDistribution, setPriorityDistribution] = useState<any>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth] = useState(new Date());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
        
        // Fetch user profile
        const userResponse = await apiClient.getCurrentUser();
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data as { name: string; email: string; title?: string | null };
          setUser({
            name: userData.name,
            email: userData.email,
            title: userData.title || null,
          });
        }

        // Fetch all analytics data in parallel
        // Note: Not passing week parameter - API will default to current week
        const [overviewRes, statusRes, weeklyRes, priorityRes, trendRes] = await Promise.all([
          apiClient.getAnalyticsOverview(monthStr),
          apiClient.getTaskStatus(monthStr),
          apiClient.getWeeklyDistribution(), // Let API default to current week
          apiClient.getPriorityDistribution(monthStr),
          apiClient.getMonthlyTrend(9),
        ]);

        if (overviewRes.success) setOverview(overviewRes.data);
        if (statusRes.success) setTaskStatus(statusRes.data);
        if (weeklyRes.success) {
          console.log('Weekly Distribution Response:', weeklyRes.data);
          setWeeklyDistribution(weeklyRes.data);
        } else {
          console.log('Weekly Distribution failed:', weeklyRes);
        }
        if (priorityRes.success) setPriorityDistribution(priorityRes.data);
        if (trendRes.success) setMonthlyTrend(trendRes.data);
      } catch (error: any) {
        console.error('Failed to fetch analytics:', error);
        if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
          router.push('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentMonth, router]);
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
                  <p className="text-sm font-semibold leading-tight">{user?.name || "User"}</p>
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
                <p className="text-center text-2xl font-bold tracking-tight">
                  {loading ? "..." : (overview?.totalTasks || 0)}
                </p>
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
                <p className="text-center text-2xl font-bold tracking-tight">
                  {loading ? "..." : `${overview?.completionRate || 0}%`}
                </p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 text-primary" />
                  <span className="text-primary">
                    {monthlyTrend?.change ? `${monthlyTrend.change > 0 ? '+' : ''}${monthlyTrend.change}%` : '0%'}
                  </span> from last month
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
                <p className="text-center text-2xl font-bold tracking-tight text-destructive">
                  {loading ? "..." : (overview?.highPriorityTasks || 0)}
                </p>
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
                <p className="text-center text-2xl font-bold tracking-tight">
                  {loading ? "..." : (overview?.aiSuggestions || 0)}
                </p>
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
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <>
                      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                        {/* Completed */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="oklch(60% 0.12 280)"
                          strokeWidth="20"
                          strokeDasharray={`${(taskStatus?.percentages?.completed || 0) * 2.2} ${100 * 2.2}`}
                          strokeDashoffset="0"
                          className="transition-all hover:opacity-80"
                        />
                        {/* In Progress */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="oklch(70% 0.10 280)"
                          strokeWidth="20"
                          strokeDasharray={`${(taskStatus?.percentages?.inProgress || 0) * 2.2} ${100 * 2.2}`}
                          strokeDashoffset={`-${(taskStatus?.percentages?.completed || 0) * 2.2}`}
                          className="transition-all hover:opacity-80"
                        />
                        {/* Pending */}
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke="oklch(85% 0.05 280)"
                          strokeWidth="20"
                          strokeDasharray={`${(taskStatus?.percentages?.pending || 0) * 2.2} ${100 * 2.2}`}
                          strokeDashoffset={`-${((taskStatus?.percentages?.completed || 0) + (taskStatus?.percentages?.inProgress || 0)) * 2.2}`}
                          className="transition-all hover:opacity-80"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-3xl font-bold">{taskStatus?.percentages?.completed || 0}%</p>
                          <p className="text-xs text-muted-foreground">Completed</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[oklch(60%_0.12_280)]"></div>
                      <span className="text-muted-foreground">Completed</span>
                    </div>
                    <span className="font-semibold">{taskStatus?.percentages?.completed || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[oklch(70%_0.10_280)]"></div>
                      <span className="text-muted-foreground">In Progress</span>
                    </div>
                    <span className="font-semibold">{taskStatus?.percentages?.inProgress || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-[oklch(85%_0.05_280)]"></div>
                      <span className="text-muted-foreground">Pending</span>
                    </div>
                    <span className="font-semibold">{taskStatus?.percentages?.pending || 0}%</span>
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
                  {loading ? (
                    <div className="flex items-center justify-center w-full h-full">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : (() => {
                    // Handle different response structures
                    let distributionData: any[] = [];
                    if (weeklyDistribution) {
                      if (Array.isArray(weeklyDistribution)) {
                        distributionData = weeklyDistribution;
                      } else if (weeklyDistribution.distribution && Array.isArray(weeklyDistribution.distribution)) {
                        distributionData = weeklyDistribution.distribution;
                      } else if (weeklyDistribution.data && Array.isArray(weeklyDistribution.data)) {
                        distributionData = weeklyDistribution.data;
                      }
                    }
                    
                    console.log('Weekly Distribution Data:', distributionData);
                    
                    // Day name mappings - handle various formats
                    const dayNameMap: Record<string, number> = {
                      'monday': 0, 'mon': 0, '0': 0,
                      'tuesday': 1, 'tue': 1, '1': 1,
                      'wednesday': 2, 'wed': 2, '2': 2,
                      'thursday': 3, 'thu': 3, '3': 3,
                      'friday': 4, 'fri': 4, '4': 4,
                      'saturday': 5, 'sat': 5, '5': 5,
                      'sunday': 6, 'sun': 6, '6': 6,
                    };
                    
                    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
                    const weekData = Array(7).fill(null).map((_, index) => {
                      // Try to find matching day data
                      const dayData = distributionData.find((d: any) => {
                        if (d.day !== undefined && d.day !== null) {
                          const dayKey = String(d.day).toLowerCase().trim();
                          // Check if it matches the current day index
                          const mappedIndex = dayNameMap[dayKey];
                          if (mappedIndex !== undefined && mappedIndex === index) {
                            return true;
                          }
                          // Also check if day name contains the day abbreviation
                          if (dayKey.includes(daysOfWeek[index].toLowerCase().substring(0, 2))) {
                            return true;
                          }
                        }
                        // Check if there's a dayIndex or dayNumber field
                        if (d.dayIndex !== undefined && d.dayIndex === index) {
                          return true;
                        }
                        if (d.dayNumber !== undefined && d.dayNumber === index + 1) {
                          return true;
                        }
                        return false;
                      });
                      
                      if (dayData) {
                        return { 
                          day: daysOfWeek[index], 
                          count: Number(dayData.count || dayData.tasks || dayData.value || 0) 
                        };
                      }
                      return { day: daysOfWeek[index], count: 0 };
                    });
                    
                    console.log('Processed Week Data:', weekData);
                    
                    const maxValue = Math.max(...weekData.map((d: any) => d.count || 0), 1);
                    
                    return weekData.map((day: any, index: number) => {
                      const value = Number(day.count || 0);
                      // Calculate height as percentage of the container (h-64 = 256px)
                      const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
                      // Minimum height for visibility when there's a value
                      const barHeight = value > 0 ? Math.max(heightPercent, 8) : 0;
                      
                      return (
                        <div key={index} className="flex flex-1 flex-col items-center gap-2 group/bar h-full">
                          <div className="relative w-full flex flex-col items-end justify-end" style={{ height: '100%', minHeight: '200px' }}>
                            {value > 0 && (
                              <>
                                <div
                                  className="w-full rounded-t-lg transition-all hover:opacity-80 cursor-pointer group-hover/bar:shadow-lg"
                                  style={{
                                    height: `${barHeight}%`,
                                    minHeight: "12px",
                                    background: `linear-gradient(to top, 
                                      oklch(60% 0.12 280) 0%, 
                                      oklch(70% 0.08 280) 100%)`,
                                  }}
                                />
                                <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                                  <div className="rounded-lg bg-foreground px-2 py-1 text-xs font-semibold text-background shadow-lg whitespace-nowrap">
                                    {value} {value === 1 ? 'task' : 'tasks'}
                                  </div>
                                </div>
                              </>
                            )}
                            {value === 0 && (
                              <div className="w-full" style={{ height: '4px', minHeight: '4px' }} />
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground mt-auto">
                            {day.day}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Tasks This Week</span>
                    <span className="text-xl font-bold">
                      {loading ? "..." : (() => {
                        if (!weeklyDistribution) return 0;
                        if (typeof weeklyDistribution.total === 'number') return weeklyDistribution.total;
                        if (Array.isArray(weeklyDistribution)) {
                          return weeklyDistribution.reduce((sum: number, d: any) => sum + (d.count || 0), 0);
                        }
                        if (weeklyDistribution.distribution && Array.isArray(weeklyDistribution.distribution)) {
                          return weeklyDistribution.distribution.reduce((sum: number, d: any) => sum + (d.count || 0), 0);
                        }
                        return 0;
                      })()}
                    </span>
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
                  {loading ? (
                    <div className="flex items-center justify-center h-48">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="relative mx-auto h-48 w-48">
                        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                          {/* High Priority */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="oklch(0.577 0.245 27.325)"
                            strokeWidth="20"
                            strokeDasharray={`${(priorityDistribution?.high?.percentage || 0) * 2.2} ${100 * 2.2}`}
                            strokeDashoffset="0"
                            className="transition-all hover:opacity-80"
                          />
                          {/* Medium Priority */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="oklch(0.7 0.15 50)"
                            strokeWidth="20"
                            strokeDasharray={`${(priorityDistribution?.medium?.percentage || 0) * 2.2} ${100 * 2.2}`}
                            strokeDashoffset={`-${(priorityDistribution?.high?.percentage || 0) * 2.2}`}
                            className="transition-all hover:opacity-80"
                          />
                          {/* Low Priority */}
                          <circle
                            cx="50"
                            cy="50"
                            r="35"
                            fill="none"
                            stroke="oklch(0.65 0.15 150)"
                            strokeWidth="20"
                            strokeDasharray={`${(priorityDistribution?.low?.percentage || 0) * 2.2} ${100 * 2.2}`}
                            strokeDashoffset={`-${((priorityDistribution?.high?.percentage || 0) + (priorityDistribution?.medium?.percentage || 0)) * 2.2}`}
                            className="transition-all hover:opacity-80"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-2xl font-bold">{priorityDistribution?.total || 0}</p>
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
                            <span className="text-sm font-bold">{priorityDistribution?.high?.count || 0}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">{priorityDistribution?.high?.percentage || 0}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-warning/5 border border-warning/20">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[oklch(0.7_0.15_50)]"></div>
                            <span className="text-xs font-medium">Medium</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{priorityDistribution?.medium?.count || 0}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">{priorityDistribution?.medium?.percentage || 0}%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-primary/5 border border-primary/20">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-[oklch(0.65_0.15_150)]"></div>
                            <span className="text-xs font-medium">Low</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold">{priorityDistribution?.low?.count || 0}</span>
                            <span className="text-[10px] text-muted-foreground ml-1">{priorityDistribution?.low?.percentage || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">Loading...</p>
                    </div>
                  ) : (
                    <svg viewBox="0 0 300 200" className="h-full w-full" preserveAspectRatio="none">
                      {/* Grid lines */}
                      {(() => {
                        const maxValue = Math.max(...(monthlyTrend?.trend || [{ completed: 0 }]).map((t: any) => t.completed || 0), 1);
                        const gridLines = 5;
                        return [0, 1, 2, 3, 4].map((i) => (
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
                        ));
                      })()}
                      {/* Y-axis labels */}
                      {(() => {
                        const maxValue = Math.max(...(monthlyTrend?.trend || [{ completed: 0 }]).map((t: any) => t.completed || 0), 1);
                        return [0, 1, 2, 3, 4].map((i) => (
                          <text
                            key={i}
                            x="25"
                            y={45 + i * 40}
                            textAnchor="end"
                            className="text-[10px] fill-muted-foreground"
                            fontSize="10"
                          >
                            {Math.round((4 - i) * maxValue / 4)}
                          </text>
                        ));
                      })()}
                    {(() => {
                      const trendData = monthlyTrend?.trend || [];
                      if (trendData.length === 0) return null;
                      
                      const maxValue = Math.max(...trendData.map((t: any) => t.completed || 0), 1);
                      const chartHeight = 120;
                      const chartWidth = 240;
                      const startX = 30;
                      const startY = 40;
                      const endY = startY + chartHeight;
                      const pointSpacing = chartWidth / (trendData.length - 1 || 1);
                      
                      // Generate path data
                      const points = trendData.map((item: any, i: number) => {
                        const x = startX + i * pointSpacing;
                        const value = item.completed || 0;
                        const y = endY - (value / maxValue) * chartHeight;
                        return { x, y, value };
                      });
                      
                      // Create path string
                      const pathData = points.map((p: { x: number; y: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaPath = `${pathData} L ${points[points.length - 1].x} ${endY} L ${startX} ${endY} Z`;
                      
                      // Format month labels
                      const monthLabels = trendData.map((item: any) => {
                        const [year, month] = item.month.split('-');
                        const date = new Date(parseInt(year), parseInt(month) - 1);
                        return date.toLocaleString('default', { month: 'short' });
                      });
                      
                      return (
                        <>
                          {/* Area under the curve */}
                          <path
                            d={areaPath}
                            fill="url(#gradient)"
                            opacity="0.3"
                          />
                          {/* Line */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="oklch(60% 0.12 280)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {/* Data points */}
                          {points.map((point: { x: number; y: number }, i: number) => (
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
                          {monthLabels.map((month: string, i: number) => (
                            <text
                              key={i}
                              x={points[i]?.x || startX + i * pointSpacing}
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
                        </>
                      );
                    })()}
                  </svg>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Tasks Completed</p>
                      <p className="text-xl font-bold mt-1">
                        {loading ? "..." : (monthlyTrend?.currentCount || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">This Month</p>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-sm font-semibold text-primary">
                          {monthlyTrend?.change ? `${monthlyTrend.change > 0 ? '+' : ''}${monthlyTrend.change}%` : '0%'}
                        </span>
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

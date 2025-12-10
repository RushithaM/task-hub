"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus, Sparkles, User, X, Send, LogOut, Edit, Trash2, CalendarIcon, FileText, Clock, Link2, AlertCircle, CheckCircle2, CheckCircle, Circle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  timeStart?: string;
  timeEnd?: string;
  time?: string; // Keep for backward compatibility
  referenceLinks?: string[];
  date?: number;
  completed?: boolean;
}

interface DayData {
  date: number;
  month: "prev" | "current" | "next";
  isToday?: boolean;
  tasks?: Task[];
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // December 2025
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quickViewTask, setQuickViewTask] = useState<Task | null>(null);
  const [quickViewTaskDate, setQuickViewTaskDate] = useState<number | null>(null);
  const [isAIAssistOpen, setIsAIAssistOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskFormDate, setTaskFormDate] = useState<number | null>(null);
  const [taskFormDateFull, setTaskFormDateFull] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskPriority, setTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [taskTimeStart, setTaskTimeStart] = useState("");
  const [taskTimeEnd, setTaskTimeEnd] = useState("");
  const [taskTime, setTaskTime] = useState(""); // Keep for backward compatibility
  const [taskReferenceLinks, setTaskReferenceLinks] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(73);

  // Initialize tasks state with sample data
  const [tasksData, setTasksData] = useState<Record<number, Task[]>>({
    1: [
      { 
        id: "1-1", 
        title: "SEO Optimization", 
        description: "Optimize website content for better search engine rankings. Focus on keyword research, meta tags, and content structure. Review current analytics and identify improvement opportunities.",
        priority: "high" as const,
        timeStart: "09:00 AM",
        timeEnd: "10:00 AM",
        referenceLinks: [
          "https://moz.com/beginners-guide-to-seo",
          "https://developers.google.com/search/docs"
        ],
        date: 1
      },
      { 
        id: "1-2", 
        title: "Client Meeting", 
        description: "Quarterly review meeting with key stakeholders. Discuss project progress, budget updates, and upcoming milestones. Prepare presentation slides and status reports.",
        priority: "high" as const,
        timeStart: "11:00 AM",
        timeEnd: "12:00 PM",
        referenceLinks: [
          "https://docs.google.com/presentation/d/example",
          "https://drive.google.com/folder/status-reports"
        ],
        date: 1
      },
      { 
        id: "1-3", 
        title: "Design Review", 
        description: "Review new UI/UX designs for the mobile app. Provide feedback on user flow, accessibility, and visual consistency.",
        priority: "medium" as const,
        timeStart: "02:00 PM",
        timeEnd: "03:00 PM",
        referenceLinks: [
          "https://figma.com/design/mobile-app"
        ],
        date: 1
      },
    ],
    5: [
      { 
        id: "5-1", 
        title: "Team Meeting", 
        description: "Weekly team sync to discuss blockers, share updates, and align on priorities for the sprint.",
        priority: "medium" as const,
        timeStart: "02:00 PM",
        timeEnd: "03:00 PM",
        referenceLinks: [],
        date: 5
      }
    ],
    10: [
      { 
        id: "10-1", 
        title: "Code Review", 
        description: "Review pull requests for the authentication module. Check for security best practices, code quality, and test coverage.",
        priority: "high" as const,
        timeStart: "11:00 AM",
        timeEnd: "12:00 PM",
        referenceLinks: [
          "https://github.com/company/repo/pull/123"
        ],
        date: 10
      },
      { 
        id: "10-2", 
        title: "Standup", 
        description: "Daily standup meeting with the development team.",
        priority: "low" as const,
        timeStart: "09:00 AM",
        timeEnd: "09:30 AM",
        referenceLinks: [],
        date: 10
      },
    ],
    15: [
      { 
        id: "15-1", 
        title: "Sprint Planning", 
        description: "Plan tasks and user stories for the upcoming sprint. Estimate effort, assign tickets, and set sprint goals. Review backlog and prioritize features.",
        priority: "high" as const,
        timeStart: "10:00 AM",
        timeEnd: "12:00 PM",
        referenceLinks: [
          "https://jira.company.com/sprint/planning",
          "https://confluence.company.com/sprint-goals"
        ],
        date: 15
      }
    ],
  });

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  const today = new Date();
  const isToday = (date: number) => {
    return (
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear() &&
      date === today.getDate()
    );
  };

  const isPastDate = (date: number) => {
    const dayDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      date
    );
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    todayStart.setHours(0, 0, 0, 0);
    return dayDate < todayStart;
  };

  // Helper function to format task time for display
  const formatTaskTime = (task: Task): string => {
    if (task.timeStart && task.timeEnd) {
      return `${task.timeStart} - ${task.timeEnd}`;
    }
    if (task.time) {
      return task.time;
    }
    return "No time specified";
  };

  // Helper function to get priority-based color classes
  const getPriorityColors = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return {
          border: "border-destructive/60",
          bg: "bg-destructive/20",
          hoverBorder: "hover:border-destructive",
          hoverBg: "hover:bg-destructive/30",
          text: "text-destructive",
        };
      case "medium":
        return {
          border: "border-warning/60",
          bg: "bg-warning/20",
          hoverBorder: "hover:border-warning",
          hoverBg: "hover:bg-warning/30",
          text: "text-warning",
        };
      case "low":
        return {
          border: "border-primary/40",
          bg: "bg-primary/15",
          hoverBorder: "hover:border-primary/60",
          hoverBg: "hover:bg-primary/20",
          text: "text-primary",
        };
      default:
        return {
          border: "border-muted-foreground/40",
          bg: "bg-muted/15",
          hoverBorder: "hover:border-muted-foreground/60",
          hoverBg: "hover:bg-muted/20",
          text: "text-muted-foreground",
        };
    }
  };

  // Generate calendar days
  const generateCalendarDays = (): DayData[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Adjust to start from Monday (1) instead of Sunday (0)
    const startOffset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days: DayData[] = [];
    
    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        month: "prev",
      });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        month: "current",
        isToday: isToday(i),
        tasks: tasksData[i],
      });
    }
    
    // Next month's leading days - only fill one row (7 days max)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          month: "next",
        });
      }
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleMoreClick = (day: DayData) => {
    setSelectedDay(day);
    setIsDialogOpen(true);
  };

  const handleAddTask = (date: number | null = null) => {
    setEditingTask(null);
    // Auto-populate date: if null (global add), use current date; otherwise use provided date
    if (date === null) {
      // Global add task - auto-populate with current date
      const today = new Date();
      const todayDate = today.getDate();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();
      
      // Check if current month is being viewed
      if (
        currentMonth.getMonth() === todayMonth &&
        currentMonth.getFullYear() === todayYear
      ) {
        // Viewing current month - set to today's date
        setTaskFormDate(todayDate);
        setTaskFormDateFull(new Date(todayYear, todayMonth, todayDate));
      } else {
        // Viewing a different month - set to today's date
        setTaskFormDate(todayDate);
        setTaskFormDateFull(new Date(todayYear, todayMonth, todayDate));
      }
    } else {
      // Opened from date card - auto-populate with that date
      setTaskFormDate(date);
      setTaskFormDateFull(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date));
    }
    // Reset all form fields
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskTimeStart("");
    setTaskTimeEnd("");
    setTaskTime("");
    setTaskReferenceLinks("");
    setIsDatePickerOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task, date: number) => {
    setEditingTask(task);
    setTaskFormDate(date);
    setTaskFormDateFull(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date));
    setTaskTitle(task.title || "");
    setTaskDescription(task.description || "");
    setTaskPriority(task.priority || "medium");
    // Handle time - could be in timeStart/timeEnd or legacy time field
    if (task.timeStart && task.timeEnd) {
      setTaskTimeStart(task.timeStart);
      setTaskTimeEnd(task.timeEnd);
      setTaskTime(""); // Clear legacy time
    } else if (task.time) {
      // Parse legacy time format "09:00 AM - 10:00 AM"
      const timeMatch = task.time.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))?\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))?/);
      if (timeMatch) {
        setTaskTimeStart(timeMatch[1]?.trim() || "");
        setTaskTimeEnd(timeMatch[2]?.trim() || "");
      }
      setTaskTime(task.time);
    } else {
      setTaskTimeStart("");
      setTaskTimeEnd("");
      setTaskTime("");
    }
    setTaskReferenceLinks(task.referenceLinks?.join("\n") || "");
    setIsDatePickerOpen(false);
    setIsTaskFormOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim() || !taskFormDateFull) return;
    // Require at least timeStart or timeEnd, or legacy time
    if (!taskTimeStart.trim() && !taskTimeEnd.trim() && !taskTime.trim()) return;

    // Extract date number from full date
    const dateNum = taskFormDateFull.getDate();
    const dateMonth = taskFormDateFull.getMonth();
    const dateYear = taskFormDateFull.getFullYear();
    
    // Use the date number - tasks are stored by day number in the current month view
    // If the date is in a different month, we still use the day number
    // The calendar view will need to handle cross-month tasks differently if needed
    const finalDate = dateNum;

    // Parse reference links (one per line)
    const referenceLinks = taskReferenceLinks
      .split("\n")
      .map((link) => link.trim())
      .filter((link) => link.length > 0);

    // Build time string from timeStart and timeEnd, or use legacy time
    let timeString = "";
    if (taskTimeStart.trim() && taskTimeEnd.trim()) {
      timeString = `${taskTimeStart.trim()} - ${taskTimeEnd.trim()}`;
    } else if (taskTime.trim()) {
      timeString = taskTime.trim();
    }

    const newTask: Task = {
      id: editingTask?.id || `${finalDate}-${Date.now()}`,
      title: taskTitle.trim(),
      description: taskDescription.trim() || undefined,
      priority: taskPriority,
      timeStart: taskTimeStart.trim() || undefined,
      timeEnd: taskTimeEnd.trim() || undefined,
      time: timeString || undefined,
      referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
      date: finalDate,
    };

    setTasksData((prev) => {
      const dayTasks = prev[finalDate] || [];
      if (editingTask) {
        // Update existing task - need to handle date change
        const oldDate = editingTask.date || finalDate;
        if (oldDate !== finalDate) {
          // Date changed - remove from old date, add to new date
          const oldDayTasks = prev[oldDate] || [];
          const updatedOldTasks = oldDayTasks.filter((t) => t.id !== editingTask.id);
          return {
            ...prev,
            [oldDate]: updatedOldTasks.length > 0 ? updatedOldTasks : undefined,
            [finalDate]: [...(prev[finalDate] || []), newTask],
          };
        } else {
          // Same date - just update
          return {
            ...prev,
            [finalDate]: dayTasks.map((t) => (t.id === editingTask.id ? newTask : t)),
          };
        }
      } else {
        // Add new task
        return {
          ...prev,
          [finalDate]: [...dayTasks, newTask],
        };
      }
    });

    setIsTaskFormOpen(false);
    setTaskTitle("");
    setTaskDescription("");
    setTaskPriority("medium");
    setTaskTimeStart("");
    setTaskTimeEnd("");
    setTaskTime("");
    setTaskReferenceLinks("");
    setTaskFormDate(null);
    setTaskFormDateFull(undefined);
    setEditingTask(null);
    setIsDatePickerOpen(false);
  };

  const handleDeleteTask = (taskId: string, date: number) => {
    setTasksData((prev) => {
      const dayTasks = prev[date] || [];
      const updatedTasks = dayTasks.filter((t) => t.id !== taskId);
      if (updatedTasks.length === 0) {
        const { [date]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [date]: updatedTasks,
      };
    });
  };

  const handleToggleTaskCompletion = (taskId: string, date: number) => {
    setTasksData((prev) => {
      const dayTasks = prev[date] || [];
      const updatedTasks = dayTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      );
      return {
        ...prev,
        [date]: updatedTasks,
      };
    });
  };

  const daysOfWeek = ["MON", "TUES", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[var(--gradient-via)] to-[var(--gradient-to)]">
      {/* Sticky Navigation Header - Fixed, doesn't move */}
      <motion.div
        ref={navRef}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-border/50 bg-card/90 backdrop-blur-xl shadow-sm"
        id="nav-header"
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
                href="/dashboard/analytics"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Analytics
              </Link>
              <button
                onClick={() => {
                  setIsAIAssistOpen(true);
                  setIsProfileOpen(false);
                }}
                className="cursor-pointer transition-opacity hover:opacity-70"
              >
                <Sparkles className="h-5 w-5 stroke-[1.5] text-primary" />
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(true);
                  setIsAIAssistOpen(false);
                }}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-3 py-2 transition-colors hover:bg-accent/30"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 ring-2 ring-primary/20">
                  <User className="h-4 w-4 stroke-[1.5] text-primary" />
                </div>
                <div className="flex flex-col">
                  <p className="text-sm font-semibold leading-tight">John doe</p>
                  <p className="text-xs text-muted-foreground leading-tight">Engineer</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area - Only this shifts */}
      <div className="flex">
        <motion.div
          animate={{
            marginRight: isAIAssistOpen || isProfileOpen ? "24rem" : "0",
          }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full"
        >
          <div className="mx-auto max-w-screen-xl px-6 py-8">
        {/* Calendar Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <h2 className="text-2xl font-bold tracking-wide">My Calendar</h2>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => handleAddTask(null)}
              className="group rounded-xl shadow-sm transition-all hover:shadow-md"
            >
              <Plus className="mr-2 h-4 w-4 stroke-[1.5] transition-transform group-hover:rotate-90" />
              New Task
            </Button>
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-background/50 p-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-accent"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
              </Button>
              <span className="min-w-[140px] text-center text-sm font-semibold">
                {monthName}, {year}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg hover:bg-accent"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4 stroke-[1.5]" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-6 shadow-lg"
        >
          {/* Days of Week Header */}
          <div className="mb-4 grid grid-cols-7 gap-2">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.01 }}
                className={`group relative flex min-h-[120px] flex-col cursor-pointer rounded-xl border p-2 transition-all ${
                  day.month === "prev" || day.month === "next"
                    ? "border-border/20 bg-muted/5 opacity-40"
                    : day.isToday
                    ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20 shadow-sm"
                    : "border-border/50 bg-background hover:border-primary/30 hover:bg-accent/30"
                }`}
              >
                <div
                  className={`mb-2 flex items-center justify-between ${
                    day.month === "prev" || day.month === "next"
                      ? "text-muted-foreground/40"
                      : day.isToday
                      ? "text-primary font-bold"
                      : "text-foreground"
                  }`}
                >
                  <span className={`text-sm font-semibold ${day.isToday ? "text-lg" : ""}`}>
                    {day.date}
                  </span>
                  <div className="flex items-center gap-1">
                    {day.isToday && (
                      <span className="h-2 w-2 rounded-full bg-primary"></span>
                    )}
                    {/* Add Task Button - Shows on Hover (only for future dates and today) */}
                    {day.month === "current" && !isPastDate(day.date) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full opacity-0 transition-opacity group-hover:opacity-100 hover:bg-primary/20 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTask(day.date);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5 stroke-[1.5]" />
                      </Button>
                    )}
                  </div>
                </div>
                {day.month === "current" && day.tasks && day.tasks.length > 0 && (
                  <div className="flex flex-col space-y-1.5">
                    {day.tasks.slice(0, 2).map((task, taskIndex) => {
                      const colors = getPriorityColors(task.priority);
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.01 + taskIndex * 0.05 }}
                          className={`rounded-full border ${colors.border} ${colors.bg} px-2.5 py-1 shadow-sm transition-all ${colors.hoverBorder} ${colors.hoverBg} cursor-pointer flex items-center gap-2 ${
                            task.completed ? "opacity-60" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewTask(task);
                            setQuickViewTaskDate(day.date);
                            setIsQuickViewOpen(true);
                          }}
                        >
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTaskCompletion(task.id, day.date);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-shrink-0 rounded-full transition-all duration-200 flex items-center justify-center ${
                              task.completed
                                ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                                : "bg-background/80 border-2 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/60 hover:text-primary"
                            } h-5 w-5`}
                          >
                            {task.completed ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                              >
                                <CheckCircle className="h-4 w-4 fill-current stroke-2 stroke-primary-foreground" />
                              </motion.div>
                            ) : (
                              <Circle className="h-4 w-4 stroke-2" />
                            )}
                          </motion.button>
                          <p className={`text-xs font-medium ${colors.text} flex-1 ${
                            task.completed ? "line-through" : ""
                          }`}>
                            {task.title}
                          </p>
                        </motion.div>
                      );
                    })}
                    {day.tasks.length > 2 && (
                      <p
                        onClick={() => handleMoreClick(day)}
                        className="mt-auto cursor-pointer text-left text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {day.tasks.length - 2} more...
                      </p>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tasks Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedDay && (
                  <>
                    Tasks for {monthName} {selectedDay.date}, {year}
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                All scheduled tasks for this day
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              {selectedDay?.tasks && selectedDay.tasks.length > 0 ? (
                selectedDay.tasks.map((task) => {
                  const colors = getPriorityColors(task.priority);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between rounded-xl border-l-4 ${colors.border} border-t border-r border-b border-border/50 ${colors.bg} bg-card/50 p-3 transition-all ${colors.hoverBorder} hover:border-l-4 cursor-pointer`}
                      onClick={() => {
                        setQuickViewTask(task);
                        setQuickViewTaskDate(selectedDay.date);
                        setIsDialogOpen(false);
                        setIsQuickViewOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <p className={`font-medium ${colors.text} ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}>{task.title}</p>
                        <p className={`text-sm text-muted-foreground ${
                          task.completed ? "opacity-60" : ""
                        }`}>{formatTaskTime(task)}</p>
                        {task.priority && (
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.priority === "high" ? "bg-destructive/20 text-destructive border border-destructive/30" :
                            task.priority === "medium" ? "bg-warning/20 text-warning border border-warning/30" :
                            "bg-primary/20 text-primary border border-primary/30"
                          } ${task.completed ? "opacity-60" : ""}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                      </div>
                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                      <motion.button
                        onClick={() => {
                          if (selectedDay) {
                            handleToggleTaskCompletion(task.id, selectedDay.date);
                          }
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                          task.completed
                            ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                            : "bg-background/80 border-2 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/60 hover:text-primary"
                        } h-6 w-6`}
                      >
                        {task.completed ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                          >
                            <CheckCircle className="h-4 w-4 fill-current stroke-2 stroke-primary-foreground" />
                          </motion.div>
                        ) : (
                          <Circle className="h-4 w-4 stroke-2" />
                        )}
                      </motion.button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                        onClick={() => {
                          if (selectedDay) {
                            handleEditTask(task, selectedDay.date);
                            setIsDialogOpen(false);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4 stroke-[1.5]" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => {
                          if (selectedDay) {
                            handleDeleteTask(task.id, selectedDay.date);
                            // Update selectedDay tasks
                            const updatedTasks = selectedDay.tasks?.filter((t) => t.id !== task.id) || [];
                            if (updatedTasks.length === 0) {
                              setIsDialogOpen(false);
                            } else {
                              setSelectedDay({ ...selectedDay, tasks: updatedTasks });
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 stroke-[1.5]" />
                      </Button>
                    </div>
                  </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-4">No tasks scheduled</p>
              )}
            </div>
            {selectedDay && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  onClick={() => {
                    handleAddTask(selectedDay.date);
                    setIsDialogOpen(false);
                  }}
                  className="w-full rounded-xl"
                >
                  <Plus className="mr-2 h-4 w-4 stroke-[1.5]" />
                  Add Task
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Task Form Dialog */}
        <Dialog open={isTaskFormOpen} onOpenChange={setIsTaskFormOpen}>
          <DialogContent className="rounded-2xl max-w-2xl p-0 overflow-hidden border-2 border-border/50 shadow-2xl">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 pt-6 pb-4 border-b border-border/50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingTask ? (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="p-2 rounded-xl bg-primary/20">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                      <span>Edit Task</span>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2"
                    >
                      <div className="p-2 rounded-xl bg-primary/20">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <span>Create New Task</span>
                    </motion.div>
                  )}
                </DialogTitle>
                <DialogDescription className="text-base mt-2">
                  {taskFormDateFull
                    ? `Scheduled for ${taskFormDateFull.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : "Fill in the details to create your task"}
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto pr-2">
              {/* Task Title */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor="task-title" className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Task Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="task-title"
                  type="text"
                  placeholder="e.g., Team Meeting, Code Review, Design Sprint"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="rounded-xl h-12 text-base border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  maxLength={100}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Be specific and concise
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {taskTitle.length}/100
                  </p>
                </div>
              </motion.div>

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-2"
              >
                <Label htmlFor="task-description" className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Description
                </Label>
                <Textarea
                  id="task-description"
                  placeholder="Add detailed information about this task, objectives, or any important notes..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="rounded-xl min-h-[120px] text-base resize-none border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Optional: Provide context and details for better task management
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {taskDescription.length}/500
                  </p>
                </div>
              </motion.div>

              {/* Date Field - Calendar Picker - Positioned in the middle */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <Label htmlFor="task-date" className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Date <span className="text-destructive">*</span>
                </Label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal rounded-xl h-12 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {taskFormDateFull ? (
                        <span className="font-medium">
                          {taskFormDateFull.toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Select a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl shadow-xl border-2" align="start">
                    <Calendar
                      mode="single"
                      selected={taskFormDateFull}
                      onSelect={(date) => {
                        if (date) {
                          setTaskFormDateFull(date);
                          setTaskFormDate(date.getDate());
                          // Check if date is in the past
                          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                          todayStart.setHours(0, 0, 0, 0);
                          if (date >= todayStart) {
                            setIsDatePickerOpen(false);
                          }
                        }
                      }}
                      disabled={(date) => {
                        // Disable past dates
                        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        todayStart.setHours(0, 0, 0, 0);
                        return date < todayStart;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Past dates cannot be selected
                </p>
              </motion.div>

              {/* Priority */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="space-y-2"
              >
                <Label htmlFor="task-priority" className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <AlertCircle className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Priority
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setTaskPriority(priority)}
                      className={`rounded-xl p-3 border-2 transition-all ${
                        taskPriority === priority
                          ? priority === "high"
                            ? "border-destructive bg-destructive/10 shadow-md"
                            : priority === "medium"
                            ? "border-warning bg-warning/10 shadow-md"
                            : "border-primary bg-primary/10 shadow-md"
                          : "border-border bg-background hover:border-primary/30 hover:bg-accent/30"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            priority === "high"
                              ? "bg-destructive"
                              : priority === "medium"
                              ? "bg-warning"
                              : "bg-primary"
                          }`}
                        />
                        <span className={`text-xs font-semibold ${
                          taskPriority === priority
                            ? priority === "high"
                              ? "text-destructive"
                              : priority === "medium"
                              ? "text-warning"
                              : "text-primary"
                            : "text-muted-foreground"
                        }`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Set the importance level for this task
                </p>
              </motion.div>

              {/* Time Range */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Time Range <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="task-time-start" className="text-xs font-medium text-muted-foreground">Start Time</Label>
                    <Input
                      id="task-time-start"
                      type="text"
                      placeholder="09:00 AM"
                      value={taskTimeStart}
                      onChange={(e) => setTaskTimeStart(e.target.value)}
                      className="rounded-xl h-12 border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-time-end" className="text-xs font-medium text-muted-foreground">End Time</Label>
                    <Input
                      id="task-time-end"
                      type="text"
                      placeholder="10:00 AM"
                      value={taskTimeEnd}
                      onChange={(e) => setTaskTimeEnd(e.target.value)}
                      className="rounded-xl h-12 border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => {
                        if (!taskTimeStart) {
                          setTaskTimeStart(time);
                        } else if (!taskTimeEnd) {
                          setTaskTimeEnd(time);
                        }
                      }}
                      className="text-xs px-2 py-1 rounded-lg border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-all"
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Format: HH:MM AM/PM (e.g., 09:00 AM, 02:30 PM)
                </p>
              </motion.div>

              {/* Reference Links */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2"
              >
                <Label htmlFor="task-links" className="text-sm font-semibold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Link2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Reference Links
                </Label>
                <Textarea
                  id="task-links"
                  placeholder="https://example.com&#10;https://docs.example.com/page&#10;https://github.com/repo"
                  value={taskReferenceLinks}
                  onChange={(e) => setTaskReferenceLinks(e.target.value)}
                  className="rounded-xl min-h-[100px] text-base font-mono text-sm resize-none border-2 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Link2 className="h-3 w-3" />
                    Add one URL per line (optional)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {taskReferenceLinks.split("\n").filter(l => l.trim()).length} link(s)
                  </p>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3 pt-4 border-t border-border bg-muted/20 -mx-6 px-6 pb-6 -mb-6"
              >
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsTaskFormOpen(false);
                    setTaskTitle("");
                    setTaskDescription("");
                    setTaskPriority("medium");
                    setTaskTimeStart("");
                    setTaskTimeEnd("");
                    setTaskTime("");
                    setTaskReferenceLinks("");
                    setTaskFormDate(null);
                    setTaskFormDateFull(undefined);
                    setEditingTask(null);
                    setIsDatePickerOpen(false);
                  }}
                  className="flex-1 rounded-xl h-12 font-semibold border-2 hover:bg-accent transition-all"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveTask}
                  disabled={
                    !taskTitle.trim() ||
                    !taskFormDateFull ||
                    (!taskTimeStart.trim() && !taskTimeEnd.trim() && !taskTime.trim())
                  }
                  className="flex-1 rounded-xl h-12 font-semibold shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingTask ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Update Task
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Task
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Task Quick View Dialog */}
        <Dialog open={isQuickViewOpen} onOpenChange={setIsQuickViewOpen}>
          <DialogContent className="rounded-2xl max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {quickViewTask && (
                  <motion.button
                    onClick={() => {
                      if (quickViewTaskDate) {
                        handleToggleTaskCompletion(quickViewTask.id, quickViewTaskDate);
                        // Update the quick view task state
                        setQuickViewTask({ ...quickViewTask, completed: !quickViewTask.completed });
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`rounded-full transition-all duration-200 flex items-center justify-center ${
                      quickViewTask.completed
                        ? "bg-primary text-primary-foreground shadow-lg ring-2 ring-primary/30"
                        : "bg-background/80 border-2 border-border text-muted-foreground hover:bg-primary/10 hover:border-primary/60 hover:text-primary"
                    } h-8 w-8`}
                  >
                    {quickViewTask.completed ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        <CheckCircle className="h-5 w-5 fill-current stroke-2 stroke-primary-foreground" />
                      </motion.div>
                    ) : (
                      <Circle className="h-5 w-5 stroke-2" />
                    )}
                  </motion.button>
                )}
                <DialogTitle className={`text-2xl flex-1 ${
                  quickViewTask?.completed ? "line-through opacity-60" : ""
                }`}>
                  {quickViewTask?.title || "Task Details"}
                </DialogTitle>
              </div>
              <DialogDescription>
                View all task information
              </DialogDescription>
            </DialogHeader>
            {quickViewTask && (
              <div className="mt-4 space-y-5">
                {/* Date */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Date</Label>
                  <p className="text-base font-medium text-foreground">
                    {quickViewTaskDate ? (
                      <>
                        {monthName} {quickViewTaskDate}, {year}
                      </>
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Priority</Label>
                  <div>
                    {quickViewTask.priority ? (
                      <span className={`inline-block text-xs px-4 py-2 rounded-full font-semibold border ${
                        quickViewTask.priority === "high" ? "bg-destructive/20 text-destructive border-destructive/40" :
                        quickViewTask.priority === "medium" ? "bg-warning/20 text-warning border-warning/40" :
                        "bg-primary/20 text-primary border-primary/40"
                      }`}>
                        {quickViewTask.priority.charAt(0).toUpperCase() + quickViewTask.priority.slice(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                </div>

                {/* Time Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Time Range</Label>
                  <p className={`text-base text-foreground ${
                    quickViewTask.completed ? "opacity-60" : ""
                  }`}>
                    {(quickViewTask.timeStart || quickViewTask.timeEnd || quickViewTask.time) ? (
                      formatTaskTime(quickViewTask)
                    ) : (
                      <span className="text-muted-foreground">Not specified</span>
                    )}
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                  <div className={`min-h-[60px] rounded-xl border border-border bg-muted/30 p-4 ${
                    quickViewTask.completed ? "opacity-60" : ""
                  }`}>
                    {quickViewTask.description ? (
                      <p className="text-base text-foreground whitespace-pre-wrap">
                        {quickViewTask.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">No description provided</p>
                    )}
                  </div>
                </div>

                {/* Reference Links */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-muted-foreground">Reference Links</Label>
                  <div className="min-h-[40px] rounded-xl border border-border bg-muted/30 p-4">
                    {quickViewTask.referenceLinks && quickViewTask.referenceLinks.length > 0 ? (
                      <div className="space-y-2">
                        {quickViewTask.referenceLinks.map((link, index) => (
                          <a
                            key={index}
                            href={link.startsWith("http") ? link : `https://${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm text-primary hover:underline break-all"
                          >
                            {link}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No reference links provided</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsQuickViewOpen(false);
                      if (quickViewTaskDate) {
                        handleEditTask(quickViewTask, quickViewTaskDate);
                      }
                    }}
                    className="flex-1 rounded-xl"
                  >
                    <Edit className="mr-2 h-4 w-4 stroke-[1.5]" />
                    Edit Task
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (quickViewTaskDate) {
                        handleDeleteTask(quickViewTask.id, quickViewTaskDate);
                        setIsQuickViewOpen(false);
                      }
                    }}
                    className="flex-1 rounded-xl"
                  >
                    <Trash2 className="mr-2 h-4 w-4 stroke-[1.5]" />
                    Delete Task
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
          </div>
        </motion.div>
      </div>

        {/* AI Assist Sidebar - Fixed to right, starts below nav */}
        <AnimatePresence>
          {isAIAssistOpen && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 z-40 w-96 bg-card shadow-2xl border-l border-border"
              style={{
                top: `${navHeight}px`,
                height: `calc(100vh - ${navHeight}px)`,
              }}
            >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 pt-5 pb-3">
                <h2 className="text-base font-bold tracking-wide">AI Task Assist</h2>
                <button
                  onClick={() => setIsAIAssistOpen(false)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-accent"
                >
                  <X className="h-5 w-5 stroke-[1.5] text-muted-foreground" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-4">
                  {/* AI Initial Message */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-4 w-4 stroke-[1.5] text-primary" />
                    </div>
                    <div className="flex-1 rounded-xl rounded-tl-none bg-muted/50 p-4">
                      <p className="text-sm text-foreground">
                        Hello! I'm your AI Task Assistant. I can help you organize, prioritize, and manage your tasks efficiently. How can I help you today?
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="border-t border-border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Ask me anything..."
                    value={aiMessage}
                    onChange={(e) => setAiMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && aiMessage.trim()) {
                        // Handle send message
                        setAiMessage("");
                      }
                    }}
                    className="rounded-xl"
                  />
                  <Button
                    size="icon"
                    className="rounded-xl"
                    onClick={() => {
                      if (aiMessage.trim()) {
                        // Handle send message
                        setAiMessage("");
                      }
                    }}
                  >
                    <Send className="h-4 w-4 stroke-[1.5]" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Sidebar - Fixed to right, starts below nav */}
      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 z-40 w-96 bg-card shadow-2xl border-l border-border overflow-y-auto"
            style={{
              top: `${navHeight}px`,
              height: `calc(100vh - ${navHeight}px)`,
            }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 pt-5 pb-3">
                <h2 className="text-base font-bold tracking-wide">Profile</h2>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="rounded-lg p-1.5 transition-colors hover:bg-accent"
                >
                  <X className="h-5 w-5 stroke-[1.5] text-muted-foreground" />
                </button>
              </div>

              {/* Profile Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="space-y-6">
                  {/* Avatar */}
                  <div className="flex justify-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/20">
                      <User className="h-10 w-10 stroke-[1.5] text-primary" />
                    </div>
                  </div>

                  {/* Name and Title */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold tracking-wide">John doe</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Engineer</p>
                  </div>

                  {/* Task Statistics */}
                  <Card className="rounded-xl border border-border bg-muted/30 p-4">
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
                  <div className="space-y-4">
                    <h4 className="text-base font-bold tracking-wide">Profile Information</h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name" className="text-sm">Name</Label>
                        <Input
                          id="profile-name"
                          type="text"
                          defaultValue="John doe"
                          className="rounded-xl"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email" className="text-sm">Email</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          defaultValue="john.doe@example.com"
                          className="rounded-xl"
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-title" className="text-sm">Title</Label>
                        <Input
                          id="profile-title"
                          type="text"
                          defaultValue="Engineer"
                          className="rounded-xl"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
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
                      onClick={() => {
                        router.push("/signin");
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4 stroke-[1.5]" />
                      Log Out
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


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
import { apiClient } from "@/lib/api-client";

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
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'ai'; message: string }>>([
    { role: 'ai', message: "Hello! I'm your AI Task Assistant. I can help you organize, prioritize, and manage your tasks efficiently. How can I help you today?" }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
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
  const [timeRangeError, setTimeRangeError] = useState("");
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(73);
  const [tasksData, setTasksData] = useState<Record<number, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; title: string | null } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileTitle, setProfileTitle] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  useEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  // Sync profile form fields when user data changes
  useEffect(() => {
    if (user && !isEditingProfile) {
      setProfileName(user.name);
      setProfileEmail(user.email);
      setProfileTitle(user.title || "");
    }
  }, [user, isEditingProfile]);

  // Fetch user profile and tasks on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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

        // Fetch tasks for current month
        await fetchTasksForMonth();
      } catch (error: any) {
        console.error('Failed to fetch user or tasks:', error);
        // Check for 401 status or unauthorized message
        if (error.status === 401 || error.message?.includes('Unauthorized') || error.message?.includes('token')) {
          apiClient.setToken(null);
          router.push('/signin');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch tasks when month changes
  useEffect(() => {
    fetchTasksForMonth();
  }, [currentMonth]);

  // Helper to convert API task format to calendar format
  const convertApiTaskToCalendar = (apiTask: any): Task => {
    // Parse date from YYYY-MM-DD format
    const [year, month, day] = apiTask.date.split('-').map(Number);
    const taskDate = new Date(year, month - 1, day);
    
    // Check if task is in the current month being viewed
    const isInCurrentMonth = 
      taskDate.getMonth() === currentMonth.getMonth() &&
      taskDate.getFullYear() === currentMonth.getFullYear();
    
    return {
      id: apiTask.id,
      title: apiTask.title,
      description: apiTask.description,
      priority: apiTask.priority || "medium",
      timeStart: apiTask.timeStart,
      timeEnd: apiTask.timeEnd,
      time: apiTask.time,
      referenceLinks: apiTask.referenceLinks || [],
      date: isInCurrentMonth ? taskDate.getDate() : 0, // Only show tasks for current month
      completed: apiTask.completed || false,
    };
  };

  // Fetch tasks for the current month
  const fetchTasksForMonth = async () => {
    try {
      setTasksLoading(true);
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const response = await apiClient.getTasks({ month: monthStr });
      
      if (response.success && response.data?.tasks) {
        // Group tasks by day
        const grouped: Record<number, Task[]> = {};
        response.data.tasks.forEach((apiTask: any) => {
          const task = convertApiTaskToCalendar(apiTask);
          const day = task.date;
          // Only add tasks that are in the current month (date > 0)
          if (day > 0) {
            if (!grouped[day]) {
              grouped[day] = [];
            }
            grouped[day].push(task);
          }
        });
        setTasksData(grouped);
      }
    } catch (error: any) {
      console.error('Failed to fetch tasks:', error);
      // Check for 401 status or unauthorized message
      if (error.status === 401 || error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        apiClient.setToken(null);
        router.push('/signin');
      }
    } finally {
      setTasksLoading(false);
    }
  };

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

  // Helper function to convert 12-hour time to minutes for comparison
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  // Validate time range
  const validateTimeRange = (start: string, end: string): boolean => {
    if (!start || !end) return true; // Allow empty, will be validated on save
    
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    if (endMinutes <= startMinutes) {
      setTimeRangeError("End time must be after start time");
      return false;
    }
    
    setTimeRangeError("");
    return true;
  };

  // Handle time start change
  const handleTimeStartChange = (value: string) => {
    setTaskTimeStart(value);
    if (taskTimeEnd) {
      validateTimeRange(value, taskTimeEnd);
    }
  };

  // Handle time end change
  const handleTimeEndChange = (value: string) => {
    setTaskTimeEnd(value);
    if (taskTimeStart) {
      validateTimeRange(taskTimeStart, value);
    }
  };

  // Helper function to get priority-based color classes
  const getPriorityColors = (priority?: "low" | "medium" | "high") => {
    switch (priority) {
      case "high":
        return {
          border: "border-red-500/60",
          sideBorder: "border-l-4 border-l-red-500",
          bg: "bg-primary/15", // Keep lavender background
          hoverBorder: "hover:border-red-500",
          hoverBg: "hover:bg-primary/20",
          text: "text-red-600",
        };
      case "medium":
        return {
          border: "border-yellow-500/60",
          sideBorder: "border-l-4 border-l-yellow-500",
          bg: "bg-primary/15", // Keep lavender background
          hoverBorder: "hover:border-yellow-500",
          hoverBg: "hover:bg-primary/20",
          text: "text-yellow-600",
        };
      case "low":
        return {
          border: "border-green-500/60",
          sideBorder: "border-l-4 border-l-green-500",
          bg: "bg-primary/15", // Keep lavender background
          hoverBorder: "hover:border-green-500",
          hoverBg: "hover:bg-primary/20",
          text: "text-green-600",
        };
      default:
        return {
          border: "border-muted-foreground/40",
          sideBorder: "",
          bg: "bg-primary/15",
          hoverBorder: "hover:border-muted-foreground/60",
          hoverBg: "hover:bg-primary/20",
          text: "text-muted-foreground",
        };
    }
  };

  // Helper function to get task capsule styling based on priority only
  const getTaskCapsuleStyle = (task: Task, date: number) => {
    // Standardized 3 colors based on priority only - lighter shades
    switch (task.priority) {
      case "high":
        return {
          bg: "#FFE0E0",
          text: "text-gray-800",
          hoverBg: "#FFD0D0",
        };
      case "medium":
        return {
          bg: "#FFF4E0",
          text: "text-gray-800",
          hoverBg: "#FFEED0",
        };
      case "low":
        return {
          bg: "#E8FCE8",
          text: "text-gray-800",
          hoverBg: "#D8F8D8",
        };
      default:
        // Default to medium priority color if no priority is set
        return {
          bg: "#FFF4E0",
          text: "text-gray-800",
          hoverBg: "#FFEED0",
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

  const handleSaveTask = async () => {
    if (!taskTitle.trim() || !taskFormDateFull) return;
    // Require at least timeStart or timeEnd, or legacy time
    if (!taskTimeStart.trim() && !taskTimeEnd.trim() && !taskTime.trim()) return;
    
    // Validate time range if both times are provided
    if (taskTimeStart.trim() && taskTimeEnd.trim()) {
      if (!validateTimeRange(taskTimeStart, taskTimeEnd)) {
        return; // Don't save if validation fails
      }
    }

    // Format date as YYYY-MM-DD
    const dateStr = `${taskFormDateFull.getFullYear()}-${String(taskFormDateFull.getMonth() + 1).padStart(2, '0')}-${String(taskFormDateFull.getDate()).padStart(2, '0')}`;

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

    try {
      if (editingTask) {
        // Update existing task
        await apiClient.updateTask(editingTask.id, {
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          priority: taskPriority,
          date: dateStr,
          timeStart: taskTimeStart.trim() || undefined,
          timeEnd: taskTimeEnd.trim() || undefined,
          time: timeString || undefined,
          referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
        });
      } else {
        // Create new task
        await apiClient.createTask({
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          priority: taskPriority,
          date: dateStr,
          timeStart: taskTimeStart.trim() || undefined,
          timeEnd: taskTimeEnd.trim() || undefined,
          time: timeString || undefined,
          referenceLinks: referenceLinks.length > 0 ? referenceLinks : undefined,
        });
      }

      // Refresh tasks
      await fetchTasksForMonth();

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
    } catch (error: any) {
      console.error('Failed to save task:', error);
      if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        router.push('/signin');
      }
    }
  };

  const handleDeleteTask = async (taskId: string, date: number) => {
    try {
      await apiClient.deleteTask(taskId);
      // Refresh tasks
      await fetchTasksForMonth();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        router.push('/signin');
      }
    }
  };

  const handleToggleTaskCompletion = async (taskId: string, date: number) => {
    try {
      await apiClient.toggleTaskCompletion(taskId);
      // Refresh tasks
      await fetchTasksForMonth();
      // Update quick view if open
      if (quickViewTask && quickViewTask.id === taskId) {
        setQuickViewTask({ ...quickViewTask, completed: !quickViewTask.completed });
      }
    } catch (error: any) {
      console.error('Failed to toggle task completion:', error);
      if (error.message?.includes('Unauthorized') || error.message?.includes('token')) {
        router.push('/signin');
      }
    }
  };

  const handleSendAIMessage = async () => {
    if (!aiMessage.trim() || aiLoading) return;

    const userMessage = aiMessage.trim();
    setAiMessage("");
    setAiMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setAiLoading(true);

    try {
      const response = await apiClient.aiChat(userMessage);
      if (response.success && response.data?.response) {
        setAiMessages(prev => [...prev, { role: 'ai', message: response.data.response }]);
      }
    } catch (error: any) {
      console.error('AI chat error:', error);
      setAiMessages(prev => [...prev, { 
        role: 'ai', 
        message: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setAiLoading(false);
    }
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
                    <p className="text-sm font-semibold leading-tight">{user?.name || "User"}</p>
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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          )}
          {!loading && tasksLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm rounded-2xl z-10">
              <p className="text-muted-foreground">Loading tasks...</p>
            </div>
          )}
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
                      const capsuleStyle = getTaskCapsuleStyle(task, day.date);
                      return (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + index * 0.01 + taskIndex * 0.05 }}
                          className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                            task.completed ? "opacity-60" : ""
                          }`}
                          style={{
                            backgroundColor: capsuleStyle.bg,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = capsuleStyle.hoverBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = capsuleStyle.bg;
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickViewTask(task);
                            setQuickViewTaskDate(day.date);
                            setIsQuickViewOpen(true);
                          }}
                        >
                          {/* Task Title */}
                          <p className={`text-xs font-medium ${capsuleStyle.text} ${
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
                  const capsuleStyle = getTaskCapsuleStyle(task, selectedDay.date);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg bg-background border border-border/50 p-3 transition-all cursor-pointer hover:bg-accent/30"
                      onClick={() => {
                        setQuickViewTask(task);
                        setQuickViewTaskDate(selectedDay.date);
                        setIsDialogOpen(false);
                        setIsQuickViewOpen(true);
                      }}
                    >
                      <div className="flex-1">
                        <p className={`font-medium ${capsuleStyle.text} ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}>{task.title}</p>
                        <p className={`text-sm text-muted-foreground ${
                          task.completed ? "opacity-60" : ""
                        }`}>{formatTaskTime(task)}</p>
                        {task.priority && (
                          <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.priority === "high" ? "bg-red-500/20 text-red-600 border border-red-500/30" :
                            task.priority === "medium" ? "bg-yellow-500/20 text-yellow-600 border border-yellow-500/30" :
                            "bg-green-500/20 text-green-600 border border-green-500/30"
                          } ${task.completed ? "opacity-60" : ""}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </span>
                        )}
                      </div>
                    <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
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
          <DialogContent className="rounded-2xl max-w-4xl p-0 overflow-hidden border-2 border-border/50 shadow-2xl">
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
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto overflow-x-hidden">
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
                            ? "border-red-500 bg-red-500/10 shadow-md"
                            : priority === "medium"
                            ? "border-yellow-500 bg-yellow-500/10 shadow-md"
                            : "border-green-500 bg-green-500/10 shadow-md"
                          : "border-border bg-background hover:border-primary/30 hover:bg-accent/30"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            priority === "high"
                              ? "bg-red-500"
                              : priority === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          }`}
                        />
                        <span className={`text-xs font-semibold ${
                          taskPriority === priority
                            ? priority === "high"
                              ? "text-red-600"
                              : priority === "medium"
                              ? "text-yellow-600"
                              : "text-green-600"
                            : "text-muted-foreground"
                        }`}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
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
                
                {/* Time Range Selector - Microsoft Teams Style */}
                <div className={`rounded-xl border-2 p-4 transition-all ${
                  timeRangeError ? "border-destructive bg-destructive/5" : "border-border bg-background"
                }`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Start Time */}
                    <div className="flex-1 w-full sm:w-auto min-w-0">
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">Start Time</Label>
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={(() => {
                            if (!taskTimeStart) return "";
                            const match = taskTimeStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            return match ? `${match[1]}` : "";
                          })()}
                          onValueChange={(hour) => {
                            const match = taskTimeStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            const minutes = match ? match[2] : "00";
                            const period = match ? match[3] : "AM";
                            const newTime = `${hour}:${minutes} ${period}`;
                            handleTimeStartChange(newTime);
                          }}
                        >
                          <SelectTrigger className="rounded-lg h-10 border-2 w-16 [&_svg]:size-3 [&_svg]:opacity-40">
                            <SelectValue placeholder="H" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                              <SelectItem key={hour} value={hour.toString()}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground font-medium text-sm">:</span>
                        <Select
                          value={(() => {
                            if (!taskTimeStart) return "";
                            const match = taskTimeStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            return match ? match[2] : "";
                          })()}
                          onValueChange={(min) => {
                            const match = taskTimeStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            const hour = match ? match[1] : "9";
                            const period = match ? match[3] : "AM";
                            const newTime = `${hour}:${min} ${period}`;
                            handleTimeStartChange(newTime);
                          }}
                        >
                          <SelectTrigger className="rounded-lg h-10 border-2 w-16 [&_svg]:size-3 [&_svg]:opacity-40">
                            <SelectValue placeholder="M" />
                          </SelectTrigger>
                          <SelectContent>
                            {["00", "15", "30", "45"].map((min) => (
                              <SelectItem key={min} value={min}>
                                {min}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={(() => {
                            if (!taskTimeStart) return "AM";
                            const match = taskTimeStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            return match ? match[3].toUpperCase() : "AM";
                          })()}
                          onValueChange={(period) => {
                            const match = taskTimeStart.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            const hour = match ? match[1] : "9";
                            const minutes = match ? match[2] : "00";
                            const newTime = `${hour}:${minutes} ${period}`;
                            handleTimeStartChange(newTime);
                          }}
                        >
                          <SelectTrigger className="rounded-lg h-10 border-2 w-16 [&_svg]:size-3 [&_svg]:opacity-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="flex-1 w-full sm:w-auto min-w-0">
                      <Label className="text-xs font-medium text-muted-foreground mb-2 block">End Time</Label>
                      <div className="flex items-center gap-1.5">
                        <Select
                          value={(() => {
                            if (!taskTimeEnd) return "";
                            const match = taskTimeEnd.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            return match ? `${match[1]}` : "";
                          })()}
                          onValueChange={(hour) => {
                            const match = taskTimeEnd.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            const minutes = match ? match[2] : "00";
                            const period = match ? match[3] : "AM";
                            const newTime = `${hour}:${minutes} ${period}`;
                            handleTimeEndChange(newTime);
                          }}
                        >
                          <SelectTrigger className="rounded-lg h-10 border-2 w-16 [&_svg]:size-3 [&_svg]:opacity-40">
                            <SelectValue placeholder="H" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                              <SelectItem key={hour} value={hour.toString()}>
                                {hour}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground font-medium text-sm">:</span>
                        <Select
                          value={(() => {
                            if (!taskTimeEnd) return "";
                            const match = taskTimeEnd.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            return match ? match[2] : "";
                          })()}
                          onValueChange={(min) => {
                            const match = taskTimeEnd.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            const hour = match ? match[1] : "10";
                            const period = match ? match[3] : "AM";
                            const newTime = `${hour}:${min} ${period}`;
                            handleTimeEndChange(newTime);
                          }}
                        >
                          <SelectTrigger className="rounded-lg h-10 border-2 w-16 [&_svg]:size-3 [&_svg]:opacity-40">
                            <SelectValue placeholder="M" />
                          </SelectTrigger>
                          <SelectContent>
                            {["00", "15", "30", "45"].map((min) => (
                              <SelectItem key={min} value={min}>
                                {min}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select
                          value={(() => {
                            if (!taskTimeEnd) return "AM";
                            const match = taskTimeEnd.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            return match ? match[3].toUpperCase() : "AM";
                          })()}
                          onValueChange={(period) => {
                            const match = taskTimeEnd.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
                            const hour = match ? match[1] : "10";
                            const minutes = match ? match[2] : "00";
                            const newTime = `${hour}:${minutes} ${period}`;
                            handleTimeEndChange(newTime);
                          }}
                        >
                          <SelectTrigger className="rounded-lg h-10 border-2 w-16 [&_svg]:size-3 [&_svg]:opacity-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                
                {timeRangeError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {timeRangeError}
                  </p>
                )}
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
              <DialogTitle className={`text-2xl ${
                quickViewTask?.completed ? "line-through opacity-60" : ""
              }`}>
                {quickViewTask?.title || "Task Details"}
              </DialogTitle>
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
                        quickViewTask.priority === "high" ? "bg-red-500/20 text-red-600 border-red-500/40" :
                        quickViewTask.priority === "medium" ? "bg-yellow-500/20 text-yellow-600 border-yellow-500/40" :
                        "bg-green-500/20 text-green-600 border-green-500/40"
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
                <div className="flex flex-col gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      if (quickViewTaskDate && quickViewTask) {
                        handleToggleTaskCompletion(quickViewTask.id, quickViewTaskDate);
                        // Update the quick view task state
                        setQuickViewTask({ ...quickViewTask, completed: !quickViewTask.completed });
                      }
                    }}
                    className={`w-full rounded-xl ${
                      quickViewTask?.completed
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                    }`}
                  >
                    {quickViewTask?.completed ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Incomplete
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsQuickViewOpen(false);
                        if (quickViewTaskDate && quickViewTask) {
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
                        if (quickViewTaskDate && quickViewTask) {
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
                  {aiMessages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.role === 'ai' && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Sparkles className="h-4 w-4 stroke-[1.5] text-primary" />
                        </div>
                      )}
                      <div className={`flex-1 rounded-xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-primary/10 rounded-tr-none' 
                          : 'bg-muted/50 rounded-tl-none'
                      }`}>
                        <p className="text-sm text-foreground">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Sparkles className="h-4 w-4 stroke-[1.5] text-primary" />
                      </div>
                      <div className="flex-1 rounded-xl rounded-tl-none bg-muted/50 p-4">
                        <p className="text-sm text-muted-foreground">Thinking...</p>
                      </div>
                    </div>
                  )}
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
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && aiMessage.trim() && !aiLoading) {
                        await handleSendAIMessage();
                      }
                    }}
                    className="rounded-xl"
                    disabled={aiLoading}
                  />
                  <Button
                    size="icon"
                    className="rounded-xl"
                    onClick={handleSendAIMessage}
                    disabled={aiLoading || !aiMessage.trim()}
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

                  {/* Name */}
                  <div className="text-center">
                    <h3 className="text-xl font-bold tracking-wide">{user?.name || "User"}</h3>
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
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="rounded-xl"
                          disabled={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="profile-email" className="text-sm">Email</Label>
                        <Input
                          id="profile-email"
                          type="email"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          className="rounded-xl"
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    {isEditingProfile ? (
                      <>
                        <Button 
                          className="w-full rounded-xl" 
                          size="lg"
                          onClick={async () => {
                            try {
                              setProfileLoading(true);
                              const response = await apiClient.updateProfile({
                                name: profileName,
                              });
                              if (response.success) {
                                setUser({
                                  ...user!,
                                  name: profileName,
                                });
                                setIsEditingProfile(false);
                              }
                            } catch (error: any) {
                              console.error('Failed to update profile:', error);
                              alert(error.message || 'Failed to update profile');
                            } finally {
                              setProfileLoading(false);
                            }
                          }}
                          disabled={profileLoading || !profileName.trim()}
                        >
                          {profileLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full rounded-xl" 
                          size="lg"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileName(user?.name || "");
                            setProfileEmail(user?.email || "");
                            setProfileTitle(user?.title || "");
                          }}
                          disabled={profileLoading}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        className="w-full rounded-xl" 
                        size="lg"
                        onClick={() => {
                          setIsEditingProfile(true);
                          setProfileName(user?.name || "");
                          setProfileEmail(user?.email || "");
                          setProfileTitle(user?.title || "");
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl" 
                      size="lg"
                      onClick={() => {
                        setIsChangePasswordOpen(true);
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                        setPasswordError("");
                      }}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full rounded-xl"
                      size="lg"
                      onClick={async () => {
                        try {
                          await apiClient.logout();
                        } catch (error) {
                          console.error('Logout error:', error);
                        }
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

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="old-password" className="text-sm font-semibold">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="old-password"
                type="password"
                placeholder="Enter your current password"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setPasswordError("");
                }}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-sm font-semibold">
                New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter your new password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordError("");
                }}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-sm font-semibold">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordError("");
                }}
                className="rounded-xl"
              />
            </div>
            {passwordError && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span>{passwordError}</span>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setIsChangePasswordOpen(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="flex-1 rounded-xl"
                disabled={changePasswordLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Validate passwords
                  if (!oldPassword.trim()) {
                    setPasswordError("Current password is required");
                    return;
                  }
                  if (!newPassword.trim()) {
                    setPasswordError("New password is required");
                    return;
                  }
                  if (newPassword.length < 6) {
                    setPasswordError("New password must be at least 6 characters");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    setPasswordError("New passwords do not match");
                    return;
                  }
                  if (oldPassword === newPassword) {
                    setPasswordError("New password must be different from current password");
                    return;
                  }

                  try {
                    setChangePasswordLoading(true);
                    setPasswordError("");
                    const response = await apiClient.changePassword({
                      currentPassword: oldPassword,
                      newPassword: newPassword,
                    });
                    if (response.success) {
                      setIsChangePasswordOpen(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setPasswordError("");
                      alert("Password changed successfully!");
                    } else {
                      setPasswordError(response.message || "Failed to change password");
                    }
                  } catch (error: any) {
                    console.error('Failed to change password:', error);
                    setPasswordError(error.message || "Failed to change password. Please check your current password.");
                  } finally {
                    setChangePasswordLoading(false);
                  }
                }}
                className="flex-1 rounded-xl"
                disabled={changePasswordLoading || !oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()}
              >
                {changePasswordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


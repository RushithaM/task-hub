"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Bot, Zap, Circle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  const mouseX = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ 
        background: 'linear-gradient(to bottom right, var(--gradient-from), var(--gradient-via), var(--gradient-to))',
      }}
    >
      {/* Cursor Following Lavender Smoke Effect - Main */}
      <motion.div
        className="pointer-events-none absolute -z-0"
        style={{
          x: mouseX,
          y: mouseY,
        }}
        initial={false}
      >
        <div
          className="h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] opacity-50"
          style={{
            background: 'radial-gradient(circle, oklch(60% 0.12 280) 0%, oklch(60% 0.12 280) 30%, oklch(65% 0.10 280) 50%, transparent 75%)',
          }}
        />
      </motion.div>
      {/* Secondary smoke layer for depth */}
      <motion.div
        className="pointer-events-none absolute -z-0"
        style={{
          x: mouseX,
          y: mouseY,
        }}
        initial={false}
      >
        <div
          className="h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] opacity-35"
          style={{
            background: 'radial-gradient(circle, oklch(65% 0.15 280) 0%, oklch(70% 0.12 280) 40%, transparent 65%)',
          }}
        />
      </motion.div>
      {/* Tertiary subtle glow */}
      <motion.div
        className="pointer-events-none absolute -z-0"
        style={{
          x: mouseX,
          y: mouseY,
        }}
        initial={false}
      >
        <div
          className="h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] opacity-25"
          style={{
            background: 'radial-gradient(circle, oklch(70% 0.10 280) 0%, transparent 50%)',
          }}
        />
      </motion.div>
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
      
      {/* Static Tasks - Left Side (5 tasks in random positions) */}
      {flyingTasksLeft.slice(0, 5).map((task, index) => (
        <div
          key={`left-${index}`}
          className="pointer-events-none absolute -z-0 hidden lg:block"
          style={{
            left: task.positionX,
            top: task.positionY,
            transform: `rotate(${task.rotate}deg)`,
          }}
        >
          <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/80 px-3 py-2 shadow-md backdrop-blur-sm whitespace-nowrap">
            {task.completed ? (
              <CheckCircle className="h-3 w-3 stroke-[1.5] text-primary" />
            ) : (
              <Circle className="h-3 w-3 stroke-[1.5] text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-foreground/70">{task.text}</span>
          </div>
        </div>
      ))}

      {/* Static Tasks - Right Side (5 tasks in random positions) */}
      {flyingTasksRight.slice(0, 5).map((task, index) => (
        <div
          key={`right-${index}`}
          className="pointer-events-none absolute -z-0 hidden lg:block"
          style={{
            right: task.positionX,
            top: task.positionY,
            transform: `rotate(${task.rotate}deg)`,
          }}
        >
          <div className="flex items-center gap-2 rounded-xl border border-border/30 bg-card/80 px-3 py-2 shadow-md backdrop-blur-sm whitespace-nowrap">
            {task.completed ? (
              <CheckCircle className="h-3 w-3 stroke-[1.5] text-primary" />
            ) : (
              <Circle className="h-3 w-3 stroke-[1.5] text-muted-foreground" />
            )}
            <span className="text-xs font-medium text-foreground/70">{task.text}</span>
          </div>
        </div>
      ))}

      {/* Decorative Floating Orbs - Left Side */}
      <motion.div
        className="pointer-events-none absolute left-0 top-1/4 -z-0 hidden lg:block"
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div
          className="h-[300px] w-[300px] rounded-full blur-[100px] opacity-20"
          style={{
            background: 'radial-gradient(circle, oklch(65% 0.15 280) 0%, transparent 70%)',
          }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute left-0 top-2/3 -z-0 hidden lg:block"
        animate={{
          y: [0, 20, 0],
          scale: [1, 0.9, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div
          className="h-[200px] w-[200px] rounded-full blur-[80px] opacity-15"
          style={{
            background: 'radial-gradient(circle, oklch(70% 0.12 280) 0%, transparent 60%)',
          }}
        />
      </motion.div>

      {/* Decorative Floating Orbs - Right Side */}
      <motion.div
        className="pointer-events-none absolute right-0 top-1/3 -z-0 hidden lg:block"
        animate={{
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      >
        <div
          className="h-[250px] w-[250px] rounded-full blur-[90px] opacity-18"
          style={{
            background: 'radial-gradient(circle, oklch(60% 0.12 280) 0%, transparent 65%)',
          }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none absolute right-0 top-3/4 -z-0 hidden lg:block"
        animate={{
          y: [0, -25, 0],
          scale: [1, 0.95, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5,
        }}
      >
        <div
          className="h-[180px] w-[180px] rounded-full blur-[70px] opacity-12"
          style={{
            background: 'radial-gradient(circle, oklch(75% 0.10 280) 0%, transparent 55%)',
          }}
        />
      </motion.div>

      <div className="relative z-10">
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="mx-auto max-w-screen-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-2 text-sm text-muted-foreground"
            >
              <Sparkles className="h-4 w-4 stroke-[1.5]" />
              AI-Powered Task Management
            </motion.div>

            <h1 className="text-[32px] font-bold tracking-wide md:text-[48px]">
              Organize your work,
              <br />
              <span className="text-primary">achieve your goals</span>
            </h1>

            <p className="mx-auto max-w-lg text-lg text-muted-foreground">
              A beautiful, AI-powered task management application that automates
              your workflow and analyzes your productivity. Built with modern tools
              and intelligent design.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <div className="group relative rounded-2xl overflow-hidden">
                <Button asChild size="lg" className="relative z-10">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, oklch(60% 0.12 280) 0%, transparent 70%)',
                    filter: 'blur(20px)',
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-2xl"
              >
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-10" style={{ background: 'linear-gradient(to bottom, transparent, var(--gradient-via), transparent)' }}>
        <div className="mx-auto max-w-screen-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid gap-6 md:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group h-full rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-lg">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="inline-flex rounded-xl bg-primary/10 p-3">
                      <feature.icon className="h-5 w-5 stroke-[1.5] text-primary" />
                    </div>
                    <h3 className="text-xl font-bold tracking-wide">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      </div>
    </div>
  );
}

const flyingTasksLeft = [
  { text: "Review design mockups", completed: false, positionX: "2rem", positionY: "15%", rotate: -12 },
  { text: "Update documentation", completed: true, positionX: "1rem", positionY: "35%", rotate: 8 },
  { text: "Team standup meeting", completed: false, positionX: "3rem", positionY: "55%", rotate: -5 },
  { text: "Code review", completed: true, positionX: "1.5rem", positionY: "75%", rotate: 15 },
  { text: "Plan sprint", completed: false, positionX: "2.5rem", positionY: "90%", rotate: -8 },
];

const flyingTasksRight = [
  { text: "Write blog post", completed: true, positionX: "2rem", positionY: "12%", rotate: 10 },
  { text: "Fix bug #1234", completed: false, positionX: "1.5rem", positionY: "32%", rotate: -15 },
  { text: "Deploy to staging", completed: true, positionX: "2.5rem", positionY: "52%", rotate: 7 },
  { text: "User research", completed: false, positionX: "1rem", positionY: "72%", rotate: -10 },
  { text: "Optimize performance", completed: true, positionX: "3rem", positionY: "88%", rotate: 12 },
];

const features = [
  {
    icon: Bot,
    title: "AI Assist",
    description:
      "Intelligent AI assistant that automates tasks and analyzes your productivity patterns.",
  },
  {
    icon: CheckCircle2,
    title: "Simple & Clean",
    description:
      "Focus on what matters with a minimal interface designed for clarity.",
  },
  {
    icon: Zap,
    title: "Fast & Responsive",
    description:
      "Built with Next.js and optimized for performance across all devices.",
  },
];

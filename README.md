# Task Hub

A modern, light-themed task management application built with Next.js, TypeScript, and Tailwind CSS v4.

## 🎨 Design System

This project follows a minimal, modern design language inspired by Vercel v0.dev:

- **Light theme** with soft shadows and subtle gradients
- **OKLCH color palette** for consistent, perceptually uniform colors
- **Large rounded corners** (rounded-2xl) for a modern aesthetic
- **Clean spacing** using Tailwind's spacing utilities
- **Framer Motion** animations for micro-interactions
- **Lucide icons** with stroke-[1.5] styling

## 🛠 Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** components
- **Framer Motion** for animations
- **Lucide React** for icons

## 📁 Project Structure

```
app/
  (auth)/
    signin/
      page.tsx
    signup/
      page.tsx
  dashboard/
    page.tsx
  layout.tsx
  page.tsx
  globals.css
components/
  ui/          # shadcn/ui components
lib/
  utils.ts     # Utility functions
```

## 🎨 Color Palette (OKLCH)

```css
--background: oklch(98% 0.01 255);
--foreground: oklch(20% 0.02 255);
--primary: oklch(60% 0.12 260);
--primary-foreground: oklch(98% 0.01 255);
--secondary: oklch(92% 0.03 260);
--secondary-foreground: oklch(28% 0.04 255);
--muted: oklch(94% 0.015 255);
--muted-foreground: oklch(40% 0.02 255);
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📐 Design Standards

### Spacing
- Section padding: `px-6 py-10`
- Gaps: `gap-4`, `gap-6`
- Mobile-first responsive design

### Typography
- Font: Inter (via Next.js Google Fonts)
- Headings: Bold with wide letter spacing
- Body: Regular with comfortable line-height
- Hero text: `text-[28px]` to `text-[32px]`

### Components
- Use shadcn/ui components (`<Card />`, `<Button />`, `<Input />`, etc.)
- All components use `rounded-xl` or `rounded-2xl` for corners
- Icons from `lucide-react` with `stroke-[1.5]`

### Animations
- Fade-in and slide-up animations using Framer Motion
- Subtle hover scale effects
- Smooth transitions

## 📦 Adding Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add [component-name]
```

## 🎯 Key Features

- ✅ Modern, minimal UI design
- ✅ Responsive layout (mobile-first)
- ✅ Type-safe with TypeScript
- ✅ Accessible components
- ✅ Smooth animations
- ✅ Light theme optimized

## 📝 License

MIT

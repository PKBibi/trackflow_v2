# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server on http://localhost:3000
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **UI**: Tailwind CSS + Radix UI components + shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod validation

### Project Structure

```
trackflow_v2/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages (login, signup, forgot-password)
│   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── dashboard/     # Main dashboard
│   │   ├── timer/         # Time tracking interface
│   │   ├── insights/      # AI-powered insights
│   │   ├── invoices/      # Invoice management
│   │   ├── reports/       # Reporting features
│   │   ├── timesheet/     # Timesheet views
│   │   └── settings/      # User settings
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   └── layout/           # Layout components (Header, Footer)
├── lib/                   # Utilities and configurations
│   ├── supabase/         # Supabase client setup
│   └── stripe/           # Stripe configuration
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── supabase/             # Database migrations
```

### Key Architectural Patterns

1. **Server Components by Default**: The app uses React Server Components with client components marked with `'use client'`

2. **Database Access**: 
   - Server-side: Use `lib/supabase/server.ts` with `createClient()`
   - Client-side: Use `lib/supabase/client.ts`

3. **Route Groups**: 
   - `(auth)` - Authentication flow pages
   - `(dashboard)` - Protected user dashboard
   - `(marketing)` - Public marketing pages
   - Routes in parentheses don't affect URL structure

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   NEXT_PUBLIC_APP_URL            # Application URL
   ```

## Database Schema

The application uses Supabase with the following key tables:

- **profiles**: User profiles linked to auth.users
- **time_entries**: Time tracking records with channel, duration, hourly_rate
- **clients**: Client management with retainer tracking
- **projects**: Project tracking with deadlines and estimates
- **team_members**: Team collaboration features
- **api_keys**: API key management
- **notification_preferences**: User notification settings
- **activity_logs**: User activity tracking

## AI Insights Feature

The project includes a three-phase AI strategy:
- **Phase 1 (Current)**: Rule-based insights at `/api/insights/rules`
- **Phase 2**: Machine learning insights (planned)
- **Phase 3**: Generative AI capabilities (future)

Insights analyze:
- Productivity patterns (most productive hours)
- Revenue optimization (channel profitability)
- Client management (retainer alerts)
- Weekly summaries

## Marketing-Specific Features

TrackFlow is specifically designed for digital marketing agencies:
- **Channel Tracking**: PPC, SEO, Social, Email, Content marketing
- **Retainer Management**: Track and alert on retainer usage
- **Campaign ROI**: Link time spent to campaign performance
- **Multi-client Support**: Handle multiple clients and projects

## UI Component System

The project uses shadcn/ui components with Radix UI primitives:
- Components are in `components/ui/`
- Use `cn()` utility from `lib/utils.ts` for className merging
- Theme colors use CSS variables defined in `globals.css`
- Professional blue/green/amber color scheme

## Standard Workflow

1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.

## Important Instructions

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
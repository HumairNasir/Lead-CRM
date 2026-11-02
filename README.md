# Spec Leads CRM (Frontend & Dashboard Portal)

A high-performance enterprise lead management and project delivery CRM built with **Next.js 16 (App Router)**, **Tailwind CSS**, and **Supabase (PostgreSQL)** via React Server Components and Server Actions.

---

## Overview

Spec Leads CRM provides an end-to-end interface to manage the lifecycle of outbound sales prospects and client projects:
- **Dashboard Overview (`/`)**: Aggregates real-time KPIs (Total Scraped Leads, Active Projects, Conversion Rate, Projected Revenue), outreach trend charts, and pipeline status distributions.
- **Leads Management (`/leads`)**: Review scraped businesses, qualify outreach status (`NEW`, `MOCKUP_BUILT`, `EMAIL_SENT`, `PITCH_RESPONSE`, `PROJECT_MOVED`, `IGNORED`), manage notes/previews, and import converted prospects into projects.
- **Projects Dashboard (`/projects`)**: Track client delivery across production phases (`UNDER DISCUSSION`, `STAGING & DESIGN`, `BUILD & INTEGRATION`, `DELIVERED`, `REVISIONS`), manage budgets, client contacts, and staging URLs.
- **Server Actions Architecture**: Zero bloated API route handlers; mutations occur via Next.js Server Actions with immediate cache revalidation (`revalidatePath`).

---

## Prerequisites

- **Node.js**: Version 18.18 or higher (Node 20+ recommended)
- **Package Manager**: `npm` (bundled with Node.js)
- **Supabase Project**: PostgreSQL database configured with the CRM schema

---

## Environment Setup

### 1. Install Node Dependencies

Navigate to the `spec-leads-crm/` directory and install project dependencies:

```bash
cd spec-leads-crm
npm install
```

---

## Configuration

Duplicate the `.env.example` template to `.env.local`:

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**
```bash
cp .env.example .env.local
```

Open `.env.local` and add your Supabase credentials:

```env
# Supabase Project Credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Either Anon Key or Publishable Key is supported:
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

### Database Schema Initialization

Before starting the server, ensure your Supabase database has the required tables and indexes:
1. Open your **Supabase Dashboard** $\rightarrow$ **SQL Editor**.
2. Run the script located at `supabase_schema.sql` (or `spec-leads-crm/supabase_schema.sql`).
3. This creates the `public.leads` and `public.projects` tables, indexes, and permissive single-user Row Level Security policies.

---

## Execution

### Run Development Server

Start the Next.js local development server:

```bash
npm run dev
```

Once started, open your web browser and navigate to:
```
http://localhost:3000
```

### Production Build & Verification

To verify production compilation and TypeScript type-safety:

```bash
npm run build
```

---

## Application Structure

```
spec-leads-crm/
├── src/
│   ├── app/
│   │   ├── actions.ts           # Next.js Server Actions for Supabase mutations
│   │   ├── globals.css          # Theme styling, dark mode tokens, and pointer rules
│   │   ├── layout.tsx           # Application shell layout (Sidebar, Topbar)
│   │   ├── page.tsx             # Dashboard Overview (KPI cards & charts)
│   │   ├── leads/page.tsx       # Leads Management view (Live Supabase query)
│   │   └── projects/page.tsx    # Projects view (Live Supabase query)
│   ├── components/
│   │   ├── common/              # Reusable DataTable, Modal, and UI elements
│   │   ├── dashboard/           # KpiCards, TrendChart, PipelineDonut
│   │   ├── layout/              # Sidebar, Topbar, navigation
│   │   ├── leads/               # LeadsView, LeadDetailsModal, TerminalDrawer
│   │   └── projects/            # ProjectsView, ProjectDetailsModal, AddProjectModal
│   └── lib/
│       ├── supabase.ts          # Typed Supabase client initialization
│       └── types/database.ts    # Database DTOs, row interfaces, and mappers
├── supabase_schema.sql          # PostgreSQL schema migration file
└── package.json
```

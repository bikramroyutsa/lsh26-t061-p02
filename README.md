# MediShelf - Pharmacy Inventory Portal 🌿

MediShelf is a specialized, multi-workspace pharmacy inventory management system built to tackle the critical issue of pharmaceutical expiry and capital risk. Designed with a gorgeous, breathable botanical aesthetic, the platform gives pharmacy owners real-time visibility into their stock health, financial risk, and upcoming expirations.

---

## 🎯 Core Features

- **Multi-Workspace Architecture:** Seamlessly switch between different pharmacy branches or create new workspaces on the fly, all backed by Supabase row-level security.
- **Smart Expiry Tracking:** Automatically flag medicines expiring within the next few days with urgent visual alerts.
- **Financial Risk Analytics:** View real-time capital valuation and see exactly how much money is tied up in at-risk stock.
- **Dynamic Forecasting:** Beautiful charts and summary KPI cards that project expiry trends over the coming months.
- **Return Management:** Easily mark expired or near-expiry stock as "Returned" to keep your active inventory clean and accurate while retaining historical records.
- **Beautiful, Breathable UI:** A carefully crafted minimalist design system featuring soft geometric typography, gorgeous "clay-card" layouts, floating pill-shaped navigation, and smooth micro-animations.

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router) + React 19
- **Styling:** Tailwind CSS (Custom Botanical Theme)
- **Database & Auth:** Supabase
- **Icons:** Lucide React
- **Language:** TypeScript

---

## 🚀 Getting Started

First, make sure you have your `.env` file configured with your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Demo Access
To explore the application without setting up your own Supabase project, you can use our built-in demo credentials on the login screen:
- **Email:** `abc@cbd.com`
- **Password:** `123456`

*(Alternatively, you can sign up with any fake email and password combination; email verification is disabled by default).*

## 🎨 Design System

The application relies heavily on a semantic, CSS-variable based design token system (`app/globals.css`) designed to feel spacious and premium:

- **`bg-bg`** (`#F2F7F4`): The airy botanical background.
- **`bg-fg`** (`#13241b`): The dark forest green for solid contrast elements.
- **`text-primary`** (`#059669`): Vibrant emerald for active states and icons.
- **`text-interactive`** (`#ea580c`): Bright orange for warnings and interactive elements.
- **`bg-expired-bg`** (`#fef2f2`): Soft red for critical alerts.

Enjoy managing your pharmacy with MediShelf!

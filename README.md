# MediShelf - Pharmacy Expiry Shelf Check 

> **Team ID:** `LSH26-T061`  
> **Problem ID:** `P02`  
> **Repository:** `lsh26-t061-p02`  
> **Live URL:** [https://lsh26-t061-p02.appwrite.network](https://lsh26-t061-p02.appwrite.network)  
> **Framework:** Next.js 15 (App Router, TypeScript, React 19, Supabase)

MediShelf is a specialized, multi-workspace pharmacy inventory management and expiry tracking system built to tackle pharmaceutical waste and capital risk. Designed with a clean botanical clay-card aesthetic, the platform gives pharmacy owners and staff real-time visibility into stock health, at-risk capital, expiry timeline intervals, safe selling workflows, and supplier return management.

---

##  Problem-Solving Method

Our team approached the pharmacy expiry problem with a comprehensive, multi-layer solution:
1. **Accurate Date Categorization Engine:** Implemented strict local calendar date comparison routines to categorize inventory into distinct risk bands (`Expired <0d`, `Expiring ≤30d`, `Expiring 31–90d`, and `Safe >90d`).
2. **Capital Risk & Interval Breakdown:** Derived exact financial valuation formulas ($Value = Quantity \times UnitPriceBDT$) and created a 28-day 4-week interval degradation analysis ($0–7d$, $8–14d$, $15–21d$, $22–28d$) to give pharmacy managers actionable intervention windows.
3. **Safe POS Workflow:** Designed a point-of-sale checkout system that strictly excludes expired batches from transaction flows, generates itemized invoices, and automatically deducts stock.
4. **Audit-Ready Return System:** Provided a soft-removal return mechanism to transfer expired/near-expiry medicines into a return ledger without losing audit logs needed for supplier refunds and vendor claims.
5. **Multi-Tenant Security:** Built workspace-isolated data access with Supabase Row-Level Security (RLS) and membership approval flows.

---

##  Registered Team Members & Contributions

| Member Name | GitHub Username | Major Contribution | Evidence Paths |
|---|---|---|---|
| **Bikram Roy Utsa** | `@bikramroyutsa` | Architecture scaffolding, multi-tenant workspace isolation with Supabase RLS, public test case calculations alignment, and CSV export. | `app/page.tsx`, `app/settings/page.tsx`, `context/PharmacyContext.tsx`, `supabase/migrations/20260830000001_multi_tenant.sql`, `lib/calculations.ts` |
| **Saeed Ahmed Mahin** | `@SaeedAhmedMahin` | POS sell workflow with invoice generation, stock decrementing, safe expiry validation, and 4-week interval expiry loss breakdown engine. | `app/sell/page.tsx`, `app/expiry-loss/page.tsx`, `components/sell/InvoiceModal.tsx`, `lib/calculations.ts` |
| **Rakinuzzaman** | `@rakinthegreat` | Botanical clay-card UI system, animated Landing page, Top/Bottom navigation bars, returned stock inventory management, and chart visualizations. | `app/globals.css`, `components/landing/LandingPage.tsx`, `components/layout/Header.tsx`, `components/layout/BottomNav.tsx`, `components/returned/ReturnedTable.tsx`, `components/dashboard/ExpiryChart.tsx` |

---

## Requirement Proof & Traceability

| Requirement | Description | Status | Evidence Paths |
|---|---|---|---|
| **R1** | **Inventory Management & Tracking:** Add, edit, delete, batch tracking, quantity, unit price (BDT), expiry date, CSV export, and workspace scoping. | **Complete** | [`app/inventory/page.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/app/inventory/page.tsx), [`components/inventory/InventoryTable.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/inventory/InventoryTable.tsx), [`components/inventory/MedicineForm.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/inventory/MedicineForm.tsx) |
| **R2** | **Risk Categorization & Summary Dashboard:** Real-time categorization (Expired, ≤30d, 31–90d, Safe), immediate risk calculation, 6-month forecast chart, and urgent alerts. | **Complete** | [`app/page.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/app/page.tsx), [`components/dashboard/SummaryCards.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/dashboard/SummaryCards.tsx), [`components/dashboard/ExpiryChart.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/dashboard/ExpiryChart.tsx), [`lib/calculations.ts`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/lib/calculations.ts) |
| **R3** | **Financial Risk & Loss Intervals:** Capital at risk quantification, 4-week interval breakdown ($0–7$, $8–14$, $15–21$, $22–28$ days), and top 5 value-at-risk medicines list. | **Complete** | [`app/expiry-loss/page.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/app/expiry-loss/page.tsx), [`components/dashboard/FinancialRisk.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/dashboard/FinancialRisk.tsx), [`lib/calculations.ts`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/lib/calculations.ts) |
| **R4** | **POS Sell Workflow & Return Management:** Sell non-expired medicines with invoice modal, stock auto-deduction, and return tracking for expired stock. | **Complete** | [`app/sell/page.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/app/sell/page.tsx), [`components/sell/InvoiceModal.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/sell/InvoiceModal.tsx), [`app/returned/page.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/app/returned/page.tsx), [`components/returned/ReturnedTable.tsx`](file:///Users/saeedahmedmahin/code/lsh26-t061-p02/components/returned/ReturnedTable.tsx) |

---

##  Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS (Custom Botanical Clay Theme)
- **Database & Auth:** Supabase (PostgreSQL with RLS)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Language:** TypeScript

---

##  Setup and Run Steps

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/bikramroyutsa/lsh26-t061-p02.git
cd lsh26-t061-p02
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file (or use built-in defaults):
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### 4. Demo Access
To test the application:
- Register any mock email and password combination on the sign-up screen (email verification is disabled by default).
- Alternatively, use the built-in guest demo access button on the login screen.

---

##  Major Design Decisions

1. **Multi-Tenant Row-Level Security:** Isolated each pharmacy branch into separate workspaces to ensure multi-store security.
2. **Strict Expiry Validation at POS:** Programmatically barred expired medicines from appearing on the Sell/POS screen to prevent dispensing expired products.
3. **Soft-Removal Return Management:** Flagging returned items rather than deleting them ensures audit logs remain intact for supplier credit claims.
4. **Botanical Clay UI Design System:** Crafted a soothing, clinical visual palette using soft greens (`#F2F7F4`, `#13241b`, `#059669`) with subtle card shadows and rounded surfaces.

---

##  Known Limitations

1. **Hardware Barcode Scanning:** Relies on manual batch/name text search rather than physical laser scanner WebHID integration.
2. **Push Notifications:** Near-expiry alerts are in-app; SMS/WhatsApp supplier alert triggers require external webhook API keys.

---

##  AI Tools Disclosure

As disclosed in `evaluation-manifest.json` and `LICENSES.md`:
- **Gemini 3.7 Flash / 3.6 / 3.5 Flash:** Used for component boilerplate scaffolding, UI styling, and layout refactoring. Verified via code review and browser testing.
- **Gemini 3.1 Pro / Flash:** Used for risk valuation formula derivations and query optimizations. Verified via test fixtures.
- **Claude Sonnet 4.6:** Used for architecture planning, design token structuring, and TypeScript debugging. Verified via Next.js build compilation.

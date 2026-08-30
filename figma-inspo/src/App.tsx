import { useState, useMemo, useRef } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

// ─── Types ────────────────────────────────────────────────────────────────────
type Medicine = {
  id: string
  name: string
  company: string
  batch: string
  quantity: number
  unit_price_bdt: number
  expiry: string
  shelf_life_days?: number
}

type FilterTab = "all" | "expired" | "soon" | "watch" | "safe" | "returned"
type ModalView = "none" | "entry" | "chart" | "search"

// ─── Helpers ─────────────────────────────────────────────────────────────────
const TODAY = new Date("2026-08-30")
TODAY.setHours(0, 0, 0, 0)

function diffDays(expiryStr: string): number {
  const exp = new Date(expiryStr)
  exp.setHours(0, 0, 0, 0)
  return Math.floor((exp.getTime() - TODAY.getTime()) / 86400000)
}

function classify(days: number): "expired" | "soon" | "watch" | "safe" {
  if (days < 0) return "expired"
  if (days <= 30) return "soon"
  if (days <= 90) return "watch"
  return "safe"
}

function fmt(n: number) {
  return "৳" + n.toLocaleString("en-BD")
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS: Record<
  string,
  { label: string; color: string; bg: string; textColor: string; dot: string }
> = {
  expired: { label: "Expired", color: "#EF4444", bg: "#FEF2F2", textColor: "#991B1B", dot: "#EF4444" },
  soon: { label: "Expiring Soon", color: "#F97316", bg: "#FFF7ED", textColor: "#9A3412", dot: "#F97316" },
  watch: { label: "Watch", color: "#D97706", bg: "#FFFBEB", textColor: "#92400E", dot: "#D97706" },
  safe: { label: "Safe", color: "#16A34A", bg: "#F0FDF4", textColor: "#14532D", dot: "#16A34A" },
  returned: { label: "Returned", color: "#5C4FE5", bg: "#EEF2FF", textColor: "#3730A3", dot: "#5C4FE5" },
}

// ─── Stock Data ───────────────────────────────────────────────────────────────
const INITIAL_STOCK: Medicine[] = [
  // Expired
  { id: "1", name: "Napa 500mg", company: "Beximco", batch: "BX-2204", quantity: 48, unit_price_bdt: 1.5, expiry: "2026-07-15", shelf_life_days: 730 },
  { id: "2", name: "Zimax 250mg", company: "Square", batch: "SQ-2201", quantity: 12, unit_price_bdt: 45, expiry: "2026-06-30", shelf_life_days: 730 },
  { id: "3", name: "Surbex-Z", company: "Abbott", batch: "AB-2203", quantity: 30, unit_price_bdt: 18, expiry: "2026-08-10", shelf_life_days: 730 },
  { id: "4", name: "Ranitidine 150mg", company: "ACI", batch: "AC-2112", quantity: 60, unit_price_bdt: 3.5, expiry: "2026-05-20", shelf_life_days: 730 },
  { id: "5", name: "Metformin 500mg", company: "Incepta", batch: "IN-2201", quantity: 90, unit_price_bdt: 4, expiry: "2026-07-01", shelf_life_days: 730 },
  // Expiring in 1-2 days
  { id: "6", name: "Cetirizine 10mg", company: "Beximco", batch: "BX-2408", quantity: 24, unit_price_bdt: 5, expiry: "2026-08-31", shelf_life_days: 730 },
  { id: "7", name: "Omeprazole 20mg", company: "Square", batch: "SQ-2409", quantity: 15, unit_price_bdt: 12, expiry: "2026-09-01", shelf_life_days: 365 },
  // Expiring 7-14 days
  { id: "8", name: "Amoxicillin 500mg", company: "ACI", batch: "AC-2408", quantity: 36, unit_price_bdt: 8, expiry: "2026-09-07", shelf_life_days: 730 },
  { id: "9", name: "Paracetamol 650mg", company: "Opsonin", batch: "OP-2409", quantity: 72, unit_price_bdt: 2, expiry: "2026-09-10", shelf_life_days: 730 },
  { id: "10", name: "Loratadine 10mg", company: "Incepta", batch: "IN-2408", quantity: 20, unit_price_bdt: 7, expiry: "2026-09-12", shelf_life_days: 730 },
  // Expiring 15-30 days
  { id: "11", name: "Metronidazole 400mg", company: "Beximco", batch: "BX-2409", quantity: 30, unit_price_bdt: 4.5, expiry: "2026-09-20", shelf_life_days: 730 },
  { id: "12", name: "Ibuprofen 400mg", company: "Square", batch: "SQ-2410", quantity: 45, unit_price_bdt: 6, expiry: "2026-09-25", shelf_life_days: 730 },
  { id: "13", name: "Clopidogrel 75mg", company: "Renata", batch: "RN-2408", quantity: 28, unit_price_bdt: 22, expiry: "2026-09-22", shelf_life_days: 730 },
  { id: "14", name: "Atorvastatin 20mg", company: "ACI", batch: "AC-2409", quantity: 18, unit_price_bdt: 35, expiry: "2026-09-28", shelf_life_days: 730 },
  { id: "15", name: "Pantoprazole 40mg", company: "Incepta", batch: "IN-2409", quantity: 24, unit_price_bdt: 15, expiry: "2026-09-15", shelf_life_days: 365 },
  // Watch (31-90 days)
  { id: "16", name: "Vitamin D3 1000IU", company: "Beximco", batch: "BX-2501", quantity: 60, unit_price_bdt: 9, expiry: "2026-10-15", shelf_life_days: 730 },
  { id: "17", name: "Azithromycin 500mg", company: "Square", batch: "SQ-2501", quantity: 18, unit_price_bdt: 55, expiry: "2026-10-20", shelf_life_days: 730 },
  { id: "18", name: "Lisinopril 10mg", company: "Renata", batch: "RN-2501", quantity: 30, unit_price_bdt: 18, expiry: "2026-11-01", shelf_life_days: 730 },
  { id: "19", name: "Salbutamol Inhaler", company: "ACI", batch: "AC-2501", quantity: 8, unit_price_bdt: 120, expiry: "2026-10-30", shelf_life_days: 365 },
  { id: "20", name: "Dexamethasone 4mg", company: "Incepta", batch: "IN-2501", quantity: 20, unit_price_bdt: 28, expiry: "2026-11-10", shelf_life_days: 730 },
  { id: "21", name: "Fluconazole 150mg", company: "Beximco", batch: "BX-2502", quantity: 12, unit_price_bdt: 40, expiry: "2026-10-05", shelf_life_days: 730 },
  { id: "22", name: "Ciprofloxacin 500mg", company: "Opsonin", batch: "OP-2501", quantity: 24, unit_price_bdt: 14, expiry: "2026-11-15", shelf_life_days: 730 },
  { id: "23", name: "Diclofenac 50mg", company: "Square", batch: "SQ-2502", quantity: 40, unit_price_bdt: 5, expiry: "2026-10-25", shelf_life_days: 730 },
  { id: "24", name: "Esomeprazole 40mg", company: "Renata", batch: "RN-2502", quantity: 15, unit_price_bdt: 32, expiry: "2026-11-20", shelf_life_days: 365 },
  { id: "25", name: "Losartan 50mg", company: "ACI", batch: "AC-2502", quantity: 30, unit_price_bdt: 16, expiry: "2026-10-12", shelf_life_days: 730 },
  // Safe
  { id: "26", name: "Insulin Glargine", company: "Novo Nordisk", batch: "NN-2601", quantity: 5, unit_price_bdt: 650, expiry: "2027-04-15", shelf_life_days: 730 },
  { id: "27", name: "Rosuvastatin 10mg", company: "Renata", batch: "RN-2601", quantity: 45, unit_price_bdt: 28, expiry: "2027-03-20", shelf_life_days: 730 },
  { id: "28", name: "Tamsulosin 0.4mg", company: "Incepta", batch: "IN-2601", quantity: 30, unit_price_bdt: 22, expiry: "2027-05-10", shelf_life_days: 730 },
  { id: "29", name: "Montelukast 10mg", company: "Square", batch: "SQ-2601", quantity: 20, unit_price_bdt: 30, expiry: "2027-02-28", shelf_life_days: 730 },
  { id: "30", name: "Pregabalin 75mg", company: "Beximco", batch: "BX-2601", quantity: 18, unit_price_bdt: 65, expiry: "2027-06-15", shelf_life_days: 730 },
  { id: "31", name: "Rabeprazole 20mg", company: "ACI", batch: "AC-2601", quantity: 24, unit_price_bdt: 18, expiry: "2027-01-20", shelf_life_days: 365 },
  { id: "32", name: "Amlodipine 5mg", company: "Opsonin", batch: "OP-2601", quantity: 60, unit_price_bdt: 8, expiry: "2027-03-05", shelf_life_days: 730 },
  { id: "33", name: "Glimepiride 2mg", company: "Renata", batch: "RN-2602", quantity: 30, unit_price_bdt: 12, expiry: "2027-07-20", shelf_life_days: 730 },
  { id: "34", name: "Metoprolol 50mg", company: "Incepta", batch: "IN-2602", quantity: 45, unit_price_bdt: 10, expiry: "2027-04-30", shelf_life_days: 730 },
  { id: "35", name: "Sertraline 50mg", company: "Square", batch: "SQ-2602", quantity: 20, unit_price_bdt: 45, expiry: "2027-08-15", shelf_life_days: 730 },
  { id: "36", name: "Fexofenadine 120mg", company: "ACI", batch: "AC-2602", quantity: 30, unit_price_bdt: 20, expiry: "2027-02-10", shelf_life_days: 730 },
  { id: "37", name: "Calcium + D3", company: "Beximco", batch: "BX-2602", quantity: 50, unit_price_bdt: 12, expiry: "2027-05-25", shelf_life_days: 730 },
  { id: "38", name: "Ceftriaxone 1g Vial", company: "Square", batch: "SQ-2603", quantity: 10, unit_price_bdt: 180, expiry: "2027-09-01", shelf_life_days: 730 },
  { id: "39", name: "Ondansetron 4mg", company: "Renata", batch: "RN-2603", quantity: 24, unit_price_bdt: 25, expiry: "2027-06-30", shelf_life_days: 730 },
  { id: "40", name: "Furosemide 40mg", company: "Opsonin", batch: "OP-2602", quantity: 36, unit_price_bdt: 6, expiry: "2027-03-15", shelf_life_days: 730 },
  { id: "41", name: "Spironolactone 25mg", company: "Incepta", batch: "IN-2603", quantity: 20, unit_price_bdt: 14, expiry: "2027-07-08", shelf_life_days: 730 },
  { id: "42", name: "Warfarin 5mg", company: "ACI", batch: "AC-2603", quantity: 15, unit_price_bdt: 30, expiry: "2027-04-12", shelf_life_days: 730 },
]

// ─── Entry form state ─────────────────────────────────────────────────────────
type EntryForm = {
  name: string; company: string; batch: string
  quantity: string; unit_price_bdt: string
  shelf_life_days: string; expiry: string
}

const EMPTY_FORM: EntryForm = {
  name: "", company: "", batch: "",
  quantity: "", unit_price_bdt: "",
  shelf_life_days: "730", expiry: addDays(TODAY, 730),
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function IconSearch() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  )
}
function IconTag() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeLinejoin="round" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
function IconChart() {
  return (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M18 20V10M12 20V4M6 20v-6" strokeLinecap="round" />
    </svg>
  )
}
function IconX() {
  return (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
    </svg>
  )
}
function IconWarning() {
  return (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinejoin="round" />
      <line x1="12" x2="12" y1="9" y2="13" strokeLinecap="round" />
      <line x1="12" x2="12.01" y1="17" y2="17" strokeLinecap="round" />
    </svg>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [stock, setStock] = useState<Medicine[]>(INITIAL_STOCK)
  const [returned, setReturned] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")
  const [modal, setModal] = useState<ModalView>("none")
  const [form, setForm] = useState<EntryForm>(EMPTY_FORM)
  const searchRef = useRef<HTMLInputElement>(null)

  const enriched = useMemo(
    () =>
      stock.map((m) => {
        const days = diffDays(m.expiry)
        return { ...m, days, status: classify(days), value: m.quantity * m.unit_price_bdt, isReturned: returned.has(m.id) }
      }),
    [stock, returned]
  )

  const active = useMemo(() => enriched.filter((m) => !m.isReturned), [enriched])
  const returnedItems = useMemo(() => enriched.filter((m) => m.isReturned), [enriched])

  const groups = useMemo(() => {
    const expired = active.filter((m) => m.status === "expired")
    const soon = active.filter((m) => m.status === "soon")
    const watch = active.filter((m) => m.status === "watch")
    const safe = active.filter((m) => m.status === "safe")
    return {
      expired, soon, watch, safe,
      expiredValue: expired.reduce((s, m) => s + m.value, 0),
      soonValue: soon.reduce((s, m) => s + m.value, 0),
    }
  }, [active])

  const urgent = useMemo(
    () => active.filter((m) => m.days >= 0 && m.days <= 2).sort((a, b) => a.days - b.days),
    [active]
  )

  const filtered = useMemo(() => {
    let list =
      filter === "returned" ? returnedItems
        : filter === "all" ? active
          : active.filter((m) => m.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.batch.toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => a.days - b.days)
  }, [filter, active, returnedItems, search])

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(TODAY)
      d.setMonth(d.getMonth() + i + 1)
      d.setDate(1)
      const yr = d.getFullYear()
      const mo = d.getMonth()
      const value = active.filter((m) => {
        const exp = new Date(m.expiry)
        return exp.getFullYear() === yr && exp.getMonth() === mo
      }).reduce((s, m) => s + m.value, 0)
      return { month: d.toLocaleString("en-GB", { month: "short", year: "2-digit" }), value: Math.round(value) }
    })
  }, [active])

  function markReturned(id: string) {
    setReturned((prev) => new Set([...prev, id]))
  }

  function undoReturn(id: string) {
    setReturned((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  function handleFormChange(k: keyof EntryForm, v: string) {
    setForm((prev) => {
      const next = { ...prev, [k]: v }
      if (k === "shelf_life_days") next.expiry = addDays(TODAY, parseInt(v) || 730)
      return next
    })
  }

  function handleAddMedicine() {
    if (!form.name || !form.batch) return
    setStock((prev) => [...prev, {
      id: `c-${Date.now()}`,
      name: form.name, company: form.company, batch: form.batch,
      quantity: parseInt(form.quantity) || 1,
      unit_price_bdt: parseFloat(form.unit_price_bdt) || 0,
      expiry: form.expiry,
      shelf_life_days: parseInt(form.shelf_life_days) || 730,
    }])
    setForm(EMPTY_FORM)
    setModal("none")
    setFilter("all")
  }

  const PALETTE = {
    bg: "#F4F2FF",
    navy: "#1A1340",
    primary: "#5C4FE5",
    muted: "#6B7280",
    border: "#E8E5F5",
    card: "#ffffff",
  }

  const CHART_COLORS = ["#EF4444", "#F97316", "#D97706", "#16A34A", "#5C4FE5", "#7C3AED"]

  return (
    <div style={{ minHeight: "100%", background: PALETTE.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "sticky", top: 0, zIndex: 30,
          background: "rgba(244,242,255,0.92)",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${PALETTE.border}`,
          padding: "0 20px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: PALETTE.navy, letterSpacing: "-0.01em" }}>
              MediShelf
            </div>
            <div style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "'DM Mono', monospace", marginTop: 1 }}>
              Khulna Pharmacy
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "'DM Mono', monospace", padding: "4px 10px", background: PALETTE.card, borderRadius: 8, border: `1px solid ${PALETTE.border}` }}>
              {TODAY.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
            </div>
            <button
              onClick={() => setModal(modal === "chart" ? "none" : "chart")}
              style={{
                width: 34, height: 34, borderRadius: 9,
                background: modal === "chart" ? PALETTE.primary : PALETTE.card,
                color: modal === "chart" ? "#fff" : PALETTE.muted,
                border: `1px solid ${modal === "chart" ? PALETTE.primary : PALETTE.border}`,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                transition: "all 0.15s",
              }}
              title="Value-at-risk chart"
            >
              <IconChart />
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 20px 120px" }}>

        {/* ── Alert Banner ─────────────────────────────────────────────── */}
        {urgent.length > 0 && (
          <div
            style={{
              background: PALETTE.navy,
              borderRadius: 14,
              padding: "20px 24px",
              marginBottom: 16,
              boxShadow: `0 4px 0 rgba(26,19,64,0.4), 0 12px 32px rgba(26,19,64,0.22)`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ color: "#F97316", display: "flex" }}>
                <IconWarning />
              </div>
              <span style={{ color: "#F97316", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                Urgent — Expiring Within 2 Days
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {urgent.map((m) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 10, padding: "12px 16px",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                      {m.batch} &middot; {m.quantity} units
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: m.days === 0 ? "#EF4444" : "#F97316" }}>
                      {m.days === 0 ? "Expires Today" : `${m.days} day${m.days !== 1 ? "s" : ""} left`}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                      {fmtDate(m.expiry)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Stat Cards ───────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {([
            { key: "expired", label: "Expired", count: groups.expired.length, value: groups.expiredValue, sublabel: "Total loss" },
            { key: "soon", label: "Expiring Soon", count: groups.soon.length, value: groups.soonValue, sublabel: "Value at risk" },
            { key: "watch", label: "Watch (90d)", count: groups.watch.length, value: null, sublabel: "Monitor these" },
            { key: "safe", label: "Safe Stock", count: groups.safe.length, value: null, sublabel: "No action needed" },
          ] as const).map((card) => {
            const s = STATUS[card.key]
            const isActive = filter === card.key
            return (
              <button
                key={card.key}
                onClick={() => setFilter(isActive ? "all" : (card.key as FilterTab))}
                className="clay-card"
                style={{
                  textAlign: "left", padding: "16px 18px", cursor: "pointer",
                  outline: isActive ? `2px solid ${s.color}` : "2px solid transparent",
                  outlineOffset: 2,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: s.textColor, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                      {card.label}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, color: PALETTE.navy, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                      {card.count}
                    </div>
                    <div style={{ fontSize: 12, color: PALETTE.muted, marginTop: 4 }}>
                      {card.sublabel}
                    </div>
                  </div>
                  {card.value !== null && (
                    <div style={{ padding: "5px 10px", borderRadius: 8, background: s.bg, textAlign: "right" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: s.textColor, fontFamily: "'DM Mono', monospace" }}>
                        {fmt(Math.round(card.value))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 14, height: 3, borderRadius: 99, background: s.bg, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%", borderRadius: 99, background: s.color,
                      width: `${Math.min(100, (card.count / Math.max(1, active.length)) * 100)}%`,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Chart ────────────────────────────────────────────────────── */}
        {modal === "chart" && (
          <div className="clay-card animate-slide-in" style={{ padding: "20px 20px 16px", marginBottom: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: PALETTE.navy }}>Value Expiring — Next 6 Months</div>
              <div style={{ fontSize: 12, color: PALETTE.muted, marginTop: 2 }}>Stock purchase value by expiry month</div>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={chartData} barCategoryGap="38%">
                <XAxis dataKey="month" tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: PALETTE.muted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fill: PALETTE.muted }} axisLine={false} tickLine={false} width={46}
                  tickFormatter={(v) => `৳${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`} />
                <Tooltip formatter={(v: number) => [fmt(v), "Value"]}
                  contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.10)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12 }} />
                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Filter + Table ────────────────────────────────────────────── */}
        <div className="clay-card" style={{ overflow: "hidden" }}>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${PALETTE.border}`, padding: "0 4px" }}>
            {([
              { key: "all", label: "All", count: active.length },
              { key: "expired", label: "Expired", count: groups.expired.length },
              { key: "soon", label: "Soon", count: groups.soon.length },
              { key: "watch", label: "Watch", count: groups.watch.length },
              { key: "safe", label: "Safe", count: groups.safe.length },
              { key: "returned", label: "Returned", count: returnedItems.length },
            ] as const).map((tab) => {
              const s = tab.key !== "all" && tab.key !== "returned" ? STATUS[tab.key] : null
              const isActive = filter === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as FilterTab)}
                  style={{
                    padding: "12px 12px 11px",
                    fontSize: 12, fontWeight: isActive ? 700 : 500,
                    color: isActive ? PALETTE.primary : PALETTE.muted,
                    borderBottom: isActive ? `2px solid ${PALETTE.primary}` : "2px solid transparent",
                    background: "none", cursor: "pointer",
                    transition: "all 0.12s", whiteSpace: "nowrap",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                >
                  {tab.label}
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700,
                      padding: "1px 5px", borderRadius: 99,
                      fontFamily: "'DM Mono', monospace",
                      background: isActive ? PALETTE.primary : (s ? s.bg : "#F3F0FF"),
                      color: isActive ? "#fff" : (s ? s.textColor : PALETTE.muted),
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Table header */}
          <div
            style={{
              display: "grid", gridTemplateColumns: "1fr 90px 80px 90px 96px",
              padding: "9px 16px", background: "#FAFAFA",
              borderBottom: `1px solid ${PALETTE.border}`,
            }}
          >
            {["Medicine / Batch", "Qty", "Unit Price", "Value", "Status"].map((h) => (
              <div key={h} style={{ fontSize: 10, fontWeight: 700, color: PALETTE.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {h}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: "40px 0", textAlign: "center", color: PALETTE.muted, fontSize: 13 }}>
                No medicines found
              </div>
            )}
            {filtered.map((m, idx) => {
              const cfg = m.isReturned ? STATUS.returned : STATUS[m.status]
              return (
                <div
                  key={m.id}
                  style={{
                    display: "grid", gridTemplateColumns: "1fr 90px 80px 90px 96px",
                    padding: "11px 16px", alignItems: "center",
                    borderBottom: idx < filtered.length - 1 ? `1px solid ${PALETTE.border}` : "none",
                    background: "transparent",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: PALETTE.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11, color: PALETTE.muted, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                      {m.batch} &middot; {m.company}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: PALETTE.navy, fontFamily: "'DM Mono', monospace" }}>
                    {m.quantity}
                  </div>
                  <div style={{ fontSize: 12, color: PALETTE.muted, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(m.unit_price_bdt)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: PALETTE.navy, fontFamily: "'DM Mono', monospace" }}>
                    {fmt(Math.round(m.value))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 3 }}>
                      <span
                        style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                          background: cfg.bg, color: cfg.textColor,
                        }}
                      >
                        {m.isReturned ? "Returned" : m.days < 0 ? `${Math.abs(m.days)}d ago` : m.days === 0 ? "Today" : `${m.days}d`}
                      </span>
                    </div>
                    {m.isReturned ? (
                      <button
                        onClick={() => undoReturn(m.id)}
                        style={{ fontSize: 10, padding: "3px 8px", borderRadius: 7, border: `1px solid ${PALETTE.border}`, background: "#fff", color: PALETTE.muted, cursor: "pointer", fontWeight: 600 }}
                      >
                        Undo
                      </button>
                    ) : (
                      <button
                        onClick={() => markReturned(m.id)}
                        style={{ fontSize: 10, padding: "3px 8px", borderRadius: 7, border: `1px solid ${PALETTE.border}`, background: "#fff", color: PALETTE.muted, cursor: "pointer", fontWeight: 600, transition: "all 0.12s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = PALETTE.primary; e.currentTarget.style.color = PALETTE.primary }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = PALETTE.border; e.currentTarget.style.color = PALETTE.muted }}
                      >
                        Return
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          background: "rgba(244,242,255,0.94)", backdropFilter: "blur(14px)",
          borderTop: `1px solid ${PALETTE.border}`,
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "10px 20px", display: "flex", gap: 10 }}>
          <button
            onClick={() => setModal(modal === "search" ? "none" : "search")}
            style={{
              flex: 1, height: 44, borderRadius: 11,
              background: modal === "search" ? PALETTE.primary : PALETTE.card,
              color: modal === "search" ? "#fff" : PALETTE.muted,
              border: `1px solid ${modal === "search" ? PALETTE.primary : PALETTE.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <IconSearch /> Search
          </button>
          <button
            onClick={() => setModal(modal === "entry" ? "none" : "entry")}
            style={{
              flex: 2, height: 44, borderRadius: 11,
              background: PALETTE.primary, color: "#fff",
              border: "none",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 3px 0 rgba(92,79,229,0.35)`,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <IconPlus /> Add Entry
          </button>
          <button
            style={{
              flex: 1, height: 44, borderRadius: 11,
              background: PALETTE.card, color: PALETTE.muted,
              border: `1px solid ${PALETTE.border}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            <IconTag /> Sell
          </button>
        </div>
      </div>

      {/* ── Search Sheet ──────────────────────────────────────────────────── */}
      {modal === "search" && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26,19,64,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setModal("none")}
        >
          <div
            className="animate-slide-in"
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#FAF8FF", borderRadius: "20px 20px 0 0",
              padding: "24px 24px 48px", maxWidth: 720, margin: "0 auto",
              boxShadow: "0 -8px 40px rgba(26,19,64,0.18)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: PALETTE.navy }}>Search Stock</div>
              <button
                onClick={() => setModal("none")}
                style={{ width: 30, height: 30, borderRadius: 8, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: PALETTE.muted }}
              >
                <IconX />
              </button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px", height: 44, borderRadius: 11, border: `1.5px solid ${PALETTE.primary}`, background: "#fff" }}>
              <span style={{ color: PALETTE.primary }}><IconSearch /></span>
              <input
                ref={searchRef}
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Medicine name, company, or batch..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", fontSize: 13, color: PALETTE.navy, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ color: PALETTE.muted, background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                  <IconX />
                </button>
              )}
            </div>
            {search && (
              <div style={{ marginTop: 12, fontSize: 12, color: PALETTE.muted }}>
                {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Entry Sheet ───────────────────────────────────────────────────── */}
      {modal === "entry" && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(26,19,64,0.45)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && setModal("none")}
        >
          <div
            className="animate-slide-in"
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0,
              background: "#FAF8FF", borderRadius: "20px 20px 0 0",
              padding: "24px 24px 48px", maxWidth: 720, margin: "0 auto",
              boxShadow: "0 -8px 40px rgba(26,19,64,0.18)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: PALETTE.navy }}>Add New Medicine</div>
              <button
                onClick={() => setModal("none")}
                style={{ width: 30, height: 30, borderRadius: 8, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: PALETTE.muted }}
              >
                <IconX />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {([
                { key: "name", label: "Medicine Name", placeholder: "Napa 500mg", span: 2 },
                { key: "company", label: "Company", placeholder: "Beximco" },
                { key: "batch", label: "Batch No.", placeholder: "BX-2501" },
                { key: "quantity", label: "Quantity", placeholder: "48", type: "number" },
                { key: "unit_price_bdt", label: "Unit Price (BDT)", placeholder: "12.50", type: "number" },
                { key: "shelf_life_days", label: "Shelf Life (days)", placeholder: "730", type: "number" },
                { key: "expiry", label: "Expiry Date", placeholder: "", type: "date" },
              ] as const).map((field) => (
                <div key={field.key} style={{ gridColumn: "span" in field && field.span === 2 ? "1 / -1" : undefined }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: PALETTE.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type ?? "text"}
                    value={form[field.key]}
                    onChange={(e) => handleFormChange(field.key as keyof EntryForm, e.target.value)}
                    placeholder={field.placeholder}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      height: 40, padding: "0 12px", borderRadius: 9,
                      background: "#fff", border: `1.5px solid ${PALETTE.border}`,
                      fontSize: 13, color: PALETTE.navy, outline: "none",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      transition: "border-color 0.15s",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = PALETTE.primary)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = PALETTE.border)}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setModal("none")}
                style={{ flex: 1, height: 44, borderRadius: 11, background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, color: PALETTE.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMedicine}
                disabled={!form.name || !form.batch}
                style={{
                  flex: 2, height: 44, borderRadius: 11,
                  background: PALETTE.primary, color: "#fff",
                  border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer",
                  opacity: !form.name || !form.batch ? 0.5 : 1,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  boxShadow: `0 3px 0 rgba(92,79,229,0.35)`,
                }}
              >
                Add to Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

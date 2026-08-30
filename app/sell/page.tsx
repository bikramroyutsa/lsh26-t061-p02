'use client';

import React, { useState, useMemo } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { useAuth } from '@/context/AuthContext';
import { getMedicinePrice, getMedicineExpiry } from '@/lib/calculations';
import { formatLocalDate, getDaysRemaining } from '@/lib/expiry';
import { Medicine } from '@/types/medicine';
import InvoiceModal, { SaleInvoice } from '@/components/sell/InvoiceModal';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CreditCard,
  User,
  Phone,
  Loader2,
  Package,
  Check,
  History,
  Tag,
} from 'lucide-react';

interface CartItem {
  medicine: Medicine;
  quantity: number;
}

export default function SellPage() {
  const { medicines, loading, sellMedicines } = usePharmacy();
  const { pharmacy } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_banking'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice Modal state
  const [activeInvoice, setActiveInvoice] = useState<SaleInvoice | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Session Sales History
  const [recentInvoices, setRecentInvoices] = useState<SaleInvoice[]>([]);

  // Filter available active stock (quantity > 0 and not returned)
  const availableMedicines = useMemo(() => {
    const active = medicines.filter((m) => !m.returned && m.quantity > 0);
    if (!searchQuery.trim()) return active;

    const q = searchQuery.toLowerCase();
    return active.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.batch.toLowerCase().includes(q)
    );
  }, [medicines, searchQuery]);

  const formatBDT = (val: number) => `৳ ${val.toFixed(2)}`;

  // Cart operations
  const addToCart = (med: Medicine) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicine.id === med.id);
      if (existing) {
        if (existing.quantity >= med.quantity) return prev; // max available stock limit
        return prev.map((item) =>
          item.medicine.id === med.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { medicine: med, quantity: 1 }];
    });
  };

  const updateQuantity = (medId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicine.id === medId) {
            const maxAvailable = item.medicine.quantity;
            const newQty = Math.max(0, Math.min(maxAvailable, item.quantity + delta));
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const setDirectQuantity = (medId: string, val: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.medicine.id === medId) {
            const maxAvailable = item.medicine.quantity;
            const newQty = Math.max(0, Math.min(maxAvailable, isNaN(val) ? 0 : val));
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (medId: string) => {
    setCart((prev) => prev.filter((item) => item.medicine.id !== medId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = getMedicinePrice(item.medicine);
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const grandTotal = Math.max(0, subtotal - (discount || 0));

  // Complete Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      // 1. Prepare sell payload
      const sellPayload = cart.map((item) => ({
        id: item.medicine.id,
        quantity: item.quantity,
      }));

      // 2. Call context method to decrease inventory stock
      await sellMedicines(sellPayload);

      // 3. Generate Invoice object
      const now = new Date();
      const invoiceId = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const newInvoice: SaleInvoice = {
        id: invoiceId,
        dateStr,
        customerName: customerName.trim() || undefined,
        customerPhone: customerPhone.trim() || undefined,
        paymentMethod: paymentMethod.replace('_', ' '),
        items: cart.map((item) => {
          const price = getMedicinePrice(item.medicine);
          return {
            medicine: item.medicine,
            quantity: item.quantity,
            unitPrice: price,
            lineTotal: price * item.quantity,
          };
        }),
        subtotal,
        discount: discount || 0,
        grandTotal,
      };

      // 4. Update session history & show invoice modal
      setActiveInvoice(newInvoice);
      setRecentInvoices((prev) => [newInvoice, ...prev]);
      setIsInvoiceOpen(true);

      // 5. Reset sale cart form
      clearCart();
    } catch (e) {
      console.error('Sale submission error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
        <span className="font-sans text-sm text-muted">Loading Point of Sale inventory…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Receipt className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <h2 className="font-serif italic text-3xl md:text-4xl text-fg tracking-tight">
              Sell Medicine & Invoice Counter
            </h2>
          </div>
          <p className="text-sm text-muted mt-1">
            Search active inventory stock, construct customer orders, generate invoices, and automatically deduct sold quantities.
          </p>
        </div>
      </div>

      {/* ── Main POS Interface: Split Search vs Cart ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Medicine Search & Stock Selector (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Search Header */}
          <div className="clay-card p-4 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine name, company or batch to sell..."
              className="w-full bg-transparent text-sm text-fg placeholder-muted focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-muted hover:text-fg font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Medicines Grid / List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-muted font-mono px-1">
              <span>Available Inventory Stock</span>
              <span>{availableMedicines.length} items found</span>
            </div>

            {availableMedicines.length === 0 ? (
              <div className="clay-card p-12 text-center flex flex-col items-center justify-center">
                <Package className="w-8 h-8 text-muted mb-2" strokeWidth={1.5} />
                <p className="text-sm font-medium text-fg">No available stock found</p>
                <p className="text-xs text-muted mt-1">Check query or restock medicines in inventory.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[640px] overflow-y-auto pr-1">
                {availableMedicines.map((m) => {
                  const cartItem = cart.find((i) => i.medicine.id === m.id);
                  const inCartQty = cartItem ? cartItem.quantity : 0;
                  const remainingStock = m.quantity - inCartQty;
                  const price = getMedicinePrice(m);
                  const days = getDaysRemaining(getMedicineExpiry(m));

                  return (
                    <div
                      key={m.id}
                      className={`clay-card p-4 flex flex-col justify-between transition-all duration-200 ${
                        inCartQty > 0 ? 'ring-2 ring-primary bg-primary/5' : 'hover:border-primary/40'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-fg text-sm leading-tight line-clamp-1">
                            {m.name}
                          </h4>
                          <span className="font-mono text-xs font-bold text-primary ml-2 flex-shrink-0">
                            {formatBDT(price)}
                          </span>
                        </div>

                        <p className="text-[11px] text-muted mt-0.5">{m.company}</p>

                        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] font-mono">
                          <span className="bg-bg border border-border text-muted px-2 py-0.5 rounded">
                            Batch: {m.batch}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              days < 0
                                ? 'bg-expired-bg text-expired'
                                : days <= 30
                                ? 'bg-warn-bg text-warn'
                                : 'bg-safe-bg text-safe'
                            }`}
                          >
                            Exp: {formatLocalDate(getMedicineExpiry(m))}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <div className="text-xs font-mono">
                          <span className="text-muted">Stock: </span>
                          <strong className={remainingStock <= 5 ? 'text-expired' : 'text-fg'}>
                            {remainingStock} units left
                          </strong>
                        </div>

                        <button
                          onClick={() => addToCart(m)}
                          disabled={remainingStock <= 0}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-primary hover:bg-fg active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{inCartQty > 0 ? `Add (${inCartQty})` : 'Select'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Checkout Cart & Sale Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="clay-card p-6 space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-primary" />
                <h3 className="font-serif font-bold text-lg text-fg">Current Sale Cart</h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-muted hover:text-expired font-medium transition-colors"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Cart Items List */}
            {cart.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <ShoppingCart className="w-8 h-8 text-muted mx-auto" strokeWidth={1.5} />
                <p className="text-xs text-muted">No medicines selected for sale.</p>
                <p className="text-[11px] text-muted italic">Click &quot;Select&quot; on available medicines on the left to add items.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 divide-y divide-border">
                {cart.map((item) => {
                  const price = getMedicinePrice(item.medicine);
                  const lineTotal = price * item.quantity;
                  const maxStock = item.medicine.quantity;

                  return (
                    <div key={item.medicine.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm text-fg truncate">{item.medicine.name}</div>
                        <div className="text-[11px] text-muted font-mono">
                          {formatBDT(price)} × {item.quantity} = <strong>{formatBDT(lineTotal)}</strong>
                        </div>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => updateQuantity(item.medicine.id, -1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-fg hover:border-primary transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={maxStock}
                          value={item.quantity}
                          onChange={(e) => setDirectQuantity(item.medicine.id, parseInt(e.target.value))}
                          className="w-10 text-center font-mono text-xs font-semibold text-fg bg-transparent focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantity(item.medicine.id, 1)}
                          disabled={item.quantity >= maxStock}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-bg border border-border text-muted hover:text-fg hover:border-primary disabled:opacity-30 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.medicine.id)}
                          className="w-7 h-7 ml-1 flex items-center justify-center text-muted hover:text-expired transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Customer Details Form */}
            <div className="space-y-3 pt-4 border-t border-border">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted block">
                Customer Information (Optional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg border border-border rounded-xl text-xs text-fg placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Phone Number"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bg border border-border rounded-xl text-xs text-fg placeholder-muted focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method & Discount */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-medium text-fg flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-muted" />
                  <span>Payment Method</span>
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="px-3 py-1.5 bg-bg border border-border rounded-xl text-xs text-fg font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="cash">Cash Payment</option>
                  <option value="card">Debit / Credit Card</option>
                  <option value="mobile_banking">Bkash / Nagad / Rocket</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-medium text-fg flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-muted" />
                  <span>Discount (৳)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={discount || ''}
                  onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="0.00"
                  className="w-28 px-3 py-1 text-right font-mono text-xs bg-bg border border-border rounded-xl text-fg focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Calculation Totals */}
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex justify-between text-xs text-muted">
                <span>Subtotal</span>
                <span className="font-mono">{formatBDT(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Discount</span>
                  <span className="font-mono">- {formatBDT(discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-border">
                <span className="font-bold text-fg text-sm">Grand Total</span>
                <span className="font-serif font-bold text-2xl text-primary">
                  {formatBDT(grandTotal)}
                </span>
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0 || isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-primary hover:bg-fg text-white font-medium text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Receipt className="w-4 h-4" />
                  <span>Complete Sale & Generate Invoice</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* ── Recent Invoices History Drawer ─────────────────────────────────── */}
      {recentInvoices.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-border">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            <h3 className="font-serif italic text-xl text-fg">
              Session Invoices History ({recentInvoices.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="clay-card p-4 flex flex-col justify-between space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-fg">#{inv.id}</span>
                    <p className="text-[11px] text-muted">{inv.dateStr}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-600">
                    {formatBDT(inv.grandTotal)}
                  </span>
                </div>

                <div className="text-xs text-muted">
                  <span>{inv.items.length} items sold</span>
                  {inv.customerName && <span> &middot; {inv.customerName}</span>}
                </div>

                <button
                  onClick={() => {
                    setActiveInvoice(inv);
                    setIsInvoiceOpen(true);
                  }}
                  className="w-full py-1.5 text-xs font-medium text-primary hover:text-fg bg-primary/10 hover:bg-primary/20 rounded-full transition-colors cursor-pointer"
                >
                  View / Re-print Invoice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setActiveInvoice(null);
        }}
        invoice={activeInvoice}
        pharmacyName={pharmacy?.name}
      />
    </div>
  );
}

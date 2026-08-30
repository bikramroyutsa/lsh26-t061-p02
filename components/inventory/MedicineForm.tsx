'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { Plus, X } from 'lucide-react';

export default function MedicineForm() {
  const { addMedicine } = usePharmacy();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPriceBDT, setUnitPriceBDT] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleClose = () => {
    setIsOpen(false);
    setName('');
    setCompany('');
    setBatch('');
    setQuantity('');
    setUnitPriceBDT('');
    setExpiryDate('');
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Required';
    if (!company.trim()) e.company = 'Required';
    if (!batch.trim()) e.batch = 'Required';
    const qty = parseInt(quantity, 10);
    if (!quantity) e.quantity = 'Required';
    else if (isNaN(qty) || qty <= 0) e.quantity = 'Must be > 0';
    const price = parseFloat(unitPriceBDT);
    if (!unitPriceBDT) e.unitPriceBDT = 'Required';
    else if (isNaN(price) || price < 0) e.unitPriceBDT = 'Must be ≥ 0';
    if (!expiryDate) e.expiryDate = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addMedicine({
      name: name.trim(),
      company: company.trim(),
      batch: batch.trim().toUpperCase(),
      quantity: parseInt(quantity, 10),
      unitPriceBDT: parseFloat(unitPriceBDT),
      expiryDate,
    });
    handleClose();
  };

  // Underline input: sage-green focus border, no heavy box
  const inputClass = (hasError?: boolean) =>
    `w-full bg-transparent border-b pb-2 text-sm text-fg placeholder-muted/60 outline-none transition-colors duration-300 font-sans ${
      hasError
        ? 'border-expired'
        : 'border-border focus:border-primary'
    }`;

  return (
    <>
      {/* ── Trigger ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-fg hover:bg-interactive text-white text-sm font-medium rounded-full transition-colors duration-300 cursor-pointer shadow-sm"
      >
        <Plus className="w-4 h-4" strokeWidth={1.5} />
        Add Medicine
      </button>

      {/* ── Modal backdrop ────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-fg/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-up"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <div className="bg-bg rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-border">
              <h3 className="font-serif italic text-xl text-fg">
                Add New Medicine
              </h3>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-full hover:bg-border text-muted hover:text-fg transition-all duration-200 cursor-pointer"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="px-7 py-6 space-y-6 overflow-y-auto max-h-[70vh]"
            >
              {/* Medicine Name */}
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Napa Extend"
                  className={inputClass(!!errors.name)}
                />
                {errors.name && (
                  <p className="text-expired text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Company + Batch */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Beximco"
                    className={inputClass(!!errors.company)}
                  />
                  {errors.company && (
                    <p className="text-expired text-xs mt-1">{errors.company}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                    Batch No. *
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. NP-2401"
                    className={`${inputClass(!!errors.batch)} font-mono`}
                  />
                  {errors.batch && (
                    <p className="text-expired text-xs mt-1">{errors.batch}</p>
                  )}
                </div>
              </div>

              {/* Qty + Unit Price */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 150"
                    className={`${inputClass(!!errors.quantity)} font-mono`}
                  />
                  {errors.quantity && (
                    <p className="text-expired text-xs mt-1">{errors.quantity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                    Unit Price (BDT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPriceBDT}
                    onChange={(e) => setUnitPriceBDT(e.target.value)}
                    placeholder="e.g. 2.20"
                    className={`${inputClass(!!errors.unitPriceBDT)} font-mono`}
                  />
                  {errors.unitPriceBDT && (
                    <p className="text-expired text-xs mt-1">
                      {errors.unitPriceBDT}
                    </p>
                  )}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-[10px] font-medium uppercase tracking-widest text-primary mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`${inputClass(!!errors.expiryDate)} font-mono`}
                />
                {errors.expiryDate && (
                  <p className="text-expired text-xs mt-1">{errors.expiryDate}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-border mt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-border text-muted text-sm font-medium rounded-full hover:bg-border/50 transition-colors duration-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-[2] py-2.5 bg-fg hover:bg-interactive text-white text-sm font-medium rounded-full transition-colors duration-300 cursor-pointer"
                >
                  Save Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

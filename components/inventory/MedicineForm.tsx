'use client';

import React, { useState } from 'react';
import { usePharmacy } from '@/context/PharmacyContext';
import { Plus, X, AlertTriangle } from 'lucide-react';

export default function MedicineForm() {
  const { addMedicine } = usePharmacy();
  const [isOpen, setIsOpen] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [batch, setBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPriceBDT, setUnitPriceBDT] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpen = () => {
    setIsOpen(true);
    setErrors({});
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setCompany('');
    setBatch('');
    setQuantity('');
    setUnitPriceBDT('');
    setExpiryDate('');
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Medicine name is required';
    if (!company.trim()) newErrors.company = 'Company name is required';
    if (!batch.trim()) newErrors.batch = 'Batch number is required';

    const qtyNum = parseInt(quantity, 10);
    if (!quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(qtyNum) || qtyNum <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    const priceNum = parseFloat(unitPriceBDT);
    if (!unitPriceBDT) {
      newErrors.unitPriceBDT = 'Unit price is required';
    } else if (isNaN(priceNum) || priceNum < 0) {
      newErrors.unitPriceBDT = 'Unit price must be 0 or greater';
    }

    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      unit_price_bdt: parseFloat(unitPriceBDT).toFixed(2),
      expiryDate,
      expiry: expiryDate,
    });

    handleClose();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
      >
        <Plus className="h-4.5 w-4.5" />
        <span>Add Medicine</span>
      </button>

      {/* Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          {/* Modal Container */}
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Medicine</h3>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Medicine Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Napa Extend"
                  className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name}</p>}
              </div>

              {/* Company & Batch Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Beximco"
                    className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.company ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.company && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. NP-2401"
                    className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.batch ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.batch && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">{errors.batch}</p>
                  )}
                </div>
              </div>

              {/* Qty & Unit Price Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="e.g. 150"
                    className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.quantity ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.quantity && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">{errors.quantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Unit Price (BDT) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={unitPriceBDT}
                    onChange={(e) => setUnitPriceBDT(e.target.value)}
                    placeholder="e.g. 2.20"
                    className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      errors.unitPriceBDT ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                  {errors.unitPriceBDT && (
                    <p className="text-rose-500 text-xs mt-1 font-medium">{errors.unitPriceBDT}</p>
                  )}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={`block w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                    errors.expiryDate ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {errors.expiryDate && (
                  <p className="text-rose-500 text-xs mt-1 font-medium">{errors.expiryDate}</p>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
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

'use client';

import React from 'react';
import { Medicine } from '@/types/medicine';
import { Printer, CheckCircle2, X, Download } from 'lucide-react';

export interface SaleInvoice {
  id: string;
  dateStr: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: string;
  items: {
    medicine: Medicine;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
  subtotal: number;
  discount: number;
  grandTotal: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: SaleInvoice | null;
  pharmacyName?: string;
}

export default function InvoiceModal({
  isOpen,
  onClose,
  invoice,
  pharmacyName = 'MediShelf Pharmacy',
}: InvoiceModalProps) {
  if (!isOpen || !invoice) return null;

  const formatBDT = (val: number) => `৳ ${val.toFixed(2)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Container */}
      <div className="bg-white border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:h-auto print:rounded-none">
        
        {/* Modal Top Controls (Hidden on Print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-bg print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-serif font-bold text-lg text-fg">Sale Completed Successfully</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-muted hover:text-fg hover:bg-border/60 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 print:p-0 print:overflow-visible text-slate-800 font-sans" id="printable-invoice">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h1 className="font-serif font-bold text-2xl text-slate-900 leading-tight">
                {pharmacyName}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Licensed Pharmaceutical Retailer</p>
              <p className="text-xs text-slate-500">Authorized Sales Receipt</p>
            </div>
            <div className="sm:text-right font-mono text-xs text-slate-600">
              <div className="font-bold text-sm text-slate-900">INVOICE #{invoice.id}</div>
              <div className="text-slate-500 mt-1">Date: {invoice.dateStr}</div>
              <div className="text-slate-500">Payment: <span className="capitalize font-semibold">{invoice.paymentMethod}</span></div>
            </div>
          </div>

          {/* Customer Info (if provided) */}
          {(invoice.customerName || invoice.customerPhone) && (
            <div className="bg-slate-50 p-4 rounded-xl text-xs space-y-1 border border-slate-100">
              <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px] block mb-1">
                Customer Details
              </span>
              {invoice.customerName && (
                <div><span className="text-slate-500">Name:</span> <strong>{invoice.customerName}</strong></div>
              )}
              {invoice.customerPhone && (
                <div><span className="text-slate-500">Contact:</span> <span className="font-mono">{invoice.customerPhone}</span></div>
              )}
            </div>
          )}

          {/* Itemized Table */}
          <div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 px-2 pl-0">#</th>
                  <th className="py-2.5 px-2">Item Description</th>
                  <th className="py-2.5 px-2">Batch</th>
                  <th className="py-2.5 px-2 text-right">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Price</th>
                  <th className="py-2.5 px-2 text-right pr-0">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.medicine.id}>
                    <td className="py-3 px-2 pl-0 font-mono text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900">{item.medicine.name}</div>
                      <div className="text-[10px] text-slate-500">{item.medicine.company}</div>
                    </td>
                    <td className="py-3 px-2 font-mono text-slate-500">{item.medicine.batch}</td>
                    <td className="py-3 px-2 text-right font-mono font-semibold text-slate-900">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-600">{formatBDT(item.unitPrice)}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-slate-900 pr-0">{formatBDT(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono">{formatBDT(invoice.subtotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span className="font-mono">- {formatBDT(invoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-300 font-bold text-sm text-slate-900">
                <span>Grand Total</span>
                <span className="font-mono text-base text-emerald-800">{formatBDT(invoice.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-6 border-t border-dashed border-slate-200 text-center text-[11px] text-slate-400 space-y-1">
            <p className="font-medium text-slate-600">Thank you for choosing {pharmacyName}!</p>
            <p>Please retain this receipt for warranty and medical record verification.</p>
          </div>

        </div>

        {/* Modal Bottom Actions (Hidden on Print) */}
        <div className="p-4 md:p-6 border-t border-border bg-bg flex flex-col sm:flex-row gap-3 justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-border text-xs font-medium text-muted hover:text-fg hover:bg-border/60 transition-all cursor-pointer"
          >
            Close / New Sale
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-primary hover:bg-fg text-white text-xs font-medium shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>

      </div>
    </div>
  );
}

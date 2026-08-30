'use client';

import React from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in zoom-in duration-200">
      <div className="clay-card max-w-sm w-full p-6 flex flex-col gap-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
              isDanger ? 'bg-expired-bg border-expired-border text-expired' : 'bg-safe-bg border-safe-border text-safe'
            }`}
          >
            {isDanger ? <AlertTriangle className="h-5 w-5" strokeWidth={1.5} /> : <AlertCircle className="h-5 w-5" strokeWidth={1.5} />}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-lg font-serif font-bold text-fg leading-tight">
              {title}
            </h3>
            <p className="text-xs text-muted mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-border text-muted font-medium text-xs rounded-full hover:text-fg hover:bg-bg transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 font-medium text-xs rounded-full shadow-sm transition-colors cursor-pointer ${
              isDanger
                ? 'bg-expired text-white hover:opacity-90'
                : 'bg-primary text-white hover:opacity-90'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

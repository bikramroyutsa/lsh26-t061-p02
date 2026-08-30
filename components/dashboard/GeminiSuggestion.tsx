'use client';

import React, { useEffect, useState } from 'react';
import { Medicine } from '@/types/medicine';
import { getHighestValueAtRisk } from '@/lib/calculations';
import { Sparkles, Loader2 } from 'lucide-react';
import { getActionSuggestion } from '@/app/actions/suggestAction';

interface GeminiSuggestionProps {
  medicines: Medicine[];
}

export default function GeminiSuggestion({ medicines }: GeminiSuggestionProps) {
  const highestRisks = getHighestValueAtRisk(medicines, 5);
  const expiredRisks = highestRisks.filter(item => item.category === 'expired');
  const atRiskRisks = highestRisks.filter(item => item.category === 'expiring30');

  const [suggestion, setSuggestion] = useState<string>('');
  const [loadingSuggestion, setLoadingSuggestion] = useState<boolean>(false);

  useEffect(() => {
    async function fetchSuggestion() {
      if (highestRisks.length === 0) {
        setSuggestion('');
        return;
      }
      setLoadingSuggestion(true);
      try {
        const res = await getActionSuggestion(expiredRisks, atRiskRisks);
        setSuggestion(res || 'No recommendation available at this time.');
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSuggestion(false);
      }
    }
    
    const timeout = setTimeout(() => {
      fetchSuggestion();
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [medicines]);

  if (highestRisks.length === 0) return null;

  return (
    <div className="mt-6 bg-gradient-to-r from-bg to-white border border-border rounded-[24px] p-6 shadow-[0_8px_30px_rgba(6,78,59,0.04)] hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4 items-start">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm text-indigo-500">
            <Sparkles className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-fg font-serif">AI Recommendation</h4>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[9px] font-bold tracking-widest uppercase">Gemini</span>
          </div>
        </div>
        <div className="w-full">
          {loadingSuggestion ? (
            <div className="flex items-center gap-2 text-muted text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing inventory risk...</span>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              {suggestion || "No recommendation available."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

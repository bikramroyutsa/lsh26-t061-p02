import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import InventoryContent from '@/components/inventory/InventoryContent';

function InventoryFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
      <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={1.5} />
      <span className="font-sans text-sm text-muted">Loading stock list…</span>
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<InventoryFallback />}>
      <InventoryContent />
    </Suspense>
  );
}

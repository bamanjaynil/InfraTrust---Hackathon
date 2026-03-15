import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 shadow-[0_12px_30px_rgba(244,63,94,0.08)]">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
      <p>{message}</p>
    </div>
  );
}

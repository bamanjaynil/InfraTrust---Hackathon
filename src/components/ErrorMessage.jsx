import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function ErrorMessage({ message }) {
  if (!message) return null;
  
  return (
    <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <p>{message}</p>
    </div>
  );
}

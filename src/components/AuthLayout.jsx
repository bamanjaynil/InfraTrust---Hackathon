import React from 'react';
import { Shield } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 font-sans text-zinc-100">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 mb-6 shadow-2xl">
            <Shield className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">InfraTrust</h1>
          <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">
            {subtitle || 'Infrastructure Command & Verification'}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="text-2xl font-semibold mb-6 text-center">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
}

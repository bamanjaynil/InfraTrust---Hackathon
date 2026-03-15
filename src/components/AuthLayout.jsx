import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 text-slate-100 sm:px-6">
      <div className="aurora-spot left-[-10%] top-[10%] h-72 w-72 bg-teal-400/25" />
      <div className="aurora-spot right-[-8%] top-[18%] h-64 w-64 bg-sky-400/20" />
      <div className="aurora-spot bottom-[-8%] left-[30%] h-72 w-72 bg-cyan-300/12" />

      <div className="relative grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-10 shadow-[0_30px_80px_rgba(2,6,23,0.42)] backdrop-blur-xl lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-teal-100">
              <Sparkles className="h-4 w-4" />
              Public Infrastructure Intelligence
            </div>
            <h1 className="mt-8 max-w-lg text-5xl font-semibold leading-[1.02] text-white">
              Infrastructure oversight designed to feel trustworthy at first glance.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">
              Track projects, verify deliveries, and surface civic issues through a calmer, more transparent interface built for real operational use.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['Verified project timelines', 'See the current state of work with faster visual scanning.'],
              ['Delivery transparency', 'Monitor movements, trust signals, and audit trails in one flow.'],
            ].map(([heading, copy]) => (
              <div key={heading} className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5">
                <p className="text-sm font-semibold text-white">{heading}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel relative mx-auto w-full max-w-xl overflow-hidden rounded-[2rem] p-6 shadow-[0_30px_90px_rgba(2,6,23,0.52)] sm:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
          <div className="mb-8 text-center">
            <div className="floating-orb mx-auto mb-5 flex h-18 w-18 items-center justify-center rounded-[1.75rem] border border-white/12 bg-gradient-to-br from-white/14 to-white/5 shadow-[0_20px_50px_rgba(45,212,191,0.18)]">
              <Shield className="h-9 w-9 text-teal-200" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">InfraTrust</h1>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              {subtitle || 'Infrastructure Command & Verification'}
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/8 bg-slate-950/35 p-5 sm:p-6">
            <h2 className="mb-6 text-center text-2xl font-semibold text-slate-50">{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

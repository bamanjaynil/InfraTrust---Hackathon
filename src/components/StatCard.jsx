import React from 'react';
import { clsx } from 'clsx';

const tones = {
  emerald: 'from-emerald-400/25 via-teal-400/12 to-transparent text-emerald-200',
  blue: 'from-sky-400/25 via-blue-400/12 to-transparent text-sky-200',
  purple: 'from-indigo-400/25 via-violet-400/12 to-transparent text-indigo-200',
  amber: 'from-amber-300/25 via-orange-400/10 to-transparent text-amber-100',
  red: 'from-rose-400/25 via-rose-500/10 to-transparent text-rose-200',
};

const StatCard = ({ title, value, icon: Icon, color = 'emerald' }) => {
  return (
    <div className="glass-panel surface-hover relative overflow-hidden rounded-[1.5rem] p-6">
      <div className={clsx('absolute inset-x-0 top-0 h-24 bg-gradient-to-br', tones[color])} />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-50">{value}</p>
        </div>
        <div className="soft-ring rounded-2xl border border-white/10 bg-white/6 p-3 text-slate-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="relative mt-5 h-px bg-gradient-to-r from-white/0 via-white/12 to-white/0" />
    </div>
  );
};

export default StatCard;

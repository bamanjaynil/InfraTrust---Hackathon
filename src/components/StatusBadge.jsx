import React from 'react';
import { clsx } from 'clsx';

const styles = {
  positive: 'border-emerald-400/22 bg-emerald-400/12 text-emerald-200',
  info: 'border-sky-400/22 bg-sky-400/12 text-sky-200',
  warning: 'border-amber-400/22 bg-amber-400/12 text-amber-200',
  danger: 'border-rose-400/22 bg-rose-400/12 text-rose-200',
  neutral: 'border-white/12 bg-white/6 text-slate-300',
};

const mapStatusTone = (status) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'DISPATCHED':
    case 'RESOLVED':
      return 'positive';
    case 'COMPLETED':
    case 'DELIVERED':
    case 'IN_PROGRESS':
    case 'IN_TRANSIT':
      return 'info';
    case 'FAILED':
    case 'CANCELLED':
    case 'DELAYED':
      return 'danger';
    case 'OPEN':
    case 'PENDING':
    case 'PLANNED':
    case 'ONGOING':
      return 'warning';
    default:
      return 'neutral';
  }
};

const StatusBadge = ({ status, className }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]',
        styles[mapStatusTone(status)],
        className
      )}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

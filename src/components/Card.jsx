import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, title, subtitle, footer, noPadding = false }) => {
  return (
    <div
      className={twMerge(
        clsx(
          'glass-panel surface-hover relative overflow-hidden rounded-[1.75rem]',
          className
        )
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {(title || subtitle) && (
        <div className="border-b border-white/8 px-6 py-5 sm:px-7">
          {title && <h3 className="text-lg font-semibold text-slate-50">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        </div>
      )}
      <div className={clsx('relative flex-1', !noPadding && 'p-6 sm:p-7')}>{children}</div>
      {footer && <div className="border-t border-white/8 bg-white/[0.03] px-6 py-4 sm:px-7">{footer}</div>}
    </div>
  );
};

export default Card;

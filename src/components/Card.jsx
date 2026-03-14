import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Card = ({ children, className, title, subtitle, footer, noPadding = false }) => {
  return (
    <div className={twMerge(
      clsx(
        'bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col',
        className
      )
    )}>
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-zinc-800">
          {title && <h3 className="text-zinc-100 font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className={clsx('flex-1', !noPadding && 'p-6')}>
        {children}
      </div>
      {footer && (
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

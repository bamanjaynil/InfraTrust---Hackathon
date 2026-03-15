import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const InputField = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => {
  return (
    <div className={clsx('space-y-2', className)}>
      {label && <label className="block text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'block min-h-12 w-full rounded-xl border bg-slate-950/55 px-4 py-3 text-sm text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] outline-none transition duration-200 placeholder:text-slate-500 focus:border-teal-300/45 focus:bg-slate-950/72 focus:ring-4 focus:ring-teal-400/10',
            Icon && 'pl-11',
            error ? 'border-rose-400/45 focus:border-rose-400/55 focus:ring-rose-400/10' : 'border-white/10'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;

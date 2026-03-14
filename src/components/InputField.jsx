import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const InputField = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => {
  return (
    <div className={clsx('space-y-1', className)}>
      {label && (
        <label className="block text-sm font-medium text-zinc-400">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            'block w-full rounded-lg border bg-zinc-900 px-3 py-2 text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm transition-colors',
            Icon && 'pl-10',
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-zinc-800'
          )}
          {...props}
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
});

InputField.displayName = 'InputField';
export default InputField;

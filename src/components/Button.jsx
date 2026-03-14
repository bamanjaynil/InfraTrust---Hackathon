import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Loader from './Loader';

const Button = forwardRef(({ children, isLoading, className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={isLoading || props.disabled}
      className={twMerge(
        clsx(
          'flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed',
          className
        )
      )}
      {...props}
    >
      {isLoading ? <Loader className="w-5 h-5 mr-2" /> : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;

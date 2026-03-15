import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Loader from './Loader';

const variants = {
  primary:
    'border border-teal-400/30 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-500 text-slate-950 shadow-[0_18px_35px_rgba(45,212,191,0.28)] hover:brightness-110 focus-visible:ring-teal-300/50',
  secondary:
    'border border-white/10 bg-white/6 text-slate-100 hover:bg-white/10 focus-visible:ring-slate-400/30',
  outline:
    'border border-white/12 bg-slate-950/20 text-slate-100 hover:border-teal-300/30 hover:bg-teal-400/8 focus-visible:ring-teal-300/30',
  ghost:
    'border border-transparent bg-transparent text-slate-300 hover:bg-white/6 hover:text-white focus-visible:ring-slate-400/20',
  danger:
    'border border-rose-400/20 bg-rose-500/12 text-rose-100 hover:bg-rose-500/18 focus-visible:ring-rose-300/30',
};

const sizes = {
  sm: 'min-h-10 px-3.5 text-sm',
  md: 'min-h-11 px-4 text-sm',
  lg: 'min-h-12 px-5 text-sm',
};

const Button = forwardRef(
  (
    {
      children,
      isLoading,
      loading,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = true,
      ...props
    },
    ref
  ) => {
    const resolvedLoading = isLoading ?? loading;
    return (
      <button
        ref={ref}
        disabled={resolvedLoading || props.disabled}
        className={twMerge(
          clsx(
            'group inline-flex items-center justify-center gap-2 rounded-xl font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50',
            fullWidth ? 'w-full' : 'w-auto',
            variants[variant],
            sizes[size],
            'surface-hover',
            className
          )
        )}
        {...props}
      >
        {resolvedLoading ? <Loader className="h-4 w-4" /> : null}
        <span className="truncate">{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

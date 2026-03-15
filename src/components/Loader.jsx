import React from 'react';
import { clsx } from 'clsx';

export default function Loader({ className }) {
  return (
    <svg
      className={clsx('animate-spin text-current', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2a10 10 0 0 1 9.7 7.58h-3.17A7 7 0 0 0 12 5z"
      />
    </svg>
  );
}

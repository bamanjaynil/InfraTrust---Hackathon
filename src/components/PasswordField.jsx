import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import InputField from './InputField';

const PasswordField = forwardRef(({ label, className, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={className}>
      <div className="relative">
        <InputField
          ref={ref}
          label={label}
          type={showPassword ? 'text' : 'password'}
          icon={Lock}
          className="space-y-2"
          {...props}
        />
        <button
          type="button"
          className="absolute right-0 top-[2.55rem] flex h-12 items-center pr-4 text-slate-500 transition-colors hover:text-slate-200"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
    </div>
  );
});

PasswordField.displayName = 'PasswordField';
export default PasswordField;

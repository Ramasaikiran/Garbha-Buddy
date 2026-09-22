'use client';

import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/icons';

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        required={required}
        type={visible ? 'text' : 'password'}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="field-input"
        style={{ paddingRight: '2.5rem' }}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--ink-40)' }}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

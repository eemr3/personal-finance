import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Input({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}: InputProps) {
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`flex flex-col gap-2 ${widthStyle}`}>
      {label && <label className="text-sm text-foreground">{label}</label>}
      <input
        className={`px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all ${widthStyle} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function TextArea({
  label,
  error,
  fullWidth = true,
  className = '',
  ...props
}: TextAreaProps) {
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`flex flex-col gap-2 ${widthStyle}`}>
      {label && <label className="text-sm text-foreground">{label}</label>}
      <textarea
        className={`px-4 py-3 bg-input-background text-foreground placeholder:text-muted-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all min-h-[100px] resize-y ${widthStyle} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  error,
  fullWidth = true,
  options,
  className = '',
  ...props
}: SelectProps) {
  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <div className={`flex flex-col gap-2 ${widthStyle}`}>
      {label && <label className="text-sm text-foreground">{label}</label>}
      <select
        className={`px-4 py-3 bg-input-background text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all appearance-none ${widthStyle} ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
}

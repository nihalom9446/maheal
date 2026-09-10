import React from 'react';
import Link from 'next/link';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  icon,
  iconPosition = 'left',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: 'px-3.5 py-1.5 text-xs rounded-lg min-h-[36px]',
    md: 'px-5 py-2.5 text-xs md:text-sm rounded-xl min-h-[44px]',
    lg: 'px-6 py-3.5 text-sm md:text-base rounded-xl min-h-[48px]',
  };

  const variantClasses = {
    primary:
      'bg-[#063F35] text-white hover:bg-[#022C27] active:bg-[#022C27] shadow-fine border border-[#063F35]',
    secondary:
      'bg-white text-[#063F35] hover:bg-stone-50 active:bg-stone-100 border border-stone-200 shadow-fine hover:border-stone-300',
    accent:
      'bg-[#C9A646] text-[#022C27] hover:bg-[#B38F34] active:bg-[#9E7E2C] shadow-fine font-bold',
    ghost:
      'bg-transparent text-[#063F35] hover:bg-[#063F35]/5 active:bg-[#063F35]/10',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 active:bg-rose-900 shadow-fine',
  };

  const combinedClass = `inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  const content = (
    <>
      {loading && (
        <svg className="animate-spin w-4 h-4 mr-1 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClass}>
        {content}
      </Link>
    );
  }

  return (
    <button className={combinedClass} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}

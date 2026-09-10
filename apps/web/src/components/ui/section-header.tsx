import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  titleMl?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  titleMl,
  description,
  actionText,
  actionHref,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-stone-200/80 mb-6 sm:mb-8 ${className}`}>
      <div className="space-y-1.5 max-w-2xl">
        {eyebrow && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0A5C4D]">
            {eyebrow}
          </span>
        )}
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#063F35] tracking-tight">
            {title}
          </h2>
        </div>
        {description && (
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pt-0.5">
            {description}
          </p>
        )}
      </div>

      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#063F35] hover:text-[#0A5C4D] transition underline underline-offset-4 decoration-[#063F35]/30 hover:decoration-[#063F35] shrink-0"
        >
          <span>{actionText}</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </div>
  );
}

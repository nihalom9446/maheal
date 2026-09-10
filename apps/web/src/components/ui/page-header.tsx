import React from 'react';
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  badge?: string;
  title: string;
  titleMl?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({
  badge,
  title,
  titleMl,
  description,
  breadcrumbs,
  actions,
}: PageHeaderProps) {
  return (
    <div className="py-8 md:py-12 border-b border-stone-200/80 mb-8 md:mb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <Link href="/" className="hover:text-[#063F35] transition">
              Home
            </Link>
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                <span>/</span>
                {bc.href ? (
                  <Link href={bc.href} className="hover:text-[#063F35] transition">
                    {bc.label}
                  </Link>
                ) : (
                  <span className="text-[#102522] font-semibold">{bc.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            {badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#063F35]/10 text-[#063F35] text-xs font-semibold tracking-wide">
                <span>{badge}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black text-[#063F35] tracking-tight leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-sm md:text-base text-stone-600 leading-relaxed max-w-2xl pt-1">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

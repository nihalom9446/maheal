import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  titleMl?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = (
    <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  title,
  titleMl,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="text-center py-12 sm:py-16 px-4 bg-white rounded-2xl border border-stone-200/80 shadow-fine space-y-3.5 max-w-md mx-auto my-6">
      <div className="w-12 h-12 mx-auto rounded-full bg-stone-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-bold text-[#102522]">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {(actionLabel && (actionHref || onAction)) && (
        <div className="pt-2">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#063F35] text-white text-xs font-semibold hover:bg-[#022C27] transition"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#063F35] text-white text-xs font-semibold hover:bg-[#022C27] transition"
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React from 'react';

interface SkeletonProps {
  className?: string;
  count?: number;
}

export function Skeleton({ className = 'h-4 w-full', count = 1 }: SkeletonProps) {
  if (count > 1) {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className={`bg-stone-200/70 animate-pulse rounded-lg ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-stone-200/70 animate-pulse rounded-lg ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-fine space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" count={2} />
      <div className="pt-3 border-t border-stone-100 flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}

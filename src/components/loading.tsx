"use client";

export function Loading() {
  return (
    <div className="agora-loading animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--agora-bg-tertiary)]" />
        <div className="flex-1">
          <div className="h-4 w-32 rounded bg-[var(--agora-bg-tertiary)] mb-2" />
          <div className="h-3 w-20 rounded bg-[var(--agora-bg-tertiary)]" />
        </div>
      </div>
      {/* Body skeleton */}
      <div className="ml-[52px] space-y-3">
        <div className="h-3 w-full rounded bg-[var(--agora-bg-tertiary)]" />
        <div className="h-3 w-3/4 rounded bg-[var(--agora-bg-tertiary)]" />
        <div className="h-3 w-1/2 rounded bg-[var(--agora-bg-tertiary)]" />
      </div>
      {/* Second comment skeleton */}
      <div className="flex items-center gap-3 mt-8 mb-6">
        <div className="w-10 h-10 rounded-full bg-[var(--agora-bg-tertiary)]" />
        <div className="flex-1">
          <div className="h-4 w-24 rounded bg-[var(--agora-bg-tertiary)] mb-2" />
          <div className="h-3 w-16 rounded bg-[var(--agora-bg-tertiary)]" />
        </div>
      </div>
      <div className="ml-[52px] space-y-3">
        <div className="h-3 w-full rounded bg-[var(--agora-bg-tertiary)]" />
        <div className="h-3 w-2/3 rounded bg-[var(--agora-bg-tertiary)]" />
      </div>
    </div>
  );
}

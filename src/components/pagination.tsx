"use client";

interface PaginationProps {
  numHidden: number;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function Pagination({
  numHidden,
  hasMore,
  isLoading,
  onLoadMore,
}: PaginationProps) {
  if (!hasMore && numHidden <= 0) return null;

  return (
    <div className="py-3 text-center">
      <button
        onClick={onLoadMore}
        disabled={isLoading}
        className="text-sm text-[var(--agora-text-link)] hover:underline disabled:opacity-50"
      >
        {isLoading
          ? "Loading..."
          : numHidden > 0
            ? `Load ${numHidden} more comment${numHidden === 1 ? "" : "s"}...`
            : "Load more comments..."}
      </button>
    </div>
  );
}

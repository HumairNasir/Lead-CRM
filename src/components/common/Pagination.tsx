"use client";

import React, { useTransition, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages?: number;
  totalItems: number;
  pageSize?: number;
  className?: string;
}

function PaginationContent({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 15,
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const effectiveTotalPages = Math.max(
    1,
    totalPages !== undefined ? totalPages : Math.ceil(totalItems / pageSize)
  );

  if (totalItems <= 0) {
    return null;
  }

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > effectiveTotalPages || newPage === currentPage) {
      return;
    }
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (effectiveTotalPages <= 7) {
      for (let i = 1; i <= effectiveTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", effectiveTotalPages);
      } else if (currentPage >= effectiveTotalPages - 3) {
        pages.push(
          1,
          "...",
          effectiveTotalPages - 4,
          effectiveTotalPages - 3,
          effectiveTotalPages - 2,
          effectiveTotalPages - 1,
          effectiveTotalPages
        );
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", effectiveTotalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}
    >
      <div className="text-xs text-zinc-400">
        Showing <span className="font-semibold text-zinc-200">{startItem}</span> to{" "}
        <span className="font-semibold text-zinc-200">{endItem}</span> of{" "}
        <span className="font-semibold text-zinc-200">{totalItems.toLocaleString()}</span> entries
      </div>

      {effectiveTotalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {/* Page Indicators */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) => {
              if (page === "...") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-2 py-1 text-xs text-zinc-600 font-medium"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = page as number;
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={isPending}
                  className={`min-w-8 h-8 px-2 flex items-center justify-center text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 font-bold shadow-xs shadow-amber-500/20"
                      : "text-zinc-400 hover:text-zinc-100 bg-zinc-900/60 border border-zinc-800 hover:bg-zinc-800"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= effectiveTotalPages || isPending}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-zinc-300 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export function Pagination(props: PaginationProps) {
  return (
    <Suspense fallback={null}>
      <PaginationContent {...props} />
    </Suspense>
  );
}

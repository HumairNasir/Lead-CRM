"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQ = searchParams?.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(currentQ);

  // Sync internal state if URL search param changes externally (e.g. navigation / reset)
  useEffect(() => {
    setSearchTerm(currentQ);
  }, [currentQ]);

  // Debounced update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchTerm.trim();
      const currentParam = searchParams?.get("q") || "";

      if (trimmed === currentParam) {
        return;
      }

      const params = new URLSearchParams(searchParams?.toString() || "");

      if (trimmed) {
        params.set("q", trimmed);
        params.set("page", "1");
      } else {
        params.delete("q");
        // Keep page=1 or reset cleanly
        params.set("page", "1");
      }

      const queryString = params.toString();
      startTransition(() => {
        router.push(queryString ? `${pathname}?${queryString}` : pathname);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]);

  const handleClear = () => {
    setSearchTerm("");
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("q");
    params.set("page", "1");
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    });
  };

  return (
    <div className={`relative flex items-center w-full max-w-md ${className}`}>
      <div className="absolute left-3.5 pointer-events-none text-zinc-500">
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
        ) : (
          <Search className="w-4 h-4 text-zinc-400" />
        )}
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2 text-sm bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-hidden focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-colors shadow-xs"
      />

      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

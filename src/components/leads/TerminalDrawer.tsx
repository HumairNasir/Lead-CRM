"use client";

import React, { useState } from "react";
import { Terminal, Filter, MoreHorizontal, ChevronUp, ChevronDown, CheckCircle2 } from "lucide-react";

interface TerminalDrawerProps {
  logs: string[];
  isSyncing?: boolean;
}

export function TerminalDrawer({ logs, isSyncing = false }: TerminalDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="w-full bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-semibold text-zinc-200 tracking-wide">
            Terminal / Status
          </span>
          {isSyncing && (
            <span className="flex items-center gap-1.5 text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Sync In Progress...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            aria-label="Filter logs"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            aria-label="More options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
            aria-label={isExpanded ? "Collapse terminal" : "Expand terminal"}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {isExpanded && (
        <div className="p-4 font-mono text-xs text-zinc-400 max-h-40 overflow-y-auto space-y-1 bg-zinc-950/95 leading-relaxed selection:bg-amber-500/20">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-zinc-600 select-none">›</span>
              <span className="text-zinc-300">{log}</span>
            </div>
          ))}
          {isSyncing && (
            <div className="flex items-center gap-2 text-amber-400 pt-1">
              <span className="animate-spin inline-block">⠋</span>
              <span>Running Apify actor scraping pipeline and extracting metadata...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

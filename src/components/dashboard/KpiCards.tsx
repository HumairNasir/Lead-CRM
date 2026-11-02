"use client";

import React, { useState } from "react";
import { Users, Copy, Percent, DollarSign, MoreVertical } from "lucide-react";
import { KpiCardData } from "@/lib/types/database";

interface KpiCardsProps {
  kpis: KpiCardData[];
}

export function KpiCards({ kpis }: KpiCardsProps) {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const getIcon = (type: KpiCardData["type"]) => {
    switch (type) {
      case "leads":
        return <Users className="w-5 h-5 text-amber-950 stroke-[2.5]" />;
      case "projects":
        return <Copy className="w-5 h-5 text-amber-950 stroke-[2.5]" />;
      case "conversion":
        return <Percent className="w-5 h-5 text-amber-950 stroke-[2.5]" />;
      case "revenue":
        return <DollarSign className="w-5 h-5 text-amber-950 stroke-[2.5]" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40 group"
        >
          {/* Top Row: Icon & Action */}
          <div className="flex items-center justify-between mb-5">
            <div className="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              {getIcon(kpi.type)}
            </div>

            {/* Card Action Menu */}
            <div className="relative">
              <button
                onClick={() =>
                  setActiveMenuId(activeMenuId === kpi.id ? null : kpi.id)
                }
                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {activeMenuId === kpi.id && (
                <div
                  onMouseLeave={() => setActiveMenuId(null)}
                  className="absolute right-0 mt-1 w-36 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 text-xs text-zinc-300 animate-in fade-in zoom-in-95"
                >
                  <button
                    onClick={() => setActiveMenuId(null)}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setActiveMenuId(null)}
                    className="w-full text-left px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    Export KPI
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Metric Details */}
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-medium text-zinc-400">
              {kpi.title}
            </p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
                {kpi.value}
              </h3>
              {kpi.change && (
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {kpi.change}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

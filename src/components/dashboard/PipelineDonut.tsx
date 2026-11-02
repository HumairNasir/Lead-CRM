"use client";

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { PipelineStatusSegment } from "@/lib/types/database";

interface PipelineDonutProps {
  segments: PipelineStatusSegment[];
}

export function PipelineDonut({ segments }: PipelineDonutProps) {
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // SVG parameters
  const size = 260;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets for SVG strokeDasharray & strokeDashoffset
  let cumulativePercent = 0;
  const arcs = segments.map((seg) => {
    const strokeDasharray = `${(seg.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercent / 100) * circumference);
    cumulativePercent += seg.percentage;
    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            Pipeline Status
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Stage distribution of currently active leads
          </p>
        </div>

        <button
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="More pipeline options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Donut Chart with Surrounding Labels */}
      <div className="relative flex items-center justify-center py-2">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#27272a"
            strokeWidth={strokeWidth}
          />
          {arcs.map((arc) => {
            const isHovered = hoveredSegment === arc.id;
            return (
              <circle
                key={arc.id}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={arc.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={arc.strokeDasharray}
                strokeDashoffset={arc.strokeDashoffset}
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredSegment(arc.id)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>

        {/* Outer Visual Label Callouts matching Screenshot #1 */}
        <div className="absolute top-2 left-0 text-[11px] leading-tight text-zinc-400">
          <p className="font-semibold text-zinc-200">Leads Scraped</p>
          <p className="text-amber-500 font-bold">35%</p>
        </div>
        <div className="absolute top-2 right-0 text-right text-[11px] leading-tight text-zinc-400">
          <p className="font-semibold text-zinc-200">Mockup Built</p>
          <p className="text-amber-400 font-bold">26%</p>
        </div>
        <div className="absolute bottom-2 left-0 text-[11px] leading-tight text-zinc-400">
          <p className="font-semibold text-zinc-200">Mockup Built</p>
          <p className="text-amber-600 font-bold">22%</p>
        </div>
        <div className="absolute bottom-2 right-0 text-right text-[11px] leading-tight text-zinc-400">
          <p className="font-semibold text-zinc-200">Pitch Sent</p>
          <p className="text-amber-300 font-bold">28%</p>
        </div>

        {/* Center Donut Hole content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-zinc-100 tracking-tight">
            100%
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
            Pipeline
          </span>
        </div>
      </div>

      {/* Legend Footer matching Screenshot #1 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-2 border-t border-zinc-800/80">
        {segments.map((seg) => (
          <div
            key={seg.id}
            onMouseEnter={() => setHoveredSegment(seg.id)}
            onMouseLeave={() => setHoveredSegment(null)}
            className="flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <span
              className="w-2.5 h-2.5 rounded-xs shrink-0 transition-transform"
              style={{
                backgroundColor: seg.color,
                transform: hoveredSegment === seg.id ? "scale(1.3)" : "none",
              }}
            />
            <span className="text-zinc-300 truncate text-[11px]">
              {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { OutreachTrendPoint } from "@/lib/types/database";

interface TrendChartProps {
  dataPoints: OutreachTrendPoint[];
}

export function TrendChart({ dataPoints }: TrendChartProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  // SVG dimensions & padding
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingY = 30;

  // Compute scale coordinates
  const maxRevenue = 16000;
  const maxOutreach = 1200;

  const pointsOutreach = dataPoints.map((pt, idx) => {
    const x = paddingX + (idx / (dataPoints.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (pt.outreach / maxOutreach) * (height - paddingY * 2);
    return { x, y, ...pt };
  });

  const pointsRevenue = dataPoints.map((pt, idx) => {
    const x = paddingX + (idx / (dataPoints.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (pt.revenue / maxRevenue) * (height - paddingY * 2);
    return { x, y, ...pt };
  });

  // Create smooth bezier curve path string
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return "";
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? i : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const pathOutreach = createSmoothPath(pointsOutreach);
  const pathRevenue = createSmoothPath(pointsRevenue);

  // Closed area paths for soft glowing gradient fills
  const areaOutreach = `${pathOutreach} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;
  const areaRevenue = `${pathRevenue} L ${width - paddingX} ${height - paddingY} L ${paddingX} ${height - paddingY} Z`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            Outreach and Revenue Trend
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time monthly conversions and outreach response volume
          </p>
        </div>

        <button
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="More chart options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full h-64 sm:h-72 flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Ambient Golden Glow Filters */}
            <filter id="goldenGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f59e0b" floodOpacity="0.4" />
            </filter>
            <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#d97706" floodOpacity="0.7" />
            </filter>

            {/* Gradient Fills */}
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="outreachGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d97706" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid Lines */}
          <g className="opacity-20">
            {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
              const y = paddingY + ratio * (height - paddingY * 2);
              return (
                <line
                  key={idx}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#71717a"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
              );
            })}
            {pointsRevenue.map((pt, idx) => (
              <line
                key={idx}
                x1={pt.x}
                y1={paddingY}
                x2={pt.x}
                y2={height - paddingY}
                stroke="#71717a"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Area Fills */}
          <path d={areaRevenue} fill="url(#revenueGrad)" />
          <path d={areaOutreach} fill="url(#outreachGrad)" />

          {/* Golden Dual Glowing Wavy Lines */}
          <path
            d={pathOutreach}
            fill="none"
            stroke="#d97706"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#amberGlow)"
          />
          <path
            d={pathRevenue}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#goldenGlow)"
          />

          {/* Interactive Data Point Dots */}
          {pointsRevenue.map((pt, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === idx ? 6 : 4}
                className="fill-amber-400 stroke-zinc-950 transition-all duration-150"
                strokeWidth="2"
              />
              <circle
                cx={pointsOutreach[idx].x}
                cy={pointsOutreach[idx].y}
                r={hoveredPoint === idx ? 5 : 3.5}
                className="fill-amber-600 stroke-zinc-950 transition-all duration-150"
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && (
          <div
            className="absolute bg-zinc-950/90 backdrop-blur-md border border-amber-500/40 rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none transition-all z-20"
            style={{
              left: `${(hoveredPoint / (dataPoints.length - 1)) * 80 + 10}%`,
              top: "15%",
            }}
          >
            <div className="font-semibold text-zinc-200 border-b border-zinc-800 pb-1 mb-1">
              {dataPoints[hoveredPoint].month} Metrics
            </div>
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Revenue: ${dataPoints[hoveredPoint].revenue.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>Outreach: {dataPoints[hoveredPoint].outreach} leads</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Carousel Indicator Dots */}
      <div className="flex items-center justify-center gap-2 mt-4 pt-2">
        <button
          onClick={() => setActiveSlide(0)}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            activeSlide === 0 ? "w-7 bg-amber-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"
          }`}
          aria-label="Slide 1"
        />
        <button
          onClick={() => setActiveSlide(1)}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            activeSlide === 1 ? "w-7 bg-amber-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"
          }`}
          aria-label="Slide 2"
        />
        <button
          onClick={() => setActiveSlide(2)}
          className={`h-1.5 rounded-full transition-all duration-200 ${
            activeSlide === 2 ? "w-7 bg-amber-500" : "w-1.5 bg-zinc-700 hover:bg-zinc-600"
          }`}
          aria-label="Slide 3"
        />
      </div>
    </div>
  );
}

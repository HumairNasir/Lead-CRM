"use client";

import React, { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  render: (item: T, index: number) => ReactNode;
}

export interface TabOption {
  id: string;
  label: string;
  count?: number;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  tabs?: TabOption[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  selectedIds?: string[];
  onToggleSelectAll?: (selected: boolean) => void;
  onToggleSelectRow?: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  headerActions?: ReactNode;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  tabs,
  activeTab,
  onTabChange,
  selectedIds = [],
  onToggleSelectAll,
  onToggleSelectRow,
  isLoading = false,
  emptyMessage = "No records found.",
  headerActions,
}: DataTableProps<T>) {
  const allSelected = data.length > 0 && data.every((item) => selectedIds.includes(item.id));
  const isPartiallySelected =
    data.some((item) => selectedIds.includes(item.id)) && !allSelected;

  return (
    <div className="space-y-4">
      {/* Tabs and Optional Header Actions */}
      {(tabs || headerActions) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 overflow-x-auto pb-1">
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1.5 p-1 bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-x-auto max-w-full">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 ${
                      isActive
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-xs font-semibold"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {typeof tab.count === "number" && (
                      <span
                        className={`ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
                          isActive
                            ? "bg-amber-500/25 text-amber-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {headerActions && (
            <div className="flex items-center gap-2 shrink-0 ml-auto">
              {headerActions}
            </div>
          )}
        </div>
      )}

      {/* Main Table Container with Horizontal Scroll Preservation */}
      <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm border-collapse min-w-[760px]">
            {/* Table Head */}
            <thead className="bg-zinc-900/90 text-zinc-400 border-b border-zinc-800 text-xs uppercase tracking-wider font-semibold select-none">
              <tr>
                {/* Select All Checkbox Column */}
                {onToggleSelectAll && (
                  <th scope="col" className="w-12 px-4 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={(e) => onToggleSelectAll(e.target.checked)}
                      className="w-4 h-4 rounded-xs border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/40 accent-amber-500 cursor-pointer"
                      aria-label="Select all rows"
                    />
                  </th>
                )}

                {/* Rendered Column Headers */}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className={`px-4 py-3.5 ${col.headerClassName || ""}`}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={columns.length + (onToggleSelectAll ? 1 : 0)}
                    className="px-6 py-12 text-center text-zinc-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      <span>Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onToggleSelectAll ? 1 : 0)}
                    className="px-6 py-12 text-center text-zinc-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const isRowSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`group transition-colors duration-150 ${
                        isRowSelected
                          ? "bg-amber-500/5 hover:bg-amber-500/10"
                          : "hover:bg-zinc-850/50"
                      }`}
                    >
                      {/* Row Checkbox */}
                      {onToggleSelectRow && (
                        <td className="w-12 px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={() => onToggleSelectRow(item.id)}
                            className="w-4 h-4 rounded-xs border-zinc-700 bg-zinc-800 text-amber-500 focus:ring-amber-500/40 accent-amber-500 cursor-pointer"
                            aria-label={`Select row ${item.id}`}
                          />
                        </td>
                      )}

                      {/* Columns Content */}
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className={`px-4 py-4 align-middle ${col.cellClassName || ""}`}
                        >
                          {col.render(item, index)}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

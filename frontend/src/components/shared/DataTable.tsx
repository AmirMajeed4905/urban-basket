"use client";

import { Search, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  search?: string;
  onSearch?: (v: string) => void;
  page?: number;
  totalPages?: number;
  onPrev?: () => void;
  onNext?: () => void;
  onPage?: (p: number) => void;
  actions?: React.ReactNode;
}

function getPageNumbers(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | null)[] = [];

  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, null, total);
  } else if (current >= total - 3) {
    pages.push(1, null, total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, null, current - 1, current, current + 1, null, total);
  }

  return pages;
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading,
  search,
  onSearch,
  page = 1,
  totalPages = 1,
  onPrev,
  onNext,
  onPage,
  actions,
}: DataTableProps<T>) {
  const pageNums = getPageNumbers(page, totalPages);

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden w-full">

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      {(onSearch || actions) && (
        <div className="px-4 sm:px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

          {onSearch && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-auto sm:min-w-[220px]">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-sm outline-none text-slate-700 placeholder:text-slate-400 w-full"
              />
            </div>
          )}

          {actions && (
            <div className="flex items-center gap-2 ml-auto">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────── */}
      <div className="w-full overflow-x-auto">

        <table className="w-full min-w-[700px]">

          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 sm:px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 sm:px-5 py-3">
                      <div className="h-4 bg-slate-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-slate-400 text-sm"
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-4 sm:px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap"
                    >
                      {col.render
                        ? col.render(row)
                        : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages >= 1 && (
        <div className="px-4 sm:px-5 py-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-slate-400 hidden sm:block">
            Page <span className="font-semibold text-slate-600">{page}</span> of{" "}
            <span className="font-semibold text-slate-600">{totalPages}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1">

            <button
              onClick={onPrev}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            {pageNums.map((num, idx) =>
              num === null ? (
                <span
                  key={`gap-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-slate-400"
                >
                  <MoreHorizontal size={14} />
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => onPage?.(num)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold ${
                    num === page
                      ? "text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  style={
                    num === page
                      ? { background: "linear-gradient(135deg,#7c3aed,#5b21b6)" }
                      : {}
                  }
                >
                  {num}
                </button>
              )
            )}

            <button
              onClick={onNext}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
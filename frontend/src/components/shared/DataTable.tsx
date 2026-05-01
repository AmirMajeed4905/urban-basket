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

  if (current <= 4) return [1, 2, 3, 4, 5, null, total];
  if (current >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];

  return [1, null, current - 1, current, current + 1, null, total];
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

      {/* ── TOOLBAR ───────────────────────────── */}
      {(onSearch || actions) && (
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">

          {onSearch && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 w-full sm:w-[250px]">
              <Search size={15} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent outline-none text-sm"
              />
            </div>
          )}

          {actions && <div className="flex gap-2 ml-auto">{actions}</div>}
        </div>
      )}

      {/* ── MOBILE VIEW (CARDS) ───────────────────────────── */}
      <div className="block sm:hidden p-3 space-y-3">

        {isLoading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : data.length === 0 ? (
          <div className="text-center text-gray-400 py-6">No data found</div>
        ) : (
          data.map((row) => (
            <div key={row.id} className="border rounded-xl p-3 space-y-2">

              {columns.map((col) => (
                <div key={String(col.key)} className="flex justify-between gap-3 text-sm">

                  <span className="text-gray-500">{col.label}</span>

                  <span className="text-gray-800 text-right break-words">
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </span>

                </div>
              ))}

            </div>
          ))
        )}

      </div>

      {/* ── DESKTOP TABLE ───────────────────────────── */}
      <div className="hidden sm:block w-full overflow-x-auto">

        <table className="w-full">

          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">

              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase"
                >
                  {col.label}
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-5 py-3">
                      <div className="h-4 bg-gray-100 animate-pulse rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-400">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={row.id} className="border-t hover:bg-gray-50 transition">

                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className="px-5 py-3 text-sm text-gray-700"
                    >
                      {col.render ? col.render(row) : (row as any)[col.key]}
                    </td>
                  ))}

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* ── PAGINATION ───────────────────────────── */}
      {totalPages > 1 && (
        <div className="p-3 border-t flex flex-wrap justify-center items-center gap-2">

          <button
            onClick={onPrev}
            disabled={page <= 1}
            className="p-1.5 border rounded disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          {pageNums.map((num, idx) =>
            num === null ? (
              <MoreHorizontal key={idx} size={14} />
            ) : (
              <button
                key={num}
                onClick={() => onPage?.(num)}
                className={`px-3 py-1 rounded text-sm ${
                  num === page ? "bg-purple-600 text-white" : "border"
                }`}
              >
                {num}
              </button>
            )
          )}

          <button
            onClick={onNext}
            disabled={page >= totalPages}
            className="p-1.5 border rounded disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>

        </div>
      )}

    </div>
  );
}
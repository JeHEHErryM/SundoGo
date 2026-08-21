import { useEffect, useMemo, useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "./shared/Skeleton";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  /** Hide this field in the mobile card view */
  hideOnMobile?: boolean;
  /** Used as the card title in the mobile card view */
  primary?: boolean;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  /** Client-side pagination page size */
  pageSize?: number;
  /** Server-side pagination: data is already paged; total drives the pager */
  serverPaginated?: boolean;
  total?: number;
  page?: number;
  onPageChange?: (page: number) => void;
}

function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

export default function DataTable<T extends object>({
  columns,
  data,
  loading = false,
  onRowClick,
  emptyMessage = "No data available",
  pageSize = 10,
  serverPaginated = false,
  total,
  page = 1,
  onPageChange,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [clientPage, setClientPage] = useState(1);

  useEffect(() => {
    setClientPage(1);
  }, [data]);

  const sorted = useMemo(() => {
    if (serverPaginated || !sortKey) return data;
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey];
      const bv = (b as Record<string, unknown>)[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      const cmp = Number(av) - Number(bv);
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir, serverPaginated]);

  const totalCount = serverPaginated ? (total ?? data.length) : data.length;
  const effectivePageSize = serverPaginated ? Math.max(data.length, 1) : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / effectivePageSize));
  const currentPage = serverPaginated ? page : Math.min(clientPage, totalPages);

  const pageRows = serverPaginated
    ? sorted
    : sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const goToPage = (p: number) => {
    if (serverPaginated) onPageChange?.(p);
    else setClientPage(Math.min(Math.max(1, p), totalPages));
  };

  const mobileColumns = useMemo(
    () => columns.filter((c) => !c.hideOnMobile && !c.primary),
    [columns]
  );

  if (loading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3">
          {columns.map((c) => (
            <Skeleton key={c.key} className="h-3.5 flex-1" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="flex items-center gap-4 border-b border-slate-50 px-4 py-4 last:border-0">
            {columns.map((_, c) => (
              <Skeleton key={c} className={`h-4 flex-1 ${c === 0 ? "max-w-[180px]" : ""}`} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  const pager =
    totalCount === 0 ? null : (
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-400">
          {serverPaginated
            ? `Page ${currentPage} of ${totalPages} · ${totalCount} total`
            : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                currentPage * pageSize,
                totalCount
              )} of ${totalCount}`}
        </p>
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="press rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          {pageItems(currentPage, totalPages).map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="px-1 text-xs font-semibold text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`h-7 w-7 rounded-lg text-xs font-semibold transition-colors ${
                  p === currentPage
                    ? "bg-primary-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="press rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );

  if (rowsEmpty(pageRows)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center animate-fade-in">
        <p className="text-sm font-medium text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* ── Mobile: card list ── */}
      <div className="divide-y divide-slate-100 md:hidden">
        {pageRows.map((row, i) => {
          const primaryCol = columns.find((c) => c.primary);
          return (
            <button
              key={i}
              onClick={() => onRowClick?.(row)}
              disabled={!onRowClick}
              className={`block w-full px-4 py-3.5 text-left transition-colors ${
                onRowClick ? "active:bg-primary-50/50" : ""
              }`}
            >
              {primaryCol && (
                <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
                  <span className="truncate">
                    {primaryCol.render
                      ? primaryCol.render(row)
                      : String((row as Record<string, unknown>)[primaryCol.key] ?? "")}
                  </span>
                  {onRowClick && <ChevronRight size={16} className="shrink-0 text-slate-300" />}
                </div>
              )}
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                {mobileColumns.map((col) => (
                  <div key={col.key} className="min-w-0">
                    <dt className="text-[11px] uppercase tracking-wide text-slate-400">{col.label}</dt>
                    <dd className="truncate text-sm text-slate-700">
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </dd>
                  </div>
                ))}
              </dl>
            </button>
          );
        })}
      </div>

      {/* ── Desktop: table ── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSort(col.key)}
                  className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400 ${
                    col.sortable ? "cursor-pointer select-none hover:text-slate-600" : ""
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortable &&
                      (sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp size={13} className="text-primary-600" />
                        ) : (
                          <ChevronDown size={13} className="text-primary-600" />
                        )
                      ) : (
                        <ChevronsUpDown size={13} className="text-slate-300" />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pageRows.map((row, i) => (
              <tr
                key={i}
                className={`transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-primary-50/40" : "hover:bg-slate-50/60"
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 text-slate-700">
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pager}
    </div>
  );
}

function rowsEmpty(rows: unknown[]): boolean {
  return rows.length === 0;
}

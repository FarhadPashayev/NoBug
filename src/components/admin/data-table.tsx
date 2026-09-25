"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/field";
import { EmptyState } from "./ui/empty";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: string;
  /** cell content */
  cell: (row: T) => React.ReactNode;
  /** value used for sorting and search; omit to make the column inert */
  value?: (row: T) => string | number;
  className?: string;
  sortable?: boolean;
};

/**
 * Client-side table: search across the columns that expose `value`, sortable
 * headers, pagination. The data sets here are small (dozens of rows), so
 * filtering in the browser keeps the API surface to a plain list endpoint.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchPlaceholder = "Axtar…",
  pageSize = 10,
  toolbar,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
  empty?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q) {
      out = rows.filter((row) =>
        columns.some((c) => {
          const v = c.value?.(row);
          return v !== undefined && String(v).toLowerCase().includes(q);
        }),
      );
    }
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.value) {
        out = [...out].sort((a, b) => {
          const av = col.value!(a);
          const bv = col.value!(b);
          const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv), "az");
          return sort.dir === "asc" ? cmp : -cmp;
        });
      }
    }
    return out;
  }, [rows, columns, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = filtered.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ad-muted-fg" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label={searchPlaceholder}
          />
        </div>
        {toolbar}
      </div>

      <div className="overflow-x-auto rounded-xl border border-ad-border bg-ad-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-ad-border text-left">
              {columns.map((c) => {
                const active = sort?.key === c.key;
                const sortable = c.sortable !== false && !!c.value;
                return (
                  <th key={c.key} scope="col" className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide text-ad-muted-fg", c.className)}>
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() => setSort(active && sort.dir === "asc" ? { key: c.key, dir: "desc" } : { key: c.key, dir: "asc" })}
                        className="inline-flex items-center gap-1 transition-colors hover:text-ad-fg"
                      >
                        {c.header}
                        {active && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {slice.map((row) => (
              <tr key={row.id} className="border-b border-ad-border last:border-0 transition-colors hover:bg-ad-muted/50">
                {columns.map((c) => (
                  <td key={c.key} className={cn("px-4 py-3 align-middle text-ad-fg", c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!slice.length && (empty ?? <EmptyState title="Nəticə yoxdur" description="Axtarış şərtini dəyişin." />)}
      </div>

      {filtered.length > pageSize && (
        <div className="flex items-center justify-between gap-3 text-sm text-ad-muted-fg">
          <span>
            {current * pageSize + 1}–{Math.min(filtered.length, (current + 1) * pageSize)} / {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage(current - 1)} disabled={current === 0} aria-label="Əvvəlki səhifə">
              <ChevronLeft />
            </Button>
            <span className="tabular-nums">
              {current + 1} / {pages}
            </span>
            <Button variant="outline" size="icon" onClick={() => setPage(current + 1)} disabled={current >= pages - 1} aria-label="Növbəti səhifə">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

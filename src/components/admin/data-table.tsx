"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
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
 * TanStack Table with the panel's look: search across the columns that
 * expose `value`, sortable headers, client-side pagination. Content lists
 * are small (dozens of rows), so the whole set is loaded once and filtered
 * in the browser.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  searchPlaceholder = "Axtar…",
  pageSize = 10,
  toolbar,
  filters,
  empty,
  loading = false,
}: {
  rows: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  pageSize?: number;
  /** right side of the toolbar (primary action) */
  toolbar?: React.ReactNode;
  /** extra controls next to the search box */
  filters?: React.ReactNode;
  empty?: React.ReactNode;
  loading?: boolean;
}) {
  "use no memo"; // TanStack Table returns functions the React Compiler cannot memoize
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const defs = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((c) => ({
        id: c.key,
        header: c.header,
        accessorFn: c.value ? (row: T) => c.value!(row) : () => "",
        cell: ({ row }) => c.cell(row.original),
        enableSorting: c.sortable !== false && !!c.value,
        enableGlobalFilter: !!c.value,
        meta: { className: c.className },
      })),
    [columns],
  );

  const table = useReactTable({
    data: rows,
    columns: defs,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    autoResetPageIndex: true,
  });

  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const pageRows = table.getRowModel().rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ad-muted-fg" aria-hidden="true" />
          <Input value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder={searchPlaceholder} className="pl-9" aria-label={searchPlaceholder} />
        </div>
        {filters}
        {toolbar}
      </div>

      <div className={cn("overflow-x-auto rounded-xl border border-ad-border bg-ad-card", loading && "opacity-60")} aria-busy={loading}>
        <table className="w-full border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-ad-border text-left">
                {hg.headers.map((header) => {
                  const meta = header.column.columnDef.meta as { className?: string } | undefined;
                  const sorted = header.column.getIsSorted();
                  return (
                    <th key={header.id} scope="col" className={cn("px-4 py-3 text-xs font-medium uppercase tracking-wide text-ad-muted-fg", meta?.className)}>
                      {header.column.getCanSort() ? (
                        <button type="button" onClick={header.column.getToggleSortingHandler()} className="inline-flex items-center gap-1 transition-colors hover:text-ad-fg">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" && <ArrowUp className="size-3" />}
                          {sorted === "desc" && <ArrowDown className="size-3" />}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-ad-border last:border-0 transition-colors hover:bg-ad-muted/50">
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as { className?: string } | undefined;
                  return (
                    <td key={cell.id} className={cn("px-4 py-3 align-middle text-ad-fg", meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {!pageRows.length && (empty ?? <EmptyState title="Nəticə yoxdur" description="Axtarış şərtini dəyişin." />)}
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between gap-3 text-sm text-ad-muted-fg">
          <span>
            {pageIndex * pageSize + 1}–{Math.min(total, (pageIndex + 1) * pageSize)} / {total}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} aria-label="Əvvəlki səhifə">
              <ChevronLeft />
            </Button>
            <span className="tabular-nums">
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button variant="outline" size="icon" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} aria-label="Növbəti səhifə">
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

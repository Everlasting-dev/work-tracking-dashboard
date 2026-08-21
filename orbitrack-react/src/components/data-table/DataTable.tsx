import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  sortable?: boolean;
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  render: (row: T) => ReactNode;
}

interface DataTableColumnMeta {
  className?: string;
}

function primitiveSortValue<T>(row: T, key: string) {
  const value = (row as Record<string, unknown>)[key];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  return "";
}

export function DataTable<T extends { id: number | string }>({
  rows,
  columns,
  empty,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  empty: ReactNode;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((column) => ({
        id: column.key,
        accessorFn: (row) => column.sortValue?.(row) ?? primitiveSortValue(row, column.key),
        enableSorting: column.sortable ?? true,
        header: column.header,
        cell: ({ row }) => column.render(row.original),
        meta: { className: column.className } satisfies DataTableColumnMeta,
      })),
    [columns],
  );

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getRowId: (row) => String(row.id),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!rows.length) return <div className="min-h-40 grid place-items-center text-text-muted">{empty}</div>;

  return (
    <table className="w-full border-collapse text-[13px]">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-border">
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as DataTableColumnMeta | undefined;
              const sorted = header.column.getIsSorted();
              return (
                <th key={header.id} className={cn("h-8 px-3 text-left font-medium text-text-muted whitespace-nowrap", meta?.className)}>
                  {header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-[var(--radius-sm)] text-left transition-colors hover:text-text"
                    >
                      <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      {sorted === "asc" ? <ArrowUp size={12} /> : sorted === "desc" ? <ArrowDown size={12} /> : <ChevronsUpDown size={12} />}
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
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-border last:border-b-0 hover:bg-hover transition-colors">
            {row.getVisibleCells().map((cell) => {
              const meta = cell.column.columnDef.meta as DataTableColumnMeta | undefined;
              return (
                <td key={cell.id} className={cn("h-10 px-3 max-w-[280px]", meta?.className)}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import { supabase } from "@/lib/supabase";
import { ADMIN_TABLES, type AdminTableMeta } from "@/lib/adminTables";

export interface TableInventoryRow extends AdminTableMeta {
  id: string;
  count: number;
  status: "ok" | "blocked";
  error: string;
}

export interface DbBrowserRow {
  id: string;
  raw: Record<string, unknown>;
}

async function countTable(table: AdminTableMeta): Promise<TableInventoryRow> {
  try {
    const { count, error } = await supabase.from(table.name).select("*", { count: "exact", head: true });
    if (error) throw error;
    return { ...table, id: table.name, count: count ?? 0, status: "ok", error: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ...table, id: table.name, count: 0, status: "blocked", error: message };
  }
}

export async function fetchTableInventory(): Promise<TableInventoryRow[]> {
  return Promise.all(ADMIN_TABLES.map(countTable));
}

function rowId(row: Record<string, unknown>, index: number) {
  const candidate = row.id ?? row.project_id ?? row.user_id ?? row.name;
  return candidate == null ? `row-${index}` : String(candidate);
}

export async function fetchTableRows(tableName: string): Promise<DbBrowserRow[]> {
  const { data, error } = await supabase.from(tableName).select("*").limit(100);
  if (error) throw error;
  return ((data ?? []) as Record<string, unknown>[]).map((row, index) => ({
    id: rowId(row, index),
    raw: row,
  }));
}

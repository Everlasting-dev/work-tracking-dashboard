import Fuse from "fuse.js";
import { executiveDb } from "@/lib/localDb";

export interface LocalSearchResult {
  id: string;
  kind: "project" | "task" | "user" | "file" | "document" | "canvas";
  entityId: string;
  text: string;
}

export async function searchLocalIndex(query: string, limit = 8): Promise<LocalSearchResult[]> {
  const needle = query.trim();
  if (needle.length < 2) return [];

  const rows = await executiveDb.searchIndexes.toArray();
  const fuse = new Fuse(rows, {
    keys: ["text", "entityId", "kind"],
    threshold: 0.34,
    ignoreLocation: true,
  });

  return fuse.search(needle).slice(0, limit).map((result) => ({
    id: result.item.id,
    kind: result.item.kind,
    entityId: result.item.entityId,
    text: result.item.text,
  }));
}

import { catalogSchema } from "./catalog.schema";
import type { Catalog } from "./catalog.types";

export async function fetchCatalog(): Promise<Catalog> {
  const res = await fetch("/api/catalog");
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error.message);
  }

  return catalogSchema.parse(json.data);
}

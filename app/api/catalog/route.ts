import { NextResponse } from "next/server";
import { cantons, provinces } from "@/lib/mock-data/cr-geo";
import { vehicleMakes, vehicleModels, vehicleTrims } from "@/lib/mock-data/vehicle-catalog";
import type { Catalog } from "@/features/catalog/catalog.types";

export async function GET() {
  const data: Catalog = {
    makes: vehicleMakes.map(({ id, name }) => ({ id, name })),
    models: vehicleModels,
    trims: vehicleTrims,
    provinces,
    cantons,
  };

  return NextResponse.json({ data });
}

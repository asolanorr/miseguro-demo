"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "./catalog.api";

export function useCatalog() {
  return useQuery({
    queryKey: ["catalog"],
    queryFn: fetchCatalog,
    staleTime: Infinity,
  });
}

export function useVehicleMakes(_year?: number) {
  const { data, ...rest } = useCatalog();
  // El catálogo demo no varía por año: todas las marcas están disponibles
  // en todo el rango 2010-2026. El parámetro queda listo para cuando eso
  // deje de ser cierto.
  return { data: data?.makes, ...rest };
}

export function useVehicleModels(makeId?: string) {
  const { data, ...rest } = useCatalog();
  return {
    data: makeId ? data?.models.filter((model) => model.makeId === makeId) : undefined,
    ...rest,
  };
}

export function useVehicleTrims(modelId?: string) {
  const { data, ...rest } = useCatalog();
  return {
    data: modelId ? data?.trims.filter((trim) => trim.modelId === modelId) : undefined,
    ...rest,
  };
}

export function useProvinces() {
  const { data, ...rest } = useCatalog();
  return { data: data?.provinces, ...rest };
}

export function useCantons(provinceId?: string) {
  const { data, ...rest } = useCatalog();
  return {
    data: provinceId
      ? data?.cantons.filter((canton) => canton.provinceId === provinceId)
      : undefined,
    ...rest,
  };
}

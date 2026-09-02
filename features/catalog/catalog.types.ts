export type VehicleMake = {
  id: string;
  name: string;
};

export type VehicleModel = {
  id: string;
  makeId: string;
  name: string;
};

export type VehicleTrim = {
  id: string;
  modelId: string;
  name: string;
};

export type Province = {
  id: string;
  name: string;
};

export type Canton = {
  id: string;
  provinceId: string;
  name: string;
};

export type Catalog = {
  makes: VehicleMake[];
  models: VehicleModel[];
  trims: VehicleTrim[];
  provinces: Province[];
  cantons: Canton[];
};

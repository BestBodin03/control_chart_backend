export type FurnaceMaterialCache = {
  byFurnace: Map<number, string[]>;
  byCp: Map<string, Set<number>>;
  byCpName: Map<string, string>;
  loadedAt?: Date;
  ready: boolean;
  toJSON?: () => any; 
};

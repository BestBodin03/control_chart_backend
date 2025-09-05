export type FurnaceMaterialCache = {
  byFurnace: Map<number, string[]>;
  byCp: Map<string, Set<number>>;
  loadedAt?: Date;
  ready: boolean;
  toJSON?: () => any; 
};

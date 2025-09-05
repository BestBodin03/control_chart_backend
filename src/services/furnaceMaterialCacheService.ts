import { FurnaceModel } from "../models/entities/furnace";
import { FurnaceMaterialCache } from "../models/types/furnaceMatCache";

class FurnaceMaterialCacheService {
  private cache: FurnaceMaterialCache = {
    byFurnace: new Map(),
    byCp: new Map(),
    ready: false,

    toJSON() {
      return {
        byFurnace: Object.fromEntries(this.byFurnace),
        byCp: Object.fromEntries(
          Array.from(this.byCp.entries()).map(([cp, set]) => [cp, Array.from(set)])
        ),
        ready: this.ready,
        loadedAt: this.loadedAt,
      };
    },
  }

  /** init: โหลด cache ครั้งแรก */
  async init(): Promise<void> {
    await this.refresh();
  }

  /** refresh: โหลดใหม่จาก DB */
  async refresh(): Promise<void> {
    const rows = await FurnaceModel.find({}, { furnaceNo: 1, cpNo: 1, _id: 0 }).lean();

    const byFurnace = new Map<number, string[]>();
    const byCp = new Map<string, Set<number>>();

    for (const r of rows) {
      const f = r.furnaceNo;
      const list = Array.isArray(r.cpNo) ? r.cpNo : [];
      byFurnace.set(f, list);

      for (const cp of list) {
        if (!byCp.has(cp)) byCp.set(cp, new Set());
        byCp.get(cp)!.add(f);
      }
    }

    this.cache.byFurnace = byFurnace;
    this.cache.byCp = byCp;
    this.cache.loadedAt = new Date();
    this.cache.ready = true;
  }

  /** ดึง cp ทั้งหมดของเตา */
  getCpByFurnace(furnaceNo: number): string[] {
    if (!this.cache.ready) throw new Error("Cache not initialized");
    return [...(this.cache.byFurnace.get(furnaceNo) ?? [])];
  }

  /** ดึง furnaces ทั้งหมดที่มี cp */
  getFurnacesByCp(cp: string): number[] {
    if (!this.cache.ready) throw new Error("Cache not initialized");
    const set = this.cache.byCp.get(cp);
    return set ? Array.from(set).sort((a, b) => a - b) : [];
  }

  /** ดึง cache ทั้งก้อน (byFurnace, byCp, ready, loadedAt) */
  getAll(): any {
    return {
      furnaceNo: Array.from(this.cache.byFurnace.keys()), // 🔹 ได้เฉพาะ key ของเตา
      cpNo: Array.from(this.cache.byCp.keys()),           // 🔹 ได้เฉพาะ key ของ cp
    };
  }


  /** ดูสถานะ cache */
  isReady(): boolean {
    return this.cache.ready;
  }

  // serializeCache(cache: FurnaceMaterialCache) {
  //   return {
  //     byFurnace: Object.fromEntries(cache.byFurnace), // Map<number,string[]> → { "1": ["a","b"] }
  //     byCp: Object.fromEntries(
  //       Array.from(cache.byCp.entries()).map(([cp, set]) => [cp, Array.from(set)])
  //     ), // Map<string,Set<number>> → { "abc": [1,2] }
  //     // ready: cache.ready,
  //     // loadedAt: cache.loadedAt,
  //   };
  // }

}

export const furnaceMaterialCacheService = new FurnaceMaterialCacheService();

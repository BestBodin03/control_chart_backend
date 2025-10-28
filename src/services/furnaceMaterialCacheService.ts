// services/furnaceMaterialCache.service.ts
import { FurnaceModel } from "../models/entities/furnace";
import { FurnaceMaterialCache } from "../models/types/furnaceMatCache";
import { customerProductService } from "../utils/serviceLocator";
// (optional) import type only, if you have it exported
// import type { CustomerProduct } from "../models/entities/customerProduct";

class FurnaceMaterialCacheService {
  private cache: FurnaceMaterialCache = {
    byFurnace: new Map(),                 // Map<number, string[]>
    byCp: new Map(),                      // Map<string, Set<number>>
    byCpName: new Map(),                  // Map<string, string>  // CPNo -> parName
    ready: false,

    toJSON() {
      return {
        byFurnace: Object.fromEntries(this.byFurnace),
        byCp: Object.fromEntries(
          Array.from(this.byCp.entries()).map(([cp, set]) => [cp, Array.from(set)])
        ),
        byCpName: Object.fromEntries(this.byCpName), // Map<string,string> → object
        ready: this.ready,
        loadedAt: this.loadedAt,
      };
    },
  };

  /** init: โหลด cache ครั้งแรก */
  async init(): Promise<void> {
    await this.refresh();
  }

  /** refresh: โหลดใหม่จาก DB */
  async refresh(): Promise<void> {
    // 1) Load furnace rows (furnace -> [cpNo])
    const rows = await FurnaceModel.find(
      {},
      { furnaceNo: 1, cpNo: 1, _id: 0 }
    )
      .lean()
      .exec();

    // 2) Load ALL customer products via the service (no filters/projection here)
    //    Then pick only cpNo & parName in memory.
    const cpRows = await customerProductService.getAllCustomerProducts(); // Promise<CustomerProduct[]>

    // Working maps
    const byFurnace = new Map<number, string[]>();
    const byCp = new Map<string, Set<number>>();
    const byCpName = new Map<string, string>(); // CPNo -> parName

    // Build byFurnace & byCp (unchanged)
    for (const r of rows) {
      const f = r.furnaceNo as number;
      const list = Array.isArray(r.cpNo) ? (r.cpNo as string[]) : [];
      byFurnace.set(f, list);

      for (const cp of list) {
        if (!byCp.has(cp)) byCp.set(cp, new Set<number>());
        byCp.get(cp)!.add(f);
      }
    }

    // Build byCpName using only cpNo & parName from cpRows
    for (const doc of cpRows as Array<any>) {
      const cp = String(doc?.CPNo ?? "").trim();
      const name = String(doc?.partName ?? "").trim();
      // console.log(name);
      if (!cp || !name) continue; // skip invalid rows
      byCpName.set(cp, name);
    }

    // Commit to cache
    this.cache.byFurnace = byFurnace;
    this.cache.byCp = byCp;
    this.cache.byCpName = byCpName;
    this.cache.loadedAt = new Date();
    this.cache.ready = true;
  }

  /** ดึง cp ทั้งหมดของเตา */
  getCpByFurnace(furnaceNo: number): string[] {
    if (!this.cache.ready) throw new Error("Cache not initialized");
    return [...(this.cache.byFurnace.get(furnaceNo) ?? [])];
  }

  getCpNameByFurnace(furnaceNo: number): string[] {
    if (!this.cache.ready) throw new Error("Cache not initialized");
    // NOTE: unchanged: currently returns cpNo list for the furnace
    return [...(this.cache.byFurnace.get(furnaceNo) ?? [])];
  }

  /** ดึง furnaces ทั้งหมดที่มี cp */
  getFurnacesByCp(cp: string): number[] {
    if (!this.cache.ready) throw new Error("Cache not initialized");
    const set = this.cache.byCp.get(cp);
    return set ? Array.from(set).sort((a, b) => a - b) : [];
  }

  getCpName(cpNo: string): string | undefined {
    if (!this.cache.ready) throw new Error("Cache not initialized");
    return this.cache.byCpName.get(cpNo);
  }

  /** ดึง cache ทั้งก้อน (byFurnace, byCp, ready, loadedAt) */
  getAll(): any {
    return {
      furnaceNo: Array.from(this.cache.byFurnace.keys()),
      cpNo: Array.from(this.cache.byCp.keys()),
      cpName: Array.from(this.cache.byCpName),
    };
  }

  /** ดูสถานะ cache */
  isReady(): boolean {
    return this.cache.ready;
  }
}

export const furnaceMaterialCacheService = new FurnaceMaterialCacheService();

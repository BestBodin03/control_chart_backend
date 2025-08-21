import { CreateSettingProfileRequest } from "../models/validations/settingValidate";
import { FurnaceRepository } from "../repositories/furnaceRepo";

const pairKey = (f: number, cp: string) => `${f}|${cp.trim()}`;

// เช็ค subset แบบเร็ว (หยุดทันทีที่เจอไม่อยู่)
const isSubset = <T>(a: Set<T>, b: Set<T>) => {
  for (const x of a) if (!b.has(x)) return false;
  return true;
};

export async function assertAllowedFurnaceCp(
  req: CreateSettingProfileRequest,
  furnaceRepo: FurnaceRepository
): Promise<void> {
  // --- request sets ---
  const reqFurnaces = new Set(req.specificSetting.map(s => s.furnaceNo));
  const reqPairs    = new Set(req.specificSetting.map(s => pairKey(s.furnaceNo, s.cpNo)));

  // --- master (แนะนำให้ repo ใช้ .select({furnaceNo:1,cpNo:1}).lean()) ---
  const furnaces = await furnaceRepo.findAll(); // [{ furnaceNo: number, cpNo: string[] }, ...]
  const allowFurnaces = new Set<number>(furnaces.map(f => f.furnaceNo));
  const allowedPairs  = new Set<string>(
    furnaces.flatMap(f => (f.cpNo ?? []).map(cp => pairKey(f.furnaceNo, cp)))
  );

  // --- check 1: furnace subset (ถูก/ไม่มีเบอร์เตา) ---
  if (!isSubset(reqFurnaces, allowFurnaces)) {
    const missing: number[] = [];
    for (const f of reqFurnaces) if (!allowFurnaces.has(f)) missing.push(f);
    throw new Error(`Validation failed: furnaceNo not found -> ${missing.join(", ")}`);
  }

  // --- check 2: pair subset (คู่เตา-CP ต้องถูกต้อง) ---
  if (!isSubset(reqPairs, allowedPairs)) {
    const invalid: string[] = [];
    for (const p of reqPairs) if (!allowedPairs.has(p)) invalid.push(p);
    throw new Error(`Validation failed: invalid furnace and customer product no. not match -> ${invalid.join(", ")}`);
  }
}

export async function assertAllowedDisplayType(req: CreateSettingProfileRequest): Promise<void> {
  switch (req.displayType) {
      case 'FURNACE':
          
          break;
      case 'FURNACE_CP':
          console.log('Delete');
          break;
      case 'CP':
          console.log('New');
          break;
  }
  
  
}

import { CreateSettingProfileRequest } from "../models/validations/SettingValidate";
import { FurnaceRepository } from "../repositories/furnaceRepo";

const pairKey = (f: number, cp: string) => `${f}|${cp.trim()}`;

// subset checker
const isSubset = <T>(a: Set<T>, b: Set<T>) => {
  for (const x of a) if (!b.has(x)) return false;
  return true;
};

export async function assertAllowedFurnaceCp(
  req: CreateSettingProfileRequest,
  furnaceRepo: FurnaceRepository
): Promise<void> {
  // --- request sets (กรอง undefined/ค่าว่าง ออกก่อน) ---
  const reqFurnaces = new Set<number>(
    req.specificSetting
      .filter(s => s.furnaceNo !== undefined && s.furnaceNo !== null)
      .map(s => s.furnaceNo as number)
  );

  const reqPairs = new Set<string>(
    req.specificSetting
      .filter(
        s =>
          s.furnaceNo !== undefined &&
          s.furnaceNo !== null &&
          typeof s.cpNo === "string" &&
          s.cpNo.trim() !== ""
      )
      .map(s => pairKey(s.furnaceNo as number, (s.cpNo as string).trim()))
  );

  const reqCps = new Set<string>(
    req.specificSetting
      .map(s => (typeof s.cpNo === "string" ? s.cpNo.trim() : ""))
      .filter(cp => cp !== "")
  );

  // --- master data ---
  const furnaces = await furnaceRepo.findAll(); // [{ furnaceNo: number, cpNo: string[] }, ...]
  const allowedFurnaces = new Set<number>(furnaces.map(f => f.furnaceNo));
  const allowedCps = new Set<string>(
    furnaces.flatMap(f => (f.cpNo ?? []).map(cp => cp.trim()))
  );
  const allowedPairs = new Set<string>(
    furnaces.flatMap(f => (f.cpNo ?? []).map(cp => pairKey(f.furnaceNo, cp)))
  );

  // --- check 1: furnace subset (ถ้ามีการระบุเตามา) ---
  if (reqFurnaces.size > 0 && !isSubset(reqFurnaces, allowedFurnaces)) {
    const missing: number[] = [];
    for (const f of reqFurnaces) if (!allowedFurnaces.has(f)) missing.push(f);
    throw new Error(
      `Validation failed: furnaceNo not found -> ${missing.join(", ")}`
    );
  }

  // --- check 2: CP subset (กรณี displayType เป็น CP หรือต้องการตรวจ cp เดี่ยว) ---
  if (reqCps.size > 0 && !isSubset(reqCps, allowedCps)) {
    const invalid: string[] = [];
    for (const cp of reqCps) if (!allowedCps.has(cp)) invalid.push(cp);
    throw new Error(
      `Validation failed: customer product not found -> ${invalid.join(", ")}`
    );
  }

  // --- check 3: pair subset (เมื่อระบุทั้ง furnace และ cp) ---
  if (reqPairs.size > 0 && !isSubset(reqPairs, allowedPairs)) {
    const invalid: string[] = [];
    for (const p of reqPairs) if (!allowedPairs.has(p)) invalid.push(p);
    throw new Error(
      `Validation failed: invalid furnace-cp pair -> ${invalid.join(", ")}`
    );
  }
}

// ตรวจรูปแบบตาม displayType: FURNACE / FURNACE_CP / CP
export function assertAllowedDisplayType(req: CreateSettingProfileRequest): void {
  switch (req.displayType) {
    case "FURNACE": {
      const bad = req.specificSetting.filter(
        s =>
          s.furnaceNo === undefined ||
          s.furnaceNo === null ||
          (typeof s.cpNo === "string" && s.cpNo.trim() !== "")
      );
      if (bad.length) {
        throw new Error(
          "DisplayType=FURNACE requires furnaceNo (cpNo must be empty)."
        );
      }
      break;
    }

    case "FURNACE_CP": {
      const bad = req.specificSetting.filter(
        s =>
          s.furnaceNo === undefined ||
          s.furnaceNo === null ||
          !(typeof s.cpNo === "string" && s.cpNo.trim() !== "")
      );
      if (bad.length) {
        throw new Error(
          "DisplayType=FURNACE_CP requires both furnaceNo and cpNo."
        );
      }
      break;
    }

    case "CP": {
      const bad = req.specificSetting.filter(
        s => !(typeof s.cpNo === "string" && s.cpNo.trim() !== "")
      );
      if (bad.length) {
        throw new Error("DisplayType=CP requires cpNo.");
      }
      break;
    }

    default:
      throw new Error(`Unknown displayType: ${String(req.displayType)}`);
  }
}

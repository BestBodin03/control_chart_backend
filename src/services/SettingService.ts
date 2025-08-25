import { DeleteReport } from "../models/deleteType";
import { fromEntity, toEntity } from "../models/mapper/settingMapper";
import { CreateSettingProfileRequest, settingDTO, SettingDTO, SettingEntity, UpdateSettingProfileRequest } from "../models/validations/settingValidate";
import { assertAllowedFurnaceCp } from "../utils/furnaceAndCpChecker";
import { cpRepository, furnaceRepository, settingRepository } from "../utils/serviceLocator";
import { TimeConverter } from "../utils/timeConvertor";

export class SettingService {
  // 🔒 DRY: single-active guard kept inside this class
  private async assertSingleActiveSetting(currentId?: string): Promise<void> {
    // Use your repo's query; keep it minimal (only _id)
    const actives = await settingRepository.find({ isUsed: true });

    if (!currentId) {
      // Creating a new active one → must be none
      if (actives.length > 0) {
        throw new Error("There is already an active setting profile.");
      }
      return;
    }

    // Updating an existing one → allow itself, but block others
    const others = actives.filter(a => a._id.toHexString() !== currentId);
    if (others.length > 0) {
      throw new Error("Another active setting profile already exists.");
    }
  }

  async addSettingProfile(req: CreateSettingProfileRequest): Promise<SettingDTO> {
    try {
      await assertAllowedFurnaceCp(req, furnaceRepository);

      if (req.isUsed) {
        await this.assertSingleActiveSetting();
      }

      const specificSetting = await Promise.all(
        req.specificSetting.map(async s => {
          const { startDate, endDate } = TimeConverter.toDateRange(
            s.period.type,
            s.period.startDate,
            s.period.endDate,
            (s.period as any).customDays
          );
          return { ...s, period: { ...s.period, startDate, endDate } };
        })
      );

      const saved = await settingRepository.create(toEntity({ ...req, specificSetting }));
      return fromEntity(saved);
    } catch (e) {
      throw new Error('Can not create a new setting profile');
    }
  }

  async updateSettingProfile(id: string, req: UpdateSettingProfileRequest): Promise<SettingDTO> {
    try {
      await assertAllowedFurnaceCp(req, furnaceRepository);

      if (req.isUsed) {
        await this.assertSingleActiveSetting(id);
      }

      const toDate = (v: unknown): Date => {
        if (v instanceof Date) return v;
        const d = new Date(v as any);
        if (Number.isNaN(d.getTime())) {
          throw new Error("Invalid date value");
        }
        return d;
      };

      // 2) คำนวณช่วงวันที่ให้ชัด (immutable)
      const specificSetting = await Promise.all(
        req.specificSetting.map(async (s) => {
          const range = TimeConverter.toDateRange(
            s.period.type,
            s.period.startDate,
            s.period.endDate,
            (s.period as any).customDays
          );

          const startDate = toDate(range.startDate);
          const endDate = toDate(range.endDate);

          return {
            ...s,
            period: { ...s.period, startDate, endDate },
          };
        })
      );

      const updateDoc: Partial<SettingEntity> = {
        settingProfileName: req.settingProfileName,
        isUsed: req.isUsed,
        displayType: req.displayType,
        generalSetting: {
          chartChangeInterval: req.generalSetting.chartChangeInterval,
          nelsonRule: req.generalSetting.nelsonRule.map((r) => ({
            ruleId: r.ruleId,
            ruleName: r.ruleName,
            ruleDescription: r.ruleDescription ?? undefined,
            ruleIndicated: r.ruleIndicated ?? undefined,
            isUsed: r.isUsed,
          })),
        },
        specificSetting: specificSetting.map((sp) => ({
          period: {
            type: sp.period.type,
            startDate: sp.period.startDate,
            endDate: sp.period.endDate,     
          },
          furnaceNo: sp.furnaceNo,
          cpNo: sp.cpNo,
        })),
        updatedAt: new Date(),
      };

      // 4) อัปเดตตาม id และให้ repo คืน entity หลังอัปเดต
      const updated = await settingRepository.updateById(id, updateDoc);
      if (!updated) throw new Error("Setting profile not found");

      // 5) map Entity -> DTO
      return fromEntity(updated);
    } catch (e: any) {
      // ควร log จริงในระบบของคุณ
      // console.error(e);
      throw new Error(`Can not update setting profile: ${e?.message ?? "unknown error"}`);
    }
  }

  async deleteSettingProfile(ids: string[]): Promise<DeleteReport> {
    const existingIds = await settingRepository.findExistingIds(ids);
    const existing = new Set(existingIds);
    const notFoundIds = ids.filter(id => !existing.has(id));

    const deletedCount = await settingRepository.deleteMany(existingIds);
    return { deletedCount, notFoundIds };
  }

  async findOneSettingProfile(id: string): Promise<SettingDTO> {
    const entity = await settingRepository.findById(id);
    const result = entity ? settingDTO.convertFromEntity(entity): undefined;
    return result;
  }

  async findAllSettingProfiles(): Promise<SettingDTO[]>{
    const entities = await settingRepository.findAll();
    return entities.map(e => settingDTO.convertFromEntity(e));
  }

  // searchSettingProfile(dto: SettingDTO): Promise<SettingDTO>{

  // }

  // getAllSettingProfile
}
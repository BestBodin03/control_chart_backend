import { fromEntity, toEntity } from "../models/mapper/settingMapper";
import { CreateSettingProfileRequest, SettingDTO, SettingEntity, UpdateSettingProfileRequest } from "../models/validations/settingValidate";
import { assertAllowedFurnaceCp } from "../utils/furnaceAndCpChecker";
import { cpRepository, furnaceRepository, settingRepository } from "../utils/serviceLocator";
import { TimeConverter } from "../utils/timeConvertor";

export class SettingService {
  async addSettingProfile(req: CreateSettingProfileRequest): Promise<SettingDTO> {
    try {
      await assertAllowedFurnaceCp(req, furnaceRepository);

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

  async updateSettingProfile(req: UpdateSettingProfileRequest): Promise<SettingDTO> {
    try {
      // 1) validate คู่ (furnaceNo, cpNo) กับ master
      await assertAllowedFurnaceCp(req, furnaceRepository);

      // 2) คำนวณช่วงวันที่ให้ชัด (immutable ไม่แก้ object เดิม)
      const specificSetting = await Promise.all(
        req.specificSetting.map(async s => {
          const { startDate, endDate } = TimeConverter.toDateRange(
            s.period.type,
            s.period.startDate,
            s.period.endDate,
            (s.period as any).customDays
          );
          return { ...s, period: { ...s.period, startDate: Date, endDate: Date } };
        })
      );

      // 3) สร้างเอกสารสำหรับอัปเดต (อย่าตั้ง _id/createdAt ใหม่)
      const updateDoc: Partial<SettingEntity> = {
        settingProfileName: req.settingProfileName,
        isUsed: req.isUsed,
        displayType: req.displayType,
        generalSetting: {
          chartChangeInterval: req.generalSetting.chartChangeInterval,
          nelsonRule: req.generalSetting.nelsonRule.map(r => ({
            ruleId: r.ruleId,
            ruleName: r.ruleName,
            ruleDescription: r.ruleDescription,
            ruleIndicated: r.ruleIndicated,
            isUsed: r.isUsed,
          })),
        },
        specificSetting: specificSetting.map(sp => ({
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

      // 4) เรียก repo อัปเดตตาม id (ให้ repo คืน entity หลังอัปเดต)
      const updated = await settingRepository.updateById(req.id, updateDoc);
      if (!updated) {
        throw new Error("Setting profile not found");
      }

      // 5) map Entity -> DTO
      return fromEntity(updated);
    } catch (e) {
      throw new Error("Can not update setting profile");
    }
  }


  // deleteSettingProfile(req: SettingDTO): Promise<void>{

  // }

  // searchSettingProfile(dto: SettingDTO): Promise<SettingDTO>{

  // }

  // getAllSettingProfile
}
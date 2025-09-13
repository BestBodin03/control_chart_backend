import { ChartDetailModel } from "../models/entities/chartDetail";
import { Setting } from "../models/entities/setting";
import { SettingDTO } from "../models/validations/settingValidate";

export interface PeriodFilter {
  startDate: string; // ISO string
  endDate: string;   // ISO string
}

export class DataPartitionwithPeriod {
  // static async getDateBySettingProfileName(periodName: string) {
  //   try {
  //     const setting = await Setting.findOne({
  //       settingProfileName: periodName,
  //     })
  //       .select("settingProfileName specificSetting.period")
  //       .lean();

  //     if (!setting) {
  //       throw new Error(`Period '${periodName}' not found`);
  //     }

  //     // รวมช่วงวันจากทุก specificSetting[i].period เท่านั้น
  //     const startDates: Date[] = [];
  //     const endDates: Date[] = [];

  //     if (Array.isArray(setting.specificSetting)) {
  //       for (const s of setting.specificSetting) {
  //         if (s?.period?.startDate) startDates.push(new Date(s.period.startDate));
  //         if (s?.period?.endDate) endDates.push(new Date(s.period.endDate));
  //       }
  //     }

  //     if (startDates.length === 0 && endDates.length === 0) {
  //       throw new Error(`No period range configured for '${periodName}'`);
  //     }

  //     const startDate = startDates.length
  //       ? new Date(Math.min(...startDates.map(d => d.getTime())))
  //       : undefined;

  //     const endDate = endDates.length
  //       ? new Date(Math.max(...endDates.map(d => d.getTime())))
  //       : undefined;

  //     return {
  //       name: setting.settingProfileName as string,
  //       startDate,
  //       endDate,
  //     };
  //   } catch (error) {
  //     console.error("Error getting period:", error);
  //     throw error;
  //   }
  // }

  // static async makeDataPartitionWithDate(periodFilter: PeriodFilter) {
  //   try {
  //     const start = new Date(periodFilter.startDate);
  //     const end = new Date(periodFilter.endDate);

  //     const dataPartition = await ChartDetailModel.find({
  //       "chartGeneralDetail.collectedDate": { $gte: start, $lte: end },
  //     }).lean();

  //     console.log(
  //       `This is number of Partitioned Data ${dataPartition.length.toLocaleString()}`
  //     );

  //     return {
  //       data: dataPartition,
  //       count: dataPartition.length,
  //       periodInfo: {
  //         startDate: start.toISOString(),
  //         endDate: end.toISOString(),
  //       },
  //     };
  //   } catch (error) {
  //     console.error("Error making data partition:", error);
  //     throw error;
  //   }
  // }

  // static async FilterChartDetail(settingFiltering: SettingDTO, preFilteredData?: any[]) {
  //   try {
  //     const specifics = Array.isArray(settingFiltering.specificSetting)
  //       ? settingFiltering.specificSetting
  //       : [];

  //     // ---------- กรณีมี pre-filtered data ----------
  //     if (preFilteredData && preFilteredData.length > 0) {
  //       let filtered = preFilteredData;

  //       if (specifics.length > 0) {
  //         // กรองตามคู่ cpNo + furnaceNo ก่อน
  //         const keySet = new Set(
  //           specifics.map(s => `${s.cpNo}::${s.furnaceNo}`)
  //         );
  //         filtered = filtered.filter(item =>
  //           keySet.has(`${item.CPNo}::${item.chartGeneralDetail?.furnaceNo}`)
  //         );

  //         // กรองตามช่วงเวลาแบบ "ต่อรายการ"
  //         filtered = filtered.filter(item => {
  //           const t = new Date(item.chartGeneralDetail?.collectedDate).getTime();
  //           const matchedSpecifics = specifics.filter(
  //             s => s.cpNo === item.CPNo && s.furnaceNo === item.chartGeneralDetail?.furnaceNo
  //           );

  //           if (matchedSpecifics.length === 0) return false;

  //           // ผ่านถ้าเข้าอย่างน้อยหนึ่งช่วงของ specific ที่ตรงกัน
  //           return matchedSpecifics.some(s => {
  //             const sStart = s.period?.startDate ? new Date(s.period.startDate).getTime() : undefined;
  //             const sEnd = s.period?.endDate ? new Date(s.period.endDate).getTime() : undefined;

  //             if (sStart && t < sStart) return false;
  //             if (sEnd && t > sEnd) return false;
  //             return true; // ไม่มี start/end ถือว่าไม่จำกัดช่วงเวลา
  //           });
  //         });
  //       }

  //       return { data: filtered, count: filtered.length };
  //     }

  //     // ---------- กรณี query DB ----------
  //     if (specifics.length > 0) {
  //       // สร้าง $or ที่ผูกช่วงเวลาของแต่ละ specific กับคู่ cp/furnace ของรายการนั้น
  //       const orBranches = specifics.map(s => {
  //         const branch: any = {
  //           CPNo: s.cpNo,
  //           "chartGeneralDetail.furnaceNo": s.furnaceNo,
  //         };
  //         const sStart = s.period?.startDate ? new Date(s.period.startDate) : undefined;
  //         const sEnd = s.period?.endDate ? new Date(s.period.endDate) : undefined;

  //         if (sStart || sEnd) {
  //           const dq: any = {};
  //           if (sStart) dq.$gte = sStart;
  //           if (sEnd) dq.$lte = sEnd;
  //           branch["chartGeneralDetail.collectedDate"] = dq;
  //         }
  //         return branch;
  //       });

  //       const partitionedData = await ChartDetailModel.find({ $or: orBranches }).lean();
  //       return { data: partitionedData, count: partitionedData.length };
  //     }

  //     // ไม่กำหนดเงื่อนไข -> คืนทั้งหมด
  //     const all = await ChartDetailModel.find({}).lean();
  //     return { data: all, count: all.length };
  //   } catch (error) {
  //     console.error("Error in FilterChartDetail:", error);
  //     throw error;
  //   }
  // }
}

import { ChartDetail } from "../entities/chartDetail";

export type ChartDetailDTO = {
  CPNo: string;
  FGNo: string;
  chartGeneralDetail: {
    furnaceNo: number;
    part: string;
    partName: string;
    collectedDate: Date | string;
  };
  machanicDetail: {
    surfaceHardnessMean: number;
    compoundLayer: number;
    CDE: {
      CDEX: number;
      CDTX: number;
    };
  };
};

export function toDTO(doc: ChartDetail): ChartDetailDTO {
  return {
    CPNo: doc.CPNo,
    FGNo: doc.FGNo,
    chartGeneralDetail: {
      furnaceNo: doc.chartGeneralDetail.furnaceNo,
      part: doc.chartGeneralDetail.part,
      partName: doc.chartGeneralDetail.partName,
      collectedDate: doc.chartGeneralDetail.collectedDate,
    },
    machanicDetail: {
      surfaceHardnessMean: doc.machanicDetail.surfaceHardnessMean,
      compoundLayer: doc.machanicDetail.compoundLayer,
      CDE: {
        CDEX: doc.machanicDetail.CDE.CDEX,
        CDTX: doc.machanicDetail.CDE.CDTX,
      },
    },
  };
}
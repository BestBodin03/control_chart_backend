import { PeriodFilter } from "../utils/dataPartitionwithPeriod";
import { CustomerProduct } from "./entities/customerProduct";

export interface ChartDetailsFiltering {
  period: {
    startDate: string;
    endDate: string;
  }
  furnaceNo: string;
  matNo: string;
}

export interface FilteredResult<T> {
  data: T[];
  total: number;
  filters: ChartDetailsFiltering;
  summary: T[];
}

export interface ControlLimits {
 CL: number;
 UCL: number;
 LCL: number;
}

export interface SigmaLevels {
 sigmaMinus3: number;
 sigmaMinus2: number;
 sigmaMinus1: number;
 sigmaPlus1: number;
 sigmaPlus2: number;
 sigmaPlus3: number;
}

export interface MRChartResult {
  numberOfSpots: number;
  average: number;
  cdeAverage: number;
  cdtAverage: number;
  MRAverage: number;
  cdeMRAverage: number;
  cdtMRAverage: number;
  controlLimitIChart: ControlLimits;
  cdeControlLimitIChart: ControlLimits;
  cdtControlLimitIChart: ControlLimits;
  sigmaIChart: SigmaLevels;
  cdeSigmaIChart: SigmaLevels;
  cdtSigmaIChart: SigmaLevels;
  controlLimitMRChart: ControlLimits;
  cdeControlLimitMRChart: ControlLimits;
  cdtControlLimitMRChart: ControlLimits;
  surfaceHardnessChartSpots: number[];
  cdeChartSpots: number[];
  cdtChartSpots: number[];
  mrChartSpots: number[];
  cdeMrChartSpots: number[];
  cdtMrChartSpots: number[];
  specAttribute: SpecAttribute;
  yAxisRange?: YAxisRange;
}

export interface YAxisRange {
  maxYsurfaceHardnessControlChart?: number;
  maxYsurfaceHardnessMrChart?: number;
  minYsurfaceHardnessControlChart?: number;

  maxYcdeControlChart?: number;
  minYcdeControlChart?: number;
  maxYcdeMrChart?: number;

  maxYcdtControlChart?: number;
  minYcdtControlChart?: number;
  maxYcdtMrChart?: number;
}

export interface MRChartSpots {
  spotValue: number;
}

export interface SpecAttribute {
  materialNo?: string;
  surfaceHardnessUpperSpec?: number;
  surfaceHardnessLowerSpec?: number;
  surfaceHardnessTarget?: number;
  cdeUpperSpec?: number;
  cdeLowerSpec?: number;
  cdeTarget?: number;
  cdtUpperSpec?: number;
  cdtLowerSpec?: number;
  cdtTarget?: number;
}

export const toSpecAttribute = (cp: CustomerProduct): SpecAttribute => ({
  materialNo: cp.CPNo,
  surfaceHardnessUpperSpec: cp.surfaceHardnessUSpec,
  surfaceHardnessLowerSpec: cp.surfaceHardnessLSpec,
  surfaceHardnessTarget: cp.surfaceHardnessTarget,
  cdeUpperSpec: cp.cdeUSpec,
  cdeLowerSpec: cp.cdeLSpec,
  cdeTarget: cp.cdeTarget,
  cdtUpperSpec: cp.cdtUSpec,
  cdtLowerSpec: cp.cdtLSpec,
  cdtTarget: cp.cdtTarget,
});

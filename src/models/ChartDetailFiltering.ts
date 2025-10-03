import { PeriodFilter } from "../utils/dataPartitionwithPeriod";
import { CustomerProduct } from "./entities/customerProduct";
import { CapabilityProcess } from "./types/capabilityProcess";
import { SecondChartSelected } from "./types/controlChart";

export interface DataPoint {
  value: number;
  furnaceNo?: number;
  matNo?: string;
  collectedDate?: Date;
  isViolatedR1BeyondLCL: boolean;
  isViolatedR1BeyondUCL: boolean;
  isViolatedR1BeyondLSL: boolean;
  isViolatedR1BeyondUSL: boolean;
  isViolatedR3: boolean;
}

// ---- NEW: กลุ่มจุดของ I-Chart และ MR-Chart ----
export interface ChartPoints {
  surfaceHardness: DataPoint[];
  compoundLayer: DataPoint[];
  cde: DataPoint[];
  cdt: DataPoint[];
}

export const toDataPoints = (arr: number[]): DataPoint[] =>
  arr.map((v) => ({
    value: v,
    isViolatedR1BeyondLCL: false,
    isViolatedR1BeyondUCL: false,
    isViolatedR1BeyondLSL: false,
    isViolatedR1BeyondUSL: false,
    isViolatedR3: false,
  }));

export interface ChartDetailsFiltering {
  period: {
    startDate: string;
    endDate: string;
  }
  furnaceNo?: string;
  matNo?: string;
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

  surfaceHardnessViolations: {
    beyondControlLimitLower: number;
    beyondControlLimitUpper: number;
    beyondSpecLimitLower: number;
    beyondSpecLimitUpper: number;
    trend: number;

  }

  compoundLayerViolations: {
    beyondControlLimitLower: number;
    beyondControlLimitUpper: number;
    beyondSpecLimitLower: number;
    beyondSpecLimitUpper: number;
    trend: number;

  }

  cdeViolations: {
    beyondControlLimitLower: number;
    beyondControlLimitUpper: number;
    beyondSpecLimitLower: number;
    beyondSpecLimitUpper: number;
    trend: number;

  }

  cdtViolations: {
    beyondControlLimitLower: number;
    beyondControlLimitUpper: number;
    beyondSpecLimitLower: number;
    beyondSpecLimitUpper: number;
    trend: number;

  }

  secondChartSelected?: SecondChartSelected;
  periodType: String;
  xTick: number;
  xAxisMediumLabel: Date[];
  xAxisLargeLabel: Date[];

  // isViolatedR1BeyondLCL: boolean;
  // isViolatedR1BeyondUCL: boolean;
  // isViolatedR1BeyondLSL: boolean;
  // isViolatedR1BeyondUSL: boolean;
  // isViolatedR3: boolean;

  average: number;
  compoundLayerAverage: number;
  cdeAverage: number;
  cdtAverage: number;

  MRAverage: number;
  compoundLayerMRAverage: number;
  cdeMRAverage: number;
  cdtMRAverage: number;

  surfaceHardnessCapabilityProcess: CapabilityProcess;
  compoundLayerCapabilityProcess: CapabilityProcess;
  cdeCapabilityProcess: CapabilityProcess;
  cdtCapabilityProcess: CapabilityProcess;

  controlLimitIChart: ControlLimits;
  compoundLayerControlLimitIChart: ControlLimits;
  cdeControlLimitIChart: ControlLimits;
  cdtControlLimitIChart: ControlLimits;

  sigmaIChart: SigmaLevels;
  compoundLayerSigmaIChart: SigmaLevels;
  cdeSigmaIChart: SigmaLevels;
  cdtSigmaIChart: SigmaLevels;
  
  controlLimitMRChart: ControlLimits;
  compoundLayerControlLimitMRChart: ControlLimits;
  cdeControlLimitMRChart: ControlLimits;
  cdtControlLimitMRChart: ControlLimits;

  surfaceHardnessChartSpots: number[];
  compoundLayerChartSpots: number[] ;
  cdeChartSpots: number[];
  cdtChartSpots: number[];
  controlChartSpots?: ChartPoints;

  mrChartSpots: number[];
  compoundLayerMrChartSpots: number[];
  cdeMrChartSpots: number[];
  cdtMrChartSpots: number[];

  specAttribute: SpecAttribute;
  yAxisRange?: YAxisRange;
}

export interface YAxisRange {
  maxYsurfaceHardnessControlChart?: number;
  maxYsurfaceHardnessMrChart?: number;
  minYsurfaceHardnessControlChart?: number;

  maxYcompoundLayerControlChart?: number;
  minYcompoundLayerControlChart?: number;
  maxYcompoundLayerMrChart?: number;

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
  compoundLayerUpperSpec?: number;
  compoundLayerLowerSpec?: number;
  compoundLayerTarget?: number;
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
  compoundLayerUpperSpec: cp.compoundLayerUSpec,
  compoundLayerLowerSpec: cp.compoundLayerLSpec,
  compoundLayerTarget: cp.compoundLayerTarget,
  cdeUpperSpec: cp.cdeUSpec,
  cdeLowerSpec: cp.cdeLSpec,
  cdeTarget: cp.cdeTarget,
  cdtUpperSpec: cp.cdtUSpec,
  cdtLowerSpec: cp.cdtLSpec,
  cdtTarget: cp.cdtTarget,
});
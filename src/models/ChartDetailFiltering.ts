import { PeriodFilter } from "../utils/dataPartitionwithPeriod";

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
  MRAverage: number;
  controlLimitIChart: ControlLimits;
  sigmaIChart: SigmaLevels;
  controlLimitMRChart: ControlLimits;
  mrChartSpots: number[];
}

export interface MRChartSpots {
  spotValue: number;
}
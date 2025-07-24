import { IPeriodFilter } from "../utils/dataPartitionwithPeriod";

export interface IChartDetailsFiltering {
  period: {
    startDate: Date;
    endDate: Date;
  }
  furnaceNo: number;
  matNo: string;
}

export interface FilteredResult<T> {
  data: T[];
  total: number;
  filters: IChartDetailsFiltering;
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

export interface IMRChartResult {
 average: number;
 MRAverage: number;
 controlLimitIChart: ControlLimits;
 sigmaIChart: SigmaLevels;
 controlLimitMRChart: ControlLimits;
}
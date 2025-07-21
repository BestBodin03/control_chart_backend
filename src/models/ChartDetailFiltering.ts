import { IPeriodFilter } from "../utils/dataPartitionwithPeriod";

export interface IChartDetailsFiltering {
    period: IPeriodFilter;
    furnaceNo: number;
    matNo: string;
}

export interface FilteredResult<T> {
  data: T[];
  total: number;
  filters: IChartDetailsFiltering;
}
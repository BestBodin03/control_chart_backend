export type TrendSegment = { start: number; end: number };
export type R3Result = {
    trendUp: TrendSegment[];
    trendDown: TrendSegment[];
    indexes: number[];   // รวมทุกช่วง
    any: boolean;
    };
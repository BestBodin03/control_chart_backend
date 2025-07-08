import { ChartDetailData } from "./ChartDetail";
import { FurnaceData } from "./Furnace";
import { LotData } from "./Lot";

export interface ParseMasterData {
  furnaceData: FurnaceData;
  lotData: LotData;
  chartDetailData: ChartDetailData;
}

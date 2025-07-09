import { ChartDetailData } from "./ChartDetail";
import { FurnaceData } from "./Furnace";
import { CPData } from "./CustomerProduct";

export interface ParseMasterData {
  furnaceData: FurnaceData;
  cpData: CPData;
  chartDetailData: ChartDetailData;
}

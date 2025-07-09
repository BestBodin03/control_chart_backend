import { Types } from "mongoose";
import { FGDataEncoding } from "../utils/masterDataFGEncoding";
import { DataParser, IMasterData } from "../utils/masterDataMapper";
import { CustomerProductService } from "./CustomerProductService";
import { ChartDetailService } from "./ChartDetailService";
import { FurnaceService } from "./FurnaceService";

export const fetchMasterData = async (url: string) => {
  try {
    const response = await fetch('http://localhost:3001/raw_data');
      if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch master data: ${error}`);
  }
};

export class MasterDataService {
  constructor(
    private furnaceService: FurnaceService,
    private chartDetailService: ChartDetailService,
    private customerProductService: CustomerProductService
  ) {}

  async addAllCollections(masterData: IMasterData, fgEncoded: FGDataEncoding) {
    try {
      // const furnaceData = DataParser.parseToFurnace(masterData, fgEncoded);
      const furnace = await this.furnaceService.createFurnace(masterData, fgEncoded);

      const cpData = DataParser.parseToLot(masterData, [furnace._id as Types.ObjectId]);
      const customerProduct = await this.customerProductService.createCustomerProduct(cpData);

      const chartDetailData = DataParser.parseToChartDetail(masterData, fgEncoded);
      const chartDetail = await this.chartDetailService.createChartDetail(chartDetailData);

      return {
        furnace,
        customerProduct,
        chartDetail
      };
    } catch (error) {
      throw new Error(`Failed to add all collections: ${error}`);
    }
  }
}
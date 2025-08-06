import { Types } from "mongoose";
import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { CPData, ICP } from "../models/CustomerProduct";
import { FurnaceData, IFurnace } from "../models/Furnace";
import { MasterApiRequest, MasterApiResponse } from "../models/MasterApiResponse";
import { FurnaceCodeEncoder } from "../utils/masterDataFGEncoder";
import { ChartDetailService } from "./ChartDetailService";
import { CustomerProductService } from "./CustomerProductService";
import { FurnaceService } from "./FurnaceService";
import { MASTER_API } from "../config/constans";
import { furnaceService, customerProductService, chartDetailService } from "../utils/serviceLocator";
import dotenv from 'dotenv';
import { MasterDataServiceHelper } from './MasterDataServiceHelper';

dotenv.config({ path: '.env' });

export class MasterDataService {
    constructor(
    private furnaceService: FurnaceService,
    private customerProductService: CustomerProductService,
    private chartDetailService: ChartDetailService
  ) {}
  private helper = new MasterDataServiceHelper();
  
  private getNestedValue = (obj: any, keys: string[]): number => {
    try {
      let value = obj;
      for (const key of keys) {
        value = value?.[key];
      }
      return parseFloat(value) || 0;
    } catch (error) {
      return 0;
    }
  };

  // // ✅ Fetch data from API
  // private async fetchDataFromAPI(): Promise<MasterApiResponse[]> {
  //   try {
  //     const response = await fetch(MASTER_API);
      
  //     if (!response.ok) {
  //       throw new Error(`API error: ${response.status}`);
  //     }
      
  //     const rawData: any = await response.json();
  //     // console.log('Raw JSON from API (first record):', rawData[0]);
      
  //     const mappedData: MasterApiResponse[] = rawData.map((record: any) => {
  //       const fgCode = record.FG_CHARG || '';
  //       const fgEncoded = FurnaceCodeEncoder.encode(1, new Date(), fgCode);
        
  //       return {
  //         lot_number: record.LotNo || '',
  //         furnace_number: fgEncoded.masterFurnaceNo,
  //         furnace_description: record.DESC || record.DESCRIPTION || '-',
  //         fg_code: fgCode,
  //         part_number: record.PART || '',
  //         part_name: record.PARTNAME || '',
  //         collected_date: fgEncoded.masterCollectedDate,
  //         surface_hardness: record["Surface Hardness(ALL-MEAN)"] || 0,
  //         // hardness_01mm: this.getNestedValue(record, ["Hardness @ 0", "1 mm", " (From Graph)(ALL-MEAN)"]),
  //         cde_x: record["Hardness Case Depth (CDE@ 513 Hmv)(X)"] || 0,
  //         cdt_x: record["Hardness Case Depth (CDE@ 513 Hmv)(Y)"] || 0,
  //         // core_hardness: record["Core Hardness(ALL-MEAN)"] || 0,
  //         // compound_layer: record["Compound Layer-P1"] || 0,
  //         upper_spec: record.UPPER_SPEC || 100,
  //         lower_spec: record.LOWER_SPEC || 0,
  //         target_spec: record.TARGET_SPEC || 50,
  //         is_active: record.IS_ACTIVE || true
  //       };
  //     });
      
  //     console.log(`Total mapped records: ${mappedData.length}`);
  //     return mappedData;
      
  //   } catch (error) {
  //     console.error('Error fetching from API:', error);
  //     throw new Error('Failed to fetch data from API');
  //   }
  // }

  // ✅ Map API data to collections
  private mapAPIDataToCollections(apiData: MasterApiResponse[]) {
    return apiData.map(record => {
      const furnaceData: FurnaceData = {
        furnaceNo: record.furnace_number,
        furnaceDescription: record.furnace_description,
        isDisplay: record.is_active,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const cpData: CPData = {
        CPNo: record.lot_number,
        furnaceId: [],
        specifications: {
          upperSpecLimit: record.upper_spec,
          lowerSpecLimit: record.lower_spec,
          target: record.target_spec
        },
        isDisplay: record.is_active
      };

      const chartDetailData: ChartDetailData = {
        CPNo: record.lot_number,
        FGNo: record.fg_code,
        chartGeneralDetail: {
          furnaceNo: record.furnace_number,
          part: record.part_number,
          partName: record.part_name,
          collectedDate: record.collected_date
        },
        machanicDetail: {
          surfaceHardnessMean: record.surface_hardness,
          hardnessAt01mmMean: record.hardness_01mm,
          CDE: {
            CDEX: record.cde_x,
            CDTX: record.cdt_x
          },
          coreHardnessMean: record.core_hardness,
          compoundLayer: record.compound_layer
        }
      };

      return { furnaceData, cpData, chartDetailData };
    });
  }

  // ✅ Main processing function
  public async processFromAPI(req: MasterApiRequest): Promise<{
    furnaces: IFurnace[];
    customerProducts: ICP[];
    chartDetails: IChartDetail[];
  }> {
    try {
      console.log('=== STARTING MASTER DATA PROCESSING ===');
      
      // 1. GET data from API
      const apiData = await this.getDataFromQcReport(req);
      console.log(`✅ Retrieved ${apiData.length} records from API`);

      // 2. MAP data
      const mappedData = this.mapAPIDataToCollections(apiData);
      console.log(`✅ Mapped ${mappedData.length} records`);

      // 3. Bulk create furnaces
      const furnaceDataArray = mappedData.map(m => m.furnaceData);
      const createdFurnaces = await furnaceService.bulkCreateUniqueFurnaces(furnaceDataArray);
      console.log(`✅ Created ${createdFurnaces.length} unique furnaces`);

      // 4. Get all furnaces for reference
      const allFurnaces = await furnaceService.getAllFurnaces();
      const furnaceMap = new Map(allFurnaces.map(f => [f.furnaceNo, f._id]));

      // 5. Update CP data with furnace IDs and bulk create
      const cpDataArray: CPData[] = mappedData.map(m => {
        const furnaceId = furnaceMap.get(m.furnaceData.furnaceNo);
        return {
          ...m.cpData,
          furnaceId: furnaceId ? [furnaceId as Types.ObjectId] : []
        };
      });
      const createdCustomerProducts = await customerProductService.bulkCreateUniqueCustomerProducts(cpDataArray);
      console.log(`✅ Created ${createdCustomerProducts.length} unique customer products`);

      // 6. Bulk create chart details
      const chartDetailDataArray = mappedData.map(m => m.chartDetailData);
      const createdChartDetails = await chartDetailService.bulkCreateUniqueChartDetails(chartDetailDataArray);
      console.log(`✅ Created ${createdChartDetails.length} chart details`);

      console.log('✅ Bulk creation completed');
      return { 
        furnaces: createdFurnaces, 
        customerProducts: createdCustomerProducts, 
        chartDetails: createdChartDetails 
      };
    } catch (error) {
      console.error('❌ Processing failed:', error);
      throw new Error(`Process failed: ${error}`);
    }
  }

  async getDataFromQcReport(req: MasterApiRequest): Promise<any> {
    const masterApi = process.env.QC_REPORT_API as string;
    
    try {
      const response = await fetch(masterApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req)
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

    const data: any = await response.json();
    console.log('itemobject:', data[0].itemobject);

    // ⭐ แก้จาก data.itemobject เป็น data[0].itemobject
    const invertedIndex = this.helper.createInvertedIndex(data[0].itemobject);
    const targetNames = ["Surface Hardness", "Total Case Depth (Core +50)", "Hardness Case Depth (CDE@ 513 Hmv)"];

  // ⭐ Debug แต่ละ target ว่าผ่าน getBTWValuesOptimized ได้ไหม
  targetNames.forEach(targetName => {
    const btwResult = this.helper.getBTWValuesOptimized(data[0], invertedIndex, targetName)
    // console.log('BTW Result:', btwResult);
    
    if (btwResult) {
      const transformed = this.helper.transformToSpecFormat(btwResult);
      // console.log('Transformed:', transformed);
    }
  });

  // ⭐ หรือ debug ใน transformMultipleToSpecFormat function
  // console.log('\n=== Full Transform Process ===');
  const specResults = this.helper.transformMultipleToSpecFormat(data[0], invertedIndex, targetNames);
  const meanResults = this.helper.getAttributeMeanData(data[0], invertedIndex, targetNames);

  const specMap = this.helper.createLookupMap(specResults);
  const meanMap = this.helper.createLookupMap(meanResults);
  
  // console.log('Final Spec Results:', specResults);

    // // สร้าง lookup map
    // const specMap = specResults.reduce((acc, spec) => {
    //   acc[spec!.name] = spec;
    //   return acc;
    // }, {} as Record<string, any>);

    // // console.log('Inverted Index:', invertedIndex); // ⭐ Debug log
    // // console.log('Spec Results:', specResults); // ⭐ Debug log
    // // console.log('Spec Map:', specMap); // ⭐ Debug log

    const mappedData: MasterApiResponse[] = data.map((record: any) => {
      const fgCode = record.FG_CHARG || '';
      const fgEncoded = FurnaceCodeEncoder.encode(1, new Date(), fgCode);

      const surfaceHardnessSpec = specMap["Surface Hardness"];
      const surfaceHardnessMean = meanMap["Surface Hardness"];
      const cdtSpec = specMap["Total Case Depth (Core +50)"];
      const cdtMean = meanMap["Total Case Depth (Core +50)"];
      const cdeSpec = specMap["Hardness Case Depth (CDE@ 513 Hmv)"];
      const cdeMean = meanMap["Hardness Case Depth (CDE@ 513 Hmv)"];
    
      return {
        lot_number: record.MATCP || '',
        furnace_number: fgEncoded.masterFurnaceNo,
        fg_code: fgCode,
        part_number: record.PART || '',
        part_name: record.PARTNAME || '',
        collected_date: fgEncoded.masterCollectedDate,
        surface_hardness: surfaceHardnessMean?.data_ans || 0,
        cde_x: cdeMean?.data_ans?.x|| 0,
        cdt_x: cdtMean?.data_ans?.x|| 0,
        // core_hardness: record["Core Hardness(ALL-MEAN)"] || 0,
        surface_upper_spec: surfaceHardnessSpec?.upper_spec || 0,
        surface_lower_spec: surfaceHardnessSpec?.lower_spec || 0,
        surface_target: surfaceHardnessSpec?.target || 0,
        cde_upper_spec: cdeSpec?.upper_spec || 0,
        cde_lower_spec: cdeSpec?.lower_spec || 0,
        cde_target: cdeSpec?.target || 0,
        cdt_upper_spec: cdtSpec?.upper_spec || 0,
        cdt_lower_spec: cdtSpec?.lower_spec || 0,
        cdt_target: record.TARGET_SPEC || 0,
        is_active: record.IS_ACTIVE || true
      };
    });

    return mappedData;

    } catch (error) {
      console.error('Failed to fetch from Master API:', error);
      throw error;
    }
  }
  async getAutomateDataFromQcReport(req: MasterApiRequest): Promise<void> {
  }
}
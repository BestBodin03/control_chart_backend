import { Types } from "mongoose";
import { ChartDetailData, ChartDetail } from "../models/entities/chartDetail";
import { CustomerProductData, CustomerProduct } from "../models/entities/customerProduct";
import { FurnaceData, Furnace, FurnaceModel } from "../models/entities/furnace";
// import { ChartDetailService } from "./chartDetailService";
import { CustomerProductService } from "./customerProductService";
import { FurnaceService } from "./furnaceService";
// import { MASTER_API } from "../config/constans";
import { furnaceService, customerProductService, chartDetailService } from "../utils/serviceLocator";
import dotenv from 'dotenv';
import { MasterDataServiceHelper } from "./masterDataServiceHelper";
import { MasterApiResponse, MasterApiRequest } from "../models/masterApiResponse";
import { FurnaceCodeEncoder } from "../utils/masterDataFgEncoder";
import { ChartDetailService } from "./chartDetailService";

dotenv.config({ path: '.env' });

export class MasterDataService {
    constructor(
    private furnaceService: FurnaceService,
    private customerProductService: CustomerProductService,
    private chartDetailService: ChartDetailService
  ) {}
  private helper = new MasterDataServiceHelper();

  private mapAPIDataToCollections(apiData: MasterApiResponse[]) {
    // console.log("The response: ", apiData)
    return apiData.map(record => {
      const furnaceData: FurnaceData = {
        furnaceNo: record.furnace_number,
        furnaceDescription: record.furnace_description || "-",
        isDisplay: record.is_active,
        cpNo: [record.lot_number || "N/A"],
        createdAt: new Date(),
        updatedAt: new Date()
      };

    const cpData: CustomerProductData = {
      CPNo: record.lot_number || "N/A",
      furnaceId: [], // จะ assign ทีหลัง
      surfaceHardnessUSpec: record.surface_upper_spec || 0,
      surfaceHardnessLSpec: record.surface_lower_spec || 0,
      surfaceHardnessTarget: record.surface_target || 0,
      compoundLayerUSpec: record.compound_layer_upper_spec || 0,
      compoundLayerLSpec: record.compound_layer_lower_spec || 0,
      compoundLayerTarget: record.compound_layer_target || 0,
      cdeUSpec: record.cde_upper_spec || 0,
      cdeLSpec: record.cde_lower_spec || 0,
      cdeTarget: record.cde_target || 0,
      cdtUSpec: record.cdt_upper_spec || 0,
      cdtLSpec: record.cdt_lower_spec || 0,
      cdtTarget: record.cdt_target || 0,
      isDisplay: true
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
        surfaceHardnessMean: record.surface_hardness || 0,
        compoundLayer: record.compound_layer || 0,
        CDE: {
          CDEX: record.cde_x || 0,
          CDTX: record.cdt_x || 0,
        },
      }
    };

      return { furnaceData, cpData, chartDetailData };
    });
  }

  async processFromAPI(req: MasterApiRequest): Promise<{
    furnaces: Furnace[];
    customerProducts: CustomerProduct[];
    chartDetails: ChartDetail[];
  }> {
    try {
      console.log('=== STARTING MASTER DATA PROCESSING ===');
      
      // 1. GET data from API using getDataFromQcReport
      const apiData = await this.getDataFromQcReport(req);
      console.log(`✅ Retrieved ${apiData.length} records from API`);

      // 2. MAP data
      const mappedData = this.mapAPIDataToCollections(apiData);
      console.log(`✅ Mapped ${mappedData.length} records`);

      // 3. Bulk create furnaces
      const furnaceDataArray = mappedData.map(m => m.furnaceData);
      const createdFurnaces = await furnaceService.bulkCreateUniqueFurnaces(furnaceDataArray);
      console.log(`✅ Created ${createdFurnaces.length} unique furnaces`);

      // ✅ 3.1 รวม CP ต่อ furnaceNo แล้วอัปเดต cpNo แบบไม่ซ้ำ
      const furnaceCpIndex = new Map<number, Set<string>>();
      for (const { furnaceData } of mappedData) {
        if (!furnaceCpIndex.has(furnaceData.furnaceNo)) {
          furnaceCpIndex.set(furnaceData.furnaceNo, new Set());
        }
        for (const cp of furnaceData.cpNo || []) {
          if (cp) furnaceCpIndex.get(furnaceData.furnaceNo)!.add(cp);
        }
      }

      if (furnaceCpIndex.size > 0) {
        const ops = Array.from(furnaceCpIndex.entries()).map(([furnaceNo, cpSet]) => ({
          updateOne: {
            filter: { furnaceNo },
            update: { $addToSet: { cpNo: { $each: Array.from(cpSet) } } }, // ✅ กันซ้ำ
            upsert: true                                                    // เผื่อยังไม่มีเอกสาร
          }
        }));
        const bulkRes = await FurnaceModel.bulkWrite(ops);
        console.log(`✅ Furnace cpNo merged: matched=${bulkRes.matchedCount}, modified=${bulkRes.modifiedCount}, upserted=${bulkRes.upsertedCount}`);
      }

      // 4. Get all furnaces for reference
      const allFurnaces = await furnaceService.getAllFurnaces();
      const furnaceMap = new Map(allFurnaces.map(f => [f.furnaceNo, f._id]));

      // 5. Update CP data with furnace IDs and bulk create
      const cpDataArray: CustomerProductData[] = mappedData.map(m => {
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
      const targetNames = ["Surface Hardness", "Total Case Depth (Core +50)", "Hardness Case Depth (CDE@ 513 Hmv)", "Compound Layer"];

      const mappedData: MasterApiResponse[] = data.map((record: any, index: number) => {
        const fgCode = record.FG_CHARG || '';
        const fgEncoded = FurnaceCodeEncoder.encode(1, new Date(), fgCode);

        // สร้าง invertedIndex สำหรับ record นี้
        const recordInvertedIndex = this.helper.createInvertedIndex(record.itemobject);
        
        // คำนวณ spec และ mean สำหรับ record นี้
        const recordSpecResults = this.helper.transformMultipleToSpecFormat([record], recordInvertedIndex, targetNames);
        const recordMeanResults = this.helper.getAttributeMeanData([record], recordInvertedIndex, targetNames);

        console.log(`\n📊 Record ${index} results:`);
        console.log('📊 Spec results found:', recordSpecResults.length);
        console.log('📊 Mean results found:', recordMeanResults.length);
        
        // List available data
        recordMeanResults.forEach(result => {
          console.log(`  ✅ Mean data: ${result.name}`);
        });

        // หา mean สำหรับ record นี้โดยเฉพาะ
        const surfaceHardnessMean = recordMeanResults.find((m: any) => 
          m.name === "Surface Hardness");
        const cdtMean = recordMeanResults.find((m: any) => 
          m.name === "Total Case Depth (Core +50)");
        const cdeMean = recordMeanResults.find((m: any) => 
          m.name === "Hardness Case Depth (CDE@ 513 Hmv)");
        const compoundLayerMean = recordMeanResults.find((m: any) =>
          m.name === "Compound Layer");


        // หา spec สำหรับ record นี้
        const surfaceHardnessSpec = recordSpecResults.find((s: any) => 
          s.name === "Surface Hardness"
        );
        const cdtSpec = recordSpecResults.find((s: any) => 
          s.name === "Total Case Depth (Core +50)"
        );
        const cdeSpec = recordSpecResults.find((s: any) => 
          s.name === "Hardness Case Depth (CDE@ 513 Hmv)"
        );

        const compoundLayerSpec = recordSpecResults.find((s: any) => 
          s.name === "Compound Layer"
        );

        console.log(`Record ${index} data found:`);
        console.log(`  - Surface Hardness: ${!!surfaceHardnessMean ? '✅' : '❌'}`);
        console.log(`  - CDT: ${!!cdtMean ? '✅' : '❌'}`);
        console.log(`  - CDE: ${!!cdeMean ? '✅' : '❌'}`);
        console.log(`  - Compound Layer: ${!!compoundLayerMean ? '✅' : '❌'}`);
        
        if (surfaceHardnessMean) {
          console.log(`  - Surface hardness value:`, surfaceHardnessMean.data_ans);
        }
        if (cdtMean) {
          console.log(`  - CDT value:`, cdtMean.data_ans?.x);
        }
        if (cdeMean) {
          console.log(`  - CDE value:`, cdeMean.data_ans?.x);
        }
        if (compoundLayerMean) {
          console.log(`  - Compound Layer value:`, compoundLayerMean.dataFromArr);
        }
      
        return {
          lot_number: record.MATCP || '',
          furnace_number: fgEncoded.masterFurnaceNo,
          fg_code: fgCode,
          part_number: record.PART || '',
          part_name: record.PARTNAME || '',
          collected_date: fgEncoded.masterCollectedDate,
          surface_hardness: surfaceHardnessMean?.data_ans || 0,
          compound_layer: compoundLayerMean?.dataFromArr || 0,
          cde_x: cdeMean?.data_ans?.x || 0,
          cdt_x: cdtMean?.data_ans?.x || 0,
          surface_upper_spec: surfaceHardnessSpec?.upper_spec || 0,
          surface_lower_spec: surfaceHardnessSpec?.lower_spec || 0,
          surface_target: surfaceHardnessSpec?.target || 0,
          compound_layer_upper_spec: compoundLayerSpec?.upper_spec || 0,
          compound_layer_lower_spec: compoundLayerSpec?.lower_spec || 0,
          compound_layer_target: compoundLayerSpec?.target || 0,
          cde_upper_spec: cdeSpec?.upper_spec || 0,
          cde_lower_spec: cdeSpec?.lower_spec || 0,
          cde_target: cdeSpec?.target || 0,
          cdt_upper_spec: cdtSpec?.upper_spec || 0,
          cdt_lower_spec: cdtSpec?.lower_spec || 0,
          cdt_target: record.TARGET_SPEC || 0,
          is_active: record.IS_ACTIVE || true
        };
      });

      // console.log(mappedData);
      return mappedData;

    } catch (error) {
      console.error('Failed to fetch from Master API:', error);
      throw error;
    }
  }

  // async getAutomateDataFromQcReport(req: MasterApiRequest): Promise<void> {
  // }
}
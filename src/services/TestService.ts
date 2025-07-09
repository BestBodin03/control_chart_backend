import { Request, Response } from 'express';
import { Types } from 'mongoose';
import mongoose, { Schema, model, Document, Model } from 'mongoose';

// ✅ Types and Interfaces
interface APIResponse {
  lot_number: string;
  furnace_number: string;
  furnace_description: string;
  fg_code: string;
  part_number: string;
  part_name: string;
  collected_date: string;
  surface_hardness: number;
  hardness_01mm: number;
  cde_x: number;
  cde_y: number;
  core_hardness: number;
  compound_layer: number;
  upper_spec: number;
  lower_spec: number;
  target_spec: number;
  is_active: boolean;
}

interface IFurnace extends Document {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FurnaceData {
  furnaceNo: number;
  furnaceDescription: string;
  isDisplay: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ICP extends Document {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isDisplay: boolean;
}

interface CPData {
  CPNo: string;
  furnaceId: Types.ObjectId[];
  specifications: {
    upperSpecLimit: number;
    lowerSpecLimit: number;
    target: number;
  };
  isDisplay: boolean;
}

interface IChartDetail extends Document {
  CPNo: string;
  FGNo: string;
  chartGeneralDetail: {
    furnaceNo: number;
    part: string;
    partName: string;
    collectedDate: Date;
  };
  machanicDetail: {
    surfaceHardnessMean: number;
    hardnessAt01mmMean: number;
    CDE: {
      CDEX: number;
      CDEY: number;
    };
    coreHardnessMean: number;
    compoundLayer: number;
  };
}

interface ChartDetailData {
  CPNo: string;
  FGNo: string;
  chartGeneralDetail: {
    furnaceNo: number;
    part: string;
    partName: string;
    collectedDate: Date;
  };
  machanicDetail: {
    surfaceHardnessMean: number;
    hardnessAt01mmMean: number;
    CDE: {
      CDEX: number;
      CDEY: number;
    };
    coreHardnessMean: number;
    compoundLayer: number;
  };
}

// ✅ FG Data Encoding Interface
export interface FGDataEncoding {
  masterCollectedDate: Date;
  masterFurnaceNo: number;
  masterFGcode: string; // code ที่ได้จาก API
}

// ✅ Furnace Code Encoder
export class FurnaceCodeEncoder {
  private static encodeMonth(month: number): string {
    const monthMap: Record<number, string> = {
      1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
      7: '7', 8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C'
    };
    return monthMap[month] || '1';
  }
  
  private static encodeFurnaceNumber(furnaceNo: number): string {
    if (furnaceNo >= 1 && furnaceNo <= 9) {
      return furnaceNo.toString();
    } else if (furnaceNo >= 10 && furnaceNo <= 35) {
      return String.fromCharCode(65 + (furnaceNo - 10)); // A=10, B=11, ..., Z=35
    }
    return '1';
  }
  
  // รับ code จาก IMasterData.masterFG_CHARG.masterFG_CHARGCode
  static encode(masterFurnaceNo: string | number, masterCollectedDate: string | Date, code: string): FGDataEncoding {
    const furnaceNo = typeof masterFurnaceNo === 'string' 
      ? parseInt(masterFurnaceNo, 10) 
      : masterFurnaceNo;
    
    const date = typeof masterCollectedDate === 'string' 
      ? new Date(masterCollectedDate) 
      : masterCollectedDate;
    
    return {
      masterCollectedDate: date,
      masterFurnaceNo: furnaceNo,
      masterFGcode: code // ใช้ code ที่ส่งเข้ามาจาก API
    };
  }
}

// ✅ MODELS
const furnaceSchema = new Schema<IFurnace>({
  furnaceNo: { type: Number},
  furnaceDescription: { type: String},
  isDisplay: { type: Boolean, default: true },
}, { timestamps: true });

const cpSchema = new Schema<ICP>({
  CPNo: { type: String },
  furnaceId: [{ type: Schema.Types.ObjectId, ref: 'Furnace' }],
  specifications: {
    upperSpecLimit: { type: Number},
    lowerSpecLimit: { type: Number },
    target: { type: Number}
  },
  isDisplay: { type: Boolean, default: true }
}, { timestamps: true });

const chartDetailSchema = new Schema<IChartDetail>({
  CPNo: { type: String },
  FGNo: { type: String },
  chartGeneralDetail: {
    furnaceNo: { type: Number },
    part: { type: String },
    partName: { type: String},
    collectedDate: { type: Date }
  },
  machanicDetail: {
    surfaceHardnessMean: { type: Number},
    hardnessAt01mmMean: { type: Number },
    CDE: {
      CDEX: { type: Number},
      CDEY: { type: Number}
    },
    coreHardnessMean: { type: Number },
    compoundLayer: { type: Number}
  }
}, { timestamps: true });

// ✅ Safe Model Creation
const FurnaceModel = mongoose.models.Furnace || model<IFurnace>('Furnace', furnaceSchema);
const CPModel = mongoose.models.CustomerProduct || model<ICP>('CustomerProduct', cpSchema);
const ChartDetailModel = mongoose.models.ChartDetail || model<IChartDetail>('ChartDetail', chartDetailSchema);

// ✅ REPOSITORIES
class FurnaceRepository {
  async create(furnaceData: FurnaceData): Promise<IFurnace> {
    const furnace = new FurnaceModel(furnaceData);
    return await furnace.save();
  }

  async findByFurnaceNo(furnaceNo: number): Promise<IFurnace | null> {
    return await FurnaceModel.findOne({ furnaceNo }).exec();
  }

  async findAll(): Promise<IFurnace[]> {
    return await FurnaceModel.find().exec();
  }
}

class CustomerProductRepository {
  async create(cpData: CPData): Promise<ICP> {
    const cp = new CPModel(cpData);
    return await cp.save();
  }

  async findByCPNo(cpNo: string): Promise<ICP | null> {
    return await CPModel.findOne({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<ICP[]> {
    return await CPModel.find().exec();
  }
}

class ChartDetailRepository {
  async create(chartDetailData: ChartDetailData): Promise<IChartDetail> {
    const chartDetail = new ChartDetailModel(chartDetailData);
    return await chartDetail.save();
  }

  async findByCPNo(cpNo: string): Promise<IChartDetail[]> {
    return await ChartDetailModel.find({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<IChartDetail[]> {
    return await ChartDetailModel.find().exec();
  }
}

// ✅ SERVICES
class FurnaceService {
  constructor(private furnaceRepository: FurnaceRepository) {}

  async createFurnace(furnaceData: FurnaceData): Promise<IFurnace> {
    const existingFurnace = await this.furnaceRepository.findByFurnaceNo(furnaceData.furnaceNo);
    if (existingFurnace) {
      return existingFurnace;
    }
    return await this.furnaceRepository.create(furnaceData);
  }

  async getAllFurnaces(): Promise<IFurnace[]> {
    return await this.furnaceRepository.findAll();
  }

  async getFurnaceByFurnaceNo(furnaceNo: number): Promise<IFurnace | null> {
    return await this.furnaceRepository.findByFurnaceNo(furnaceNo);
  }
}

class CustomerProductService {
  constructor(private cpRepository: CustomerProductRepository) {}

  async createCustomerProduct(cpData: CPData): Promise<ICP> {
    return await this.cpRepository.create(cpData);
  }

  async getCustomerProductByCPNo(cpNo: string): Promise<ICP | null> {
    return await this.cpRepository.findByCPNo(cpNo);
  }

  async getAllCustomerProducts(): Promise<ICP[]> {
    return await this.cpRepository.findAll();
  }
}

class ChartDetailService {
  constructor(private chartDetailRepository: ChartDetailRepository) {}

  async createChartDetail(chartDetailData: ChartDetailData): Promise<IChartDetail> {
    return await this.chartDetailRepository.create(chartDetailData);
  }

  async getChartDetailsByCPNo(cpNo: string): Promise<IChartDetail[]> {
    return await this.chartDetailRepository.findByCPNo(cpNo);
  }

  async getAllChartDetails(): Promise<IChartDetail[]> {
    return await this.chartDetailRepository.findAll();
  }
}

// ✅ MASTER DATA PROCESSOR
class MasterDataProcessor {
  constructor(
    private furnaceService: FurnaceService,
    private customerProductService: CustomerProductService,
    private chartDetailService: ChartDetailService
  ) {}

  async processFromAPI(): Promise<{
    furnaces: IFurnace[];
    customerProducts: ICP[];
    chartDetails: IChartDetail[];
  }> {
    try {
      console.log('=== STARTING MASTER DATA PROCESSING ===');
      
      // 1. GET data from API และแปลงเป็น APIResponse
      const apiData = await this.fetchDataFromAPI();
      console.log(`✅ Retrieved ${apiData.length} records from API`);

      // 2. MAP APIResponse → Collections
      const mappedData = this.mapAPIDataToCollections(apiData);
      console.log(`✅ Mapped ${mappedData.length} records`);

      // 3. Bulk POST to 3 collections
      const results = await this.bulkCreateCollections(mappedData);
      console.log('✅ Bulk creation completed');

      return results;
    } catch (error) {
      console.error('❌ Processing failed:', error);
      throw new Error(`Process failed: ${error}`);
    }
  }
    // ✅ Helper function for safe nested access
  private getNestedValue(obj: any, keys: string[]): number {
    try {
      let value = obj;
      for (const key of keys) {
        value = value?.[key];
      }
      return parseFloat(value) || 0;
    } catch (error) {
      return 0;
    }
}

  // ✅ GET data from API และแปลงเป็น APIResponse
  private async fetchDataFromAPI(): Promise<APIResponse[]> {
    try {
      const response = await fetch('http://localhost:14000/master-data');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const rawData: any = await response.json();
      console.log('Raw JSON from API:', rawData[0]);

      // ✅ แปลง JSON fields → APIResponse interface
      const mappedData: APIResponse[] = rawData.map((record: any) => ({
        lot_number: record.LOTNO,                                    // JSON: LOTNO → Interface: lot_number
        furnace_number: record.masterFurnaceNo,                          // JSON: FURNACE_NUM → Interface: furnace_number
        furnace_description: record.DESC || record.DESCRIPTION || '',      // JSON: DESC → Interface: furnace_description
        fg_code: record.FG_CHARG,                                     // JSON: FG_CODE → Interface: fg_code
        part_number: record.PART,                                 // JSON: PART_NO → Interface: part_number
        part_name: record.PARTNAME,                                 // JSON: PART_NAME → Interface: part_name
        collected_date:  Date.now(),                       // JSON: COLLECTED_DATE → Interface: collected_date
        surface_hardness: this.getNestedValue(record, ["Ha@ 0", "1 min", " (MEAN)"]),// JSON: nested object → Interface: surface_hardness
        hardness_01mm: record["Surface Hardness(ALL-MEAN)"]|| 0,                   // JSON: HARDNESS_01MM → Interface: hardness_01mm
        cde_x: record["Hardness Case Depth (CDE@ 513 Hmv)(X)"] || 0,                                    // JSON: CDE_X → Interface: cde_x
        cde_y: record["Hardness Case Depth (CDE@ 513 Hmv)(Y)"] || 0,                                    // JSON: CDE_Y → Interface: cde_y
        core_hardness: record["Core Hardness(ALL-MEAN)"] || 0,                   // JSON: CORE_HARDNESS → Interface: core_hardness
        compound_layer: record["Compound Layer-P1"]|| 0,                 // JSON: COMPOUND_LAYER → Interface: compound_layer
        upper_spec: record.UPPER_SPEC || 100,                       // JSON: UPPER_SPEC → Interface: upper_spec
        lower_spec: record.LOWER_SPEC || 0,                         // JSON: LOWER_SPEC → Interface: lower_spec
        target_spec: record.TARGET_SPEC || 50,                      // JSON: TARGET_SPEC → Interface: target_spec
        is_active: record.IS_ACTIVE || true                         // JSON: IS_ACTIVE → Interface: is_active
      }));
      
      console.log('Mapped to APIResponse:', mappedData[0]);
      return mappedData;
      
    } catch (error) {
      console.error('Error fetching from API:', error);
      throw new Error('Failed to fetch data from API');
    }
  }

  // ✅ MAP APIResponse → Collections
  private mapAPIDataToCollections(apiData: APIResponse[]): {
    furnaceData: FurnaceData;
    cpData: CPData;
    chartDetailData: ChartDetailData;
    fgEncoded: FGDataEncoding;
  }[] {
    return apiData.map(record => {
      // ✅ Create FG Encoded data
      const fgEncoded = FurnaceCodeEncoder.encode(
        record.furnace_number,
        record.collected_date,
        record.fg_code
      );

      // ✅ Map to FurnaceData
      const furnaceData: FurnaceData = {
        furnaceNo: parseInt(record.furnace_number) || 0,
        furnaceDescription: record.furnace_description || '',
        isDisplay: record.is_active || true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // ✅ Map to CPData
      const cpData: CPData = {
        CPNo: record.lot_number,
        furnaceId: [],
        specifications: {
          upperSpecLimit: record.upper_spec || 100,
          lowerSpecLimit: record.lower_spec || 0,
          target: record.target_spec || 50
        },
        isDisplay: record.is_active || true
      };

      // ✅ Map to ChartDetailData
      const chartDetailData: ChartDetailData = {
        CPNo: record.lot_number,
        FGNo: fgEncoded.masterFGcode, // ใช้ code จาก encoder
        chartGeneralDetail: {
          furnaceNo: parseInt(record.furnace_number) || 0,
          part: record.part_number,
          partName: record.part_name,
          collectedDate: fgEncoded.masterCollectedDate // ใช้ date จาก encoder
        },
        machanicDetail: {
          surfaceHardnessMean: record.surface_hardness || 0,
          hardnessAt01mmMean: record.hardness_01mm || 0,
          CDE: {
            CDEX: record.cde_x || 0,
            CDEY: record.cde_y || 0
          },
          coreHardnessMean: record.core_hardness || 0,
          compoundLayer: record.compound_layer || 0
        }
      };

      return { furnaceData, cpData, chartDetailData, fgEncoded };
    });
  }

  // ✅ Bulk POST to 3 collections
  private async bulkCreateCollections(mappedData: {
    furnaceData: FurnaceData;
    cpData: CPData;
    chartDetailData: ChartDetailData;
    fgEncoded: FGDataEncoding;
  }[]): Promise<{
    furnaces: IFurnace[];
    customerProducts: ICP[];
    chartDetails: IChartDetail[];
  }> {
    const furnaces: IFurnace[] = [];
    const customerProducts: ICP[] = [];
    const chartDetails: IChartDetail[] = [];

    for (const record of mappedData) {
      try {
        // 1. Create Furnace first
        const furnace = await this.furnaceService.createFurnace(record.furnaceData);
        furnaces.push(furnace);

        // 2. Update CPData with furnace ID
        const cpDataWithFurnace = {
          ...record.cpData,
          furnaceId: [furnace._id as Types.ObjectId]
        };

        // 3. Create Customer Product
        const customerProduct = await this.customerProductService.createCustomerProduct(cpDataWithFurnace);
        customerProducts.push(customerProduct);

        // 4. Create Chart Detail
        const chartDetail = await this.chartDetailService.createChartDetail(record.chartDetailData);
        chartDetails.push(chartDetail);

        console.log(`✅ Created record: ${record.cpData.CPNo}`);
        
      } catch (error) {
        console.error(`❌ Failed to create record: ${record.cpData.CPNo}`, error);
      }
    }

    return { furnaces, customerProducts, chartDetails };
  }
}

// ✅ CONTROLLERS
class MasterDataController {
  constructor(
    private processor: MasterDataProcessor,
    private furnaceService: FurnaceService,
    private customerProductService: CustomerProductService,
    private chartDetailService: ChartDetailService
  ) {}

  // Process from API
  async processFromAPI(req: Request, res: Response): Promise<void> {
    try {
      const results = await this.processor.processFromAPI();
      
      res.status(201).json({
        status: true,
        message: 'Master data processed successfully',
        data: results,
        summary: {
          furnaceCount: results.furnaces.length,
          customerProductCount: results.customerProducts.length,
          chartDetailCount: results.chartDetails.length,
          processedAt: new Date()
        }
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to process master data',
        error: error
      });
    }
  }

  // Get all furnaces
  async getAllFurnaces(req: Request, res: Response): Promise<void> {
    try {
      const furnaces = await this.furnaceService.getAllFurnaces();
      res.json({
        status: true,
        data: furnaces,
        count: furnaces.length
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to get furnaces',
        error: error
      });
    }
  }

  // Get all customer products
  async getAllCustomerProducts(req: Request, res: Response): Promise<void> {
    try {
      const customerProducts = await this.customerProductService.getAllCustomerProducts();
      res.json({
        status: true,
        data: customerProducts,
        count: customerProducts.length
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to get customer products',
        error: error
      });
    }
  }

  // Get all chart details
  async getAllChartDetails(req: Request, res: Response): Promise<void> {
    try {
      const chartDetails = await this.chartDetailService.getAllChartDetails();
      res.json({
        status: true,
        data: chartDetails,
        count: chartDetails.length
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Failed to get chart details',
        error: error
      });
    }
  }
}

// ✅ INITIALIZE ALL SERVICES
const furnaceRepository = new FurnaceRepository();
const customerProductRepository = new CustomerProductRepository();
const chartDetailRepository = new ChartDetailRepository();

const furnaceService = new FurnaceService(furnaceRepository);
const customerProductService = new CustomerProductService(customerProductRepository);
const chartDetailService = new ChartDetailService(chartDetailRepository);

const processor = new MasterDataProcessor(
  furnaceService,
  customerProductService,
  chartDetailService
);

const controller = new MasterDataController(
  processor,
  furnaceService,
  customerProductService,
  chartDetailService
);

// ✅ EXPORT ROUTE HANDLERS
export const processFromAPI = async (req: Request, res: Response): Promise<void> => {
  await controller.processFromAPI(req, res);
};

export const getEveryFurnaces = async (req: Request, res: Response): Promise<void> => {
  await controller.getAllFurnaces(req, res);
};

export const getAllCustomerProducts = async (req: Request, res: Response): Promise<void> => {
  await controller.getAllCustomerProducts(req, res);
};

export const getAllChartDetails = async (req: Request, res: Response): Promise<void> => {
  await controller.getAllChartDetails(req, res);
};
import { Request, Response } from 'express';
import { Types } from 'mongoose';
import mongoose, { Schema, model, Document, Model } from 'mongoose';

// ✅ Types and Interfaces
interface APIResponse {
  lot_number: string;
  furnace_number: number;
  furnace_description: string;
  fg_code: string;
  part_number: string;
  part_name: string;
  collected_date: Date;
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
  masterFGcode: string;
}

export class FurnaceCodeEncoder {
  
  private static encodeMonth(month: number): string {
    const monthMap: Record<number, string> = {
      1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6',
      7: '7', 8: '8', 9: '9', 10: 'A', 11: 'B', 12: 'C'
    };
    return monthMap[month] || '1';
  }
  
  // Decode month from encoded format (reverse of encodeMonth)
  private static decodeMonth(encodedMonth: string): number {
    const reverseMonthMap: Record<string, number> = {
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6,
      '7': 7, '8': 8, '9': 9, 'A': 10, 'B': 11, 'C': 12
    };
    return reverseMonthMap[encodedMonth] || 1;
  }

  private static encodeFurnaceNumber(furnaceNo: number): string {
    if (furnaceNo >= 1 && furnaceNo <= 9) {
      return furnaceNo.toString();
    } else if (furnaceNo >= 10 && furnaceNo <= 35) {
      let realFurnaceNo = String.fromCharCode(65 + (furnaceNo - 10));
      return realFurnaceNo; // A=10, B=11, ..., Z=35
    }
    return '1';
  }

  // Extract date from FG_CODE format: G<YY><M><DD>B<FurnaceNo>XX
  private static extractDateFromFGCode(fgCode: string): Date {
    try {
      console.log('Extracting date from FG_CODE:', fgCode);
      
      // Pattern: G<YY><M><DD>B<FurnaceNo>XX
      const match = fgCode.match(/^G([0-9A-C]{5})B/);
      
      if (!match) {
        console.warn('Invalid FG_CODE format:', fgCode);
        return new Date();
      }
      
      const dateStr = match[1]; // Extract YYMDD (5 characters)
      
      const yy = parseInt(dateStr.substring(0, 2), 10); // First 2 digits (year)
      const encodedMonth = dateStr.substring(2, 3);     // 3rd character (encoded month)
      const dd = parseInt(dateStr.substring(3, 5), 10); // Last 2 digits (day)
      
      // Decode the month using the reverse mapping
      const m = this.decodeMonth(encodedMonth);
      
      // Handle 2-digit year (assume 20xx)
      const fullYear = 2000 + yy;
      
      // Get current time components
      const now = new Date();
      const hours = now.getUTCHours();
      const minutes = now.getUTCMinutes();
      const seconds = now.getUTCSeconds();
      const milliseconds = now.getUTCMilliseconds();
      
      // Create date using UTC with current time
      const extractedDate = new Date(Date.UTC(fullYear, m - 1, dd, hours, minutes, seconds, milliseconds));
      
      console.log('Date extraction result:', { 
        fgCode, 
        yy, 
        encodedMonth, 
        decodedMonth: m, 
        dd, 
        fullYear,
        result: extractedDate.toISOString() 
      });
      
      return extractedDate;
      
    } catch (error) {
      console.error('Error extracting date from FG_CODE:', error, fgCode);
      return new Date();
    }
  }

  // Extract furnace number from FG_CODE (ตำแหน่งที่ 8)
  private static extractFurnaceFromFGCode(fgCode: string): number {
    try {
      console.log('Extracting furnace from FG_CODE:', fgCode);
      
      // Pattern: G<YYMDD>B<FurnaceNo>XX - ตำแหน่งที่ 8 คือ FurnaceNo
      // ตัวอย่าง: G25521B1XX -> position 8 = '1'
      if (fgCode.length < 8) {
        console.warn('FG_CODE too short:', fgCode);
        return 1;
      }
      
      const furnaceChar = fgCode.charAt(7); // Position 8 (0-indexed = 7)
      console.log('Furnace character at position 8:', furnaceChar);
      
      // If it's a number (1-9)
      if (/^\d$/.test(furnaceChar)) {
        const furnaceNo = parseInt(furnaceChar, 10);
        console.log('Decoded furnace number:', furnaceNo);
        return furnaceNo;
      }
      
      // If it's a letter (A=10, B=11, etc.)
      if (/^[A-Z]$/.test(furnaceChar)) {
        const furnaceNo = furnaceChar.charCodeAt(0) - 65 + 10;
        console.log('Decoded furnace number from letter:', furnaceNo);
        return furnaceNo;
      }
      
      console.warn('Invalid furnace character:', furnaceChar);
      return 1; // Default
    } catch (error) {
      console.error('Error extracting furnace from FG_CODE:', error);
      return 1;
    }
  }

  // Original encode method - extracts both date and furnace from FG_CODE
  static encode(masterFurnaceNo: string | number, masterCollectedDate: Date, code: string): FGDataEncoding {
    
    // Extract date and furnace number from FG_CODE
    const extractedDate = this.extractDateFromFGCode(code);
    const extractedFurnaceNo = this.extractFurnaceFromFGCode(code);
    
    console.log('FG_CODE Processing Results:', {
      originalCode: code,
      extractedDate: extractedDate.toISOString(),
      extractedFurnaceNo,
      inputFurnaceNo: masterFurnaceNo
    });

    return {
      masterCollectedDate: extractedDate, // Use date extracted from FG_CODE
      masterFurnaceNo: extractedFurnaceNo, // Use furnace number extracted from FG_CODE
      masterFGcode: code // The original FG_CODE
    };
  }
}

// ✅ MODELS
const furnaceSchema = new Schema<IFurnace>({
  furnaceNo: { type: Number, unique: true }, // เพิ่ม unique constraint
  furnaceDescription: { type: String},
  isDisplay: { type: Boolean, default: true },
}, { timestamps: true });

const cpSchema = new Schema<ICP>({
  CPNo: { type: String, unique: true }, // เพิ่ม unique constraint
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
  async bulkCreate(furnaceData: FurnaceData[]): Promise<IFurnace[]> {
    try {
      return await FurnaceModel.insertMany(furnaceData, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors but continue with unique records
      if (error.code === 11000) {
        console.log('Some furnaces already exist, continuing...');
        return error.insertedDocs || [];
      }
      throw error;
    }
  }

  async findExistingFurnaceNos(furnaceNos: number[]): Promise<number[]> {
    const existing = await FurnaceModel.find({ furnaceNo: { $in: furnaceNos } }, 'furnaceNo').exec();
    return existing.map(f => f.furnaceNo);
  }

  async findByFurnaceNo(furnaceNo: number): Promise<IFurnace | null> {
    return await FurnaceModel.findOne({ furnaceNo }).exec();
  }

  async findAll(): Promise<IFurnace[]> {
    return await FurnaceModel.find().exec();
  }
}

class CustomerProductRepository {
  async bulkCreate(cpData: CPData[]): Promise<ICP[]> {
    try {
      return await CPModel.insertMany(cpData, { ordered: false });
    } catch (error: any) {
      // Handle duplicate key errors but continue with unique records
      if (error.code === 11000) {
        console.log('Some customer products already exist, continuing...');
        return error.insertedDocs || [];
      }
      throw error;
    }
  }

  async findExistingCPNos(cpNos: string[]): Promise<string[]> {
    const existing = await CPModel.find({ CPNo: { $in: cpNos } }, 'CPNo').exec();
    return existing.map(cp => cp.CPNo);
  }

  async findByCPNo(cpNo: string): Promise<ICP | null> {
    return await CPModel.findOne({ CPNo: cpNo }).exec();
  }

  async findAll(): Promise<ICP[]> {
    return await CPModel.find().exec();
  }
}

class ChartDetailRepository {
  async bulkCreate(chartDetailData: ChartDetailData[]): Promise<IChartDetail[]> {
    return await ChartDetailModel.insertMany(chartDetailData);
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

  async bulkCreateUniqueFurnaces(furnaceDataArray: FurnaceData[]): Promise<IFurnace[]> {
    // Extract unique furnace numbers
    const uniqueFurnaceNos = [...new Set(furnaceDataArray.map(f => f.furnaceNo))];
    console.log(`Unique furnace numbers to process: ${uniqueFurnaceNos.length}`);
    
    // Check existing furnaces
    const existingFurnaceNos = await this.furnaceRepository.findExistingFurnaceNos(uniqueFurnaceNos);
    const existingSet = new Set(existingFurnaceNos);
    
    // Filter new furnaces only
    const newFurnaceData = furnaceDataArray.filter(f => !existingSet.has(f.furnaceNo));
    const uniqueNewFurnaceData = newFurnaceData.filter((f, index, arr) => 
      arr.findIndex(item => item.furnaceNo === f.furnaceNo) === index
    );
    
    console.log(`New furnaces to insert: ${uniqueNewFurnaceData.length}`);
    
    if (uniqueNewFurnaceData.length > 0) {
      return await this.furnaceRepository.bulkCreate(uniqueNewFurnaceData);
    }
    
    return [];
  }

  async getAllFurnaces(): Promise<IFurnace[]> {
    return await this.furnaceRepository.findAll();
  }
}

class CustomerProductService {
  constructor(private cpRepository: CustomerProductRepository) {}

  async bulkCreateUniqueCustomerProducts(cpDataArray: CPData[]): Promise<ICP[]> {
    // Extract unique CP numbers
    const uniqueCPNos = [...new Set(cpDataArray.map(cp => cp.CPNo))];
    console.log(`Unique CP numbers to process: ${uniqueCPNos.length}`);
    
    // Check existing customer products
    const existingCPNos = await this.cpRepository.findExistingCPNos(uniqueCPNos);
    const existingSet = new Set(existingCPNos);
    
    // Filter new customer products only
    const newCPData = cpDataArray.filter(cp => !existingSet.has(cp.CPNo));
    const uniqueNewCPData = newCPData.filter((cp, index, arr) => 
      arr.findIndex(item => item.CPNo === cp.CPNo) === index
    );
    
    console.log(`New customer products to insert: ${uniqueNewCPData.length}`);
    
    if (uniqueNewCPData.length > 0) {
      return await this.cpRepository.bulkCreate(uniqueNewCPData);
    }
    
    return [];
  }

  async getAllCustomerProducts(): Promise<ICP[]> {
    return await this.cpRepository.findAll();
  }
}

class ChartDetailService {
  constructor(private chartDetailRepository: ChartDetailRepository) {}

  async bulkCreateChartDetails(chartDetailDataArray: ChartDetailData[]): Promise<IChartDetail[]> {
    console.log(`Chart details to insert: ${chartDetailDataArray.length}`);
    return await this.chartDetailRepository.bulkCreate(chartDetailDataArray);
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

      // 3. Bulk POST to 3 collections with unique constraints
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
      console.log('Raw JSON from API (first record):', rawData[0]);
      
      // Map data with FG_CODE encoding for both furnace and date
      const mappedData: APIResponse[] = rawData.map((record: any) => {
        // Extract FG_CODE and encode it
        const fgCode = record.FG_CHARG || '';
        const fgEncoded = FurnaceCodeEncoder.encode(1, new Date(), fgCode);
        
        return {
          lot_number: record.LotNo || '',
          furnace_number: fgEncoded.masterFurnaceNo, // Use furnace from FG_CODE
          furnace_description: record.DESC || record.DESCRIPTION || `Furnace ${fgEncoded.masterFurnaceNo}`,
          fg_code: fgCode,
          part_number: record.PART || '',
          part_name: record.PARTNAME || '',
          collected_date: fgEncoded.masterCollectedDate, // Use date from FG_CODE
          surface_hardness: this.getNestedValue(record, ["Ha@ 0", "1 min", " (MEAN)"]),
          hardness_01mm: record["Surface Hardness(ALL-MEAN)"] || 0,
          cde_x: record["Hardness Case Depth (CDE@ 513 Hmv)(X)"] || 0,
          cde_y: record["Hardness Case Depth (CDE@ 513 Hmv)(Y)"] || 0,
          core_hardness: record["Core Hardness(ALL-MEAN)"] || 0,
          compound_layer: record["Compound Layer-P1"] || 0,
          upper_spec: record.UPPER_SPEC || 100,
          lower_spec: record.LOWER_SPEC || 0,
          target_spec: record.TARGET_SPEC || 50,
          is_active: record.IS_ACTIVE || true
        };
      });
      
      console.log('Mapped data (first record):', mappedData[0]);
      console.log(`Total mapped records: ${mappedData.length}`);
      
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
  }[] {
    
    return apiData.map(record => {
      // ✅ Map to FurnaceData
      const furnaceData: FurnaceData = {
        furnaceNo: record.furnace_number,
        furnaceDescription: record.furnace_description,
        isDisplay: record.is_active,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // ✅ Map to CPData
      const cpData: CPData = {
        CPNo: record.lot_number,
        furnaceId: [], // Will be populated after furnace creation
        specifications: {
          upperSpecLimit: record.upper_spec,
          lowerSpecLimit: record.lower_spec,
          target: record.target_spec
        },
        isDisplay: record.is_active
      };

      // ✅ Map to ChartDetailData
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
            CDEY: record.cde_y
          },
          coreHardnessMean: record.core_hardness,
          compoundLayer: record.compound_layer
        }
      };

      return { furnaceData, cpData, chartDetailData };
    });
  }

  // ✅ Bulk POST to 3 collections with unique constraints
  private async bulkCreateCollections(mappedData: {
    furnaceData: FurnaceData;
    cpData: CPData;
    chartDetailData: ChartDetailData;
  }[]): Promise<{
    furnaces: IFurnace[];
    customerProducts: ICP[];
    chartDetails: IChartDetail[];
  }> {
    
    // 1. Bulk create furnaces (unique furnaceNo only)
    const furnaceDataArray = mappedData.map(m => m.furnaceData);
    const createdFurnaces = await this.furnaceService.bulkCreateUniqueFurnaces(furnaceDataArray);
    console.log(`✅ Created ${createdFurnaces.length} unique furnaces`);

    // 2. Get all existing furnaces for reference
    const allFurnaces = await this.furnaceService.getAllFurnaces();
    const furnaceMap = new Map(allFurnaces.map(f => [f.furnaceNo, f._id]));

    // 3. Update CP data with furnace IDs and bulk create (unique CPNo only)
    const cpDataArray: CPData[] = mappedData.map(m => {
      const furnaceId = furnaceMap.get(m.furnaceData.furnaceNo);
      return {
        ...m.cpData,
        furnaceId: furnaceId ? [furnaceId as Types.ObjectId] : []
      };
    });
    const createdCustomerProducts = await this.customerProductService.bulkCreateUniqueCustomerProducts(cpDataArray);
    console.log(`✅ Created ${createdCustomerProducts.length} unique customer products`);

    // 4. Bulk create chart details (all records)
    const chartDetailDataArray = mappedData.map(m => m.chartDetailData);
    const createdChartDetails = await this.chartDetailService.bulkCreateChartDetails(chartDetailDataArray);
    console.log(`✅ Created ${createdChartDetails.length} chart details`);

    return { 
      furnaces: createdFurnaces, 
      customerProducts: createdCustomerProducts, 
      chartDetails: createdChartDetails 
    };
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
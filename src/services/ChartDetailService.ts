import { ChartDetailData, ChartDetail } from "../models/entities/chartDetail";
import { ChartDetailsFiltering, FilteredResult, MRChartResult, toSpecAttribute, YAxisRange } from "../models/chartDetailFiltering";
import { Router, Request, Response } from "express";
import { chartDetailController, customerProductService } from "../utils/serviceLocator";
import { PeriodFilter } from "../utils/dataPartitionwithPeriod";
import { ChartDetailRepository } from "../repositories/chartDetailRepo";
import { any } from "zod";
import { CustomerProduct } from "../models/entities/customerProduct";

// ✅ Chart Detail Service
export class ChartDetailService {
  constructor(private chartDetailRepository: ChartDetailRepository) {}

  async bulkCreateUniqueChartDetails(chartDetailDataArray: ChartDetailData[]): Promise<ChartDetail[]> {
    // Extract unique FG numbers
    const uniqueFGNos = [...new Set(chartDetailDataArray.map(cd => cd.FGNo))];
    console.log(`Unique FG numbers to process: ${uniqueFGNos.length}`);
    
    // Check existing chart details
    const existingFGNos = await this.chartDetailRepository.findExistingFGNos(uniqueFGNos);
    const existingSet = new Set(existingFGNos);
    
    // Filter new chart details only
    const newChartDetailData = chartDetailDataArray.filter(cd => !existingSet.has(cd.FGNo));
    const uniqueNewChartDetailData = newChartDetailData.filter((cd, index, arr) => 
      arr.findIndex(item => item.FGNo === cd.FGNo) === index
    );
    
    console.log(`New chart details to insert: ${uniqueNewChartDetailData.length}`);
    
    if (uniqueNewChartDetailData.length > 0) {
      return await this.chartDetailRepository.bulkCreate(uniqueNewChartDetailData);
    }
    
    return [];
  }

  async getAllChartDetails(): Promise<ChartDetail[]> {
    return await this.chartDetailRepository.findAll();
  }

    private parseFiltersFromRequest(req: Request): ChartDetailsFiltering | undefined {
        try {
            const filters: ChartDetailsFiltering = {
                period: {
                startDate: req.query.startDate ? JSON.parse(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? JSON.parse(req.query.endDate as string) : undefined,
                },
                furnaceNo: req.query.furnaceNo ? JSON.parse(req.query.furnaceNo as string) : undefined,
                matNo: req.query.matNo as string
            };

            // Remove undefined values
            const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            return Object.keys(cleanFilters).length > 0 ? cleanFilters : undefined;
        } catch (error) {
            console.error('Error parsing filters:', error);
            throw new Error('Invalid filter parameters');
        }
    }

    // ✅ Method สำหรับ Controller เรียกใช้
    async getFilteredData(req: Request): Promise<FilteredResult<ChartDetail>> {
        try {
            const filters = this.parseFiltersFromRequest(req);
            return await this.handleDynamicFiltering(filters);
        } catch (error) {
            console.error('Error getting filtered data:', error);
            throw error;
        }
    }

    async handleDynamicFiltering(filters?: ChartDetailsFiltering): Promise<FilteredResult<ChartDetail> & { 
        summary: Array<{ furnaceNo: number; matNo: string; partName: string; count: number }> 
    }> {
        const allData = await this.chartDetailRepository.findAll();
        
        if (!filters) {
        const summary = Object.values(
        allData.reduce((acc, item) => {
            const key = `${item.chartGeneralDetail.furnaceNo}-${item.CPNo}`;
            acc[key] = acc[key]
            ? { ...acc[key], count: acc[key].count + 1 }
            : {
                furnaceNo: item.chartGeneralDetail.furnaceNo,
                matNo: item.CPNo,
                partName: item.chartGeneralDetail.partName,
                count: 1
                };
            return acc;
        }, {} as Record<string, any>)
        )

            summary.sort((a: any, b:any) => b.count - a.count)

            // ).sort((a: any, b: any) => a.furnaceNo - b.furnaceNo || a.matNo.localeCompare(b.matNo));
            
            return {
                data: allData,
                total: allData.length,
                filters: filters || {} as ChartDetailsFiltering,
                summary
            };
        }

        let filteredData = [...allData];

        // Apply filters one by one
        Object.entries(filters).forEach(([key, value]) => {
            if (this.validateApplyFilter(key, value)) {
                filteredData = this.applyFilter(filteredData, key, value);
            }
        });

        const summary = Object.values(
            filteredData.reduce((acc, item) => {
                const key = `${item.chartGeneralDetail.furnaceNo}-${item.CPNo}`;
                acc[key] = acc[key] ? 
                    { ...acc[key], count: acc[key].count + 1 } : 
                    { furnaceNo: item.chartGeneralDetail.furnaceNo,
                     matNo: item.CPNo, partName: item.chartGeneralDetail.partName, count: 1 };
                return acc;
            }, {} as Record<string, any>)
        ).sort((a: any, b: any) => b.count - a.count);
        
        return {
            data: filteredData,
            total: filteredData.length,
            filters,
            summary
        };
    }

private validateApplyFilter(key: string, value: any): boolean {
    if (value === undefined || value === null || value === '') {
        return false;
    }
    
    // Special validation for period
    if (key === 'period') {
        return value.startDate && value.endDate && 
               value.startDate !== undefined && value.endDate !== undefined;
    }
    
    return true;
}

private applyFilter(data: ChartDetail[], filterKey: string, filterValue: any): ChartDetail[] {
    switch (filterKey) {
        case 'period':
            return this.filterByPeriod(data, filterValue as PeriodFilter);
            
        case 'furnaceNo':
            return data.filter(item => 
                item.chartGeneralDetail?.furnaceNo?.toString() === filterValue?.toString()
            );
            
        case 'matNo':
            return data.filter(item => 
                item.CPNo === filterValue
            );
            
        default:
            console.warn(`Unknown filter key: ${filterKey}`);
            return data;
    }
}


    private filterByPeriod(data: ChartDetail[], period: PeriodFilter): ChartDetail[] {
        return data.filter(item => {
            try {
                // สมมติว่า IChartDetail มี field ชื่อ 'collectedDate' หรือ 'createdAt'
                const itemDateString = item.chartGeneralDetail.collectedDate;
                
                if (!itemDateString) {
                    return false; // ถ้าไม่มีวันที่ให้ skip
                }
                
                const itemDate = new Date(itemDateString);
                const startDate = new Date(period.startDate);
                const endDate = new Date(period.endDate);
                
                // ตรวจสอบว่า date ถูกต้อง
                if (isNaN(itemDate.getTime()) || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                    return false;
                }
                
                // กรองข้อมูลที่อยู่ในช่วงวันที่ (inclusive)
                return itemDate >= startDate && itemDate <= endDate;
                
            } catch (error) {
                console.error('Error filtering by period:', error);
                return false;
            }
        });
    }

    async getFilteredDataForCalculation(filters?: ChartDetailsFiltering): Promise<any> {
        try {
            const result = await this.handleDynamicFiltering(filters);
            return result;
        } catch (error) {
            throw error;
        }
    }
    
    async calculateIMRChart(req: Request): Promise<MRChartResult> {
        try {
            const spec: CustomerProduct[] = await customerProductService.getAllCustomerProducts();
            const filters = this.parseFiltersFromRequest(req);
            const dataForChart = await this.handleDynamicFiltering(filters);
            // console.log(dataForChart.total);
            
            const dataWithFurnace = dataForChart.data.map(item => ({
                furnaceNo: item.chartGeneralDetail?.furnaceNo,
                hardness: item.machanicDetail?.surfaceHardnessMean,
                cde: item.machanicDetail?.CDE.CDEX,
                cdt: item.machanicDetail?.CDE.CDTX,
                date: item.chartGeneralDetail?.collectedDate
            }));

            // console.log(dataForChart.total);

            const validHardnessData = dataWithFurnace.filter(item => 
                item.hardness !== undefined && 
                item.hardness !== null && 
                !isNaN(item.hardness)
            );

            const validCdeData = dataWithFurnace.filter(item => 
                item.cde !== undefined && 
                item.cde !== null && 
                !isNaN(item.cde)
            );

            const validCdtData = dataWithFurnace.filter(item => 
                item.cdt !== undefined && 
                item.cdt !== null && 
                !isNaN(item.cdt)
            );
            
            if (validHardnessData.length < 2) {
                throw new Error('ไม่สามารถแสดงแผนภูมิควบคุมได้ เนื่องจากข้อมูลน้อยกว่า 2 รายการ');
            }
            
            const hardnessValues = validHardnessData.map(item => item.hardness);
            // console.log('Hardness values:', hardnessValues.length);
            // console.log('Hardness values:', hardnessValues);
            const cdeValues = validCdeData.map(item => item.cde);
            const cdtValues = validCdtData.map(item => item.cdt);

            
            const average = parseFloat((hardnessValues.reduce((sum, value) => sum + value, 0) / hardnessValues.length).toFixed(3));
            // console.log('Average:', average);
            const cdeAverage = parseFloat((cdeValues.reduce((sum, value) => sum + value, 0) / cdeValues.length).toFixed(3));
            const cdtAverage = parseFloat((cdtValues.reduce((sum, value) => sum + value, 0) / cdtValues.length).toFixed(3));

            const movingRanges = hardnessValues
                .slice(1)
                .map((value, index) => +Math.abs(value - hardnessValues[index]).toFixed(3));

            const cdeMovingRanges = cdeValues
                .slice(1)
                .map((value, index) => +Math.abs(value - cdeValues[index]).toFixed(3));

            const cdtMovingRanges = cdtValues
                .slice(1)
                .map((value, index) => +Math.abs(value - cdtValues[index]).toFixed(3));
            
            const mrAverage = parseFloat((movingRanges.reduce((sum, value) => sum + value, 0) / movingRanges.length).toFixed(3));
            // console.log('Moving Ranges:', movingRanges.length);
            // console.log('Moving Ranges List:', movingRanges);
            // console.log('MR Average:', mrAverage);
            const cdeMrAverage = parseFloat((cdeMovingRanges.reduce((sum, value) => sum + value, 0) / cdeMovingRanges.length).toFixed(3));
            const cdtMrAverage = parseFloat((cdtMovingRanges.reduce((sum, value) => sum + value, 0) / cdtMovingRanges.length).toFixed(3));

            const iChartUCL = parseFloat((average + (2.660 * mrAverage)).toFixed(3));
            const iChartLCL = parseFloat((average - (2.660 * mrAverage)).toFixed(3));

            const cdeIChartUCL = parseFloat((cdeAverage + (2.660 * cdeMrAverage)).toFixed(3));
            const cdeIChartLCL = parseFloat((cdeAverage - (2.660 * cdeMrAverage)).toFixed(3));

            const cdtIChartUCL = parseFloat((cdtAverage + (2.660 * cdtMrAverage)).toFixed(3));
            const cdtIChartLCL = parseFloat((cdtAverage - (2.660 * cdtMrAverage)).toFixed(3));

            const sigmaStdIchart = parseFloat((mrAverage/1.128).toFixed(3));
            const cdeSigmaStdIchart = parseFloat((cdeMrAverage/1.128).toFixed(3));
            const cdtSigmaStdIchart = parseFloat((cdtMrAverage/1.128).toFixed(3));

            const iChartSigma = { 
                sigmaMinus3: iChartLCL, 
                sigmaMinus2: iChartLCL + sigmaStdIchart, 
                sigmaMinus1: iChartLCL + (sigmaStdIchart * 2 ), 
                sigmaPlus1: iChartUCL - (sigmaStdIchart * 2 ), 
                sigmaPlus2: iChartUCL - sigmaStdIchart, 
                sigmaPlus3: iChartUCL 
            };

            const cdeIChartSigma = { 
                sigmaMinus3: cdeIChartLCL, 
                sigmaMinus2:cdeIChartLCL + cdeSigmaStdIchart, 
                sigmaMinus1: cdeIChartLCL + (cdeSigmaStdIchart * 2 ), 
                sigmaPlus1: cdeIChartUCL - (cdeSigmaStdIchart * 2 ), 
                sigmaPlus2: cdeIChartUCL - cdeSigmaStdIchart, 
                sigmaPlus3: cdeIChartUCL 
            };

            const cdtIChartSigma = { 
                sigmaMinus3: cdtIChartLCL, 
                sigmaMinus2:cdtIChartLCL + cdtSigmaStdIchart, 
                sigmaMinus1: cdtIChartLCL + (cdtSigmaStdIchart * 2 ), 
                sigmaPlus1: cdtIChartUCL - (cdtSigmaStdIchart * 2 ), 
                sigmaPlus2: cdtIChartUCL - cdtSigmaStdIchart, 
                sigmaPlus3: cdtIChartUCL 
            };

            const mrChartUCL     = parseFloat((3.267 * mrAverage).toFixed(3));
            const mrChartLCL     = 0;

            const cdeMrChartUCL  = parseFloat((3.267 * cdeMrAverage).toFixed(3));
            const cdeMrChartLCL  = 0;

            const cdtMrChartUCL  = parseFloat((3.267 * cdtMrAverage).toFixed(3));
            const cdtMrChartLCL  = 0;

            const selectedMaterialNo = filters?.matNo ?? "";

            // Handle empty material number
            let matchedProduct: CustomerProduct | undefined;
            let specAttribute;

            if (selectedMaterialNo && selectedMaterialNo.trim() !== "") {
                matchedProduct = spec.find(cp => cp.CPNo === selectedMaterialNo);
                specAttribute = matchedProduct ? toSpecAttribute(matchedProduct) : {};
            } else {
                // No material selected, use default/empty spec
                specAttribute = {};
            }

            const yAxisRange = this.computeYAxisRange({
            hardnessValues,
            cdeValues,
            cdtValues,
            mrSpots: movingRanges,
            cdeMrSpots: cdeMovingRanges,
            cdtMrSpots: cdtMovingRanges,
            iUCL: iChartUCL, iLCL: iChartLCL, mrUCL: mrChartUCL,
            cdeIUCL: cdeIChartUCL, cdeILCL: cdeIChartLCL, cdeMrUCL: cdeMrChartUCL,
            cdtIUCL: cdtIChartUCL, cdtILCL: cdtIChartLCL, cdtMrUCL: cdtMrChartUCL,
            specAttribute
            });

            const result: MRChartResult = {
                numberOfSpots: dataForChart.total,
                average: Number(average.toFixed(3)),
                cdeAverage: Number(cdeAverage.toFixed(3)),
                cdtAverage: Number(cdtAverage.toFixed(3)),
                MRAverage: Number(mrAverage.toFixed(3)),
                cdeMRAverage: Number(cdeMrAverage.toFixed(3)),
                cdtMRAverage:Number(cdtMrAverage.toFixed(3)),
                controlLimitIChart: {
                    CL: Number(average.toFixed(3)),
                    UCL: Number(iChartUCL.toFixed(3)),
                    LCL: Number(iChartLCL.toFixed(3))
                },
                cdeControlLimitIChart: {
                    CL: Number(cdeAverage.toFixed(3)),
                    UCL: Number(cdeIChartUCL.toFixed(3)),
                    LCL: Number(cdeIChartLCL.toFixed(3))
                },
                cdtControlLimitIChart: {
                    CL: Number(cdtAverage.toFixed(3)),
                    UCL: Number(cdtIChartUCL.toFixed(3)),
                    LCL: Number(cdtIChartLCL.toFixed(3))
                },
                sigmaIChart: {
                    sigmaMinus3: Number(iChartSigma.sigmaMinus3.toFixed(3)),
                    sigmaMinus2: Number(iChartSigma.sigmaMinus2.toFixed(3)),
                    sigmaMinus1: Number(iChartSigma.sigmaMinus1.toFixed(3)),
                    sigmaPlus1: Number(iChartSigma.sigmaPlus1.toFixed(3)),
                    sigmaPlus2: Number(iChartSigma.sigmaPlus2.toFixed(3)),
                    sigmaPlus3: Number(iChartSigma.sigmaPlus3.toFixed(3))
                },
                cdeSigmaIChart: {
                    sigmaMinus3: Number(cdeIChartSigma.sigmaMinus3.toFixed(3)),
                    sigmaMinus2: Number(cdeIChartSigma.sigmaMinus2.toFixed(3)),
                    sigmaMinus1: Number(cdeIChartSigma.sigmaMinus1.toFixed(3)),
                    sigmaPlus1: Number(cdeIChartSigma.sigmaPlus1.toFixed(3)),
                    sigmaPlus2: Number(cdeIChartSigma.sigmaPlus2.toFixed(3)),
                    sigmaPlus3: Number(cdeIChartSigma.sigmaPlus3.toFixed(3))
                },
                cdtSigmaIChart: {
                    sigmaMinus3: Number(cdtIChartSigma.sigmaMinus3.toFixed(3)),
                    sigmaMinus2: Number(cdtIChartSigma.sigmaMinus2.toFixed(3)),
                    sigmaMinus1: Number(cdtIChartSigma.sigmaMinus1.toFixed(3)),
                    sigmaPlus1: Number(cdtIChartSigma.sigmaPlus1.toFixed(3)),
                    sigmaPlus2: Number(cdtIChartSigma.sigmaPlus2.toFixed(3)),
                    sigmaPlus3: Number(cdtIChartSigma.sigmaPlus3.toFixed(3))
                },
                controlLimitMRChart: {
                    CL: Number(mrAverage.toFixed(3)),
                    UCL: Number(mrChartUCL.toFixed(3)),
                    LCL: Number(mrChartLCL.toFixed(3))
                },
                cdeControlLimitMRChart: {
                    CL: Number(cdeMrAverage.toFixed(3)),
                    UCL: Number(cdeMrChartUCL.toFixed(3)),
                    LCL: Number(cdeMrChartLCL.toFixed(3))
                },
                cdtControlLimitMRChart: {
                    CL: Number(cdtMrAverage.toFixed(3)),
                    UCL: Number(cdtMrChartUCL.toFixed(3)),
                    LCL: Number(cdtMrChartLCL.toFixed(3))
                },
                surfaceHardnessChartSpots: hardnessValues ,
                cdeChartSpots: cdeValues,
                cdtChartSpots: cdtValues,
                mrChartSpots: movingRanges,
                cdeMrChartSpots: cdeMovingRanges,
                cdtMrChartSpots: cdtMovingRanges,
                specAttribute,
                yAxisRange: yAxisRange
            };
           
            console.log('I-MR Chart Calculation Results:', result);
            console.log('hardness value:', hardnessValues);
            return result;
            
        } catch (error) {
            console.error('Calculate IMR error:', error);
            throw ('Calculate IMR error: founded less than 2 records');
        }
    }

    private pickMax(...vals: Array<number | null | undefined>): number {
    const nums = vals.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    return nums.length ? Math.max(...nums) : 0;
    }

    private pickMin(...vals: Array<number | null | undefined>): number {
    const nums = vals.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
    return nums.length ? Math.min(...nums) : 0;
    }

    private arrMax(arr: number[]): number {
    const nums = arr.filter(Number.isFinite);
    return nums.length ? Math.max(...nums) : 0;
    }

    private arrMin(arr: number[]): number {
    const nums = arr.filter(Number.isFinite);
    return nums.length ? Math.min(...nums) : 0;
    }

    private computeYAxisRange(params: {
    hardnessValues: number[];
    cdeValues: number[];
    cdtValues: number[];
    mrSpots: number[];
    cdeMrSpots: number[];
    cdtMrSpots: number[];
    iUCL: number;  iLCL: number;   mrUCL: number;
    cdeIUCL: number; cdeILCL: number; cdeMrUCL: number;
    cdtIUCL: number; cdtILCL: number; cdtMrUCL: number;
    specAttribute: {
        surfaceHardnessUpperSpec?: number;
        surfaceHardnessLowerSpec?: number;
        cdeUpperSpec?: number;
        cdeLowerSpec?: number;
        cdtUpperSpec?: number;
        cdtLowerSpec?: number;
        // any other fields are ignored
    };
    }): YAxisRange {
    const {
        hardnessValues, cdeValues, cdtValues,
        mrSpots, cdeMrSpots, cdtMrSpots,
        iUCL, iLCL, mrUCL,
        cdeIUCL, cdeILCL, cdeMrUCL,
        cdtIUCL, cdtILCL, cdtMrUCL,
        specAttribute
    } = params;

    const maxHardSpot = this.arrMax(hardnessValues);
    const minHardSpot = this.arrMin(hardnessValues);

    const maxCdeSpot  = this.arrMax(cdeValues);
    const minCdeSpot  = this.arrMin(cdeValues);

    const maxCdtSpot  = this.arrMax(cdtValues);
    const minCdtSpot  = this.arrMin(cdtValues);

    const maxMrSpot   = this.arrMax(mrSpots);
    const maxCdeMr    = this.arrMax(cdeMrSpots);
    const maxCdtMr    = this.arrMax(cdtMrSpots);

    return {
        // Surface Hardness I-Chart
        maxYsurfaceHardnessControlChart: this.pickMax(
        maxHardSpot,
        iUCL,
        specAttribute.surfaceHardnessUpperSpec
        ),
        minYsurfaceHardnessControlChart: this.pickMin(
        minHardSpot,
        iLCL,
        specAttribute.surfaceHardnessLowerSpec
        ),

        // Surface Hardness MR-Chart
        maxYsurfaceHardnessMrChart: this.pickMax(
        maxMrSpot,
        mrUCL
        ),

        // CDE I-Chart
        maxYcdeControlChart: this.pickMax(
        maxCdeSpot,
        cdeIUCL,
        specAttribute.cdeUpperSpec
        ),
        minYcdeControlChart: this.pickMin(
        minCdeSpot,
        cdeILCL,
        specAttribute.cdeLowerSpec
        ),

        // CDE MR-Chart
        maxYcdeMrChart: this.pickMax(
        maxCdeMr,
        cdeMrUCL
        ),

        // CDT I-Chart
        maxYcdtControlChart: this.pickMax(
        maxCdtSpot,
        cdtIUCL,
        specAttribute.cdtUpperSpec
        ),
        minYcdtControlChart: this.pickMin(
        minCdtSpot,
        cdtILCL,
        specAttribute.cdtLowerSpec
        ),

        // CDT MR-Chart
        maxYcdtMrChart: this.pickMax(
        maxCdtMr,
        cdtMrUCL
        ),
    };
    }

}
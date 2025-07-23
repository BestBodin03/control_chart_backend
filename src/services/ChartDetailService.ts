import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { IChartDetailsFiltering, FilteredResult } from "../models/ChartDetailFiltering";
import { ChartDetailRepository } from "../repositories/ChartDetailRepo";
import { Router, Request, Response } from "express";
import { chartDetailController } from "../utils/serviceLocator";

// ✅ Chart Detail Service
export class ChartDetailService {
  constructor(private chartDetailRepository: ChartDetailRepository) {}

  async bulkCreateUniqueChartDetails(chartDetailDataArray: ChartDetailData[]): Promise<IChartDetail[]> {
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

  async getAllChartDetails(): Promise<IChartDetail[]> {
    return await this.chartDetailRepository.findAll();
  }

    parseFiltersFromRequest(req: Request): IChartDetailsFiltering | undefined {
        try {
            const filters: IChartDetailsFiltering = {
                period: req.query.period ? JSON.parse(req.query.period as string) : undefined,
                furnaceNo: req.query.furnaceNo ? Number(req.query.furnaceNo) : 0,
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
    async getFilteredData(req: Request): Promise<FilteredResult<IChartDetail>> {
        try {
            const filters = this.parseFiltersFromRequest(req);
            return await this.handleDynamicFiltering(filters);
        } catch (error) {
            console.error('Error getting filtered data:', error);
            throw error;
        }
    }

    // ✅ Method เดิมยังคงอยู่สำหรับใช้ภายใน
    async handleDynamicFiltering(filters?: IChartDetailsFiltering): Promise<FilteredResult<IChartDetail>> {
        // ... existing implementation
        const allData = await this.chartDetailRepository.findAll();
        
        if (!filters) {
            return {
                data: allData,
                total: allData.length,
                filters: filters || {} as IChartDetailsFiltering
            };
        }

        let filteredData = [...allData];

        if (filters.period) {
            filteredData = this.filterByPeriod(filteredData, filters.period);
        }

        if (filters.furnaceNo !== undefined) {
            filteredData = filteredData.filter(item => item.chartGeneralDetail.furnaceNo === filters.furnaceNo);
        }

        if (filters.matNo) {
            filteredData = filteredData.filter(item => item.CPNo === filters.matNo);
        }

        return {
            data: filteredData,
            total: filteredData.length,
            filters
        };
    }

    private filterByPeriod(data: IChartDetail[], period: any): IChartDetail[] {
        return data.filter(item => {
            // Add your period filtering logic here
            return true;
        });
    }

    async getFilteredDataForCalculation(filters?: IChartDetailsFiltering): Promise<any> {
        try {
            // Logic การกรอง data (ย้ายมาจาก controller)
            const result = await this.handleDynamicFiltering(filters);
            return result;
        } catch (error) {
            throw error;
        }
    }

    async calculateIMRChart(req: Request): Promise<any[]> {
        try {
            const filters = this.parseFiltersFromRequest(req);
            const dataForChart = await this.handleDynamicFiltering(filters);
            console.log(dataForChart.total);
            
            const dataWithFurnace = dataForChart.data.map(item => ({
                furnaceNo: item.chartGeneralDetail?.furnaceNo,
                hardness: item.machanicDetail?.surfaceHardnessMean,
                date: item.chartGeneralDetail?.collectedDate
            }));

            console.log(dataForChart.total);

            // Filter valid data
            const validHardnessData = dataWithFurnace.filter(item => 
                item.hardness !== undefined && 
                item.hardness !== null && 
                !isNaN(item.hardness)
            );
            
            if (validHardnessData.length < 2) {
                throw new Error('Need at least 2 data points for I-MR Chart calculation');
            }
            
            // ✅ Extract hardness values
            const hardnessValues = validHardnessData.map(item => item.hardness);
            console.log('Hardness values:', hardnessValues.length);
            console.log('Hardness values:', hardnessValues);
            
            // ✅ คำนวณ Average
            const average = parseFloat((hardnessValues.reduce((sum, value) => sum + value, 0) / hardnessValues.length).toFixed(3));
            console.log('Average:', average);
            
            // ✅ คำนวณ Moving Range และ MR Average
            const movingRanges: number[] = [];
            for (let i = 1; i < hardnessValues.length; i++) {
                const mr = Math.abs(hardnessValues[i] - hardnessValues[i - 1]);
                movingRanges.push(mr);
            }
            
            const mrAverage = parseFloat((movingRanges.reduce((sum, value) => sum + value, 0) / movingRanges.length).toFixed(3));
            console.log('Moving Ranges:', movingRanges.length);
            console.log('MR Average:', mrAverage);
            
            // ✅ คำนวณ Control Limits สำหรับ I-Chart
            const iChartUCL = parseFloat((average + (2.660 * mrAverage)).toFixed(3));
            const iChartLCL = parseFloat((average - (2.660 * mrAverage)).toFixed(3));

            const sigmaStdIchart = parseFloat((mrAverage/1.128).toFixed(3));
            
            // ✅ คำนวณ Sigma Lines สำหรับ I-Chart
            const iChartSigma = {
                sigmaMinus3: iChartLCL,
                sigmaMinus2: iChartLCL + sigmaStdIchart,
                sigmaMinus1: iChartLCL + (sigmaStdIchart * 2 ),
                sigmaPlus1: iChartUCL - (sigmaStdIchart * 2 ),
                sigmaPlus2: iChartUCL - sigmaStdIchart,
                sigmaPlus3: iChartUCL
            };
            
            // ✅ คำนวณ Control Limits สำหรับ MR-Chart
            // MR Chart: UCL = 3.267 * MRAverage, LCL = 0 (หรือไม่แสดง)
            const mrChartUCL = parseFloat((3.267 * mrAverage).toFixed(3));
            const mrChartLCL = 0; // MR Chart LCL มักจะเป็น 0
            
            // ✅ คำนวณ Sigma Lines สำหรับ MR-Chart
            // สำหรับ MR Chart ใช้สูตรต่างจาก I-Chart
            
            // ✅ สร้าง Response ตามรูปแบบที่ต้องการ
            const result = [{
                average: Number(average.toFixed(3)),
                MRAverage: Number(mrAverage.toFixed(3)),
                controlLimitIChart: {
                    CL: Number(average.toFixed(3)),
                    UCL: Number(iChartUCL.toFixed(3)),
                    LCL: Number(iChartLCL.toFixed(3))
                },
                sigmaIChart: {
                    sigmaMinus3: Number(iChartSigma.sigmaMinus3.toFixed(3)),
                    sigmaMinus2: Number(iChartSigma.sigmaMinus2.toFixed(3)),
                    sigmaMinus1: Number(iChartSigma.sigmaMinus1.toFixed(3)),
                    sigmaPlus1: Number(iChartSigma.sigmaPlus1.toFixed(3)),
                    sigmaPlus2: Number(iChartSigma.sigmaPlus2.toFixed(3)),
                    sigmaPlus3: Number(iChartSigma.sigmaPlus3.toFixed(3))
                },
                controlLimitMRChart: {
                    CL: Number(mrAverage.toFixed(3)),
                    UCL: Number(mrChartUCL.toFixed(3)),
                    LCL: Number(mrChartLCL.toFixed(3))
                }
            }];
            
            console.log('I-MR Chart Calculation Results:', result);
            return result;
            
        } catch (error) {
            console.error('Calculate IMR error:', error);
            throw error;
        }
    }
}
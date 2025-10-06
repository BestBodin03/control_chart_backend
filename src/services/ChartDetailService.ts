import { ChartDetailData, ChartDetail } from "../models/entities/chartDetail";
import { Router, Request, Response } from "express";
import { chartDetailController, customerProductService } from "../utils/serviceLocator";
import { PeriodFilter } from "../utils/dataPartitionwithPeriod";
import { ChartDetailRepository } from "../repositories/chartDetailRepo";
import { any } from "zod";
import { CustomerProduct } from "../models/entities/customerProduct";
import { R3Result, TrendSegment } from "../models/types/nelsonRule3";
import { R1Result } from "../models/types/nelsonRule1";
import { SecondChartSelected, Specs } from "../models/types/controlChart";
import { PeriodType } from "../models/enums/periodType";
import { furnaceMaterialCacheService } from "./furnaceMaterialCacheService";
import { ChartDetailsFiltering, FilteredResult, MRChartResult, 
    toSpecAttribute, ChartPoints, YAxisRange, DataPoint } from "../models/chartDetailFiltering";
import { calculateChartDetailsService } from "./calculateChartDetailsService";
import { toDTO, ChartDetailDTO } from "../models/types/chartDetailDto";

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


/* 
   =============================================================
   =                Chart Detail Filtering                     =
   =============================================================
*/

    async getAllChartDetails(): Promise<ChartDetail[]> {
        return await this.chartDetailRepository.findAll();
    }

    private parseFiltersFromRequest(req: Request): ChartDetailsFiltering | undefined{
        try {
            const filters: ChartDetailsFiltering = {
                period: {
                startDate: req.query.startDate ? JSON.parse((req.query.startDate).toString()) : undefined,
                endDate: req.query.endDate ? JSON.parse(req.query.endDate.toString()) : undefined,
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

    // For Filter Chart Detail
    async getFilteredData(req: Request): Promise<FilteredResult<ChartDetailDTO>> {
        try {
            const filters = this.parseFiltersFromRequest(req);
            console.log('Parsed Filters:', filters);
            return await this.handleDynamicFiltering(filters);
        } catch (error) {
            console.error('Error getting filtered data:', error);
            throw error;
        }
    }
    // For Filter Chart Detail

    async handleDynamicFiltering(
        filters?: ChartDetailsFiltering
        ): Promise<FilteredResult<ChartDetailDTO> & {
        summary: Array<{ furnaceNo: number; matNo: string; partName: string; count: number }>;
        }> {
        // 1) get docs (mongoose documents)
        const allDocs = await this.chartDetailRepository.findAll(); // ChartDetail[]

        // helper
        const num = (v?: number | null) => (v ?? 0);

        // 2) no filters → just return all as DTO + summary
        if (!filters) {
            const dtoAll: ChartDetailDTO[] = allDocs.map(toDTO);

                const summary = Object.values(
                    dtoAll.reduce((acc, item) => {
                        const key = `${item.chartGeneralDetail.furnaceNo}-${item.CPNo}`;
                        acc[key] = acc[key] ? 
                            { ...acc[key], count: acc[key].count + 1 } : 
                            { furnaceNo: item.chartGeneralDetail.furnaceNo,
                            matNo: item.CPNo, partName: item.chartGeneralDetail.partName, count: 1 };
                        return acc;
                    }, {} as Record<string, any>)
                ).sort((a: any, b: any) => b.count - a.count);

            return {
            data: [...dtoAll].reverse(),
            total: dtoAll.length,
            filters: (filters ?? {}) as ChartDetailsFiltering,
            summary,
            };
        }
        // console.log(this.validateApplyFilter('period', filters.period));

        // 3) apply filters on documents
        let filteredDocs = [...allDocs];
        Object.entries(filters).forEach(([key, value]) => {
            if (this.validateApplyFilter(key, value)) {
            filteredDocs = this.applyFilter(filteredDocs, key, value);
            }
        });

        // 4) compute averages on the filtered set (including zeros)
        const surfaceHardnessList = filteredDocs.map(d => d.machanicDetail.surfaceHardnessMean);
        const surfaceHardnessAvg =
            surfaceHardnessList.reduce((acc, v) => acc + num(v), 0) / (surfaceHardnessList.length || 1);

        const compoundLayerList = filteredDocs.map(d => d.machanicDetail.compoundLayer);
        const compoundLayerAvg =
            compoundLayerList.reduce((acc, v) => acc + num(v), 0) / (compoundLayerList.length || 1);

        const cdeList = filteredDocs.map(d => d.machanicDetail.CDE?.CDEX);
        const cdeAvg =
            cdeList.reduce((acc, v) => acc + num(v), 0) / (cdeList.length || 1);

        const cdtList = filteredDocs.map(d => d.machanicDetail.CDE?.CDTX);
        const cdtAvg =
            cdtList.reduce((acc, v) => acc + num(v), 0) / (cdtList.length || 1);

        const hasFurnace = !!filters.furnaceNo && `${filters.furnaceNo}`.trim() !== '';
        const hasMat     = !!filters.matNo && `${filters.matNo}`.trim() !== '';
        const strictMode = hasFurnace || hasMat;

        const eps = 1e-9;
        const isZero = (n: number) => Math.abs(n) <= eps;

        const shouldDropStrict = (d: ChartDetail) =>
        (surfaceHardnessAvg > eps && isZero(num(d.machanicDetail.surfaceHardnessMean))) ||
        (compoundLayerAvg  > eps && isZero(num(d.machanicDetail.compoundLayer))) ||
        (cdeAvg            > eps && isZero(num(d.machanicDetail.CDE?.CDEX))) ||
        (cdtAvg            > eps && isZero(num(d.machanicDetail.CDE?.CDTX)));

        const shouldDropLenient = (d: ChartDetail) => {
        const zSH = surfaceHardnessAvg > eps && isZero(num(d.machanicDetail.surfaceHardnessMean));
        const zCL = compoundLayerAvg  > eps && isZero(num(d.machanicDetail.compoundLayer));
        const zCE = cdeAvg            > eps && isZero(num(d.machanicDetail.CDE?.CDEX));
        const zCT = cdtAvg            > eps && isZero(num(d.machanicDetail.CDE?.CDTX));
        // กรองทิ้งเฉพาะเคสที่ “ทุกค่าเป็น 0”
        return zSH && zCL && zCE && zCT;
        };

        const shouldDrop = strictMode ? shouldDropStrict : shouldDropLenient;

        const keptDocs = filteredDocs.filter(d => !shouldDrop(d));


        const filteredDataDTO: ChartDetailDTO[] = keptDocs.map(toDTO);

        // console.log(filteredDataDTO);

                const summary = Object.values(
                    filteredDataDTO.reduce((acc, item) => {
                        const key = `${item.chartGeneralDetail.furnaceNo}-${item.CPNo}`;
                        acc[key] = acc[key] ? 
                            { ...acc[key], count: acc[key].count + 1 } : 
                            { furnaceNo: item.chartGeneralDetail.furnaceNo,
                            matNo: item.CPNo, partName: item.chartGeneralDetail.partName, count: 1 };
                        return acc;
                    }, {} as Record<string, any>)
                ).sort((a: any, b: any) => b.count - a.count);

        return {
            data: [...filteredDataDTO].reverse(),
            total: filteredDataDTO.length,
            filters,
            summary,
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
                if (isNaN(itemDate.getTime()) || isNaN(startDate.getTime()) || 
                isNaN(endDate.getTime())) {
                    return false;
                }
                
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

/* 
   =============================================================
   =                Chart Detail Filtering                     =
   =============================================================
*/

    async calculateIMRChart(req: Request): Promise<MRChartResult> {
        try {
            const spec: CustomerProduct[] = await customerProductService.getAllCustomerProducts();
            const filters = this.parseFiltersFromRequest(req);
            const dataForChart = await this.handleDynamicFiltering(filters);
            // console.log(dataForChart.total);

            const dataWithFurnace = dataForChart.data.map(item => ({
                fgNo: item.FGNo,
                furnaceNo: item.chartGeneralDetail?.furnaceNo,
                hardness: item.machanicDetail?.surfaceHardnessMean,
                compoundLayer: item.machanicDetail?.compoundLayer,
                cde: item.machanicDetail?.CDE.CDEX,
                cdt: item.machanicDetail?.CDE.CDTX,
                date: item.chartGeneralDetail?.collectedDate
            })); //CORRECT

            // console.log('The Data for Calculate', dataForChart.data);

            // console.log(dataWithFurnace);

            const validHardnessData = dataWithFurnace.filter(item => 
                item.hardness !== undefined && 
                item.hardness !== null && 
                !isNaN(item.hardness)
            );

            const validCompoundLayerData = dataWithFurnace.filter(item => 
                item.compoundLayer !== undefined && 
                item.compoundLayer !== null && 
                !isNaN(item.compoundLayer)
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
            
            if (validHardnessData.length < 5) {
                throw new Error('ไม่สามารถแสดงแผนภูมิควบคุมได้ เนื่องจากข้อมูลน้อยกว่า 5 รายการ');
            }
            
            const hardnessValues = validHardnessData.map(item => item.hardness);
            const hardnessDates = validHardnessData.map(item => new Date(item.date));
            const hardnessFgNo = validCdeData.map(item => item.fgNo);

            const compoundLayerValues = validCompoundLayerData.map(item => item.compoundLayer);
            const compoundLayerDates = validCompoundLayerData.map(item => new Date(item.date));
            const compoundLayerFgNo = validCompoundLayerData.map(item => item.fgNo);

            const cdeValues = validCdeData.map(item => item.cde);
            const cdeDates = validCdeData.map(item => new Date(item.date));
            const cdeFgNo = validCdeData.map(item => item.fgNo)

            const cdtValues = validCdtData.map(item => item.cdt);
            const cdtDates = validCdtData.map(item => new Date(item.date));
            const cdtFgNo = validCdtData.map(item => item.fgNo);

            console.log(compoundLayerValues);

            const average = parseFloat((hardnessValues.reduce((sum, value) => sum + value, 0) / hardnessValues.length).toFixed(3));
            // console.log('Average:', average);
            const compoundLayerAverage = parseFloat((compoundLayerValues.reduce((sum, value) =>
                 sum + value, 0) / compoundLayerValues.length).toFixed(3));
            const cdeAverage = parseFloat((cdeValues.reduce((sum, value) =>
                 sum + value, 0) / cdeValues.length).toFixed(3));
            const cdtAverage = parseFloat((cdtValues.reduce((sum, value) =>
                 sum + value, 0) / cdtValues.length).toFixed(3));

            const movingRanges = hardnessValues
                .slice(1)
                .map((value, index) => +Math.abs(value - hardnessValues[index]).toFixed(3));

            const compoundLayerMovingRanges = compoundLayerValues
                .slice(1)
                .map((value, index) => +Math.abs(value - compoundLayerValues[index]).toFixed(3));

            const cdeMovingRanges = cdeValues
                .slice(1)
                .map((value, index) => +Math.abs(value - cdeValues[index]).toFixed(3));

            const cdtMovingRanges = cdtValues
                .slice(1)
                .map((value, index) => +Math.abs(value - cdtValues[index]).toFixed(3));
            
            const mrAverage = parseFloat((movingRanges.reduce((sum, value) =>
                 sum + value, 0) / movingRanges.length).toFixed(3));
            const compoundLayerMrAverage = parseFloat((compoundLayerMovingRanges.reduce((sum, value) =>
                 sum + value, 0) / compoundLayerMovingRanges.length).toFixed(3));
            // console.log('Moving Ranges:', movingRanges.length);
            // console.log('Moving Ranges List:', movingRanges);
            // console.log('MR Average:', mrAverage);
            const cdeMrAverage = parseFloat((cdeMovingRanges.reduce((sum, value) => sum + value, 0) 
                / cdeMovingRanges.length).toFixed(3));
            const cdtMrAverage = parseFloat((cdtMovingRanges.reduce((sum, value) => sum + value, 0) 
                / cdtMovingRanges.length).toFixed(3));

            const iChartUCL = parseFloat((average + (2.660 * mrAverage)).toFixed(3));
            const iChartLCL = parseFloat((average - (2.660 * mrAverage)).toFixed(3));

            const compoundLayerIChartUCL = parseFloat((compoundLayerAverage + 
                (2.660 * compoundLayerMrAverage)).toFixed(3));
            const compoundLayerIChartLCL = parseFloat((compoundLayerAverage - 
                (2.660 * compoundLayerMrAverage)).toFixed(3));

            const cdeIChartUCL = parseFloat((cdeAverage + (2.660 * cdeMrAverage)).toFixed(3));
            const cdeIChartLCL = parseFloat((cdeAverage - (2.660 * cdeMrAverage)).toFixed(3));

            const cdtIChartUCL = parseFloat((cdtAverage + (2.660 * cdtMrAverage)).toFixed(3));
            const cdtIChartLCL = parseFloat((cdtAverage - (2.660 * cdtMrAverage)).toFixed(3));

            const sigmaStdIchart = parseFloat((mrAverage/1.128).toFixed(3));
            const compoundLayerSigmaStdIchart = parseFloat((compoundLayerMrAverage/1.128).toFixed(3));
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

            const compoundLayerIChartSigma = { 
                sigmaMinus3: compoundLayerIChartLCL, 
                sigmaMinus2:compoundLayerIChartLCL + compoundLayerSigmaStdIchart, 
                sigmaMinus1: compoundLayerIChartLCL + (compoundLayerSigmaStdIchart * 2 ), 
                sigmaPlus1: compoundLayerIChartUCL - (compoundLayerSigmaStdIchart * 2 ), 
                sigmaPlus2: compoundLayerIChartUCL - compoundLayerSigmaStdIchart, 
                sigmaPlus3: compoundLayerIChartUCL 
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

            const compoundLayerMrChartUCL  = parseFloat((3.267 * compoundLayerMrAverage).toFixed(3));
            const compoundLayerMrChartLCL  = 0;

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
            compoundLayerValues,
            cdeValues,
            cdtValues,
            mrSpots: movingRanges,
            compoundLayerMrSpots: compoundLayerMovingRanges,
            cdeMrSpots: cdeMovingRanges,
            cdtMrSpots: cdtMovingRanges,
            iUCL: iChartUCL, iLCL: iChartLCL, mrUCL: mrChartUCL,
            compoundLayerIUCL: compoundLayerIChartUCL,
            compoundLayerILCL: compoundLayerIChartLCL, 
            compoundLayerMrUCL: compoundLayerMrChartUCL,
            cdeIUCL: cdeIChartUCL, cdeILCL: cdeIChartLCL, cdeMrUCL: cdeMrChartUCL,
            cdtIUCL: cdtIChartUCL, cdtILCL: cdtIChartLCL, cdtMrUCL: cdtMrChartUCL,
            specAttribute
            });

            // NELSON RULE CHECKER //
            // 1) control limit + spec ของแต่ละซีรีส์
            const hardnessCtrl = { CL: average, UCL: iChartUCL, LCL: iChartLCL };
            const hardnessSpec = {
            USL: specAttribute.surfaceHardnessUpperSpec,
            LSL: specAttribute.surfaceHardnessLowerSpec,
            };

            const compoundCtrl = { CL: compoundLayerAverage, UCL: compoundLayerIChartUCL, LCL: compoundLayerIChartLCL };
            const compoundSpec = {
            USL: specAttribute.compoundLayerUpperSpec,
            LSL: specAttribute.compoundLayerLowerSpec,
            };

            const cdeCtrl = { CL: cdeAverage, UCL: cdeIChartUCL, LCL: cdeIChartLCL };
            const cdeSpec = {
            USL: specAttribute.cdeUpperSpec,
            LSL: specAttribute.cdeLowerSpec,
            };

            const cdtCtrl = { CL: cdtAverage, UCL: cdtIChartUCL, LCL: cdtIChartLCL };
            const cdtSpec = {
            USL: specAttribute.cdtUpperSpec,
            LSL: specAttribute.cdtLowerSpec,
            };

            // 2) ได้ DataPoint[] ของแต่ละซีรีส์ (เช็ค R1 + R3)
            const hardnessPoints = this.buildControlChartPoints(hardnessValues, hardnessFgNo, 
                hardnessDates, hardnessCtrl, hardnessSpec, 6);
            const compoundPoints = this.buildControlChartPoints(compoundLayerValues, compoundLayerFgNo, 
                compoundLayerDates, compoundCtrl, compoundSpec, 6);
            const cdePoints      = this.buildControlChartPoints(cdeValues, cdeFgNo, cdeDates, 
                cdeCtrl, cdeSpec, 6);
            const cdtPoints      = this.buildControlChartPoints(cdtValues, cdtFgNo, cdtDates, 
                cdtCtrl, cdtSpec, 6);

            // 3) bundle เป็น ChartPoints
            const controlChartSpotsChecked: ChartPoints = {
            surfaceHardness: hardnessPoints,
            compoundLayer : compoundPoints,
            cde           : cdePoints,
            cdt           : cdtPoints,
            };

            const xAxisForMedium = this.xAxisTickLabelMedium(
            filters?.period.startDate ?? '',
            filters?.period.endDate ?? '',
            dataForChart.total
            );

            const xAxisForLarge = this.xAxisTickLabelLarge(
            filters?.period.startDate ?? '',
            filters?.period.endDate ?? '',
            dataForChart.total
            );

            // console.log(xAxisForMedium);

            if (!filters?.period.startDate || !filters?.period.endDate) {
            throw new Error("Start and end date are required");
            }

            const periodTypeName = this.inferPeriodTypeFromRange(
            new Date(filters.period.startDate),
            new Date(filters.period.endDate)
            );

            const xAxisTick: number = periodTypeName === 'ONE_MONTH' ? 4 : 6;

            const secondChartSelected = this.resolveSecondChartSelected(
                filters,
                cdeValues,
                cdtValues,
                compoundLayerValues,
                cdeAverage,
                cdtAverage,
                compoundLayerAverage
            );

            const allViolations = {
            surfaceHardness: this.summarizeViolations(controlChartSpotsChecked.surfaceHardness),
            compoundLayer:   this.summarizeViolations(controlChartSpotsChecked.compoundLayer),
            cde:             this.summarizeViolations(controlChartSpotsChecked.cde),
            cdt:             this.summarizeViolations(controlChartSpotsChecked.cdt),
            };

            const surfaceHardnessCpValue = await calculateChartDetailsService.calculateCapability(
                hardnessValues, specAttribute.surfaceHardnessLowerSpec ?? 0, 
                specAttribute.surfaceHardnessUpperSpec ?? 0
            );
            const compoundLayerCpValue = await calculateChartDetailsService.calculateCapability(
                compoundLayerValues, specAttribute.compoundLayerLowerSpec ?? 0, 
                specAttribute.compoundLayerUpperSpec ?? 0
            );
            const cdeCpValue = await calculateChartDetailsService.calculateCapability(
                cdeValues, specAttribute.cdeLowerSpec ?? 0, 
                specAttribute.cdeUpperSpec ?? 0
            );
            const cdtCpValue = await calculateChartDetailsService.calculateCapability(
                cdtValues, specAttribute.cdtLowerSpec ?? 0, 
                specAttribute.cdtUpperSpec ?? 0
            );

            const result: MRChartResult = {
                numberOfSpots: dataForChart.total,

                surfaceHardnessViolations: {
                    beyondControlLimitLower: allViolations.surfaceHardness.controlLimitViolationsLower,
                    beyondControlLimitUpper: allViolations.surfaceHardness.controlLimitViolationsUpper,
                    beyondSpecLimitLower: allViolations.surfaceHardness.specControlViolationsLower,
                    beyondSpecLimitUpper: allViolations.surfaceHardness.specControlViolationsUpper,
                    trend: allViolations.surfaceHardness.trendViolations,
                },

                compoundLayerViolations: {
                    beyondControlLimitLower: allViolations.compoundLayer.controlLimitViolationsLower,
                    beyondControlLimitUpper: allViolations.compoundLayer.controlLimitViolationsUpper,
                    beyondSpecLimitLower: allViolations.compoundLayer.specControlViolationsLower,
                    beyondSpecLimitUpper: allViolations.compoundLayer.specControlViolationsUpper,
                    trend: allViolations.compoundLayer.trendViolations,
                },

                cdeViolations: {
                    beyondControlLimitLower: allViolations.cde.controlLimitViolationsLower,
                    beyondControlLimitUpper: allViolations.cde.controlLimitViolationsUpper,
                    beyondSpecLimitLower: allViolations.cde.specControlViolationsLower,
                    beyondSpecLimitUpper: allViolations.cde.specControlViolationsUpper,
                    trend: allViolations.cde.trendViolations,
                },

                cdtViolations: {
                    beyondControlLimitLower: allViolations.cdt.controlLimitViolationsLower,
                    beyondControlLimitUpper: allViolations.cdt.controlLimitViolationsUpper,
                    beyondSpecLimitLower: allViolations.cdt.specControlViolationsLower,
                    beyondSpecLimitUpper: allViolations.cdt.specControlViolationsUpper,
                    trend: allViolations.cdt.trendViolations,
                },

                secondChartSelected: secondChartSelected,

                periodType: periodTypeName,
                xTick: xAxisTick,
                xAxisMediumLabel: xAxisForMedium,
                xAxisLargeLabel: xAxisForLarge,
                yAxisRange: yAxisRange,

                average: Number(average.toFixed(3)),
                compoundLayerAverage: Number(compoundLayerAverage.toFixed(3)),
                cdeAverage: Number(cdeAverage.toFixed(3)),
                cdtAverage: Number(cdtAverage.toFixed(3)),

                MRAverage: Number(mrAverage.toFixed(3)),
                compoundLayerMRAverage: Number(compoundLayerMrChartUCL.toFixed(3)),
                cdeMRAverage: Number(cdeMrAverage.toFixed(3)),
                cdtMRAverage:Number(cdtMrAverage.toFixed(3)),

                surfaceHardnessCapabilityProcess: surfaceHardnessCpValue,
                compoundLayerCapabilityProcess: compoundLayerCpValue,
                cdeCapabilityProcess: cdeCpValue,
                cdtCapabilityProcess: cdtCpValue,

                controlLimitIChart: {
                    CL: Number(average.toFixed(3)),
                    UCL: Number(iChartUCL.toFixed(3)),
                    LCL: Number(iChartLCL.toFixed(3))
                },

                compoundLayerControlLimitIChart: {
                    CL: Number(compoundLayerAverage.toFixed(3)),
                    UCL: Number(compoundLayerIChartUCL.toFixed(3)),
                    LCL: Number(compoundLayerIChartLCL.toFixed(3))
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

                compoundLayerSigmaIChart: {
                    sigmaMinus3: Number(compoundLayerIChartSigma.sigmaMinus3.toFixed(3)),
                    sigmaMinus2: Number(compoundLayerIChartSigma.sigmaMinus2.toFixed(3)),
                    sigmaMinus1: Number(compoundLayerIChartSigma.sigmaMinus1.toFixed(3)),
                    sigmaPlus1: Number(compoundLayerIChartSigma.sigmaPlus1.toFixed(3)),
                    sigmaPlus2: Number(compoundLayerIChartSigma.sigmaPlus2.toFixed(3)),
                    sigmaPlus3: Number(compoundLayerIChartSigma.sigmaPlus3.toFixed(3))
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

                compoundLayerControlLimitMRChart: {
                    CL: Number(compoundLayerMrAverage.toFixed(3)),
                    UCL: Number(compoundLayerMrChartUCL.toFixed(3)),
                    LCL: Number(compoundLayerMrChartLCL.toFixed(3))
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
                surfaceHardnessChartSpots: hardnessValues,
                compoundLayerChartSpots: compoundLayerValues,
                cdeChartSpots: cdeValues,
                cdtChartSpots: cdtValues,

                controlChartSpots: controlChartSpotsChecked,

                mrChartSpots: movingRanges,
                compoundLayerMrChartSpots: compoundLayerMovingRanges,
                cdeMrChartSpots: cdeMovingRanges,
                cdtMrChartSpots: cdtMovingRanges,

                specAttribute,
            };
           
            // console.log('I-MR Chart Calculation Results:', result);
            // console.log('hardness value:', hardnessValues);
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

    private specOrNull(v: number | null | undefined): number | null {
    return (typeof v === 'number' && Number.isFinite(v) && v !== 0) ? v : null;
    }


    private computeYAxisRange(params: {
    hardnessValues: number[];
    compoundLayerValues: number[];
    cdeValues: number[];
    cdtValues: number[];
    mrSpots: number[];
    compoundLayerMrSpots: number[];
    cdeMrSpots: number[];
    cdtMrSpots: number[];
    iUCL: number;  iLCL: number;   mrUCL: number;
    compoundLayerIUCL: number; compoundLayerILCL: number; compoundLayerMrUCL: number;
    cdeIUCL: number; cdeILCL: number; cdeMrUCL: number;
    cdtIUCL: number; cdtILCL: number; cdtMrUCL: number;
    specAttribute: {
        surfaceHardnessUpperSpec?: number;
        surfaceHardnessLowerSpec?: number;
        compoundLayerUpperSpec?: number;
        compoundLayerLowerSpec?: number;
        cdeUpperSpec?: number;
        cdeLowerSpec?: number;
        cdtUpperSpec?: number;
        cdtLowerSpec?: number;
        // any other fields are ignored
    };
    }): YAxisRange {
    const {
        hardnessValues, compoundLayerValues, cdeValues, cdtValues,
        mrSpots, compoundLayerMrSpots, cdeMrSpots, cdtMrSpots,
        iUCL, iLCL, mrUCL,
        compoundLayerIUCL, compoundLayerILCL, compoundLayerMrUCL,
        cdeIUCL, cdeILCL, cdeMrUCL,
        cdtIUCL, cdtILCL, cdtMrUCL,
        specAttribute
    } = params;

    const maxHardSpot = this.arrMax(hardnessValues);
    const minHardSpot = this.arrMin(hardnessValues);

    const maxCompoundLayerSpot = this.arrMax(compoundLayerValues);
    const minCompoundLayerSpot = this.arrMin(compoundLayerValues);

    const maxCdeSpot  = this.arrMax(cdeValues);
    const minCdeSpot  = this.arrMin(cdeValues);

    const maxCdtSpot  = this.arrMax(cdtValues);
    const minCdtSpot  = this.arrMin(cdtValues);

    const maxMrSpot   = this.arrMax(mrSpots);
    const maxCompoundLayerMrSpot = this.arrMax(compoundLayerMrSpots)
    const maxCdeMr    = this.arrMax(cdeMrSpots);
    const maxCdtMr    = this.arrMax(cdtMrSpots);

    const shUSpec = this.specOrNull(specAttribute.surfaceHardnessUpperSpec);
    const shLSpec = this.specOrNull(specAttribute.surfaceHardnessLowerSpec);
    const clUSpec = this.specOrNull(specAttribute.compoundLayerUpperSpec);
    const clLSpec = this.specOrNull(specAttribute.compoundLayerLowerSpec);
    const cdeUSpec = this.specOrNull(specAttribute.cdeUpperSpec);
    const cdeLSpec = this.specOrNull(specAttribute.cdeLowerSpec);
    const cdtUSpec = this.specOrNull(specAttribute.cdtUpperSpec);
    const cdtLSpec = this.specOrNull(specAttribute.cdtLowerSpec);

    return {
        // Surface Hardness I-Chart
        maxYsurfaceHardnessControlChart: this.pickMax(
        maxHardSpot,
        iUCL,
        shUSpec,           // ⬅️ ใช้ spec ที่ผ่านการกรอง 0 แล้ว
        ),
        minYsurfaceHardnessControlChart: this.pickMin(
        minHardSpot,
        iLCL,
        shLSpec,           // ⬅️ ถ้าเป็น 0 จะไม่ถูกใช้
        ),

        // Surface Hardness MR-Chart
        maxYsurfaceHardnessMrChart: this.pickMax(
        maxMrSpot,
        mrUCL
        ),

        // CompoundLayer I-Chart
        maxYcompoundLayerControlChart: this.pickMax(
        maxCompoundLayerSpot,
        compoundLayerIUCL,
        clUSpec
        ),
        minYcompoundLayerControlChart: this.pickMin(
        minCompoundLayerSpot,
        compoundLayerILCL,
        clLSpec
        ),

        // CompoundLayer MR-Chart
        maxYcompoundLayerMrChart: this.pickMax(
        maxCompoundLayerMrSpot,
        compoundLayerMrUCL
        ),

        // CDE I-Chart
        maxYcdeControlChart: this.pickMax(
        maxCdeSpot,
        cdeIUCL,
        cdeUSpec
        ),
        minYcdeControlChart: this.pickMin(
        minCdeSpot,
        cdeILCL,
        cdeLSpec
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
        cdtUSpec
        ),
        minYcdtControlChart: this.pickMin(
        minCdtSpot,
        cdtILCL,
        cdtLSpec
        ),

        // CDT MR-Chart
        maxYcdtMrChart: this.pickMax(
        maxCdtMr,
        cdtMrUCL
        ),
    };
    }

    private nelsonRule1Checker(
    values: number[],
    limits: { CL: number; UCL: number; LCL: number },
    specs?: Specs
    ) {
    const beyondUCL =
        limits.UCL === 0
        ? values.map(() => false)
        : values.map(v => v > limits.UCL);

    const beyondLCL =
        limits.LCL === 0
        ? values.map(() => false)
        : values.map(v => v < limits.LCL);

    const beyondUSL =
        specs?.USL == null || specs.USL === 0
        ? values.map(() => false)
        : values.map(v => specs.USL !== undefined && v > specs.USL);

    const beyondLSL =
        specs?.LSL == null || specs.LSL === 0
        ? values.map(() => false)
        : values.map(v => specs.LSL !== undefined && v < specs.LSL);

    return { beyondUCL, beyondLCL, beyondUSL, beyondLSL };
    }



    private nelsonRule3Checker(values: number[], runLength = 6): boolean[] {
    const n = values.length;
    const flags = new Array<boolean>(n).fill(false);
    if (n <= runLength) return flags;

    let inc = 0;
    let dec = 0;

    for (let i = 1; i < n; i++) {
        if (values[i] > values[i - 1]) { inc++; dec = 0; }
        else if (values[i] < values[i - 1]) { dec++; inc = 0; }
        else { inc = 0; dec = 0; }

        if (inc >= runLength - 1 || dec >= runLength - 1) {
        for (let k = 0; k < runLength; k++) {
            const idx = i - k;
            if (idx >= 0) flags[idx] = true;
        }
        }
    }
    return flags;
    }

    private summarizeViolations(points: DataPoint[]) {
        let controlLimitViolationsLower = 0;
        let controlLimitViolationsUpper = 0;
        let specControlViolationsLower  = 0;
        let specControlViolationsUpper  = 0;
        let trendViolations        = 0;

        for (const p of points) {
            if (p.isViolatedR1BeyondUCL) controlLimitViolationsUpper++;
            if (p.isViolatedR1BeyondLCL) controlLimitViolationsLower++;
            if (p.isViolatedR1BeyondUSL) specControlViolationsUpper++;
            if (p.isViolatedR1BeyondLSL) specControlViolationsLower++;
            if (p.isViolatedR3)          trendViolations++;
        }

        return {
            controlLimitViolationsLower,
            controlLimitViolationsUpper,
            specControlViolationsLower,
            specControlViolationsUpper,
            trendViolations
        };
        }


    // นับจำนวน flag ที่เป็น true ภายใน DataPoint
    countPointViolations(p: DataPoint): number {
    return (
        (p.isViolatedR1BeyondUCL ? 1 : 0) +
        (p.isViolatedR1BeyondLCL ? 1 : 0) +
        (p.isViolatedR1BeyondUSL ? 1 : 0) +
        (p.isViolatedR1BeyondLSL ? 1 : 0) +
        (p.isViolatedR3 ? 1 : 0)
    );
    }

    // ✅ ใช้สำหรับอาร์เรย์ของ DataPoint เดียว เช่น surfaceHardness
    private ruleViolatedCount(arr: DataPoint[]): number {
    if (!Array.isArray(arr) || arr.length === 0) return 0;
    return arr.reduce((sum, point) => sum + this.countPointViolations(point), 0);
    }


    private buildControlChartPoints(
    values: number[],
    fgNo: string[],
    date: Date[],
    limits: { CL: number; UCL: number; LCL: number },
    specs?: Specs,
    r3RunLength = 6
    ): DataPoint[] {
    const r1 = this.nelsonRule1Checker(values, limits, specs);
    const r3 = this.nelsonRule3Checker(values, r3RunLength);

        return values.map((v, i) => ({
            value: v,
            fgNo: fgNo[i],
            collectedDate: date[i],
            isViolatedR1BeyondLCL: r1.beyondLCL[i],
            isViolatedR1BeyondUCL: r1.beyondUCL[i],
            isViolatedR1BeyondLSL: r1.beyondLSL[i],
            isViolatedR1BeyondUSL: r1.beyondUSL[i],
            isViolatedR3: r3[i],
        }));
    }

    private isFiniteNumber(v: unknown): v is number {
    return typeof v === "number" && Number.isFinite(v);
    }
    private hasNumbers(a?: unknown): a is number[] {
    // Fast non-alloc check for non-empty numeric array
    return Array.isArray(a) && a.length > 0;
    }

    private resolveSecondChartSelected(
    filters: ChartDetailsFiltering | undefined,
    cdeValues: number[] | undefined,
    cdtValues: number[] | undefined,
    compoundLayerValues: number[] | undefined,
    cdeAverage: number | undefined,
    cdtAverage: number | undefined,
    compoundLayerAverage: number | undefined // <- was number[] in your snippet; should be number
    ): SecondChartSelected {
    // Normalize furnaceNo (O(1))
    const f = filters?.furnaceNo;
    const furnaceNum = typeof f === "number"
        ? f
        : Number.parseInt((f ?? "").toString().trim(), 10);

    // Availability flags (O(1))
    const hasCDE = this.hasNumbers(cdeValues);
    const hasCDT = this.hasNumbers(cdtValues);
    const hasCL  = this.hasNumbers(compoundLayerValues);

    const cdeOK = this.isFiniteNumber(cdeAverage);
    const cdtOK = this.isFiniteNumber(cdtAverage);

    // If either average is exactly zero → NA (your original intent)

    // If we have CL and furnace is 1..3 → force COMPOUND_LAYER
    // (avoid temporary array + includes)
    if (hasCL && Number.isFinite(furnaceNum) && furnaceNum >= 1 && furnaceNum <= 3) {
        return SecondChartSelected.COMPOUND_LAYER;
    }

        if ((cdeOK && cdeAverage === 0) && (cdtOK && cdtAverage === 0)) {
            return SecondChartSelected.NA;
        }

    // If both CDE & CDT exist → compare averages (fallback CDE on tie/invalid)
    if (hasCDE && hasCDT) {
        if (cdeOK && cdtOK) {
        return cdeAverage! >= cdtAverage! ? SecondChartSelected.CDE : SecondChartSelected.CDT;
        }
        return SecondChartSelected.CDE;
    }

    // Single-side availability
    if (hasCDE) return SecondChartSelected.CDE;
    if (hasCDT) return SecondChartSelected.CDT;

    // If neither CDE/CDT but CL exists, prefer CL (optional: also check finite avg)
    if (hasCL && this.isFiniteNumber(compoundLayerAverage)) {
        return SecondChartSelected.COMPOUND_LAYER;
    }

    // Final fallback
    return SecondChartSelected.NA;
    }

    //
    // 1) ช่วย: บวกเดือนแบบ calendar-aware และรักษาวันเดิม ถ้าเกินให้ snap ไปสิ้นเดือน
    //
    private addMonthsKeepDay(d: Date, months: number): Date {
    const base = new Date(d.getTime());
    const target = new Date(base.getFullYear(), base.getMonth() + months, 1, base.getHours(), base.getMinutes(), base.getSeconds(), base.getMilliseconds());
    const day = base.getDate();
    const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, lastDay));
    return target;
    }

    //
    // 2) อนุมาน PeriodType จาก start/end แบบ calendar-aware
    //    ใช้ midpoint ระหว่าง 1M–3M–6M–12M–24M นับจาก start เป็นเส้นแบ่ง
    //
    private inferPeriodTypeFromRange(start: Date, end: Date): PeriodType {
    const diff = end.getTime() - start.getTime();
    if (diff <= 0) throw new Error("endDate must be after startDate");

    const d1  = this.addMonthsKeepDay(start, 1).getTime()  - start.getTime();
    const d3  = this.addMonthsKeepDay(start, 3).getTime()  - start.getTime();
    const d6  = this.addMonthsKeepDay(start, 6).getTime()  - start.getTime();
    const d12 = this.addMonthsKeepDay(start, 12).getTime() - start.getTime();
    const d24 = this.addMonthsKeepDay(start, 24).getTime() - start.getTime();

    const b13    = (d1  + d3 ) / 2;   // เส้นแบ่ง 1M ↔ 3M
    const b36    = (d3  + d6 ) / 2;   // เส้นแบ่ง 3M ↔ 6M
    const b6_12  = (d6  + d12) / 2;   // เส้นแบ่ง 6M ↔ 12M
    const b12_24 = (d12 + d24) / 2;   // เส้นแบ่ง 12M ↔ 24M

    if (diff <= b13)    return PeriodType.ONE_MONTH;
    if (diff <= b36)    return PeriodType.THREE_MONTHS;
    if (diff <= b6_12)  return PeriodType.SIX_MONTHS;
    if (diff <= b12_24) return PeriodType.ONE_YEAR;
    return PeriodType.CUSTOM; // เกิน 1–2 ปีให้จัดเป็น Custom
    }

    private xAxisTickLabelMedium(
    startISO: string | undefined,
    endISO: string | undefined,
    spots: number
    ): Date[] {
    if (!startISO || !endISO) throw new Error("startDate and endDate are required");

    const startDate = new Date(startISO);
    const endDate   = new Date(endISO);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error("Invalid startDate or endDate");
    if (endDate <= startDate) throw new Error("endDate must be after startDate");

    // (a) infer period type จากช่วงจริง
    const periodType = this.inferPeriodTypeFromRange(startDate, endDate);

    // (b) base tick count ตาม period (1M=4, ที่เหลือ 6)
    const baseTickCount = (periodType === PeriodType.ONE_MONTH) ? 4 : 6;

    // (c) medium scaling: เพิ่มความหนาแน่นทุก ๆ 30 จุด
    const factor = Math.max(1, Math.ceil(spots / 30)); // 132→5, 151→6, ...
    let tickCount = Math.max(2, baseTickCount * factor);

    // (d) กระจาย tick แบบรวมปลายทั้งสอง
    const start = startDate.getTime();
    const end   = endDate.getTime();
    const stepMs = (end - start) / (tickCount - 1);

    const ticks: Date[] = new Array(tickCount);
    for (let i = 0; i < tickCount; i++) {
        ticks[i] = new Date(start + i * stepMs);
    }
    return ticks;
    }

    private xAxisTickLabelLarge(
    startISO: string | undefined,
    endISO: string | undefined,
    spots: number
    ): Date[] {
    if (!startISO || !endISO) throw new Error("startDate and endDate are required");

    const startDate = new Date(startISO);
    const endDate   = new Date(endISO);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) throw new Error("Invalid startDate or endDate");
    if (endDate <= startDate) throw new Error("endDate must be after startDate");

    // (a) infer period type จากช่วงจริง
    const periodType = this.inferPeriodTypeFromRange(startDate, endDate);

    // (b) base tick count ตาม period (1M=4, ที่เหลือ 6)
    const baseTickCount = (periodType === PeriodType.ONE_MONTH) ? 4 : 6;

    // (c) medium scaling: เพิ่มความหนาแน่นทุก ๆ 30 จุด
    const factor = Math.max(1, Math.ceil(spots / 60)); // 132→5, 151→6, ...
    let tickCount = Math.max(2, baseTickCount * factor);

    // (d) กระจาย tick แบบรวมปลายทั้งสอง
    const start = startDate.getTime();
    const end   = endDate.getTime();
    const stepMs = (end - start) / (tickCount - 1);

    const ticks: Date[] = new Array(tickCount);
    for (let i = 0; i < tickCount; i++) {
        ticks[i] = new Date(start + i * stepMs);
    }
    return ticks;
    }

}
import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { FurnaceData, IFurnace } from "../models/Furnace";
import { ILot, LotData } from "../models/Lot";

import { Schema, Document, model, Types } from 'mongoose';
import { FGDataEncoding } from "./masterDataFGEncoding";
import { ParseMasterData } from "../models/ParseMasterData";

export interface IMasterData extends Document {
    masterLotNo: string;
    masterCustomer: string;
    masterPart: string;
    masterPartName: string;
    masterFG_CHARG: {
        masterCollectedDate: string | Date;
        masterFurnaceNo: string;
        masterFG_CHARGCode: string;
    };
    masterDateTime: string | Date;
    masterSurfaceHardnessMean: number;
    masterHardnessAt01mmMean: number;
    masterCDE: {
        masterCDEX: number;
        masterCDEY: number;
    };
    masterCoreHardness: number;
}

export interface ParsedCollections {
    furnaceData: IFurnace;
    chartDetailData: IChartDetail;
    lotData: ILot;
}

export class DataParser {
    // Parse raw API data to Furnace format
    static parseToFurnace(rawData: IMasterData, fgEncoded: FGDataEncoding): FurnaceData {
        return {
            furnaceNo: fgEncoded.masterFurnaceNo,
            furnaceDescription: '', // หรือดึงจาก rawData ถ้ามี
            isDisplay: true,
            updatedAt: new Date(),
            createdAt: new Date()
        };
    }

    // Parse to Lot
    static parseToLot(rawData: IMasterData, furnaceIds: Types.ObjectId[] = []): LotData {
        return {
            lotNo: rawData.masterLotNo,
            furnaceId: furnaceIds,
            specifications: {
                upperSpecLimit: 100,
                lowerSpecLimit: 0,
                target: 50
            },
            isDisplay: true
        };
    }

    // Parse to ChartDetail
    static parseToChartDetail(rawData: IMasterData, fgEncoded: FGDataEncoding): ChartDetailData {
        return {
            lotNo: rawData.masterLotNo,
            FGNo: fgEncoded.masterFGcode,
            chartGeneralDetail: {
                furnaceNo: fgEncoded.masterFurnaceNo,
                part: rawData.masterPart,
                partName: rawData.masterPartName,
                collectedDate: fgEncoded.masterCollectedDate
            },
            machanicDetail: {
                surfaceHardnessMean: rawData.masterSurfaceHardnessMean,
                hardnessAt01mmMean: rawData.masterHardnessAt01mmMean,
                CDE: {
                    CDEX: rawData.masterCDE.masterCDEX,
                    CDEY: rawData.masterCDE.masterCDEY
                },
                coreHardnessMean: rawData.masterCoreHardness,
                compoundLayer: 0
            }
        };
    }

        // Parse all collections at once
        static parseAllCollections(rawData: IMasterData, fgEncoded: FGDataEncoding, furnaceIds: Types.ObjectId[] = []): ParseMasterData {
            return {
                furnaceData: this.parseToFurnace(rawData, fgEncoded),
                lotData: this.parseToLot(rawData, furnaceIds),
                chartDetailData: this.parseToChartDetail(rawData, fgEncoded)
            };
        }
    }
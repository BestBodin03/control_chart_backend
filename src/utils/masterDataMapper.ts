import { ChartDetailData, IChartDetail } from "../models/ChartDetail";
import { FurnaceData, IFurnace } from "../models/Furnace";
import { ICP, CPData } from "../models/CustomerProduct";

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
    cpData: ICP;
}

export class DataParser {
    static parseToFurnace(rawData: IMasterData, fgEncoded: FGDataEncoding): FurnaceData {
        return {
            furnaceNo: fgEncoded.masterFurnaceNo,
            furnaceDescription: '',
            isDisplay: true,
            updatedAt: new Date(),
            createdAt: new Date()
        };
    }

    static parseToLot(rawData: IMasterData, furnaceIds: Types.ObjectId[] = []): CPData {
        return {
            CPNo: rawData.masterLotNo,
            furnaceId: furnaceIds,
            specifications: {
                upperSpecLimit: 100,
                lowerSpecLimit: 0,
                target: 50
            },
            isDisplay: true
        };
    }

    static parseToChartDetail(rawData: IMasterData, fgEncoded: FGDataEncoding): ChartDetailData {
        return {
            CPNo: rawData.masterLotNo,
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

    static parseAllCollections(rawData: IMasterData, fgEncoded: FGDataEncoding, furnaceIds: Types.ObjectId[] = []): ParseMasterData {
        return {
            furnaceData: this.parseToFurnace(rawData, fgEncoded),
            cpData: this.parseToLot(rawData, furnaceIds),
            chartDetailData: this.parseToChartDetail(rawData, fgEncoded)
        };
    }

}
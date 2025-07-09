import { FurnaceData, IFurnace } from "../models/Furnace";
import { FurnaceRepository } from "../repositories/FurnaceRepo";
import { FGDataEncoding } from "../utils/masterDataFGEncoding";
import { DataParser, IMasterData } from "../utils/masterDataMapper";

export class FurnaceService {
  constructor(private furnaceRepository: FurnaceRepository) {}

  async createFurnace(rawData: IMasterData, fgEncoded: FGDataEncoding): Promise<IFurnace> {
  const furnaceData = DataParser.parseToFurnace(rawData, fgEncoded);
  return await this.furnaceRepository.create(furnaceData);
  }

  async getAllFurnaces(): Promise<IFurnace[]> {
    return await this.furnaceRepository.findAll();
  }

  async getFurnaceByFurnaceNo(furnaceNo: number): Promise<IFurnace | null> {
    return await this.furnaceRepository.findByFurnaceNo(furnaceNo);
  }
}
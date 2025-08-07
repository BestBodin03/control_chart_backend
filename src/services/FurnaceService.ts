import { FurnaceData, IFurnace } from "../models/Furnace";
import { FurnaceRepository } from "../repositories/FurnaceRepo";


// ✅ Furnace Service
export class FurnaceService {
  createFurnace(masterData: any, fgEncoded: any) {
    throw new Error('Method not implemented.');
  }
  getFurnaceByFurnaceNo(furnaceNo: number) {
    throw new Error('Method not implemented.');
  }
  constructor(private furnaceRepository: FurnaceRepository) {}

  async bulkCreateUniqueFurnaces(furnaceDataArray: FurnaceData[]): Promise<IFurnace[]> {
    const uniqueFurnaceNos = [...new Set(furnaceDataArray.map(f => f.furnaceNo))];
    console.log(`Unique furnace numbers to process: ${uniqueFurnaceNos.length}`);
    
    const existingFurnaceNos = await this.furnaceRepository.findExistingFurnaceNos(uniqueFurnaceNos);
    const existingSet = new Set(existingFurnaceNos);
    
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
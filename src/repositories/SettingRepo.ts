import { ObjectId } from "mongodb";
import { SettingResponse } from "../controllers/setting/settingResponse";
import { Setting } from "../models/entities/setting";
// import { Setting, SettingModel } from "../models/entities/setting";
import { SettingDTO, settingEntitySchema } from "../models/validations/settingValidate";

export class SettingRepository {
async create(dto: Omit<SettingDTO, "id">): Promise<SettingDTO>{
    try {
        const item = settingEntitySchema.parse({
            ...dto,
            _id: new ObjectId(),
        });
        const {insertedId} = await Setting.insertOne(item);
        const result = SettingDTO.convertFromEntity({ ...dto, _id: insertedId });
        return result; // Convert mongoose document to plain object
    } catch (error: any) {
        if (error.code === 11000) {
            console.log('Setting already exists');
            throw new Error('Duplicate entry');
        }
        throw error;
    }
}

async findAll(): Promise<SettingDTO[]> {
    const results = await Setting.find().lean(); // Use lean() for better performance
    return results;
}

    // async update(id: string, updateData: Partial<SettingResponse>): Promise<Setting | null> {
    //     try {
    //         const result = await SettingModel.findByIdAndUpdate(
    //             id, 
    //             updateData, 
    //             { new: true }
    //         );
    //         return result;
    //     } catch (error: any) {
    //         console.error('Error updating setting:', error);
    //         throw error;
    //     }
    // }

}
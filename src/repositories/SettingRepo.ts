import { ISetting, SettingData, SettingModel } from "../models/Setting";


export class SettingRepository {
    async create(settingData: SettingData[]): Promise<ISetting> {
        try {
            const settingInstance = new SettingModel(settingData);
            const result = await settingInstance.save();
            return result;
        } catch (error: any) {
            if (error.code === 11000) {
                console.log('Setting already exists');
                throw new Error('Duplicate entry');
            }
            throw error;
        }
    }

    async update(id: string, updateData: Partial<SettingData>): Promise<ISetting | null> {
        try {
            const result = await SettingModel.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true } // Return updated document
            );
            return result;
        } catch (error: any) {
            console.error('Error updating setting:', error);
            throw error;
        }
    }

    async findAll(): Promise<ISetting[]> {
        return await SettingModel.find().exec();
    }

}
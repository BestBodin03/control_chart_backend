import { Setting, SettingData, SettingModel } from "../models/entities/setting";

export class SettingRepository {
    async create(settingData: SettingData[]): Promise<Setting> {
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

    async update(id: string, updateData: Partial<SettingData>): Promise<Setting | null> {
        try {
            const result = await SettingModel.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true }
            );
            return result;
        } catch (error: any) {
            console.error('Error updating setting:', error);
            throw error;
        }
    }

    async findAll(): Promise<Setting[]> {
        return await SettingModel.find().exec();
    }

}
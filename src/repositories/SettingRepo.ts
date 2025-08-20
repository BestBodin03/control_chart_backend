import { Setting, SettingSchema } from "../models/entities/setting";
import { CreateSettingProfileRequest, SettingDTO, SettingEntity, settingEntitySchema } from "../models/validations/settingValidate";

export class SettingRepository {
    async create(req: SettingEntity): Promise<SettingSchema> {
        try {
        const doc = await Setting.create(req);
        return doc;
        } catch (e: any) {
        if (e.code === 11000) {
            throw new Error("Duplicate setting profile name");
        }
        throw new Error("Failed to create a new setting profile");
        }
    }

    async findAll(): Promise<SettingSchema[]> {
        try {
            const result = await Setting.find().lean();
            return result;
        } catch (e) {
            throw new Error("Failed to get all settings");
        }
    }

    async updateById(id: string, patch: Partial<CreateSettingProfileRequest>): Promise<SettingSchema | null> {
        try {
            const result = await Setting.findByIdAndUpdate(id, patch, {
                new: true,
                runValidators: true,
            }).lean<SettingSchema>().exec();

            return result;
        } catch (e) {
            throw new Error("Failed to update a setting profile");
        }
    }

    async delete(id: string): Promise<void> {
        try {
            const res = await Setting.findByIdAndDelete(id).exec();
            if (!res) throw new Error("Setting profile not found");
        } catch (e) {
            throw new Error("Failed to delete a setting profile");
        }
    }

}
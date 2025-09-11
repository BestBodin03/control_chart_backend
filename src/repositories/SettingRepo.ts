import { Types } from "mongoose";
import { Setting, SettingSchema } from "../models/entities/setting";
import { CreateSettingProfileRequest, SettingDTO, SettingEntity, settingEntitySchema, UpdateSettingProfileRequest } from "../models/validations/SettingValidate";

export class SettingRepository {
    readonly oid = (id: string) => new Types.ObjectId(id);

    async create(req: SettingEntity): Promise<SettingSchema> {
        try {
            console.log(req);
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

    async updateById(id: string, patch: Partial<UpdateSettingProfileRequest>): Promise<SettingSchema | null> {
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

    async findExistingIds(ids: string[]): Promise<string[]> {
        if (!ids.length) return [];
        const rows = await Setting.find({ _id: { $in: ids.map(this.oid) } }, { _id: 1 }).lean();
        return rows.map(r => String(r._id));
    }

    async deleteMany(ids: string[]): Promise<number> {
        if (!ids.length) return 0;
        const res = await Setting.deleteMany({ _id: { $in: ids.map(this.oid) } }).exec();
        return res.deletedCount ?? 0;
    }

    async findById(id: string): Promise<SettingSchema> {
        const doc = await Setting.findById(id).exec();
        if (!doc) throw new Error("Setting profile not found");
        return doc;
    }

    async findOne(filter: Partial<Record<keyof SettingEntity, any>>): Promise<SettingEntity | null> {
        return Setting.findOne(filter).exec();
    }


}
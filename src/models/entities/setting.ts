import { Document, Schema, Types, model } from "mongoose";
import { DisplayType } from "../enums/DisplayType";
import { PeriodType } from "../enums/PeriodType";
import { settingEntitySchema } from "../validations/SettingValidate";
import { NelsonRule } from "../../controllers/setting/settingResponse";

export interface SettingSchema {
  _id: Types.ObjectId;
  settingProfileName: string;
  isUsed: boolean;
  displayType: DisplayType;
  generalSetting: {
    chartChangeInterval: number;
    nelsonRule: NelsonRule[];
  };
  specificSetting: {
    period: {
      type: PeriodType;
      startDate: Date;
      endDate: Date;
    };
    furnaceNo: number;
    cpNo: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SettingMongooseSchema = new Schema<SettingSchema>(
  {
    settingProfileName: { type: String, required: true, maxlength: 100 , unique: true},
    isUsed: { type: Boolean, required: true, default: true },
    displayType: { type: String, required: true }, // add enum if you have literals
    generalSetting: {
      chartChangeInterval: { type: Number, required: true },
      nelsonRule:[],
    },
    specificSetting: [
      {
        period: {
          type: {
            type: String, // add enum if you have literals
            required: true,
          },
          startDate: Date,
          endDate: Date,
        },
        furnaceNo: { type: Number},
        cpNo: { type: String},
      },
    ],
  },
  { timestamps: true }
);

export const Setting = model<SettingSchema>('Setting', SettingMongooseSchema);



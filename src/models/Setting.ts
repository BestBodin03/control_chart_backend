import { Document, Schema, model } from "mongoose";
import { DisplayType } from "./enums/DisplayType";
import { PeriodType } from "./enums/PeriodType";

export interface ISetting extends Document {
  settingProfileName: string;
  isUsed: boolean;
  displayType: DisplayType;
  generalSetting: {
    chartChangeInterval: number;
    period: {
      type: PeriodType;
      startDate?: Date;
      endDate?: Date;
    };
  };
  specificSetting: {
    furnaceNo: number;
    cpNo: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingData {
  settingProfileName: string;
  isUsed: boolean;
  displayType: DisplayType;
  generalSetting: {
    chartChangeInterval: number;
    period: {
      type: PeriodType;
      startDate?: Date;
      endDate?: Date;
    };
  };
  specificSetting: {
    furnaceNo: number;
    cpNo: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    isUsed: {
      type:Boolean,
      required: true,
      default: true
    },
    settingProfileName: { 
      type: String, 
      required: true,
      maxlength: 100
    },
    displayType: {
      type: String,
      enum: Object.values(DisplayType),
      required: true,
    },
    generalSetting: {
      chartChangeInterval: { 
        type: Number, 
        required: true,
        min: 1,
        max: 3600
      },
      period: {
        type: {
          type: String,
          enum: Object.values(PeriodType),
          required: true,
        },
        startDate: {
          type: Date,
          required: function (this: any) {
            return this.generalSetting?.period?.type === 'custom';
          },
        },
        endDate: {
          type: Date,
          required: function (this: any) {
            return this.generalSetting?.period?.type === 'custom';
          },
        },
      },
    },
    specificSetting: [
      {
        furnaceNo: {
          type: Number,
          required: true,
          min: 1,
        },
        cpNo: {
          type: String,
          required: true,
          maxlength: 50,
        },
      },
    ],
  },
  { timestamps: true }
);

export const SettingModel = model<ISetting>('Setting', settingSchema);

import { Schema, model, Document } from 'mongoose';
import { number } from 'zod';

export const DisplayType = {
  Furnace: 'Furnace',
  Furnace_Lot: 'Furnace/Lot',
  Lot: 'Lot',
} as const;

export type DisplayType = typeof DisplayType[keyof typeof DisplayType];

export interface ISetting extends Document {
  settingProfileName: string;
  displayType: DisplayType;
  generalSetting: {
    refreshInterval: number;
    chartChangeInterval: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  };
  specificSetting: {
    furnaceNo: number;
    lotNo: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Data interface สำหรับการสร้าง document
export interface SettingData {
  settingProfileName: string;
  displayType: DisplayType;
  generalSetting: {
    refreshInterval: number;
    chartChangeInterval: number;
    period: {
      startDate: Date;
      endDate: Date;
    };
  };
  specificSetting: {
    furnaceNo: number;
    lotNo: string;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    settingProfileName: { type: String },
    displayType: {
      type: String,
      enum: Object.values(DisplayType),
      required: true,
    },
    generalSetting: {
      refreshInterval: { type: Number},
      chartChangeInterval: { type: number},
      period: {
        startDate: { type: Date },
        endDate: { type: Date},
      },
    },
    specificSetting: [
      {
        furnaceNo: { type: Number },
        lotNo: { type: String},
      },
    ],
  },
  { timestamps: true }
);

export default model<ISetting>('Setting', settingSchema);
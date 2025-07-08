import { Schema, model, Document } from 'mongoose';

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
    settingProfileName: { type: String, required: true },
    displayType: {
      type: String,
      enum: Object.values(DisplayType),
      required: true,
    },
    generalSetting: {
      refreshInterval: { type: Number, required: true },
      chartChangeInterval: { type: Number, required: true },
      period: {
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
      },
    },
    specificSetting: [
      {
        furnaceNo: { type: Number, required: true },
        lotNo: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default model<ISetting>('Setting', settingSchema);
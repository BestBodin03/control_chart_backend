import { Document, Schema, model } from "mongoose";
import { DisplayType } from "../enums/displayType";
import { PeriodType } from "../enums/periodType";

export interface Setting extends Document {
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
    period: {
      type: PeriodType;
      startDate?: Date;
      endDate?: Date;
    };
    furnaceNo: number;
    cpNo: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingResponse {
  settingProfileName: string;
  isUsed: boolean;
  displayType: DisplayType;
  generalSetting: {
    chartChangeInterval: number;
    nelsonCondtion: {
      conditionName: String;
      conditionNo: number;
    }[];
  };
  specificSetting: {
    period: {
      type: PeriodType;
      startDate?: Date;
      endDate?: Date;
    };
    furnaceNo: number;
    cpNo: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<Setting>(
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
        min: 10,
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

export const SettingModel = model<Setting>('Setting', settingSchema);

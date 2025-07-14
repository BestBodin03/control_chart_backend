import { PeriodType } from "../models/enums/PeriodType";

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export class TimeConverter {
  
  static toDateRange(
    periodType: PeriodType, 
    customStart?: Date, 
    customEnd?: Date,
    pastDays?: number
  ): DateRange {
    const now = new Date();
    
    switch (periodType) {
      case PeriodType.THIS_MONTH:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth(), 1),
          endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0)
        };

      case PeriodType.PAST_MONTH:
        const days = pastDays || 30;
        return {
          startDate: new Date(now.getTime() - (days * 24 * 60 * 60 * 1000)),
          endDate: now
        };

      case PeriodType.THREE_MONTHS:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
          endDate: now
        };

      case PeriodType.SIX_MONTHS:
        return {
          startDate: new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()),
          endDate: now
        };

      case PeriodType.ONE_YEAR:
        return {
          startDate: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
          endDate: now
        };

      case PeriodType.CUSTOM:
        if (!customStart || !customEnd) {
          throw new Error('Custom period needs start and end dates');
        }
        return {
          startDate: customStart,
          endDate: customEnd
        };

      case PeriodType.ANY_TIME:
        return {
          startDate: new Date('1970-01-01'),
          endDate: now
        };

      default:
        throw new Error(`Unknown period: ${periodType}`);
    }
  }

  static toMongoQuery(fieldName: string, periodType: PeriodType, customStart?: Date, customEnd?: Date, pastDays?: number): any {
    if (periodType === PeriodType.ANY_TIME) {
      return {};
    }

    const range = this.toDateRange(periodType, customStart, customEnd, pastDays);
    
    return {
      [fieldName]: {
        $gte: range.startDate,
        $lte: range.endDate
      }
    };
  }
}
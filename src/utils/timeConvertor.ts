import { PeriodType } from "../models/enums/periodType";

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

    // helper to make UTC midnight
    const toUtcMidnight = (d: Date): Date =>
      new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    switch (periodType) {
      case PeriodType.ONE_MONTH:
        return {
          startDate: toUtcMidnight(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())),
          endDate: toUtcMidnight(now),
        };

      case PeriodType.THREE_MONTHS:
        return {
          startDate: toUtcMidnight(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())),
          endDate: toUtcMidnight(now),
        };

      case PeriodType.SIX_MONTHS:
        return {
          startDate: toUtcMidnight(new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())),
          endDate: toUtcMidnight(now),
        };

      case PeriodType.ONE_YEAR:
        return {
          startDate: toUtcMidnight(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())),
          endDate: toUtcMidnight(now),
        };

      case PeriodType.CUSTOM:
        if (!customStart || !customEnd) {
          throw new Error("Custom period needs start and end dates");
        }
        return {
          startDate: toUtcMidnight(customStart),
          endDate: toUtcMidnight(customEnd),
        };

      case PeriodType.LIFETIME:
        return {
          startDate: toUtcMidnight(new Date("2024-01-01")),
          endDate: toUtcMidnight(now),
        };

      default:
        throw new Error(`Unknown period: ${periodType}`);
    }
  }

  static toMongoQuery(
    fieldName: string,
    periodType: PeriodType,
    customStart?: Date,
    customEnd?: Date,
    pastDays?: number
  ): any {
    if (periodType === PeriodType.LIFETIME) {
      return {};
    }

    const range = this.toDateRange(periodType, customStart, customEnd, pastDays);

    return {
      [fieldName]: {
        $gte: range.startDate,
        $lte: range.endDate,
      },
    };
  }
}

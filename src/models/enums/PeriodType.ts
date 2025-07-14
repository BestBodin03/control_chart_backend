export const PeriodType = {
  THIS_MONTH: 'thisMonth',
  PAST_MONTH: 'pastMonth',
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  ONE_YEAR: '1year',
  CUSTOM: 'custom',
  ANY_TIME: 'anyTime'
} as const;

export type PeriodType = typeof PeriodType[keyof typeof PeriodType];
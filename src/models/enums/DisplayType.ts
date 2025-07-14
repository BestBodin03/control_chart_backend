export const DisplayType = {
  FURNACE: 'Furnace',
  FURNACE_CP: 'Furnace/CP',
  CP: 'CPNo.',
} as const;

export type DisplayType = typeof DisplayType[keyof typeof DisplayType];
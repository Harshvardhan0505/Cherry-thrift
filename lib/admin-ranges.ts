// The orders list's date filter options.
export const RANGES = {
  all: "All time",
  today: "Today",
  week: "This week",
  month: "This month",
} as const;

export type Range = keyof typeof RANGES;

export const CHART_COLORS = [
  "#22c55e",
  "#ef4444",
  "#3b82f6",
  "#eab308",
  "#a855f7",
  "#06b6d4",
];

export const DATE_FILTER_OPTIONS = [
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
  { value: "year", label: "Год" },
] as const;

export type DateFilterValue = "week" | "month" | "year" | "all";

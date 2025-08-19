import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "./constants";

type TrendsChartProps = {
  data: { date: string; income: number; expense: number }[];
};

export const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  return (
    <div className="w-full p-4 mb-6 rounded bg-gray-800 border border-gray-700">
      <h2 className="text-lg font-bold mb-4 text-white">
        Тренды доходов и расходов
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="income"
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="expense"
              stroke={CHART_COLORS[1]}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

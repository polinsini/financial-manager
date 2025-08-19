import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CHART_COLORS } from "./constants";

type CategoryChartProps = {
  data: { name: string; value: number }[];
  title: string;
  defaultColor: string;
};

export const CategoryChart: React.FC<CategoryChartProps> = ({
  data,
  title,
  defaultColor,
}) => {
  return (
    <div className="w-full p-4 mb-6 rounded bg-gray-800 border border-gray-700">
      <h2 className="text-lg font-bold mb-4" style={{ color: defaultColor }}>
        {title}
      </h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              fill={defaultColor}
              label
            >
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "none",
                color: "#fff",
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

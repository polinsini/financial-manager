import React from "react";

import { selectCurrencySymbol } from "../store/slices/authSlice";
import { useAppSelector } from "../store/hooks";
type SummaryStatsProps = {
  income: number;
  expenses: number;
};

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  income,
  expenses,
}) => {
  const currencySymbol = useAppSelector(selectCurrencySymbol);
  const balance = income - expenses;

  return (
    <div className="w-full p-4 mb-4 rounded bg-gray-800 border border-gray-700">
      <h2 className="text-lg font-bold mb-2 text-white">Краткая статистика</h2>
      <div className="flex justify-between text-white">
        <div>
          <p>Доходы:</p>
          <p className="font-semibold text-green-500">
            {income} {currencySymbol}
          </p>
        </div>
        <div>
          <p>Расходы:</p>
          <p className="font-semibold text-red-500">
            {expenses} {currencySymbol}
          </p>
        </div>
        <div>
          <p>Баланс:</p>
          <p className="font-semibold">{balance} </p>
        </div>
      </div>
    </div>
  );
};

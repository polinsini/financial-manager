// AnalyticsPage.tsx

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { selectUser } from "../store/slices/authSlice";
import {
  fetchTransactions,
  selectFilteredIncomeData,
  selectFilteredExpenseData,
  selectFilteredTrendsData,
} from "../store/slices/financeSlice";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";
import { DateFilter } from "../components/DateFilter";
import { TrendsChart } from "../components/TrendsChart";
import { CategoryChart } from "../components/CategoryChart";
import { DateFilterValue } from "../components/constants";

export const AnalyticsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const { error } = useAppSelector((state) => state.finance);

  const [filter, setFilter] = useState<DateFilterValue>("month");
  const incomeData = useAppSelector((state) =>
    selectFilteredIncomeData(state, filter),
  );
  const expenseData = useAppSelector((state) =>
    selectFilteredExpenseData(state, filter),
  );
  const trendsData = useAppSelector((state) =>
    selectFilteredTrendsData(state, filter),
  );

  const [userName, setUserName] = useState("");

  useEffect(() => {
    let id: string | null = null;
    if (user?.uid) {
      id = Date.now().toString();
      dispatch(fetchTransactions(user.uid));
      setUserName(user.displayName || user.email || "Пользователь");
    }
    return () => {
      if (id) {
        dispatch(removeNotification(id));
      }
    };
  }, [dispatch, user]);

  useEffect(() => {
    if (error) {
      const id = Date.now().toString();
      dispatch(addNotification({ message: error, type: "error" }));
      const timer = setTimeout(() => dispatch(removeNotification(id)), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  return (
    <div className="min-h-screen p-6 bg-[#000300]">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Аналитика и статистика, {userName}
      </h1>
      <DateFilter value={filter} onChange={setFilter} />
      <CategoryChart
        data={incomeData}
        title="Доходы по категориям"
        defaultColor="#22c55e"
      />
      <CategoryChart
        data={expenseData}
        title="Расходы по категориям"
        defaultColor="#ef4444"
      />
      <TrendsChart data={trendsData} />
    </div>
  );
};

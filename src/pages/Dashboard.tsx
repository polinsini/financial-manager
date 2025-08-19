import { useEffect, useState } from "react";
import { SummaryStats } from "../components/SummaryStats";
import { TransactionList } from "../components/TransactionList";
import { Button } from "../components/Button";
import { AddTransactionForm } from "../components/AddTransactionForm";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchTransactions,
  addTransaction,
  selectTransactions,
} from "../store/slices/financeSlice";
import { selectUser } from "../store/slices/authSlice";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";

export const DashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(selectTransactions);
  const user = useAppSelector(selectUser);
  const { error } = useAppSelector((state) => state.finance);
  const [isFormOpen, setIsFormOpen] = useState(false);
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

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleAddTransaction = (
    newTransaction: Omit<(typeof transactions)[0], "id" | "userId">,
  ) => {
    if (!user?.uid) return;
    dispatch(addTransaction({ userId: user.uid, data: newTransaction }));
    setIsFormOpen(false);
  };

  return user ? (
    <div className="min-h-screen p-6 bg-[#000300]">
      <h1 className="text-2xl font-bold mb-6 text-white">
        Добро пожаловать, {userName}
      </h1>
      <SummaryStats income={income} expenses={expenses} />
      <Button
        bgColor="bg-lime-600"
        hoverBgColor="hover:bg-lime-700"
        textColor="text-white"
        onClick={() => setIsFormOpen(true)}
      >
        Добавить транзакцию
      </Button>
      <TransactionList transactions={transactions} currentUserId={user.uid} />
      {isFormOpen && (
        <AddTransactionForm
          onClose={() => setIsFormOpen(false)}
          onAdd={handleAddTransaction}
        />
      )}
    </div>
  ) : null;
};

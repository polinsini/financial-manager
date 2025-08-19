import React, { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { updateTransaction } from "../store/slices/financeSlice";
import type { Transaction } from "../store/slices/financeSlice";
import { FaSave, FaTimes } from "react-icons/fa";
import { Input } from "./Input";
import { Button } from "./Button";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { selectCurrencySymbol } from "../store/slices/authSlice";

type TransactionListProps = {
  transactions: Transaction[];
  currentUserId: string;
};

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  currentUserId,
}) => {
  const currencySymbol = useAppSelector(selectCurrencySymbol);

  const dispatch = useAppDispatch();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategory, setEditCategory] = useState<string>("");

  const saveEdit = async (tx: Transaction) => {
    const id = Date.now().toString();
    dispatch(
      addNotification({ message: "Сохранение изменений...", type: "info" }),
    );
    try {
      await dispatch(
        updateTransaction({
          ...tx,
          amount: Number(editAmount),
          category: editCategory,
          userId: currentUserId,
        }),
      ).unwrap();
      dispatch(
        addNotification({ message: "Транзакция обновлена", type: "success" }),
      );
      setEditingId(null);
    } catch {
      dispatch(
        addNotification({
          message: "Ошибка обновления транзакции",
          type: "error",
        }),
      );
    } finally {
      setTimeout(() => dispatch(removeNotification(id)), 5000);
    }
  };

  return (
    <div className="w-full p-4 mb-4 rounded bg-gray-800 border border-gray-700">
      <h2 className="text-lg font-bold mb-2 text-white">
        Последние транзакции
      </h2>
      <ul>
        {transactions.map((tx) => (
          <li
            key={tx.id}
            className="flex items-center justify-between py-2 border-b border-gray-700 text-white hover:bg-gray-700 transition-colors"
          >
            {editingId === tx.id ? (
              <>
                <div className="flex flex-1 items-center gap-4">
                  <Input
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-32"
                  />
                  <Input
                    type="number"
                    value={editAmount}
                    onChange={(e) => setEditAmount(Number(e.target.value))}
                    className="w-20"
                  />
                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    bgColor="bg-green-600"
                    hoverBgColor="hover:bg-green-700"
                    textColor="text-white"
                    className="p-2"
                    onClick={() => saveEdit(tx)}
                  >
                    <FaSave />
                  </Button>
                  <Button
                    bgColor="bg-red-600"
                    hoverBgColor="hover:bg-red-700"
                    textColor="text-white"
                    className="p-2"
                    onClick={() => setEditingId(null)}
                  >
                    <FaTimes />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to={`/transaction/${tx.id}`}
                  className="flex flex-1 items-center gap-4"
                >
                  <span>{tx.category}</span>
                  <span
                    className={
                      tx.type === "income" ? "text-green-500" : "text-red-500"
                    }
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {tx.amount} {currencySymbol}
                  </span>
                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                </Link>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

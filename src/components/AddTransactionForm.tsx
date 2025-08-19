import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { addTransaction } from "../store/slices/financeSlice";
import { selectUser } from "../store/slices/authSlice";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";
import { Input } from "./Input";
import { Button } from "./Button";

type AddTransactionFormProps = {
  onClose: () => void;
  onAdd?: (transaction: {
    type: "income" | "expense";
    category: string;
    amount: number;
    date: string;
  }) => void;
};

export const AddTransactionForm: React.FC<AddTransactionFormProps> = ({
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);

  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || amount <= 0 || !user) {
      dispatch(
        addNotification({
          message: "Заполните все поля корректно",
          type: "error",
        }),
      );
      return;
    }

    const newTransaction = { type, category, amount, date };
    const id = Date.now().toString();
    dispatch(
      addNotification({ message: "Добавление транзакции...", type: "info" }),
    );

    try {
      await dispatch(
        addTransaction({ userId: user.uid, data: newTransaction }),
      ).unwrap();
      dispatch(
        addNotification({ message: "Транзакция добавлена", type: "success" }),
      );

      onClose();
    } catch {
      dispatch(
        addNotification({
          message: "Ошибка добавления транзакции",
          type: "error",
        }),
      );
    } finally {
      setTimeout(() => dispatch(removeNotification(id)), 5000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-white">
          Добавить транзакцию
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <Button
              bgColor={type === "income" ? "bg-green-600" : "bg-gray-800"}
              hoverBgColor={
                type === "income" ? "hover:bg-green-700" : "hover:bg-gray-700"
              }
              textColor={type === "income" ? "text-white" : "text-gray-300"}
              className="flex-1"
              onClick={() => setType("income")}
            >
              Доход
            </Button>
            <Button
              bgColor={type === "expense" ? "bg-red-600" : "bg-gray-800"}
              hoverBgColor={
                type === "expense" ? "hover:bg-red-700" : "hover:bg-gray-700"
              }
              textColor={type === "expense" ? "text-white" : "text-gray-300"}
              className="flex-1"
              onClick={() => setType("expense")}
            >
              Расход
            </Button>
          </div>
          <Input
            label="Категория"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Например: Еда, Зарплата"
            required
          />
          <Input
            label="Сумма"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Сумма"
            required
          />
          <Input
            label="Дата"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <div className="flex justify-between mt-4">
            <Button
              bgColor="bg-gray-700"
              hoverBgColor="hover:bg-gray-600"
              textColor="text-white"
              onClick={onClose}
            >
              Отмена
            </Button>
            <Button
              bgColor="bg-lime-600"
              hoverBgColor="hover:bg-lime-500"
              textColor="text-black"
            >
              Добавить
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

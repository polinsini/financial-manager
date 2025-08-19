import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  selectTransactions,
  updateTransaction,
  deleteTransaction,
} from "../store/slices/financeSlice";
import { selectUser } from "../store/slices/authSlice";
import {
  addNotification,
  removeNotification,
} from "../store/slices/notificationSlice";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { FaArrowLeft, FaArrowRight, FaTrash } from "react-icons/fa";

export const TransactionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const transactions = useAppSelector(selectTransactions);
  const user = useAppSelector(selectUser);
  const [transaction, setTransaction] = useState<
    null | (typeof transactions)[0]
  >(null);
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("expense");
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const tx = transactions.find((t) => t.id === id);
    if (tx) {
      setTransaction(tx);
      setAmount(tx.amount);
      setCategory(tx.category);
      setType(tx.type);
      setDate(tx.date.split("T")[0]);
    } else {
      dispatch(
        addNotification({ message: "Транзакция не найдена", type: "error" }),
      );
      navigate("/dashboard");
    }
  }, [id, transactions, dispatch, navigate]);

  const handleSave = async () => {
    if (!transaction || !user || !category || amount <= 0) {
      dispatch(
        addNotification({
          message: "Заполните все поля корректно",
          type: "error",
        }),
      );
      return;
    }
    const notificationId = Date.now().toString();
    dispatch(
      addNotification({ message: "Сохранение изменений...", type: "info" }),
    );
    try {
      await dispatch(
        updateTransaction({
          ...transaction,
          amount,
          category,
          type,
          date,
          userId: user.uid,
        }),
      ).unwrap();
      dispatch(
        addNotification({ message: "Транзакция обновлена", type: "success" }),
      );
    } catch {
      dispatch(
        addNotification({
          message: "Ошибка обновления транзакции",
          type: "error",
        }),
      );
    } finally {
      setTimeout(() => dispatch(removeNotification(notificationId)), 5000);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    const notificationId = Date.now().toString();
    dispatch(
      addNotification({ message: "Удаление транзакции...", type: "info" }),
    );
    try {
      await dispatch(deleteTransaction(transaction.id)).unwrap();
      dispatch(
        addNotification({ message: "Транзакция удалена", type: "success" }),
      );
      navigate("/dashboard");
    } catch {
      dispatch(
        addNotification({
          message: "Ошибка удаления транзакции",
          type: "error",
        }),
      );
    } finally {
      setTimeout(() => dispatch(removeNotification(notificationId)), 5000);
    }
  };

  const handleNavigate = (direction: "next" | "prev") => {
    const currentIndex = transactions.findIndex((t) => t.id === id);
    if (currentIndex === -1) return;
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < transactions.length) {
      navigate(`/transaction/${transactions[newIndex].id}`);
    }
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-[#000300] text-white">Загрузка...</div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-[#000300] text-white">
      <h1 className="text-2xl font-bold mb-6">Редактировать транзакцию</h1>
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md mx-auto">
        <div className="flex gap-4 mb-4">
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
            onClick={() => navigate("/dashboard")}
          >
            Назад
          </Button>
          <Button
            bgColor="bg-red-600"
            hoverBgColor="hover:bg-red-700"
            textColor="text-white"
            onClick={handleDelete}
          >
            <FaTrash />
          </Button>
          <Button
            bgColor="bg-lime-600"
            hoverBgColor="hover:bg-lime-500"
            textColor="text-black"
            onClick={handleSave}
          >
            Сохранить
          </Button>
        </div>
        <div className="flex justify-between mt-4">
          <Button
            bgColor="bg-blue-600"
            hoverBgColor="hover:bg-blue-700"
            textColor="text-white"
            onClick={() => handleNavigate("prev")}
            disabled={transactions.findIndex((t) => t.id === id) <= 0}
          >
            <FaArrowLeft /> Предыдущая
          </Button>
          <Button
            bgColor="bg-blue-600"
            hoverBgColor="hover:bg-blue-700"
            textColor="text-white"
            onClick={() => handleNavigate("next")}
            disabled={
              transactions.findIndex((t) => t.id === id) >=
              transactions.length - 1
            }
          >
            Следующая <FaArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
};

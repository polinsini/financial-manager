import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { db } from "../../firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

import type { RootState } from "../store";
import { formatDateForChart } from "../../components/date";
import { logEvent, analytics } from "../../firebase";
import { logToFirestore } from "../../logers";

import { subWeeks, subMonths, subYears, isAfter } from "date-fns";

export type DateFilterValue = "week" | "month" | "year" | "all";

export type Transaction = {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  date: string;
};

export type FinanceState = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
};

export const initialState: FinanceState = {
  transactions: [],
  loading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  "finance/fetchTransactions",
  async (userId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((d) => {
        const data = d.data() as Omit<Transaction, "id">;
        return {
          id: d.id,
          userId: data.userId,
          type: data.type,
          amount: data.amount,
          category: data.category,
          date: data.date || new Date().toISOString(),
        };
      });
    } catch (err) {
      await logToFirestore({
        type: "error",
        message: "Ошибка при загрузке транзакций",
        details: { error: String(err) },
        context: { userId },
      });
      return rejectWithValue("Не удалось загрузить транзакции");
    }
  },
);

export const addTransaction = createAsyncThunk(
  "finance/addTransaction",
  async (
    {
      userId,
      data,
    }: { userId: string; data: Omit<Transaction, "id" | "userId"> },
    { rejectWithValue },
  ) => {
    const start = performance.now();
    try {
      const docRef = await addDoc(collection(db, "transactions"), {
        ...data,
        userId,
      });
      const end = performance.now();
      const duration = end - start;

      logEvent(analytics, "transaction_save_time", { duration_ms: duration });
      return { id: docRef.id, ...data, userId };
    } catch (err) {
      await logToFirestore({
        type: "error",
        message: "Ошибка при добавлении транзакции",
        details: { error: String(err) },
        context: { userId, data },
      });
      return rejectWithValue("Не удалось добавить транзакцию");
    }
  },
);

export const deleteTransaction = createAsyncThunk(
  "finance/deleteTransaction",
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteDoc(doc(db, "transactions", id));
      return id;
    } catch (err) {
      await logToFirestore({
        type: "error",
        message: "Ошибка при удалении транзакции",
        details: { error: String(err) },
        context: { id },
      });
      return rejectWithValue("Не удалось удалить транзакцию");
    }
  },
);

export const updateTransaction = createAsyncThunk(
  "finance/updateTransaction",
  async (tx: Transaction, { rejectWithValue }) => {
    try {
      const txRef = doc(db, "transactions", tx.id);
      await updateDoc(txRef, {
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        date: tx.date,
      });
      return tx;
    } catch (err) {
      await logToFirestore({
        type: "error",
        message: "Ошибка при обновлении транзакции",
        details: { error: String(err) },
        context: { transaction: tx },
      });
      return rejectWithValue("Не удалось обновить транзакцию");
    }
  },
);

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactions = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.push(action.payload);
        state.loading = false;
        state.error = null;
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.payload,
        );
        state.loading = false;
        state.error = null;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.transactions.findIndex(
          (t) => t.id === action.payload.id,
        );
        if (index > -1) {
          state.transactions[index] = action.payload;
        }
        state.loading = false;
        state.error = null;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectTransactions = (state: RootState) =>
  state.finance.transactions;

const filterTransactionsByDate = (
  transactions: Transaction[],
  filter: DateFilterValue,
): Transaction[] => {
  if (filter === "all") return transactions;

  const now = new Date();
  let dateFrom: Date;

  switch (filter) {
    case "week":
      dateFrom = subWeeks(now, 1);
      break;
    case "month":
      dateFrom = subMonths(now, 1);
      break;
    case "year":
      dateFrom = subYears(now, 1);
      break;
    default:
      return transactions;
  }

  return transactions.filter((tx) => isAfter(new Date(tx.date), dateFrom));
};

export const selectFilteredIncomeData = createSelector(
  [selectTransactions, (_: RootState, filter: DateFilterValue) => filter],
  (transactions, filter) => {
    const filtered = filterTransactionsByDate(transactions, filter);
    return filtered.reduce<{ name: string; value: number }[]>((acc, tx) => {
      if (tx.type === "income") {
        const index = acc.findIndex((item) => item.name === tx.category);
        if (index > -1) {
          acc[index].value += tx.amount;
        } else {
          acc.push({ name: tx.category, value: tx.amount });
        }
      }
      return acc;
    }, []);
  },
);

export const selectFilteredExpenseData = createSelector(
  [selectTransactions, (_: RootState, filter: DateFilterValue) => filter],
  (transactions, filter) => {
    const filtered = filterTransactionsByDate(transactions, filter);
    return filtered.reduce<{ name: string; value: number }[]>((acc, tx) => {
      if (tx.type === "expense") {
        const index = acc.findIndex((item) => item.name === tx.category);
        if (index > -1) {
          acc[index].value += tx.amount;
        } else {
          acc.push({ name: tx.category, value: tx.amount });
        }
      }
      return acc;
    }, []);
  },
);

export const selectFilteredTrendsData = createSelector(
  [selectTransactions, (_: RootState, filter: DateFilterValue) => filter],
  (transactions, filter) => {
    const filtered = filterTransactionsByDate(transactions, filter);

    const grouped = filtered.reduce<
      Record<string, { income: number; expense: number }>
    >((acc, tx) => {
      const dateKey = formatDateForChart(tx.date);
      if (!acc[dateKey]) {
        acc[dateKey] = { income: 0, expense: 0 };
      }
      if (tx.type === "income") {
        acc[dateKey].income += tx.amount;
      } else {
        acc[dateKey].expense += tx.amount;
      }
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([date, { income, expense }]) => ({ date, income, expense }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
);
export default financeSlice.reducer;

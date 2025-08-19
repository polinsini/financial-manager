import { configureStore } from "@reduxjs/toolkit";
import financeReducer, {
  fetchTransactions,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  selectTransactions,
  selectFilteredIncomeData,
  selectFilteredExpenseData,
  FinanceState,
  Transaction,
} from "../store/slices/financeSlice";
import { AuthState } from "@/store/slices/authSlice";
import { NotificationState } from "@/store/slices/notificationSlice";
import { DateFilterValue } from "@/components/constants";

vi.mock("date-fns", () => ({
  subWeeks: vi.fn(
    (date, amount) =>
      new Date(date.getTime() - amount * 7 * 24 * 60 * 60 * 1000),
  ),
  subMonths: vi.fn((date, amount) => {
    const newDate = new Date(date);
    newDate.setMonth(newDate.getMonth() - amount);
    return newDate;
  }),
  subYears: vi.fn((date, amount) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() - amount);
    return newDate;
  }),
  isAfter: vi.fn((date1, date2) => date1 > date2),
}));

describe("financeSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        finance: financeReducer,
      },
    });
    vi.clearAllMocks();
  });
  afterEach(() => vi.clearAllTimers);
  const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

  describe("fetchTransactions", () => {
    it("should set loading to true when pending", async () => {
      store.dispatch({ type: fetchTransactions.pending.type });
      const state = (store.getState() as { finance: FinanceState }).finance;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
      await flushPromises();
    });

    it("should set transactions when fulfilled", async () => {
      const mockTransactions: Transaction[] = [
        {
          id: "1",
          userId: "user1",
          type: "income",
          amount: 100,
          category: "Salary",
          date: "2023-01-01",
        },
      ];

      store.dispatch({
        type: fetchTransactions.fulfilled.type,
        payload: mockTransactions,
      });

      const state = store.getState() as { finance: FinanceState };
      expect(state.finance.transactions).toEqual(mockTransactions);
      expect(state.finance.loading).toBe(false);
      await flushPromises();
    });

    it("should set error when rejected", async () => {
      const errorMsg = "Failed to fetch";
      store.dispatch({
        type: fetchTransactions.rejected.type,
        payload: errorMsg,
      });

      const state = store.getState() as { finance: FinanceState };
      expect(state.finance.error).toBe(errorMsg);
      expect(state.finance.loading).toBe(false);
      await flushPromises();
    });
  });

  describe("addTransaction", () => {
    it("should add transaction when fulfilled", async () => {
      const newTransaction: Transaction = {
        id: "2",
        userId: "user1",
        type: "expense",
        amount: 50,
        category: "Food",
        date: "2023-01-02",
      };

      store.dispatch({
        type: addTransaction.fulfilled.type,
        payload: newTransaction,
      });

      const state = store.getState() as { finance: FinanceState };
      expect(state.finance.transactions).toContainEqual(newTransaction);
      await flushPromises();
    });
  });

  describe("deleteTransaction", () => {
    it("should remove transaction when fulfilled", async () => {
      const transactionToDelete: Transaction = {
        id: "3",
        userId: "user1",
        type: "income",
        amount: 200,
        category: "Bonus",
        date: "2023-01-03",
      };

      store.dispatch({
        type: addTransaction.fulfilled.type,
        payload: transactionToDelete,
      });

      store.dispatch({
        type: deleteTransaction.fulfilled.type,
        payload: transactionToDelete.id,
      });

      const state = store.getState() as { finance: FinanceState };
      expect(state.finance.transactions).not.toContainEqual(
        transactionToDelete,
      );
      await flushPromises();
    });
  });

  describe("updateTransaction", () => {
    it("should update transaction when fulfilled", async () => {
      const originalTransaction: Transaction = {
        id: "4",
        userId: "user1",
        type: "expense",
        amount: 30,
        category: "Transport",
        date: "2023-01-04",
      };

      const updatedTransaction: Transaction = {
        ...originalTransaction,
        amount: 40,
        category: "Taxi",
      };

      store.dispatch({
        type: addTransaction.fulfilled.type,
        payload: originalTransaction,
      });

      store.dispatch({
        type: updateTransaction.fulfilled.type,
        payload: updatedTransaction,
      });

      const state = store.getState() as { finance: FinanceState };
      expect(state.finance.transactions).toContainEqual(updatedTransaction);
      expect(state.finance.transactions).not.toContainEqual(
        originalTransaction,
      );
      await flushPromises();
    });
  });

  describe("selectors", () => {
    it("should select transactions", () => {
      const mockTransactions: Transaction[] = [
        {
          id: "5",
          userId: "user1",
          type: "income",
          amount: 150,
          category: "Freelance",
          date: "2023-01-05",
        },
      ];

      store.dispatch({
        type: fetchTransactions.fulfilled.type,
        payload: mockTransactions,
      });

      const transactions = selectTransactions(
        store.getState() as {
          auth: AuthState;
          finance: FinanceState;
          notifications: NotificationState;
        },
      );
      expect(transactions).toEqual(mockTransactions);
    });

    it("should select income data", async () => {
      const mockTransactions: Transaction[] = [
        {
          id: "6",
          userId: "user1",
          type: "income",
          amount: 100,
          category: "Salary",
          date: "2023-01-06",
        },
        {
          id: "7",
          userId: "user1",
          type: "income",
          amount: 50,
          category: "Salary",
          date: "2023-01-07",
        },
        {
          id: "8",
          userId: "user1",
          type: "expense",
          amount: 30,
          category: "Food",
          date: "2023-01-08",
        },
      ];

      store.dispatch({
        type: fetchTransactions.fulfilled.type,
        payload: mockTransactions,
      });

      const filter: DateFilterValue = "all";
      const incomeData = selectFilteredIncomeData(
        store.getState() as {
          auth: AuthState;
          finance: FinanceState;
          notifications: NotificationState;
        },
        filter,
      );
      expect(incomeData).toEqual([{ name: "Salary", value: 150 }]);
      await flushPromises();
    });

    it("should select expense data", async () => {
      const mockTransactions: Transaction[] = [
        {
          id: "9",
          userId: "user1",
          type: "expense",
          amount: 20,
          category: "Food",
          date: "2023-01-09",
        },
        {
          id: "10",
          userId: "user1",
          type: "expense",
          amount: 15,
          category: "Transport",
          date: "2023-01-10",
        },
        {
          id: "11",
          userId: "user1",
          type: "income",
          amount: 100,
          category: "Salary",
          date: "2023-01-11",
        },
      ];

      store.dispatch({
        type: fetchTransactions.fulfilled.type,
        payload: mockTransactions,
      });
      const filter: DateFilterValue = "all";
      const expenseData = selectFilteredExpenseData(
        store.getState() as {
          auth: AuthState;
          finance: FinanceState;
          notifications: NotificationState;
        },
        filter,
      );
      expect(expenseData).toEqual([
        { name: "Food", value: 20 },
        { name: "Transport", value: 15 },
      ]);
      await flushPromises();
    });
  });
});

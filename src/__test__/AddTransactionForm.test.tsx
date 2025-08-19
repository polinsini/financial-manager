import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { AddTransactionForm } from "../components/AddTransactionForm";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../store/slices/authSlice";
import financeReducer from "../store/slices/financeSlice";
import notificationReducer from "../store/slices/notificationSlice";
import { AuthState } from "../store/slices/authSlice";

const initialAuthState: AuthState = {
  user: {
    uid: "test-user-id",
    email: "test@example.com",
    displayName: "Test User",
  },
  loading: false,
  authLoading: false,
  error: null,
  currencies: [
    { code: "RUB", symbol: "₽" },
    { code: "USD", symbol: "$" },
  ],
  currency: "RUB",
  currencySymbol: "₽",
};

const mockStore = configureStore({
  reducer: {
    auth: authReducer,
    finance: financeReducer,
    notifications: notificationReducer,
  },
  preloadedState: {
    auth: initialAuthState,
  },
});

describe("AddTransactionForm", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("корректно отображает форму добавления транзакции", () => {
    render(
      <Provider store={mockStore}>
        <AddTransactionForm onClose={mockOnClose} />
      </Provider>,
    );

    expect(screen.getByText("Добавить транзакцию")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Например: Еда, Зарплата"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Сумма")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0")).toBeInTheDocument();
    expect(screen.getByText("Доход")).toBeInTheDocument();
    expect(screen.getByText("Расход")).toBeInTheDocument();
    expect(screen.getByText("Отмена")).toBeInTheDocument();
    expect(screen.getByText("Добавить")).toBeInTheDocument();
  });

  it("позволяет изменять тип транзакции (доход/расход)", () => {
    render(
      <Provider store={mockStore}>
        <AddTransactionForm onClose={mockOnClose} />
      </Provider>,
    );

    const incomeButton = screen.getByText("Доход");
    const expenseButton = screen.getByText("Расход");

    expect(expenseButton).toHaveClass("bg-red-600");
    expect(incomeButton).toHaveClass("bg-gray-800");

    fireEvent.click(incomeButton);

    expect(incomeButton).toHaveClass("bg-green-600");
    expect(expenseButton).toHaveClass("bg-gray-800");
  });

  it('вызывает onClose при нажатии кнопки "Отмена"', () => {
    render(
      <Provider store={mockStore}>
        <AddTransactionForm onClose={mockOnClose} />
      </Provider>,
    );

    fireEvent.click(screen.getByText("Отмена"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});

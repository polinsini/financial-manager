import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  initAuth,
  register,
  login,
  logout,
  selectUser,
  selectAuthLoading,
} from "../store/slices/authSlice";

import type { AuthState } from "../store/slices/authSlice";
import { FinanceState } from "@/store/slices/financeSlice";
import { NotificationState } from "@/store/slices/notificationSlice";

describe("authSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe("initAuth", () => {
    it("установка для authLoading значение true в режиме ожидания", () => {
      store.dispatch({ type: initAuth.pending.type });
      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.authLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("set user when fulfilled", () => {
      const mockUser = {
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
      };

      store.dispatch({
        type: initAuth.fulfilled.type,
        payload: mockUser,
      });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.user).toEqual(mockUser);
      expect(state.authLoading).toBe(false);
    });

    it("set error when rejected", () => {
      store.dispatch({
        type: initAuth.rejected.type,
        error: { message: "Error" },
      });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.error).toBe("Не удалось инициализировать аутентификацию");
      expect(state.authLoading).toBe(false);
    });
  });

  describe("register", () => {
    it("установка для loading значение true в режиме ожидания", () => {
      store.dispatch({ type: register.pending.type });
      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("set user when fulfilled", () => {
      const mockUser = {
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
      };

      store.dispatch({
        type: register.fulfilled.type,
        payload: mockUser,
      });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
    });

    it("set error when rejected", () => {
      const errorMsg = "Registration failed";
      store.dispatch({
        type: register.rejected.type,
        error: { message: errorMsg },
      });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe("login", () => {
    it("установить значение true для загрузки в режиме ожидания", () => {
      store.dispatch({ type: login.pending.type });
      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("set user when fulfilled", () => {
      const mockUser = {
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
      };

      store.dispatch({
        type: login.fulfilled.type,
        payload: mockUser,
      });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
    });

    it("set error when rejected", () => {
      const errorMsg = "Login failed";
      store.dispatch({
        type: login.rejected.type,
        error: { message: errorMsg },
      });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.error).toBe(errorMsg);
      expect(state.loading).toBe(false);
    });
  });

  describe("logout", () => {
    it("reset user when fulfilled", () => {
      store.dispatch({
        type: login.fulfilled.type,
        payload: {
          uid: "123",
          email: "test@example.com",
          displayName: "Test User",
        },
      });

      store.dispatch({ type: logout.fulfilled.type });

      const state = (store.getState() as { auth: AuthState }).auth;
      expect(state.user).toBeNull();
      expect(state.currency).toBe("RUB");
      expect(state.currencySymbol).toBe("₽");
    });
  });

  describe("selectors", () => {
    it("select user", () => {
      const mockUser = {
        uid: "123",
        email: "test@example.com",
        displayName: "Test User",
      };

      store.dispatch({
        type: login.fulfilled.type,
        payload: mockUser,
      });

      const user = selectUser(
        store.getState() as {
          auth: AuthState;
          finance: FinanceState;
          notifications: NotificationState;
        },
      );
      expect(user).toEqual(mockUser);
    });

    it("select authLoading", () => {
      store.dispatch({ type: initAuth.pending.type });
      const loading = selectAuthLoading(
        store.getState() as {
          auth: AuthState;
          finance: FinanceState;
          notifications: NotificationState;
        },
      );
      expect(loading).toBe(true);
    });
  });
});

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getDoc, doc } from "firebase/firestore";
import { db, auth, analytics } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { logEvent } from "firebase/analytics";
import type { User } from "firebase/auth";
import { addNotification } from "./notificationSlice";
import { logToFirestore } from "../../logers";
import { FinanceState } from "./financeSlice";
import { NotificationState } from "./notificationSlice";

type Currency = { code: string; symbol: string };
interface FirebaseError extends Error {
  code: string;
  message: string;
}

function isFirebaseError(error: unknown): error is FirebaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "message" in error &&
    typeof (error as { code?: unknown }).code === "string" &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

function getErrorMessage(error: unknown): string {
  if (isFirebaseError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return String(error);
}

export interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  currency?: string;
  currencySymbol?: string;
}

export type AuthState = {
  user: SerializableUser | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  currencies: Currency[];
  currency: string;
  currencySymbol: string;
};

export const initialState: AuthState = {
  user: null,
  loading: false,
  authLoading: true,
  error: null,
  currencies: [
    { code: "RUB", symbol: "₽" },
    { code: "USD", symbol: "$" },
    { code: "EUR", symbol: "€" },
    { code: "AUD", symbol: "A$" },
    { code: "CAD", symbol: "C$" },
    { code: "CHF", symbol: "CHF" },
    { code: "CNY", symbol: "¥" },
    { code: "GBP", symbol: "£" },
    { code: "JPY", symbol: "¥" },
  ],
  currency: "RUB",
  currencySymbol: "₽",
};

export const initAuth = createAsyncThunk<
  SerializableUser | null,
  void,
  { rejectValue: string }
>("auth/initAuth", async (_, { dispatch }) => {
  return new Promise<SerializableUser | null>((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user: User | null) => {
        if (user) {
          try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const currency = userData.currency || "RUB";
              const currencyObj = initialState.currencies.find(
                (c) => c.code === currency,
              );
              resolve({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                currency,
                currencySymbol: currencyObj ? currencyObj.symbol : "₽",
              });
            } else {
              resolve({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
              });
            }
          } catch (error: unknown) {
            const message = getErrorMessage(error);
            await logToFirestore({
              userId: user.uid,
              type: "error",
              message: "Ошибка загрузки данных пользователя",
              details: {
                error: message,
                code: isFirebaseError(error) ? error.code : "unknown",
              },
              context: { action: "initAuth" },
            });
            dispatch(
              addNotification({
                message: "Ошибка загрузки данных пользователя",
                type: "error",
              }),
            );
            reject(error);
          }
        } else {
          resolve(null);
        }
        unsubscribe();
      },
      (error: unknown) => {
        const message = getErrorMessage(error);
        logToFirestore({
          type: "error",
          message: "Не удалось инициализировать аутентификацию",
          details: { error: message },
          context: { action: "initAuth" },
        });
        dispatch(
          addNotification({
            message: "Не удалось инициализировать аутентификацию",
            type: "error",
          }),
        );
        reject(error);
      },
    );
  });
});

export const register = createAsyncThunk<
  SerializableUser,
  { name: string; email: string; password: string },
  { rejectValue: string }
>("auth/register", async ({ name, email, password }, { dispatch }) => {
  dispatch(addNotification({ message: "Регистрация...", type: "info" }));
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    await updateProfile(userCredential.user, { displayName: name });

    await logToFirestore({
      userId: userCredential.user.uid,
      type: "info",
      message: "Пользователь зарегистрирован",
      context: { action: "register", email },
    });

    dispatch(
      addNotification({ message: "Регистрация успешна", type: "success" }),
    );

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
    };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? error.code === "auth/email-already-in-use"
        ? "Этот email уже зарегистрирован"
        : "Ошибка регистрации"
      : "Ошибка регистрации";

    await logToFirestore({
      type: "error",
      message,
      details: {
        error: getErrorMessage(error),
        code: isFirebaseError(error) ? error.code : "unknown",
      },
      context: { action: "register", email },
    });

    dispatch(addNotification({ message, type: "error" }));
    throw error;
  }
});

export const login = createAsyncThunk<
  SerializableUser,
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async ({ email, password }, { dispatch }) => {
  dispatch(addNotification({ message: "Вход...", type: "info" }));
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await logToFirestore({
      userId: userCredential.user.uid,
      type: "info",
      message: "Пользователь вошел в систему",
      context: { action: "login", email },
    });

    dispatch(addNotification({ message: "Вход успешен", type: "success" }));

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName,
    };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? error.code === "auth/wrong-password"
        ? "Неверный пароль"
        : error.code === "auth/user-not-found"
          ? "Пользователь не найден"
          : "Ошибка входа"
      : "Ошибка входа";

    await logToFirestore({
      type: "error",
      message,
      details: {
        error: getErrorMessage(error),
        code: isFirebaseError(error) ? error.code : "unknown",
      },
      context: { action: "login", email },
    });

    dispatch(addNotification({ message, type: "error" }));
    throw error;
  }
});

export const loginWithGoogle = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>("auth/loginWithGoogle", async (_, { dispatch }) => {
  dispatch(addNotification({ message: "Вход через Google...", type: "info" }));
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithRedirect(auth, provider);

    await logToFirestore({
      type: "info",
      message: "Инициирован вход через Google",
      context: { action: "loginWithGoogle" },
    });
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? error.code === "auth/redirect-cancelled-by-user"
        ? "Вход через Google отменен"
        : error.code === "auth/popup-blocked"
          ? "Всплывающее окно заблокировано браузером"
          : "Не удалось инициировать вход через Google"
      : "Не удалось инициировать вход через Google";

    await logToFirestore({
      type: "error",
      message,
      details: {
        error: getErrorMessage(error),
        code: isFirebaseError(error) ? error.code : "unknown",
      },
      context: { action: "loginWithGoogle" },
    });

    dispatch(addNotification({ message, type: "error" }));
    throw error;
  }
});

export const handleGoogleRedirectResult = createAsyncThunk<
  SerializableUser | null,
  void,
  { rejectValue: string }
>("auth/handleGoogleRedirectResult", async (_, { dispatch }) => {
  try {
    const result = await getRedirectResult(auth);
    if (!result) {
      console.log("No redirect result");
      return null;
    }
    if (result?.user) {
      const user = result.user;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      let currency = "RUB";
      let currencySymbol = "₽";
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currency = userData.currency || "RUB";
        const currencyObj = initialState.currencies.find(
          (c) => c.code === currency,
        );
        currencySymbol = currencyObj ? currencyObj.symbol : "₽";
      }

      await logToFirestore({
        userId: user.uid,
        type: "info",
        message: "Вход через Google успешен",
        context: { action: "handleGoogleRedirectResult", email: user.email },
      });

      dispatch(
        addNotification({
          message: "Вход через Google успешен",
          type: "success",
        }),
      );
      logEvent(analytics, "login", { method: "google" });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        currency,
        currencySymbol,
      };
    }
    return null;
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? error.code === "auth/redirect-cancelled-by-user"
        ? "Вход через Google отменен"
        : "Не удалось войти через Google"
      : "Не удалось войти через Google";

    await logToFirestore({
      type: "error",
      message,
      details: {
        error: getErrorMessage(error),
        code: isFirebaseError(error) ? error.code : "unknown",
      },
      context: { action: "handleGoogleRedirectResult" },
    });

    dispatch(addNotification({ message, type: "error" }));
    throw error;
  }
});

export const logout = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logout",
  async (_, { dispatch }) => {
    dispatch(addNotification({ message: "Выход...", type: "info" }));
    try {
      await signOut(auth);

      await logToFirestore({
        type: "info",
        message: "Пользователь вышел из системы",
        context: { action: "logout" },
      });

      dispatch(addNotification({ message: "Выход успешен", type: "success" }));
    } catch (error: unknown) {
      const message = "Не удалось выйти";
      await logToFirestore({
        type: "error",
        message,
        details: { error: getErrorMessage(error) },
        context: { action: "logout" },
      });
      dispatch(addNotification({ message, type: "error" }));
      throw error;
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initAuth.pending, (state) => {
        state.authLoading = true;
        state.error = null;
      })
      .addCase(
        initAuth.fulfilled,
        (state, action: PayloadAction<SerializableUser | null>) => {
          state.user = action.payload;
          state.authLoading = false;
          if (action.payload) {
            state.currency = action.payload.currency || "RUB";
            state.currencySymbol = action.payload.currencySymbol || "₽";
          }
        },
      )
      .addCase(initAuth.rejected, (state) => {
        state.user = null;
        state.authLoading = false;
        state.error = "Не удалось инициализировать аутентификацию";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        register.fulfilled,
        (state, action: PayloadAction<SerializableUser>) => {
          state.user = action.payload;
          state.loading = false;
        },
      )
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка регистрации";
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<SerializableUser>) => {
          state.user = action.payload;
          state.loading = false;
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Ошибка входа";
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(handleGoogleRedirectResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        handleGoogleRedirectResult.fulfilled,
        (state, action: PayloadAction<SerializableUser | null>) => {
          state.loading = false;
          if (action.payload) {
            state.user = action.payload;
            state.currency = action.payload.currency || "RUB";
            state.currencySymbol = action.payload.currencySymbol || "₽";
          }
        },
      )
      .addCase(handleGoogleRedirectResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.currency = "RUB";
        state.currencySymbol = "₽";
      });
  },
});

export const selectUser = (state: {
  auth: AuthState;
  finance: FinanceState;
  notifications: NotificationState;
}) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.authLoading;
export const selectCurrencies = (state: { auth: AuthState }) =>
  state.auth.currencies;
export const selectCurrency = (state: { auth: AuthState }) =>
  state.auth.currency;
export const selectCurrencySymbol = (state: { auth: AuthState }) =>
  state.auth.currencySymbol;

export default authSlice.reducer;

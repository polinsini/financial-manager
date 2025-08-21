import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { getDoc, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import type { User } from "firebase/auth";
import { addNotification, NotificationState } from "./notificationSlice";
import { logToFirestore } from "../../logers";
import { FinanceState } from "./financeSlice";

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
            const currency = userDoc.exists()
              ? userDoc.data().currency || "RUB"
              : "RUB";
            initialState.currencies.find((c) => c.code === currency);
            if (!userDoc.exists()) {
              await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                displayName: user.displayName,
                currency,
                createdAt: new Date().toISOString(),
              });
            }
            resolve({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              currency,
            });
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

    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && user.uid === userCredential.user.uid) {
          unsubscribe();
          resolve();
        }
      });
    });

    const currency = "RUB";
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email,
      displayName: name,
      currency,
      createdAt: new Date().toISOString(),
    });

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
      currency,
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

    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && user.uid === userCredential.user.uid) {
          unsubscribe();
          resolve();
        }
      });
    });

    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    const currency = userDoc.exists()
      ? userDoc.data().currency || "RUB"
      : "RUB";
    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        currency,
        createdAt: new Date().toISOString(),
      });
    }

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
      currency,
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
  SerializableUser,
  void,
  { rejectValue: string }
>("auth/loginWithGoogle", async (_, { dispatch }) => {
  dispatch(addNotification({ message: "Вход через Google...", type: "info" }));
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);

    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user && user.uid === userCredential.user.uid) {
          unsubscribe();
          resolve();
        }
      });
    });

    const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    let currency = "RUB";

    if (!userDoc.exists()) {
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        currency,
        createdAt: new Date().toISOString(),
      });

      await logToFirestore({
        userId: userCredential.user.uid,
        type: "info",
        message: "Пользователь зарегистрирован через Google",
        context: {
          action: "registerWithGoogle",
          email: userCredential.user.email,
        },
      });
    } else {
      currency = userDoc.data().currency || "RUB";

      await logToFirestore({
        userId: userCredential.user.uid,
        type: "info",
        message: "Пользователь вошел через Google",
        context: {
          action: "loginWithGoogle",
          email: userCredential.user.email,
        },
      });
    }

    dispatch(
      addNotification({
        message: "Вход через Google успешен",
        type: "success",
      }),
    );

    return {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      displayName: userCredential.user.displayName,
      currency,
    };
  } catch (error: unknown) {
    const message = isFirebaseError(error)
      ? "Ошибка входа через Google"
      : "Ошибка входа";

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
            const currencyObj = state.currencies.find(
              (c) => c.code === state.currency,
            );
            state.currencySymbol = currencyObj ? currencyObj.symbol : "₽";
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
          state.currency = action.payload.currency || "RUB";
          const currencyObj = state.currencies.find(
            (c) => c.code === state.currency,
          );
          state.currencySymbol = currencyObj ? currencyObj.symbol : "₽";
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
          state.currency = action.payload.currency || "RUB";
          const currencyObj = state.currencies.find(
            (c) => c.code === state.currency,
          );
          state.currencySymbol = currencyObj ? currencyObj.symbol : "₽";
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

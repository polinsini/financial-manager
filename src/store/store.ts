import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import financeReducer from "./slices/financeSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    finance: financeReducer,
    notifications: notificationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

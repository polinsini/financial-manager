import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";
export type Notification = {
  id: string;
  message: string | Error;
  type: "success" | "error" | "info";
};

export type NotificationState = {
  list: Notification[];
};

export const initialState: NotificationState = {
  list: [],
};

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    addNotification(state, action: { payload: Omit<Notification, "id"> }) {
      state.list.push({ id: Date.now().toString(), ...action.payload });
    },
    removeNotification(state, action: { payload: string }) {
      state.list = state.list.filter((n) => n.id !== action.payload);
    },
  },
});

export const { addNotification, removeNotification } =
  notificationSlice.actions;
export const selectNotifications = (state: RootState) =>
  state.notifications.list;
export default notificationSlice.reducer;

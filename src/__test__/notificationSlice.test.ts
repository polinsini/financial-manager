// notificationSlice.test.ts
import { configureStore } from "@reduxjs/toolkit";
import notificationReducer, {
  addNotification,
  removeNotification,
  selectNotifications,
  NotificationState,
} from "../store/slices/notificationSlice";
import { AuthState } from "@/store/slices/authSlice";
import { FinanceState } from "@/store/slices/financeSlice";

describe("notificationSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        notifications: notificationReducer,
      },
    });
  });

  describe("addNotification", () => {
    it("should add a new notification", () => {
      const newNotification = {
        message: "Test message",
        type: "info" as const,
      };

      store.dispatch(addNotification(newNotification));

      const state = store.getState() as { notifications: NotificationState };
      expect(state.notifications.list).toHaveLength(1);
      expect(state.notifications.list[0].message).toBe(newNotification.message);
      expect(state.notifications.list[0].type).toBe(newNotification.type);
      expect(state.notifications.list[0].id).toBeDefined();
    });

    it("should add multiple notifications", () => {
      const notification1 = { message: "First", type: "info" as const };
      const notification2 = { message: "Second", type: "success" as const };

      store.dispatch(addNotification(notification1));
      store.dispatch(addNotification(notification2));

      const state = store.getState() as { notifications: NotificationState };
      expect(state.notifications.list).toHaveLength(2);
      expect(state.notifications.list[0].message).toBe(notification1.message);
      expect(state.notifications.list[1].message).toBe(notification2.message);
    });

    it("should handle Error objects as messages", () => {
      const error = new Error("Test error");
      store.dispatch(addNotification({ message: error, type: "error" }));

      const state = store.getState() as { notifications: NotificationState };
      expect(state.notifications.list[0].message).toBe(error);
    });
  });

  describe("removeNotification", () => {
    it("should not fail when removing non-existent id", () => {
      store.dispatch(removeNotification("non-existent-id"));

      const state = store.getState() as { notifications: NotificationState };
      expect(state.notifications.list).toHaveLength(0);
    });
  });

  describe("selectNotifications", () => {
    it("should select all notifications", () => {
      const notifications = [
        { message: "First", type: "info" as const },
        { message: "Second", type: "success" as const },
      ];

      notifications.forEach((notif) => {
        store.dispatch(addNotification(notif));
      });

      const selected = selectNotifications(
        store.getState() as {
          auth: AuthState;
          finance: FinanceState;
          notifications: NotificationState;
        },
      );
      expect(selected).toHaveLength(2);
      expect(selected[0].message).toBe(notifications[0].message);
      expect(selected[1].message).toBe(notifications[1].message);
    });
  });
});

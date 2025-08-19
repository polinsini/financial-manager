// firebase.ts
import { vi } from "vitest";

export const auth = {
  onAuthStateChanged: vi.fn((callback) => {
    // Simulate a user being logged in
    callback({ uid: "u1", email: "test@test.com", displayName: "Tester" });
    return vi.fn(); // Return unsubscribe function
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
};

export const db = {
  collection: vi.fn(),
  doc: vi.fn(),
};

export const analytics = {
  logEvent: vi.fn(),
};

export const logEvent = vi.fn();

export const signInWithEmailAndPassword = vi.fn().mockResolvedValue({
  user: { uid: "u1", email: "test@test.com", displayName: "Tester" },
});

export const createUserWithEmailAndPassword = vi.fn().mockResolvedValue({
  user: { uid: "u1", email: "test@test.com", displayName: "Tester" },
});

export const updateProfile = vi.fn().mockResolvedValue(undefined);
export const signInWithRedirect = vi.fn().mockResolvedValue(undefined);
export const getRedirectResult = vi.fn().mockResolvedValue({
  user: { uid: "u1", email: "test@test.com", displayName: "Tester" },
});

export const GoogleAuthProvider = vi.fn().mockImplementation(() => ({
  setCustomParameters: vi.fn(),
  addScope: vi.fn(),
}));

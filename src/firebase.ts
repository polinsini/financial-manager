import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp({
  apiKey: "AIzaSyAsNhIXYVPaYgD1kSzMqnPQzLla4gElYUw",
  authDomain: "finance-manage-5632d.firebaseapp.com",
  projectId: "finance-manage-5632d",
  storageBucket: "finance-manage-5632d.firebasestorage.app",
  messagingSenderId: "577528538290",
  appId: "1:577528538290:web:76a95ed0427d30c3e555ab",
  measurementId: "G-42EWRD6GTT",
});
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { logEvent };

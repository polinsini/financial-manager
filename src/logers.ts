import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAppSelector } from "./store/hooks";
import { selectUser } from "./store/slices/authSlice";

type LogMetadata = {
  [key: string]: unknown;
};

interface LogEntry {
  userId?: string;
  type: "error" | "info" | "warning";
  message: string;
  details?: LogMetadata;
  context?: LogMetadata;
}

export const logToFirestore = async (log: LogEntry): Promise<void> => {
  try {
    const logId = Date.now().toString();
    await setDoc(doc(db, "logs", logId), {
      ...log,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error(
      "Failed to log to Firestore:",
      err instanceof Error ? err.message : String(err),
    );
  }
};

export const useLogger = () => {
  const user = useAppSelector(selectUser);

  const log = async (
    type: LogEntry["type"],
    message: string,
    details?: LogMetadata,
    context?: LogMetadata,
  ): Promise<void> => {
    await logToFirestore({
      userId: user?.uid,
      type,
      message,
      details,
      context,
    });
  };

  return { log };
};

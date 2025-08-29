import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

interface LogData {
  userId?: string;
  type: string;
  message: string;
  details?: object;
  context?: object;
}

export async function logToFirestore(data: LogData, retries = 3) {
  for (let i = 0; i < retries; i++) {
    await addDoc(collection(db, "logs"), {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return;
  }
}

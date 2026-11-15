import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { Session } from "../services/http";
const KEY = "contract-manager.session.v1";
export async function readSession(): Promise<Session | null> {
  const raw =
    Platform.OS === "web"
      ? sessionStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as Session;
    if (
      typeof s.accessToken !== "string" ||
      typeof s.refreshToken !== "string" ||
      !s.userId
    )
      return null;
    return s;
  } catch {
    return null;
  }
}
export async function writeSession(value: Session | null) {
  if (Platform.OS === "web") {
    if (value) sessionStorage.setItem(KEY, JSON.stringify(value));
    else sessionStorage.removeItem(KEY);
  } else if (value) await SecureStore.setItemAsync(KEY, JSON.stringify(value));
  else await SecureStore.deleteItemAsync(KEY);
}

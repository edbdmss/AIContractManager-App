import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { Session } from "../services/http";
const KEY = "contract-manager.session.v2";
export async function readSession(apiUrl: string): Promise<Session | null> {
  const raw =
    Platform.OS === "web"
      ? sessionStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
  if (!raw) return null;
  try {
    const saved = JSON.parse(raw) as { apiUrl: string; session: Session };
    if (saved.apiUrl !== apiUrl) return null;
    const s = saved.session;
    if (!s) return null;
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
export async function writeSession(value: Session | null, apiUrl: string) {
  if (Platform.OS === "web") {
    if (value)
      sessionStorage.setItem(KEY, JSON.stringify({ apiUrl, session: value }));
    else sessionStorage.removeItem(KEY);
  } else if (value)
    await SecureStore.setItemAsync(
      KEY,
      JSON.stringify({ apiUrl, session: value }),
    );
  else await SecureStore.deleteItemAsync(KEY);
}

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { createHttpClient, Session, errorText } from "../services/http";
import { readSession, writeSession } from "./storage";
export const API_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (Platform.OS === "android"
    ? "http://10.0.2.2:8080/api/aicontract"
    : "http://localhost:8080/api/aicontract");
type Auth = {
  ready: boolean;
  session: Session | null;
  demo: boolean;
  client: ReturnType<typeof createHttpClient>;
  error: string;
  signIn: (s: Session) => Promise<void>;
  logout: () => Promise<void>;
  enterDemo: () => void;
  exitDemo: () => void;
};
function createSessionMemory(){let current:Session|null=null;return {get:()=>current,set:(s:Session|null)=>{current=s;}};}
const Context = createContext<Auth | null>(null);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false),
    [session, setSession] = useState<Session | null>(null),
    [demo, setDemo] = useState(false),
    [error, setError] = useState("");
  const [memory]=useState(createSessionMemory);
  const apply = useCallback(async (s: Session | null) => {
    await writeSession(s);
    memory.set(s);
    setSession(s);
  }, [memory]);
  const expire = useCallback(async () => {
    memory.set(null);
    setSession(null);
    setDemo(false);
    setError("로그인" + "이 만료됐어요. 다시 로그인해 주세요.");
    await writeSession(null);
  }, [memory]);
  const getSession=useCallback(async()=>memory.get(),[memory]);
  const client = useMemo(
    () =>
      createHttpClient(API_URL, {
        get: getSession,
        set: apply,
        expired: expire,
      }),
    [apply, expire,getSession],
  );
  useEffect(() => {
    let active = true;
    readSession()
      .then((s) => {
        if (active) {
          memory.set(s);
          setSession(s);
        }
      })
      .catch(() => {
        if (active)
          setError("로그인 정보를 불러오지 못했어요. 다시 로그인해 주세요.");
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, [memory]);
  const signIn = async (s: Session) => {
    await apply(s);
    setDemo(false);
    setError("");
  };
  const logout = async () => {
    const s = memory.get();
    let failed = false;
    try {
      if (s)
        await client.publicRequest("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: s.refreshToken }),
        });
    } catch {
      failed = true;
    } finally {
      await apply(null);
      setDemo(false);
      setError(
        failed
          ? "기기에서는 로그아웃했어요. 서버 연결 실패로 서버의 로그인 해제는 확인하지 못했어요."
          : "",
      );
    }
  };
  return (
    <Context.Provider
      value={{
        ready,
        session,
        demo,
        client,
        error,
        signIn,
        logout,
        enterDemo: () => setDemo(true),
        exitDemo: () => setDemo(false),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
export function checkNativeOAuth() {
  if (Platform.OS !== "web" && Constants.appOwnership === "expo")
    throw new Error(
      "모바일 소셜 로그인은 Expo Go 대신 개발 빌드에서 확인해 주세요.",
    );
}
export { errorText };

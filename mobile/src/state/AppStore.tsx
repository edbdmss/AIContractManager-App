import {StoreContext} from "./StoreContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AppData, Contract, createDemoData, Message } from "../model";
import { useAuth } from "../auth/AuthContext";
import { ServerProvider } from "./ServerStore";
import type { Dashboard } from "../services/dataApi";
const KEY = "contract-manager:demo:v1";
export type Store = {
  mode: "demo" | "server";
  dashboard?: Dashboard | null;
  setDashboardMonth?: (month: string) => void;
  refresh: () => Promise<void>;
  verify: (id: string) => Promise<void>;
  acceptSuggestion: (id: string) => Promise<Contract>;
  data: AppData;
  ready: boolean;
  storageError: string;
  save: (c: Contract, suggestionId?: string) => Promise<Contract>;
  remove: (id: string) => Promise<void>;
  dismiss: (id?: string) => Promise<void>;
  togglePush: () => Promise<void>;
  addMessages: (messages: Message[]) => void;
};

const Context = StoreContext;
function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(createDemoData);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const queue = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed = JSON.parse(raw) as AppData;
        if (
          !Array.isArray(parsed.contracts) ||
          !Array.isArray(parsed.notices) ||
          !Array.isArray(parsed.messages) ||
          typeof parsed.pushEnabled !== "boolean"
        )
          throw new Error("invalid");
        setData(parsed);
      })
      .catch(() => {
        if (active)
          setStorageError(
            "저장된 정보를 불러오지 못했어요. 데모 데이터로 시작해요.",
          );
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    queue.current = queue.current
      .then(() => AsyncStorage.setItem(KEY, JSON.stringify(data)))
      .catch(() =>
        setStorageError(
          "기기에 저장하지 못했어요. 앱을 닫으면 변경 내용이 사라질 수 있어요.",
        ),
      );
  }, [data, ready]);
  const value: Store = {
    mode: "demo",
    refresh: async () => {},
    verify: async () => {},
    acceptSuggestion: async () => {
      throw new Error("데모 제안은 직접 열어 주세요.");
    },
    data,
    ready,
    storageError,
    save: async (contract, suggestionId) => {
      setData((prev) => ({
        ...prev,
        contracts: prev.contracts.some((c) => c.id === contract.id)
          ? prev.contracts.map((c) => (c.id === contract.id ? contract : c))
          : [contract, ...prev.contracts],
        notices: prev.notices.filter((n) => n.id !== suggestionId),
      }));
      return contract;
    },
    remove: async (id) =>
      setData((prev) => ({
        ...prev,
        contracts: prev.contracts.filter((c) => c.id !== id),
        notices: prev.notices.filter((n) => n.contractId !== id),
      })),
    dismiss: async (id) =>
      setData((prev) => ({
        ...prev,
        notices: id ? prev.notices.filter((n) => n.id !== id) : [],
      })),
    togglePush: async () =>
      setData((prev) => ({ ...prev, pushEnabled: !prev.pushEnabled })),
    addMessages: (messages) =>
      setData((prev) => ({
        ...prev,
        messages: [...prev.messages, ...messages],
      })),
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useApp() {
  const value = useContext(Context);
  if (!value) throw new Error("AppProvider missing");
  return value;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { demo,session } = useAuth();
  return demo ? (
    <DemoProvider>{children}</DemoProvider>
  ) : (
    <ServerProvider key={session?.userId||"signedout"}>{children}</ServerProvider>
  );
}

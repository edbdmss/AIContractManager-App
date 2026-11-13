import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppData, Contract, emptyContract, Notice,localDate } from "../model";
import { useAuth } from "../auth/AuthContext";
import {
  createContractsApi,
  fromServer,
  toServer,
} from "../services/contractsApi";
import { createDataApi } from "../services/dataApi";
import type { Dashboard } from "../services/dataApi";
import { errorText } from "../services/http";
import type { Store } from "./AppStore";
import {StoreContext} from "./StoreContext";
const empty = (): AppData => ({
  contracts: [],
  notices: [],
  pushEnabled: false,
  messages: [],
});
export function ServerProvider({ children }: { children: React.ReactNode }) {
  const { client, session } = useAuth();
  const userId = session?.userId;
  const api = useMemo(() => createContractsApi(client), [client]);
  const extra = useMemo(() => createDataApi(client), [client]);
  const [data, setData] = useState<AppData>(empty),
    [ready, setReady] = useState(!userId),
    [storageError, setError] = useState("");
  const generation = useRef(0);
  const currentMonth = localDate(new Date()).slice(0,7);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dashboardMonth, setDashboardMonth] = useState(currentMonth);
  const monthRef = useRef(currentMonth);
  useEffect(()=>{monthRef.current=dashboardMonth;},[dashboardMonth]);
  const refresh = useCallback(async () => {
    if (!userId) return;
    const version = ++generation.current;
    try {
      const contracts = await api.list();
      if (version !== generation.current)
        return;
      setData((prev) => ({ ...prev, contracts: contracts.map(fromServer) }));
      const results = await Promise.allSettled([
        extra.notices(),
        extra.preferences(),
        extra.dashboard(monthRef.current),
      ]);
      if (version !== generation.current)
        return;
      const [notices, prefs, report] = results;
      setData((prev) => ({
        ...prev,
        notices:
          notices.status === "fulfilled"
            ? notices.value.map((n): Notice => ({
                id: n.id,
                title: n.title,
                text: n.body,
                contractId: n.contractId || undefined,
                serverSuggestionId: n.suggestionId || undefined,
                suggestion: n.suggestionId
                  ? { title: n.title, amount: 0 }
                  : undefined,
              }))
            : prev.notices,
        pushEnabled:
          prefs.status === "fulfilled" ? prefs.value.enabled : prev.pushEnabled,
      }));
      if (report.status === "fulfilled") setDashboard(report.value);
      setError(
        results.some((r) => r.status === "rejected")
          ? "계약은 불러왔지만 일부 알림·리포트를 불러오지 못했어요. 다시 불러오기를 눌러 주세요."
          : "",
      );
    } catch (e) {
      if (version === generation.current) setError(errorText(e));
    } finally {
      if (version === generation.current) setReady(true);
    }
  }, [api, extra, userId]);
  useEffect(() => {
    let active=true;
    if(userId)void Promise.resolve().then(()=>{if(active)return refresh();});
    return()=>{active=false;};
  }, [userId, refresh]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    extra
      .dashboard(dashboardMonth)
      .then((value) => {
        if (active) setDashboard(value);
      })
      .catch((e) => {
        if (active) setError(errorText(e));
      });
    return () => {
      active = false;
    };
  }, [dashboardMonth, extra, userId]);
  const value: Store = {
    data,
    ready,
    storageError,
    mode: "server",
    dashboard,
    setDashboardMonth,
    refresh,
    save: async (c, suggestionId) => {
      const updating = !!c.server?.id;
      const saved = updating
        ? await api.update(c.id, toServer(c))
        : await api.create(toServer(c));
      const mapped = fromServer(saved);
      setData((prev) => ({
        ...prev,
        contracts: updating
          ? prev.contracts.map((old) => (old.id === mapped.id ? mapped : old))
          : [mapped, ...prev.contracts],
      }));
      if (suggestionId) {
        try {
          await client.request(
            `/subscription-suggestions/${encodeURIComponent(suggestionId)}/complete`,
            { method: "POST", body: JSON.stringify({ contractId: mapped.id }) },
          );
        } catch {
          setError(
            "계약은 저장됐지만 등록 제안 완료 처리는 실패했어요. 중복 등록하지 말고 알림을 확인해 주세요.",
          );
        }
      }
      void refresh();
      return mapped;
    },
    remove: async (id) => {
      await api.remove(id);
      setData((prev) => ({
        ...prev,
        contracts: prev.contracts.filter((c) => c.id !== id),
        notices: prev.notices.filter((n) => n.contractId !== id),
      }));
      void refresh();
    },
    verify: async (id) => {
      const c = data.contracts.find((c) => c.id === id);
      if (!c) return;
      const saved = await api.verify(id, c.amount);
      setData((prev) => ({
        ...prev,
        contracts: prev.contracts.map((old) =>
          old.id === id ? fromServer(saved) : old,
        ),
      }));
      void refresh();
    },
    dismiss: async (id) => {
      if (id) await extra.dismiss(id);
      else await extra.dismissAll();
      setData((prev) => ({
        ...prev,
        notices: id ? prev.notices.filter((n) => n.id !== id) : [],
      }));
    },
    togglePush: async () => {
      const result = await extra.setPreferences(!data.pushEnabled);
      setData((prev) => ({ ...prev, pushEnabled: result.enabled }));
    },
    addMessages: (messages) =>
      setData((prev) => ({
        ...prev,
        messages: [...prev.messages, ...messages],
      })),
    acceptSuggestion: async (id) => {
      const key = `contract-manager.draft:${userId}:${id}`;
      const cached = await AsyncStorage.getItem(key);
      if (cached) return JSON.parse(cached) as Contract;
      const result = await client.request<{
        suggestionId: string;
        subscriptionName: string;
        estimatedAmount: number;
        nextPaymentDate: string | null;
      }>(`/subscription-suggestions/${encodeURIComponent(id)}/accept`, {
        method: "POST",
      });
      const draft: Contract = {
        ...emptyContract(),
        category: "구독",
        title: result.subscriptionName,
        amount: result.estimatedAmount,
        eventDate: result.nextPaymentDate || "",
        eventLabel: "다음 결제",
        provider: "결제 알림에서 등록",
      };
      await AsyncStorage.setItem(key, JSON.stringify(draft));
      return draft;
    },
  };
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

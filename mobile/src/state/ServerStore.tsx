import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppData, Contract, emptyContract, Notice, localDate } from "../model";
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
import { StoreContext } from "./StoreContext";
const empty = (): AppData => ({
  contracts: [],
  notices: [],
  pushEnabled: false,
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
  const [contractsLoaded, setContractsLoaded] = useState(false),
    [noticesLoaded, setNoticesLoaded] = useState(false),
    [preferencesLoaded, setPreferencesLoaded] = useState(false),
    [dashboardLoading, setDashboardLoading] = useState(false),
    [dashboardError, setDashboardError] = useState("");
  const reportGeneration = useRef(0);
  const currentMonth = localDate(new Date()).slice(0, 7);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [dashboardMonth, setDashboardMonth] = useState(currentMonth);
  const monthRef = useRef(currentMonth);
  useEffect(() => {
    monthRef.current = dashboardMonth;
  }, [dashboardMonth]);
  const refresh = useCallback(async () => {
    if (!userId) return;
    const version = ++generation.current;
    const reportSeq = ++reportGeneration.current;
    try {
      const contracts = await api.list();
      if (version !== generation.current) return;
      setData((prev) => ({ ...prev, contracts: contracts.map(fromServer) }));
      setContractsLoaded(true);
      const results = await Promise.allSettled([
        extra.notices(),
        extra.preferences(),
        extra.dashboard(monthRef.current),
      ]);
      if (version !== generation.current) return;
      const [notices, prefs, report] = results;
      if (prefs.status === "fulfilled") setPreferencesLoaded(true);
      if (notices.status === "fulfilled") setNoticesLoaded(true);
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
              }))
            : prev.notices,
        pushEnabled:
          prefs.status === "fulfilled" ? prefs.value.enabled : prev.pushEnabled,
      }));
      if (
        report.status === "fulfilled" &&
        reportSeq === reportGeneration.current
      ) {
        setDashboard(report.value);
        setDashboardError("");
      } else if (
        report.status === "rejected" &&
        reportSeq === reportGeneration.current
      )
        setDashboardError(errorText(report.reason));
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
    let active = true;
    if (userId)
      void Promise.resolve().then(() => {
        if (active) return refresh();
      });
    return () => {
      active = false;
    };
  }, [userId, refresh]);
  useEffect(() => {
    if (!userId) return;
    let active = true;
    const seq = ++reportGeneration.current;
    void Promise.resolve().then(async () => {
      if (!active) return;
      setDashboardLoading(true);
      try {
        const value = await extra.dashboard(dashboardMonth);
        if (active && seq === reportGeneration.current) {
          setDashboard(value);
          setDashboardError("");
        }
      } catch (e) {
        if (active && seq === reportGeneration.current)
          setDashboardError(errorText(e));
      } finally {
        if (active && seq === reportGeneration.current)
          setDashboardLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [dashboardMonth, extra, userId]);
  const value: Store = {
    contractsLoaded,
    noticesLoaded,
    preferencesLoaded,
    dashboardLoading,
    dashboardError,
    data,
    ready,
    storageError,
    dashboard,
    setDashboardMonth,
    refresh,
    save: async (c, suggestionId) => {
      const key = suggestionId
        ? `contract-manager.draft:${userId}:${suggestionId}`
        : null;
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
      let completionFailed = false;
      if (key) {
        try {
          await AsyncStorage.setItem(key, JSON.stringify(mapped));
        } catch {
          completionFailed = true;
          setError(
            "계약은 저장됐지만 등록 제안의 처리 상태를 기기에 기록하지 못했어요. 내 계약에서 확인해 주세요.",
          );
        }
      }
      if (suggestionId && !completionFailed) {
        try {
          await client.request(
            `/subscription-suggestions/${encodeURIComponent(suggestionId)}/complete`,
            { method: "POST", body: JSON.stringify({ contractId: mapped.id }) },
          );
        } catch {
          completionFailed = true;
          setError(
            "계약은 저장됐지만 등록 제안 완료 처리는 실패했어요. 중복 등록하지 말고 알림을 확인해 주세요.",
          );
        }
      }
      if (!completionFailed) void refresh();
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
      generation.current++;
      if (id) await extra.dismiss(id);
      else await extra.dismissAll();
      setData((prev) => ({
        ...prev,
        notices: id ? prev.notices.filter((n) => n.id !== id) : [],
      }));
    },
    togglePush: async () => {
      generation.current++;
      const result = await extra.setPreferences(!data.pushEnabled);
      setData((prev) => ({ ...prev, pushEnabled: result.enabled }));
    },
    loadSuggestion: async (id) => {
      const key = `contract-manager.draft:${userId}:${id}`;
      const acceptedKey = `${key}:accepted`;
      const cached = await AsyncStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as Contract;
        if (parsed.server?.id) return fromServer(await api.get(parsed.id));
        if (await AsyncStorage.getItem(acceptedKey)) return parsed;
      }

      const pending = await client.request<
        { id: string; merchantName: string; estimatedAmount: number }[]
      >("/subscription-suggestions");
      const suggestion = pending.find((item) => item.id === id);
      if (!suggestion)
        throw new Error("이미 처리되었거나 찾을 수 없는 등록 제안이에요.");

      const accepted = await client.request<{
        suggestionId: string;
        subscriptionName: string;
        estimatedAmount: number;
        estimatedCycle: string;
        nextPaymentDate: string | null;
      }>(`/subscription-suggestions/${encodeURIComponent(id)}/accept`, {
        method: "POST",
      });
      const contract: Contract = {
        ...emptyContract(),
        category: "구독",
        title: accepted.subscriptionName,
        provider: accepted.subscriptionName,
        amount: accepted.estimatedAmount,
        eventDate: accepted.nextPaymentDate || "",
        eventLabel: "다음 결제",
      };
      await AsyncStorage.setItem(key, JSON.stringify(contract));
      await AsyncStorage.setItem(acceptedKey, "true");
      return contract;
    },
  };
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

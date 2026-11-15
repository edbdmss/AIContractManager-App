import React, { useContext } from "react";
import { useAuth } from "../auth/AuthContext";
import { ServerProvider } from "./ServerStore";
import { StoreContext } from "./StoreContext";
import type { AppData, Contract } from "../model";
import type { Dashboard } from "../services/dataApi";
export interface Store {
  data: AppData;
  ready: boolean;
  storageError: string;
  contractsLoaded: boolean;
  noticesLoaded: boolean;
  preferencesLoaded: boolean;
  dashboardLoading: boolean;
  dashboardError: string;
  dashboard: Dashboard | null;
  setDashboardMonth: (month: string) => void;
  refresh: () => Promise<void>;
  verify: (id: string) => Promise<void>;
  loadSuggestion: (id: string) => Promise<Contract>;
  save: (c: Contract, suggestionId?: string) => Promise<Contract>;
  remove: (id: string) => Promise<void>;
  dismiss: (id?: string) => Promise<void>;
  togglePush: () => Promise<void>;
}
export function useApp() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("AppProvider missing");
  return store;
}
export function AppProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  return (
    <ServerProvider key={session?.userId || "signedout"}>
      {children}
    </ServerProvider>
  );
}

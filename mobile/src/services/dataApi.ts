import type { HttpClient } from "./http";
export interface Dashboard {
  month: string;
  monthlyExpense: number;
  categoryExpenses: { category: string; amount: number; percentage: number }[];
  expiringContracts: {
    contractId: string;
    title: string;
    daysRemaining: number;
    contractEndDate: string;
  }[];
  calendarEvents: {
    date: string;
    eventType: string;
    contractId: string;
    contractTitle: string;
    title: string;
    description: string | null;
  }[];
}
export interface ServerNotice {
  id: string;
  contractId: string | null;
  suggestionId: string | null;
  title: string;
  body: string;
}
export function createDataApi(client: HttpClient) {
  return {
    dashboard: (month: string) =>
      client.request<Dashboard>(`/dashboard?month=${month}`),
    notices: () => client.request<ServerNotice[]>("/notifications"),
    dismiss: (id: string) =>
      client.request<void>(`/notifications/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    dismissAll: () =>
      client.request("/notifications/dismiss-all", { method: "POST" }),
    preferences: () =>
      client.request<{ enabled: boolean }>("/notifications/preferences"),
    setPreferences: (enabled: boolean) =>
      client.request<{ enabled: boolean }>("/notifications/preferences", {
        method: "PUT",
        body: JSON.stringify({ enabled }),
      }),
  };
}

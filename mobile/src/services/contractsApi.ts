import type { Contract, Category } from "../model";
import type { HttpClient } from "./http";
export interface ContractPayload {
  title: string;
  category: string;
  providerName: string | null;
  contractStartDate: string | null;
  contractEndDate: string | null;
  nextPaymentDate: string | null;
  cancellationDeadline: string | null;
  monthlyAmount: number | null;
  penaltyAmount: number | null;
  cancellationTerms: string | null;
  plainSummary: string | null;
}
export interface ServerContract extends ContractPayload {
  id: string;
  status: string;
  sourceType: string;
  amountVerified: boolean;
  currency: string;
}
const categoryCodes: Record<Category, string> = {
  부동산: "REAL_ESTATE",
  구독: "SUBSCRIPTION",
  운동: "FITNESS",
  통신: "TELECOM",
  기타: "OTHER",
};
export const displayCategory = (code: string): Category =>
  (Object.entries(categoryCodes).find(
    ([label, value]) => value === code || label === code,
  )?.[0] || "기타") as Category;
export function fromServer(c: ServerContract): Contract {
  const category = displayCategory(c.category);
  const eventDate =
    (category === "구독" ? c.nextPaymentDate : c.cancellationDeadline) ||
    c.nextPaymentDate ||
    c.contractEndDate ||
    "";
  return {
    id: c.id,
    title: c.title,
    provider: c.providerName || "",
    category,
    amount: c.monthlyAmount ?? 0,
    startDate: c.contractStartDate || "",
    endDate: c.contractEndDate || "",
    eventDate,
    eventLabel:
      category === "구독" && c.nextPaymentDate
        ? "다음 결제"
        : c.cancellationDeadline
          ? "해지 신청 마감"
          : c.nextPaymentDate
            ? "자동 갱신"
            : "계약 종료",
    summary: c.plainSummary || "",
    terms: c.cancellationTerms || "",
    server: c,
    serverNextPaymentDate: c.nextPaymentDate || "",
    serverCancellationDeadline: c.cancellationDeadline || "",
  };
}
export function toServer(c: Contract): ContractPayload {
  const original = c.server;
  const isCancellation = c.eventLabel.includes("해지");
  const isExpiry =
    c.eventLabel.includes("종료") || c.eventLabel.includes("만료");
  return {
    title: c.title.trim(),
    category:
      original && displayCategory(original.category) === c.category
        ? original.category
        : categoryCodes[c.category],
    providerName: c.provider.trim() || null,
    contractStartDate: c.startDate || null,
    contractEndDate: c.endDate || null,
    nextPaymentDate:
      c.category === "구독"
        ? c.eventDate || null
        : c.serverNextPaymentDate !== undefined
          ? c.serverNextPaymentDate || null
          : isCancellation || isExpiry
            ? original?.nextPaymentDate || null
            : c.eventDate || null,
    cancellationDeadline:
      c.serverCancellationDeadline !== undefined
        ? c.serverCancellationDeadline || null
        : isCancellation
          ? c.eventDate || null
          : original?.cancellationDeadline || null,
    monthlyAmount: c.amount,
    penaltyAmount: original?.penaltyAmount ?? null,
    cancellationTerms: c.terms || null,
    plainSummary: c.summary || null,
  };
}
export function createContractsApi(client: HttpClient) {
  return {
    list: () => client.request<ServerContract[]>("/contracts"),
    get: (id: string) =>
      client.request<ServerContract>(`/contracts/${encodeURIComponent(id)}`),
    create: (body: ContractPayload) =>
      client.request<ServerContract>("/contracts", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: async (id: string, body: ContractPayload) =>
      (await client.request<ServerContract | undefined>(
        `/contracts/${encodeURIComponent(id)}`,
        { method: "PUT", body: JSON.stringify(body) },
      )) ||
      client.request<ServerContract>(`/contracts/${encodeURIComponent(id)}`),
    remove: (id: string) =>
      client.request<void>(`/contracts/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
    verify: (id: string, monthlyAmount: number) =>
      client.request<ServerContract>(
        `/contracts/${encodeURIComponent(id)}/verify-amount`,
        { method: "POST", body: JSON.stringify({ monthlyAmount }) },
      ),
  };
}

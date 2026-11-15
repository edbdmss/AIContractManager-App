import type { ServerContract } from "./services/contractsApi";
export type Category = "부동산" | "구독" | "운동" | "통신" | "기타";
export const categories: Category[] = [
  "부동산",
  "구독",
  "운동",
  "통신",
  "기타",
];
export interface Contract {
  server?: ServerContract;
  serverNextPaymentDate?: string;
  serverCancellationDeadline?: string;
  id: string;
  title: string;
  provider: string;
  category: Category;
  amount: number;
  startDate: string;
  endDate: string;
  eventDate: string;
  eventLabel: string;
  summary: string;
  terms: string;
  sourceName?: string;
}
export interface Notice {
  id: string;
  title: string;
  text: string;
  contractId?: string;
  serverSuggestionId?: string;
}
export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}
export interface AppData {
  contracts: Contract[];
  notices: Notice[];
  pushEnabled: boolean;
}
export const money = (n: number) => n.toLocaleString("ko-KR");
export const dateText = (d: string) => (d ? d.replaceAll("-", ".") : "미입력");
export const localDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const parsed = new Date(y, m - 1, d);
  return (
    parsed.getFullYear() === y &&
    parsed.getMonth() === m - 1 &&
    parsed.getDate() === d
  );
}
export function validateContract(c: Contract, requireEvent = true) {
  if (!c.title.trim()) return "계약명을 입력해 주세요.";
  if (c.title.trim().length > 200 || c.provider.trim().length > 200)
    return "계약명과 상대방은 200자 이내로 입력해 주세요.";
  if (
    !Number.isFinite(c.amount) ||
    c.amount < 0 ||
    !Number.isSafeInteger(c.amount) ||
    c.amount > 9999999999999
  )
    return "금액은 0원 이상의 정수로 입력해 주세요.";
  if (c.serverNextPaymentDate && !validDate(c.serverNextPaymentDate))
    return "결제일 / 갱신일을 확인해 주세요.";
  if (c.serverCancellationDeadline && !validDate(c.serverCancellationDeadline))
    return "해지 마감일을 확인해 주세요.";
  if ((requireEvent || c.eventDate) && !validDate(c.eventDate))
    return "다음 일정은 YYYY-MM-DD 형식의 실제 날짜를 입력해 주세요.";
  if (c.startDate && !validDate(c.startDate))
    return "계약 시작일을 확인해 주세요.";
  if (c.endDate && !validDate(c.endDate)) return "계약 종료일을 확인해 주세요.";
  if (c.startDate && c.endDate && c.startDate > c.endDate)
    return "계약 종료일은 시작일 이후여야 해요.";
  return "";
}
export const emptyContract = (): Contract => ({
  id: "",
  title: "",
  provider: "",
  category: "기타",
  amount: 0,
  startDate: "",
  endDate: "",
  eventDate: "",
  eventLabel: "다음 일정",
  summary: "",
  terms: "",
});

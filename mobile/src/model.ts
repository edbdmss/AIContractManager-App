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
  suggestion?: { title: string; amount: number };
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
  messages: Message[];
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
export function validateContract(c: Contract,requireEvent=true) {
  if (!c.title.trim()) return "계약명을 입력해 주세요.";
  if (
    !Number.isFinite(c.amount) ||
    c.amount < 0 ||
    !Number.isSafeInteger(c.amount)
  )
    return "금액은 0원 이상의 정수로 입력해 주세요.";
  if (c.serverNextPaymentDate && !validDate(c.serverNextPaymentDate))
    return "결제일 / 갱신일을 확인해 주세요.";
  if (c.serverCancellationDeadline && !validDate(c.serverCancellationDeadline))
    return "해지 마감일을 확인해 주세요.";
  if ((requireEvent||c.eventDate) && !validDate(c.eventDate))
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
export function createDemoData(): AppData {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const at = (day: number) =>
    `${year}-${month}-${String(day).padStart(2, "0")}`;
  return {
    pushEnabled: true,
    messages: [],
    contracts: [
      {
        ...emptyContract(),
        id: "rent",
        title: "우리집 월세",
        provider: "김○○",
        category: "부동산",
        amount: 800000,
        eventDate: at(25),
        eventLabel: "월세 납부",
        startDate: `${year}-01-01`,
        endDate: `${year + 1}-12-31`,
        summary: "매월 25일 월세를 납부하는 주택 임대차 계약입니다.",
        terms: "계약 연장 및 해지 조건은 원본 계약서를 확인해 주세요.",
      },
      {
        ...emptyContract(),
        id: "netflix",
        title: "넷플릭스 프리미엄",
        provider: "Netflix",
        category: "구독",
        amount: 17000,
        eventDate: at(15),
        eventLabel: "다음 결제",
        summary: "월 단위로 결제되는 영상 구독 서비스입니다.",
      },
      {
        ...emptyContract(),
        id: "gym",
        title: "그린 피트니스",
        provider: "그린짐",
        category: "운동",
        amount: 50000,
        eventDate: at(18),
        eventLabel: "해지 신청 마감",
        summary:
          "월 회원권 계약입니다. 자동 갱신 전 해지 신청 기한을 확인해 주세요.",
        terms: "해지 신청 마감일까지 갱신 여부를 확인해 주세요.",
      },
      {
        ...emptyContract(),
        id: "phone",
        title: "휴대폰 요금제",
        provider: "통신사",
        category: "통신",
        amount: 45000,
        eventDate: at(20),
        eventLabel: "요금 납부",
        summary: "매월 납부하는 이동통신 요금제입니다.",
      },
    ],
    notices: [
      {
        id: "disney",
        title: "디즈니+를 구독으로 등록할까요?",
        text: "결제 알림에서 9,900원 결제를 찾았어요.\n내 계약에 추가하고 결제일을 챙겨보세요.",
        suggestion: { title: "디즈니+", amount: 9900 },
      },
      {
        id: "gym-notice",
        contractId: "gym",
        title: "그린 피트니스 해지 마감 안내",
        text: `${month}월 18일까지 갱신 여부를 확인해 주세요.`,
      },
      {
        id: "netflix-notice",
        contractId: "netflix",
        title: "넷플릭스 결제일이 다가와요",
        text: `${month}월 15일 · 17,000원 결제 예정`,
      },
      {
        id: "rent-notice",
        contractId: "rent",
        title: "우리집 월세 납부일 안내",
        text: `${month}월 25일 · 납부 일정을 확인해 주세요.`,
      },
    ],
  };
}
export function answerQuestion(
  q: string,
  contracts: Contract[],
  selectedId?: string,
) {
  const selected = contracts.find((c) => c.id === selectedId);
  const related = selected ? [selected] : contracts;
  if (/지출|얼마|금액/.test(q))
    return `등록된 ${selected ? "이 계약의" : "계약의"} 월 고정 지출은 ${money(related.reduce((n, c) => n + c.amount, 0))}원이에요.\n\n${related.map((c) => `${c.title} · ${money(c.amount)}원`).join("\n") || "등록된 계약이 없어요."}`;
  if (/해지|갱신|일정|결제/.test(q))
    return related.length
      ? [...related]
          .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
          .map(
            (c) =>
              `${c.title}\n${c.eventLabel} · ${dateText(c.eventDate)}${c.terms ? `\n${c.terms}` : ""}`,
          )
          .join("\n\n")
      : "등록된 계약이 없어요. 먼저 계약을 추가해 주세요.";
  return selected
    ? `${selected.title}\n\n${selected.summary || "등록된 요약이 없어요."}\n\n등록한 정보로 안내하고 있어요. 실제 조건은 원본 계약서에서 확인해 주세요.`
    : "등록된 계약의 월 지출이나 결제·해지 일정을 물어보세요. 현재는 등록한 정보로 답하는 데모 도우미예요.";
}

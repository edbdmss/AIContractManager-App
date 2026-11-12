import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeDocumentApi, completeSubscriptionSuggestionApi, createContractApi, uploadDocumentApi } from "../../api/contract";

export default function ContractRegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const query = new URLSearchParams(window.location.search);
  const suggestedName = query.get("name") || "";
  const suggestedAmount = query.get("amount") || "";
  const suggestionId = query.get("suggestionId") || "";
  const [mode, setMode] = useState(query.get("mode") === "subscription" ? "subscription" : "document");
  const [selectedFile, setSelectedFile] = useState(null);
  const [subscription, setSubscription] = useState({ name: suggestedName, amount: suggestedAmount, date: "" });
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  const updateSubscription = (event) => {
    setSubscription((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (mode === "document" && !selectedFile) {
      setError("분석할 계약서 파일을 선택해 주세요.");
      return;
    }
    if (mode === "subscription" && (!subscription.name.trim() || !subscription.amount || !subscription.date)) {
      setError("구독명, 금액, 결제일을 입력해 주세요.");
      return;
    }

    try {
      setStep(mode === "document" ? "계약서를 저장하는 중입니다." : "구독 정보를 저장하는 중입니다.");
      const { data: contract } = await createContractApi(mode === "document" ? {
          title: "AI 분석 중인 계약서",
          category: "UNCLASSIFIED",
          providerName: null,
          contractStartDate: null,
          contractEndDate: null,
          autoRenewalDate: null,
          cancellationDeadline: null,
          monthlyAmount: null,
          penaltyAmount: null,
          cancellationTerms: null,
          plainSummary: null,
        } : {
          title: subscription.name.trim(),
          category: "SUBSCRIPTION",
          providerName: subscription.name.trim(),
          contractStartDate: subscription.date,
          contractEndDate: null,
          autoRenewalDate: subscription.date,
          cancellationDeadline: null,
          monthlyAmount: Number(subscription.amount),
          penaltyAmount: null,
          cancellationTerms: null,
          plainSummary: "사용자가 직접 등록한 구독 서비스입니다.",
        });

      if (mode === "document") {
        setStep("파일을 업로드하는 중입니다.");
        const { data: document } = await uploadDocumentApi(contract.id, selectedFile);
        setStep("AI가 계약 기간, 금액, 갱신일, 해지 조건을 분석하는 중입니다.");
        await analyzeDocumentApi(contract.id, document.id);
      } else if (suggestionId) {
        await completeSubscriptionSuggestionApi(suggestionId, contract.id);
      }
      navigate(`/contracts/${contract.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "계약서 분석에 실패했습니다. AI 서버가 실행 중인지 확인해 주세요.");
      setStep("");
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>등록</h1>
        <div style={styles.tabs} role="tablist" aria-label="등록 방식">
          <button type="button" role="tab" aria-selected={mode === "document"} style={mode === "document" ? styles.activeTab : styles.tab} onClick={() => { setMode("document"); setError(""); setStep(""); }}>계약서 첨부</button>
          <button type="button" role="tab" aria-selected={mode === "subscription"} style={mode === "subscription" ? styles.activeTab : styles.tab} onClick={() => { setMode("subscription"); setError(""); setStep(""); }}>구독형</button>
        </div>
        {mode === "document" ? <>
        <p style={styles.subtitle}>계약서 파일을 업로드하면 AI가 내용을 분석해 계약 상세 항목을 채웁니다.</p>
        <div style={styles.notice}>
          <strong>AI 자동 입력 항목</strong>
          <p>계약명, 계약 상대방, 계약 기간, 월 금액, 자동 갱신일, 해지 마감일, 위약금, 해지 조건을 분석합니다.</p>
          <p>분석된 값은 계약 상세 화면에서 직접 수정할 수 있습니다.</p>
        </div>
        <label style={styles.label}>계약서 파일</label>
        <input ref={fileInputRef} type="file" accept=".pdf,.hwp,.hwpx,.docx,.jpg,.jpeg,.png" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} style={{ display: "none" }} />
        <button type="button" style={styles.fileButton} onClick={() => fileInputRef.current?.click()}>파일 선택</button>
        <p style={styles.fileName}>{selectedFile?.name || "선택된 파일 없음"}</p>
        </> : <>
          <p style={styles.subtitle}>계약서가 없어도 기본 정보만 입력해 구독을 등록할 수 있습니다.</p>
          <label style={styles.label} htmlFor="subscription-name">구독명</label>
          <input id="subscription-name" name="name" value={subscription.name} onChange={updateSubscription} placeholder="예: 넷플릭스" style={styles.input} />
          <label style={styles.label} htmlFor="subscription-amount">금액</label>
          <input id="subscription-amount" name="amount" type="number" min="0" value={subscription.amount} onChange={updateSubscription} placeholder="예: 13500" style={styles.input} />
          <label style={styles.label} htmlFor="subscription-date">결제일</label>
          <input id="subscription-date" name="date" type="date" value={subscription.date} onChange={updateSubscription} style={styles.input} />
        </>}
        {step ? <p style={styles.progress}>{step}</p> : null}
        {error ? <p style={styles.error}>{error}</p> : null}
        <button type="submit" style={styles.primaryButton} disabled={Boolean(step)}>{step || (mode === "document" ? "업로드하고 계약 상세 보기" : "구독 등록")}</button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16, background: "#f5f7fb" },
  card: { width: "100%", maxWidth: 600, padding: 28, borderRadius: 16, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", display: "grid", gap: 10 },
  title: { margin: 0 },
  tabs: { display: "flex", gap: 8, borderBottom: "1px solid #dbe5e8", marginBottom: 8 },
  tab: { flex: 1, padding: 12, border: 0, borderBottom: "2px solid transparent", background: "white", color: "#667085", cursor: "pointer" },
  activeTab: { flex: 1, padding: 12, border: 0, borderBottom: "2px solid #087e7d", background: "white", color: "#087e7d", fontWeight: 700, cursor: "pointer" },
  input: { height: 44, border: "1px solid #d0d5dd", borderRadius: 8, padding: "0 12px", font: "inherit" },
  subtitle: { margin: "0 0 8px", color: "#667085", lineHeight: 1.6 },
  notice: { padding: 16, borderRadius: 10, background: "#f3f8f7", color: "#475467", lineHeight: 1.6 },
  label: { fontSize: 14, fontWeight: 700, marginTop: 8 },
  fileButton: { width: "fit-content", padding: "10px 14px", border: "1px solid #087e7d", borderRadius: 8, background: "#fff", color: "#087e7d", fontWeight: 700, cursor: "pointer" },
  fileName: { margin: 0, color: "#667085", fontSize: 13 },
  progress: { margin: "8px 0 0", color: "#087e7d" },
  error: { margin: "8px 0 0", color: "#d92d20" },
  primaryButton: { marginTop: 12, height: 46, border: 0, borderRadius: 8, background: "#087e7d", color: "#fff", fontWeight: 700, cursor: "pointer" },
};

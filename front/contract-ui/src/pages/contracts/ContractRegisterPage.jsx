import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { analyzeDocumentApi, createContractApi, uploadDocumentApi } from "../../api/contract";

export default function ContractRegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!selectedFile) {
      setError("분석할 계약서 파일을 선택해 주세요.");
      return;
    }

    try {
      setStep("계약서를 저장하는 중입니다.");
      const { data: contract } = await createContractApi({
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
      });

      setStep("파일을 업로드하는 중입니다.");
      const { data: document } = await uploadDocumentApi(contract.id, selectedFile);
      setStep("AI가 계약 기간, 금액, 갱신일, 해지 조건을 분석하는 중입니다.");
      await analyzeDocumentApi(contract.id, document.id);
      navigate(`/contracts/${contract.id}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "계약서 분석에 실패했습니다. AI 서버가 실행 중인지 확인해 주세요.");
      setStep("");
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>계약서 등록</h1>
        <p style={styles.subtitle}>계약서 파일만 업로드하면 AI가 내용을 분석해 계약 상세 항목을 채웁니다.</p>
        <div style={styles.notice}>
          <strong>AI 자동 입력 항목</strong>
          <p>계약명, 계약 상대방, 계약 기간, 월 금액, 자동 갱신일, 해지 마감일, 위약금, 해지 조건을 분석합니다.</p>
          <p>분석된 값은 계약 상세 화면에서 직접 수정할 수 있습니다.</p>
        </div>
        <label style={styles.label}>계약서 파일</label>
        <input ref={fileInputRef} type="file" accept=".pdf,.hwp,.hwpx,.docx,.jpg,.jpeg,.png" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} style={{ display: "none" }} />
        <button type="button" style={styles.fileButton} onClick={() => fileInputRef.current?.click()}>파일 선택</button>
        <p style={styles.fileName}>{selectedFile?.name || "선택된 파일 없음"}</p>
        {step ? <p style={styles.progress}>{step}</p> : null}
        {error ? <p style={styles.error}>{error}</p> : null}
        <button type="submit" style={styles.primaryButton} disabled={Boolean(step)}>{step ? "AI 분석 중..." : "업로드하고 계약 상세 보기"}</button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16, background: "#f5f7fb" },
  card: { width: "100%", maxWidth: 600, padding: 28, borderRadius: 16, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", display: "grid", gap: 10 },
  title: { margin: 0 },
  subtitle: { margin: "0 0 8px", color: "#667085", lineHeight: 1.6 },
  notice: { padding: 16, borderRadius: 10, background: "#f3f8f7", color: "#475467", lineHeight: 1.6 },
  label: { fontSize: 14, fontWeight: 700, marginTop: 8 },
  fileButton: { width: "fit-content", padding: "10px 14px", border: "1px solid #087e7d", borderRadius: 8, background: "#fff", color: "#087e7d", fontWeight: 700, cursor: "pointer" },
  fileName: { margin: 0, color: "#667085", fontSize: 13 },
  progress: { margin: "8px 0 0", color: "#087e7d" },
  error: { margin: "8px 0 0", color: "#d92d20" },
  primaryButton: { marginTop: 12, height: 46, border: 0, borderRadius: 8, background: "#087e7d", color: "#fff", fontWeight: 700, cursor: "pointer" },
};

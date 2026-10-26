import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createContractApi, uploadDocumentApi } from "../../api/contract";

const initialForm = { title: "", category: "", providerName: "" };

export default function ContractRegisterPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const onPickFile = (event) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.category.trim()) {
      setError("계약 제목과 카테고리를 입력해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data: contract } = await createContractApi({
        title: form.title.trim(),
        category: form.category.trim(),
        providerName: form.providerName.trim() || null,
        contractStartDate: null,
        contractEndDate: null,
        autoRenewalDate: null,
        cancellationDeadline: null,
        monthlyAmount: null,
        penaltyAmount: null,
        cancellationTerms: null,
        plainSummary: null,
      });

      if (selectedFile) {
        await uploadDocumentApi(contract.id, selectedFile);
      }

      navigate(`/contracts/${contract.id}`);
    } catch (requestError) {
      const status = requestError.response?.status;
      setError(
        status === 401
          ? "실제 계약 기능은 카카오 또는 네이버 로그인 후 사용할 수 있습니다."
          : requestError.response?.data?.message || "계약 등록에 실패했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h1 style={styles.title}>계약 등록</h1>
        <p style={styles.subtitle}>기본 정보를 입력한 뒤 계약 문서를 첨부할 수 있습니다.</p>

        <label style={styles.label}>계약 제목 *</label>
        <input name="title" value={form.title} onChange={onChange} style={styles.input} placeholder="예: 헬스장 12개월 이용권" />

        <label style={styles.label}>카테고리 *</label>
        <input name="category" value={form.category} onChange={onChange} style={styles.input} placeholder="예: FITNESS, RENTAL, SUBSCRIPTION" />

        <label style={styles.label}>계약 상대방</label>
        <input name="providerName" value={form.providerName} onChange={onChange} style={styles.input} placeholder="예: 동네 헬스장" />

        <label style={styles.label}>계약 문서 (선택)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.hwp,.hwpx,.docx,.jpg,.jpeg,.png"
          onChange={onPickFile}
          style={{ display: "none" }}
        />
        <button type="button" style={styles.fileButton} onClick={() => fileInputRef.current?.click()}>
          파일 선택
        </button>
        <p style={styles.fileName}>{selectedFile?.name || "선택된 파일 없음"}</p>

        {error ? <p style={styles.error}>{error}</p> : null}
        <button type="submit" style={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "등록 중..." : "계약 등록"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", display: "grid", placeItems: "center", padding: 16, background: "#f5f7fb" },
  card: { width: "100%", maxWidth: 560, padding: 24, borderRadius: 16, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", display: "grid", gap: 8 },
  title: { margin: 0 },
  subtitle: { margin: "0 0 12px", color: "#667085" },
  label: { fontSize: 14, fontWeight: 700, marginTop: 8 },
  input: { height: 42, border: "1px solid #d0d5dd", borderRadius: 8, padding: "0 12px" },
  fileButton: { width: "fit-content", padding: "9px 12px", border: "1px solid #d0d5dd", borderRadius: 8, background: "#fff", cursor: "pointer" },
  fileName: { margin: 0, color: "#667085", fontSize: 13 },
  error: { margin: "8px 0 0", color: "#d92d20" },
  primaryButton: { marginTop: 12, height: 46, border: 0, borderRadius: 8, background: "#087e7d", color: "#fff", fontWeight: 700, cursor: "pointer" },
};

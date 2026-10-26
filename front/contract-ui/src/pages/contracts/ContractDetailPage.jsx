import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteContractApi,
  getContractApi,
  listDocumentsApi,
  updateContractApi,
  verifyAmountApi,
} from "../../api/contract";

const editableFields = [
  "title",
  "category",
  "providerName",
  "contractStartDate",
  "contractEndDate",
  "autoRenewalDate",
  "cancellationDeadline",
  "monthlyAmount",
  "penaltyAmount",
  "cancellationTerms",
  "plainSummary",
];

const toForm = (contract) =>
  Object.fromEntries(editableFields.map((field) => [field, contract[field] ?? ""]));

const toPayload = (form) => ({
  ...form,
  title: form.title.trim(),
  category: form.category.trim(),
  providerName: form.providerName.trim() || null,
  contractStartDate: form.contractStartDate || null,
  contractEndDate: form.contractEndDate || null,
  autoRenewalDate: form.autoRenewalDate || null,
  cancellationDeadline: form.cancellationDeadline || null,
  monthlyAmount: form.monthlyAmount === "" ? null : Number(form.monthlyAmount),
  penaltyAmount: form.penaltyAmount === "" ? null : Number(form.penaltyAmount),
  cancellationTerms: form.cancellationTerms.trim() || null,
  plainSummary: form.plainSummary.trim() || null,
});

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    Promise.all([getContractApi(id), listDocumentsApi(id)])
      .then(([contractResponse, documentResponse]) => {
        setContract(contractResponse.data);
        setForm(toForm(contractResponse.data));
        setDocuments(documentResponse.data);
      })
      .catch((requestError) => {
        setError(
          requestError.response?.status === 404
            ? "계약을 찾을 수 없습니다."
            : "계약 정보를 불러오지 못했습니다."
        );
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const save = async () => {
    if (!form.title.trim() || !form.category.trim()) {
      setError("계약 제목과 카테고리는 필수입니다.");
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      const { data } = await updateContractApi(id, toPayload(form));
      setContract(data);
      setForm(toForm(data));
      setMessage("수정 사항을 저장했습니다.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "계약 저장에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const verifyAmount = async () => {
    if (form.monthlyAmount === "") {
      setError("확인할 월 납부 금액을 입력해 주세요.");
      return;
    }

    try {
      const { data } = await verifyAmountApi(id, Number(form.monthlyAmount));
      setContract(data);
      setMessage("월 납부 금액을 확인했습니다.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "금액 확인에 실패했습니다.");
    }
  };

  const remove = async () => {
    if (!window.confirm("이 계약을 삭제할까요?")) return;

    try {
      await deleteContractApi(id);
      navigate("/contracts", { replace: true });
    } catch {
      setError("계약 삭제에 실패했습니다.");
    }
  };

  if (isLoading) return <p>계약 정보를 불러오는 중...</p>;
  if (error && !contract) return <p style={styles.error}>{error}</p>;
  if (!form || !contract) return null;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>계약 상세</h2>
          <p style={styles.muted}>상태: {contract.status} · 금액 확인: {contract.amountVerified ? "완료" : "필요"}</p>
        </div>
        <button type="button" style={styles.deleteButton} onClick={remove}>삭제</button>
      </div>

      <section style={styles.card}>
        <Field label="계약 제목 *" name="title" value={form.title} onChange={onChange} />
        <Field label="카테고리 *" name="category" value={form.category} onChange={onChange} />
        <Field label="계약 상대방" name="providerName" value={form.providerName} onChange={onChange} />
        <div style={styles.twoColumns}>
          <Field label="계약 시작일" name="contractStartDate" type="date" value={form.contractStartDate} onChange={onChange} />
          <Field label="계약 종료일" name="contractEndDate" type="date" value={form.contractEndDate} onChange={onChange} />
          <Field label="자동 갱신일" name="autoRenewalDate" type="date" value={form.autoRenewalDate} onChange={onChange} />
          <Field label="해지 마감일" name="cancellationDeadline" type="date" value={form.cancellationDeadline} onChange={onChange} />
        </div>
        <Field label="월 납부 금액" name="monthlyAmount" type="number" min="0" value={form.monthlyAmount} onChange={onChange} />
        <button type="button" style={styles.secondaryButton} onClick={verifyAmount}>월 납부 금액 확인</button>
        <Field label="위약금" name="penaltyAmount" type="number" min="0" value={form.penaltyAmount} onChange={onChange} />
        <Field label="해지 조건" name="cancellationTerms" value={form.cancellationTerms} onChange={onChange} multiline />
        <Field label="쉬운 설명" name="plainSummary" value={form.plainSummary} onChange={onChange} multiline />

        {error ? <p style={styles.error}>{error}</p> : null}
        {message ? <p style={styles.success}>{message}</p> : null}
        <button type="button" style={styles.primaryButton} onClick={save} disabled={isSaving}>
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </section>

      <section style={styles.card}>
        <h3 style={{ marginTop: 0 }}>첨부 문서</h3>
        {documents.length === 0 ? <p style={styles.muted}>첨부된 문서가 없습니다.</p> : documents.map((document) => (
          <p key={document.id} style={styles.document}>{document.originalFilename} · {Math.ceil(document.fileSize / 1024)} KB</p>
        ))}
      </section>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", min, multiline = false }) {
  return (
    <label style={styles.field}>
      <span>{label}</span>
      {multiline ? <textarea name={name} value={value} onChange={onChange} style={styles.textarea} rows="4" /> : <input name={name} type={type} min={min} value={value} onChange={onChange} style={styles.input} />}
    </label>
  );
}

const styles = {
  page: { display: "grid", gap: 16, maxWidth: 840 },
  header: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" },
  card: { padding: 20, background: "#fff", border: "1px solid #dbe5e8", borderRadius: 12 },
  muted: { color: "#667085" },
  twoColumns: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 },
  field: { display: "grid", gap: 6, marginBottom: 12, fontWeight: 700, fontSize: 14 },
  input: { height: 40, padding: "0 10px", border: "1px solid #d0d5dd", borderRadius: 8 },
  textarea: { padding: 10, border: "1px solid #d0d5dd", borderRadius: 8, resize: "vertical" },
  primaryButton: { width: "100%", height: 44, border: 0, borderRadius: 8, background: "#087e7d", color: "#fff", fontWeight: 700, cursor: "pointer" },
  secondaryButton: { margin: "-4px 0 12px", padding: "8px 10px", border: "1px solid #087e7d", borderRadius: 8, background: "#fff", color: "#087e7d", cursor: "pointer" },
  deleteButton: { padding: "8px 12px", border: "1px solid #d92d20", borderRadius: 8, background: "#fff", color: "#d92d20", cursor: "pointer" },
  error: { color: "#d92d20" },
  success: { color: "#087e7d" },
  document: { margin: "8px 0", padding: 10, borderRadius: 8, background: "#f3f6f8" },
};

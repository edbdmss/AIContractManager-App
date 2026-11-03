import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteContractApi,
  deleteDocumentApi,
  downloadDocumentApi,
  getContractApi,
  listDocumentsApi,
  updateContractApi,
  uploadDocumentApi,
  verifyAmountApi,
} from "../../api/contract";

const fields = ["title", "category", "providerName", "contractStartDate", "contractEndDate", "autoRenewalDate", "cancellationDeadline", "monthlyAmount", "penaltyAmount", "cancellationTerms", "plainSummary"];
const toForm = (contract) => Object.fromEntries(fields.map((field) => [field, contract[field] ?? ""]));
const toPayload = (form) => ({ ...form, title: form.title.trim(), category: form.category.trim(), providerName: form.providerName.trim() || null, contractStartDate: form.contractStartDate || null, contractEndDate: form.contractEndDate || null, autoRenewalDate: form.autoRenewalDate || null, cancellationDeadline: form.cancellationDeadline || null, monthlyAmount: form.monthlyAmount === "" ? null : Number(form.monthlyAmount), penaltyAmount: form.penaltyAmount === "" ? null : Number(form.penaltyAmount), cancellationTerms: form.cancellationTerms.trim() || null, plainSummary: form.plainSummary.trim() || null });

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [form, setForm] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([getContractApi(id), listDocumentsApi(id)])
      .then(([contractResponse, documentResponse]) => {
        if (!active) return;
        setContract(contractResponse.data);
        setForm(toForm(contractResponse.data));
        setDocuments(documentResponse.data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || "계약 정보를 불러오지 못했습니다.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, reloadVersion]);

  const onChange = (event) => setForm((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const save = async () => {
    if (!form.title.trim() || !form.category.trim()) return setError("계약 제목과 카테고리는 필수입니다.");
    try {
      setSaving(true);
      setError("");
      setMessage("");
      const response = await updateContractApi(id, toPayload(form));
      // 일부 환경에서는 PUT 응답 본문이 비어 있어도 DB 반영은 완료될 수 있습니다.
      // 응답이 없으면 저장 직후 GET으로 최신 계약을 확인합니다.
      const savedContract = response.data || (await getContractApi(id)).data;
      setContract(savedContract);
      setForm(toForm(savedContract));
      setMessage("계약 정보를 저장했습니다.");
    }
    catch (requestError) { setError(requestError.response?.data?.message || "계약 저장에 실패했습니다."); }
    finally { setSaving(false); }
  };
  const verifyAmount = async () => {
    try { const { data } = await verifyAmountApi(id, Number(form.monthlyAmount)); setContract(data); setMessage("월 금액 확인을 완료했습니다."); }
    catch (requestError) { setError(requestError.response?.data?.message || "금액 확인에 실패했습니다."); }
  };
  const remove = async () => {
    if (!window.confirm("이 계약을 삭제할까요?")) return;
    try { await deleteContractApi(id); navigate("/contracts", { replace: true }); }
    catch (requestError) { setError(requestError.response?.data?.message || "계약 삭제에 실패했습니다."); }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try { await uploadDocumentApi(id, file); setMessage("문서를 업로드했습니다."); setReloadVersion((version) => version + 1); }
    catch (requestError) { setError(requestError.response?.data?.message || "문서 업로드에 실패했습니다."); }
    finally { event.target.value = ""; }
  };
  const download = async (document) => {
    try { const response = await downloadDocumentApi(id, document.id); const url = URL.createObjectURL(response.data); const link = window.document.createElement("a"); link.href = url; link.download = document.originalFilename; link.click(); URL.revokeObjectURL(url); }
    catch (requestError) { setError(requestError.response?.data?.message || "문서 다운로드에 실패했습니다."); }
  };
  const removeDocument = async (documentId) => {
    if (!window.confirm("이 문서를 삭제할까요?")) return;
    try { await deleteDocumentApi(id, documentId); setMessage("문서를 삭제했습니다."); setReloadVersion((version) => version + 1); }
    catch (requestError) { setError(requestError.response?.data?.message || "문서 삭제에 실패했습니다."); }
  };

  if (loading) return <p>계약 정보를 불러오는 중...</p>;
  if (!contract || !form) return <p style={styles.error}>{error || "계약을 찾을 수 없습니다."}</p>;

  return (
    <div style={styles.page}>
      <div style={styles.header}><div><h2 style={{ margin: 0 }}>계약 상세</h2><p style={styles.muted}>상태: {contract.status} · 금액 확인: {contract.amountVerified ? "완료" : "필요"}</p></div><button type="button" style={styles.deleteButton} onClick={remove}>계약 삭제</button></div>
      <section style={styles.card}>
        <Field label="계약 제목" name="title" value={form.title} onChange={onChange} />
        <Field label="카테고리" name="category" value={form.category} onChange={onChange} />
        <Field label="계약 상대방" name="providerName" value={form.providerName} onChange={onChange} />
        <div style={styles.twoColumns}><Field label="계약 시작일" name="contractStartDate" type="date" value={form.contractStartDate} onChange={onChange} /><Field label="계약 종료일" name="contractEndDate" type="date" value={form.contractEndDate} onChange={onChange} /><Field label="자동 갱신일" name="autoRenewalDate" type="date" value={form.autoRenewalDate} onChange={onChange} /><Field label="해지 마감일" name="cancellationDeadline" type="date" value={form.cancellationDeadline} onChange={onChange} /></div>
        <Field label="월 납부 금액" name="monthlyAmount" type="number" value={form.monthlyAmount} onChange={onChange} />
        <button type="button" style={styles.secondaryButton} onClick={verifyAmount}>월 납부 금액 확인</button>
        <Field label="위약금" name="penaltyAmount" type="number" value={form.penaltyAmount} onChange={onChange} />
        <Field label="해지 조건" name="cancellationTerms" value={form.cancellationTerms} onChange={onChange} multiline />
        <Field label="쉬운 설명" name="plainSummary" value={form.plainSummary} onChange={onChange} multiline />
        {error ? <p style={styles.error}>{error}</p> : null}{message ? <p style={styles.success}>{message}</p> : null}
        <button type="button" style={styles.primaryButton} onClick={save} disabled={saving}>{saving ? "저장 중..." : "저장"}</button>
      </section>
      <section style={styles.card}><h3 style={{ marginTop: 0 }}>첨부 문서</h3><input type="file" accept=".pdf,.hwp,.hwpx,.docx,.jpg,.jpeg,.png" onChange={upload} />{documents.length === 0 ? <p style={styles.muted}>첨부된 문서가 없습니다.</p> : documents.map((document) => <div key={document.id} style={styles.documentRow}><span>{document.originalFilename} · {Math.ceil(document.fileSize / 1024)} KB</span><div><button type="button" style={styles.smallButton} onClick={() => download(document)}>다운로드</button><button type="button" style={styles.dangerButton} onClick={() => removeDocument(document.id)}>삭제</button></div></div>)}</section>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text", multiline = false }) { return <label style={styles.field}><span>{label}</span>{multiline ? <textarea name={name} value={value} onChange={onChange} style={styles.textarea} rows="4" /> : <input name={name} type={type} value={value} onChange={onChange} style={styles.input} />}</label>; }

const styles = {
  page: { display: "grid", gap: 16, maxWidth: 900 },
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
  smallButton: { margin: "0 0 0 6px", padding: "7px 9px", border: "1px solid #087e7d", borderRadius: 7, background: "#fff", color: "#087e7d", cursor: "pointer" },
  dangerButton: { marginLeft: 6, padding: "7px 9px", border: "1px solid #d92d20", borderRadius: 7, background: "#fff", color: "#d92d20", cursor: "pointer" },
  documentRow: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: "1px solid #edf0f4" },
  error: { color: "#d92d20" },
  success: { color: "#087e7d" },
};

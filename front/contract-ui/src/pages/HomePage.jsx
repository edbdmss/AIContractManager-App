import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listContractsApi } from "../api/contract";

export default function HomePage() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listContractsApi()
      .then(({ data }) => setContracts(data))
      .catch((requestError) => setError(requestError.response?.data?.message || "계약 정보를 불러오지 못했습니다."));
  }, []);

  const monthlyTotal = useMemo(
    () => contracts.reduce((sum, contract) => sum + Number(contract.monthlyAmount || 0), 0),
    [contracts]
  );
  const categorySummary = useMemo(() => Object.entries(contracts.reduce((summary, contract) => {
    summary[contract.category] = (summary[contract.category] || 0) + Number(contract.monthlyAmount || 0);
    return summary;
  }, {})), [contracts]);
  const upcoming = contracts.filter((contract) => contract.cancellationDeadline || contract.autoRenewalDate).slice(0, 4);

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>계약이 한눈에, 일상이 편하게</h1>
      <p style={styles.subtitle}>백엔드에 저장된 내 계약과 월 고정비를 확인하세요.</p>
      {error ? <p style={styles.error}>{error}</p> : null}

      <div style={styles.topGrid}>
        <section style={styles.card}>
          <span style={styles.badge}>등록된 계약</span>
          <h2 style={styles.cardTitle}>{contracts.length}개</h2>
          <p style={styles.cardDesc}>현재 로그인한 계정의 계약 목록입니다.</p>
          <button type="button" style={styles.secondaryButton} onClick={() => navigate("/contracts")}>계약 목록 보기</button>
        </section>
        <section style={styles.card}>
          <span style={styles.badge}>월 고정비</span>
          <h2 style={styles.cardTitle}>{monthlyTotal.toLocaleString()}원</h2>
          <p style={styles.cardDesc}>계약의 월 금액을 합산한 값입니다.</p>
          <button type="button" style={styles.primaryButton} onClick={() => navigate("/contracts/register")}>계약 등록</button>
        </section>
      </div>

      <section style={styles.card}>
        <div style={styles.rowBetween}><h2 style={styles.sectionTitle}>갱신·해지 확인이 필요한 계약</h2><button type="button" style={styles.linkButton} onClick={() => navigate("/contracts")}>전체보기</button></div>
        {upcoming.length === 0 ? <p style={styles.muted}>등록된 일정이 없습니다.</p> : upcoming.map((contract) => (
          <button key={contract.id} type="button" style={styles.item} onClick={() => navigate(`/contracts/${contract.id}`)}>
            <strong>{contract.title}</strong>
            <span>{contract.cancellationDeadline ? `해지 마감 ${contract.cancellationDeadline}` : `자동 갱신 ${contract.autoRenewalDate}`}</span>
          </button>
        ))}
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>카테고리별 월 지출</h2>
        {categorySummary.length === 0 ? <p style={styles.muted}>계약을 등록하면 지출 분포가 표시됩니다.</p> : categorySummary.map(([category, amount]) => {
          const ratio = monthlyTotal ? Math.round((amount / monthlyTotal) * 100) : 0;
          return <div key={category} style={styles.category}><div style={styles.rowBetween}><span>{category}</span><span>{amount.toLocaleString()}원 ({ratio}%)</span></div><div style={styles.bar}><span style={{ ...styles.barFill, width: `${ratio}%` }} /></div></div>;
        })}
      </section>
    </div>
  );
}

const styles = {
  page: { display: "grid", gap: 16 },
  title: { margin: 0, fontSize: 28, color: "#172b3a" },
  subtitle: { margin: "-8px 0 0", color: "#71818d" },
  topGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 },
  card: { background: "#fff", border: "1px solid #e3eaee", borderRadius: 16, padding: 20, boxShadow: "0 4px 12px rgba(25,44,58,0.04)" },
  badge: { display: "inline-block", padding: "4px 9px", borderRadius: 999, background: "#e8f5f2", color: "#087e7d", fontSize: 12, fontWeight: 700 },
  cardTitle: { margin: "12px 0 6px", fontSize: 28 },
  cardDesc: { margin: 0, color: "#71818d" },
  sectionTitle: { margin: 0, fontSize: 18 },
  rowBetween: { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" },
  item: { width: "100%", display: "flex", justifyContent: "space-between", gap: 12, marginTop: 10, padding: 13, border: "1px solid #e3eaee", borderRadius: 10, background: "#fff", color: "#172b3a", textAlign: "left", cursor: "pointer" },
  category: { marginTop: 16 },
  bar: { height: 8, marginTop: 7, borderRadius: 999, background: "#e8eef0", overflow: "hidden" },
  barFill: { display: "block", height: "100%", borderRadius: 999, background: "#087e7d" },
  primaryButton: { marginTop: 16, padding: "10px 13px", border: 0, borderRadius: 9, background: "#087e7d", color: "#fff", fontWeight: 700, cursor: "pointer" },
  secondaryButton: { marginTop: 16, padding: "9px 12px", border: "1px solid #087e7d", borderRadius: 9, background: "#fff", color: "#087e7d", fontWeight: 700, cursor: "pointer" },
  linkButton: { border: 0, background: "transparent", color: "#087e7d", cursor: "pointer" },
  muted: { color: "#71818d" },
  error: { margin: 0, color: "#d92d20" },
};

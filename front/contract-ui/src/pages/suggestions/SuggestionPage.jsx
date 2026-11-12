import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { acceptSubscriptionSuggestionApi, listSubscriptionSuggestionsApi, rejectSubscriptionSuggestionApi } from "../../api/contract";

export default function SuggestionPage() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = () => listSubscriptionSuggestionsApi()
    .then(({ data }) => setSuggestions(data))
    .catch((requestError) => setError(requestError.response?.data?.message || "결제 제안을 불러오지 못했습니다."))
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const accept = async (suggestion) => {
    try {
      setBusyId(suggestion.id);
      setError("");
      const { data } = await acceptSubscriptionSuggestionApi(suggestion.id);
      const params = new URLSearchParams({
        mode: "subscription",
        name: data.subscriptionName,
        amount: data.estimatedAmount ?? "",
        suggestionId: data.suggestionId,
      });
      navigate(`/contracts/register?${params.toString()}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "제안을 처리하지 못했습니다.");
    } finally {
      setBusyId("");
    }
  };

  const reject = async (suggestionId) => {
    try {
      setBusyId(suggestionId);
      await rejectSubscriptionSuggestionApi(suggestionId);
      setSuggestions((items) => items.filter((item) => item.id !== suggestionId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "제안을 처리하지 못했습니다.");
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <p style={styles.muted}>결제 제안을 불러오는 중입니다.</p>;

  return <main style={styles.page}>
    <header>
      <h1>구독 등록 제안</h1>
      <p style={styles.muted}>결제 알림에서 반복 결제가 감지된 서비스를 확인하고 구독으로 등록할 수 있습니다.</p>
    </header>
    {error && <p style={styles.error} role="alert">{error}</p>}
    {suggestions.length === 0 ? <section style={styles.empty}>
      <h2>새로운 제안이 없습니다</h2>
      <p style={styles.muted}>반복 결제가 감지되면 여기에 구독 등록 제안이 표시됩니다.</p>
    </section> : <section style={styles.list}>
      {suggestions.map((suggestion) => <article key={suggestion.id} style={styles.card}>
        <div>
          <h2 style={styles.name}>{suggestion.merchantName}</h2>
          <p style={styles.muted}>{suggestion.category || "구독 서비스"} · {suggestion.estimatedCycle || "결제 주기 확인 필요"}</p>
          <strong>{suggestion.estimatedAmount == null ? "금액 확인 필요" : `${Number(suggestion.estimatedAmount).toLocaleString()}원`}</strong>
          <p style={styles.muted}>감지된 결제 {suggestion.detectionCount}회</p>
        </div>
        <div style={styles.actions}>
          <button disabled={Boolean(busyId)} onClick={() => accept(suggestion)} style={styles.primary}>{busyId === suggestion.id ? "이동 중..." : "구독으로 등록"}</button>
          <button disabled={Boolean(busyId)} onClick={() => reject(suggestion.id)} style={styles.secondary}>제안 거절</button>
        </div>
      </article>)}
    </section>}
  </main>;
}

const styles = {
  page: { display: "grid", gap: 20, maxWidth: 840 },
  muted: { color: "#667085", lineHeight: 1.6 },
  error: { color: "#d92d20" },
  empty: { padding: 28, border: "1px solid #dbe5e8", borderRadius: 12, background: "white" },
  list: { display: "grid", gap: 12 },
  card: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, padding: 20, border: "1px solid #dbe5e8", borderRadius: 12, background: "white" },
  name: { margin: "0 0 6px" },
  actions: { display: "grid", gap: 8, minWidth: 140 },
  primary: { padding: "10px 14px", border: 0, borderRadius: 8, background: "#087e7d", color: "white", fontWeight: 700, cursor: "pointer" },
  secondary: { padding: "9px 14px", border: "1px solid #d0d5dd", borderRadius: 8, background: "white", cursor: "pointer" },
};

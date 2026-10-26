import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listContractsApi } from "../../api/contract";

export default function ContractListPage() {
  const [contracts, setContracts] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    listContractsApi()
      .then(({ data }) => setContracts(data))
      .catch((requestError) => {
        setError(
          requestError.response?.status === 401
            ? "실제 계약 목록은 카카오 또는 네이버 로그인 후 확인할 수 있습니다."
            : "계약 목록을 불러오지 못했습니다."
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p>계약 목록을 불러오는 중...</p>;
  if (error) return <p style={{ color: "#d92d20" }}>{error}</p>;

  return (
    <div>
      <h2>내 계약</h2>
      {contracts.length === 0 ? (
        <p>등록된 계약이 없습니다. 계약을 새로 등록해 보세요.</p>
      ) : (
        <div style={styles.grid}>
          {contracts.map((contract) => (
            <Link key={contract.id} to={`/contracts/${contract.id}`} style={styles.card}>
              <strong>{contract.title}</strong>
              <span>{contract.category}</span>
              <span>{contract.providerName || "계약 상대방 미입력"}</span>
              <span style={styles.status}>{contract.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12 },
  card: { display: "grid", gap: 8, padding: 16, border: "1px solid #dbe5e8", borderRadius: 12, background: "#fff", color: "#243b4a", textDecoration: "none" },
  status: { width: "fit-content", padding: "4px 8px", borderRadius: 999, background: "#e8f5f2", color: "#087e7d", fontSize: 12, fontWeight: 700 },
};

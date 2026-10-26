import { useState } from "react";
import { Link } from "react-router-dom";
import { startSocialLogin } from "../api/auth";

export default function LoginPage() {
  const [provider, setProvider] = useState("");
  const [error, setError] = useState("");

  const login = async (selectedProvider) => {
    try {
      setError("");
      setProvider(selectedProvider);
      await startSocialLogin(selectedProvider);
    } catch (requestError) {
      setProvider("");
      setError(requestError.message || "로그인을 시작하지 못했습니다.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <section style={styles.card}>
        <h1 style={styles.title}>생활계약 관리</h1>
        <p style={styles.subtitle}>계약을 등록하고, 만료일을 놓치지 마세요.</p>
        <p style={styles.description}>카카오 또는 네이버 계정으로 시작하면 첫 로그인 시 회원가입이 함께 처리됩니다.</p>
        <div style={styles.socialColumn}>
          <button type="button" style={styles.kakaoButton} onClick={() => login("kakao")} disabled={Boolean(provider)}>
            {provider === "kakao" ? "카카오 로그인 이동 중..." : "카카오로 로그인"}
          </button>
          <button type="button" style={styles.naverButton} onClick={() => login("naver")} disabled={Boolean(provider)}>
            {provider === "naver" ? "네이버 로그인 이동 중..." : "네이버로 로그인"}
          </button>
        </div>
        {error ? <p style={styles.error}>{error}</p> : null}
        <p style={styles.bottomText}>계정 생성 안내는 <Link to="/signup">회원가입</Link>에서 확인할 수 있습니다.</p>
      </section>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f7fb", padding: 16 },
  card: { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
  title: { margin: 0, fontSize: 28 },
  subtitle: { margin: "8px 0 0", color: "#667085" },
  description: { margin: "20px 0", color: "#475467", lineHeight: 1.6 },
  socialColumn: { display: "grid", gap: 10 },
  kakaoButton: { height: 46, border: 0, borderRadius: 10, background: "#fee500", color: "#191919", fontWeight: 700, cursor: "pointer" },
  naverButton: { height: 46, border: 0, borderRadius: 10, background: "#03c75a", color: "#fff", fontWeight: 700, cursor: "pointer" },
  error: { color: "#d92d20", margin: "14px 0 0" },
  bottomText: { marginTop: 18, color: "#667085", fontSize: 14 },
};

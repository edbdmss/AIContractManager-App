import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div style={styles.wrapper}>
      <section style={styles.card}>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>소셜 계정으로 처음 로그인하면 회원가입이 자동으로 완료됩니다.</p>
        <div style={styles.info}>
          <strong>가입 절차</strong>
          <p>1. 로그인 화면에서 카카오 또는 네이버를 선택합니다.</p>
          <p>2. 제공자 동의 후 전달받은 정보로 서비스 계정이 생성됩니다.</p>
          <p>3. 이후에는 같은 계정으로 로그인할 수 있습니다.</p>
        </div>
        <Link to="/login" style={styles.primaryButton}>로그인 및 회원가입 시작</Link>
      </section>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: "100vh", display: "grid", placeItems: "center", background: "#f5f7fb", padding: 16 },
  card: { width: "100%", maxWidth: 420, background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.08)" },
  title: { margin: 0, fontSize: 28 },
  subtitle: { margin: "8px 0 0", color: "#667085", lineHeight: 1.6 },
  info: { margin: "22px 0", padding: 16, borderRadius: 10, background: "#f3f8f7", color: "#475467", lineHeight: 1.6 },
  primaryButton: { display: "block", textAlign: "center", textDecoration: "none", padding: 13, borderRadius: 10, background: "#087e7d", color: "#fff", fontWeight: 700 },
};

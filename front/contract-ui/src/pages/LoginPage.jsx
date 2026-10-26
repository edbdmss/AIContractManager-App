import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, startSocialLogin } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProvider, setSocialProvider] = useState("");

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await loginApi({ email, password });
      const token =
        res?.data?.accessToken ||
        res?.data?.token ||
        res?.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        setError("토큰을 받지 못했습니다. 백엔드 응답 형식을 확인해 주세요.");
        return;
      }

      localStorage.setItem("accessToken", token);
      localStorage.setItem("userEmail", email);
      navigate("/home");
    } catch {
      setError("로그인에 실패했습니다. 이메일/비밀번호를 확인해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSocialLogin = async (provider) => {
    try {
      setError("");
      setSocialProvider(provider);
      await startSocialLogin(provider);
    } catch (err) {
      setError(err.message || "소셜 로그인 시작에 실패했습니다.");
      setSocialProvider("");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>생활계약 관리</h1>
        <p style={styles.subtitle}>계약을 등록하고, 만료일을 놓치지 마세요.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>이메일</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>비밀번호</label>
          <input
            style={styles.input}
            type="password"
            placeholder="8자 이상 입력"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error ? <p style={styles.error}>{error}</p> : null}

          <button style={styles.primaryBtn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div style={styles.divider}>또는</div>

        <div style={styles.socialRow}>
          <button
            type="button"
            style={styles.socialBtn}
            onClick={() => onSocialLogin("kakao")}
            disabled={Boolean(socialProvider)}
          >
            {socialProvider === "kakao" ? "카카오로 이동 중..." : "카카오 로그인"}
          </button>
          <button
            type="button"
            style={styles.socialBtn}
            onClick={() => onSocialLogin("naver")}
            disabled={Boolean(socialProvider)}
          >
            {socialProvider === "naver" ? "네이버로 이동 중..." : "네이버 로그인"}
          </button>
        </div>

        <p style={styles.bottomText}>
          계정이 없으신가요? <Link to="/signup">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f5f7fb",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  title: { margin: 0, fontSize: 28 },
  subtitle: { marginTop: 8, color: "#666" },
  form: { marginTop: 20, display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600 },
  input: {
    height: 42,
    border: "1px solid #ddd",
    borderRadius: 10,
    padding: "0 12px",
    marginBottom: 8,
  },
  error: { color: "#d32f2f", margin: "4px 0 8px" },
  primaryBtn: {
    marginTop: 8,
    height: 44,
    border: "none",
    borderRadius: 10,
    background: "#2b6ef2",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
  divider: { textAlign: "center", margin: "16px 0 10px", color: "#888", fontSize: 13 },
  socialRow: { display: "flex", gap: 8 },
  socialBtn: {
    flex: 1,
    height: 40,
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
  },
  bottomText: { marginTop: 14, fontSize: 14, color: "#555" },
};

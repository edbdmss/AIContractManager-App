import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupApi } from "../api/auth";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("이름을 입력해 주세요.");
      return;
    }
    if (!validateEmail(form.email)) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      await signupApi({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });

      alert("회원가입 완료! 로그인해 주세요.");
      navigate("/login");
    } catch {
      setError("회원가입에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>회원가입</h1>
        <p style={styles.subtitle}>서비스 이용을 위해 계정을 만들어 주세요.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>이름</label>
          <input
            style={styles.input}
            name="name"
            type="text"
            placeholder="홍길동"
            value={form.name}
            onChange={onChange}
          />

          <label style={styles.label}>이메일</label>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
          />

          <label style={styles.label}>비밀번호</label>
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="8자 이상 입력"
            value={form.password}
            onChange={onChange}
          />

          <label style={styles.label}>비밀번호 확인</label>
          <input
            style={styles.input}
            name="confirmPassword"
            type="password"
            placeholder="비밀번호 다시 입력"
            value={form.confirmPassword}
            onChange={onChange}
          />

          {error ? <p style={styles.error}>{error}</p> : null}

          <button style={styles.primaryBtn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <p style={styles.bottomText}>
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
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
  bottomText: { marginTop: 14, fontSize: 14, color: "#555" },
};

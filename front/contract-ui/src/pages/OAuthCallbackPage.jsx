import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { completeSocialLogin } from "../api/auth";

export default function OAuthCallbackPage() {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const started = useRef(false);
  const [error, setError] = useState("");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const providerError = searchParams.get("error");
  const callbackError = providerError
    ? "소셜 로그인이 취소되었거나 승인에 실패했습니다."
    : !code || !state
      ? "로그인에 필요한 인증 정보를 받지 못했습니다."
      : "";

  useEffect(() => {
    if (started.current || callbackError) return;
    started.current = true;

    completeSocialLogin({ provider, code, state })
      .then(({ data }) => {
        if (!data?.accessToken) {
          throw new Error("로그인 토큰을 받지 못했습니다.");
        }

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userEmail", data.email || "");
        localStorage.setItem("userName", data.name || "");
        navigate("/home", { replace: true });
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message || "소셜 로그인에 실패했습니다.");
      });
  }, [callbackError, code, navigate, provider, state]);

  if (callbackError || error) {
    return (
      <main style={styles.wrapper}>
        <section style={styles.card}>
          <h1>로그인에 실패했습니다</h1>
          <p>{callbackError || error}</p>
          <Link to="/login">로그인 화면으로 돌아가기</Link>
        </section>
      </main>
    );
  }

  return (
    <main style={styles.wrapper}>
      <section style={styles.card}>
        <h1>{provider === "kakao" ? "카카오" : "네이버"} 로그인 처리 중</h1>
        <p>잠시만 기다려 주세요.</p>
      </section>
    </main>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 16,
    background: "#f5f7fb",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    padding: 24,
    borderRadius: 16,
    background: "#fff",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
};

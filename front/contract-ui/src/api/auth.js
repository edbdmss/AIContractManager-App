import client from "./client";
import { clearSession } from "./session";

const supportedProviders = new Set(["kakao", "naver"]);

const getRedirectUri = (provider) =>
  `${window.location.origin}/oauth/callback/${provider}`;

export const startSocialLogin = async (provider) => {
  const normalizedProvider = provider.toLowerCase();
  if (!supportedProviders.has(normalizedProvider)) {
    throw new Error("지원하지 않는 로그인 방식입니다.");
  }

  const redirectUri = getRedirectUri(normalizedProvider);
  const response = await client.get(`/auth/${normalizedProvider}/authorize`, {
    params: { redirectUri },
  });

  sessionStorage.setItem(`oauthRedirectUri:${normalizedProvider}`, redirectUri);
  window.location.assign(response.data.authorizationUrl);
};

export const completeSocialLogin = async ({ provider, code, state }) => {
  const normalizedProvider = provider.toLowerCase();
  if (!supportedProviders.has(normalizedProvider)) {
    throw new Error("지원하지 않는 로그인 방식입니다.");
  }

  const redirectUri =
    sessionStorage.getItem(`oauthRedirectUri:${normalizedProvider}`) ||
    getRedirectUri(normalizedProvider);

  const response = await client.post(`/auth/${normalizedProvider}/login`, {
    code,
    state,
    redirectUri,
  });

  sessionStorage.removeItem(`oauthRedirectUri:${normalizedProvider}`);
  return response;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  // 화면과 저장소에서는 네트워크 응답을 기다리지 않고 즉시 로그아웃한다.
  clearSession();

  if (!refreshToken) return;

  try {
    await client.post("/auth/logout", { refreshToken });
  } catch {
    // 오프라인이어도 로컬 토큰은 이미 삭제되어 있다.
  }
};

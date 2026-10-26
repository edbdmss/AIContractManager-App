import client from "./client";

// 기존 VITE_USE_MOCK 설정도 잠시 호환하되, mock 범위는 이메일 인증으로 제한한다.
const USE_MOCK_EMAIL_AUTH =
  import.meta.env.VITE_USE_MOCK_EMAIL_AUTH === "true" ||
  import.meta.env.VITE_USE_MOCK === "true";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const toUserMessage = (err, fallback) => {
  const status = err?.response?.status;
  if (status === 401) return "이메일 또는 비밀번호가 올바르지 않습니다.";
  if (status === 409) return "이미 가입된 이메일입니다.";
  if (status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
  return fallback;
};

export const loginApi = async ({ email, password }) => {
  try {
    if (USE_MOCK_EMAIL_AUTH) {
      await delay(600);
      if (!email || !password) throw new Error("입력값을 확인해 주세요.");
      return { data: { accessToken: "mock-token", email } };
    }
    throw new Error("이메일 로그인은 현재 시연용 mock 모드에서만 사용할 수 있습니다.");
  } catch (err) {
    throw new Error(toUserMessage(err, "로그인에 실패했습니다."), { cause: err });
  }
};

export const signupApi = async ({ name, email, password }) => {
  try {
    if (USE_MOCK_EMAIL_AUTH) {
      await delay(700);
      if (!name || !email || !password) throw new Error("입력값을 확인해 주세요.");
      return { data: { success: true } };
    }
    throw new Error("이메일 회원가입은 현재 시연용 mock 모드에서만 사용할 수 있습니다.");
  } catch (err) {
    throw new Error(toUserMessage(err, "회원가입에 실패했습니다."), { cause: err });
  }
};

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

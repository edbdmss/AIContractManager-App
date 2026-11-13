export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  tokenType: string;
}
export type Session = Tokens & {
  userId: string;
  name: string;
  email: string;
  provider: string;
};
export type HttpClient = ReturnType<typeof createHttpClient>;
export function createHttpClient(
  baseUrl: string,
  auth: {
    get: () => Promise<Session | null>;
    set: (s: Session) => Promise<void>;
    expired: () => Promise<void>;
  },
  fetcher: typeof fetch = fetch,
) {
  let refreshing: Promise<Session> | null = null;
  async function send<T>(
    path: string,
    options: RequestInit = {},
    accessToken?: string,
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetcher(`${baseUrl.replace(/\/$/, "")}${path}`, {
        ...options,
        headers: {
          Accept: "application/json",
          ...(options.body && typeof options.body === "string"
            ? { "Content-Type": "application/json" }
            : {}),
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...options.headers,
        },
        signal: controller.signal,
      });
      const text = await response.text();
      let body: unknown;
      try {
        body = text ? JSON.parse(text) : undefined;
      } catch {
        throw new ApiError(
          response.status,
          "서버 응답 형식이 올바르지 않아요. 서버 주소를 확인해 주세요.",
        );
      }
      if (!response.ok) {
        const error = body as
          | {
              message?: string;
              code?: string;
              fieldErrors?: { message: string }[];
            }
          | undefined;
        throw new ApiError(
          response.status,
          error?.fieldErrors?.map((e) => e.message).join("\n") ||
            error?.message ||
            `요청을 처리하지 못했어요 (${response.status}).`,
          error?.code,
        );
      }
      return body as T;
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(
        0,
        controller.signal.aborted
          ? "서버 응답 시간이 초과됐어요."
          : "서버에 연결하지 못했어요. 서버 실행 상태와 주소를 확인해 주세요.",
      );
    } finally {
      clearTimeout(timer);
    }
  }
  async function refreshSession(original: Session) {
    const current = await auth.get();
    if (!current) throw new ApiError(401, "로그인이 필요해요.");
    if (current.accessToken !== original.accessToken) return current;
    if (!refreshing) {
      refreshing = (async () => {
        try {
          const updated = await send<Tokens>("/auth/refresh", {
            method: "POST",
            body: JSON.stringify({ refreshToken: current.refreshToken }),
          });
          if ((await auth.get())?.refreshToken !== current.refreshToken)
            throw new ApiError(401, "로그인 상태가 변경됐어요.");
          const next = { ...current, ...updated };
          await auth.set(next);
          return next;
        } catch (e) {
          if (
            e instanceof ApiError &&
            (e.status === 401 || e.status === 403) &&
            (await auth.get())?.refreshToken === current.refreshToken
          )
            await auth.expired();
          throw e;
        }
      })().finally(() => {
        refreshing = null;
      });
    }
    return refreshing;
  }
  async function request<T>(
    path: string,
    options: RequestInit = {},
    authenticated = true,
  ): Promise<T> {
    const original = authenticated ? await auth.get() : null;
    if (authenticated && !original)
      throw new ApiError(401, "로그인이 필요해요.");
    try {
      return await send<T>(path, options, original?.accessToken);
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 401 || !original) throw e;
      const next = await refreshSession(original);
      try {
        return await send<T>(path, options, next.accessToken);
      } catch (retry) {
        if (retry instanceof ApiError && retry.status === 401 && (await auth.get())?.accessToken===next.accessToken)
          await auth.expired();
        throw retry;
      }
    }
  }
  return {
    request,
    publicRequest: <T>(path: string, options?: RequestInit) =>
      request<T>(path, options, false),
  };
}
export const errorText = (e: unknown) =>
  e instanceof Error ? e.message : "처리하지 못했어요. 다시 시도해 주세요.";

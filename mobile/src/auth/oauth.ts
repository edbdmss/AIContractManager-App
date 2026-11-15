import { Platform } from "react-native";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";
import type { HttpClient, Session } from "../services/http";
import { checkNativeOAuth } from "./AuthContext";
export type Provider = "kakao" | "naver";
interface Pending {
  provider: Provider;
  state: string;
  redirectUri: string;
  createdAt: number;
}
const KEY = "contract-manager.oauth.pending";
async function pendingWrite(value: Pending | null) {
  if (Platform.OS === "web") {
    if (value) sessionStorage.setItem(KEY, JSON.stringify(value));
    else sessionStorage.removeItem(KEY);
  } else if (value) await SecureStore.setItemAsync(KEY, JSON.stringify(value));
  else await SecureStore.deleteItemAsync(KEY);
}
async function pendingRead(): Promise<Pending | null> {
  const raw =
    Platform.OS === "web"
      ? sessionStorage.getItem(KEY)
      : await SecureStore.getItemAsync(KEY);
  return raw ? JSON.parse(raw) : null;
}
async function exchangeOAuth(
  client: HttpClient,
  params: { code?: string; state?: string; error?: string },
): Promise<Session> {
  if (params.error)
    throw new Error("로그인이 취소되었거나 제공자가 요청을 거절했어요.");
  const pending = await pendingRead();
  if (
    !pending ||
    Date.now() - pending.createdAt > 5 * 60 * 1000 ||
    !params.code ||
    params.state !== pending.state
  )
    throw new Error(
      "로그인 요청이 만료되었거나 일치하지 않아요. 다시 로그인해 주세요.",
    );
  // Consume locally before exchanging: React Strict Mode and repeated callback navigation must not reuse the code.
  await pendingWrite(null);
  return client.publicRequest<Session>(`/auth/${pending.provider}/login`, {
    method: "POST",
    body: JSON.stringify({
      code: params.code,
      state: params.state,
      redirectUri: pending.redirectUri,
    }),
  });
}
let exchange: {code:string;state:string;promise:Promise<Session>}|null=null;
export function finishOAuth(client:HttpClient,params:{code?:string;state?:string;error?:string}):Promise<Session>{
 if(exchange&&exchange.code===params.code&&exchange.state===params.state)return exchange.promise;
 const promise=exchangeOAuth(client,params);if(params.code&&params.state)exchange={code:params.code,state:params.state,promise};return promise;
}
export async function startOAuth(
  client: HttpClient,
  provider: Provider,
): Promise<Session | null> {
  checkNativeOAuth();
  exchange=null;
  const redirectUri =
    process.env.EXPO_PUBLIC_OAUTH_REDIRECT_URI ||
    (Platform.OS === "web"
      ? `${window.location.origin}/oauth/callback`
      : AuthSession.makeRedirectUri({
          scheme: "contractmanager",
          path: "oauth/callback",
        }));
  const result = await client.publicRequest<{
    authorizationUrl: string;
    state: string;
  }>(
    `/auth/${provider}/authorize?redirectUri=${encodeURIComponent(redirectUri)}`,
  );
  await pendingWrite({
    provider,
    state: result.state,
    redirectUri,
    createdAt: Date.now(),
  });
  if (Platform.OS === "web") {
    window.location.assign(result.authorizationUrl);
    return null;
  }
  const response = await WebBrowser.openAuthSessionAsync(
    result.authorizationUrl,
    redirectUri,
  );
  if (response.type !== "success") {
    await pendingWrite(null);
    throw new Error("로그인을 취소했어요.");
  }
  const url = new URL(response.url);
  return finishOAuth(client, {
    code: url.searchParams.get("code") || undefined,
    state: url.searchParams.get("state") || undefined,
    error: url.searchParams.get("error") || undefined,
  });
}

import React, { useState } from "react";
import { Platform, Text, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Page, Button, styles } from "../../components/ui";
export default function NativeCallback() {
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();
  const [error, setError] = useState("");
  const valid =
    typeof params.code === "string" &&
    typeof params.state === "string" &&
    !params.error;
  const returnToApp = async () => {
    try {
      if (!valid)
        throw new Error(
          "로그인을 완료하지 못했어요. 앱으로 돌아가 다시 시도해 주세요.",
        );
      const query = new URLSearchParams({
        code: params.code!,
        state: params.state!,
      });
      await Linking.openURL(`contractmanager://oauth/callback?${query}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "앱을 열지 못했어요.");
    }
  };
  return (
    <Page title="로그인 확인">
      <Text style={[styles.text, { marginVertical: 30 }]}>
        {valid
          ? "로그인 확인이 끝났어요. 앱으로 돌아가 계속해 주세요."
          : "로그인이 취소되었거나 요청이 만료되었어요."}
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      {Platform.OS === "web" ? (
        <Button label="앱으로 돌아가기" onPress={() => void returnToApp()} />
      ) : (
        <Button
          label="로그인으로 돌아가기"
          onPress={() => router.replace("/login")}
        />
      )}
    </Page>
  );
}

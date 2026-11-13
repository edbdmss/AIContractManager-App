import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth, errorText } from "../../auth/AuthContext";
import { finishOAuth } from "../../auth/oauth";
import { Page, Button, styles } from "../../components/ui";
export default function Callback() {
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();
  const { client, signIn } = useAuth();
  const [error, setError] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    finishOAuth(client, params)
      .then(signIn)
      .then(() => router.replace("/"))
      .catch((e) => setError(errorText(e)));
  }, [client, params, signIn]);
  return (
    <Page title="로그인 연결">
      <View style={{ paddingVertical: 40 }}>
        <Text style={error ? styles.error : styles.muted}>
          {error || "로그인 정보를 확인하고 있어요."}
        </Text>
      </View>
      {!!error && (
        <Button
          label="로그인으로 돌아가기"
          onPress={() => router.replace("/login")}
        />
      )}
    </Page>
  );
}

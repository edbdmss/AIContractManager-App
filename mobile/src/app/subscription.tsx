import React, { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ContractForm } from "../features/ContractForm";
import { Contract, emptyContract } from "../model";
import { useApp } from "../state/AppStore";
import { Loading, Page, Button, styles } from "../components/ui";
export default function Subscription() {
  const { suggestionId } = useLocalSearchParams<{
    suggestionId?: string;
  }>();
  const { loadSuggestion } = useApp();
  const [initial, setInitial] = useState<Contract | null>(
    suggestionId
      ? null
      : {
          ...emptyContract(),
          category: "구독",
          title: "",
          amount: 0,
          eventLabel: "다음 결제",
          provider: "",
        },
  );
  const [error, setError] = useState("");
  const started = useRef(false);
  useEffect(() => {
    if (false || !suggestionId || started.current) return;
    started.current = true;
    loadSuggestion(suggestionId)
      .then(setInitial)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "제안을 불러오지 못했어요."),
      );
  }, [suggestionId, loadSuggestion]);
  if (error)
    return (
      <Page title="등록 제안" back>
        <Text style={styles.error}>{error}</Text>
        <Button
          label="알림으로 돌아가기"
          onPress={() => router.replace("/notifications")}
        />
      </Page>
    );
  if (!initial) return <Loading />;
  return (
    <ContractForm
      initial={initial}
      subscription
      isNew
      suggestionId={suggestionId}
      title="구독 서비스 등록"
    />
  );
}

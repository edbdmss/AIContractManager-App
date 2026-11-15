import { RequestState } from "../components/RequestState";
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useApp } from "../state/AppStore";
import {
  Page,
  Section,
  Empty,
  IconButton,
  Badge,
  colors,
  styles,
} from "../components/ui";
import { Icon } from "../components/Icon";
export default function Notifications() {
  const { data, ready, noticesLoaded, storageError, refresh, dismiss } =
    useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const clear = async (id?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      await dismiss(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알림을 정리하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };
  if (!noticesLoaded)
    return (
      <Page title="알림" back>
        <RequestState
          loading={!ready}
          error={storageError}
          onRetry={() => void refresh()}
        />
      </Page>
    );
  return (
    <Page title="알림" back right={<Badge>{"내 알림"}</Badge>}>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <Section
        title={`새로운 알림  ${data.notices.length}`}
        right="모두 정리"
        onPress={() => void clear()}
      />
      {data.notices.length ? (
        data.notices.map((n) => (
          <View
            key={n.id}
            style={[
              styles.card,
              {
                marginBottom: 10,
                padding: 0,
                borderWidth: n.serverSuggestionId ? 1 : 0,
                borderColor: "#c8dccb",
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() =>
                n.serverSuggestionId
                  ? router.push({
                      pathname: "/subscription",
                      params: { suggestionId: n.serverSuggestionId || n.id },
                    })
                  : n.contractId && router.push(`/contract/${n.contractId}`)
              }
              style={{
                padding: 18,
                paddingRight: 37,
                flexDirection: "row",
                gap: 12,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.soft,
                  borderRadius: 13,
                  padding: 10,
                  alignSelf: "flex-start",
                }}
              >
                <Icon
                  name={n.serverSuggestionId ? "spark" : "bell"}
                  size={19}
                />
              </View>
              <View style={{ flex: 1, gap: 7 }}>
                {n.serverSuggestionId && (
                  <View style={{ alignSelf: "flex-start" }}>
                    <Badge>등록 제안</Badge>
                  </View>
                )}
                <Text
                  style={[styles.text, { fontSize: 12, fontWeight: "600" }]}
                >
                  {n.title}
                </Text>
                <Text style={[styles.muted, { fontSize: 11 }]}>{n.text}</Text>
                <Text style={[styles.muted, { fontSize: 10 }]}>
                  {n.serverSuggestionId ? "결제 알림 분석" : "계약 일정 안내"}
                </Text>
                {n.serverSuggestionId && (
                  <Text style={[styles.link, { fontSize: 11, marginTop: 4 }]}>
                    확인하고 등록하기 ›
                  </Text>
                )}
              </View>
            </Pressable>
            <View style={{ position: "absolute", right: 0, top: 0 }}>
              <IconButton
                name="close"
                label={`${n.title} 알림 정리`}
                onPress={() => void clear(n.id)}
              />
            </View>
          </View>
        ))
      ) : (
        <Empty text="확인할 알림이 없어요.\n새로운 소식이 생기면 알려드릴게요." />
      )}
    </Page>
  );
}

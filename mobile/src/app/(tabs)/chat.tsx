import React, { useRef, useState, useEffect } from "react";
import { ScrollView, View, Text, TextInput, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useApp } from "../../state/AppStore";
import { Message, answerQuestion } from "../../model";
import { Page, Badge, colors, styles } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../auth/AuthContext";
export default function Chat() {
  const { contractId } = useLocalSearchParams<{ contractId?: string }>();
  const { data, addMessages, mode } = useApp();
  const { client } = useAuth();
  const [serverMessages, setServerMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sessionId = useRef<string | null>(null);
  const [loadedScope,setLoadedScope]=useState<string|null>(null);
  const scope=`${mode}:${contractId||"all"}`;
  const loading=mode==="server"&&loadedScope!==scope;
  useEffect(() => {
    if (mode !== "server") return;
    let active = true;
    sessionId.current = null;
    client
      .request<{ id: string; contractId: string | null; createdAt: string }[]>(
        "/chat/sessions",
      )
      .then(async (sessions) => {
        const match = sessions
          .filter(
            (s) => (s.contractId || undefined) === (contractId || undefined),
          )
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
        if(!active)return;
        if(!match){setServerMessages([]);return;}
        const history = await client.request<
          { id: string; role: string; content: string }[]
        >(`/chat/sessions/${match.id}/messages`);
        if (active) {
          sessionId.current = match.id;
          setServerMessages(
            history.map((m) => ({
              id: m.id,
              role: m.role === "USER" ? "user" : "assistant",
              text: m.content,
            })),
          );
        }
      })
      .catch((e) => {
        if (active)
          setError(
            e instanceof Error ? e.message : "대화 이력을 불러오지 못했어요.",
          );
      })
      .finally(() => {
        if (active) setLoadedScope(scope);
      });
    return () => {
      active = false;
    };
  }, [client, contractId, mode,scope]);
  const visibleMessages = mode === "server" ? serverMessages : data.messages;
  const [input, setInput] = useState("");
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const selected = data.contracts.find((c) => c.id === contractId);
  const ask = async (q: string) => {
    if (busy || loading) return;
    if (!q.trim()) return;
    const text = q.trim();
    const id = String(Date.now());
    if (mode === "server") {
      setBusy(true);
      setError("");
      try {
        if (!sessionId.current) {
          const created = await client.request<{ id: string }>(
            "/chat/sessions",
            {
              method: "POST",
              body: JSON.stringify(contractId ? { contractId } : {}),
            },
          );
          sessionId.current = created.id;
        }
        setServerMessages((prev) => [
          ...prev,
          { id: `${id}-user`, role: "user", text },
        ]);
        setInput("");
        const result = await client.request<{
          message: { id: string; role: string; content: string };
        }>(`/chat/sessions/${sessionId.current}/messages`, {
          method: "POST",
          body: JSON.stringify({ message: text }),
        });
        setServerMessages((prev) => [
          ...prev,
          {
            id: result.message.id,
            role: "assistant",
            text: result.message.content,
          },
        ]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "질문을 보내지 못했어요.");
      } finally {
        setBusy(false);
      }
      return;
    }
    addMessages([
      { id: `${id}-user`, role: "user", text },
      {
        id: `${id}-assistant`,
        role: "assistant",
        text: answerQuestion(text, data.contracts, contractId),
      },
    ]);
    setInput("");
  };
  useEffect(() => {
    scroll.current?.scrollToEnd({ animated: true });
  }, [visibleMessages.length]);
  return (
    <Page
      title="계약 도우미"
      right={<Badge>{mode === "demo" ? "데모" : "AI"}</Badge>}
      scroll={false}
      footer={
        <View
          style={[styles.row, styles.input, { padding: 8, paddingLeft: 15 }]}
        >
          <TextInput
            accessibilityLabel="질문 입력"
            value={input}
            onChangeText={setInput}
            maxLength={500}
            placeholder="계약에 대해 물어보세요"
            placeholderTextColor={colors.muted}
            onSubmitEditing={() => ask(input)}
            style={{ flex: 1, minHeight: 36, fontSize: 12, color: colors.ink }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="질문 전송"
            disabled={!input.trim() || busy || loading}
            onPress={() => ask(input)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: colors.accent,
              alignItems: "center",
              justifyContent: "center",
              opacity: input.trim() ? 1 : 0.4,
            }}
          >
            <Icon name="send" size={18} color="#fff" />
          </Pressable>
        </View>
      }
    >
      <ScrollView
        ref={scroll}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() =>
          scroll.current?.scrollToEnd({ animated: true })
        }
        contentContainerStyle={{ padding: 21, paddingTop: 15 }}
      >
        <View
          style={{
            width: 46,
            height: 46,
            borderRadius: 17,
            backgroundColor: colors.soft,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <Icon name="spark" />
        </View>
        <Text style={styles.title}>내 계약에 대해{"\n"}궁금한 게 있나요?</Text>
        <Text style={[styles.muted, { marginTop: 9, marginBottom: 20 }]}>
          {selected
            ? `${selected.title} 계약을 기준으로 안내해요.`
            : "어려운 내용은 쉽게, 중요한 일정은 꼼꼼히."}
          {"\n"}
          {mode === "demo"
            ? "등록한 정보로 답하는 데모 도우미예요."
            : "내 계약 정보를 바탕으로 AI 서버에 질문해요."}
        </Text>
        {[
          "이번 달 고정 지출이 얼마야?",
          "곧 갱신되는 계약이 있어?",
          "해지 기한 알려줘",
        ].map((q) => (
          <Pressable
            key={q}
            accessibilityRole="button"
            onPress={() => ask(q)}
            style={[
              styles.between,
              {
                backgroundColor: "#fff",
                borderRadius: 13,
                padding: 15,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.line,
              },
            ]}
          >
            <Text style={[styles.text, { fontSize: 12 }]}>{q}</Text>
            <Icon name="chevron" size={14} />
          </Pressable>
        ))}
        {!!error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {(busy || loading) && (
          <Text style={styles.muted}>
            {loading
              ? "대화 이력을 불러오고 있어요."
              : "답변을 준비하고 있어요."}
          </Text>
        )}
        {(loading?[]:visibleMessages).map((m) => (
          <View
            key={m.id}
            style={{
              padding: 15,
              borderRadius: 17,
              borderTopLeftRadius: m.role === "user" ? 17 : 3,
              borderTopRightRadius: m.role === "user" ? 3 : 17,
              backgroundColor: m.role === "user" ? colors.soft : "#fff",
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "92%",
              marginTop: 14,
            }}
          >
            <Text
              selectable
              style={[
                styles.text,
                {
                  fontSize: 12,
                  color: m.role === "user" ? colors.accent : colors.ink,
                },
              ]}
            >
              {m.text}
            </Text>
          </View>
        ))}
        <Text style={[styles.muted, { fontSize: 10, marginTop: 18 }]}>
          {mode === "demo"
            ? "데모 답변이에요. 실제 계약 조건은 원본을 확인해 주세요."
            : "AI 답변의 계약 조건은 원본과 함께 확인해 주세요."}
        </Text>
      </ScrollView>
    </Page>
  );
}

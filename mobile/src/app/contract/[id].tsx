import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, BackHandler, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useApp } from "../../state/AppStore";
import { ContractForm } from "../../features/ContractForm";
import {
  Button,
  Card,
  Empty,
  Info,
  Page,
  ServiceIcon,
  colors,
  styles,
} from "../../components/ui";
import { dateText, money } from "../../model";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, remove, mode, verify } = useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const c = data.contracts.find((item) => item.id === id);
  const [edit, setEdit] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const cancelRef = useRef<React.ComponentRef<typeof View>>(null);
  useEffect(() => {
    if (!confirm) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      setConfirm(false);
      return true;
    });
    return () => sub.remove();
  }, [confirm]);
  useEffect(() => {
    if (!confirm || Platform.OS !== "web") return;
    const first = cancelRef.current as unknown as HTMLElement | null;
    first?.focus?.();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setConfirm(false);
      }
      if (e.key === "Tab") {
        const root = first?.parentElement;
        const buttons = root?.querySelectorAll<HTMLElement>('[role="button"]');
        if (!buttons?.length) return;
        const index = Array.from(buttons).indexOf(
          document.activeElement as HTMLElement,
        );
        e.preventDefault();
        buttons[
          (index + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length
        ]?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [confirm]);
  if (!c)
    return (
      <Page title="계약 상세" back>
        <Empty text="이 계약을 찾을 수 없어요." />
        <Button
          label="내 계약으로 이동"
          onPress={() => router.replace("/contracts")}
        />
      </Page>
    );
  if (edit) return <ContractForm initial={c} onClose={() => setEdit(false)} />;
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ flex: 1 }}
        pointerEvents={confirm ? "none" : "auto"}
        accessibilityElementsHidden={confirm}
        importantForAccessibility={confirm ? "no-hide-descendants" : "auto"}
      >
        <Page
          title="계약 상세"
          back
          footer={
            <>
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
              {mode === "server" && c.server && !c.server.amountVerified && (
                <Button
                  secondary
                  label="월 납부 금액 확인"
                  disabled={busy}
                  onPress={async () => {
                    setBusy(true);
                    try {
                      await verify(c.id);
                    } catch (e) {
                      setError(
                        e instanceof Error ? e.message : "확인에 실패했어요.",
                      );
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              )}
              <Button label="계약 정보 수정" onPress={() => setEdit(true)} />
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirm(true)}
                style={{ alignItems: "center", padding: 10 }}
              >
                <Text style={{ color: colors.danger, fontSize: 12 }}>
                  계약 삭제
                </Text>
              </Pressable>
            </>
          }
        >
          <Card style={{ marginTop: 9, marginBottom: 16 }}>
            <ServiceIcon category={c.category} />
            <Text style={[styles.title, { fontSize: 22, marginTop: 14 }]}>
              {c.title}
            </Text>
            <Text style={styles.muted}>
              {c.provider} · {c.category}
            </Text>
          </Card>
          <Card>
            {[
              ["월 납부 금액", `${money(c.amount)}원`],
              [c.eventLabel, dateText(c.eventDate)],
              ["계약 시작일", dateText(c.startDate)],
              ["계약 종료일", dateText(c.endDate)],
              ["카테고리", c.category],
            ].map(([key, value], i) => (
              <View
                key={key}
                style={[
                  styles.between,
                  {
                    paddingVertical: 13,
                    borderTopWidth: i ? 1 : 0,
                    borderTopColor: colors.line,
                  },
                ]}
              >
                <Text style={styles.muted}>{key}</Text>
                <Text
                  style={[styles.text, { fontSize: 12, fontWeight: "600" }]}
                >
                  {value}
                </Text>
              </View>
            ))}
          </Card>
          <View style={{ marginVertical: 22 }}>
            <Info title="계약 요약">
              {c.summary || "등록된 요약이 없어요."}
              {c.terms ? `\n\n해지 조건\n${c.terms}` : ""}
            </Info>
          </View>
          {!!c.sourceName && (
            <Text style={[styles.muted, { marginBottom: 18 }]}>
              참고 파일: {c.sourceName}
            </Text>
          )}
          <Button
            secondary
            icon="chat"
            label="이 계약에 대해 물어보기"
            onPress={() =>
              router.push({ pathname: "/chat", params: { contractId: c.id } })
            }
          />
          <Text style={[styles.muted, { fontSize: 10, marginTop: 17 }]}>
            {mode === "demo"
              ? "기기에 저장된 데모 계약입니다."
              : "로그인한 계정의 서버 계약입니다."}
          </Text>
        </Page>
      </View>
      {confirm && (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: "#172a2366",
            justifyContent: "center",
            padding: 25,
            zIndex: 20,
          }}
          accessibilityViewIsModal
        >
          <Card style={{ padding: 25 }}>
            <Text accessibilityRole="header" style={styles.h3}>
              계약을 삭제할까요?
            </Text>
            <Text style={[styles.muted, { marginVertical: 15 }]}>
              {c.title} 계약과 관련 알림이 삭제돼요. 삭제한 계약은 되돌릴 수
              없어요.
            </Text>
            <View style={{ gap: 10 }}>
              <Pressable
                ref={cancelRef}
                accessibilityRole="button"
                onPress={() => setConfirm(false)}
                style={[styles.button, { backgroundColor: colors.soft }]}
              >
                <Text style={[styles.buttonText, { color: colors.accent }]}>
                  유지하기
                </Text>
              </Pressable>
              <Button
                danger
                label="삭제하기"
                disabled={busy}
                onPress={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await remove(c.id);
                    setConfirm(false);
                    router.replace("/contracts");
                  } catch (e) {
                    setError(
                      e instanceof Error ? e.message : "삭제하지 못했어요.",
                    );
                    setConfirm(false);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
}

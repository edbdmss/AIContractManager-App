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
import { dateText, money, Contract } from "../../model";
import { useAuth } from "../../auth/AuthContext";
import { createContractsApi, fromServer } from "../../services/contractsApi";
export default function Detail() {
  const { id, registration } = useLocalSearchParams<{
    id: string; registration?: string;
  }>();
  const registering = registration === "true";
  const { client } = useAuth();
  const [draft, setDraft] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(registering);
  const { data, remove, verify } = useApp();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const c = registering ? draft : data.contracts.find((item) => item.id === id);
  useEffect(() => {
    if (!registering) return;
    let active = true;
    createContractsApi(client).get(id).then((value) => {
      if (active) setDraft(fromServer(value));
    }).catch((e) => {
      if (active) setError(e instanceof Error ? e.message : "분석 내용을 불러오지 못했어요.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [client, id, registering]);
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
  if (loading) return <Page title="계약 상세" back><Text style={styles.muted}>분석 내용을 불러오고 있어요.</Text></Page>;
  if (!c)
    return (
      <Page title="계약 상세" back>
        <Empty text={error || "이 계약을 찾을 수 없어요."} />
        <Button
          label="내 계약으로 이동"
          onPress={() => router.replace("/contracts")}
        />
      </Page>
    );
  if (edit) return <ContractForm initial={c} registration={registering} requireAmountConfirmation={registering} title={registering ? "계약 정보 확인" : "계약 수정"} onClose={() => setEdit(false)} />;
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
              {registering && !c.server?.amountVerified && (
                <Text style={[styles.muted, { textAlign: "center" }]}>월 납부 금액을 먼저 확인해 주세요. (필수)</Text>
              )}
              <Button
                label={registering ? "계약 정보 확인" : "계약 수정"}
                disabled={busy || (registering && !c.server?.amountVerified)}
                onPress={() => {
                  if (registering && !c.server?.amountVerified) return;
                  setEdit(true);
                }}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setConfirm(true)}
                style={{ alignItems: "center", padding: 10 }}
              >
                <Text style={{ color: colors.danger, fontSize: 12 }}>
                  {registering ? "등록 취소" : "계약 삭제"}
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
            <View style={[styles.between, { paddingVertical: 13, flexWrap: "wrap" }]}>
              <Text style={styles.muted}>월 납부 금액{registering ? " (확인 필수)" : ""}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <Text style={[styles.text, { fontSize: 12, fontWeight: "600" }]}>{money(c.amount)}원</Text>
                {registering && (c.server?.amountVerified ? (
                  <Text style={styles.badgeText}>확인 완료</Text>
                ) : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="월 납부 금액 확인"
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    style={[styles.badge, { minHeight: 36, justifyContent: "center", opacity: busy ? 0.55 : 1 }]}
                    onPress={async () => {
                      setBusy(true);
                      setError("");
                      try {
                        await verify(c.id);
                        if (registering) setDraft(fromServer(await createContractsApi(client).get(c.id)));
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "확인에 실패했어요.");
                      } finally { setBusy(false); }
                    }}
                  >
                    <Text style={styles.badgeText}>{busy ? "확인 중" : "금액 확인"}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
            {[
              [c.eventLabel, dateText(c.eventDate)],
              ["계약 시작일", dateText(c.startDate)],
              ["계약 종료일", dateText(c.endDate)],
              ["카테고리", c.category],
              ["결제 · 갱신 주기", c.renewalCycleMonths ? `${c.renewalCycleMonths}개월` : "미설정"],
            ].map(([key, value]) => (
              <View
                key={key}
                style={[
                  styles.between,
                  {
                    paddingVertical: 13,
                    borderTopWidth: 1,
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
          {!registering && <Button
            secondary
            icon="chat"
            label="이 계약에 대해 물어보기"
            onPress={() =>
              router.push({ pathname: "/chat", params: { contractId: c.id } })
            }
          />}
          <Text style={[styles.muted, { fontSize: 10, marginTop: 17 }]}>
            {registering ? "아직 등록되지 않은 계약이에요. 계약 정보를 확인하고 저장해 주세요." : "로그인한 계정의 서버 계약입니다."}
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
              {registering ? "계약 등록을 취소할까요?" : "계약을 삭제할까요?"}
            </Text>
            <Text style={[styles.muted, { marginVertical: 15 }]}>
              {registering
                ? "분석한 내용이 삭제되고 계약은 등록되지 않아요. 다시 등록하려면 문서를 다시 업로드해야 해요."
                : `${c.title} 계약과 관련 알림이 삭제돼요. 삭제한 계약은 되돌릴 수 없어요.`}
            </Text>
            <View style={{ gap: 10 }}>
              <Pressable
                ref={cancelRef}
                accessibilityRole="button"
                onPress={() => setConfirm(false)}
                style={[styles.button, { backgroundColor: colors.soft }]}
              >
                <Text style={[styles.buttonText, { color: colors.accent }]}>
                  {registering ? "계속 등록하기" : "유지하기"}
                </Text>
              </Pressable>
              <Button
                danger
                label={registering ? "등록 취소하기" : "삭제하기"}
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
                      e instanceof Error ? e.message : registering ? "등록을 취소하지 못했어요." : "삭제하지 못했어요.",
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

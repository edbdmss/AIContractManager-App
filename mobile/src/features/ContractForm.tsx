import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Contract, categories, validateContract } from "../model";
import { useApp } from "../state/AppStore";
import { Page, Field, Info, Button, colors, styles } from "../components/ui";
export function ContractForm({
  initial,
  subscription = false,
  suggestionId,
  title = "계약 정보 수정",
  isNew = false,
  onClose,
}: {
  initial: Contract;
  subscription?: boolean;
  suggestionId?: string;
  title?: string;
  isNew?: boolean;
  onClose?: () => void;
}) {
  const { save, mode } = useApp();
  const [form, setForm] = useState(initial);
  const [amount, setAmount] = useState(
    isNew && !initial.amount ? "" : String(initial.amount),
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const patch = (key: keyof Contract, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async () => {
    if (busy) return;
    const contract = {
      ...form,
      id:
        form.id ||
        `contract-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: form.title.trim(),
      provider: form.provider.trim() || "직접 등록",
      amount: Number(amount),
    };
    if (mode === "server" && !subscription) {
      contract.eventDate =
        (contract.category === "구독"
          ? form.serverNextPaymentDate
          : form.serverCancellationDeadline) ||
        form.serverNextPaymentDate ||
        form.endDate;
      contract.eventLabel = form.serverCancellationDeadline
        ? "해지 신청 마감"
        : form.serverNextPaymentDate
          ? "자동 갱신"
          : "계약 종료";
    }
    const err =
      amount.trim() === ""
        ? "결제 금액을 입력해 주세요."
: validateContract(contract,mode==='demo'||contract.category==='구독');
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    try {
      const saved = await save(contract, suggestionId);
      onClose?.();
      router.replace(`/contract/${saved.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page
      title={title}
      back
      footer={
        <>
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Button
                secondary
                label="취소"
                onPress={() => (onClose ? onClose() : router.back())}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Button
                label="저장하기"
                onPress={() => void submit()}
                disabled={busy}
              />
            </View>
          </View>
        </>
      }
    >
      {!!suggestionId && (
        <Info title="결제 알림에서 찾은 등록 제안이에요">
          구독명과 금액을 미리 입력했어요. 실제 구독인지 확인하고 다음 결제일을
          입력해 주세요. 저장하면 내 계약에 추가돼요.
        </Info>
      )}
      {subscription ? (
        <>
          <Text style={[styles.title, { marginTop: 18 }]}>
            매달 만나는 구독,{"\n"}잊지 않고 챙겨요.
          </Text>
          <Text style={[styles.muted, { marginTop: 10, marginBottom: 14 }]}>
            결제일이 다가오면 확인할 수 있어요.
          </Text>
        </>
      ) : (
        <Info title="핵심 내용을 쉽게 정리해요">
          계약 기간과 금액, 기억할 조건을 확인하고 저장하세요.
        </Info>
      )}
      <Field
        label={subscription ? "구독명" : "계약명"}
        value={form.title}
        onChangeText={(v) => patch("title", v)}
        placeholder="예: 넷플릭스, 우리집 월세"
      />
      {!subscription && (
        <Field
          label="계약 상대방"
          value={form.provider}
          onChangeText={(v) => patch("provider", v)}
        />
      )}
      <Field
        label={subscription ? "결제 금액 (원)" : "월 납부 금액 (원)"}
        value={amount}
        onChangeText={setAmount}
        number
        placeholder="0"
      />
      {!subscription && (
        <>
          <Text
            style={[
              styles.text,
              { fontWeight: "600", fontSize: 12, marginVertical: 10 },
            ]}
          >
            카테고리
          </Text>
          <View
            style={{
              flexDirection: "row",
              gap: 7,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            {categories.map((c) => (
              <Pressable
                key={c}
                accessibilityRole="button"
                accessibilityState={{ selected: form.category === c }}
                onPress={() => patch("category", c)}
                style={{
                  backgroundColor: form.category === c ? colors.accent : "#fff",
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: form.category === c ? "#fff" : colors.ink,
                  }}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>
          <Field
            label="계약 시작일 (선택)"
            value={form.startDate}
            onChangeText={(v) => patch("startDate", v)}
            placeholder="YYYY-MM-DD"
          />
          <Field
            label="계약 종료일 (선택)"
            value={form.endDate}
            onChangeText={(v) => patch("endDate", v)}
            placeholder="YYYY-MM-DD"
          />
          {mode === "demo" && (
            <Field
              label="다음 일정 이름"
              value={form.eventLabel}
              onChangeText={(v) => patch("eventLabel", v)}
              placeholder="예: 월세 납부, 해지 신청 마감"
            />
          )}
        </>
      )}
      {!subscription && mode === "server" && (
        <>
          <Field
            label="다음 결제일 / 자동 갱신일 (선택)"
            value={form.serverNextPaymentDate || ""}
            onChangeText={(v) => patch("serverNextPaymentDate", v)}
            placeholder="YYYY-MM-DD"
          />
          <Field
            label="해지 마감일 (선택)"
            value={form.serverCancellationDeadline || ""}
            onChangeText={(v) => patch("serverCancellationDeadline", v)}
            placeholder="YYYY-MM-DD"
          />
        </>
      )}
      {(subscription || mode === "demo") && (
        <Field
          label={subscription ? "다음 결제일" : "다음 일정 날짜"}
          value={form.eventDate}
          onChangeText={(v) => patch("eventDate", v)}
          placeholder="YYYY-MM-DD"
        />
      )}
      <Field
        label={subscription ? "추가 정보 (선택)" : "계약 요약 (선택)"}
        value={form.summary}
        onChangeText={(v) => patch("summary", v)}
        multiline
        placeholder="기억할 내용을 적어 주세요."
      />
      {!subscription && (
        <Field
          label="해지 조건 (선택)"
          value={form.terms}
          onChangeText={(v) => patch("terms", v)}
          multiline
        />
      )}
      <View style={{ marginTop: 14 }}>
        <Info
          title={
            mode === "demo"
              ? "기기에 안전하게 기록해요"
              : "서버에 계약을 저장해요"
          }
        >
          {mode === "demo"
            ? "데모 계약은 이 기기에만 저장돼요."
            : "로그인한 계정의 계약으로 저장돼요. 다른 기기에서도 같은 계정으로 조회할 수 있어요."}
        </Info>
      </View>
    </Page>
  );
}

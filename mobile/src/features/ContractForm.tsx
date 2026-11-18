import React, { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { router } from "expo-router";
import { Contract, categories, localDate, validateContract } from "../model";
import { useApp } from "../state/AppStore";
import { Page, Field, Info, Button, Card, colors, styles } from "../components/ui";
import { DatePickerField } from "../components/DatePickerField";
export function ContractForm({
  initial,
  subscription = false,
  suggestionId,
  title = "계약 정보 수정",
  isNew = false,
  registration = isNew,
  onClose,
}: {
  initial: Contract;
  subscription?: boolean;
  suggestionId?: string;
  title?: string;
  isNew?: boolean;
  registration?: boolean;
  onClose?: () => void;
}) {
  const { save } = useApp();
  const [form, setForm] = useState(initial);
  const [amount, setAmount] = useState(
    (isNew && !initial.amount) || initial.server?.monthlyAmount === null
      ? ""
      : String(initial.amount),
  );
  const initialCycle = initial.renewalCycleMonths ?? initial.server?.renewalCycleMonths ?? null;
  const [cycle, setCycle] = useState(initialCycle == null ? "" : String(initialCycle));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [completed, setCompleted] = useState(false);
  const today = localDate(new Date());
  const patch = (key: keyof Contract, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));
  const submit = async () => {
    if (busy || completed) return;
    if (isNew && !subscription && !form.startDate) {
      setError("계약 시작일을 선택해 주세요.");
      return;
    }
    if (isNew && !subscription && !form.serverNextPaymentDate) {
      setError("다음 결제일을 선택해 주세요.");
      return;
    }
    const cycleText = cycle.trim();
    if (cycleText && (!/^\d+$/.test(cycleText) || Number(cycleText) < 1 || Number(cycleText) > 60)) {
      setError("갱신 주기는 1~60개월 사이의 정수로 입력해 주세요.");
      return;
    }
    if (!cycleText && initialCycle != null) {
      setError("설정된 갱신 주기를 변경하려면 1~60개월을 입력해 주세요.");
      return;
    }
    if (cycleText && !(subscription ? form.eventDate : form.serverNextPaymentDate)) {
      setError("갱신 주기를 적용할 다음 결제일 / 자동 갱신일을 선택해 주세요.");
      return;
    }
    const contract = {
      ...form,
      id: form.id,
      title: form.title.trim(),
      provider: form.provider.trim(),
      amount: Number(amount),
      renewalCycleMonths: cycleText ? Number(cycleText) : null,
    };
    if (!subscription) {
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
    const err = !/^\d+$/.test(amount.trim())
      ? "결제 금액을 입력해 주세요."
      : validateContract(contract, contract.category === "구독");
    if (err) {
      setError(err);
      return;
    }
    setBusy(true);
    try {
      const saved = await save(contract, suggestionId);
      if (registration) {
        setCompleted(true);
      } else {
        onClose?.();
        router.replace(`/contract/${saved.id}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장하지 못했어요.");
    } finally {
      setBusy(false);
    }
  };
  if (completed) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.canvas }}>
        <Modal
          visible
          transparent
          animationType="fade"
          onRequestClose={() => router.replace("/contracts")}
        >
          <View style={{ flex: 1, backgroundColor: "#172a2366", justifyContent: "center", alignItems: "center", padding: 24 }}>
            <Card style={{ width: "100%", maxWidth: 400, padding: 25 }}>
              <View accessibilityViewIsModal>
                <Text accessibilityRole="header" style={styles.h3}>계약이 등록됐어요</Text>
                <Text style={[styles.muted, { marginTop: 12, marginBottom: 22 }]}>
                  저장한 계약은 내 계약에서 확인할 수 있어요. 어디로 이동할까요?
                </Text>
                <View style={{ gap: 10 }}>
                  <Button label="내 계약 보기" onPress={() => router.replace("/contracts")} />
                  <Button secondary label="홈으로" onPress={() => router.replace("/")} />
                </View>
              </View>
            </Card>
          </View>
        </Modal>
      </View>
    );
  }
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
                disabled={busy}
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
        placeholder="예: 넷플릭스, 멜론 등"
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
          <DatePickerField
            label={`계약 시작일 (${isNew ? "필수" : "선택"})`}
            value={form.startDate}
            onChange={(v) => patch("startDate", v)}
          />
          <DatePickerField
            label="계약 종료일 (선택)"
            value={form.endDate}
            onChange={(v) => patch("endDate", v)}
            minimumDate={form.startDate || undefined}
          />
          {false}
        </>
      )}
      {!subscription && true && (
        <>
          <DatePickerField
            label={`다음 결제일 / 자동 갱신일 (${isNew ? "필수" : "선택"})`}
            value={form.serverNextPaymentDate || ""}
            onChange={(v) => patch("serverNextPaymentDate", v)}
            minimumDate={today}
          />
          <DatePickerField
            label="해지 마감일 (선택)"
            value={form.serverCancellationDeadline || ""}
            onChange={(v) => patch("serverCancellationDeadline", v)}
            minimumDate={today}
          />
        </>
      )}
      {(subscription || false) && (
        <DatePickerField
          label={subscription ? "다음 결제일 (필수)" : "다음 일정 날짜"}
          value={form.eventDate}
          onChange={(v) => patch("eventDate", v)}
          minimumDate={today}
        />
      )}
      <View style={{ marginTop: 14 }}>
        <Field
          label="결제 · 갱신 주기 (개월, 선택)"
          value={cycle}
          onChangeText={setCycle}
          number
          placeholder="미설정 · 1~60개월"
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          {[1, 3, 6, 12, 24].map((months) => (
            <Pressable
              key={months}
              accessibilityRole="button"
              accessibilityState={{ selected: Number(cycle) === months }}
              onPress={() => setCycle(String(months))}
              style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: Number(cycle) === months ? colors.accent : colors.soft }}
            >
              <Text style={{ fontSize: 12, color: Number(cycle) === months ? "#fff" : colors.accent }}>
                {months % 12 === 0 ? `${months / 12}년` : `${months}개월`}
              </Text>
            </Pressable>
          ))}
          {initialCycle == null && (
            <Pressable accessibilityRole="button" accessibilityState={{ selected: !cycle }} onPress={() => setCycle("")} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: !cycle ? colors.accent : colors.soft }}>
              <Text style={{ fontSize: 12, color: !cycle ? "#fff" : colors.accent }}>미설정</Text>
            </Pressable>
          )}
        </View>
        <Text style={[styles.muted, { fontSize: 11 }]}>
          선택한 주기에 따라 다음 결제일과 알림 일정이 갱신돼요. 알림은 일정 3일 전 오전 9시에 예약돼요.
          {initialCycle == null ? " 선택하지 않으면 주기를 자동으로 설정하지 않아요." : " 기존에 설정한 주기를 다른 개월 수로 변경할 수 있어요."}
        </Text>
      </View>
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
        <Info title={"서버에 계약을 저장해요"}>
          {
            "로그인한 계정의 계약으로 저장돼요. 다른 기기에서도 같은 계정으로 조회할 수 있어요."
          }
        </Info>
      </View>
    </Page>
  );
}

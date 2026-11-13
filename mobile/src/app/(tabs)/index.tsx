import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../state/AppStore";
import {
  Card,
  ContractRow,
  Empty,
  IconButton,
  Page,
  Section,
  colors,
  styles,
} from "../../components/ui";
import { Icon } from "../../components/Icon";
import { localDate, money, dateText } from "../../model";
export default function Home() {
  const { data, mode, dashboard, setDashboardMonth, refresh } = useApp();
  const activeContracts =
    mode === "server"
      ? data.contracts.filter((c) => c.server?.status === "ACTIVE")
      : data.contracts;
  const total =
    mode === "server"
      ? (dashboard?.monthlyExpense ??
        activeContracts.reduce((s, c) => s + c.amount, 0))
      : data.contracts.reduce((s, c) => s + c.amount, 0);
  const now = new Date();
  const [month, setMonth] = useState(
    new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [day, setDay] = useState(now.getDate());
  useEffect(() => {
    setDashboardMonth?.(
      `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`,
    );
  }, [month, setDashboardMonth]);
  const selected = localDate(
    new Date(month.getFullYear(), month.getMonth(), day),
  );
  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const serverEvents =
    dashboard?.month === monthKey ? dashboard.calendarEvents : [];
  const events =
    mode === "server"
      ? serverEvents
          .filter((e) => e.date === selected)
          .map((e, i) => ({
            id: `${e.contractId}:${e.eventType}:${i}`,
            contractId: e.contractId,
            title: e.contractTitle,
            eventLabel: e.title,
            amount:
              data.contracts.find((c) => c.id === e.contractId)?.amount || 0,
          }))
      : data.contracts
          .filter((c) => c.eventDate === selected)
          .map((c) => ({ ...c, contractId: c.id }));
  const upcoming = data.contracts
    .filter(
      (c) => c.eventDate >= localDate(now) && c.eventLabel.includes("해지"),
    )
    .sort((a, b) => a.eventDate.localeCompare(b.eventDate))[0];
  const groups = [
    {
      name: "부동산",
      amount: activeContracts
        .filter((c) => c.category === "부동산")
        .reduce((s, c) => s + c.amount, 0),
      color: colors.accent,
    },
    {
      name: "구독",
      amount: activeContracts
        .filter((c) => c.category === "구독")
        .reduce((s, c) => s + c.amount, 0),
      color: "#a6c2a8",
    },
    {
      name: "기타",
      amount: activeContracts
        .filter((c) => !["부동산", "구독"].includes(c.category))
        .reduce((s, c) => s + c.amount, 0),
      color: "#e9bc9d",
    },
  ];
  const changeMonth = (offset: number) => {
    setMonth(new Date(month.getFullYear(), month.getMonth() + offset, 1));
    setDay(1);
  };
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return (
    <Page
      title="계약의 모든것"
      right={
        <View>
          <IconButton
            name="bell"
            label={`알림 ${data.notices.length}개`}
            onPress={() => router.push("/notifications")}
          />
          {data.notices.length > 0 && (
            <View
              style={{
                position: "absolute",
                right: 11,
                top: 9,
                width: 5,
                height: 5,
                borderRadius: 5,
                backgroundColor: "#e5a281",
              }}
            />
          )}
        </View>
      }
    >
      {mode === "server" && (
        <Pressable
          accessibilityRole="button"
          onPress={() => void refresh()}
          style={{ alignSelf: "flex-end", padding: 8 }}
        >
          <Text style={styles.link}>다시 불러오기</Text>
        </Pressable>
      )}
      <View style={{ paddingTop: 10, paddingBottom: 22 }}>
        <Text style={styles.muted}>오늘도 안심되는 하루</Text>
        <Text style={[styles.title, { marginTop: 8 }]}>
          내 생활 속 계약,{"\n"}
          <Text style={{ color: colors.accent, fontWeight: "700" }}>
            잘 챙기고 있어요.
          </Text>
        </Text>
        <View
          style={{
            position: "absolute",
            right: 5,
            top: 22,
            backgroundColor: colors.soft,
            width: 62,
            height: 66,
            borderRadius: 24,
            alignItems: "center",
            justifyContent: "center",
            transform: [{ rotate: "8deg" }],
          }}
        >
          <Icon name="leaf" size={33} />
        </View>
      </View>
      <Section
        title={`등록된 계약  ${data.contracts.length}`}
        right="전체 보기"
        onPress={() => router.push("/contracts")}
      />
      <Card style={{ paddingVertical: 3, paddingHorizontal: 16 }}>
        {data.contracts.length ? (
          data.contracts.slice(0, 3).map((c, i) => (
            <View
              key={c.id}
              style={
                i
                  ? { borderTopWidth: 1, borderTopColor: colors.line }
                  : undefined
              }
            >
              <ContractRow contract={c} />
            </View>
          ))
        ) : (
          <Empty />
        )}
      </Card>
      <Section title="확인이 필요한 계약" />
      {upcoming ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/contract/${upcoming.id}`)}
          style={{
            backgroundColor: "#f9efe5",
            borderRadius: 17,
            padding: 17,
            flexDirection: "row",
            gap: 12,
          }}
        >
          <Icon name="bell" color="#996b4d" size={19} />
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={{ fontSize: 12, color: "#996b4d", fontWeight: "700" }}>
              {upcoming.title} · {upcoming.eventLabel}
            </Text>
            <Text style={{ fontSize: 11, color: "#996b4d" }}>
              {dateText(upcoming.eventDate)}까지 확인해 주세요.
            </Text>
          </View>
        </Pressable>
      ) : (
        <Text style={styles.muted}>현재 확인이 필요한 계약이 없어요.</Text>
      )}
      <Section title="계약 리포트" right={`${now.getMonth() + 1}월`} />
      <Card>
        <View style={styles.between}>
          <View>
            <Text style={styles.muted}>이번 달 고정 지출</Text>
            <Text
              style={{
                fontSize: 31,
                fontWeight: "700",
                letterSpacing: -1,
                color: colors.ink,
                marginTop: 8,
                marginBottom: 17,
              }}
            >
              {money(total)}
              <Text style={{ fontSize: 18, fontWeight: "400" }}> 원</Text>
            </Text>
          </View>
          <View
            style={{
              padding: 9,
              borderRadius: 12,
              backgroundColor: colors.soft,
            }}
          >
            <Icon name="wallet" />
          </View>
        </View>
        <View
          accessibilityLabel="카테고리별 지출 비율"
          style={{ height: 13, flexDirection: "row", gap: 3, marginBottom: 9 }}
        >
          {groups
            .filter((g) => g.amount > 0)
            .map((g) => (
              <View
                key={g.name}
                style={{
                  flex: g.amount,
                  backgroundColor: g.color,
                  borderRadius: 4,
                }}
              />
            ))}
        </View>
        {groups.map((g) => (
          <View key={g.name} style={[styles.between, { marginTop: 13 }]}>
            <View style={styles.row}>
              <View
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 7,
                  backgroundColor: g.color,
                }}
              />
              <Text style={styles.muted}>{g.name}</Text>
            </View>
            <Text style={[styles.text, { fontSize: 12, fontWeight: "600" }]}>
              {money(g.amount)}원{" "}
              <Text style={{ color: colors.muted, fontSize: 10 }}>
                {total ? Math.round((g.amount / total) * 100) : 0}%
              </Text>
            </Text>
          </View>
        ))}
      </Card>
      <Card style={{ marginTop: 13 }}>
        <View style={[styles.between, { marginBottom: 15 }]}>
          <Text style={styles.h3}>
            {month.getFullYear()}년 {month.getMonth() + 1}월
          </Text>
          <View style={{ flexDirection: "row" }}>
            <IconButton
              name="back"
              label="이전 달"
              onPress={() => changeMonth(-1)}
            />
            <IconButton
              name="chevron"
              label="다음 달"
              onPress={() => changeMonth(1)}
            />
          </View>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
            <Text
              key={d}
              style={{
                width: "14.2857%",
                textAlign: "center",
                color: colors.muted,
                fontSize: 10,
                marginBottom: 8,
              }}
            >
              {d}
            </Text>
          ))}
          {Array.from({ length: month.getDay() }, (_, i) => (
            <View key={`blank${i}`} style={{ width: "14.2857%" }} />
          ))}
          {Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const hasEvent =
              mode === "server"
                ? serverEvents.some(
                    (e) =>
                      e.date ===
                      localDate(
                        new Date(month.getFullYear(), month.getMonth(), d),
                      ),
                  )
                : data.contracts.some(
                    (c) =>
                      c.eventDate ===
                      localDate(
                        new Date(month.getFullYear(), month.getMonth(), d),
                      ),
                  );
            return (
              <Pressable
                key={d}
                accessibilityRole="button"
                accessibilityState={{ selected: day === d }}
                accessibilityLabel={`${month.getMonth() + 1}월 ${d}일${hasEvent ? ", 계약 일정 있음" : ""}`}
                onPress={() => setDay(d)}
                style={{
                  width: "14.2857%",
                  height: 35,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: day === d ? colors.accent : "transparent",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: day === d ? "#fff" : colors.ink,
                  }}
                >
                  {d}
                </Text>
                {hasEvent && (
                  <View
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 3,
                      backgroundColor: day === d ? "#fff" : "#d5a17d",
                      position: "absolute",
                      bottom: 3,
                    }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.line,
            marginTop: 14,
            paddingTop: 15,
            gap: 10,
          }}
        >
          {events.length ? (
            events.map((c) => (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                onPress={() => router.push(`/contract/${c.contractId}`)}
                style={styles.row}
              >
                <View
                  style={{
                    backgroundColor: colors.soft,
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ fontSize: 19, color: colors.accent }}>
                    {day}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.text, { fontSize: 12, fontWeight: "600" }]}
                  >
                    {c.title} · {c.eventLabel}
                  </Text>
                  <Text style={styles.muted}>{money(c.amount)}원</Text>
                </View>
                <Icon name="chevron" size={16} />
              </Pressable>
            ))
          ) : (
            <Text style={styles.muted}>{day}일 · 등록된 일정이 없어요.</Text>
          )}
        </View>
      </Card>
      <Text style={[styles.muted, { fontSize: 10, marginTop: 16 }]}>
        {mode === "demo"
          ? "데모 모드 · 기기에 저장된 예시 데이터"
          : "서버에 저장된 내 계약 · 월 지출은 활성 계약 기준"}
      </Text>
    </Page>
  );
}

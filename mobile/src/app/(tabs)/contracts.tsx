import React, { useState } from "react";
import { Text, TextInput, View, Pressable } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../state/AppStore";
import { categories, dateText } from "../../model";
import {
  Card,
  ContractRow,
  Empty,
  Page,
  colors,
  styles,
} from "../../components/ui";
import { Icon } from "../../components/Icon";
export default function Contracts() {
  const { data, mode, refresh } = useApp();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState(false);
  const list = data.contracts.filter(
    (c) =>
      (filter === "전체" || c.category === filter) &&
      `${c.title} ${c.provider}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (sort) list.sort((a, b) => b.amount - a.amount);
  return (
    <Page
      title="내 계약"
      right={
        mode === "server" ? (
          <Pressable accessibilityRole="button" onPress={() => void refresh()}>
            <Text style={styles.link}>다시 불러오기</Text>
          </Pressable>
        ) : undefined
      }
    >
      <View style={[styles.row, styles.input, { marginBottom: 18 }]}>
        <Icon name="search" size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="계약 검색"
          placeholder="계약명이나 계약 상대방 검색"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, fontSize: 12, color: colors.ink }}
        />
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: 20,
        }}
      >
        {["전체", ...categories].map((c) => (
          <Pressable
            key={c}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === c }}
            onPress={() => setFilter(c)}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 9,
              borderRadius: 99,
              borderWidth: 1,
              borderColor: filter === c ? colors.accent : colors.line,
              backgroundColor: filter === c ? colors.accent : "#fff",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: filter === c ? "#fff" : colors.muted,
              }}
            >
              {c}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.between, { marginBottom: 14 }]}>
        <Text style={styles.muted}>
          총{" "}
          <Text style={{ color: colors.ink, fontWeight: "700" }}>
            {list.length}
          </Text>
          건
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSort(!sort)}
          hitSlop={10}
        >
          <Text style={styles.muted}>{sort ? "금액 높은 순" : "등록순"} ⇅</Text>
        </Pressable>
      </View>
      {list.length ? (
        list.map((c) => (
          <Card
            key={c.id}
            style={{
              paddingTop: 0,
              paddingBottom: 0,
              marginBottom: 11,
              paddingHorizontal: 17,
            }}
          >
            <ContractRow contract={c} />
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push(`/contract/${c.id}`)}
              style={[
                styles.between,
                {
                  borderTopWidth: 1,
                  borderTopColor: colors.line,
                  paddingVertical: 12,
                },
              ]}
            >
              <Text style={[styles.muted, { fontSize: 10 }]}>
                {c.eventLabel} {dateText(c.eventDate)}
              </Text>
              <Text style={[styles.link, { fontSize: 10 }]}>자세히 보기 ›</Text>
            </Pressable>
          </Card>
        ))
      ) : (
        <Empty text="일치하는 계약이 없어요.\n계약을 추가하거나 검색 조건을 바꿔보세요." />
      )}
    </Page>
  );
}

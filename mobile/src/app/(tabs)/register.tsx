import React from "react";
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Page, colors, styles } from "../../components/ui";
import { Icon, IconName } from "../../components/Icon";
export default function Register() {
  return (
    <Page title="등록">
      <Text style={[styles.title, { marginTop: 15 }]}>
        어떤 계약을{"\n"}등록할까요?
      </Text>
      <Text style={[styles.muted, { marginTop: 10, marginBottom: 4 }]}>
        계약부터 구독까지, 한곳에서 챙겨요.
      </Text>
      {(
        [
          {
            title: "계약서 등록",
            text: "부동산, 헬스장 등\n계약서를 간편하게 정리해요",
            link: "계약서 올리기",
            icon: "doc",
            path: "/upload",
          },
          {
            title: "구독 서비스 등록",
            text: "OTT, 음악, 정기 배송 등\n구독 정보를 직접 입력해요",
            link: "구독 추가하기",
            icon: "play",
            path: "/subscription",
          },
        ] as const
      ).map((c, i) => (
        <Pressable
          key={c.title}
          accessibilityRole="button"
          onPress={() => router.push(c.path)}
          style={({ pressed }) => [
            styles.card,
            {
              marginTop: 16,
              padding: 25,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <View>
            <Text style={[styles.h3, { fontSize: 17, marginBottom: 10 }]}>
              {c.title}
            </Text>
            <Text style={styles.muted}>{c.text}</Text>
            <Text style={[styles.link, { fontSize: 11, marginTop: 15 }]}>
              {c.link} ›
            </Text>
          </View>
          <View
            style={{
              width: 70,
              height: 80,
              borderRadius: 23,
              backgroundColor: i ? "#f9eee4" : colors.soft,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ rotate: i ? "-7deg" : "7deg" }],
            }}
          >
            <Icon
              name={c.icon as IconName}
              size={36}
              color={i ? "#b58261" : colors.accent}
            />
          </View>
        </Pressable>
      ))}
      <View
        style={[
          styles.row,
          { alignItems: "flex-start", padding: 18, marginTop: 24 },
        ]}
      >
        <Icon name="shield" size={17} color={colors.muted} />
        <Text style={[styles.muted, { flex: 1, fontSize: 11 }]}>
          필요한 정보만 차근차근 입력하세요.{"\n"}등록한 내용은 나중에 수정할 수
          있어요.
        </Text>
      </View>
    </Page>
  );
}

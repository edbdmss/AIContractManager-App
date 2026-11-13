import React, { useState } from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import { useApp } from "../../state/AppStore";
import { Page, Section, Card, Info, colors, styles } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../auth/AuthContext";
export default function My() {
  const { data, togglePush, mode } = useApp();
  const auth = useAuth();
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  return (
    <Page title="마이페이지">
      <Card
        style={{
          marginTop: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          padding: 24,
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: colors.soft,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="user" />
        </View>
        <View>
          <Text style={[styles.h3, { fontSize: 18 }]}>
            안녕하세요, {auth.session?.name || "사용자"}님
          </Text>
          <Text style={[styles.muted, { fontSize: 11, marginTop: 7 }]}>
            계약의 모든것과 함께 안심하는 일상
          </Text>
        </View>
      </Card>
      <Section title="나의 계약의 모든것" />
      <Card style={{ paddingVertical: 0, paddingHorizontal: 18 }}>
        {[
          {
            title: "등록한 계약",
            value: `${data.contracts.length}건`,
            path: "/contracts",
          },
          {
            title: "내 알림",
            value: `${data.notices.length}개`,
            path: "/notifications",
          },
        ].map((x) => (
          <Pressable
            key={x.title}
            accessibilityRole="button"
            onPress={() =>
              router.push(x.path as "/contracts" | "/notifications")
            }
            style={[
              styles.between,
              {
                minHeight: 56,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              },
            ]}
          >
            <Text style={[styles.text, { fontSize: 12 }]}>{x.title}</Text>
            <View style={styles.row}>
              <Text style={styles.muted}>{x.value}</Text>
              <Icon name="chevron" size={16} />
            </View>
          </Pressable>
        ))}
        <View style={[styles.between, { minHeight: 56 }]}>
          <Text style={[styles.text, { fontSize: 12 }]}>
            알림 받기 {mode === "demo" ? "(데모 설정)" : ""}
          </Text>
          <Switch
            accessibilityLabel="알림 받기 데모 설정"
            value={data.pushEnabled}
            onValueChange={async () => {
              try {
                await togglePush();
              } catch (e) {
                setError(e instanceof Error ? e.message : "설정하지 못했어요.");
              }
            }}
            trackColor={{ false: "#ccd3c5", true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </Card>
      <Text style={[styles.muted, { fontSize: 10, marginTop: 10 }]}>
        {mode === "demo"
          ? "설정은 기기에 저장돼요."
          : "수신 설정을 서버에 저장해요. 실제 기기 푸시는 아직 연결되지 않았어요."}
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <Section title="서비스 안내" />
      <Card style={{ paddingVertical: 0, paddingHorizontal: 18 }}>
        {["이용약관", "개인정보 처리방침", "앱 정보"].map((x) => (
          <Pressable
            key={x}
            accessibilityRole="button"
            onPress={() => setInfo(x)}
            style={[
              styles.between,
              {
                minHeight: 56,
                borderBottomWidth: x === "앱 정보" ? 0 : 1,
                borderBottomColor: colors.line,
              },
            ]}
          >
            <Text style={[styles.text, { fontSize: 12 }]}>{x}</Text>
            <Icon name="chevron" size={16} />
          </Pressable>
        ))}
      </Card>
      {!!info && (
        <View style={{ marginTop: 18 }}>
          <Info title={info}>
            {info === "앱 정보"
              ? "계약의 모든것 · React Native + Expo\n프론트엔드 데모 1.0.0"
              : `${info}은 서비스 운영 정책 확정 후 연결할 예정이에요.`}
          </Info>
        </View>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={async () => {
          await auth.logout();
          router.replace("/login");
        }}
        style={{ paddingVertical: 25 }}
      >
        <Text style={styles.link}>
          {mode === "demo" ? "데모 종료하고 로그인하기 ›" : "로그아웃"}
        </Text>
      </Pressable>
    </Page>
  );
}

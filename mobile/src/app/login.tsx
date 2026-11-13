import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { colors, styles } from "../components/ui";
import { useAuth, errorText } from "../auth/AuthContext";
import { startOAuth, Provider } from "../auth/oauth";
export default function Login() {
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const { client, signIn, enterDemo, error } = useAuth();
  const login = async (provider: Provider) => {
    if (busy) return;
    setBusy(true);
    setNotice("");
    try {
      const session = await startOAuth(client, provider);
      if (session) {
        await signIn(session);
        router.replace("/");
      }
    } catch (e) {
      setNotice(errorText(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.mint }}
      contentContainerStyle={{
        flexGrow: 1,
        padding: 25,
        paddingTop: insets.top + 50,
        paddingBottom: Math.max(insets.bottom, 25),
        justifyContent: "space-between",
      }}
    >
      <View>
        <View style={styles.row}>
          <Icon name="leaf" size={28} />
          <Text style={[styles.h3, { fontSize: 24 }]}>계약의 모든것</Text>
        </View>
        <Text
          style={[
            styles.title,
            { fontSize: 30, lineHeight: 46, marginTop: 26 },
          ]}
        >
          챙겨야 할 계약은 줄이고,{"\n"}편안한 일상은 더하고.
        </Text>
        <Text style={[styles.muted, { marginTop: 12, color: "#6b8572" }]}>
          내 생활 속 모든 계약,{"\n"}이제 한곳에서 가볍게 관리해요.
        </Text>
      </View>
      <View
        style={{ height: 200, justifyContent: "center", alignItems: "center" }}
      >
        <View
          style={{
            width: 111,
            height: 139,
            backgroundColor: "#fffdf5",
            padding: 22,
            borderRadius: 12,
            transform: [{ rotate: "-12deg" }],
            boxShadow: "9px 13px 0 #aac8b2",
          }}
        >
          <Icon name="leaf" size={29} />
          {[65, 65, 40].map((w, i) => (
            <View
              key={i}
              style={{
                width: w,
                height: 5,
                borderRadius: 5,
                backgroundColor: "#d7e4d8",
                marginTop: 10,
              }}
            />
          ))}
        </View>
        <View
          style={{
            position: "absolute",
            right: 65,
            bottom: 20,
            width: 55,
            height: 55,
            borderRadius: 30,
            borderWidth: 5,
            borderColor: colors.mint,
            backgroundColor: colors.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="check" color="#fff" size={24} />
        </View>
      </View>
      <View>
        {[
          {
            provider: "kakao",
            label: "카카오로 시작하기",
            color: "#fee500",
            ink: "#191919",
            mark: "●",
          },
          {
            provider: "naver",
            label: "네이버로 시작하기",
            color: "#03c75a",
            ink: "#fff",
            mark: "N",
          },
        ].map((x) => (
          <Pressable
            key={x.label}
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void login(x.provider as Provider)}
            style={{
              height: 51,
              borderRadius: 13,
              backgroundColor: x.color,
              alignItems: "center",
              justifyContent: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: x.ink }}>
              {x.mark} {x.label}
            </Text>
          </Pressable>
        ))}
        {!!(notice || error) && (
          <Text
            accessibilityRole="alert"
            style={[styles.muted, { marginTop: 12 }]}
          >
            {notice || error}
          </Text>
        )}
        <Text
          style={[
            styles.muted,
            { fontSize: 10, textAlign: "center", marginTop: 15 },
          ]}
        >
          {busy
            ? "로그인 페이지에 연결하고 있어요."
            : "카카오·네이버 계정으로 로그인해요."}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            enterDemo();
          }}
          style={{ padding: 18, alignItems: "center" }}
        >
          <Text style={styles.link}>로그인 없이 데모 둘러보기</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

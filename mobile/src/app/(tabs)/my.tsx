import React, { useState } from "react";
import { View, Text, Pressable, Switch, Linking } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useApp } from "../../state/AppStore";
import { Page, Section, Card, colors, styles } from "../../components/ui";
import { Icon } from "../../components/Icon";
import { useAuth } from "../../auth/AuthContext";
export default function My() {
  const {
    data,
    contractsLoaded,
    noticesLoaded,
    preferencesLoaded,
    togglePush,
  } = useApp();
  const auth = useAuth();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const links = [
    { title: "이용약관", url: process.env.EXPO_PUBLIC_TERMS_URL },
    { title: "개인정보 처리방침", url: process.env.EXPO_PUBLIC_PRIVACY_URL },
  ].filter((link) => !!link.url);
  const open = async (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:")
        throw new Error("안내 페이지 주소를 확인해 주세요.");
      await Linking.openURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "안내 페이지를 열지 못했어요.");
    }
  };
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
            value: contractsLoaded ? `${data.contracts.length}건` : "—",
            path: "/contracts",
          },
          {
            title: "내 알림",
            value: noticesLoaded ? `${data.notices.length}개` : "—",
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
          <Text style={[styles.text, { fontSize: 12 }]}>알림 수신 설정</Text>
          <Switch
            disabled={busy || !preferencesLoaded}
            accessibilityLabel="알림 수신 설정"
            value={data.pushEnabled}
            onValueChange={async () => {
              if (busy) return;
              setBusy(true);
              setError("");
              try {
                await togglePush();
              } catch (e) {
                setError(e instanceof Error ? e.message : "설정하지 못했어요.");
              } finally {
                setBusy(false);
              }
            }}
            trackColor={{ false: "#ccd3c5", true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </Card>
      <Text style={[styles.muted, { fontSize: 10, marginTop: 10 }]}>
        {
          "알림 수신 여부를 계정에 저장해요. 휴대폰의 알림 권한은 기기 설정에서도 확인해 주세요."
        }
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
      <Section title="서비스 안내" />
      <Card style={{ paddingVertical: 0, paddingHorizontal: 18 }}>
        {links.map((link) => (
          <Pressable
            key={link.title}
            accessibilityRole="button"
            onPress={() => void open(link.url!)}
            style={[
              styles.between,
              {
                minHeight: 56,
                borderBottomWidth: 1,
                borderBottomColor: colors.line,
              },
            ]}
          >
            <Text style={[styles.text, { fontSize: 12 }]}>{link.title}</Text>
            <Icon name="chevron" size={16} />
          </Pressable>
        ))}
        <View style={[styles.between, { minHeight: 56 }]}>
          <Text style={[styles.text, { fontSize: 12 }]}>앱 버전</Text>
          <Text style={styles.muted}>
            {Constants.expoConfig?.version || "1.0.0"}
          </Text>
        </View>
      </Card>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={async () => {
          if (busy) return;
          setBusy(true);
          setError("");
          try {
            await auth.logout();
          } catch (e) {
            setError(e instanceof Error ? e.message : "로그아웃하지 못했어요.");
          } finally {
            setBusy(false);
          }
        }}
        style={{ paddingVertical: 25 }}
      >
        <Text style={styles.link}>{"로그아웃"}</Text>
      </Pressable>
    </Page>
  );
}

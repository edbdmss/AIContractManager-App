import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Icon, IconName } from "./Icon";
import { Category, Contract, money } from "../model";
export const colors = {
  accent: "#216650",
  deep: "#194c3e",
  soft: "#e9f2ec",
  mint: "#d8e9dc",
  canvas: "#f5f6f2",
  ink: "#263c33",
  muted: "#7d8981",
  line: "#e9ece7",
  peach: "#f4b69a",
  danger: "#b54b43",
};
export const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 11 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 24,
    lineHeight: 35,
    fontWeight: "600",
    color: colors.ink,
    letterSpacing: -1,
  },
  h3: { fontSize: 16, fontWeight: "700", color: colors.ink },
  text: { fontSize: 13, lineHeight: 22, color: colors.ink },
  muted: { fontSize: 12, lineHeight: 21, color: colors.muted },
  card: { backgroundColor: "#fff", borderRadius: 22, padding: 20 },
  section: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 23,
    marginBottom: 13,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e7dc",
    borderRadius: 12,
    padding: 14,
    minHeight: 49,
    fontSize: 14,
    color: colors.ink,
  },
  badge: {
    backgroundColor: colors.soft,
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  badgeText: { fontSize: 10, fontWeight: "700", color: colors.accent },
  button: {
    borderRadius: 15,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.accent,
  },
  buttonText: { fontSize: 14, fontWeight: "700", color: "#fff" },
  link: { fontSize: 12, color: colors.accent, fontWeight: "600" },
  error: { fontSize: 12, lineHeight: 20, color: colors.danger },
  empty: {
    paddingVertical: 42,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 24,
    color: colors.muted,
  },
});
export function Txt({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return <Text style={muted ? styles.muted : styles.text}>{children}</Text>;
}
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{children}</Text>
    </View>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && { backgroundColor: colors.soft },
        danger && { backgroundColor: "#fbece8" },
        (disabled || pressed) && { opacity: 0.55 },
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          color={danger ? colors.danger : secondary ? colors.accent : "#fff"}
          size={19}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          secondary && { color: colors.accent },
          danger && { color: colors.danger },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
export function IconButton({
  name,
  label,
  onPress,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.5 : 1,
      })}
    >
      <Icon name={name} />
    </Pressable>
  );
}
export function Section({
  title,
  right,
  onPress,
}: {
  title: string;
  right?: string;
  onPress?: () => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.h3}>{title}</Text>
      {!!right &&
        (onPress ? (
          <Pressable accessibilityRole="button" onPress={onPress} hitSlop={10}>
            <Text style={styles.muted}>{right} ›</Text>
          </Pressable>
        ) : (
          <Badge>{right}</Badge>
        ))}
    </View>
  );
}
export function Info({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{
        backgroundColor: colors.soft,
        borderRadius: 19,
        padding: 20,
        gap: 9,
      }}
    >
      <View style={styles.row}>
        <Icon name="spark" size={17} />
        <Text style={[styles.h3, { fontSize: 13, color: colors.accent }]}>
          {title}
        </Text>
      </View>
      <Text style={styles.muted}>{children}</Text>
    </View>
  );
}
export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  number = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  number?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 9, marginVertical: 9 }}>
      <Text style={[styles.text, { fontWeight: "600", fontSize: 12 }]}>
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9aa496"
        keyboardType={number ? "numeric" : "default"}
        multiline={multiline}
        maxLength={multiline ? 3000 : 120}
        style={[
          styles.input,
          multiline && { minHeight: 100, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Page({
  title,
  children,
  back = false,
  right,
  footer,
  scroll = true,
}: {
  title: string;
  children: React.ReactNode;
  back?: boolean;
  right?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.canvas }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ paddingTop: insets.top, backgroundColor: colors.canvas }}>
        <View
          style={{
            height: 64,
            paddingHorizontal: back ? 8 : 22,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.row}>
            {back && (
              <IconButton
                name="back"
                label="뒤로"
                onPress={() =>
                  router.canGoBack() ? router.back() : router.replace("/")
                }
              />
            )}
            <Text
              accessibilityRole="header"
              style={[styles.h3, { fontSize: back ? 18 : 20 }]}
            >
              {title}
            </Text>
          </View>
          {right}
        </View>
      </View>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 21,
            paddingTop: 7,
            paddingBottom: 30,
            gap: 0,
          }}
        >
          {children}
        </ScrollView>
      ) : (
        children
      )}
      {footer && (
        <View
          style={{
            paddingHorizontal: 21,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 15),
            backgroundColor: colors.canvas,
            gap: 10,
          }}
        >
          {footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
export function Loading() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.canvas,
        gap: 15,
      }}
    >
      <ActivityIndicator color={colors.accent} />
      <Txt muted>계약의 모든것을 준비하고 있어요.</Txt>
    </View>
  );
}
export function Empty({
  text = "등록된 계약이 없어요.\n첫 계약을 추가하고 일정을 챙겨보세요.",
}: {
  text?: string;
}) {
  return <Text style={styles.empty}>{text}</Text>;
}
export const categoryIcon: Record<Category, IconName> = {
  부동산: "house",
  구독: "play",
  운동: "gym",
  통신: "phone",
  기타: "doc",
};
export function ServiceIcon({ category }: { category: Category }) {
  const color =
    category === "구독"
      ? "#ba825f"
      : category === "운동"
        ? "#7586aa"
        : category === "통신"
          ? "#8c7ab1"
          : colors.accent;
  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor:
          category === "구독"
            ? "#fdf0e8"
            : category === "운동"
              ? "#edf0fa"
              : category === "통신"
                ? "#f1edfa"
                : colors.soft,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon name={categoryIcon[category]} color={color} size={21} />
    </View>
  );
}
export function ContractRow({ contract: c }: { contract: Contract }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${c.title}, ${money(c.amount)}원, 상세 보기`}
      onPress={() => router.push(`/contract/${c.id}`)}
      style={({ pressed }) => [
        styles.row,
        { paddingVertical: 15, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      <ServiceIcon category={c.category} />
      <View style={{ flex: 1, gap: 5 }}>
        <Text numberOfLines={1} style={[styles.text, { fontWeight: "600" }]}>
          {c.title}
        </Text>
        <Text style={[styles.muted, { fontSize: 10 }]}>
          {c.provider || "직접 등록"} · {c.category}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 5 }}>
        <Text style={[styles.text, { fontWeight: "600", fontSize: 12 }]}>
          {money(c.amount)}원
        </Text>
        <Text style={[styles.muted, { fontSize: 10 }]}>매월</Text>
      </View>
    </Pressable>
  );
}

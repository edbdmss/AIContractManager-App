import React from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";

export function StartupScreen({ onLayout }: { onLayout?: () => void }) {
  return (
    <View onLayout={onLayout} style={{ flex: 1, backgroundColor: "#f5f6f2", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <View style={{ width: "80%", maxWidth: 270, aspectRatio: 1, borderRadius: 70, overflow: "hidden" }}>
        <Image source={require("../../assets/startup-logo.png")} resizeMode="contain" style={{ width: "100%", height: "100%" }} accessible accessibilityLabel="계약의 모든것 로고" />
      </View>
      <View accessibilityLiveRegion="polite" style={{ alignItems: "center", gap: 12, marginTop: 36 }}>
        <ActivityIndicator color="#216650" />
        <Text style={{ fontSize: 12, color: "#7d8981" }}>앱을 준비하고 있어요</Text>
      </View>
    </View>
  );
}

import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Button, colors, styles } from "./ui";
export function RequestState({
  loading,
  error,
  onRetry,
}: {
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={{ paddingVertical: 32, gap: 16 }}>
      {loading ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <Text
            accessibilityRole="alert"
            style={[styles.muted, { textAlign: "center" }]}
          >
            {error || "정보를 불러오지 못했어요."}
          </Text>
          {onRetry && (
            <Button secondary label="다시 불러오기" onPress={onRetry} />
          )}
        </>
      )}
    </View>
  );
}

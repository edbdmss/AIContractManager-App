import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, Platform } from "react-native";
import { AppProvider, useApp } from "../state/AppStore";
import { colors, Loading } from "../components/ui";
import { AuthProvider, useAuth } from "../auth/AuthContext";
function Routes() {
  const auth = useAuth();
  const { ready, storageError } = useApp();
  if (!auth.ready || !ready) return <Loading />;
  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        maxWidth: Platform.OS === "web" ? 480 : undefined,
        alignSelf: "center",
        backgroundColor: colors.canvas,
      }}
    >
      {storageError || auth.error ? (
        <Text
          accessibilityRole="alert"
          style={{ padding: 10, color: colors.danger }}
        >
          {storageError || auth.error}
        </Text>
      ) : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.canvas },
          animation: "slide_from_right",
        }}
      >
        <Stack.Protected guard={!!auth.session||auth.demo} redirectTo="/login">
          <Stack.Screen name="(tabs)"/><Stack.Screen name="contract/[id]"/><Stack.Screen name="subscription"/><Stack.Screen name="notifications"/><Stack.Screen name="upload"/><Stack.Screen name="new-contract"/>
        </Stack.Protected>
        <Stack.Protected guard={!auth.session&&!auth.demo} redirectTo="/">
          <Stack.Screen name="login"/>
        </Stack.Protected>
        <Stack.Screen name="oauth/callback"/>
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <View style={{ flex: 1, backgroundColor: "#eeefe9" }}>
            <Routes />
          </View>
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

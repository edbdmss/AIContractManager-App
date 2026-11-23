import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, Text, Platform } from "react-native";
import { AppProvider, useApp } from "../state/AppStore";
import { colors } from "../components/ui";
import { StartupScreen } from "../components/StartupScreen";
import * as SplashScreen from "expo-splash-screen";
import { AuthProvider, useAuth } from "../auth/AuthContext";
if (Platform.OS !== "web") {
  void SplashScreen.preventAutoHideAsync().catch(() => {});
}
function hideNativeSplash() {
  if (Platform.OS !== "web") void SplashScreen.hideAsync().catch(() => {});
}
// Survives component remounts within this app run.
let startupCompleted = false;
function skipStartup() {
  if (startupCompleted) return true;
  // Web OAuth returns through a full page load, not an in-app navigation.
  return Platform.OS === "web" && typeof window !== "undefined" &&
    /^\/oauth\/(callback|native-callback)\/?$/.test(window.location.pathname);
}
function StartupGate({ children }: { children: React.ReactNode }) {
  const { ready } = useAuth();
  const [minimumElapsed, setMinimumElapsed] = useState(skipStartup);
  const completed = minimumElapsed && ready;
  useEffect(() => {
    if (completed) return;
    const timer = setTimeout(() => setMinimumElapsed(true), 800);
    return () => clearTimeout(timer);
  }, [completed]);
  useEffect(() => {
    if (minimumElapsed && ready) {
      startupCompleted = true;
      hideNativeSplash();
    }
  }, [minimumElapsed, ready]);
  if (!completed) return <StartupScreen onLayout={hideNativeSplash} />;
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.canvas }} />;
  return <>{children}</>;
}
function Routes() {
  const auth = useAuth();
  const { storageError } = useApp();
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
        <Stack.Protected guard={!!auth.session} redirectTo="/login">
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="contract/[id]" />
          <Stack.Screen name="subscription" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="upload" />
          <Stack.Screen name="new-contract" />
        </Stack.Protected>
        <Stack.Protected guard={!auth.session} redirectTo="/">
          <Stack.Screen name="login" />
        </Stack.Protected>
        <Stack.Screen name="oauth/callback" />
        <Stack.Screen name="oauth/native-callback" />
      </Stack>
      <StatusBar style="dark" />
    </View>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StartupGate>
        <AppProvider>
          <View style={{ flex: 1, backgroundColor: "#eeefe9" }}>
            <Routes />
          </View>
        </AppProvider>
        </StartupGate>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

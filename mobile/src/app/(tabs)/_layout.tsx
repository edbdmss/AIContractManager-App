import React from "react";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Icon, IconName } from "../../components/Icon";
import { colors } from "../../components/ui";
export default function TabLayout() {
  const tabs: [string, string, IconName][] = [
    ["index", "홈", "home"],
    ["contracts", "내 계약", "doc"],
    ["register", "등록", "plus"],
    ["chat", "챗봇", "chat"],
    ["my", "MY", "user"],
  ];
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: "#929c94",
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: colors.line,
          height: 82,
          paddingTop: 10,
          paddingBottom: 15,
        },
        tabBarLabelStyle: { fontSize: 10, marginTop: 5 },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      {tabs.map(([name, title, icon]) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            title,
            tabBarIcon: ({ color }) =>
              name === "register" ? (
                <View
                  style={{
                    backgroundColor: colors.accent,
                    width: 40,
                    height: 40,
                    borderRadius: 15,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: -10,
                  }}
                >
                  <Icon name="plus" color="#fff" />
                </View>
              ) : (
                <Icon
                  name={icon}
                  color={typeof color === "string" ? color : colors.accent}
                  size={23}
                />
              ),
          }}
        />
      ))}
    </Tabs>
  );
}

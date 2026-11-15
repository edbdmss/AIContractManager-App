import React from "react";
import { router } from "expo-router";
import { Page, Empty, Button } from "../components/ui";
export default function NotFound() {
  return (
    <Page title="화면을 찾을 수 없어요">
      <Empty text="요청한 화면이 없어요." />
      <Button label="홈으로 이동" onPress={() => router.replace("/")} />
    </Page>
  );
}

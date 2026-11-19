import React, { useRef, useState } from "react";
import { RefreshControl, ScrollView, ScrollViewProps } from "react-native";

export type PullRefreshProps = ScrollViewProps & {
  onRefresh?: () => Promise<void>;
};

export function PullRefreshScrollView({ onRefresh, children, ...props }: PullRefreshProps) {
  const [refreshing, setRefreshing] = useState(false);
  const running = useRef(false);
  const refresh = async () => {
    if (!onRefresh || running.current) return;
    running.current = true;
    setRefreshing(true);
    try { await onRefresh(); }
    catch { /* The store displays request errors. */ }
    finally { running.current = false; setRefreshing(false); }
  };
  return (
    <ScrollView
      {...props}
      alwaysBounceVertical={!!onRefresh}
      refreshControl={onRefresh ? (
        <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor="#216650" colors={["#216650"]} />
      ) : undefined}
    >
      {children}
    </ScrollView>
  );
}

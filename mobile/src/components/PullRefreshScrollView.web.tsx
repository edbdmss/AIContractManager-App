import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import type { PullRefreshProps } from "./PullRefreshScrollView";

// React Native Web's RefreshControl does not implement the pull gesture.
export function PullRefreshScrollView({ onRefresh, children, ...props }: PullRefreshProps) {
  const scroll = useRef<ScrollView>(null);
  const callback = useRef(onRefresh);
  callback.current = onRefresh;
  const running = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [distance, setDistance] = useState(0);
  const enabled = !!onRefresh;

  useEffect(() => {
    if (!enabled) return;
    const element = (scroll.current as unknown as { getScrollableNode(): HTMLElement } | null)?.getScrollableNode();
    if (!element) return;
    let start: { x: number; y: number } | null = null;
    let pull = 0;
    let active = true;
    const begin = (x: number, y: number, target: EventTarget | null) => {
      if (running.current || element.scrollTop > 0 ||
          (target instanceof Element && target.closest('input, textarea, button, a, [role="button"], [contenteditable="true"]'))) return;
      start = { x, y };
      pull = 0;
    };
    const move = (x: number, y: number, event: Event) => {
      if (!start) return;
      const dy = y - start.y;
      if (element.scrollTop > 0 || Math.abs(x - start.x) > Math.abs(dy) || dy < 0) {
        start = null;
        pull = 0;
        setDistance(0);
        return;
      }
      if (dy > 8) {
        if (event.cancelable) event.preventDefault();
        pull = Math.min(dy * 0.5, 96);
        setDistance(pull);
      }
    };
    const finish = () => {
      const shouldRefresh = start !== null && pull >= 60;
      start = null;
      pull = 0;
      setDistance(0);
      if (!shouldRefresh || running.current || !callback.current) return;
      running.current = true;
      setRefreshing(true);
      void Promise.resolve().then(() => callback.current?.()).catch(() => {
        // The store displays request errors.
      }).finally(() => {
        running.current = false;
        if (active) setRefreshing(false);
      });
    };
    const cancel = () => { start = null; pull = 0; setDistance(0); };
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return cancel();
      begin(e.touches[0].clientX, e.touches[0].clientY, e.target);
    };
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return cancel();
      move(e.touches[0].clientX, e.touches[0].clientY, e);
    };
    const mouseDown = (e: MouseEvent) => { if (e.button === 0) begin(e.clientX, e.clientY, e.target); };
    const mouseMove = (e: MouseEvent) => move(e.clientX, e.clientY, e);
    element.addEventListener("touchstart", touchStart, { passive: true });
    element.addEventListener("touchmove", touchMove, { passive: false });
    element.addEventListener("touchend", finish);
    element.addEventListener("touchcancel", cancel);
    element.addEventListener("mousedown", mouseDown);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", finish);
    window.addEventListener("blur", cancel);
    const previousOverscroll = element.style.overscrollBehaviorY;
    element.style.overscrollBehaviorY = "contain";
    return () => {
      active = false;
      element.removeEventListener("touchstart", touchStart);
      element.removeEventListener("touchmove", touchMove);
      element.removeEventListener("touchend", finish);
      element.removeEventListener("touchcancel", cancel);
      element.removeEventListener("mousedown", mouseDown);
      window.removeEventListener("mousemove", mouseMove);
      window.removeEventListener("mouseup", finish);
      window.removeEventListener("blur", cancel);
      element.style.overscrollBehaviorY = previousOverscroll;
    };
  }, [enabled]);

  return (
    <ScrollView {...props} ref={scroll}>
      {enabled && (refreshing || distance > 0) && (
        <View accessibilityLiveRegion="polite" style={{ height: refreshing ? 60 : distance, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {refreshing ? <ActivityIndicator color="#216650" accessibilityLabel="새로고침 중" /> : (
            <Text style={{ color: "#216650", fontSize: 12 }}>{distance >= 60 ? "놓으면 새로고침돼요" : "아래로 당겨 새로고침"}</Text>
          )}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

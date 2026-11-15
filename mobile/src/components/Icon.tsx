import React from "react";
import Svg, { Path, Circle, Rect } from "react-native-svg";
const paths = {
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
  leaf: '<path d="M19 4c-8-1-13 2-13 7a5 5 0 0 0 8 4c3-2 4-6 5-11Z"/><path d="M5 21c0-6 4-10 9-13"/>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
  doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  chat: '<path d="M21 11a9 9 0 0 1-9 9H4l-2 2 1-7A9 9 0 1 1 21 11Z"/><path d="M7 10h10M7 14h6"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  back: '<path d="m15 5-7 7 7 7"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  house: '<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8"/>',
  play: '<rect x="3" y="5" width="18" height="14" rx="4"/><path d="m10 9 5 3-5 3Z"/>',
  gym: '<path d="m3 7 14 14M7 3l14 14M2 12 12 2M12 22l10-10M8 8l8 8"/>',
  phone:
    '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
  spark:
    '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  send: '<path d="m3 3 19 9-19 9 4-9-4-9Zm4 9h15"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 11h18M8 15h2M14 15h2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0M8 16a6 6 0 0 1 8 0M12 20h.01"/>',
  signal: '<path d="M4 19v-3M9 19v-7M14 19V8M19 19V4"/>',
  wallet:
    '<rect x="3" y="5" width="18" height="15" rx="3"/><path d="M17 5V2L4 5M21 10h-6v5h6M17 12.5h.01"/>',
} as const;
export type IconName = keyof typeof paths;
export function Icon({
  name,
  size = 22,
  color = "#216650",
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  const elements = paths[name].match(/<(path|circle|rect)[^>]*\/>/g) || [];
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {elements.map((element, i) => {
        const attrs = Object.fromEntries(
          [...element.matchAll(/(\w+)="([^"]*)"/g)].map((m) => [m[1], m[2]]),
        );
        return element.startsWith("<circle") ? (
          <Circle key={i} {...attrs} />
        ) : element.startsWith("<rect") ? (
          <Rect key={i} {...attrs} />
        ) : (
          <Path key={i} {...attrs} />
        );
      })}
    </Svg>
  );
}

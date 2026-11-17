import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { localDate, validDate } from "../model";
import { colors, styles } from "./ui";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: string;
};

const monthStart = (value: string) => {
  if (validDate(value)) {
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "YYYY-MM-DD",
  minimumDate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => monthStart(value));

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const shiftMonth = (amount: number) =>
    setVisibleMonth(new Date(year, month + amount, 1));

  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.text, { fontWeight: "600", marginBottom: 7 }]}>
        {label}
      </Text>
      <View
        style={[
          styles.input,
          {
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 4,
            paddingRight: 8,
          },
        ]}
      >
        <TextInput
          accessibilityLabel={`${label} 직접 입력`}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          style={{
            flex: 1,
            minHeight: 40,
            paddingHorizontal: 10,
            fontSize: 14,
            color: colors.ink,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${label} 달력 열기`}
          accessibilityState={{ expanded: open }}
          onPress={() => {
            if (!open) setVisibleMonth(monthStart(value));
            setOpen((current) => !current);
          }}
          style={({ pressed }) => ({
            minWidth: 40,
            minHeight: 40,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ color: colors.accent, fontSize: 18 }}>▦</Text>
        </Pressable>
      </View>

      {open && (
        <View
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: "#e2e7dc",
            backgroundColor: "#fff",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="이전 달"
              hitSlop={10}
              onPress={() => shiftMonth(-1)}
            >
              <Text style={{ color: colors.accent, fontSize: 20 }}>‹</Text>
            </Pressable>
            <Text style={styles.h3}>{year}년 {month + 1}월</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="다음 달"
              hitSlop={10}
              onPress={() => shiftMonth(1)}
            >
              <Text style={{ color: colors.accent, fontSize: 20 }}>›</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row" }}>
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => (
              <Text
                key={day}
                style={{
                  width: `${100 / 7}%`,
                  textAlign: "center",
                  color: colors.muted,
                  fontSize: 12,
                  paddingVertical: 6,
                }}
              >
                {day}
              </Text>
            ))}
          </View>

          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {cells.map((day, index) => {
              if (day === null) {
                return <View key={`blank-${index}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
              }
              const date = localDate(new Date(year, month, day));
              const selected = value === date;
              const disabled = Boolean(minimumDate && date < minimumDate);
              return (
                <Pressable
                  key={date}
                  accessibilityRole="button"
                  accessibilityLabel={`${year}년 ${month + 1}월 ${day}일`}
                  accessibilityState={{ selected, disabled }}
                  disabled={disabled}
                  onPress={() => {
                    onChange(date);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    width: `${100 / 7}%`,
                    height: 40,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: disabled || pressed ? 0.35 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 17,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? colors.accent : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        color: selected ? "#fff" : colors.ink,
                        fontSize: 13,
                        fontWeight: selected ? "700" : "400",
                      }}
                    >
                      {day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

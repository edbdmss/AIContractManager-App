import React from "react";
import { useLocalSearchParams } from "expo-router";
import { ContractForm } from "../features/ContractForm";
import { emptyContract, createDemoData } from "../model";
export default function NewContract() {
  const { sample, sourceName } = useLocalSearchParams<{
    sample?: string;
    sourceName?: string;
  }>();
  const initial = sample
    ? {
        ...createDemoData().contracts[0],
        id: "",
        title: "우리집 임대차 계약",
        sourceName: "예시 계약 정보 (AI 분석 아님)",
      }
    : { ...emptyContract(), sourceName };
  return (
    <ContractForm
      initial={initial}
      isNew
      title={sample ? "예시 계약 확인" : "계약 정보 등록"}
    />
  );
}

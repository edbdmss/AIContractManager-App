import React, { useState, useRef } from "react";
import { View, Text, Pressable } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import { Page, Info, Button, styles } from "../components/ui";
import { Icon } from "../components/Icon";
import { useApp } from "../state/AppStore";
import { useAuth } from "../auth/AuthContext";
import { createContractsApi } from "../services/contractsApi";
import { createDocumentsApi } from "../services/documentsApi";
export default function Upload() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const { mode, refresh } = useApp();
  const { client } = useAuth();
  const pending = useRef<{ contractId?: string; documentId?: string }>({});
  const analyze = async () => {
    if (!file || busy) return;
    setBusy(true);
    setError("");
    const contracts = createContractsApi(client);
    const documents = createDocumentsApi(client);
    try {
      if (!pending.current.contractId) {
        setStep("계약을 준비하고 있어요.");
        const c = await contracts.create({
          title: file.name,
          category: "UNCLASSIFIED",
          providerName: null,
          contractStartDate: null,
          contractEndDate: null,
          nextPaymentDate: null,
          cancellationDeadline: null,
          monthlyAmount: 0,
          penaltyAmount: null,
          cancellationTerms: null,
          plainSummary: null,
        });
        pending.current.contractId = c.id;
      }
      const id = pending.current.contractId;
      if (!pending.current.documentId) {
        setStep("파일을 업로드하고 있어요.");
        const d = await documents.upload(id, file);
        pending.current.documentId = d.id;
      }
      setStep("AI가 계약서를 분석하고 있어요.");
      await documents.analyze(id, pending.current.documentId);
      await refresh();
      router.replace(`/contract/${id}`);
    } catch (e) {
      setError(
        (e instanceof Error ? e.message : "분석하지 못했어요.") +
          (pending.current.contractId
            ? " 생성한 계약은 내 계약에 남아 있어요. 다시 누르면 같은 계약으로 이어서 시도해요."
            : ""),
      );
    } finally {
      setBusy(false);
      setStep("");
    }
  };
  const pick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/jpeg", "image/png"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (!result.canceled) {
        const selected = result.assets[0];
        if ((selected.size || 0) > 20 * 1024 * 1024) {
          setError("20MB 이하의 파일을 선택해 주세요.");
          return;
        }
        if (pending.current.contractId) {
          setError(
            "이미 업로드 작업을 시작한 계약이 있어요. 내 계약에서 확인해 주세요.",
          );
          return;
        }
        setFile(selected);
        setError("");
      }
    } catch {
      setError("파일을 선택하지 못했어요. 다시 시도해 주세요.");
    }
  };
  return (
    <Page
      title="계약서 등록"
      back
      footer={
        <Button
          label={
            mode === "server"
              ? "업로드하고 AI 분석하기"
              : "직접 입력하고 등록하기"
          }
          disabled={busy || (mode === "server" && !file)}
          icon="doc"
          onPress={() =>
            mode === "server"
              ? void analyze()
              : router.push({
                  pathname: "/new-contract",
                  params: { sourceName: file?.name || "" },
                })
          }
        />
      }
    >
      <Text style={[styles.title, { marginTop: 15 }]}>
        계약서와 함께,{"\n"}중요한 내용을 한곳에.
      </Text>
      <Text style={[styles.muted, { marginTop: 10, marginBottom: 23 }]}>
        파일을 선택하고 계약의 핵심 정보를 기록해요.
      </Text>
      <Info
        title={
          mode === "server"
            ? "AI가 계약 내용을 정리해요"
            : "AI 자동 분석은 연결 준비 중이에요"
        }
      >
        {mode === "server"
          ? "계약서를 서버로 업로드하고 분석한 뒤 상세 화면에서 내용을 확인하고 수정해 주세요."
          : "데모에서는 직접 입력할 수 있어요. 파일은 업로드되지 않아요."}
      </Info>
      <Text
        style={[
          styles.text,
          { fontSize: 12, fontWeight: "600", marginTop: 23, marginBottom: 10 },
        ]}
      >
        계약서 파일 (선택)
      </Text>
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={pick}
        style={{
          minHeight: 137,
          borderWidth: 1.5,
          borderStyle: "dashed",
          borderColor: "#c2d4bf",
          backgroundColor: "#fff",
          borderRadius: 20,
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          padding: 15,
        }}
      >
        <Icon name={file ? "check" : "plus"} size={28} />
        <Text style={[styles.link, { fontSize: 12 }]}>
          {file ? "파일 다시 선택" : "파일을 선택해 주세요"}
        </Text>
        <Text style={[styles.muted, { fontSize: 10 }]}>
          PDF, JPG, PNG · 최대 20MB
        </Text>
      </Pressable>
      {!!step && <Text style={[styles.link, { marginTop: 12 }]}>{step}</Text>}
      {file && (
        <Text style={[styles.link, { marginTop: 12 }]}>{file.name}</Text>
      )}
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={[styles.error, { marginTop: 12 }]}
        >
          {error}
        </Text>
      )}
      <View style={{ marginTop: 20 }}>
        <Info
          title={
            mode === "server"
              ? "원본 계약서를 함께 저장해요"
              : "현재는 파일명만 함께 기록해요"
          }
        >
          {mode === "server"
            ? "분석에 실패해도 내 계약에서 생성한 계약을 확인할 수 있어요."
            : "데모에서는 파일 내용을 저장하지 않아요. 원본 파일을 따로 보관해 주세요."}
        </Info>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() =>
          router.push({ pathname: "/new-contract", params: { sample: "1" } })
        }
        style={{ paddingVertical: 20 }}
      >
        <Text style={styles.link}>예시 계약 정보로 입력 화면 살펴보기 ›</Text>
      </Pressable>
    </Page>
  );
}

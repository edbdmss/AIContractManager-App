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
import { ApiError } from "../services/http";
export default function Upload() {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(
    null,
  );
  const [error, setError] = useState("");
  const [duplicate, setDuplicate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("");
  const { refresh } = useApp();
  const { client } = useAuth();
  const pending = useRef<{
    contractId?: string;
    documentId?: string;
  }>({});
  const analyze = async () => {
    if (!file || busy) return;
    setBusy(true);
    setDuplicate(false);
    setError("");
    const contracts = createContractsApi(client);
    const documents = createDocumentsApi(client);
    try {
      if (!pending.current.contractId) {
        setStep("계약을 준비하고 있어요.");
        const c = await contracts.createDraft({
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
      router.replace({ pathname: "/contract/[id]", params: { id, registration: "true" } });
    } catch (e) {
      if (e instanceof ApiError && e.code === "DUPLICATE_CONTRACT_DOCUMENT") {
        setDuplicate(true);
        setError("이미 등록된 계약 문서예요. 내 계약에서 기존 계약을 확인해 주세요.");
        pending.current = {};
      } else setError(
        (e instanceof Error ? e.message : "분석하지 못했어요.") +
          (pending.current.contractId
            ? " 아직 저장되지 않았어요. 다시 누르면 같은 파일로 분석을 재시도해요."
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
            "이미 분석을 시작한 파일이 있어요. 다시 분석하거나, 나갔다가 새로 등록해 주세요.",
          );
          return;
        }
        setFile(selected);
        setDuplicate(false);
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
          label={"업로드하고 AI 분석하기"}
          disabled={busy || !file || duplicate}
          icon="doc"
          onPress={() => void analyze()}
        />
      }
    >
      <Text style={[styles.title, { marginTop: 15 }]}>
        계약서와 함께,{"\n"}중요한 내용을 한곳에.
      </Text>
      <Text style={[styles.muted, { marginTop: 10, marginBottom: 23 }]}>

      </Text>
      <Info title={"AI가 계약 내용을 정리해요"}>
        {
          "계약서를 업로드하면 AI가 분석해 줄 거예요. 내용을 확인하고 수정해 주세요."
        }
      </Info>
      <View style={{ marginTop: 20 }}>
        <Info title={"원본 계약서를 함께 저장해요"}>
          {"분석 내용을 확인하고 저장하기를 눌러야 내 계약에 등록돼요."}
        </Info>
      </View>
      <Text
        style={[
          styles.text,
          { fontSize: 12, fontWeight: "600", marginTop: 23, marginBottom: 10 },
        ]}
      >
        계약서 파일
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
      {!!step && <Text style={[styles.link, { marginTop: 12 }]}>{step} </Text>}
      {file && (
          <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center" }}>
            <Text style={[styles.text, { fontSize: 12, marginRight: 8 }]}>
              선택된 파일:
            </Text>
            <Text
                style={[
                  styles.link,
                  {
                    backgroundColor: "#E2ECE1",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                  }
                ]}
            >
              {file.name}
            </Text>
          </View>
      )}
      {!!error && (
        <Text
          accessibilityRole="alert"
          style={[styles.error, { marginTop: 12 }]}
        >
          {error}
        </Text>
      )}

      {duplicate && (
        <Button secondary label="내 계약에서 확인하기" onPress={() => router.replace("/contracts")} />
      )}
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => router.push("/new-contract")}
        style={{ paddingVertical: 20 }}
      >
        <Text style={styles.link}>계약 정보를 직접 입력하기 ›</Text>
      </Pressable>
    </Page>
  );
}

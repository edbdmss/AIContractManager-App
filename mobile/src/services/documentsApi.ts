import { Platform } from "react-native";
import type { DocumentPickerAsset } from "expo-document-picker";
import type { HttpClient } from "./http";
export function createDocumentsApi(client: HttpClient) {
  return {
    upload: async (contractId: string, file: DocumentPickerAsset) => {
      const form = new FormData();
      if (Platform.OS === "web") {
        if (!file.file) throw new Error("선택한 파일을 다시 선택해 주세요.");
        form.append("file", file.file, file.name);
      } else {
        form.append("file", {
          uri: file.uri,
          name: file.name,
          type: file.mimeType || "application/octet-stream",
        } as unknown as Blob);
      }
      return client.request<{ id: string; originalFilename: string }>(
        `/contracts/${encodeURIComponent(contractId)}/documents`,
        { method: "POST", body: form },
      );
    },
    analyze: (contractId: string, documentId: string) =>
      client.request(
        `/contracts/${encodeURIComponent(contractId)}/documents/${encodeURIComponent(documentId)}/analysis`,
        { method: "POST" },
      ),
  };
}

import client from "./client";

export const listContractsApi = () => client.get("/contracts");

export const getContractApi = (contractId) => client.get(`/contracts/${contractId}`);

export const createContractApi = (contract) => client.post("/contracts", contract);

export const updateContractApi = (contractId, contract) =>
  client.put(`/contracts/${contractId}`, contract);

export const verifyAmountApi = (contractId, monthlyAmount) =>
  client.post(`/contracts/${contractId}/verify-amount`, { monthlyAmount });

export const deleteContractApi = (contractId) => client.delete(`/contracts/${contractId}`);

export const listDocumentsApi = (contractId) =>
  client.get(`/contracts/${contractId}/documents`);

export const uploadDocumentApi = (contractId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return client.post(`/contracts/${contractId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteDocumentApi = (contractId, documentId) =>
  client.delete(`/contracts/${contractId}/documents/${documentId}`);

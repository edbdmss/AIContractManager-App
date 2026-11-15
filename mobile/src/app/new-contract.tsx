import React from "react";
import { ContractForm } from "../features/ContractForm";
import { emptyContract } from "../model";
export default function NewContract() {
  return (
    <ContractForm initial={emptyContract()} isNew title="계약 정보 등록" />
  );
}

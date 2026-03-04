import type React from "react";
import type { BankAccountInterestRate } from "./bank-account-interest-rate-interface";

export interface RateModalProps {
  show: boolean;
  editingRate: BankAccountInterestRate | null;
  formRateValue: string;
  setFormRateValue: React.Dispatch<React.SetStateAction<string>>;
  formRateStartDate: string;
  setFormRateStartDate: React.Dispatch<React.SetStateAction<string>>;
  formRateEndDate: string;
  setFormRateEndDate: React.Dispatch<React.SetStateAction<string>>;
  formRateError: string | null;
  isSavingRate: boolean;
  onClose: () => void;
  onSave: () => void;
}

import type { BankAccount } from "../../interfaces/bank-account-interface";

export interface BankAccountsListProps {
  accounts: BankAccount[];
  loading: boolean;
  error?: string | null;
  onCreate: () => void;
  isSavingList?: boolean;
}

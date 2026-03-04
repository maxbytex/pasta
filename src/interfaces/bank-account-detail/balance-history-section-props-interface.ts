import type { BankAccountBalance } from "./bank-account-balance-interface";

export interface BalanceHistorySectionProps {
  balances: BankAccountBalance[];
  onAdd: () => void;
  onEdit: (balance: BankAccountBalance) => void;
  onDelete: (id: number) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  deletingIds?: Set<number>;
}

import type { BankAccountInterestRate } from "./bank-account-interest-rate-interface";

export interface RateHistorySectionProps {
  interestRates: BankAccountInterestRate[];
  onAdd: () => void;
  onEdit: (rate: BankAccountInterestRate) => void;
  onDelete: (id: number) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  deletingIds?: Set<number>;
}

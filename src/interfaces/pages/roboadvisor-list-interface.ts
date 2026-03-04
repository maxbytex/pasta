import type { RoboadvisorInterface } from "../roboadvisor-interface";
import type { BankAccount } from "../../interfaces/bank-account-interface";

export type RoboadvisorListItem = RoboadvisorInterface;

export interface RoboadvisorsListProps {
  roboadvisors: RoboadvisorListItem[];
  bankAccounts: BankAccount[];
  loading: boolean;
  error?: string | null;
  onCreate: () => void;
}

import React from "react";
import { Plus, Building2 } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { NavLink } from "react-router-dom";
import SavingBadge from "../../components/common/SavingBadge";

// BankAccount type is used only in interfaces file

// map account types to Tailwind color styles
const typeStyles: Record<string, { card: { background: string; hoverOpacity?: string }; icon: string }> = {
  checking: {
    card: { background: "linear-gradient(rgb(250, 204, 21), rgb(234, 179, 8))" },
    icon: "text-white",
  },
  savings: {
    card: { background: "linear-gradient(rgb(251, 146, 60), rgb(249, 115, 22))" },
    icon: "text-white",
  },
  credit_card: {
    card: { background: "linear-gradient(rgb(14, 165, 233), rgb(2, 132, 199))" },
    icon: "text-white",
  },
  investment: {
    card: { background: "linear-gradient(rgb(168, 85, 247), rgb(147, 51, 234))" },
    icon: "text-white",
  },
  loan: {
    card: { background: "linear-gradient(rgb(239, 68, 68), rgb(220, 38, 38))" },
    icon: "text-white",
  },
  deposit: {
    card: { background: "linear-gradient(rgb(59, 130, 246), rgb(37, 99, 235))" },
    icon: "text-white",
  },
  other: {
    card: { background: "linear-gradient(rgb(156, 163, 175), rgb(107, 114, 128))" },
    icon: "text-white",
  },
};

import type { BankAccountsListProps } from "../../interfaces/pages/bank-accounts-list-props-interface";

export const BankAccountsList: React.FC<BankAccountsListProps> = ({
  accounts,
  loading,
  error,
  onCreate,
  isSavingList = false,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 pb-6 md:pb-6 flex flex-col relative max-md:rounded-none max-md:border-0 max-md:pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bank Accounts</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {accounts.length} accounts
          </p>
          {isSavingList && <SavingBadge />}
        </div>

          <div className="flex items-center sm:items-center">
          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex-1 pb-32 md:pb-0">
        {loading ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl flex items-center justify-center mb-5">
              <Building2 size={40} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No bank accounts yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Use the button above to add your bank accounts for tracking balances and interest rates.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => {
              const t = account.type || "other";
              const styles = typeStyles[t] || typeStyles.other;
              return (
                <NavLink
                  key={account.id}
                  to={`/editors/banks/${account.id}/balances`}
                  className="group rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: styles.card.background }}
                >
                  <div className="flex items-start mb-3">
                    <div className={styles.icon}>
                      <Building2 size={20} />
                    </div>
                  </div>
                  <h4 className="font-semibold text-white mb-1">
                    {account.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-md text-white capitalize">
                      {account.type?.replace("_", " ") || "bank account"}
                    </span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

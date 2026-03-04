import React from "react";
import { Plus, TrendingUp } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { NavLink } from "react-router-dom";
import { formatFeePercentage } from "../../utils/percentage-utils";
import type { BankAccount } from "../../interfaces/bank-account-interface";

import type { RoboadvisorsListProps, RoboadvisorListItem } from "../../interfaces/pages/roboadvisor-list-interface";

export const RoboadvisorsList: React.FC<RoboadvisorsListProps> = ({
  roboadvisors,
  bankAccounts,
  loading,
  error,
  onCreate,
}) => {

  const getBankAccountName = (id: number) =>
    bankAccounts.find((a: BankAccount) => a.id === id)?.name || "Unknown";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Roboadvisors</h3>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {roboadvisors.length} roboadvisors
          </p>
        </div>
        <div className="flex items-center">
          <button
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>
      {error && <ErrorBanner message={error} />}

      <div className="flex-1">
        {loading ? (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : roboadvisors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-5">
              <TrendingUp size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No roboadvisors yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Use the button above to create roboadvisors for managing your automated investment strategies.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {roboadvisors.map((roboadvisor: RoboadvisorListItem) => (
              <NavLink
                key={roboadvisor.id}
                to={`/editors/roboadvisors/${roboadvisor.id}/balances`}
                className="group rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(rgb(168, 85, 247), rgb(147, 51, 234))" }}
              >
                <div className="flex items-start mb-3">
                  <div className="text-white">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-1">
                  {roboadvisor.name}
                </h4>
                <p className="text-xs text-white/80 mb-2">
                  {getBankAccountName(roboadvisor.bankAccountId)}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded-md bg-white/20 backdrop-blur-sm text-white ${
                      roboadvisor.riskLevel && roboadvisor.riskLevel <= 2
                        ? ""
                        : roboadvisor.riskLevel && roboadvisor.riskLevel <= 5
                        ? ""
                        : ""
                    }`}
                  >
                    Risk: {roboadvisor.riskLevel || 4}/7
                  </span>
                  <span className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white">
                    Fee: {formatFeePercentage(roboadvisor.totalFeePercentage)}
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

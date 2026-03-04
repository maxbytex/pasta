import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { GradientHistoryCard } from "../../../components/common/GradientHistoryCard";
import { Skeleton } from "../../../components/Skeleton";
import SavingBadge from "../../../components/common/SavingBadge";
import { formatDate } from "../../../utils/date-utils";
import type { RoboadvisorBalance } from "../../../interfaces/roboadvisor-detail/roboadvisor-detail-interface";

export const BalancesTab: React.FC<{
  balances: RoboadvisorBalance[];
  loadingDetails: boolean;
  onAdd: () => void;
  onEdit: (b: RoboadvisorBalance) => void;
  onDelete: (id: number) => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isSavingList?: boolean;
}> = ({ balances, loadingDetails, onAdd, onEdit, onDelete, fetchNextPage, hasNextPage, isFetchingNextPage, isSavingList = false }) => {
  if (loadingDetails) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-28 rounded-[18px]" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Balance History</h4>
        {isSavingList && <SavingBadge />}
        </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus size={16} /> Add balance
        </button>
      </div>

      {balances.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No balance entries yet</div>
      ) : (
        <div className="space-y-3">
          {balances.map((balance: RoboadvisorBalance) => (
            <GradientHistoryCard
              key={balance.id}
              borderClassName="border-emerald-500 dark:border-emerald-400"
              gradient="linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"
              actions={
                <>
                    <button
                      onClick={() => onEdit(balance)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(balance.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                </>
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={
                      balance.type === "deposit"
                        ? "w-2 h-2 rounded-full bg-emerald-500"
                        : balance.type === "withdrawal"
                        ? "w-2 h-2 rounded-full bg-red-500"
                        : "w-2 h-2 rounded-full bg-blue-500"
                    }
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{balance.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(balance.date)}</p>
                  </div>
                </div>
                <span className="font-mono text-gray-900 dark:text-white">{balance.amount} {balance.currencyCode}</span>
              </div>
            </GradientHistoryCard>
          ))}
          
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20 w-full sm:w-auto"
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BalancesTab;

import React from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { formatDecimalAsPercentageDisplay } from "../../utils/percentage-utils";
import { formatDate } from "../../utils/date-utils";
import type { RateHistorySectionProps } from "../../interfaces/bank-account-detail/rate-history-section-props-interface";
import { HistoryCard } from "./HistoryCard";
import SavingBadge from "../common/SavingBadge";

export const RateHistorySection: React.FC<RateHistorySectionProps> = ({
  interestRates,
  onAdd,
  onEdit,
  onDelete,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isSavingList = false,
}) => (
  <div>
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center gap-2">
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Interest Rate History</h4>
      {isSavingList && <SavingBadge />}
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
      >
        <Plus size={16} /> Add
      </button>
    </div>
    {interestRates.length === 0
      ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">No interest rates</div>
      : (
        <div className="space-y-3">
          {interestRates.map((rate) => (
            <HistoryCard
              key={rate.id}
              actions={(
                  <>
                    <button
                      onClick={() => onEdit(rate)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(rate.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white">{formatDecimalAsPercentageDisplay(parseFloat(rate.interestRate))} APY</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    From {formatDate(rate.interestRateStartDate)}
                    {rate.interestRateEndDate && ` to ${formatDate(rate.interestRateEndDate)}`}
                  </p>
                </div>
              </div>
            </HistoryCard>
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

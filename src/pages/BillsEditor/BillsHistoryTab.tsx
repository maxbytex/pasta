import React from "react";
import { Edit2, Plus, Trash2, Receipt } from "lucide-react";
import { Skeleton } from "../../components/Skeleton";
import { GradientHistoryCard } from "../../components/common/GradientHistoryCard";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import { formatDate } from "../../utils/date-utils";
import type { Bill } from "../../interfaces/bill-interface";
import type { BillCategory } from "../../interfaces/bill-category-interface";

interface BillsHistoryTabProps {
  bills: Bill[];
  categories: BillCategory[];
  loading: boolean;
  onCreate: () => void;
  onEdit: (bill: Bill) => void;
  onDelete: (id: number) => void;
  deletingIds?: Set<number>;
}

export const BillsHistoryTab: React.FC<BillsHistoryTabProps> = ({
  bills,
  categories,
  loading,
  onCreate,
  onEdit,
  onDelete,
  deletingIds = new Set(),
}) => {
  const getCategoryColor = (categoryName: string) => {
    const cat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
    return cat?.hexColor || "#10b981";
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Bills History</h4>
        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus size={16} /> Add Bill
        </button>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-5">
              <Receipt size={40} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No bills recorded yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Start adding your bills to track your expenses by category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const categoryColor = getCategoryColor(bill.category);
              return (
                <div key={bill.id} style={{ "--category-color": categoryColor } as React.CSSProperties}>
                  <GradientHistoryCard
                    actions={
                      <>
                        <button
                          onClick={() => onEdit(bill)}
                          disabled={deletingIds.has(bill.id)}
                          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(bill.id)}
                          disabled={deletingIds.has(bill.id)}
                          className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    }
                    borderClassName="!border-[var(--category-color)]"
                    gradient={categoryColor}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2">
                          <p className="font-bold text-gray-900 dark:text-white leading-none">
                            {formatDate(bill.date)}
                          </p>
                          <p 
                            className="text-xs text-gray-500 dark:text-gray-400"
                          >
                            {bill.category.replace(/_/g, " ").charAt(0).toUpperCase() + bill.category.replace(/_/g, " ").slice(1).toLowerCase()}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {formatCurrencyWithAlignment(parseFloat(bill.totalAmount), bill.currencyCode)}
                      </span>
                    </div>
                  </GradientHistoryCard>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillsHistoryTab;

import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { GradientHistoryCard } from "../../../components/common/GradientHistoryCard";
import type { RoboadvisorFund } from "../../../interfaces/roboadvisor-detail/roboadvisor-detail-interface";

export const FundsTab: React.FC<{
  funds: RoboadvisorFund[];
  onAdd: () => void;
  onEdit: (f: RoboadvisorFund) => void;
  onDelete: (id: number) => void;
}> = ({ funds, onAdd, onEdit, onDelete }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Fund Allocations</h4>
      </div>
        <button
          onClick={onAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus size={16} /> Add fund
        </button>
      </div>
      {funds.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">No fund allocations yet</div>
      ) : (
        <div className="space-y-3">
          {funds.map((fund: RoboadvisorFund) => (
            <GradientHistoryCard
              key={fund.id}
              borderClassName="border-emerald-500 dark:border-emerald-400"
              gradient="linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"
              actions={
                <>
                    <button
                      onClick={() => onEdit(fund)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(fund.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                </>
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{fund.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {fund.isin} • {fund.assetClass} • {fund.region} • {fund.fundCurrencyCode}
                  </p>
                </div>
                <span className="font-mono text-gray-900 dark:text-white">{(parseFloat(fund.weight) * 100).toFixed(1)}%</span>
              </div>
            </GradientHistoryCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default FundsTab;

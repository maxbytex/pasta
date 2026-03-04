import React from "react";
import { Edit2, Plus, Trash2, ArrowLeft, Wallet } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { TextInputModal } from "../../components/common/TextInputModal";
import { GradientHistoryCard } from "../../components/common/GradientHistoryCard";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import { formatDate } from "../../utils/date-utils";
import useCashEditor from "./hooks/useCashEditor";
import CashCard from "./components/CashCard";
import BalanceModal from "./components/BalanceModal";


export const CashEditor: React.FC = () => {
  const {
    cash,
    loading,
    error,
    selectedCash,
    setSelectedCash,
    showCashModal,
    setShowCashModal,
    editingCash,
    isSavingCash,
    handleCreateCash,
    handleEditCash,
    handleSaveCash,
    handleDeleteCash,
    showBalanceModal,
    setShowBalanceModal,
    editingBalance,
    isSavingBalance,
    handleCreateBalance,
    handleEditBalance,
    handleSaveBalance,
    handleDeleteBalance,
    balances,
    loadingDetails,
    availableCurrencies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    formName,
    formAmount,
    setFormAmount,
    formCurrency,
    setFormCurrency,
    calculateStats,
    deletingCashIds,
    deletingBalanceIds,
  } = useCashEditor();

  if (!selectedCash) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Cash</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {cash.length} labels
            </p>
          </div>

          <div className="flex items-center sm:items-center">
          <button
            onClick={handleCreateCash}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus size={18} /> Add
          </button>
          </div>
        </div>

        {(() => {
          const errorMessage = error ? (error instanceof Error ? error.message : String(error)) : null;
          return errorMessage ? <ErrorBanner message={errorMessage} /> : null;
        })()}

        <div className="flex-1">
          {loading ? (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : cash.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-5">
                <Wallet size={40} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No cash locations yet
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Use the button above to add your cash locations for tracking.
              </p>
            </div>
            ) : (
             <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {cash.map((cashItem) => (
                <CashCard key={cashItem.id} item={cashItem} onSelect={setSelectedCash} isDeleting={deletingCashIds.has(cashItem.id)} />
              ))}
            </div>
          )}
        </div>

        {showCashModal && (
          <TextInputModal
            isOpen={showCashModal}
            onClose={() => setShowCashModal(false)}
            onSave={handleSaveCash}
            title={editingCash ? "Rename Cash" : "Create Cash"}
            label="Cash Name"
            placeholder="e.g., Wallet, Safe"
            defaultValue={formName}
            isSaving={isSavingCash}
          />
        )}
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedCash(null)}
            className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCash.label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Cash</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditCash(selectedCash)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20"
          >
            <Edit2 size={16} /> Edit
          </button>
          <button
            onClick={() => handleDeleteCash(selectedCash.id)}
            disabled={deletingCashIds.has(selectedCash.id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-[#ff4d43] text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          {loadingDetails ? (
            <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[52px] rounded-lg" />
          ) : (
            <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(52, 211, 153), rgb(16, 185, 129))" }}>
              <span className="text-[10px] font-medium text-white uppercase">Total Balance</span>
              <span className="text-sm font-bold text-white">
                {formatCurrencyWithAlignment(stats.totalBalance, "EUR")}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Balance History</h4>
        </div>
        <button
          onClick={handleCreateBalance}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus size={16} /> Add Balance
        </button>
      </div>

      <div className="flex-1">
        {loadingDetails ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : balances.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <Wallet size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No balances yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Use the button above to add your first balance to start tracking this cash location.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {balances.map((balance) => (
              <GradientHistoryCard
                key={balance.id}
                borderClassName={deletingBalanceIds.has(balance.id) ? "border-red-400 dark:border-red-500" : "border-emerald-500 dark:border-emerald-400"}
                gradient={deletingBalanceIds.has(balance.id) ? "linear-gradient(135deg, rgb(248, 113, 113), rgb(239, 68, 68))" : "linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"}
                actions={
                  <>
                    <button
                      onClick={() => handleEditBalance(balance)}
                      disabled={deletingBalanceIds.has(balance.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteBalance(balance.id)}
                      disabled={deletingBalanceIds.has(balance.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(balance.createdAt)}
                    </p>
                  </div>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatCurrencyWithAlignment(parseFloat(balance.balance), balance.currencyCode)}
                  </span>
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

      {/* Cash Modal */}
      {showCashModal && (
        <TextInputModal
          isOpen={showCashModal}
          onClose={() => setShowCashModal(false)}
          onSave={handleSaveCash}
          title={editingCash ? "Rename Cash" : "Create Cash"}
          label="Cash Name"
          placeholder="e.g., Wallet, Safe"
          defaultValue={formName}
          isSaving={isSavingCash}
        />
      )}

      {/* Balance Modal */}
      <BalanceModal
        show={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        isSaving={isSavingBalance}
        editing={editingBalance}
        amount={formAmount}
        onAmountChange={setFormAmount}
        currency={formCurrency}
        onCurrencyChange={setFormCurrency}
        onSave={handleSaveBalance}
        availableCurrencies={availableCurrencies}
      />
    </div>
  );
};

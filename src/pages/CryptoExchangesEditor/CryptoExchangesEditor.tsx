import React from "react";
import type { CryptoExchange } from "../../interfaces/crypto-exchange-interface";
import { Edit2, Plus, Trash2, ArrowLeft, BarChart3, Wallet } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { TextInputModal } from "../../components/common/TextInputModal";
import { GradientHistoryCard } from "../../components/common/GradientHistoryCard";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import { formatDate } from "../../utils/date-utils";

import useCryptoExchangesEditor from "./hooks/useCryptoExchangesEditor";
import ExchangeCard from "./components/ExchangeCard";
import AssetModal from "./components/AssetModal";
import SavingBadge from "../../components/common/SavingBadge";

export const CryptoExchangesEditor: React.FC = () => {
  const {
    exchanges,
    loading,
    error,
    selectedExchange,
    setSelectedExchange,
    showExchangeModal,
    setShowExchangeModal,
    editingExchange,
    isSavingExchange,
    isSavingExchangesList,
    handleCreateExchange,
    handleEditExchange,
    handleSaveExchange,
    handleDeleteExchange,
    showAssetModal,
    setShowAssetModal,
    editingAsset,
    isSavingAsset,
    isSavingAssetsList,
    handleCreateAsset,
    handleEditAsset,
    handleSaveAsset,
    handleDeleteAsset,
    balances,
    loadingDetails,
    availableSymbols,
    formName,
    formTax,
    setFormTax,
    formSymbol,
    setFormSymbol,
    formAmount,
    setFormAmount,
    formInvested,
    setFormInvested,
    formInvestedCurrency,
    setFormInvestedCurrency,
    calculateStats,
  } = useCryptoExchangesEditor();

  if (!selectedExchange) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Crypto Exchanges</h3>
              {isSavingExchangesList && <SavingBadge />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
               {exchanges.length} exchanges
            </p>
          </div>

          <div className="flex items-center sm:items-center">
          <button
            onClick={handleCreateExchange}
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
          ) : exchanges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-5">
                <Wallet size={40} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No crypto exchanges yet
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Use the button above to add your crypto exchanges for tracking assets.
              </p>
            </div>
            ) : (
             <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {exchanges.map((exchange: CryptoExchange) => (
                  <ExchangeCard key={exchange.id} exchange={exchange} onSelect={setSelectedExchange} />
                ))}
             </div>
          )}
        </div>

          {showExchangeModal && (
            <TextInputModal
              isOpen={showExchangeModal}
              onClose={() => setShowExchangeModal(false)}
              onSave={(value) => handleSaveExchange(value, formTax)}
              title={editingExchange ? "Rename Exchange" : "Create Exchange"}
              label="Exchange Name"
              placeholder="e.g., Binance"
              defaultValue={formName}
              secondaryLabel="TAX (%)"
              secondaryValue={formTax}
              secondaryPlaceholder="26"
              onSecondaryChange={setFormTax}
              isSaving={isSavingExchange}
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
            onClick={() => setSelectedExchange(null)}
            className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedExchange.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Crypto Exchange</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditExchange(selectedExchange)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20"
          >
            <Edit2 size={16} /> Edit
          </button>
          <button
            onClick={() => handleDeleteExchange(selectedExchange.id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-[#ff4d43] text-white hover:opacity-90"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          {loadingDetails ? (
            <>
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[52px] rounded-lg" />
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[52px] rounded-lg" />
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[52px] rounded-lg" />
            </>
          ) : (
            <>
              <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Assets</span>
                <span className="text-sm font-bold text-white">{stats.assetCount}</span>
              </div>
              <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(192, 132, 252), rgb(168, 85, 247))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Total Invested</span>
                <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(stats.totalInvested, stats.investedCurrencyCode)}</span>
              </div>
              <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: stats.profitLoss >= 0 ? "linear-gradient(to bottom, rgb(52, 211, 153), rgb(16, 185, 129))" : "linear-gradient(to bottom, rgb(248, 113, 113), rgb(239, 68, 68))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Profit/Loss</span>
                <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(stats.profitLoss, stats.investedCurrencyCode)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Asset History</h4>
          {isSavingAssetsList && <SavingBadge />}
        </div>
          <button
            onClick={handleCreateAsset}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
          <Plus size={16} /> Add Asset
        </button>
      </div>

      <div className="flex-1">
        {loadingDetails ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : balances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 size={32} className="text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No assets yet
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Use the button above to add your first asset and start tracking your crypto portfolio.
              </p>
            </div>
        ) : (
          <div className="space-y-3">
            {balances.map((balance) => (
              <GradientHistoryCard
                key={balance.id}
                borderClassName="border-emerald-500 dark:border-emerald-400"
                gradient="linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"
                actions={
                  <>
                    <button
                      onClick={() => handleEditAsset(balance)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAsset(balance.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
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
                  <div className="text-right">
                    <p className="font-mono text-gray-900 dark:text-white">
                      {parseFloat(balance.balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 8,
                      })} {balance.symbolCode}
                    </p>
                    {balance.investedAmount && balance.investedCurrencyCode && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Invested: {formatCurrencyWithAlignment(parseFloat(balance.investedAmount), balance.investedCurrencyCode)}
                      </p>
                    )}
                  </div>
                </div>
              </GradientHistoryCard>
            ))}
          </div>
        )}
      </div>

      {/* Exchange Modal */}
      {showExchangeModal && (
        <TextInputModal
          isOpen={showExchangeModal}
          onClose={() => setShowExchangeModal(false)}
          onSave={handleSaveExchange}
          title={editingExchange ? "Rename Exchange" : "Create Exchange"}
          label="Exchange Name"
          placeholder="e.g., Binance"
          defaultValue={formName}
          secondaryLabel="Capital Gains Tax (%)"
          secondaryValue={formTax}
          secondaryPlaceholder="26"
          onSecondaryChange={setFormTax}
          isSaving={isSavingExchange}
        />
      )}

      {/* Asset Modal */}
      <AssetModal
        isOpen={showAssetModal}
        onClose={() => setShowAssetModal(false)}
        onSave={handleSaveAsset}
        editingAsset={editingAsset}
        formSymbol={formSymbol}
        setFormSymbol={setFormSymbol}
        formAmount={formAmount}
        setFormAmount={setFormAmount}
        formInvested={formInvested}
        setFormInvested={setFormInvested}
        formInvestedCurrency={formInvestedCurrency}
        setFormInvestedCurrency={setFormInvestedCurrency}
        availableSymbols={availableSymbols}
        isSaving={isSavingAsset}
      />
    </div>
  );
};

import React from "react";
import RoboadvisorHeader from "./components/RoboadvisorHeader";
import RoboadvisorTabs from "./components/RoboadvisorTabs";
import BalancesTab from "./components/BalancesTab";
import FundsTab from "./components/FundsTab";
import BalanceModal from "./components/BalanceModal";
import FundModal from "./components/FundModal";
import useRoboadvisorDetail from "./hooks/useRoboadvisorDetail";
import { Skeleton } from "../../components/Skeleton";
import { formatFeePercentage } from "../../utils/percentage-utils";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import type { RoboadvisorDetailProps } from "../../interfaces/roboadvisor-detail/roboadvisor-detail-props-interface";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export const RoboadvisorDetail: React.FC<RoboadvisorDetailProps> = ({ onEdit, onDelete, onBack }) => {
  const {
    roboadvisor,
    loading,
    balances,
    funds,
    loadingDetails,
    getBankAccountName,
    formatFrequency,
    activeTab,
    kpis,
    // modal / form state and actions
    showBalanceModal,
    setShowBalanceModal,
    editingBalance,
    setEditingBalance,
    isSavingBalance,
    formBalanceDate,
    setFormBalanceDate,
    formBalanceType,
    setFormBalanceType,
    formBalanceAmount,
    setFormBalanceAmount,
    formBalanceCurrency,
    setFormBalanceCurrency,
    showFundModal,
    setShowFundModal,
    editingFund,
    setEditingFund,
    isSavingFund,
    formFundName,
    setFormFundName,
    formFundIsin,
    setFormFundIsin,
    formFundAssetClass,
    setFormFundAssetClass,
    formFundRegion,
    setFormFundRegion,
    formFundCurrency,
    setFormFundCurrency,
    formFundWeight,
    setFormFundWeight,
    formFundShareCount,
    setFormFundShareCount,
    openAddBalance,
    saveBalance,
    removeBalance,
    openAddFund,
    saveFund,
    removeFund,
    fetchNextBalances,
    hasNextBalances,
    isFetchingNextBalances,
    pendingDeleteBalanceId,
    setPendingDeleteBalanceId,
    pendingDeleteFundId,
    setPendingDeleteFundId,
    confirmDeleteBalance,
    confirmDeleteFund,
    deleteBalanceMutation,
    deleteFundMutation,
  } = useRoboadvisorDetail();

  if (loading || !roboadvisor) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20 rounded-[18px]" />
            <Skeleton className="h-9 w-24 rounded-[18px]" />
          </div>
        </div>
        {/* Tab navigation skeleton */}
        <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800 mb-6">
          <Skeleton className="h-10 w-24 mb-0" />
          <Skeleton className="h-10 w-24 mb-0" />
          <Skeleton className="h-10 w-24 mb-0" />
        </div>
        {/* Content skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
        <RoboadvisorHeader
          name={roboadvisor.name}
          bankName={getBankAccountName(roboadvisor.bankAccountId)}
          riskLevel={roboadvisor.riskLevel}
          totalFee={roboadvisor.totalFeePercentage}
          onBack={onBack}
          onEdit={() => onEdit(roboadvisor)}
          onDelete={() => onDelete(roboadvisor.id)}
        />

        <div className="mb-6">
          <div className="flex flex-wrap justify-start gap-2">
            {loading ? (
              <>
                <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[60px] rounded-lg" />
                <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[60px] rounded-lg" />
              </>
            ) : (
              <>
                <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246))" }}>
                  <span className="text-[10px] font-medium text-white uppercase">Invested</span>
                  <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(kpis?.investedMoney || 0, kpis?.currencyCode || "EUR")}</span>
                </div>
                {(() => {
                  const isProfit = (kpis?.profitLoss || 0) >= 0;
                  return (
                    <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: isProfit ? "linear-gradient(to bottom, rgb(52, 211, 153), rgb(16, 185, 129))" : "linear-gradient(to bottom, rgb(248, 113, 113), rgb(220, 38, 38))" }}>
                      <span className="text-[10px] font-medium text-white uppercase">Profit/Loss</span>
                      <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(kpis?.profitLoss || 0, kpis?.currencyCode || "EUR")}</span>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>

        <RoboadvisorTabs roboadvisorId={String(roboadvisor.id)} activeTab={activeTab} />

        <div className="flex-1">
          {activeTab === "balances" ? (
            <BalancesTab
              balances={balances}
              loadingDetails={loadingDetails}
              onAdd={openAddBalance}
              onEdit={(b) => {
                setEditingBalance(b);
                setFormBalanceDate(b.date);
                setFormBalanceType(b.type);
                setFormBalanceAmount(b.amount);
                setFormBalanceCurrency(b.currencyCode);
                setShowBalanceModal(true);
              }}
              onDelete={(id) => removeBalance(id)}
              fetchNextPage={fetchNextBalances}
              hasNextPage={hasNextBalances}
              isFetchingNextPage={isFetchingNextBalances}
            />
          ) : activeTab === "fees" ? (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fee Structure</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Management Fee</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roboadvisor?.managementFeePercentage ? formatFeePercentage(roboadvisor.managementFeePercentage) : "—"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {roboadvisor?.managementFeeFrequency ? formatFrequency(roboadvisor.managementFeeFrequency) : ""}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Custody Fee</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roboadvisor?.custodyFeePercentage ? formatFeePercentage(roboadvisor.custodyFeePercentage) : "—"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {roboadvisor?.custodyFeeFrequency ? formatFrequency(roboadvisor.custodyFeeFrequency) : ""}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Fund TER</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {roboadvisor?.fundTerPercentage ? formatFeePercentage(roboadvisor.fundTerPercentage) : "—"}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {roboadvisor?.terPricedInNav ? "Priced in NAV" : "Not priced in NAV"}
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Total Fee</p>
                  <p className="font-medium text-emerald-700 dark:text-emerald-300">
                    {roboadvisor?.totalFeePercentage ? formatFeePercentage(roboadvisor.totalFeePercentage) : "—"}
                  </p>
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1">Combined annual cost</p>
                </div>
              </div>
            </div>
          ) : (
            <FundsTab
              funds={funds}
              onAdd={openAddFund}
              onEdit={(f) => {
                setEditingFund(f);
                setFormFundName(f.name);
                setFormFundIsin(f.isin);
                setFormFundAssetClass(f.assetClass);
                setFormFundRegion(f.region);
                setFormFundCurrency(f.fundCurrencyCode);
                setFormFundWeight(f.weight);
                setFormFundShareCount(f.shareCount);
                setShowFundModal(true);
              }}
              onDelete={(id) => removeFund(id)}
            />
          )}
        </div>

        <BalanceModal
          show={showBalanceModal}
          onClose={() => setShowBalanceModal(false)}
          isSaving={isSavingBalance}
          editing={editingBalance}
          date={formBalanceDate}
          onDateChange={setFormBalanceDate}
          type={formBalanceType}
          onTypeChange={setFormBalanceType}
          amount={formBalanceAmount}
          onAmountChange={setFormBalanceAmount}
          currency={formBalanceCurrency}
          onCurrencyChange={setFormBalanceCurrency}
          onSave={saveBalance}
        />

        <FundModal
          show={showFundModal}
          onClose={() => setShowFundModal(false)}
          isSaving={isSavingFund}
          editing={editingFund}
          name={formFundName}
          onNameChange={setFormFundName}
          isin={formFundIsin}
          onIsinChange={setFormFundIsin}
          assetClass={formFundAssetClass}
          onAssetClassChange={setFormFundAssetClass}
          region={formFundRegion}
          onRegionChange={setFormFundRegion}
          currency={formFundCurrency}
          onCurrencyChange={setFormFundCurrency}
          weight={formFundWeight}
          onWeightChange={setFormFundWeight}
          shareCount={formFundShareCount}
          onShareCountChange={setFormFundShareCount}
          onSave={saveFund}
        />
      </div>
      <DeleteConfirmModal
        open={pendingDeleteBalanceId !== null}
        isDeleting={deleteBalanceMutation.isPending}
        onConfirm={confirmDeleteBalance}
        onCancel={() => setPendingDeleteBalanceId(null)}
      />
      <DeleteConfirmModal
        open={pendingDeleteFundId !== null}
        isDeleting={deleteFundMutation.isPending}
        onConfirm={confirmDeleteFund}
        onCancel={() => setPendingDeleteFundId(null)}
      />
    </>
  );
};

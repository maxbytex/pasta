import React, { useState } from "react";
import {
  createBankAccountBalance,
  updateBankAccountBalance,
  deleteBankAccountBalance,
  createBankAccountInterestRate,
  updateBankAccountInterestRate,
  deleteBankAccountInterestRate,
} from "../../services/api/accounts";
import { Edit2, Trash2, Wallet, Percent, ArrowLeft } from "lucide-react";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import { formatDecimalAsPercentageForInput, formatDecimalAsPercentageDisplay, convertPercentageStringToDecimal } from "../../utils/percentage-utils";
import { clsx } from "clsx";
import { NavLink, useParams } from "react-router-dom";

import type { BankAccount } from "../../interfaces/bank-account-interface";
import type { BankAccountBalance } from "../../interfaces/bank-account-detail/bank-account-balance-interface";
import type { BankAccountInterestRate } from "../../interfaces/bank-account-detail/bank-account-interest-rate-interface";
import type { BankAccountDetailProps } from "../../interfaces/pages/bank-account-detail-props-interface";
import { BankAccountDetailLoading } from "../../components/bank-account-detail/BankAccountDetailLoading";
import { BalanceHistorySection } from "../../components/bank-account-detail/BalanceHistorySection";
import { RateHistorySection } from "../../components/bank-account-detail/RateHistorySection";
import { BalanceModal } from "../../components/bank-account-detail/BalanceModal";
import { RateModal } from "../../components/bank-account-detail/RateModal";
import { getBankAccountSummary } from "../../utils/bank-account-detail-utils";
import { 
  useBankAccounts, 
  useInfiniteBankAccountBalances, 
  useInfiniteBankAccountInterestRates, 
  useInvalidateQueries 
} from "../../hooks/useFinanceData";
import { useMutation } from "@tanstack/react-query";

export const BankAccountDetail: React.FC<BankAccountDetailProps> = ({
  onEdit,
  onDelete,
  onBack,
}) => {
  const { accountId, tab } = useParams<{ accountId: string; tab: string }>();
  const accountIdNum = accountId ? Number(accountId) : undefined;

  const { data: accountsData, isLoading: loadingAccounts } = useBankAccounts();
  
  const { 
    data: balancesData, 
    isLoading: loadingBalances,
    fetchNextPage: fetchNextBalances,
    hasNextPage: hasNextBalances,
    isFetchingNextPage: isFetchingNextBalances
  } = useInfiniteBankAccountBalances(accountIdNum);

  const { 
    data: ratesData, 
    isLoading: loadingRates,
    fetchNextPage: fetchNextRates,
    hasNextPage: hasNextRates,
    isFetchingNextPage: isFetchingNextRates
  } = useInfiniteBankAccountInterestRates(accountIdNum!);

  const invalidate = useInvalidateQueries();

  const account = (accountsData || []).find((a: BankAccount) => a.id === accountIdNum) || null;
  const balances = balancesData?.pages.flatMap(page => page.results) || [] as BankAccountBalance[];
  const interestRates = ratesData?.pages.flatMap(page => page.results) || [] as BankAccountInterestRate[];

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editingBalance, setEditingBalance] = useState<BankAccountBalance | null>(null);
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  const [showRateModal, setShowRateModal] = useState(false);
  const [editingRate, setEditingRate] = useState<BankAccountInterestRate | null>(null);
  const [isSavingRate, setIsSavingRate] = useState(false);

  const [formBalanceAmount, setFormBalanceAmount] = useState("");
  const [formBalanceCurrency, setFormBalanceCurrency] = useState("EUR");

  const [formRateValue, setFormRateValue] = useState("");
  const [formRateStartDate, setFormRateStartDate] = useState("");
  const [formRateEndDate, setFormRateEndDate] = useState("");
  const [formRateError, setFormRateError] = useState<string | null>(null);

  // Data is provided by React Query hooks: useBankAccounts, useBankAccountBalances, useBankAccountInterestRates
  // reloadKey will cause parent route to remount or change params; React Query invalidation is used on mutations.

  const createBalanceMutation = useMutation<BankAccountBalance, unknown, { accountId: number; amount: string; currency: string }>({
    mutationFn: (payload) => createBankAccountBalance(payload.accountId, payload.amount, payload.currency),
    onSuccess: (data) => {
      // data may contain the created balance and includes currency
      if (accountIdNum) invalidate.invalidateBankAccountBalances(accountIdNum);
      if (data?.currencyCode) localStorage.setItem("last_used_currency", data.currencyCode);
    },
  });

  const updateBalanceMutation = useMutation<BankAccountBalance, unknown, { id: number; amount: string; currency: string }>({
    mutationFn: (payload) => updateBankAccountBalance(payload.id, payload.amount, payload.currency),
    onSuccess: () => {
      // invalidate balances for the current account
      if (accountIdNum) invalidate.invalidateBankAccountBalances(accountIdNum);
    },
  });

  const deleteBalanceMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteBankAccountBalance(id),
    onSuccess: () => {
      if (accountIdNum) invalidate.invalidateBankAccountBalances(accountIdNum);
    },
  });

  const handleSaveBalance = () => {
    if (!account) return;
    setIsSavingBalance(true);
    if (editingBalance) {
      updateBalanceMutation.mutate({ id: editingBalance.id, amount: formBalanceAmount, currency: formBalanceCurrency }, { onSettled: () => setIsSavingBalance(false) });
    } else {
      createBalanceMutation.mutate({ accountId: account.id, amount: formBalanceAmount, currency: formBalanceCurrency }, { onSettled: () => setIsSavingBalance(false) });
    }
    setShowBalanceModal(false);
  };

  const handleDeleteBalance = (id: number) => {
    if (!confirm("Delete this balance record?")) return;
    deleteBalanceMutation.mutate(id);
  };

  const createRateMutation = useMutation<BankAccountInterestRate, unknown, { accountId: number; rate: number; startDate: string; endDate?: string }>({
    mutationFn: (payload) => createBankAccountInterestRate(payload.accountId, payload.rate, payload.startDate, payload.endDate),
    onSuccess: () => {
      invalidate.invalidateBankAccounts();
      if (accountIdNum) {
        invalidate.invalidateBankAccountInterestRates(accountIdNum);
        invalidate.invalidateBankAccountBalances(accountIdNum);
      }
    },
  });

  const updateRateMutation = useMutation<BankAccountInterestRate, unknown, { id: number; rate: number; startDate: string; endDate?: string }>({
    mutationFn: (payload) => updateBankAccountInterestRate(payload.id, payload.rate, payload.startDate, payload.endDate),
    onSuccess: () => {
      invalidate.invalidateBankAccounts();
      if (accountIdNum) {
        invalidate.invalidateBankAccountInterestRates(accountIdNum);
        invalidate.invalidateBankAccountBalances(accountIdNum);
      }
    },
  });

  const deleteRateMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteBankAccountInterestRate(id),
    onSuccess: () => {
      invalidate.invalidateBankAccounts();
      if (accountIdNum) {
        invalidate.invalidateBankAccountInterestRates(accountIdNum);
        invalidate.invalidateBankAccountBalances(accountIdNum);
      }
    },
  });

  const handleSaveRate = () => {
    if (!account) return;

    const decimalRate = convertPercentageStringToDecimal(formRateValue);
    if (decimalRate === null || decimalRate === undefined) {
      setFormRateError("Please enter a valid interest rate percentage.");
      return;
    }

    setFormRateError(null);
    setIsSavingRate(true);

    if (editingRate) {
      updateRateMutation.mutate({ id: editingRate.id, rate: decimalRate, startDate: formRateStartDate, endDate: formRateEndDate || undefined }, { onSettled: () => setIsSavingRate(false) });
    } else {
      createRateMutation.mutate({ accountId: account.id, rate: decimalRate, startDate: formRateStartDate, endDate: formRateEndDate || undefined }, { onSettled: () => setIsSavingRate(false) });
    }
    setShowRateModal(false);
  };

  const handleRateValueChange = (value: React.SetStateAction<string>) => {
    setFormRateValue(value);
    if (formRateError) setFormRateError(null);
  };

  const handleDeleteRate = (id: number) => {
    if (!confirm("Delete this interest rate?")) return;
    deleteRateMutation.mutate(id);
  };

  if (loadingAccounts || !account) {
    return <BankAccountDetailLoading loading={loadingAccounts || !account} />;
  }

  const activeTab = tab || "balances";
  const loadingDetails = loadingBalances || loadingRates;
  const { currentBalance, currencyCode, latestRate, monthlyProfit, annualProfit } = getBankAccountSummary(account, balances);
  const isSavingBalancesList = createBalanceMutation.isPending || updateBalanceMutation.isPending || deleteBalanceMutation.isPending;
  const isSavingRatesList = createRateMutation.isPending || updateRateMutation.isPending || deleteRateMutation.isPending;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{account.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{account.type?.replace("_", " ") || "Bank account"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(account)} className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20">
            <Edit2 size={16} /> Edit
          </button>
          <button onClick={() => onDelete(account.id)} className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-[#ff4d43] text-white hover:opacity-90">
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(52, 211, 153), rgb(16, 185, 129))" }}>
            <span className="text-[10px] font-medium text-white uppercase">Total Balance</span>
            <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(currentBalance, currencyCode)}</span>
          </div>
          <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(192, 132, 252), rgb(168, 85, 247))" }}>
            <span className="text-[10px] font-medium text-white uppercase">Interest Rate</span>
            <span className="text-sm font-bold text-white">{latestRate !== null && latestRate !== undefined ? formatDecimalAsPercentageDisplay(latestRate) : "N/A"}</span>
          </div>
          <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(251, 191, 36), rgb(245, 158, 11))" }}>
            <span className="text-[10px] font-medium text-white uppercase">Monthly Profit</span>
            <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(monthlyProfit, currencyCode)}</span>
          </div>
          <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(251, 191, 36), rgb(245, 158, 11))" }}>
            <span className="text-[10px] font-medium text-white uppercase">Annual Profit</span>
            <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(annualProfit, currencyCode)}</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800 mb-6">
        <NavLink
          to={`/editors/banks/${accountId}/balances`}
          className={({ isActive }) => clsx("pb-3 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-2", isActive || activeTab === "balances" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400")}
        >
          <Wallet size={16} /> Balances
        </NavLink>
        <NavLink
          to={`/editors/banks/${accountId}/rates`}
          className={({ isActive }) => clsx("pb-3 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-2", isActive || activeTab === "rates" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400")}
        >
          <Percent size={16} /> Interest Rates
        </NavLink>
      </div>

      <div className="flex-1">
        {loadingDetails
          ? <div className="text-center py-12 text-gray-500 dark:text-gray-400">Loading details...</div>
          : activeTab === "balances"
            ? (
              <BalanceHistorySection
                balances={balances}
                onAdd={() => {
                  setEditingBalance(null);
                  setFormBalanceAmount("");
                  setFormBalanceCurrency("EUR");
                  setShowBalanceModal(true);
                }}
                onEdit={(balance) => {
                  setEditingBalance(balance);
                  setFormBalanceAmount(balance.balance);
                  setFormBalanceCurrency(balance.currencyCode);
                  setShowBalanceModal(true);
                }}
                onDelete={handleDeleteBalance}
                fetchNextPage={fetchNextBalances}
                hasNextPage={hasNextBalances}
                isFetchingNextPage={isFetchingNextBalances}
                isSavingList={isSavingBalancesList}
              />
            )
            : (
              <RateHistorySection
                interestRates={interestRates}
                onAdd={() => {
                  setEditingRate(null);
                  setFormRateValue("");
                  setFormRateStartDate("");
                  setFormRateEndDate("");
                  setFormRateError(null);
                  setShowRateModal(true);
                }}
                onEdit={(rate) => {
                  setEditingRate(rate);
                  setFormRateValue(formatDecimalAsPercentageForInput(rate.interestRate));
                  setFormRateStartDate(rate.interestRateStartDate);
                  setFormRateEndDate(rate.interestRateEndDate || "");
                  setFormRateError(null);
                  setShowRateModal(true);
                }}
                onDelete={handleDeleteRate}
                fetchNextPage={fetchNextRates}
                hasNextPage={hasNextRates}
                isFetchingNextPage={isFetchingNextRates}
                isSavingList={isSavingRatesList}
              />
            )}
      </div>

      <BalanceModal
        show={showBalanceModal}
        editingBalance={editingBalance}
        formBalanceAmount={formBalanceAmount}
        setFormBalanceAmount={setFormBalanceAmount}
        formBalanceCurrency={formBalanceCurrency}
        setFormBalanceCurrency={setFormBalanceCurrency}
        isSavingBalance={isSavingBalance}
        onClose={() => setShowBalanceModal(false)}
        onSave={handleSaveBalance}
      />

      <RateModal
        show={showRateModal}
        editingRate={editingRate}
        formRateValue={formRateValue}
        setFormRateValue={handleRateValueChange}
        formRateStartDate={formRateStartDate}
        setFormRateStartDate={setFormRateStartDate}
        formRateEndDate={formRateEndDate}
        setFormRateEndDate={setFormRateEndDate}
        isSavingRate={isSavingRate}
        formRateError={formRateError}
        onClose={() => {
          setFormRateError(null);
          setShowRateModal(false);
        }}
        onSave={handleSaveRate}
      />
    </div>
  );
};

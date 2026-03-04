import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import type { Roboadvisor, RoboadvisorBalance, RoboadvisorFund } from "../../../interfaces/roboadvisor-detail/roboadvisor-detail-interface";
import {
  createRoboadvisorBalance,
  updateRoboadvisorBalance,
  deleteRoboadvisorBalance,
  createRoboadvisorFund,
  updateRoboadvisorFund,
  deleteRoboadvisorFund,
} from "../../../services/api/roboadvisor";
import { useRoboadvisors, useBankAccounts, useInfiniteRoboadvisorBalances, useRoboadvisorFunds, useInvalidateQueries } from "../../../hooks/useFinanceData";
import { getDefaultCurrencyCode } from "../../../constants/currency-constants";

export const useRoboadvisorDetail = () => {
  const { roboadvisorId, tab } = useParams<{ roboadvisorId: string; tab: string }>();
  const idNum = roboadvisorId ? Number(roboadvisorId) : undefined;

  const { data: roboadvisorsData, isLoading: loading } = useRoboadvisors();
  const { data: bankAccounts = [] } = useBankAccounts();
  const { 
    data: balancesData, 
    isLoading: loadingBalances,
    fetchNextPage: fetchNextBalances,
    hasNextPage: hasNextBalances,
    isFetchingNextPage: isFetchingNextBalances
  } = useInfiniteRoboadvisorBalances(idNum);
  const { data: funds = [], isLoading: loadingFunds } = useRoboadvisorFunds(idNum);
  const invalidate = useInvalidateQueries();

  const roboadvisor = (roboadvisorsData || []).find((r: Roboadvisor) => r.id === idNum) || null;
  const balances = balancesData?.pages.flatMap(page => page.results) || [] as RoboadvisorBalance[];
  const loadingDetails = loadingBalances || loadingFunds;

  // Calculate KPIs from balances and latestCalculation
  const totalDeposits = balances
    .filter(b => b.type === "deposit")
    .reduce((sum, b) => sum + parseFloat(b.amount), 0);
  const totalWithdrawals = balances
    .filter(b => b.type === "withdrawal")
    .reduce((sum, b) => sum + Math.abs(parseFloat(b.amount)), 0);
  const investedMoney = totalDeposits - totalWithdrawals;
  const currentValue = roboadvisor?.latestCalculation?.currentValue 
    ? parseFloat(roboadvisor.latestCalculation.currentValue) 
    : 0;
  const currencyCode = roboadvisor?.latestCalculation?.currencyCode || "EUR";
  const profitLoss = currentValue - investedMoney;

  // Modal states
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editingBalance, setEditingBalance] = useState<RoboadvisorBalance | null>(null);
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  const [showFundModal, setShowFundModal] = useState(false);
  const [editingFund, setEditingFund] = useState<RoboadvisorFund | null>(null);
  const [isSavingFund, setIsSavingFund] = useState(false);

  const [pendingDeleteBalanceId, setPendingDeleteBalanceId] = useState<number | null>(null);
  const [pendingDeleteFundId, setPendingDeleteFundId] = useState<number | null>(null);

  // Form states for balance
  const [formBalanceDate, setFormBalanceDate] = useState("");
  const [formBalanceType, setFormBalanceType] = useState<"deposit" | "withdrawal" | "adjustment">("deposit");
  const [formBalanceAmount, setFormBalanceAmount] = useState("");
  const [formBalanceCurrency, setFormBalanceCurrency] = useState(getDefaultCurrencyCode());

  // Form states for fund
  const [formFundName, setFormFundName] = useState("");
  const [formFundIsin, setFormFundIsin] = useState("");
  const [formFundAssetClass, setFormFundAssetClass] = useState("equity");
  const [formFundRegion, setFormFundRegion] = useState("Global");
  const [formFundCurrency, setFormFundCurrency] = useState(getDefaultCurrencyCode());
  const [formFundWeight, setFormFundWeight] = useState("0.50");
  const [formFundShareCount, setFormFundShareCount] = useState<number | undefined>(undefined);

  const getBankAccountName = (id: number) => bankAccounts.find((a: { id: number; name: string }) => a.id === id)?.name || "Unknown";

  const formatFrequency = (freq: string) => freq.charAt(0).toUpperCase() + freq.slice(1);

  // Mutations
  type BalanceInput = {
    roboadvisorId: number;
    date: string;
    type: "deposit" | "withdrawal" | "adjustment";
    amount: string;
    currencyCode: string;
  };

  const createBalanceMutation = useMutation<RoboadvisorBalance, unknown, BalanceInput>({
    mutationFn: (data) => createRoboadvisorBalance(data),
    onSuccess: () => invalidate.invalidateRoboadvisorBalances(idNum),
  });

  const updateBalanceMutation = useMutation<RoboadvisorBalance, unknown, { id: number; data: BalanceInput }>(
    {
      mutationFn: ({ id, data }) => updateRoboadvisorBalance(id, data),
      onSuccess: () => invalidate.invalidateRoboadvisorBalances(idNum),
    }
  );

  const deleteBalanceMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteRoboadvisorBalance(id),
    onSuccess: () => invalidate.invalidateRoboadvisorBalances(idNum),
  });

  type FundInput = {
    roboadvisorId: number;
    name: string;
    isin: string;
    assetClass: string;
    region: string;
    fundCurrencyCode: string;
    weight: string;
    shareCount?: number;
  };

  const createFundMutation = useMutation<RoboadvisorFund, unknown, FundInput>({
    mutationFn: (data) => createRoboadvisorFund(data),
    onSuccess: () => invalidate.invalidateRoboadvisorFunds(idNum),
  });

  const updateFundMutation = useMutation<RoboadvisorFund, unknown, { id: number; data: FundInput }>(
    {
      mutationFn: ({ id, data }) => updateRoboadvisorFund(id, data),
      onSuccess: () => invalidate.invalidateRoboadvisorFunds(idNum),
    }
  );

  const deleteFundMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteRoboadvisorFund(id),
    onSuccess: () => invalidate.invalidateRoboadvisorFunds(idNum),
  });

  const activeTab = tab || "balances";

  // Actions
  const openAddBalance = () => {
    setEditingBalance(null);
    setFormBalanceDate(new Date().toISOString().split("T")[0]);
    setFormBalanceType("deposit");
    setFormBalanceAmount("");
    setFormBalanceCurrency(getDefaultCurrencyCode());
    setShowBalanceModal(true);
  };

  const saveBalance = async () => {
    if (!roboadvisor) return;
    setIsSavingBalance(true);
    try {
      const data: BalanceInput = {
        roboadvisorId: roboadvisor.id,
        date: formBalanceDate,
        type: formBalanceType,
        amount: formBalanceAmount,
        currencyCode: formBalanceCurrency,
      };
      if (editingBalance) {
        await updateBalanceMutation.mutateAsync({ id: editingBalance.id, data });
      } else {
        await createBalanceMutation.mutateAsync(data);
      }
      setShowBalanceModal(false);
    } finally {
      setIsSavingBalance(false);
    }
  };

  const removeBalance = (id: number) => {
    setPendingDeleteBalanceId(id);
  };

  const openAddFund = () => {
    setEditingFund(null);
    setFormFundName("");
    setFormFundIsin("");
    setFormFundAssetClass("equity");
    setFormFundRegion("Global");
    setFormFundCurrency(getDefaultCurrencyCode());
    setFormFundWeight("0.50");
    setFormFundShareCount(undefined);
    setShowFundModal(true);
  };

  const saveFund = async () => {
    if (!roboadvisor) return;
    setIsSavingFund(true);
    try {
      const data: FundInput = {
        roboadvisorId: roboadvisor.id,
        name: formFundName,
        isin: formFundIsin,
        assetClass: formFundAssetClass,
        region: formFundRegion,
        fundCurrencyCode: formFundCurrency,
        weight: formFundWeight,
        shareCount: formFundShareCount,
      };
      if (editingFund) {
        await updateFundMutation.mutateAsync({ id: editingFund.id, data });
      } else {
        await createFundMutation.mutateAsync(data);
      }
      setShowFundModal(false);
    } finally {
      setIsSavingFund(false);
    }
  };

  const removeFund = (id: number) => {
    setPendingDeleteFundId(id);
  };

  const confirmDeleteBalance = async () => {
    if (pendingDeleteBalanceId === null) return;
    const id = pendingDeleteBalanceId;
    try {
      await deleteBalanceMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDeleteBalanceId(null);
    }
  };

  const confirmDeleteFund = async () => {
    if (pendingDeleteFundId === null) return;
    const id = pendingDeleteFundId;
    try {
      await deleteFundMutation.mutateAsync(id);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingDeleteFundId(null);
    }
  };

  return {
    roboadvisor,
    loading,
    balances,
    funds,
    loadingDetails,
    getBankAccountName,
    formatFrequency,
    activeTab,
    kpis: {
      currentValue,
      investedMoney,
      totalDeposits,
      totalWithdrawals,
      profitLoss,
      currencyCode,
    },
    // modal / form state
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
    // actions
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
    // expose mutations in case consumers need them
    createBalanceMutation,
    updateBalanceMutation,
    deleteBalanceMutation,
    createFundMutation,
    updateFundMutation,
    deleteFundMutation,
  };
};

export default useRoboadvisorDetail;

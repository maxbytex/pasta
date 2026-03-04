import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useCash, useInfiniteCashBalances, useInvalidateQueries } from "../../../hooks/useFinanceData";
import { createCash, updateCash, deleteCash, createCashBalance, updateCashBalance, deleteCashBalance } from "../../../services/api/cash";
import type { CashBalance } from "../../../interfaces/cash-balance-interface";
import type { CashInterface } from "../../../interfaces/cash-interface";

export function useCashEditor() {
  const { data: cashData = [], isLoading: loading, error } = useCash();
  const cash = (cashData || []) as CashInterface[];
  const [selectedCash, setSelectedCash] = useState<CashInterface | null>(null);
  const invalidate = useInvalidateQueries();

  const createCashMutation = useMutation<CashInterface, unknown, string>({
    mutationFn: (name: string) => createCash(name),
    onSuccess: (data) => {
      invalidate.invalidateCash();
      setSelectedCash(data as CashInterface);
    },
  });

  const updateCashMutation = useMutation<CashInterface, unknown, { id: number; name: string }>({
    mutationFn: (payload) => updateCash(payload.id, payload.name),
    onSuccess: () => invalidate.invalidateCash(),
  });

  const deleteCashMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteCash(id),
    onSuccess: () => invalidate.invalidateCash(),
  });

  const [showCashModal, setShowCashModal] = useState(false);
  const [editingCash, setEditingCash] = useState<CashInterface | null>(null);
  const [isSavingCash, setIsSavingCash] = useState(false);

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [editingBalance, setEditingBalance] = useState<CashBalance | null>(null);
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  const [formName, setFormName] = useState("");

  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("EUR");

  const { 
    data: infiniteBalances, 
    isLoading: loadingDetails,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteCashBalances(selectedCash?.id);
  
  const balances = useMemo(() => infiniteBalances?.pages.flatMap(page => page.results) || [], [infiniteBalances]);
  
  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>(["USD", "EUR", "GBP"]);
    if (balances && balances.length > 0) {
      balances.forEach((balance: CashBalance) => currencies.add(balance.currencyCode));
    }
    return Array.from(currencies).sort();
  }, [balances]);

  const handleCreateCash = () => {
    setEditingCash(null);
    setFormName("");
    setShowCashModal(true);
  };

  const handleEditCash = (cashItem: CashInterface) => {
    setEditingCash(cashItem);
    setFormName(cashItem.label);
    setShowCashModal(true);
  };

  const handleDeleteCash = (id: number) => {
    if (!confirm("Delete this cash location and all its balances?")) return;
    deleteCashMutation.mutate(id, {
      onSuccess: () => {
        if (selectedCash?.id === id) setSelectedCash(null);
      },
    });
  };

  const handleSaveCash = (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setIsSavingCash(true);
    if (editingCash) {
      updateCashMutation.mutate({ id: editingCash.id, name: normalizedName }, { onSettled: () => setIsSavingCash(false) });
    } else {
      createCashMutation.mutate(normalizedName, { onSettled: () => setIsSavingCash(false) });
    }
    setShowCashModal(false);
  };

  const handleCreateBalance = () => {
    setEditingBalance(null);
    setFormAmount("");
    const lastCurrency = localStorage.getItem("last_used_currency") || "EUR";
    setFormCurrency(lastCurrency);
    setShowBalanceModal(true);
  };

  const handleEditBalance = (balance: CashBalance) => {
    setEditingBalance(balance);
    setFormAmount(balance.balance);
    setFormCurrency(balance.currencyCode);
    setShowBalanceModal(true);
  };

  const createBalanceMutation = useMutation<CashBalance, unknown, { cashId: number; amount: string; currency: string }>({
    mutationFn: (payload) => createCashBalance(payload.cashId, payload.amount, payload.currency),
    onSuccess: () => invalidate.invalidateCashBalances(selectedCash?.id),
  });

  const updateBalanceMutation = useMutation<CashBalance, unknown, { id: number; amount: string; currency: string }>({
    mutationFn: (payload) => updateCashBalance(payload.id, payload.amount, payload.currency),
    onSuccess: () => invalidate.invalidateCashBalances(selectedCash?.id),
  });

  const deleteBalanceMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteCashBalance(id),
    onSuccess: () => invalidate.invalidateCashBalances(selectedCash?.id),
  });

  const handleSaveBalance = () => {
    if (!selectedCash) return;
    setIsSavingBalance(true);
    if (editingBalance) {
      updateBalanceMutation.mutate({ id: editingBalance.id, amount: formAmount, currency: formCurrency }, { onSettled: () => setIsSavingBalance(false) });
    } else {
      createBalanceMutation.mutate({ cashId: selectedCash.id, amount: formAmount, currency: formCurrency }, { onSettled: () => { setIsSavingBalance(false); localStorage.setItem("last_used_currency", formCurrency); } });
    }
    setShowBalanceModal(false);
  };

  const handleDeleteBalance = (id: number) => {
    if (!confirm("Delete this balance?")) return;
    deleteBalanceMutation.mutate(id);
  };

  const isSavingCashList = createCashMutation.isPending || updateCashMutation.isPending || deleteCashMutation.isPending;
  const isSavingBalancesList = createBalanceMutation.isPending || updateBalanceMutation.isPending || deleteBalanceMutation.isPending;

  const calculateStats = () => {
    let totalBalance = 0;

    balances.forEach((b) => {
      totalBalance += parseFloat(b.balance);
    });

    return {
      totalBalance,
    };
  };

  return {
    cash,
    loading,
    error,
    selectedCash,
    setSelectedCash,
    showCashModal,
    setShowCashModal,
    editingCash,
    isSavingCash,
    isSavingCashList,
    handleCreateCash,
    handleEditCash,
    handleSaveCash,
    handleDeleteCash,
    showBalanceModal,
    setShowBalanceModal,
    editingBalance,
    isSavingBalance,
    isSavingBalancesList,
    handleCreateBalance,
    handleEditBalance,
    handleSaveBalance,
    handleDeleteBalance,
    balances,
    loadingDetails,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    availableCurrencies,
    formName,
    setFormName,
    formAmount,
    setFormAmount,
    formCurrency,
    setFormCurrency,
    calculateStats,
  };
}

export default useCashEditor;

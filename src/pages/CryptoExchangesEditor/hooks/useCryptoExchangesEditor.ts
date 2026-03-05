import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  createCryptoExchange,
  updateCryptoExchange,
  deleteCryptoExchange,
  createCryptoExchangeBalance,
  updateCryptoExchangeBalance,
  deleteCryptoExchangeBalance,
} from "../../../services/api/cryptoExchanges";
import { useCryptoExchanges, useCryptoExchangeBalances, useInvalidateQueries } from "../../../hooks/useFinanceData";
import type { CryptoExchange } from "../../../interfaces/crypto-exchange-interface";
import type { CryptoExchangeBalance } from "../../../interfaces/crypto-exchange-balance-interface";
import { formatDecimalAsPercentageForInput, convertPercentageStringToDecimal } from "../../../utils/percentage-utils";
import { getDefaultCurrencyCode } from "../../../constants/currency-constants";

export function useCryptoExchangesEditor() {
  const { data: exchanges = [], isLoading: loading, error } = useCryptoExchanges();
  const [selectedExchange, setSelectedExchange] = useState<CryptoExchange | null>(null);

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [editingExchange, setEditingExchange] = useState<CryptoExchange | null>(null);
  const [isSavingExchange, setIsSavingExchange] = useState(false);

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CryptoExchangeBalance | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [deletingExchangeIds, setDeletingExchangeIds] = useState<Set<number>>(new Set());
  const [deletingAssetIds, setDeletingAssetIds] = useState<Set<number>>(new Set());
  const [pendingDeleteExchangeId, setPendingDeleteExchangeId] = useState<number | null>(null);
  const [pendingDeleteAssetId, setPendingDeleteAssetId] = useState<number | null>(null);

  const [formName, setFormName] = useState("");
  const [formTax, setFormTax] = useState("");

  const [formSymbol, setFormSymbol] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formInvested, setFormInvested] = useState("");
  const [formInvestedCurrency, setFormInvestedCurrency] = useState(getDefaultCurrencyCode());

  const { data: balancesData = [], isLoading: loadingDetails } = useCryptoExchangeBalances(selectedExchange?.id);
  const balances = (balancesData || []) as CryptoExchangeBalance[];
  const [availableSymbols] = useState<string[]>(["BTC", "ETH", "USDT", "USDC"]);

  const handleCreateExchange = () => {
    setEditingExchange(null);
    setFormName("");
    setFormTax("");
    setShowExchangeModal(true);
  };

  const handleEditExchange = (exchange: CryptoExchange) => {
    setEditingExchange(exchange);
    setFormName(exchange.name);
    setFormTax(formatDecimalAsPercentageForInput(exchange.taxPercentage));
    setShowExchangeModal(true);
  };

  const invalidate = useInvalidateQueries();
  const deleteExchangeMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteCryptoExchange(id),
    onSuccess: () => invalidate.invalidateCryptoExchanges(),
  });

  const createExchangeMutation = useMutation<CryptoExchange, unknown, { name: string; taxPercentage?: number | null }>({
    mutationFn: (payload) => createCryptoExchange(payload.name, payload.taxPercentage),
    onSuccess: () => invalidate.invalidateCryptoExchanges(),
  });

  const updateExchangeMutation = useMutation<CryptoExchange, unknown, { id: number; name: string; taxPercentage?: number | null }>({
    mutationFn: (payload) => updateCryptoExchange(payload.id, payload.name, payload.taxPercentage),
    onSuccess: () => invalidate.invalidateCryptoExchanges(),
  });

  const handleSaveExchange = (name?: string, tax?: string) => {
    setIsSavingExchange(true);
    const nameToUse = name ?? formName;
    const taxToUse = tax ?? formTax;
    const taxPercentage = convertPercentageStringToDecimal(taxToUse) ?? undefined;
    if (editingExchange) {
      updateExchangeMutation.mutate(
        { id: editingExchange.id, name: nameToUse, taxPercentage },
        {
          onSuccess: () => setShowExchangeModal(false),
          onSettled: () => setIsSavingExchange(false),
        },
      );
    } else {
      createExchangeMutation.mutate(
        { name: nameToUse, taxPercentage },
        {
          onSuccess: () => setShowExchangeModal(false),
          onSettled: () => setIsSavingExchange(false),
        },
      );
    }
  };

  const handleDeleteExchange = (id: number) => {
    setPendingDeleteExchangeId(id);
  };

  const confirmDeleteExchange = () => {
    if (pendingDeleteExchangeId === null) return;
    const id = pendingDeleteExchangeId;
    setDeletingExchangeIds((prev) => new Set(prev).add(id));
    deleteExchangeMutation.mutate(id, {
      onSuccess: () => {
        if (selectedExchange?.id === id) setSelectedExchange(null);
      },
      onSettled: () => {
        setPendingDeleteExchangeId(null);
        setDeletingExchangeIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setFormSymbol("");
    setFormAmount("");
    setFormInvested("");
    setFormInvestedCurrency(getDefaultCurrencyCode());
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: CryptoExchangeBalance) => {
    setEditingAsset(asset);
    setFormSymbol(asset.symbolCode);
    setFormAmount(asset.balance);
    setFormInvested(asset.investedAmount || "");
    setFormInvestedCurrency(asset.investedCurrencyCode || getDefaultCurrencyCode());
    setShowAssetModal(true);
  };

  type AssetPayload = {
    balance: string;
    symbolCode: string;
    investedAmount?: string;
    investedCurrencyCode?: string;
  };

  const createAssetMutation = useMutation<CryptoExchangeBalance, unknown, { exchangeId: number; data: AssetPayload }>({
    mutationFn: (payload) => createCryptoExchangeBalance({ cryptoExchangeId: payload.exchangeId, ...payload.data }),
    onSuccess: (_data, vars) => invalidate.invalidateCryptoExchangeBalances(vars.exchangeId),
  });

  const updateAssetMutation = useMutation<CryptoExchangeBalance, unknown, { id: number; data: AssetPayload }>({
    mutationFn: (payload) => updateCryptoExchangeBalance(payload.id, payload.data),
    onSuccess: () => {
      if (selectedExchange?.id) invalidate.invalidateCryptoExchangeBalances(selectedExchange.id);
    },
  });

  const handleSaveAsset = () => {
    if (!selectedExchange) return;
    setIsSavingAsset(true);
    const investedAmount = formInvested.trim();
    const investedCurrencyCode = formInvestedCurrency.trim().toUpperCase() || getDefaultCurrencyCode();

    const data = {
      balance: formAmount,
      symbolCode: formSymbol.toUpperCase(),
      investedAmount: investedAmount || undefined,
      investedCurrencyCode: investedAmount ? investedCurrencyCode : undefined,
    };

    if (editingAsset) {
      updateAssetMutation.mutate(
        { id: editingAsset.id, data },
        {
          onSuccess: () => setShowAssetModal(false),
          onSettled: () => setIsSavingAsset(false),
        },
      );
    } else {
      createAssetMutation.mutate(
        { exchangeId: selectedExchange.id, data },
        {
          onSuccess: () => setShowAssetModal(false),
          onSettled: () => setIsSavingAsset(false),
        },
      );
    }
  };

  const deleteAssetMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteCryptoExchangeBalance(id),
    onSuccess: () => {
      if (selectedExchange?.id) invalidate.invalidateCryptoExchangeBalances(selectedExchange.id);
    },
  });

  const handleDeleteAsset = (id: number) => {
    setPendingDeleteAssetId(id);
  };

  const confirmDeleteAsset = () => {
    if (pendingDeleteAssetId === null) return;
    const id = pendingDeleteAssetId;
    setDeletingAssetIds((prev) => new Set(prev).add(id));
    deleteAssetMutation.mutate(id, {
      onSettled: () => {
        setPendingDeleteAssetId(null);
        setDeletingAssetIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const calculateStats = () => {
    if (!selectedExchange) {
      return {
        assetCount: 0,
        totalInvested: 0,
        investedCurrencyCode: "USD",
        profitLoss: 0,
      };
    }

    let totalInvested = 0;
    const assetCount = balances.length;
    let totalCurrentValue = 0;
    const investedCurrencyCode = balances.find((b) => b.investedCurrencyCode)?.investedCurrencyCode || "USD";

    balances.forEach((b) => {
      if (b.investedAmount && b.investedCurrencyCode) {
        totalInvested += parseFloat(b.investedAmount);
      }
    });

    const apiCurrentValue = selectedExchange?.latestCalculation?.currentValue;
    if (apiCurrentValue) {
      totalCurrentValue = parseFloat(apiCurrentValue);
    } else {
      totalCurrentValue = totalInvested;
    }

    const profitLoss = totalCurrentValue - totalInvested;

    return {
      assetCount,
      totalInvested,
      investedCurrencyCode,
      profitLoss,
    };
  };

  return {
    exchanges,
    loading,
    error,
    selectedExchange,
    setSelectedExchange,
    showExchangeModal,
    setShowExchangeModal,
    editingExchange,
    isSavingExchange,
    handleCreateExchange,
    handleEditExchange,
    handleSaveExchange,
    handleDeleteExchange,
    pendingDeleteExchangeId,
    setPendingDeleteExchangeId,
    confirmDeleteExchange,
    showAssetModal,
    setShowAssetModal,
    editingAsset,
    isSavingAsset,
    handleCreateAsset,
    handleEditAsset,
    handleSaveAsset,
    handleDeleteAsset,
    pendingDeleteAssetId,
    setPendingDeleteAssetId,
    confirmDeleteAsset,
    balances,
    loadingDetails,
    availableSymbols,
    // form state
    formName,
    setFormName,
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
    deletingExchangeIds,
    deletingAssetIds,
  };
}

export default useCryptoExchangesEditor;

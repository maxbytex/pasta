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

export function useCryptoExchangesEditor() {
  const { data: exchanges = [], isLoading: loading, error } = useCryptoExchanges();
  const [selectedExchange, setSelectedExchange] = useState<CryptoExchange | null>(null);

  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [editingExchange, setEditingExchange] = useState<CryptoExchange | null>(null);
  const [isSavingExchange, setIsSavingExchange] = useState(false);

  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<CryptoExchangeBalance | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState(false);

  const [formName, setFormName] = useState("");
  const [formTax, setFormTax] = useState("");

  const [formSymbol, setFormSymbol] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formInvested, setFormInvested] = useState("");
  const [formInvestedCurrency, setFormInvestedCurrency] = useState("USD");

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
      updateExchangeMutation.mutate({ id: editingExchange.id, name: nameToUse, taxPercentage }, { onSettled: () => setIsSavingExchange(false) });
    } else {
      createExchangeMutation.mutate({ name: nameToUse, taxPercentage }, { onSettled: () => setIsSavingExchange(false) });
    }
    setShowExchangeModal(false);
  };

  const handleDeleteExchange = (id: number) => {
    if (!confirm("Delete this crypto exchange and all its assets?")) return;
    deleteExchangeMutation.mutate(id);
    if (selectedExchange?.id === id) setSelectedExchange(null);
  };

  const handleCreateAsset = () => {
    setEditingAsset(null);
    setFormSymbol("");
    setFormAmount("");
    setFormInvested("");
    setFormInvestedCurrency("USD");
    setShowAssetModal(true);
  };

  const handleEditAsset = (asset: CryptoExchangeBalance) => {
    setEditingAsset(asset);
    setFormSymbol(asset.symbolCode);
    setFormAmount(asset.balance);
    setFormInvested(asset.investedAmount || "");
    setFormInvestedCurrency(asset.investedCurrencyCode || "USD");
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
    const data = {
      balance: formAmount,
      symbolCode: formSymbol.toUpperCase(),
      investedAmount: formInvested || undefined,
      investedCurrencyCode: formInvested ? formInvestedCurrency.toUpperCase() : undefined,
    };

    if (editingAsset) {
      updateAssetMutation.mutate({ id: editingAsset.id, data }, { onSettled: () => setIsSavingAsset(false) });
    } else {
      createAssetMutation.mutate({ exchangeId: selectedExchange.id, data }, { onSettled: () => setIsSavingAsset(false) });
    }
    setShowAssetModal(false);
  };

  const deleteAssetMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteCryptoExchangeBalance(id),
    onSuccess: () => {
      if (selectedExchange?.id) invalidate.invalidateCryptoExchangeBalances(selectedExchange.id);
    },
  });

  const handleDeleteAsset = (id: number) => {
    if (!confirm("Delete this asset?")) return;
    deleteAssetMutation.mutate(id);
  };

  const isSavingExchangesList = createExchangeMutation.isPending || updateExchangeMutation.isPending || deleteExchangeMutation.isPending;
  const isSavingAssetsList = createAssetMutation.isPending || updateAssetMutation.isPending || deleteAssetMutation.isPending;

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
  };
}

export default useCryptoExchangesEditor;

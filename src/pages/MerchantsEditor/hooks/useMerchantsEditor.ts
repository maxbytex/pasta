import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useMerchants, useMerchantReceipts, useInvalidateQueries } from "../../../hooks/useFinanceData";
import { 
  createMerchant, 
  updateMerchant, 
  deleteMerchant, 
  createReceipt, 
  updateReceipt, 
  deleteReceipt 
} from "../../../services/api/merchants";
import type { Merchant } from "../../../interfaces/merchant-interface";
import type { Receipt } from "../../../interfaces/receipt-interface";

export function useMerchantsEditor() {
  const { data: merchantsData = [], isLoading: loading, error } = useMerchants();
  const merchants = (merchantsData || []) as Merchant[];
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const invalidate = useInvalidateQueries();

  const createMerchantMutation = useMutation<Merchant, unknown, string>({
    mutationFn: (name: string) => createMerchant(name),
    onSuccess: (data) => {
      invalidate.invalidateMerchants();
      setSelectedMerchant(data);
    },
  });

  const updateMerchantMutation = useMutation<Merchant, unknown, { id: number; name: string }>({
    mutationFn: (payload) => updateMerchant(payload.id, payload.name),
    onSuccess: () => invalidate.invalidateMerchants(),
  });

  const deleteMerchantMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteMerchant(id),
    onSuccess: () => invalidate.invalidateMerchants(),
  });

  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [isSavingMerchant, setIsSavingMerchant] = useState(false);

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("EUR");
  const [formDescription, setFormDescription] = useState("");

  const { data: receiptsData, isLoading: loadingDetails } = useMerchantReceipts(selectedMerchant?.id);
  
  const receipts = useMemo(() => {
    return (receiptsData?.results || []) as Receipt[];
  }, [receiptsData]);

  const availableCurrencies = useMemo(() => {
    const currencies = new Set<string>(["USD", "EUR", "GBP"]);
    if (receipts && receipts.length > 0) {
      receipts.forEach((receipt: Receipt) => currencies.add(receipt.currencyCode));
    }
    return Array.from(currencies).sort();
  }, [receipts]);

  const handleCreateMerchant = () => {
    setEditingMerchant(null);
    setFormName("");
    setShowMerchantModal(true);
  };

  const handleEditMerchant = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setFormName(merchant.name);
    setShowMerchantModal(true);
  };

  const handleDeleteMerchant = (id: number) => {
    deleteMerchantMutation.mutate(id, {
      onSuccess: () => {
        if (selectedMerchant?.id === id) setSelectedMerchant(null);
      },
    });
  };

  const handleSaveMerchant = () => {
    setIsSavingMerchant(true);
    if (editingMerchant) {
      updateMerchantMutation.mutate({ id: editingMerchant.id, name: formName }, { onSettled: () => setIsSavingMerchant(false) });
    } else {
      createMerchantMutation.mutate(formName, { onSettled: () => setIsSavingMerchant(false) });
    }
    setShowMerchantModal(false);
  };

  const handleCreateReceipt = () => {
    setEditingReceipt(null);
    setFormAmount("");
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDescription("");
    const lastCurrency = localStorage.getItem("last_used_currency") || "EUR";
    setFormCurrency(lastCurrency);
    setShowReceiptModal(true);
  };

  const handleEditReceipt = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setFormAmount(receipt.totalAmount);
    setFormCurrency(receipt.currencyCode);
    const dateToUse = receipt.receiptDate || receipt.date;
    setFormDate(dateToUse.split('T')[0]);
    setShowReceiptModal(true);
  };

  const createReceiptMutation = useMutation<Receipt, unknown, { merchantId: number; date: string; amount: string; currency: string }>({
    mutationFn: (payload) => createReceipt(payload.merchantId, payload.date, payload.amount, payload.currency),
    onSuccess: () => invalidate.invalidateMerchantReceipts(selectedMerchant?.id),
  });

  const updateReceiptMutation = useMutation<Receipt, unknown, { id: number; date: string; amount: string; currency: string }>({
    mutationFn: (payload) => updateReceipt(payload.id, payload.date, payload.amount, payload.currency),
    onSuccess: () => invalidate.invalidateMerchantReceipts(selectedMerchant?.id),
  });

  const deleteReceiptMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteReceipt(id),
    onSuccess: () => invalidate.invalidateMerchantReceipts(selectedMerchant?.id),
  });

  const handleSaveReceipt = () => {
    if (!selectedMerchant) return;
    setIsSavingReceipt(true);
    if (editingReceipt) {
      updateReceiptMutation.mutate({ id: editingReceipt.id, date: formDate, amount: formAmount, currency: formCurrency }, { onSettled: () => setIsSavingReceipt(false) });
    } else {
      createReceiptMutation.mutate({ merchantId: selectedMerchant.id, date: formDate, amount: formAmount, currency: formCurrency }, { onSettled: () => { setIsSavingReceipt(false); localStorage.setItem("last_used_currency", formCurrency); } });
    }
    setShowReceiptModal(false);
  };

  const handleDeleteReceipt = (id: number) => {
    deleteReceiptMutation.mutate(id);
  };

  return {
    merchants,
    loading,
    error,
    selectedMerchant,
    setSelectedMerchant,
    showMerchantModal,
    setShowMerchantModal,
    editingMerchant,
    isSavingMerchant,
    handleCreateMerchant,
    handleEditMerchant,
    handleSaveMerchant,
    handleDeleteMerchant,
    showReceiptModal,
    setShowReceiptModal,
    editingReceipt,
    isSavingReceipt,
    handleCreateReceipt,
    handleEditReceipt,
    handleSaveReceipt,
    handleDeleteReceipt,
    receipts,
    loadingDetails,
    availableCurrencies,
    formName,
    setFormName,
    formAmount,
    setFormAmount,
    formCurrency,
    setFormCurrency,
    formDate,
    setFormDate,
    formDescription,
    setFormDescription,
  };
}

export default useMerchantsEditor;

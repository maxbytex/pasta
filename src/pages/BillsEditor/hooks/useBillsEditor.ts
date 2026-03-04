import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useInfiniteBills, useInvalidateQueries, useBillCategories } from "../../../hooks/useFinanceData";
import { saveBill, updateBill, deleteBill } from "../../../services/api/bills";
import type { Bill } from "../../../interfaces/bill-interface";
import { getDefaultCurrencyCode } from "../../../constants/currency-constants";

interface BillInput {
  date: string;
  category: string;
  totalAmount: string;
  currencyCode: string;
  senderEmail?: string;
}

export function useBillsEditor() {
  const { 
    data: billsData, 
    isLoading: loading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = useInfiniteBills();
  
  const bills = billsData?.pages.flatMap(page => page.results) || [] as Bill[];
  const { data: categories = [] } = useBillCategories();
  const invalidate = useInvalidateQueries();

  const saveMutation = useMutation<Bill, unknown, BillInput>({
    mutationFn: (data) => saveBill(data),
    onSuccess: () => invalidate.invalidateBills(),
  });

  const updateMutation = useMutation<Bill, unknown, { id: number; data: BillInput }>({
    mutationFn: (payload) => updateBill(payload.id, payload.data),
    onSuccess: () => invalidate.invalidateBills(),
  });

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteBill(id),
    onSuccess: () => invalidate.invalidateBills(),
  });

  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingBillIds, setDeletingBillIds] = useState<Set<number>>(new Set());
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState(getDefaultCurrencyCode());
  const [formSenderEmail, setFormSenderEmail] = useState("");

  const handleCreate = () => {
    setEditingBill(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormCategory(categories.length > 0 ? categories[0].name : "");
    setFormAmount("");
    setFormCurrency(getDefaultCurrencyCode());
    setFormSenderEmail("");
    setShowModal(true);
  };

  const handleEdit = (bill: Bill) => {
    setEditingBill(bill);
    setFormDate(bill.date.split('T')[0]);
    setFormCategory(bill.category);
    setFormAmount(bill.totalAmount);
    setFormCurrency(bill.currencyCode);
    setFormSenderEmail(bill.senderEmail || "");
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
  };

  const confirmDelete = () => {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;
    setDeletingBillIds((prev) => new Set(prev).add(id));
    deleteMutation.mutate(id, {
      onSettled: () => {
        setPendingDeleteId(null);
        setDeletingBillIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const cancelDelete = () => setPendingDeleteId(null);

  const handleSave = async () => {
    if (!formDate || !formCategory || !formAmount || !formCurrency) return;
    setIsSaving(true);
    
    const data = {
      date: formDate,
      category: formCategory,
      totalAmount: formAmount,
      currencyCode: formCurrency,
      senderEmail: formSenderEmail || undefined,
    };

    if (editingBill) {
      updateMutation.mutate({ id: editingBill.id, data }, {
        onSuccess: () => setShowModal(false),
        onSettled: () => setIsSaving(false),
      });
    } else {
      saveMutation.mutate(data, {
        onSuccess: () => setShowModal(false),
        onSettled: () => setIsSaving(false),
      });
    }
  };

  return {
    bills,
    categories,
    loading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    showModal,
    setShowModal,
    editingBill,
    isSaving,
    deletingBillIds,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    pendingDeleteId,
    confirmDelete,
    cancelDelete,
    formDate,
    setFormDate,
    formCategory,
    setFormCategory,
    formAmount,
    setFormAmount,
    formCurrency,
    setFormCurrency,
    formSenderEmail,
    setFormSenderEmail,
  };
}

export default useBillsEditor;

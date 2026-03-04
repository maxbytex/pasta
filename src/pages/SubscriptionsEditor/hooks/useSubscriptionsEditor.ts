import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSubscriptions, useInvalidateQueries } from "../../../hooks/useFinanceData";
import { createSubscription, updateSubscription, deleteSubscription } from "../../../services/api/subscriptions";
import type { Subscription } from "../../../interfaces/subscription-interface";
import { getDefaultCurrencyCode } from "../../../constants/currency-constants";

interface SubscriptionInput {
  name: string;
  category: string;
  recurrence: string;
  amount: string;
  currencyCode: string;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  plan?: string | null;
}

export function useSubscriptionsEditor() {
  const { data: subscriptionsData = [], isLoading: loading, error } = useSubscriptions();
  const subscriptions = (subscriptionsData || []) as Subscription[];
  const invalidate = useInvalidateQueries();

  const createMutation = useMutation<Subscription, unknown, SubscriptionInput>({
    mutationFn: (data) => createSubscription(data),
    onSuccess: () => invalidate.invalidateSubscriptions(),
  });

  const updateMutation = useMutation<Subscription, unknown, { id: number; data: SubscriptionInput }>({
    mutationFn: (payload) => updateSubscription(payload.id, payload.data),
    onSuccess: () => invalidate.invalidateSubscriptions(),
  });

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteSubscription(id),
    onSuccess: () => invalidate.invalidateSubscriptions(),
  });

  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingSubscriptionIds, setDeletingSubscriptionIds] = useState<Set<number>>(new Set());
  const [pendingDeleteSubscriptionId, setPendingDeleteSubscriptionId] = useState<number | null>(null);

  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("");
  const [formRecurrence, setFormRecurrence] = useState("monthly");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState(getDefaultCurrencyCode());
  const [formEffectiveFrom, setFormEffectiveFrom] = useState(new Date().toISOString().split('T')[0]);
  const [formEffectiveUntil, setFormEffectiveUntil] = useState<string>("");
  const [formPlan, setFormPlan] = useState("");

  const [availableCurrencies] = useState<string[]>(["USD", "EUR", "GBP"]);

  const handleCreate = () => {
    setEditingSubscription(null);
    setFormName("");
    setFormCategory("");
    setFormRecurrence("monthly");
    setFormAmount("");
    setFormCurrency(getDefaultCurrencyCode());    setFormEffectiveFrom(new Date().toISOString().split('T')[0]);
    setFormEffectiveUntil("");
    setFormPlan("");
    setShowModal(true);
  };

  const handleEdit = (sub: Subscription) => {
    setEditingSubscription(sub);
    setFormName(sub.name);
    setFormCategory(sub.category);
    setFormRecurrence(sub.recurrence);
    setFormAmount(sub.amount);
    setFormCurrency(sub.currencyCode);
    setFormEffectiveFrom(sub.effectiveFrom.split('T')[0]);
    setFormEffectiveUntil(sub.effectiveUntil?.split('T')[0] || "");
    setFormPlan(sub.plan || "");
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    setPendingDeleteSubscriptionId(id);
  };

  const confirmDeleteSubscription = () => {
    if (pendingDeleteSubscriptionId === null) return;
    const id = pendingDeleteSubscriptionId;
    setDeletingSubscriptionIds((prev) => new Set(prev).add(id));
    deleteMutation.mutate(id, {
      onSettled: () => {
        setPendingDeleteSubscriptionId(null);
        setDeletingSubscriptionIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      },
    });
  };

  const cancelDeleteSubscription = () => setPendingDeleteSubscriptionId(null);

  const handleSave = async () => {
    if (!formName || !formCategory || !formAmount || !formCurrency || !formEffectiveFrom) return;
    setIsSaving(true);
    
    const data = {
      name: formName,
      category: formCategory,
      recurrence: formRecurrence,
      amount: formAmount,
      currencyCode: formCurrency,
      effectiveFrom: formEffectiveFrom,
      effectiveUntil: formEffectiveUntil || null,
      plan: formPlan || null,
    };

    if (editingSubscription) {
      updateMutation.mutate({ id: editingSubscription.id, data }, {
        onSuccess: () => setShowModal(false),
        onSettled: () => setIsSaving(false),
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => setShowModal(false),
        onSettled: () => setIsSaving(false),
      });
    }
  };

  return {
    subscriptions,
    loading,
    error,
    showModal,
    setShowModal,
    editingSubscription,
    isSaving,
    deletingSubscriptionIds,
    handleCreate,
    handleEdit,
    handleDelete,
    handleSave,
    pendingDeleteSubscriptionId,
    confirmDeleteSubscription,
    cancelDeleteSubscription,
    formName,
    setFormName,
    formCategory,
    setFormCategory,
    formRecurrence,
    setFormRecurrence,
    formAmount,
    setFormAmount,
    formCurrency,
    setFormCurrency,
    formEffectiveFrom,
    setFormEffectiveFrom,
    formEffectiveUntil,
    setFormEffectiveUntil,
    formPlan,
    setFormPlan,
    availableCurrencies,
  };
}

export default useSubscriptionsEditor;

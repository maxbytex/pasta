import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useMerchants, useInvalidateQueries } from "../../hooks/useFinanceData";
import { createMerchant, updateMerchant, deleteMerchant } from "../../services/api/merchants";
import { TextInputModal } from "../../components/common/TextInputModal";
import MerchantsList from "./MerchantsList";
import MerchantDetail from "./MerchantDetail";
import ReceiptDetailEditor from "./ReceiptDetailEditor";
import type { Merchant } from "../../interfaces/merchant-interface";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export const MerchantsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { data: merchantsData = [], isLoading: loading, error } = useMerchants();
  const merchants = (merchantsData || []) as Merchant[];
  const invalidate = useInvalidateQueries();

  const createMerchantMutation = useMutation<Merchant, unknown, string>({
    mutationFn: (name: string) => createMerchant(name),
    onSuccess: () => {
      invalidate.invalidateMerchants();
    },
  });

  const updateMerchantMutation = useMutation<Merchant, unknown, { id: number; name: string }>({
    mutationFn: (payload) => updateMerchant(payload.id, payload.name),
    onSuccess: () => invalidate.invalidateMerchants(),
  });

  const deleteMerchantMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteMerchant(id),
    onSuccess: () => {
      invalidate.invalidateMerchants();
      navigate("/editors/merchants");
    },
  });

  const [showMerchantModal, setShowMerchantModal] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [isSavingMerchant, setIsSavingMerchant] = useState(false);
  const [formName, setFormName] = useState("");
  const [pendingDeleteMerchantId, setPendingDeleteMerchantId] = useState<number | null>(null);
  const [isDeletingMerchant, setIsDeletingMerchant] = useState(false);

  const handleCreate = () => {
    setEditingMerchant(null);
    setFormName("");
    setShowMerchantModal(true);
  };

  const handleEdit = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setFormName(merchant.name);
    setShowMerchantModal(true);
  };

  const handleDelete = (id: number) => {
    setPendingDeleteMerchantId(id);
  };

  const confirmDeleteMerchant = () => {
    if (pendingDeleteMerchantId === null) return;
    const id = pendingDeleteMerchantId;
    setIsDeletingMerchant(true);
    deleteMerchantMutation.mutate(id, {
      onSettled: () => {
        setIsDeletingMerchant(false);
        setPendingDeleteMerchantId(null);
      },
    });
  };

  const handleSaveMerchant = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSavingMerchant(true);
    if (editingMerchant) {
      updateMerchantMutation.mutate(
        { id: editingMerchant.id, name: trimmedName },
        {
          onSuccess: () => setShowMerchantModal(false),
          onSettled: () => setIsSavingMerchant(false),
        },
      );
    } else {
      createMerchantMutation.mutate(trimmedName, {
        onSuccess: () => setShowMerchantModal(false),
        onSettled: () => setIsSavingMerchant(false),
      });
    }
  };

  return (
    <>
      <Routes>
        <Route
          index
          element={
            <MerchantsList
              merchants={merchants}
              loading={loading}
              error={error ? (error instanceof Error ? error.message : String(error)) : null}
              onCreate={handleCreate}
              onSelect={(m) => navigate(`${m.id}`)}
            />
          }
        />
        <Route
          path=":merchantId"
          element={
            <MerchantDetail
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBack={() => navigate("/editors/merchants")}
            />
          }
        />
        <Route
          path=":merchantId/receipt/:receiptId"
          element={<ReceiptDetailEditor />}
        />
      </Routes>

      {showMerchantModal && (
        <TextInputModal
          isOpen={showMerchantModal}
          onClose={() => setShowMerchantModal(false)}
          onSave={handleSaveMerchant}
          title={editingMerchant ? "Rename Merchant" : "Create Merchant"}
          label="Merchant Name"
          placeholder="e.g., Amazon, Starbucks"
          defaultValue={formName}
          isSaving={isSavingMerchant}
        />
      )}
      <DeleteConfirmModal
        open={pendingDeleteMerchantId !== null}
        isDeleting={isDeletingMerchant}
        onConfirm={confirmDeleteMerchant}
        onCancel={() => setPendingDeleteMerchantId(null)}
      />
    </>
  );
};

export default MerchantsEditor;

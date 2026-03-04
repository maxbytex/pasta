import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { BankAccountsList } from "./BankAccountsList";
import { BankAccountDetail } from "./BankAccountDetail";
import { createBankAccount, updateBankAccount, deleteBankAccount } from "../../services/api/accounts";
import { useBankAccounts, useInvalidateQueries } from "../../hooks/useFinanceData";
import { useMutation } from "@tanstack/react-query";
import { formatDecimalAsPercentageForInput, convertPercentageStringToDecimal } from "../../utils/percentage-utils";

import type { BankAccount } from "../../interfaces/bank-account-interface";

import type { BankAccountInputModalProps as InputModalProps } from "../../interfaces/pages/bank-account-input-modal-props-interface";

const InputModal: React.FC<InputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  label,
  placeholder,
  defaultValue = "",
  defaultType = "checking",
  defaultTaxPercentage = "",
  isSaving = false,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [typeValue, setTypeValue] = useState(defaultType || "checking");
  const [taxValue, setTaxValue] = useState(defaultTaxPercentage);
  const canSave = value.trim().length > 0 && typeValue.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h4 className="text-xl font-bold mb-6">{title}</h4>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              {label}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              disabled={isSaving}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave && !isSaving) onSave(value, typeValue, taxValue);
              }}
            />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Account Type
            </label>
            <select
              value={typeValue}
              onChange={(e) => setTypeValue(e.target.value)}
              disabled={isSaving}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit_card">Credit Card</option>
              <option value="investment">Investment</option>
              <option value="loan">Loan</option>
              <option value="deposit">Deposit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              TAX (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={taxValue}
              onChange={(e) => setTaxValue(e.target.value)}
              placeholder="19"
              disabled={isSaving}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave && !isSaving) onSave(value, typeValue, taxValue);
              }}
            />
          </div>
        <div className="flex gap-3 justify-end mt-8">
          {!isSaving && (
            <button
              onClick={onClose}
              className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
           <button
             onClick={() => onSave(value, typeValue, taxValue)}
             disabled={isSaving || !canSave}
              className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
           >
             {isSaving ? "Savings..." : "Save"}
           </button>
        </div>
      </div>
    </div>
  );
};

// Main container component that handles state and routing
export const BankAccountsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { data: accounts = [], isLoading: loading, error } = useBankAccounts();
  // detailReloadKey removed — React Query invalidation replaces manual reloads
  const invalidate = useInvalidateQueries();

  const createAccountMutation = useMutation<BankAccount, unknown, { name: string; type: string; taxPercentage?: number | null }>({
    mutationFn: (payload) => createBankAccount(payload.name, payload.type, payload.taxPercentage),
    onSuccess: () => invalidate.invalidateBankAccounts(),
  });

  const updateAccountMutation = useMutation<BankAccount, unknown, { id: number; name: string; type: string; taxPercentage?: number | null }>({
    mutationFn: (payload) => updateBankAccount(payload.id, payload.name, payload.type, payload.taxPercentage ?? null),
    onSuccess: () => invalidate.invalidateBankAccounts(),
  });

  const deleteAccountMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteBankAccount(id),
    onSuccess: () => invalidate.invalidateBankAccounts(),
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isSavingAccount, setIsSavingAccount] = useState(false);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("checking");
  const [formTaxPercentage, setFormTaxPercentage] = useState("");

  // bank accounts loaded via useBankAccounts

  const handleCreate = () => {
    setEditingAccount(null);
    setFormName("");
    setFormType("checking");
    setFormTaxPercentage("");
    setShowAccountModal(true);
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormName(account.name);
    setFormType(account.type || "checking");
    setFormTaxPercentage(formatDecimalAsPercentageForInput(account.taxPercentage));
    setShowAccountModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this bank account and all its data?")) return;
    deleteAccountMutation.mutate(id, {
      onSuccess: () => navigate("/editors/banks"),
    });
  };

  const handleBack = () => {
    navigate("/editors/banks");
  };

  const handleSaveAccount = async (name?: string, type?: string, taxPercentage?: string) => {
    // name, type, and tax percentage are provided by the InputModal when saving via the UI
    const finalName = name ?? formName;
    const finalType = type ?? formType;
    const finalTaxPercentage =
      taxPercentage ?? formTaxPercentage;
    const taxValue = convertPercentageStringToDecimal(finalTaxPercentage || "");
    setIsSavingAccount(true);
    if (editingAccount) {
      updateAccountMutation.mutate({ id: editingAccount.id, name: finalName, type: finalType, taxPercentage: taxValue ?? null }, { onSettled: () => setIsSavingAccount(false) });
    } else {
      createAccountMutation.mutate({ name: finalName, type: finalType, taxPercentage: taxValue ?? null }, { onSettled: () => setIsSavingAccount(false) });
    }
    setShowAccountModal(false);
  };

  const isSavingAccountsList = createAccountMutation.isPending || updateAccountMutation.isPending || deleteAccountMutation.isPending;

  return (
    <>
      <Routes>
        <Route index element={<BankAccountsList accounts={accounts} loading={loading} error={error ? (error instanceof Error ? error.message : String(error)) : null} onCreate={handleCreate} isSavingList={isSavingAccountsList} />} />
        <Route
          path=":accountId/:tab"
          element={
            <BankAccountDetail
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBack={handleBack}
              // reloadKey removed - React Query invalidation used instead
            />
          }
        />
      </Routes>

      {showAccountModal && (
        <InputModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onSave={handleSaveAccount}
          title={editingAccount ? "Rename Bank Account" : "Create Bank Account"}
          label="Account Name"
          placeholder="e.g., Checking Account"
          defaultValue={formName}
          defaultType={formType}
          defaultTaxPercentage={formTaxPercentage}
          isSaving={isSavingAccount}
        />
      )}
    </>
  );
};

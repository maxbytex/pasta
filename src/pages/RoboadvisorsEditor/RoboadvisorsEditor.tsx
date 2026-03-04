import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { RoboadvisorsList } from "./RoboadvisorsList";
import { RoboadvisorDetail } from "./RoboadvisorDetail";
import { createRoboadvisor, updateRoboadvisor, deleteRoboadvisor } from "../../services/api/roboadvisor";
import { formatDecimalAsPercentageForInput, convertPercentageStringToDecimal } from "../../utils/percentage-utils";
import type { BankAccount } from "../../interfaces/bank-account-interface";
import type { RoboadvisorInterface } from "../../interfaces/roboadvisor-interface";
import { useRoboadvisors, useBankAccounts, useInvalidateQueries } from "../../hooks/useFinanceData";
import { useMutation } from "@tanstack/react-query";

 type RoboadvisorPayload = Parameters<typeof createRoboadvisor>[0];


// Main container component that handles state and routing
export const RoboadvisorsEditor: React.FC = () => {
  const navigate = useNavigate();
  const { data: roboadvisors = [], isLoading: loading, error: roboError } = useRoboadvisors();
  const { data: bankAccounts = [] } = useBankAccounts();
  const invalidate = useInvalidateQueries();

  // Modal states for roboadvisor
  const [showRoboadvisorModal, setShowRoboadvisorModal] = useState(false);
  const [editingRoboadvisor, setEditingRoboadvisor] = useState<RoboadvisorInterface | null>(null);
  const [isSavingRoboadvisor, setIsSavingRoboadvisor] = useState(false);
  // detailReloadKey removed — React Query invalidation replaces manual reloads

  // Form states for roboadvisor
  const [formName, setFormName] = useState("");
  const [formBankAccountId, setFormBankAccountId] = useState<number | null>(null);
  const [formRiskLevel, setFormRiskLevel] = useState<number | null>(null);
  const [formManagementFee, setFormManagementFee] = useState("");
  const [formCustodyFee, setFormCustodyFee] = useState("");
  const [formTerFee, setFormTerFee] = useState("");
  const [formTotalFee, setFormTotalFee] = useState("");
  const [formManagementFreq, setFormManagementFreq] = useState<string>("monthly");
  const [formCustodyFreq, setFormCustodyFreq] = useState<string>("monthly");
  const [formTerPricedInNav, setFormTerPricedInNav] = useState<boolean>(false);
  const [formTax, setFormTax] = useState("");

  // data comes from React Query hooks (useRoboadvisors, useBankAccounts)

  const handleCreate = () => {
    setEditingRoboadvisor(null);
    setFormName("");
    setFormBankAccountId(null);
    setFormRiskLevel(4);
    setFormManagementFee("");
    setFormCustodyFee("");
    setFormTerFee("");
    setFormTotalFee("");
    setFormManagementFreq("monthly");
    setFormCustodyFreq("monthly");
    setFormTerPricedInNav(false);
    setFormTax("");
    setShowRoboadvisorModal(true);
  };

  const handleEdit = (roboadvisor: RoboadvisorInterface) => {
    setEditingRoboadvisor(roboadvisor);
    setFormName(roboadvisor.name);
    setFormBankAccountId(roboadvisor.bankAccountId);
    setFormRiskLevel(roboadvisor.riskLevel || 4);
    // Convert decimal values to percentages for display
    setFormManagementFee(formatDecimalAsPercentageForInput(roboadvisor.managementFeePercentage));
    setFormCustodyFee(formatDecimalAsPercentageForInput(roboadvisor.custodyFeePercentage));
    setFormTerFee(formatDecimalAsPercentageForInput(roboadvisor.fundTerPercentage));
    setFormTotalFee(formatDecimalAsPercentageForInput(roboadvisor.totalFeePercentage));
    setFormManagementFreq(roboadvisor.managementFeeFrequency);
    setFormCustodyFreq(roboadvisor.custodyFeeFrequency);
    setFormTerPricedInNav(roboadvisor.terPricedInNav);
    setFormTax(formatDecimalAsPercentageForInput(roboadvisor.taxPercentage));
    setShowRoboadvisorModal(true);
  };

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteRoboadvisor(id),
    onSuccess: () => {
      invalidate.invalidateRoboadvisors();
      navigate("/editors/roboadvisors");
    },
  });

  const handleDelete = (id: number) => {
    if (!confirm("Delete this roboadvisor and all its data?")) return;
    deleteMutation.mutate(id);
  };

  const createMutation = useMutation<RoboadvisorInterface, unknown, RoboadvisorPayload>({
    mutationFn: (payload: RoboadvisorPayload) => createRoboadvisor(payload),
    onSuccess: () => invalidate.invalidateRoboadvisors(),
  });

  const updateMutation = useMutation<RoboadvisorInterface, unknown, { id: number; data: RoboadvisorPayload }>({
    mutationFn: (payload) => updateRoboadvisor(payload.id, payload.data),
    onSuccess: () => invalidate.invalidateRoboadvisors(),
  });

  const isSavingRoboadvisorsList = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleBack = () => {
    navigate("/editors/roboadvisors");
  };

  const handleSaveRoboadvisor = async () => {
    setIsSavingRoboadvisor(true);
    try {
      // Convert percentage values to decimals for API
      const decimalManagementFee = convertPercentageStringToDecimal(formManagementFee);
      const decimalCustodyFee = convertPercentageStringToDecimal(formCustodyFee);
      const decimalTerFee = convertPercentageStringToDecimal(formTerFee);
      const decimalTotalFee = convertPercentageStringToDecimal(formTotalFee);
      const decimalTax = convertPercentageStringToDecimal(formTax);

      const data: RoboadvisorPayload = {
        name: formName,
        bankAccountId: formBankAccountId as number,
        managementFeePercentage: decimalManagementFee ?? 0,
        custodyFeePercentage: decimalCustodyFee ?? 0,
        fundTerPercentage: decimalTerFee ?? 0,
        totalFeePercentage: decimalTotalFee ?? 0,
        managementFeeFrequency: formManagementFreq as RoboadvisorPayload["managementFeeFrequency"],
        custodyFeeFrequency: formCustodyFreq as RoboadvisorPayload["custodyFeeFrequency"],
        terPricedInNav: formTerPricedInNav,
      };
      data.taxPercentage = decimalTax ?? undefined;
      if (formRiskLevel !== null) data.riskLevel = formRiskLevel;

    try {
      if (editingRoboadvisor) {
        updateMutation.mutate({ id: editingRoboadvisor.id, data }, { onSettled: () => setIsSavingRoboadvisor(false) });
      } else {
        createMutation.mutate(data, { onSettled: () => setIsSavingRoboadvisor(false) });
      }
      setShowRoboadvisorModal(false);
      return;
    } catch (err) {
      console.error(err);
    }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingRoboadvisor(false);
    }
  };

  return (
    <>
      <Routes>
        <Route
          index
          element={<RoboadvisorsList roboadvisors={roboadvisors} bankAccounts={bankAccounts} loading={loading} error={roboError ? (roboError instanceof Error ? roboError.message : String(roboError)) : null} onCreate={handleCreate} isSavingList={isSavingRoboadvisorsList} />}
        />
        <Route
          path=":roboadvisorId/:tab"
          element={
        <RoboadvisorDetail
              onEdit={handleEdit}
              onDelete={handleDelete}
              onBack={handleBack}
            />
          }
        />
      </Routes>

      {/* Roboadvisor Modal */}
      {showRoboadvisorModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 mb-36 md:mb-0 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[75vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-6">
              {editingRoboadvisor ? "Edit" : "Add"} Roboadvisor
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  disabled={isSavingRoboadvisor}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={formBankAccountId ?? ""}
                  onChange={(e) =>
                    setFormBankAccountId(e.target.value ? Number(e.target.value) : null)
                  }
                  disabled={isSavingRoboadvisor || bankAccounts.length === 0}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl"
                >
                  <option value="">
                    {bankAccounts.length === 0 ? "Loading..." : "Select bank account"}
                  </option>
                  {bankAccounts.map((account: BankAccount) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Risk Level (1-7)
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={formRiskLevel ?? 4}
                  onChange={(e) => setFormRiskLevel(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Fee Structure
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Management Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formManagementFee}
                      onChange={(e) => setFormManagementFee(e.target.value)}
                      placeholder="1"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                    <select
                      value={formManagementFreq}
                      onChange={(e) => setFormManagementFreq(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Custody Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formCustodyFee}
                      onChange={(e) => setFormCustodyFee(e.target.value)}
                      placeholder="1"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Frequency</label>
                    <select
                      value={formCustodyFreq}
                      onChange={(e) => setFormCustodyFreq(e.target.value)}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Fund TER (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formTerFee}
                      onChange={(e) => setFormTerFee(e.target.value)}
                      placeholder="1"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="terPricedInNav"
                      checked={formTerPricedInNav}
                      onChange={(e) => setFormTerPricedInNav(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="terPricedInNav" className="text-xs text-gray-500">
                      TER priced in NAV
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Total Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formTotalFee}
                      onChange={(e) => setFormTotalFee(e.target.value)}
                      placeholder="1"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">
                      Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={formTax}
                      onChange={(e) => setFormTax(e.target.value)}
                      placeholder="19"
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setShowRoboadvisorModal(false)}
                  className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRoboadvisor}
                  disabled={isSavingRoboadvisor}
                  className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none"
                >
                  {isSavingRoboadvisor ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

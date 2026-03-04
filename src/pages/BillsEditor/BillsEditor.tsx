import React, { useState } from "react";
import { Tag, History } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import useBillsEditor from "./hooks/useBillsEditor";
import BillsHistoryTab from "./BillsHistoryTab";
import BillCategoriesTab from "./BillCategoriesTab";
import { clsx } from "clsx";
import type { BillCategory } from "../../interfaces/bill-category-interface";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";
import { CurrencySelect } from "../../components/common/CurrencySelect";

export const BillsEditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"history" | "categories">("history");
  const {
    bills,
    categories,
    loading,
    error,
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
  } = useBillsEditor();

  const calculateMonthlyTotal = () => {
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return bills
      .filter(b => b.date.substring(0, 7) === curMonth)
      .reduce((total, b) => total + parseFloat(b.totalAmount), 0);
  };

  const monthlyTotal = calculateMonthlyTotal();
  const currencyCode = bills.length > 0 ? bills[0].currencyCode : "EUR";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Bills</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {bills.length} bills recorded
        </p>
      </div>

      {error && <ErrorBanner message={error instanceof Error ? error.message : String(error)} />}

      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          {loading ? (
            <Skeleton className="w-[calc(50%-0.5rem)] sm:w-32 h-[52px] rounded-lg" />
          ) : (
            <div className="w-[calc(50%-0.5rem)] sm:w-32 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246))" }}>
              <span className="text-[10px] font-medium text-white uppercase">Current Month</span>
              <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(monthlyTotal, currencyCode)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("history")}
          className={clsx(
            "pb-3 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-2",
            activeTab === "history"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 dark:text-gray-400"
          )}
        >
          <History size={16} /> History
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={clsx(
            "pb-3 px-4 text-sm font-medium transition-colors border-b-2 cursor-pointer flex items-center gap-2",
            activeTab === "categories"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-gray-500 dark:text-gray-400"
          )}
        >
          <Tag size={16} /> Categories
        </button>
      </div>

      <div className="flex-1">
        {activeTab === "history" ? (
          <BillsHistoryTab
            bills={bills}
            categories={categories}
            loading={loading}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            deletingIds={deletingBillIds}
          />
        ) : (
          <BillCategoriesTab />
        )}
      </div>

      {/* Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-6">{editingBill ? "Edit" : "Add"} Bill</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category <span className="text-red-500">*</span></label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((cat: BillCategory) => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency <span className="text-red-500">*</span></label>
                  <CurrencySelect
                    value={formCurrency}
                    onChange={setFormCurrency}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sender Email</label>
                <input
                  type="email"
                  value={formSenderEmail}
                  onChange={(e) => setFormSenderEmail(e.target.value)}
                  placeholder="e.g., info@company.com"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end mt-8">
                <button onClick={() => setShowModal(false)} className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !formDate || !formCategory || !formAmount || !formCurrency}
                  className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmModal
        open={pendingDeleteId !== null}
        isDeleting={deletingBillIds.size > 0}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default BillsEditor;

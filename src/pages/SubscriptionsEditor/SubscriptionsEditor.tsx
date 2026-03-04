import React from "react";
import { Edit2, Plus, Trash2, RefreshCw } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { Skeleton } from "../../components/Skeleton";
import { GradientHistoryCard } from "../../components/common/GradientHistoryCard";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import useSubscriptionsEditor from "./hooks/useSubscriptionsEditor";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";
import { CurrencySelect } from "../../components/common/CurrencySelect";

export const SubscriptionsEditor: React.FC = () => {
  const {
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
  } = useSubscriptionsEditor();

  const calculateMonthlyTotal = () => {
    return subscriptions.reduce((total, sub) => {
      const amount = parseFloat(sub.amount);
      switch (sub.recurrence) {
        case "weekly":
          return total + amount * 4.33;
        case "bi-weekly":
          return total + amount * 2.17;
        case "yearly":
          return total + amount / 12;
        case "monthly":
        default:
          return total + amount;
      }
    }, 0);
  };

  const monthlyTotal = calculateMonthlyTotal();
  const currencyCode = subscriptions.length > 0 ? subscriptions[0].currencyCode : "EUR";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subscriptions.length} active subscriptions
          </p>
        </div>

        <div className="flex items-center">
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error instanceof Error ? error.message : String(error)} />}

      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          {loading ? (
            <Skeleton className="w-[calc(50%-0.5rem)] sm:w-32 h-[52px] rounded-lg" />
          ) : (
            <div className="w-[calc(50%-0.5rem)] sm:w-32 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(52, 211, 153), rgb(16, 185, 129))" }}>
              <span className="text-[10px] font-medium text-white uppercase">Monthly Total</span>
              <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(monthlyTotal, currencyCode)}</span>
            </div>
          )}
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Subscription List</h4>

      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-5">
              <RefreshCw size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No subscriptions yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Add your first subscription to start tracking recurring expenses.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <GradientHistoryCard
                key={sub.id}
                borderClassName="border-emerald-500 dark:border-emerald-400"
                gradient="linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"
                actions={
                  <>
                    <button
                      onClick={() => handleEdit(sub)}
                      disabled={deletingSubscriptionIds.has(sub.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      disabled={deletingSubscriptionIds.has(sub.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {sub.name} {sub.plan && <span className="font-normal text-gray-500 text-xs">({sub.plan})</span>}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {sub.category} • {sub.recurrence}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-gray-900 dark:text-white">
                      {formatCurrencyWithAlignment(parseFloat(sub.amount), sub.currencyCode)}
                    </span>
                  </div>
                </div>
              </GradientHistoryCard>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-6">
              {editingSubscription ? "Edit" : "Add"} Subscription
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., Netflix"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Category <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="e.g., Entertainment"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Recurrence <span className="text-red-500">*</span></label>
                  <select
                    value={formRecurrence}
                    onChange={(e) => setFormRecurrence(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Plan</label>
                  <input
                    type="text"
                    value={formPlan}
                    onChange={(e) => setFormPlan(e.target.value)}
                    placeholder="e.g., Premium"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Effective From <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    value={formEffectiveFrom}
                    onChange={(e) => setFormEffectiveFrom(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Effective Until</label>
                  <input
                    type="date"
                    value={formEffectiveUntil}
                    onChange={(e) => setFormEffectiveUntil(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end mt-8">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                  className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !formName || !formCategory || !formAmount || !formCurrency || !formEffectiveFrom} 
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmModal
        open={pendingDeleteSubscriptionId !== null}
        isDeleting={deletingSubscriptionIds.size > 0}
        onConfirm={confirmDeleteSubscription}
        onCancel={cancelDeleteSubscription}
      />
    </div>
  );
};

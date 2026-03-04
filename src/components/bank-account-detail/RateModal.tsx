import React from "react";
import type { RateModalProps } from "../../interfaces/bank-account-detail/rate-modal-props-interface";

export const RateModal: React.FC<RateModalProps> = ({
  show,
  editingRate,
  formRateValue,
  setFormRateValue,
  formRateStartDate,
  setFormRateStartDate,
  formRateEndDate,
  setFormRateEndDate,
  formRateError,
  isSavingRate,
  onClose,
  onSave,
}) => {
  if (!show) return null;

  const canSave = formRateValue.trim().length > 0 && formRateStartDate.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl">
        <h4 className="text-xl font-bold mb-6">{editingRate ? "Edit" : "Add"} Interest Rate</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Rate (%)</label>
            <input
              type="number"
              step="1"
              min="0"
              max="100"
              value={formRateValue}
              onChange={(e) => setFormRateValue(e.target.value)}
              disabled={isSavingRate}
              placeholder="1"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            {formRateError && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{formRateError}</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={formRateStartDate}
              onChange={(e) => setFormRateStartDate(e.target.value)}
              disabled={isSavingRate}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">End Date (Optional)</label>
            <input
              type="date"
              value={formRateEndDate}
              onChange={(e) => setFormRateEndDate(e.target.value)}
              disabled={isSavingRate}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3 justify-end mt-8">
            {!isSavingRate && (
              <button
                onClick={onClose}
                className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              onClick={onSave}
              disabled={isSavingRate || !canSave}
              className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
            >
              {isSavingRate ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import type { CashBalance } from "../../../interfaces/cash-balance-interface";

export const BalanceModal: React.FC<{
  show: boolean;
  onClose: () => void;
  isSaving: boolean;
  editing?: CashBalance | null;
  amount: string;
  onAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  onSave: () => void;
  availableCurrencies: string[];
}> = ({ show, onClose, isSaving, editing, amount, onAmountChange, currency, onCurrencyChange, onSave, availableCurrencies }) => {
  if (!show) return null;

  const canSave = amount.trim().length > 0 && currency.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h4 className="text-xl font-bold mb-6">{editing ? "Edit" : "Add"} Balance</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount <span className="text-red-500">*</span></label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              disabled={isSaving}
              placeholder="0.00"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency <span className="text-red-500">*</span></label>
            <input
              type="text"
              list="cash-currencies"
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value.toUpperCase())}
              disabled={isSaving}
              placeholder="EUR"
              maxLength={3}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <datalist id="cash-currencies">
              {availableCurrencies.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="flex gap-3 justify-end mt-8">
            {!isSaving && (
              <button onClick={onClose} className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">Cancel</button>
            )}
            <button
              onClick={onSave}
              disabled={isSaving || !canSave}
              className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
            >
              {isSaving ? "Savings..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;

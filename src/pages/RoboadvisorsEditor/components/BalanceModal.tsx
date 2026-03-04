import React from "react";
import { CurrencySelect } from "../../../components/common/CurrencySelect";

export const BalanceModal: React.FC<{
  show: boolean;
  onClose: () => void;
  isSaving: boolean;
  editing?: { id: number } | null;
  date: string;
  onDateChange: (v: string) => void;
  type: "deposit" | "withdrawal" | "adjustment";
  onTypeChange: (v: "deposit" | "withdrawal" | "adjustment") => void;
  amount: string;
  onAmountChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  onSave: () => Promise<void> | void;
}> = ({ show, onClose, isSaving, editing, date, onDateChange, type, onTypeChange, amount, onAmountChange, currency, onCurrencyChange, onSave }) => {
  if (!show) return null;

  const canSave = date.trim().length > 0 && amount.trim().length > 0 && currency.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl">
        <h4 className="text-xl font-bold mb-6">{editing ? "Edit" : "Add"} Balance Entry</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => onDateChange(e.target.value)} disabled={isSaving} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value as "deposit" | "withdrawal" | "adjustment")}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl"
            >
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount</label>
              <input type="text" value={amount} onChange={(e) => onAmountChange(e.target.value)} placeholder="1000.00" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
              <CurrencySelect
                value={currency}
                onChange={onCurrencyChange}
                disabled={isSaving}
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-8">
            <button onClick={onClose} className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">Cancel</button>
            <button onClick={onSave} disabled={isSaving || !canSave} className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer">{isSaving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceModal;

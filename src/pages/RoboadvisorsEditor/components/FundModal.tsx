import React from "react";
import { CurrencySelect } from "../../../components/common/CurrencySelect";

export const FundModal: React.FC<{
  show: boolean;
  onClose: () => void;
  isSaving: boolean;
  editing?: { id: number } | null;
  name: string;
  onNameChange: (v: string) => void;
  isin: string;
  onIsinChange: (v: string) => void;
  assetClass: string;
  onAssetClassChange: (v: string) => void;
  region: string;
  onRegionChange: (v: string) => void;
  currency: string;
  onCurrencyChange: (v: string) => void;
  weight: string;
  onWeightChange: (v: string) => void;
  shareCount?: number;
  onShareCountChange: (v: number | undefined) => void;
  onSave: () => Promise<void> | void;
}> = ({ show, onClose, isSaving, editing, name, onNameChange, isin, onIsinChange, assetClass, onAssetClassChange, region, onRegionChange, currency, onCurrencyChange, weight, onWeightChange, shareCount, onShareCountChange, onSave }) => {
  if (!show) return null;

  const canSave =
    name.trim().length > 0 &&
    isin.trim().length > 0 &&
    assetClass.trim().length > 0 &&
    region.trim().length > 0 &&
    currency.trim().length > 0 &&
    weight.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg shadow-2xl">
        <h4 className="text-xl font-bold mb-6">{editing ? "Edit" : "Add"} Fund Allocation</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fund Name</label>
            <input type="text" value={name} onChange={(e) => onNameChange(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">ISIN (12 chars)</label>
            <input type="text" value={isin} onChange={(e) => onIsinChange(e.target.value.toUpperCase())} maxLength={12} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Asset Class</label>
              <input type="text" value={assetClass} onChange={(e) => onAssetClassChange(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Region</label>
              <input type="text" value={region} onChange={(e) => onRegionChange(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
              <CurrencySelect
                value={currency}
                onChange={onCurrencyChange}
                disabled={isSaving}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Weight (0-1)</label>
              <input type="text" value={weight} onChange={(e) => onWeightChange(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Share Count</label>
            <input
              type="number"
              step="0.0001"
              min="0"
              value={shareCount ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                onShareCountChange(val === "" ? undefined : parseFloat(val));
              }}
              placeholder="Number of shares"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl"
            />
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

export default FundModal;

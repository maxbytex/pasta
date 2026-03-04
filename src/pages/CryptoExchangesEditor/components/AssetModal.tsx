import type { AssetModalProps } from "../../../interfaces/components/crypto/asset-modal-props-interface";
import { CurrencySelect } from "../../../components/common/CurrencySelect";

export default function AssetModal({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  formSymbol,
  setFormSymbol,
  formAmount,
  setFormAmount,
  formInvested,
  setFormInvested,
  formInvestedCurrency,
  setFormInvestedCurrency,
  availableSymbols,
  isSaving,
}: AssetModalProps) {
  if (!isOpen) return null;

  const canSave = formSymbol.trim().length > 0 && formAmount.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h4 className="text-xl font-bold mb-6">{editingAsset ? "Edit" : "Add"} Asset</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Symbol <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="crypto-symbols"
              value={formSymbol}
              onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
              disabled={isSaving}
              placeholder="BTC"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <datalist id="crypto-symbols">
              {availableSymbols.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.00000001"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              disabled={isSaving}
              placeholder="0.00000000"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Invested (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={formInvested}
                onChange={(e) => setFormInvested(e.target.value)}
                disabled={isSaving}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div style={{ minWidth: 100 }}>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
              <CurrencySelect
                value={formInvestedCurrency}
                onChange={setFormInvestedCurrency}
                disabled={isSaving || !formInvested}
              />
            </div>
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
              onClick={onSave}
              disabled={isSaving || !canSave}
                className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

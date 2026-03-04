import React, { useState } from "react";

import type { TextInputModalProps } from "../../interfaces/components/text-input-modal-props-interface";

export const TextInputModal: React.FC<TextInputModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  label,
  placeholder,
  defaultValue = "",
  isSaving = false,
  secondaryLabel,
  secondaryValue,
  secondaryPlaceholder,
  onSecondaryChange,
}) => {
  const [value, setValue] = useState(defaultValue);
  const canSave = value.trim().length > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
        <h4 className="text-xl font-bold mb-6">{title}</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholder}
              disabled={isSaving}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSave && !isSaving) onSave(value);
              }}
            />
          </div>
          {secondaryLabel && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{secondaryLabel}</label>
              <input
                type="number"
                value={secondaryValue}
                onChange={(e) => onSecondaryChange?.(e.target.value)}
                placeholder={secondaryPlaceholder}
                disabled={isSaving}
                min="0"
                max="100"
                step="1"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end mt-8">
          {!isSaving && (
            <button onClick={onClose} className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer">
              Cancel
            </button>
          )}
          <button
            onClick={() => onSave(value)}
            disabled={isSaving || !canSave}
            className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

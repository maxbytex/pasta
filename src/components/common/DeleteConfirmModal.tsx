import React from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  open,
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Delete</h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
          This action cannot be undone. Are you sure you want to delete this item?
        </p>
        <div className="flex gap-3 justify-end">
          {!isDeleting && (
            <button
              onClick={onCancel}
              className="px-5 py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
          >
            <Trash2 size={15} />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

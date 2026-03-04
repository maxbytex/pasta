import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash2, Plus, ShoppingBag, Edit2 } from "lucide-react";
import { useMerchantReceipts, useInvalidateQueries } from "../../hooks/useFinanceData";
import { createReceipt, updateReceipt, deleteReceipt, updateReceiptItems } from "../../services/api/merchants";
import { useMutation } from "@tanstack/react-query";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import ReceiptItemModal from "./components/ReceiptItemModal";
import type { Receipt } from "../../interfaces/receipt-interface";
import type { ReceiptItem } from "../../interfaces/receipt-item-interface";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";
import { getDefaultCurrencyCode } from "../../constants/currency-constants";
import { CurrencySelect } from "../../components/common/CurrencySelect";

interface ReceiptFormProps {
  initialData: {
    date: string;
    currency: string;
    items: ReceiptItem[];
  };
  merchantId: number;
  receiptId?: number;
  isNew: boolean;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ initialData, merchantId, receiptId, isNew }) => {
  const navigate = useNavigate();
  const invalidate = useInvalidateQueries();
  const [date, setDate] = useState(initialData.date);
  const [currency, setCurrency] = useState(initialData.currency);
  const [items, setItems] = useState<ReceiptItem[]>(initialData.items);

  const calculatedTotal = items.reduce((acc, item) => acc + parseFloat(item.unitPrice) * item.quantity, 0);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const totalAmountStr = calculatedTotal.toFixed(2);
      if (isNew) {
        return createReceipt(merchantId, date, totalAmountStr, currency);
      } else {
        await updateReceipt(receiptId!, date, totalAmountStr, currency);
        return updateReceiptItems(receiptId!, items);
      }
    },
    onSuccess: () => {
      invalidate.invalidateMerchantReceipts(merchantId);
      navigate(`/editors/merchants/${merchantId}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteReceipt(receiptId!),
    onSuccess: () => {
      invalidate.invalidateMerchantReceipts(merchantId);
      navigate(`/editors/merchants/${merchantId}`);
    },
  });

  const [showItemModal, setShowItemModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemUnitPrice, setItemUnitPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);

  const handleAddItem = () => {
    setEditingItemIndex(null);
    setItemName("");
    setItemUnitPrice("");
    setItemQuantity(1);
    setShowItemModal(true);
  };

  const handleEditItem = (index: number) => {
    const item = items[index];
    setEditingItemIndex(index);
    setItemName(item.name);
    setItemUnitPrice(item.unitPrice);
    setItemQuantity(item.quantity);
    setShowItemModal(true);
  };

  const handleSaveItem = () => {
    const newItem: ReceiptItem = { name: itemName, unitPrice: itemUnitPrice, quantity: itemQuantity };
    if (editingItemIndex !== null) {
      setItems(items.map((it, i) => i === editingItemIndex ? newItem : it));
    } else {
      setItems([...items, newItem]);
    }
    setShowItemModal(false);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/editors/merchants/${merchantId}`)}
            className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isNew ? "New Receipt" : "Edit Receipt"}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-[#ff4d43] text-white hover:opacity-90"
            >
              <Trash2 size={16} /> Delete
            </button>
          )}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || calculatedTotal === 0 || !date}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <Save size={16} /> {saveMutation.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap justify-start gap-2">
          <div className="w-[calc(50%-0.5rem)] sm:w-32 rounded-lg p-3 flex flex-col items-center text-center" style={{ background: "linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))" }}>
            <span className="text-[10px] font-medium text-white uppercase">Total Amount</span>
            <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(calculatedTotal, currency)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Currency</label>
            <CurrencySelect
              value={currency}
              onChange={setCurrency}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-gray-800 pt-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={20} className="text-emerald-500" />
            Receipt Items
          </h4>
          <button
            onClick={handleAddItem}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">No items added to this receipt yet.</p>
            </div>
          ) : (
            items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {item.quantity} x {formatCurrencyWithAlignment(parseFloat(item.unitPrice), currency)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-gray-900 dark:text-white">
                    {formatCurrencyWithAlignment(parseFloat(item.unitPrice) * item.quantity, currency)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEditItem(index)} className="p-2 text-gray-400 hover:text-emerald-500 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteItem(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ReceiptItemModal
        show={showItemModal}
        onClose={() => setShowItemModal(false)}
        isSaving={false}
        editing={editingItemIndex !== null ? items[editingItemIndex] : null}
        name={itemName}
        onNameChange={setItemName}
        unitPrice={itemUnitPrice}
        onUnitPriceChange={setItemUnitPrice}
        quantity={itemQuantity}
        onQuantityChange={setItemQuantity}
        onSave={handleSaveItem}
      />
      <DeleteConfirmModal
        open={showDeleteConfirm}
        isDeleting={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate();
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export const ReceiptDetailEditor: React.FC = () => {
  const { merchantId, receiptId } = useParams<{ merchantId: string, receiptId: string }>();
  const isNew = receiptId === "new";

  const { data: receipts = [], isLoading } = useMerchantReceipts(Number(merchantId));
  const receipt = receipts.find((r: Receipt) => r.id === Number(receiptId));

  if (!isNew && isLoading && !receipt) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading receipt...</div>
      </div>
    );
  }

  if (!isNew && !receipt && !isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Receipt not found.</div>
      </div>
    );
  }

  const initialData = {
    date: receipt && !isNew ? (receipt.receiptDate || receipt.date).split('T')[0] : new Date().toISOString().split('T')[0],
    currency: receipt && !isNew ? receipt.currencyCode : getDefaultCurrencyCode(),
    items: receipt && !isNew ? receipt.items || [] : [],
  };

  return (
    <ReceiptForm 
      initialData={initialData} 
      merchantId={Number(merchantId)} 
      receiptId={Number(receiptId)} 
      isNew={isNew} 
    />
  );
};

export default ReceiptDetailEditor;

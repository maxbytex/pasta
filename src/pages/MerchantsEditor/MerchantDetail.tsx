import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Edit2, Plus, Trash2, ArrowLeft, Receipt as ReceiptIcon } from "lucide-react";
import { useMerchants, useMerchantReceipts, useInvalidateQueries } from "../../hooks/useFinanceData";
import { Skeleton } from "../../components/Skeleton";
import { GradientHistoryCard } from "../../components/common/GradientHistoryCard";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import { formatDate } from "../../utils/date-utils";
import { deleteReceipt } from "../../services/api/merchants";
import { useMutation } from "@tanstack/react-query";
import type { Merchant } from "../../interfaces/merchant-interface";
import type { Receipt } from "../../interfaces/receipt-interface";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

interface MerchantDetailProps {
  onEdit: (merchant: Merchant) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
}

export const MerchantDetail: React.FC<MerchantDetailProps> = ({
  onEdit,
  onDelete,
  onBack,
}) => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const navigate = useNavigate();
  const { data: merchants = [] } = useMerchants();
  const merchant = merchants.find((m: Merchant) => m.id === Number(merchantId));

  const { data: receipts = [], isLoading: loadingReceipts } = useMerchantReceipts(Number(merchantId));
  const invalidate = useInvalidateQueries();

  const deleteReceiptMutation = useMutation({
    mutationFn: (id: number) => deleteReceipt(id),
    onSuccess: () => invalidate.invalidateMerchantReceipts(Number(merchantId)),
  });

  const [pendingDeleteReceiptId, setPendingDeleteReceiptId] = useState<number | null>(null);

  if (!merchant) return null;

  const totalSpent = receipts.reduce((acc: number, r: Receipt) => acc + parseFloat(r.totalAmount), 0);
  const currencyCode = receipts.length > 0 ? receipts[0].currencyCode : "EUR";

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{merchant.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Merchant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(merchant)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20"
          >
            <Edit2 size={16} /> Edit
          </button>
          <button
            onClick={() => onDelete(merchant.id)}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-[#ff4d43] text-white hover:opacity-90"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          {loadingReceipts ? (
            <>
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[52px] rounded-lg" />
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[52px] rounded-lg" />
            </>
          ) : (
            <>
              <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Receipts</span>
                <span className="text-sm font-bold text-white">{receipts.length}</span>
              </div>
              <div className="w-[calc(50%-0.5rem)] sm:w-32 rounded-lg p-2 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(248, 113, 113), rgb(239, 68, 68))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Total Spent</span>
                <span className="text-sm font-bold text-white">{formatCurrencyWithAlignment(totalSpent, currencyCode)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 mt-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Receipts History</h4>
        <button
          onClick={() => navigate(`/editors/merchants/${merchantId}/receipt/new`)}
          className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
        >
          <Plus size={16} /> Add Receipt
        </button>
      </div>

      <div className="flex-1">
        {loadingReceipts ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : receipts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <ReceiptIcon size={32} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No receipts yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Add your first receipt for this merchant.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {receipts.map((receipt: Receipt) => (
              <GradientHistoryCard
                key={receipt.id}
                borderClassName="border-emerald-500 dark:border-emerald-400"
                gradient="linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"
                actions={
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/editors/merchants/${merchantId}/receipt/${receipt.id}`)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setPendingDeleteReceiptId(receipt.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                }
              >
                <div 
                  className="flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(receipt.receiptDate || receipt.date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-mono text-gray-900 dark:text-white">
                      {formatCurrencyWithAlignment(parseFloat(receipt.totalAmount), receipt.currencyCode)}
                    </span>
                  </div>
                </div>
              </GradientHistoryCard>
            ))}
          </div>
        )}
      </div>
      <DeleteConfirmModal
        open={pendingDeleteReceiptId !== null}
        isDeleting={deleteReceiptMutation.isPending}
        onConfirm={() => {
          if (pendingDeleteReceiptId === null) return;
          const id = pendingDeleteReceiptId;
          deleteReceiptMutation.mutate(id, {
            onSettled: () => setPendingDeleteReceiptId(null),
          });
        }}
        onCancel={() => setPendingDeleteReceiptId(null)}
      />
    </div>
  );
};

export default MerchantDetail;

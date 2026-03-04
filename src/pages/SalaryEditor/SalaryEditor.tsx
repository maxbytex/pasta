import React, { useState } from "react";
import { Edit2, Plus, Trash2, TrendingUp } from "lucide-react";
import ErrorBanner from "../../components/common/ErrorBanner";
import { useInfiniteSalaryChanges, useInvalidateQueries } from "../../hooks/useFinanceData";
import { useMutation } from "@tanstack/react-query";
import { createSalaryChange, updateSalaryChange, deleteSalaryChange } from "../../services/api/salaryChanges";
import { Skeleton } from "../../components/Skeleton";
import { GradientHistoryCard } from "../../components/common/GradientHistoryCard";
import { formatCurrencyWithAlignment } from "../../utils/currency-utils";
import { formatDate } from "../../utils/date-utils";

import type { SalaryChange } from "../../interfaces/pages/salary-change-interface";

export const SalaryEditor: React.FC = () => {
  const { 
    data, 
    isLoading: loading, 
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage 
  } = useInfiniteSalaryChanges();
  
  const salaries = data?.pages.flatMap(page => page.results) || [];
  const invalidate = useInvalidateQueries();
  const createMutation = useMutation<SalaryChange, unknown, { recurrence: string; amount: string; currency: string; date: string }>({
    mutationFn: (payload: { recurrence: string; amount: string; currency: string; date: string }) =>
      createSalaryChange(payload.recurrence, payload.amount, payload.currency, payload.date),
    onSuccess: () => invalidate.invalidateSalaryChanges(),
  });

  const updateMutation = useMutation<SalaryChange, unknown, { id: number; recurrence: string; amount: string; currency: string; date: string }>({
    mutationFn: (payload: { id: number; recurrence: string; amount: string; currency: string; date: string }) =>
      updateSalaryChange(payload.id, payload.recurrence, payload.amount, payload.currency, payload.date),
    onSuccess: () => invalidate.invalidateSalaryChanges(),
  });

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (id: number) => deleteSalaryChange(id),
    onSuccess: () => invalidate.invalidateSalaryChanges(),
  });

  const [showModal, setShowModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<SalaryChange | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formRecurrence, setFormRecurrence] = useState("monthly");
  const [formAmount, setFormAmount] = useState("");
  const [formCurrency, setFormCurrency] = useState("USD");
  const [formDate, setFormDate] = useState("");

  const [availableCurrencies] = useState<string[]>(["USD", "EUR", "GBP"]);
  const isSalaryFormComplete = Boolean(
    formAmount.trim() && formCurrency.trim() && formRecurrence.trim() && formDate.trim(),
  );

  // Data is provided by useSalaryChanges

  const handleCreate = () => {
    setEditingSalary(null);
    setFormRecurrence("monthly");
    setFormAmount("");
    setFormCurrency("USD");
    setFormDate("");
    setShowModal(true);
  };

  const handleEdit = (salary: SalaryChange) => {
    setEditingSalary(salary);
    setFormRecurrence(salary.recurrence);
    setFormAmount(salary.netAmount);
    setFormCurrency(salary.currencyCode);
    setFormDate(salary.date);
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this salary change?")) return;
    deleteMutation.mutate(id);
  };

  const handleSave = async () => {
    if (!isSalaryFormComplete) return;
    setIsSaving(true);
    if (editingSalary) {
      updateMutation.mutate({ id: editingSalary.id, recurrence: formRecurrence, amount: formAmount, currency: formCurrency, date: formDate }, { onSettled: () => setIsSaving(false) });
    } else {
      createMutation.mutate({ recurrence: formRecurrence, amount: formAmount, currency: formCurrency, date: formDate }, { onSettled: () => setIsSaving(false) });
    }
    setShowModal(false);
  };

  // Calculate stats
  const calculateStats = () => {
    let monthlyAmount = 0;
    let yearlyAmount = 0;
    let latestCurrency = "USD";

    if (salaries.length > 0) {
      const latest = salaries[0];
      const amount = parseFloat(latest.netAmount);
      latestCurrency = latest.currencyCode;

      switch (latest.recurrence) {
        case "weekly":
          monthlyAmount = amount * 4.33;
          yearlyAmount = amount * 52;
          break;
        case "bi-weekly":
          monthlyAmount = amount * 2.17;
          yearlyAmount = amount * 26;
          break;
        case "yearly":
          monthlyAmount = amount / 12;
          yearlyAmount = amount;
          break;
        case "monthly":
        default:
          monthlyAmount = amount;
          yearlyAmount = amount * 12;
      }
    }

    return {
      monthlyAmount,
      yearlyAmount,
      latestCurrency,
    };
  };

  const stats = calculateStats();

  const errorMessage = error ? (error instanceof Error ? error.message : String(error)) : null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Salary</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {salaries.length} {salaries.length === 1 ? "change" : "changes"}
          </p>
        </div>

      <div className="flex items-center sm:items-center">
          <button
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600 font-medium"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

  {errorMessage && <ErrorBanner message={errorMessage} />}

      {/* KPI Cards */}
      <div className="mb-6">
        <div className="flex flex-wrap justify-start gap-2">
          {loading ? (
            <>
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[60px] rounded-lg" />
              <Skeleton className="w-[calc(50%-0.5rem)] sm:w-28 h-[60px] rounded-lg" />
            </>
          ) : (
            <>
              <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-3 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(52, 211, 153), rgb(16, 185, 129))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Monthly</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrencyWithAlignment(stats.monthlyAmount, stats.latestCurrency)}
                </span>
              </div>
              <div className="w-[calc(50%-0.5rem)] sm:w-28 rounded-lg p-3 flex flex-col items-center text-center" style={{ background: "linear-gradient(to bottom, rgb(96, 165, 250), rgb(59, 130, 246))" }}>
                <span className="text-[10px] font-medium text-white uppercase">Yearly</span>
                <span className="text-sm font-bold text-white">
                  {formatCurrencyWithAlignment(stats.yearlyAmount, stats.latestCurrency)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Salary History</h4>

      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
        ) : salaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl flex items-center justify-center mb-5">
              <TrendingUp size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No salary records yet
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Use the button above to add your salary changes and track your income.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {salaries.map((salary) => (
              <GradientHistoryCard
                key={salary.id}
                borderClassName="border-emerald-500 dark:border-emerald-400"
                gradient="linear-gradient(135deg, rgb(16, 185, 129), rgb(5, 150, 105))"
                actions={
                  <>
                    <button
                      onClick={() => handleEdit(salary)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(salary.id)}
                      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(salary.date)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {salary.recurrence}
                    </p>
                  </div>
                  <span className="font-mono text-right text-gray-900 dark:text-white">
                    {formatCurrencyWithAlignment(parseFloat(salary.netAmount), salary.currencyCode)}
                  </span>
                </div>
              </GradientHistoryCard>
            ))}
            
            {hasNextPage && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500/10 text-emerald-900 dark:text-white hover:bg-emerald-500/20 w-full sm:w-auto"
                >
                  {isFetchingNextPage ? "Loading more..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-xl font-bold mb-6">
              {editingSalary ? "Edit" : "Add"} Salary Change
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Recurrence <span className="text-red-500">*</span>
                </label>
                <select
                  value={formRecurrence}
                  onChange={(e) => setFormRecurrence(e.target.value)}
                  disabled={isSaving}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Net Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  disabled={isSaving}
                  placeholder="0.00"
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                  Currency <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  list="currencies-salary"
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value.toUpperCase())}
                  disabled={isSaving}
                  placeholder="USD"
                  maxLength={3}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <datalist id="currencies-salary">
                  {availableCurrencies.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="flex gap-3 justify-end mt-8">
                {!isSaving && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-3 sm:py-2.5 text-gray-500 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving || !isSalaryFormComplete}
                  className="px-5 py-3 sm:py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-300 dark:disabled:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:text-white text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 disabled:shadow-none cursor-pointer"
                >
                  {isSaving ? "Saving" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

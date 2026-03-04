import React, { useState } from "react";
import { Plus, Receipt, Heart, Search } from "lucide-react";
import { useBillCategories, useInvalidateQueries } from "../../hooks/useFinanceData";
import { useMutation } from "@tanstack/react-query";
import { createBillCategory, updateBillCategory, deleteBillCategory } from "../../services/api/billCategories";
import { Skeleton } from "../../components/Skeleton";
import { CategoryCard } from "../../components/CategoryCard";
import ErrorBanner from "../../components/common/ErrorBanner";
import type { BillCategory } from "../../interfaces/bill-category-interface";
import { clsx } from "clsx";
import { DeleteConfirmModal } from "../../components/common/DeleteConfirmModal";

export const BillCategoriesTab: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BillCategory | null>(null);
  const [name, setName] = useState("");
  const [hexColor, setHexColor] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);

  const PRESET_COLORS = [
    "#10b981", "#3b82f6", "#f87171", "#fbbf24", "#a78bfa", "#f472b6", 
    "#2dd4bf", "#6366f1", "#eab308", "#f97316", "#64748b", "#ec4899"
  ];

  const { data: categories = [], isLoading: loading } = useBillCategories();
  const invalidate = useInvalidateQueries();

  const normalize = (c: string) =>
    c ? c.replace(/_/g, " ").charAt(0).toUpperCase() + c.replace(/_/g, " ").slice(1).toLowerCase() : "Uncategorized";

  const sortedCategories = [...categories]
    .filter(c => search === "" || c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
    if (a.favoritedAt && !b.favoritedAt) return -1;
    if (!a.favoritedAt && b.favoritedAt) return 1;
    return normalize(a.name).localeCompare(normalize(b.name));
  });

  const createMutation = useMutation<BillCategory, unknown, { name: string; hexColor: string | null }>({
    mutationFn: ({ name, hexColor }) => createBillCategory(name, hexColor),
    onSuccess: () => invalidate.invalidateBillCategories(),
  });

  const updateMutation = useMutation<BillCategory, unknown, { id: number; name?: string; favoritedAt?: string | null; hexColor?: string | null }>({
    mutationFn: ({ id, name, favoritedAt, hexColor }) => updateBillCategory(id, name, favoritedAt, hexColor),
    onSuccess: () => invalidate.invalidateBillCategories(),
  });

  const deleteMutation = useMutation<void, unknown, number>({
    mutationFn: (id) => deleteBillCategory(id),
    onSuccess: () => invalidate.invalidateBillCategories(),
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setName("");
    setHexColor(null);
    setShowModal(true);
  };

  const handleEdit = (category: BillCategory) => {
    setEditingCategory(category);
    setName(category.name);
    setHexColor(category.hexColor || null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      if (editingCategory) {
        await updateMutation.mutateAsync({ id: editingCategory.id, name, hexColor });
      } else {
        await createMutation.mutateAsync({ name, hexColor });
      }
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleFavorite = async (category: BillCategory) => {
    try {
      const newFavoritedAt = category.favoritedAt ? null : new Date().toISOString();
      await updateMutation.mutateAsync({ id: category.id, favoritedAt: newFavoritedAt });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
  };

  const confirmDeleteCategory = async () => {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;
    setIsDeletingCategory(true);
    try {
      await deleteMutation.mutateAsync(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsDeletingCategory(false);
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full sm:w-72 pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <button onClick={handleCreate} className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600 whitespace-nowrap">
          <Plus size={18} /> Add Category
        </button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex-1">
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mb-6">
              <Receipt size={48} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No categories yet</h4>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs">
              Create categories to organize your bills and track your spending habits.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Favorites Section */}
            {sortedCategories.some(c => c.favoritedAt) && (
              <div>
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <Heart size={14} className="text-red-500 fill-red-500" />
                  Favorites
                </h5>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedCategories.filter(c => c.favoritedAt).map(category => (
                    <CategoryCard 
                      key={category.id} 
                      category={category} 
                      onToggleFavorite={() => handleToggleFavorite(category)} 
                      onEdit={() => handleEdit(category)} 
                      onDelete={() => handleDelete(category.id)} 
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Categories Section */}
            <div>
              {sortedCategories.some(c => c.favoritedAt) && (
                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">
                  All Categories
                </h5>
              )}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {sortedCategories.filter(c => !c.favoritedAt).map(category => (
                  <CategoryCard 
                    key={category.id} 
                    category={category} 
                    onToggleFavorite={() => handleToggleFavorite(category)} 
                    onEdit={() => handleEdit(category)} 
                    onDelete={() => handleDelete(category.id)} 
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
              {editingCategory ? "Edit Category" : "New Category"}
            </h4>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  disabled={isSaving} 
                  placeholder="e.g., Utilities, Rent..." 
                  className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-lg font-medium" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Label Color</label>
                <div className="grid grid-cols-6 gap-3">
                  {PRESET_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => setHexColor(c)} 
                      disabled={isSaving} 
                      className={clsx(
                        "w-full aspect-square rounded-full transition-all cursor-pointer ring-offset-2 dark:ring-offset-gray-900",
                        hexColor === c ? "ring-2 ring-emerald-500 scale-110" : "hover:scale-110"
                      )} 
                      style={{ backgroundColor: c }} 
                    />
                  ))}
                  <button 
                    onClick={() => setHexColor(null)} 
                    disabled={isSaving} 
                    className={clsx(
                      "w-full aspect-square rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center transition-all cursor-pointer ring-offset-2 dark:ring-offset-gray-900", 
                      hexColor === null ? "ring-2 ring-emerald-500 scale-110 bg-gray-50 dark:bg-gray-900" : "hover:scale-110"
                    )}
                  >
                    <span className="text-[10px] font-bold text-gray-400">AUTO</span>
                  </button>
                </div>
              </div>
              <div className="flex gap-3 justify-end mt-10">
                <button onClick={() => setShowModal(false)} className="inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-900 rounded-2xl transition-colors cursor-pointer">
                  Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !name.trim()} 
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <DeleteConfirmModal
        open={pendingDeleteId !== null}
        isDeleting={isDeletingCategory}
        onConfirm={confirmDeleteCategory}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default BillCategoriesTab;

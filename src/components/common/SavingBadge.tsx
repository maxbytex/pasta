import React from "react";
import { Loader2 } from "lucide-react";

export const SavingBadge: React.FC<{ label?: string; className?: string }> = ({ label = "Saving", className = "" }) => (
  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium flex items-center gap-1 text-amber-700 dark:text-amber-300 bg-amber-50/95 dark:bg-amber-900/60 border-amber-200 dark:border-amber-800 ${className}`}>
    <Loader2 size={10} className="animate-spin" />
    {label}
  </span>
);

export default SavingBadge;

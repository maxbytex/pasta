import React from "react";
import { Wallet } from "lucide-react";
import type { CashInterface } from "../../../interfaces/cash-interface";

export const CashCard: React.FC<{ item: CashInterface; onSelect: (c: CashInterface) => void; isDeleting?: boolean }> = ({ item, onSelect, isDeleting = false }) => {
  return (
    <div
      className="group rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ background: isDeleting ? "linear-gradient(rgb(248, 113, 113), rgb(239, 68, 68))" : "linear-gradient(rgb(16, 185, 129), rgb(5, 150, 105))", opacity: isDeleting ? 0.65 : 1 }}
      onClick={() => onSelect(item)}
    >
      <div className="flex items-start mb-3">
        <div className="text-white">
          <Wallet size={20} />
        </div>
      </div>
      <h4 className="font-semibold text-white">{item.label}</h4>
    </div>
  );
};

export default CashCard;

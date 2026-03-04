import React from "react";
import { Wallet } from "lucide-react";
import type { CryptoExchange } from "../../../interfaces/crypto-exchange-interface";

export const ExchangeCard: React.FC<{ exchange: CryptoExchange; onSelect: (e: CryptoExchange) => void; isDeleting?: boolean }> = ({ exchange, onSelect, isDeleting = false }) => {
  return (
    <div
      key={exchange.id}
      className="group rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ background: isDeleting ? "linear-gradient(rgb(248, 113, 113), rgb(239, 68, 68))" : "linear-gradient(rgb(236, 72, 153), rgb(219, 39, 119))", opacity: isDeleting ? 0.65 : 1 }}
      onClick={() => onSelect(exchange)}
    >
      <div className="flex items-start mb-3">
        <div className="text-white">
          <Wallet size={20} />
        </div>
      </div>
      <h4 className="font-semibold text-white">{exchange.name}</h4>
    </div>
  );
};

export default ExchangeCard;

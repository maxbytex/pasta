import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const COMMON_CURRENCIES = [
  "AED", "AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK",
  "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "INR", "JPY",
  "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PLN", "RON",
  "RUB", "SEK", "SGD", "THB", "TRY", "USD", "ZAR",
];

interface CurrencySelectProps {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  availableCurrencies?: string[];
  className?: string;
}

export const CurrencySelect: React.FC<CurrencySelectProps> = ({
  value,
  onChange,
  disabled,
  availableCurrencies = [],
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCurrencies = Array.from(
    new Set([...COMMON_CURRENCIES, ...availableCurrencies])
  ).sort();

  const filtered = value
    ? allCurrencies.filter((c) => c.startsWith(value.toUpperCase()))
    : allCurrencies;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase().slice(0, 3);
    onChange(v);
    setOpen(true);
  };

  const handleSelect = (currency: string) => {
    onChange(currency);
    setOpen(false);
    inputRef.current?.blur();
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setOpen(true)}
          disabled={disabled}
          placeholder="EUR"
          maxLength={3}
          autoComplete="off"
          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2.5 pr-8 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setOpen((o) => !o);
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 cursor-pointer"
        >
          <ChevronDown size={14} />
        </button>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full min-w-[80px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c}
              type="button"
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(c);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                c === value
                  ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium"
                  : "text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencySelect;

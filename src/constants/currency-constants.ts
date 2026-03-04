const configuredDefaultCurrencyCode = import.meta.env.VITE_DEFAULT_CURRENCY_CODE
  ?.trim()
  .toUpperCase();

export const DEFAULT_CURRENCY_CODE = configuredDefaultCurrencyCode || "USD";


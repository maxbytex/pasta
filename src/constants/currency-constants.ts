import { getSettings } from "../services/httpClient";

export function getDefaultCurrencyCode(): string {
  return getSettings().defaultCurrency || "";
}


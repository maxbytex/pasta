import axios from "axios";
import type { AppSettings } from "../interfaces/app-settings-interface";
import { ServerError } from "../models/server-error";

const SETTINGS_KEY = "finance_app_settings";

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);

  if (stored) {
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      theme: parsed.theme || "system",
    };
  }

  return {
    jwt: "",
    theme: "system",
    defaultCurrency: "",
  };
};

export const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  applyTheme(settings.theme);
};

export const applyTheme = (theme: "light" | "dark" | "system") => {
  const root = document.documentElement;
  root.classList.remove("dark", "light");

  const appliedTheme: "light" | "dark" = theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : theme;

  root.classList.add(appliedTheme);

  document.documentElement.setAttribute("data-theme", theme);
  window.dispatchEvent(
    new CustomEvent("theme:changed", { detail: { theme, appliedTheme } }),
  );
};

export const getAppliedTheme = (): "light" | "dark" => {
  const root = document.documentElement;
  return root.classList.contains("dark") ? "dark" : "light";
};

export const api = axios.create();

api.interceptors.request.use((config) => {
  const settings = getSettings();
  config.baseURL = import.meta.env.VITE_API_BASE_URL;
  if (settings.jwt) {
    config.headers.Authorization = `Bearer ${settings.jwt}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      window.dispatchEvent(new Event("auth:force-logout"));
    }
    // Convert API error responses with code field to ServerError
    if (error.response?.data?.code && error.response?.data?.message) {
      return Promise.reject(
        new ServerError(
          error.response.data.message,
          error.response.data.code
        )
      );
    }
    return Promise.reject(error);
  }
);

export default api;

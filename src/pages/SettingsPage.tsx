import React, { useState, useEffect } from "react";
import {
  applyTheme,
  getSettings,
  saveSettings,
} from "../services/httpClient";
import { getRegistrationOptions, verifyRegistrationResponse } from "../services/api/auth";
import type { AppSettings } from "../interfaces/app-settings-interface";
import { WebAuthnUtils } from "../utils/credential-utils";
import { KeyRound, Loader2, Monitor, Moon, Sun, X } from "lucide-react";
import { CurrencySelect } from "../components/common/CurrencySelect";

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const loadedSettings = getSettings();
    applyTheme(loadedSettings.theme);
    return loadedSettings;
  });
  const [registering, setRegistering] = useState(false);
  const [passkeyName, setPasskeyName] = useState("");
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [passkeySuccess, setPasskeySuccess] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Removed unused input change handler to satisfy TypeScript's unused variable checks

  const handleRegisterPasskey = async () => {
    setRegistering(true);
    setPasskeyError(null);
    setPasskeySuccess(false);

    try {
      // Check if passkeys are supported
      if (window.PublicKeyCredential === undefined) {
        throw new Error(
          "Your browser or device doesn't support passkeys.",
        );
      }

      const transactionId = crypto.randomUUID();

      // Get registration options
      const registrationOptions = await getRegistrationOptions({
        transactionId,
        displayName: passkeyName,
      });

      const publicKey = {
        challenge: WebAuthnUtils.challengeToArrayBuffer(
          registrationOptions.challenge,
        ),
        rp: registrationOptions.rp,
        user: {
          id: WebAuthnUtils.challengeToArrayBuffer(
            registrationOptions.user.id,
          ),
          name: registrationOptions.user.name,
          displayName: registrationOptions.user.displayName,
        },
        pubKeyCredParams: registrationOptions.pubKeyCredParams,
        timeout: registrationOptions.timeout,
        attestation: registrationOptions.attestation,
        excludeCredentials: registrationOptions.excludeCredentials,
        authenticatorSelection: registrationOptions.authenticatorSelection,
        extensions: registrationOptions.extensions,
      };

      // Create the credential
      const credential = await navigator.credentials.create({
        publicKey,
      });

      if (credential === null) {
        throw new Error("User canceled credential creation");
      }

      // Verify the registration
      const verifyResponse = await verifyRegistrationResponse({
        transactionId,
        registrationResponse: WebAuthnUtils.serializeCredential(
          credential as PublicKeyCredential,
        ),
      });

      // Store the new JWT token
      const currentSettings = getSettings();
      saveSettings({ ...currentSettings, jwt: verifyResponse.token });

      setPasskeySuccess(true);
      setPasskeyName("");
      setShowPasskeyModal(false);
    } catch (err: unknown) {
      console.error("Passkey registration error:", err);
      setPasskeyError(
        err instanceof Error ? err.message : "Failed to register passkey",
      );
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col relative max-md:rounded-none max-md:border-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure app preferences
          </p>
        </div>
      </div>

      <div className="space-y-10 max-w-lg">

        {/* General */}
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-5">
            General
          </h4>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Default Currency</label>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Pre-filled currency when creating new entries.
            </p>
            <div style={{ maxWidth: 180 }}>
              <CurrencySelect
                value={settings.defaultCurrency || ""}
                onChange={(v) => setSettings((prev) => ({ ...prev, defaultCurrency: v }))}
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-5">
            Appearance
          </h4>
          <div className="flex flex-col gap-1 mb-3">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Theme</label>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setSettings((prev) => ({ ...prev, theme: "light" })); applyTheme("light"); }}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                settings.theme === "light"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Light</span>
            </button>
            <button
              type="button"
              onClick={() => { setSettings((prev) => ({ ...prev, theme: "dark" })); applyTheme("dark"); }}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                settings.theme === "dark"
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => { setSettings((prev) => ({ ...prev, theme: "system" })); applyTheme("system"); }}
              className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                settings.theme === "system" || !settings.theme
                  ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">System</span>
            </button>
          </div>
        </section>

        {/* Authentication */}
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-5">
            Authentication
          </h4>
          <div className="flex flex-col gap-1 mb-4">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Passkeys</label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Register additional passkeys to access your account from multiple devices.
            </p>
          </div>

          {passkeyError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-400 text-sm">{passkeyError}</p>
            </div>
          )}

          {passkeySuccess && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <p className="text-emerald-800 dark:text-emerald-400 text-sm">Passkey registered successfully!</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => { setShowPasskeyModal(true); setPasskeyError(null); setPasskeySuccess(false); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600"
          >
            <KeyRound className="w-4 h-4" />
            Add Passkey
          </button>
        </section>

        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Settings are saved automatically
        </p>

      </div>

      {/* Passkey Registration Modal */}
      {showPasskeyModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Passkey
              </h3>
              <button
                onClick={() => {
                  setShowPasskeyModal(false);
                  setPasskeyName("");
                  setPasskeyError(null);
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
                disabled={registering}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Choose a name to identify this passkey (e.g., "My iPhone" or "Work Laptop").
            </p>

            <div className="mb-6">
              <label
                htmlFor="passkeyNameModal"
                className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2"
              >
                Passkey Name
              </label>
              <input
                type="text"
                id="passkeyNameModal"
                value={passkeyName}
                onChange={(e) => setPasskeyName(e.target.value)}
                placeholder="e.g., My iPhone"
                maxLength={255}
                disabled={registering}
                className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

                        <div className="flex gap-3 justify-end">

                          <button

                            type="button"

                            onClick={() => {

                              setShowPasskeyModal(false);

                              setPasskeyName("");

                              setPasskeyError(null);

                            }}

                            disabled={registering}

                            className="inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"

                          >

                            Cancel

                          </button>

                          <button

                            type="button"

                            onClick={handleRegisterPasskey}

                            disabled={registering || !passkeyName.trim()}

                            className="relative inline-flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-xl font-semibold text-sm leading-none transition-all active:translate-y-[1px] active:scale-[0.995] cursor-pointer bg-emerald-500 text-white hover:bg-emerald-600 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900 focus:ring-emerald-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"

                          >
                            <span className={registering ? "opacity-0" : "flex items-center gap-2"}>
                              <KeyRound className="w-4 h-4" />
                              Register
                            </span>
                            {registering && <Loader2 className="absolute w-4 h-4 animate-spin" />}
                          </button>

                        </div>

            
          </div>
        </div>
      )}
    </div>
  );
};

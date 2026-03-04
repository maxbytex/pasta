import { useMemo } from "react";
import type { BankAccountBalance } from "../../interfaces/bank-account-balance-interface";
import type { CashBalance } from "../../interfaces/cash-balance-interface";
import type { CryptoExchangeBalance } from "../../interfaces/crypto-exchange-balance-interface";
import type { BankAccountRoboadvisor } from "../../interfaces/bank-account-roboadvisor-interface";
import type { BankAccountRoboadvisorBalance } from "../../interfaces/bank-account-roboadvisor-balance-interface";
import type { BankAccount } from "../../interfaces/bank-account-interface";
import type { CryptoExchange } from "../../interfaces/crypto-exchange-interface";
import type { Bill } from "../../interfaces/bill-interface";
import type { Receipt } from "../../interfaces/receipt-interface";
import type { Subscription } from "../../interfaces/subscription-interface";
import type { KpiData } from "../../interfaces/dashboard-data-interface";
import { DEFAULT_CURRENCY_CODE } from "../../constants/currency-constants";

export function useDashboardKpis(
  allBankBalances: BankAccountBalance[],
  allCashBalances: CashBalance[],
  allCryptoBalances: CryptoExchangeBalance[],
  allRoboadvisorBalances: BankAccountRoboadvisorBalance[],
  bankAccounts: BankAccount[],
  roboadvisors: BankAccountRoboadvisor[],
  cryptoExchanges: CryptoExchange[],
  bills: Bill[],
  receipts: Receipt[],
  subscriptions: Subscription[],
  loadingKpis: boolean
): KpiData | null {
  return useMemo((): KpiData | null => {
    if (loadingKpis) return null;

    let currency = DEFAULT_CURRENCY_CODE;

    const bankBalancesByAccount: Record<number, BankAccountBalance[]> = {};
    (allBankBalances || []).forEach((b) => {
      if (!bankBalancesByAccount[b.bankAccountId]) bankBalancesByAccount[b.bankAccountId] = [];
      bankBalancesByAccount[b.bankAccountId].push(b);
    });

    let totalLiquid = 0;
    let monthlyInterest = 0;
    // Monthly aggregates for KPIs
    let monthlyExpenses = 0;
    let monthlyReceipts = 0;
    let monthlySubscriptions = 0;

    Object.entries(bankBalancesByAccount).forEach(([id, bals]) => {
      if (bals?.length) {
        bals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const balanceValue = bals[0].balance ? parseFloat(String(bals[0].balance)) : 0;
        if (!isNaN(balanceValue)) {
          totalLiquid += balanceValue;
        }
        if (bals[0].currencyCode) currency = bals[0].currencyCode;

        const accountId = parseInt(id, 10);
        const account = bankAccounts.find((acc) => acc.id === accountId);
        const monthlyProfit = account?.latestCalculation?.monthlyProfit;
        if (monthlyProfit) {
          const profitValue = parseFloat(String(monthlyProfit));
          if (!isNaN(profitValue)) {
            monthlyInterest += profitValue;
          }
        }
      }
    });

    // Calculate monthly bills, receipts and subscriptions for current month
    const now = new Date();
    const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    if (Array.isArray(bills)) {
      bills.forEach((b) => {
        const dateStr = b.date;
        if (dateStr?.substring(0, 7) === curMonth) {
          const amount = b.totalAmount ? parseFloat(String(b.totalAmount)) : 0;
          if (!isNaN(amount)) {
            monthlyExpenses += amount;
          }
        }
      });
    }

    if (Array.isArray(receipts)) {
      receipts.forEach((r) => {
        const dateStr = r.date || r.receiptDate;
        if (dateStr?.substring(0, 7) === curMonth) {
          const amount = r.totalAmount ? parseFloat(String(r.totalAmount)) : 0;
          if (!isNaN(amount)) {
            monthlyReceipts += amount;
          }
        }
      });
    }

    if (Array.isArray(subscriptions)) {
      subscriptions.forEach((s) => {
        const amount = s.amount ? parseFloat(String(s.amount)) : 0;
        if (!isNaN(amount)) {
          switch (s.recurrence) {
            case "weekly":
              monthlySubscriptions += amount * 4.33;
              break;
            case "bi-weekly":
              monthlySubscriptions += amount * 2.17;
              break;
            case "yearly":
              monthlySubscriptions += amount / 12;
              break;
            case "monthly":
            default:
              monthlySubscriptions += amount;
          }
        }
      });
    }

    const cashBalancesByCash: Record<number, CashBalance[]> = {};
    (allCashBalances || []).forEach((b) => {
      if (!cashBalancesByCash[b.cashId]) cashBalancesByCash[b.cashId] = [];
      cashBalancesByCash[b.cashId].push(b);
    });
    Object.values(cashBalancesByCash).forEach((bals) => {
      if (bals?.length) {
        bals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const balanceValue = bals[0].balance ? parseFloat(String(bals[0].balance)) : 0;
        if (!isNaN(balanceValue)) {
          totalLiquid += balanceValue;
        }
        if (bals[0].currencyCode) currency = bals[0].currencyCode;
      }
    });

    let totalCryptoValue = 0;
    let totalCryptoCost = 0;
    const latest: Record<string, CryptoExchangeBalance> = {};
    (allCryptoBalances || []).forEach((b) => {
      const key = `${b.cryptoExchangeId}-${b.symbolCode}`;
      if (!latest[key] || new Date(b.createdAt) > new Date(latest[key].createdAt)) latest[key] = b;
    });

    const cryptoBalancesByExchange: Record<number, CryptoExchangeBalance[]> = {};
    Object.values(latest).forEach((b) => {
      if (!cryptoBalancesByExchange[b.cryptoExchangeId]) cryptoBalancesByExchange[b.cryptoExchangeId] = [];
      cryptoBalancesByExchange[b.cryptoExchangeId].push(b);
    });

    cryptoExchanges.forEach((exchange) => {
      const currentValue = exchange.latestCalculation?.currentValue;
      if (currentValue) {
        const value = parseFloat(String(currentValue));
        if (!isNaN(value)) {
          totalCryptoValue += value;
        }
        const exchangeBalances = cryptoBalancesByExchange[exchange.id] || [];
        exchangeBalances.forEach((b) => {
          const cost = b.investedAmount ? parseFloat(String(b.investedAmount)) : 0;
          if (!isNaN(cost)) {
            totalCryptoCost += cost;
          }
        });
      }
    });

    let totalRoboadvisorValue = 0;
    let totalRoboadvisorCost = 0;
    const latestRoboadvisorBalances: Record<number, BankAccountRoboadvisorBalance[]> = {};
    (allRoboadvisorBalances || []).forEach((b) => {
      if (!latestRoboadvisorBalances[b.roboadvisorId]) latestRoboadvisorBalances[b.roboadvisorId] = [];
      latestRoboadvisorBalances[b.roboadvisorId].push(b);
    });

    roboadvisors.forEach((advisor: BankAccountRoboadvisor) => {
      const currentValue = advisor.latestCalculation?.currentValue;
      if (currentValue) {
        const value = parseFloat(String(currentValue));
        if (!isNaN(value)) {
          totalRoboadvisorValue += value;
        }
        const advisorBalances = latestRoboadvisorBalances[advisor.id] || [];
        if (advisorBalances?.length) {
          advisorBalances.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          advisorBalances.forEach((bal) => {
            if (bal.type === "deposit") {
              const amount = parseFloat(String(bal.amount));
              if (!isNaN(amount)) {
                totalRoboadvisorCost += amount;
              }
            } else if (bal.type === "withdrawal") {
              const amount = parseFloat(String(bal.amount));
              if (!isNaN(amount)) {
                totalRoboadvisorCost -= amount;
              }
            }
          });
        }
      }
    });

    return {
      liquidMoney: totalLiquid,
      investedMoney: totalCryptoValue + totalRoboadvisorValue,
      totalInvestedCost: totalCryptoCost + totalRoboadvisorCost,
      monthlyExpenses: monthlyExpenses + monthlyReceipts + monthlySubscriptions,
      monthlyInterestIncome: monthlyInterest,
      monthlyBills: monthlyExpenses,
      monthlyReceipts: monthlyReceipts,
      monthlySubscriptions: monthlySubscriptions,
      currencyCode: currency,
    };
  }, [
    allBankBalances,
    allCashBalances,
    allCryptoBalances,
    allRoboadvisorBalances,
    bankAccounts,
    roboadvisors,
    cryptoExchanges,
    bills,
    receipts,
    subscriptions,
    loadingKpis,
  ]);
}

export default useDashboardKpis;

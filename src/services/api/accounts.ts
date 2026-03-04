import api from "../httpClient";
import { withDefined } from "../../utils/request-body-utils";

export const getBankAccounts = async (limit = 100) => {
  const response = await api.post("/api/v1/bank-accounts/find", {
    limit,
    sortField: "name",
    sortOrder: "asc",
  });
  return response.data.results;
};

export const createBankAccount = async (
  name: string,
  type: string,
  taxPercentage?: number | null,
) => {
  const response = await api.post("/api/v1/bank-accounts", {
    name,
    type,
    taxPercentage,
  });
  return response.data;
};

export const updateBankAccount = async (
  id: number,
  name: string,
  type?: string,
  taxPercentage?: number | null,
) => {
  const body = withDefined({ name }, { type, taxPercentage });
  const response = await api.patch(`/api/v1/bank-accounts/${id}`, body);
  return response.data;
};

export const deleteBankAccount = async (id: number) => {
  await api.delete(`/api/v1/bank-accounts/${id}`);
};

// Bank Account Balances
export const getBankAccountBalances = async (bankAccountId?: number, limit = 100, cursor?: string) => {
  const body = withDefined(
    {
      limit,
      cursor,
      sortField: "created_at",
      sortOrder: "desc",
    },
    { bankAccountId },
  );
  const response = await api.post("/api/v1/bank-account-balances/find", body);
  return response.data;
};

export const createBankAccountBalance = async (
  bankAccountId: number,
  balance: string,
  currencyCode: string,
) => {
  const response = await api.post("/api/v1/bank-account-balances", {
    bankAccountId,
    balance,
    currencyCode,
  });
  return response.data;
};

export const updateBankAccountBalance = async (
  id: number,
  balance: string,
  currencyCode: string,
) => {
  const response = await api.patch(`/api/v1/bank-account-balances/${id}`, {
    balance,
    currencyCode,
  });
  return response.data;
};

export const deleteBankAccountBalance = async (id: number) => {
  await api.delete(`/api/v1/bank-account-balances/${id}`);
};

// Bank Account Interest Rates
export const getBankAccountInterestRates = async (bankAccountId: number, limit = 100, cursor?: string) => {
  const response = await api.post(
    "/api/v1/bank-account-interest-rates/find",
    { bankAccountId, limit, cursor, sortOrder: "desc" },
  );
  return response.data;
};

export const createBankAccountInterestRate = async (
  bankAccountId: number,
  interestRate: number,
  interestRateStartDate: string,
  interestRateEndDate?: string,
) => {
  const response = await api.post("/api/v1/bank-account-interest-rates", {
    bankAccountId,
    interestRate,
    interestRateStartDate,
    interestRateEndDate,
  });
  return response.data;
};

export const updateBankAccountInterestRate = async (
  id: number,
  interestRate: number,
  interestRateStartDate: string,
  interestRateEndDate?: string,
) => {
  const response = await api.patch(
    `/api/v1/bank-account-interest-rates/${id}`,
    { interestRate, interestRateStartDate, interestRateEndDate },
  );
  return response.data;
};

export const deleteBankAccountInterestRate = async (id: number) => {
  await api.delete(`/api/v1/bank-account-interest-rates/${id}`);
};

export default {
  getBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  getBankAccountBalances,
  createBankAccountBalance,
  updateBankAccountBalance,
  deleteBankAccountBalance,
  getBankAccountInterestRates,
  createBankAccountInterestRate,
  updateBankAccountInterestRate,
  deleteBankAccountInterestRate,
};

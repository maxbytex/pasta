import React, { useRef, useState, useEffect } from "react";
import {
  PieChart,
  WalletCards,
  Percent,
  Receipt,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  TrendingUp,

} from "lucide-react";
import ErrorBanner from "../components/common/ErrorBanner";
import { StatsCard } from "../components/StatsCard";
import { Skeleton } from "../components/Skeleton";
import { BillsHistoryCard } from "../components/dashboard/BillsHistoryCard";
import { MonthlyListCard } from "../components/dashboard/MonthlyListCard";
import { NetWorthProjectionCard } from "../components/dashboard/NetWorthProjectionCard";
import { PortfolioAllocationCard } from "../components/dashboard/PortfolioAllocationCard";
import { LiquidFlowSankeyCard } from "../components/dashboard/LiquidFlowSankeyCard";
import { useDashboardDataOptimized } from "../hooks/useDashboardDataOptimized";
import { formatCurrencyWithAlignment } from "../utils/currency-utils";
import { useInvalidateQueries } from "../hooks/useFinanceData";
import { DEFAULT_CURRENCY_CODE } from "../constants/currency-constants";

const DashboardPage: React.FC = () => {
  const { invalidateDashboardData } = useInvalidateQueries();
  const { kpis, charts, loadingKpis, loadingCharts, kpisError, chartsError } = useDashboardDataOptimized();

  useEffect(() => {
    return () => {
      // Every time user leaves the dashboard view, invalidate cache used for kpis/charts
      invalidateDashboardData();
    };
  }, [invalidateDashboardData]);

  const [visibleBillCategories, setVisibleBillCategories] = useState<Set<string>>(new Set());
  const [showTrends, setShowTrends] = useState(true);
  const hasSetInitialCategories = useRef(false);

  React.useEffect(() => {
    if (charts?.favoritedBillCategories && !hasSetInitialCategories.current) {
      setVisibleBillCategories(charts.favoritedBillCategories);
      hasSetInitialCategories.current = true;
    } else if (!hasSetInitialCategories.current && charts?.billCategories?.length) {
      setVisibleBillCategories(new Set([charts.billCategories[0]]));
      hasSetInitialCategories.current = true;
    }
  }, [charts]);

  const format = (v: number | null) => (v === null ? "N/A" : formatCurrencyWithAlignment(v, kpis?.currencyCode || DEFAULT_CURRENCY_CODE));

  const getBillColor = (c: string, index: number) => {
    void index;
    return charts?.billCategoryColors?.[c] || "#10b981";
  };

  const formatDate = (dateStr: string | number | undefined) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const month = date.toLocaleString("default", { month: "short" });
    return date.getFullYear() < now.getFullYear() ? `${month} ${date.getFullYear()}` : month;
  };

  return (
    <div className="space-y-8 bg-white dark:bg-gray-900 p-4 md:p-0">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {(kpisError || chartsError) && (
        <ErrorBanner message={"Could not retrieve data from the server. Please check your connection and try again."} />
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loadingKpis
          ? [...Array(5)].map((_, i) => (
            <div key={i} className="group relative rounded-xl p-3 flex flex-col items-center text-center overflow-hidden bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
              <div className="p-1 mb-2"><Skeleton className="w-10 h-10 rounded-full" /></div>
              <Skeleton className="w-24 h-3 mb-2" />
              <Skeleton className="w-32 h-6" />
            </div>
          ))
          : kpis && (
            <>
              <StatsCard title="Net Worth" value={format(kpis.liquidMoney + kpis.investedMoney)} icon={PieChart} color="text-emerald-700" gradientFrom="from-emerald-400" gradientTo="to-emerald-600" />
              <StatsCard title="Liquid Assets" value={format(kpis.liquidMoney)} icon={WalletCards} color="text-emerald-700" gradientFrom="from-emerald-400" gradientTo="to-emerald-600" />
              <StatsCard title="Interest Rate" value={format(kpis.monthlyInterestIncome)} icon={Percent} color="text-amber-700" gradientFrom="from-yellow-400" gradientTo="to-amber-500" />
              <StatsCard title="Total Income" value={format(charts?.liquidFlowSummary?.gained ?? 0)} icon={TrendingUp} color="text-blue-700" gradientFrom="from-blue-400" gradientTo="to-blue-600" />
              {(() => {
                const profitLoss = kpis.investedMoney - kpis.totalInvestedCost;
                const isProfit = profitLoss >= 0;
                return (
                  <StatsCard
                    title="Investments"
                    value={format(profitLoss)}
                    icon={isProfit ? TrendingUp : TrendingDown}
                    color={isProfit ? "text-emerald-700" : "text-red-700"}
                    gradientFrom={isProfit ? "from-emerald-400" : "from-red-400"}
                    gradientTo={isProfit ? "to-emerald-600" : "to-rose-500"}
                  />
                );
              })()}
            </>
          )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <NetWorthProjectionCard loadingCharts={loadingCharts} charts={charts} format={format} formatDate={formatDate} />
        <PortfolioAllocationCard loadingCharts={loadingCharts} charts={charts} format={format} />
      </div>

      <div className="grid grid-cols-1 gap-8">
        <LiquidFlowSankeyCard loadingCharts={loadingCharts} charts={charts} format={format} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {loadingKpis
          ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
          : kpis && (
            <>
              <StatsCard title="Monthly Bills" value={format(kpis.monthlyBills)} icon={Receipt} color="text-blue-700" gradientFrom="from-blue-400" gradientTo="to-indigo-500" />
              <StatsCard title="Monthly Subscriptions" value={format(kpis.monthlySubscriptions)} icon={RefreshCw} color="text-purple-700" gradientFrom="from-violet-400" gradientTo="to-purple-600" />
              <StatsCard title="Monthly Merchants" value={format(kpis.monthlyReceipts)} icon={ShoppingCart} color="text-orange-700" gradientFrom="from-orange-300" gradientTo="to-orange-500" />
            </>
          )}
      </div>

      <BillsHistoryCard
        loadingCharts={loadingCharts}
        charts={charts}
        visibleBillCategories={visibleBillCategories}
        setVisibleBillCategories={setVisibleBillCategories}
        showTrends={showTrends}
        setShowTrends={setShowTrends}
        getBillColor={getBillColor}
        format={format}
        formatDate={formatDate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlyListCard
          title="Monthly Subscriptions"
          subtitle="Fixed recurring costs"
          loading={loadingCharts}
          items={charts?.subscriptions}
          emptyLabel="No active subscriptions"
          borderClassName="border-purple-500/60"
          format={format}
        />
        <MonthlyListCard
          title="Monthly Merchants"
          subtitle="Top merchants"
          loading={loadingCharts}
          items={charts?.receipts}
          emptyLabel="No spendings this month"
          borderClassName="border-orange-500"
          format={format}
        />
      </div>
    </div>
  );
};

export default DashboardPage;

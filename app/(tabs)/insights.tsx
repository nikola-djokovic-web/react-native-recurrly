import { formatCurrency } from "@/lib/utils";
import { useSubscriptions } from "@/src/context/subscriptions";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getMonthlyPrice = (subscription: Subscription) => {
  const billing = (subscription.frequency ?? subscription.billing).toLowerCase();

  if (billing.includes("year")) {
    return subscription.price / 12;
  }

  if (billing.includes("week")) {
    return (subscription.price * 52) / 12;
  }

  return subscription.price;
};

const Insights = () => {
  const { subscriptions } = useSubscriptions();

  const insights = useMemo(() => {
    const today = dayjs().startOf("day");
    const activeSubscriptions = subscriptions.filter(
      (subscription) => subscription.status === "active",
    );
    const monthlySpend = activeSubscriptions.reduce(
      (total, subscription) => total + getMonthlyPrice(subscription),
      0,
    );
    const yearlySpend = monthlySpend * 12;
    const upcomingRenewals = activeSubscriptions
      .filter(
        (subscription) =>
          subscription.renewalDate &&
          !dayjs(subscription.renewalDate).isBefore(today, "day"),
      )
      .map((subscription) => ({
        ...subscription,
        daysLeft: dayjs(subscription.renewalDate)
          .startOf("day")
          .diff(today, "day"),
      }))
      .sort((first, second) => first.daysLeft - second.daysLeft);

    const categoryTotals = activeSubscriptions.reduce<Record<string, number>>(
      (totals, subscription) => {
        const category = subscription.category ?? "Other";
        totals[category] = (totals[category] ?? 0) + getMonthlyPrice(subscription);
        return totals;
      },
      {},
    );
    const categoryRows = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((first, second) => second.amount - first.amount);
    const statusCounts = subscriptions.reduce<Record<string, number>>(
      (counts, subscription) => {
        const status = subscription.status ?? "unknown";
        counts[status] = (counts[status] ?? 0) + 1;
        return counts;
      },
      {},
    );

    return {
      activeCount: activeSubscriptions.length,
      pausedCount: statusCounts.paused ?? 0,
      cancelledCount: statusCounts.cancelled ?? 0,
      monthlySpend,
      yearlySpend,
      categoryRows,
      upcomingRenewals: upcomingRenewals.slice(0, 5),
      nextThirtyDaysCount: upcomingRenewals.filter(
        (subscription) => subscription.daysLeft <= 30,
      ).length,
      topSubscriptions: [...activeSubscriptions]
        .sort(
          (first, second) => getMonthlyPrice(second) - getMonthlyPrice(first),
        )
        .slice(0, 4),
    };
  }, [subscriptions]);

  const highestCategoryAmount = Math.max(
    ...insights.categoryRows.map((row) => row.amount),
    1,
  );

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
      >
        <View className="insights-header">
          <Text className="insights-title">Insights</Text>
          <Text className="insights-subtitle">
            Spend, renewals, and subscription health.
          </Text>
        </View>

        <View className="insights-stat-row">
          <View className="insights-stat-card insights-stat-primary">
            <Text className="insights-stat-label">Monthly spend</Text>
            <Text className="insights-stat-value">
              {formatCurrency(insights.monthlySpend)}
            </Text>
          </View>
          <View className="insights-stat-card">
            <Text className="insights-stat-label">Yearly estimate</Text>
            <Text className="insights-stat-value">
              {formatCurrency(insights.yearlySpend)}
            </Text>
          </View>
        </View>

        <View className="insights-stat-row">
          <View className="insights-stat-card">
            <Text className="insights-stat-label">Active</Text>
            <Text className="insights-stat-value">{insights.activeCount}</Text>
          </View>
          <View className="insights-stat-card">
            <Text className="insights-stat-label">Next 30 days</Text>
            <Text className="insights-stat-value">
              {insights.nextThirtyDaysCount}
            </Text>
          </View>
        </View>

        <View className="insights-section">
          <Text className="insights-section-title">Spend by Category</Text>
          {insights.categoryRows.map((row) => (
            <View className="insights-bar-row" key={row.category}>
              <View className="insights-bar-copy">
                <Text className="insights-bar-label">{row.category}</Text>
                <Text className="insights-bar-value">
                  {formatCurrency(row.amount)}
                </Text>
              </View>
              <View className="insights-bar-track">
                <View
                  className="insights-bar-fill"
                  style={{
                    width: `${Math.max((row.amount / highestCategoryAmount) * 100, 8)}%`,
                  }}
                />
              </View>
            </View>
          ))}
        </View>

        <View className="insights-section">
          <Text className="insights-section-title">Renewal Timeline</Text>
          {insights.upcomingRenewals.map((subscription) => (
            <View className="insights-list-row" key={subscription.id}>
              <View className="insights-list-copy">
                <Text className="insights-list-title" numberOfLines={1}>
                  {subscription.name}
                </Text>
                <Text className="insights-list-meta">
                  {subscription.daysLeft === 0
                    ? "Due today"
                    : `${subscription.daysLeft} days left`}
                </Text>
              </View>
              <Text className="insights-list-price">
                {formatCurrency(subscription.price, subscription.currency)}
              </Text>
            </View>
          ))}
        </View>

        <View className="insights-section">
          <Text className="insights-section-title">Largest Subscriptions</Text>
          {insights.topSubscriptions.map((subscription) => (
            <View className="insights-list-row" key={subscription.id}>
              <View className="insights-list-copy">
                <Text className="insights-list-title" numberOfLines={1}>
                  {subscription.name}
                </Text>
                <Text className="insights-list-meta">
                  {subscription.category ?? "Other"}
                </Text>
              </View>
              <Text className="insights-list-price">
                {formatCurrency(getMonthlyPrice(subscription))}
              </Text>
            </View>
          ))}
        </View>

        <View className="insights-section">
          <Text className="insights-section-title">Subscription Health</Text>
          <View className="insights-health-row">
            <Text className="insights-health-label">Paused</Text>
            <Text className="insights-health-value">{insights.pausedCount}</Text>
          </View>
          <View className="insights-health-row">
            <Text className="insights-health-label">Cancelled</Text>
            <Text className="insights-health-value">
              {insights.cancelledCount}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Insights;

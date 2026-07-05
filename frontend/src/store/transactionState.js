export function buildDashboardState(previousTransactions, dashboardPayload) {
  return {
    transactions: previousTransactions,
    recentTransactions: dashboardPayload?.recent_transactions ?? [],
  };
}

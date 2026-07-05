export function buildCategorySpendingChartData(expenseCategories = []) {
  if (!Array.isArray(expenseCategories) || expenseCategories.length === 0) {
    return [];
  }

  return expenseCategories.map((item) => ({
    name: item?.category ?? 'General',
    value: Number(item?.amount ?? 0),
    color: item?.color ?? '#60a5fa',
  }));
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCategorySpendingChartData } from './dashboardCategoryData.js';

test('buildCategorySpendingChartData maps backend expense categories to chart points', () => {
  const categories = [
    { category: 'Makanan', amount: 120000, percentage: 60, color: '#ef4444' },
    { category: 'Transport', amount: 80000, percentage: 40, color: '#3b82f6' },
  ];

  const result = buildCategorySpendingChartData(categories);

  assert.deepEqual(result, [
    { name: 'Makanan', value: 120000, color: '#ef4444' },
    { name: 'Transport', value: 80000, color: '#3b82f6' },
  ]);
});

test('buildCategorySpendingChartData returns an empty array for empty payloads', () => {
  assert.deepEqual(buildCategorySpendingChartData([]), []);
  assert.deepEqual(buildCategorySpendingChartData(null), []);
});

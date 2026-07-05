import test from 'node:test';
import assert from 'node:assert/strict';
import { getDashboardMetricValue } from './dashboardMetrics.js';

test('getDashboardMetricValue reads numeric values from dashboard payload', () => {
  const payload = {
    header: { balance: 2500000 },
    statistics: {
      monthly_income: { value: 5000000 },
      monthly_expense: { value: 1800000 },
      financial_health_score: { value: 82 },
    },
  };

  assert.equal(getDashboardMetricValue(payload, ['statistics', 'monthly_income', 'value']), 5000000);
  assert.equal(getDashboardMetricValue(payload, ['header', 'balance']), 2500000);
});

test('getDashboardMetricValue parses formatted strings when needed', () => {
  const payload = {
    statistics: {
      monthly_expense: { formatted_value: 'Rp 1.800.000' },
    },
  };

  assert.equal(getDashboardMetricValue(payload, ['statistics', 'monthly_expense', 'formatted_value']), 1800000);
});

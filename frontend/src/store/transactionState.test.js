import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboardState } from './transactionState.js';

test('dashboard refresh keeps the full transaction list intact and stores recent transactions separately', () => {
  const previousTransactions = [{ id: 1, description: 'full list' }];
  const dashboardPayload = {
    recent_transactions: [{ id: 2, description: 'recent' }],
  };

  const state = buildDashboardState(previousTransactions, dashboardPayload);

  assert.deepEqual(state.transactions, previousTransactions);
  assert.deepEqual(state.recentTransactions, dashboardPayload.recent_transactions);
});

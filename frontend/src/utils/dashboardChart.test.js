import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCashflowChartData } from './dashboardChart.js';

test('buildCashflowChartData maps backend cashflow values into chart points', () => {
  const input = [
    { date: '2026-07-01', income: 100000, expense: 50000, net: 50000 },
    { date: '2026-07-02', income: 200000, expense: 80000, net: 120000 },
  ];

  const result = buildCashflowChartData(input);

  assert.deepEqual(result, [
    { date: '1 Jul', Pemasukan: 100000, Pengeluaran: 50000 },
    { date: '2 Jul', Pemasukan: 200000, Pengeluaran: 80000 },
  ]);
});

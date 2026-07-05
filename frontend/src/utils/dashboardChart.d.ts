export interface CashflowPoint {
  date: string;
  Pemasukan: number;
  Pengeluaran: number;
}

export function buildCashflowChartData(cashflow?: Array<{ date: string; income?: number; expense?: number; net?: number }> | null): CashflowPoint[];

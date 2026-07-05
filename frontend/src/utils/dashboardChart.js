export function buildCashflowChartData(cashflow = []) {
  return (cashflow || []).map((item) => {
    const [year, month, day] = String(item.date || '').split('-');
    const formattedDate = year && month && day
      ? new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : String(item.date || '');

    return {
      date: formattedDate,
      Pemasukan: Number(item.income || 0),
      Pengeluaran: Number(item.expense || 0),
    };
  });
}

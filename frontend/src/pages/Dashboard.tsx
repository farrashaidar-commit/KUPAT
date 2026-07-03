import { useEffect } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { useAuthStore } from '../store/useAuthStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { 
    transactions, 
    healthScore, 
    insights, 
    fetchTransactions, 
    fetchHealthScore, 
    fetchInsights 
  } = useFinancialStore();

  useEffect(() => {
    fetchTransactions();
    fetchHealthScore();
    fetchInsights();
  }, []);

  // Format Recharts data based on transactions of the current month
  const chartData = transactions
    .slice()
    .reverse()
    .reduce((acc: any[], t) => {
      const date = new Date(t.transaction_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const amount = Number(t.amount);
      const existing = acc.find(item => item.date === date);

      if (existing) {
        if (t.type === 'income') {
          existing.Pemasukan += amount;
        } else {
          existing.Pengeluaran += amount;
        }
      } else {
        acc.push({
          date,
          Pemasukan: t.type === 'income' ? amount : 0,
          Pengeluaran: t.type === 'expense' ? amount : 0
        });
      }
      return acc;
    }, [])
    .slice(-7); // take last 7 data points

  return (
    <div className="space-y-6">
      {/* Top Welcome & Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Total Aset / Saldo</p>
            <h3 className="text-2xl font-bold mt-1 text-white">Rp {user ? Number(user.balance).toLocaleString('id-ID') : '0'}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pemasukan Bulan Ini</p>
            <h3 className="text-2xl font-bold mt-1 text-emerald-400">Rp {insights ? Number(insights.total_income).toLocaleString('id-ID') : '0'}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Pengeluaran Bulan Ini</p>
            <h3 className="text-2xl font-bold mt-1 text-rose-400">Rp {insights ? Number(insights.total_expense).toLocaleString('id-ID') : '0'}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 border border-rose-500/20">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Budget Health score */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Skor Kesehatan Anggaran</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-2xl font-bold text-white">{healthScore ? healthScore.score : '100'}</h3>
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium border"
                style={{ 
                  color: healthScore?.color || '#22c55e', 
                  borderColor: (healthScore?.color || '#22c55e') + '30',
                  backgroundColor: (healthScore?.color || '#22c55e') + '10' 
                }}
              >
                {healthScore ? healthScore.status : 'Excellent'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart Card */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Analisis Arus Kas Terkini</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `Rp ${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111928', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Smart Insights Sidebar */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Rekomendasi & Analisis AI</h4>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {insights && insights.insights.length > 0 ? (
                insights.insights.map((insight: any, idx: number) => {
                  const Icon = insight.type === 'success' 
                    ? CheckCircle 
                    : insight.type === 'danger' 
                      ? ShieldAlert 
                      : insight.type === 'warning' 
                        ? AlertTriangle 
                        : Info;

                  const colorClass = insight.type === 'success' 
                    ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' 
                    : insight.type === 'danger' 
                      ? 'text-rose-400 bg-rose-500/5 border-rose-500/10' 
                      : 'text-amber-400 bg-amber-500/5 border-amber-500/10';

                  return (
                    <div key={idx} className={`p-4 rounded-xl border flex gap-3 ${colorClass}`}>
                      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="text-sm font-semibold">{insight.title}</span>
                        <p className="text-xs text-gray-300 leading-relaxed">{insight.message}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Belum ada analisis finansial terkumpul.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl space-y-4">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Transaksi Terbaru</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-400">
                <th className="py-3 font-semibold">Tanggal</th>
                <th className="py-3 font-semibold">Deskripsi</th>
                <th className="py-3 font-semibold">Kategori</th>
                <th className="py-3 font-semibold">Tipe</th>
                <th className="py-3 font-semibold text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50">
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="text-gray-200">
                  <td className="py-3">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 font-medium">{t.description || 'Tidak ada deskripsi'}</td>
                  <td className="py-3">
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{ 
                        backgroundColor: (t.category?.color || '#3b82f6') + '20', 
                        color: t.category?.color || '#3b82f6' 
                      }}
                    >
                      {t.category?.name || 'Umum'}
                    </span>
                  </td>
                  <td className="py-3 uppercase font-semibold text-xs">
                    <span className={t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                      {t.type === 'income' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    Belum ada transaksi tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

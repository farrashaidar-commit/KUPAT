import { useEffect } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { useAuthStore } from '../store/useAuthStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import QuickActions from '../components/QuickActions';
import EmptyState from '../components/EmptyState';
import BudgetProgress from '../components/BudgetProgress';
import InsightCard from '../components/InsightCard';
import { buildCashflowChartData } from '../utils/dashboardChart';
import { buildCategorySpendingChartData } from '../utils/dashboardCategoryData';
import { getDashboardMetricValue } from '../utils/dashboardMetrics';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { dashboardData, fetchDashboard } = useFinancialStore();

  // Fetch dashboard on mount and when user changes (re-login)
  // Force refresh to ensure fresh data when navigating back to this page
  useEffect(() => {
    // Always force refresh to get latest data when component mounts
    // This ensures data is fresh when navigating back from other pages
    fetchDashboard(true);
  }, [user?.id]);

  const incomeValue = getDashboardMetricValue(dashboardData, ['statistics', 'monthly_income', 'value'], Number(user?.balance ?? 0));
  const expenseValue = getDashboardMetricValue(dashboardData, ['statistics', 'monthly_expense', 'value'], 0);
  const healthValue = getDashboardMetricValue(dashboardData, ['statistics', 'financial_health_score', 'value'], getDashboardMetricValue(dashboardData, ['financial_health', 'score'], 0));
  const balanceValue = getDashboardMetricValue(dashboardData, ['header', 'balance'], getDashboardMetricValue(dashboardData, ['statistics', 'total_balance', 'value'], user ? Number(user.balance) : 0));
  const budgetProgressData = dashboardData?.budget_progress ?? {
    monthly_budget: 0,
    used_budget: 0,
    remaining_budget: 0,
    usage_percentage: 0,
    remaining_days: 0,
  };
  const quickInsightItems = dashboardData?.ai_insights ?? [];
  const recentTransactions = dashboardData?.recent_transactions ?? [];
  const chartData = buildCashflowChartData(dashboardData?.cashflow ?? []);
  const categoryChartData = buildCategorySpendingChartData(dashboardData?.expense_categories ?? []);

  const getLocalGreeting = () => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    // Ranges (minutes since midnight):
    // Good Morning: 05:00 – 11:59 => 300 - 719
    // Good Afternoon: 12:00 – 16:59 => 720 - 1019
    // Good Evening: 17:00 – 20:59 => 1020 - 1259
    // Good Night: 21:00 – 04:59 => >=1260 or <300
    if (minutes >= 300 && minutes <= 719) return 'Good Morning';
    if (minutes >= 720 && minutes <= 1019) return 'Good Afternoon';
    if (minutes >= 1020 && minutes <= 1259) return 'Good Evening';
    return 'Good Night';
  };

  return (
    <div className="space-y-6">
      {/* Greeting + Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">{dashboardData?.header?.greeting ?? getLocalGreeting()}, {user?.name || 'User'}</h2>
          <p className="text-sm text-gray-400 mt-1">{dashboardData?.header?.today ?? `Here's your financial overview today — ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}`}</p>
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Aset / Saldo" value={balanceValue} icon={DollarSign} color="emerald" />
        <StatCard title="Pemasukan Bulan Ini" value={incomeValue} icon={TrendingUp} color="emerald" />
        <StatCard title="Pengeluaran Bulan Ini" value={expenseValue} icon={TrendingDown} color="rose" />
        <StatCard title="Skor Kesehatan Anggaran" value={healthValue} prefix="" suffix="%" icon={Activity} color="indigo" />
      </div>

      {/* Main Charts & Widgets Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Chart Card */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Analisis Arus Kas Terkini</h4>
          <div className="h-80 w-full bg-gradient-to-b from-white/2 via-white/1 to-transparent rounded-xl p-2">
            {chartData.length === 0 ? (
              <EmptyState title="No financial data yet" description="Start adding your first transaction to unlock insights." actionLabel="Add Transaction" onAction={() => {}} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.28}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#121827" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickFormatter={(v) => `Rp ${v / 1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0b1220', borderColor: '#111827', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="Pemasukan" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Pengeluaran" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Smart Insights Sidebar */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Rekomendasi & Analisis AI</h4>
              <span className="text-xs text-gray-400">Status: <strong className="ml-1 text-white">Live</strong></span>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {quickInsightItems.length > 0 ? (
                quickInsightItems.map((insight: any, idx: number) => (
                  <InsightCard key={idx} insight={insight} />
                ))
              ) : (
                <EmptyState title="No insights yet" description="AI will analyze your transactions and surface recommendations here." actionLabel="Run Analysis" onAction={fetchDashboard} />
              )}
            </div>
            <div className="mt-4">
              <button className="w-full px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">View Full Analysis</button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Table */}
        <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Transaksi Terbaru</h4>
            <div className="text-sm text-gray-400">Showing {Math.min(5, recentTransactions.length)} of {recentTransactions.length}</div>
          </div>

          {recentTransactions.length === 0 ? (
            <EmptyState title="No transactions yet." description="Create your first transaction to see activity here." actionLabel="Create Transaction" onAction={() => {}} />
          ) : (
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
                  {recentTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id} className="text-gray-200 hover:bg-[#081122] transition-colors">
                      <td className="py-3 text-sm">{new Date(t.transaction_date).toLocaleDateString('id-ID')}</td>
                      <td className="py-3 font-medium text-sm">{t.description || 'No description'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full" style={{ background: (t.category?.color || '#3b82f6') }} />
                          <span className="px-2 py-0.5 rounded-full text-xs text-white/90" style={{ backgroundColor: (t.category?.color || '#3b82f6') + '20' }}>{t.category?.name || 'General'}</span>
                        </div>
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
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right-side: Category Donut + Budget Progress */}
        <div className="space-y-6">
          <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Spending by Category</h4>
            <div className="h-48">
              {categoryChartData.length === 0 ? (
                <EmptyState title="No categories yet" description="Transactions will populate this chart." actionLabel="Add Transaction" onAction={() => {}} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={categoryChartData} innerRadius={50} outerRadius={80} paddingAngle={4}>
                      {categoryChartData.map((entry: any, index: number) => (
                        <Cell key={`${entry.name}-${index}`} fill={entry.color || ['#60a5fa','#34d399','#f87171','#fbbf24','#a78bfa','#f472b6'][index % 6]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" wrapperStyle={{ color: '#9ca3af' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl">
            <BudgetProgress items={[
              { label: 'Monthly Budget', value: budgetProgressData.monthly_budget, max: Math.max(budgetProgressData.monthly_budget, 1), color: 'linear-gradient(90deg,#06b6d4,#06b6d4)' },
              { label: 'Used Budget', value: budgetProgressData.used_budget, max: Math.max(budgetProgressData.monthly_budget, 1), color: 'linear-gradient(90deg,#10b981,#34d399)' },
              { label: 'Remaining Budget', value: budgetProgressData.remaining_budget, max: Math.max(budgetProgressData.monthly_budget, 1), color: 'linear-gradient(90deg,#f97316,#fb923c)' }
            ]} />
          </div>
        </div>
      </div>
    </div>
  );
}

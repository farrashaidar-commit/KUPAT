import { useEffect, useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { Plus, Trash2, Landmark, AlertCircle } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Budgets() {
  const { 
    budgets, 
    categories, 
    healthScore,
    fetchBudgets, 
    fetchCategories, 
    fetchHealthScore,
    createBudget, 
    deleteBudget 
  } = useFinancialStore();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10)); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)); // +30 days
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchHealthScore();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId || !amount || Number(amount) <= 0) return;

    try {
      await createBudget({
        category_id: Number(categoryId),
        amount: Number(amount),
        period: 'monthly',
        start_date: startDate,
        end_date: endDate
      });
      setAmount('');
      setCategoryId('');
      setShowAddForm(false);
    } catch (e) {
      alert('Gagal menambah anggaran');
    }
  };

  // Find health score progress detail for this category if any
  const getProgressForCategory = (catId: number) => {
    const detail = healthScore?.details.find(d => d.category_id === catId);
    return detail || null;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header and Add Button */}
      <div className="flex justify-between items-center-center">
        <div className="flex flex-col space-y-1">
          <h3 className="text-xl font-semibold text-gray-200">Batas Anggaran Kategori</h3>
          <p className="text-xs text-gray-400">Atur batasan anggaran bulanan agar pengeluaran tetap sehat.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Atur Anggaran
        </button>
      </div>

      {/* Add Budget Form Card */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl space-y-4 max-w-xl">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Tentukan Batasan Anggaran</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Kategori Pengeluaran</label>
              <CustomSelect
                value={categoryId}
                onChange={(val) => setCategoryId(String(val))}
                options={[{ value: '', label: 'Pilih Kategori' },
                  ...categories
                    .filter(c => c.type === 'expense')
                    .map((c) => ({ value: c.id, label: c.name }))
                ]}
                placeholder="Pilih Kategori"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Jumlah Limit (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                placeholder="500000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Mulai</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal Berakhir</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="bg-transparent hover:bg-gray-800 text-gray-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-[#1e293b]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Simpan Anggaran
            </button>
          </div>
        </form>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b) => {
          const detail = getProgressForCategory(b.category_id);
          const percent = detail ? detail.percentage : 0;
          const spent = detail ? detail.spent : 0;
          const isOver = spent > b.amount;

          return (
            <div key={b.id} className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl flex flex-col justify-between space-y-4">
              <div>
                {/* Header Category details */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: b.category?.color || '#3b82f6' }}
                    >
                      <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-200">{b.category?.name || 'Anggaran'}</h4>
                      <p className="text-xs text-gray-400">{b.period}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteBudget(b.id)}
                    className="text-red-400 hover:bg-red-500/5 hover:text-red-300 p-1.5 rounded-lg border border-transparent hover:border-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Amount limits progress details */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs font-medium text-gray-400">
                    <span>Terpakai: Rp {spent.toLocaleString('id-ID')}</span>
                    <span>Limit: Rp {Number(b.amount).toLocaleString('id-ID')}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#111928] rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : 'bg-indigo-500'}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-semibold">{percent}% terpakai</span>
                    {isOver && (
                      <span className="flex items-center gap-1 text-rose-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Melebihi limit!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates indicator */}
              <div className="text-[11px] text-gray-500 border-t border-[#1e293b] pt-3">
                Aktif: {new Date(b.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(b.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <div className="col-span-full bg-[#0d1322] border border-[#1e293b] py-12 rounded-2xl text-center text-gray-400 text-sm">
            Belum ada batasan anggaran pengolahan yang ditentukan. Klik "Atur Anggaran" di atas.
          </div>
        )}
      </div>
    </div>
  );
}

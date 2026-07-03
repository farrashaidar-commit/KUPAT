import { useEffect, useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function Transactions() {
  const { 
    transactions, 
    categories, 
    fetchTransactions, 
    fetchCategories, 
    createTransaction, 
    deleteTransaction
  } = useFinancialStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:mm
  const [showAddForm, setShowAddForm] = useState(false);

  // Filters state
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleApplyFilters = () => {
    const filters: any = {};
    if (typeFilter) filters.type = typeFilter;
    if (catFilter) filters.category_id = catFilter;
    fetchTransactions(filters);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    try {
      await createTransaction({
        amount: Number(amount),
        type,
        category_id: categoryId ? Number(categoryId) : null,
        description,
        transaction_date: date.replace('T', ' ') + ':00' // Format: YYYY-MM-DD HH:mm:ss
      });
      // Reset form
      setAmount('');
      setDescription('');
      setCategoryId('');
      setShowAddForm(false);
    } catch (e) {
      alert('Gagal menambah transaksi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-200">Daftar Transaksi</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Catat Transaksi
        </button>
      </div>

      {/* Write transaction form overlay/card */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl space-y-4 max-w-xl">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Catat Transaksi Finansial Baru</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Jumlah (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="expense">Pengeluaran (Keluar)</option>
                <option value="income">Pendapatan (Masuk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal & Waktu</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              placeholder="Catatan kecil pengeluaran/pemasukan..."
            />
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
              Simpan Transaksi
            </button>
          </div>
        </form>
      )}

      {/* Filters bar */}
      <div className="bg-[#0d1322] border border-[#1e293b] p-5 rounded-2xl flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Filter Tipe</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#111928] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200"
          >
            <option value="">Semua Tipe</option>
            <option value="income">Pendapatan</option>
            <option value="expense">Pengeluaran</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Filter Kategori</label>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="bg-[#111928] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200"
          >
            <option value="">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleApplyFilters}
          className="bg-gray-800 hover:bg-gray-700 border border-[#1e293b] text-gray-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Terapkan
        </button>
      </div>

      {/* Transaction List Card */}
      <div className="bg-[#0d1322] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#1e293b] text-gray-400 bg-[#0a0f1d]/50">
                <th className="py-4 px-6 font-semibold">Transaksi</th>
                <th className="py-4 px-6 font-semibold">Tipe</th>
                <th className="py-4 px-6 font-semibold">Kategori</th>
                <th className="py-4 px-6 font-semibold">Tanggal</th>
                <th className="py-4 px-6 font-semibold text-right">Jumlah</th>
                <th className="py-4 px-6 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/50">
              {transactions.map((t) => (
                <tr key={t.id} className="text-gray-200 hover:bg-[#111928]/35 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                        t.type === 'income' 
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                          : 'bg-rose-500/5 text-rose-400 border-rose-500/10'
                      }`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-200">{t.description || 'Tanpa Nama'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 uppercase font-semibold text-xs">
                    <span className={t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}>
                      {t.type === 'income' ? 'Masuk' : 'Keluar'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
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
                  <td className="py-4 px-6 text-gray-400">{new Date(t.transaction_date).toLocaleString('id-ID')}</td>
                  <td className={`py-4 px-6 text-right font-semibold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {t.type === 'income' ? '+' : '-'} Rp {Number(t.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-colors"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Tidak ada catatan transaksi finansial ditemukan.
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

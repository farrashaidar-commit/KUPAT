import { useEffect, useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, Pencil } from 'lucide-react';

export default function Transactions() {
  const { 
    transactions, 
    transactionPagination,
    categories, 
    fetchTransactions, 
    fetchCategories, 
    createTransaction, 
    updateTransaction,
    deleteTransaction
  } = useFinancialStore();

  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 16)); // YYYY-MM-DDTHH:mm
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Filters state
  const [typeFilter, setTypeFilter] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('transaction_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState('20');

  const activeFilters = {
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(catFilter ? { category_id: catFilter } : {}),
    ...(searchTerm ? { search: searchTerm } : {}),
    sort_by: sortBy,
    sort_order: sortOrder,
    page: currentPage,
    per_page: perPage,
  };

  useEffect(() => {
    fetchTransactions(activeFilters);
    fetchCategories();
  }, []);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTransactions({
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(catFilter ? { category_id: catFilter } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1,
      per_page: perPage,
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (transactionPagination && page > transactionPagination.last_page)) {
      return;
    }
    setCurrentPage(page);
    fetchTransactions({
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(catFilter ? { category_id: catFilter } : {}),
      ...(searchTerm ? { search: searchTerm } : {}),
      sort_by: sortBy,
      sort_order: sortOrder,
      page,
      per_page: perPage,
    });
  };

  const handleCancel = () => {
    setAmount('');
    setDescription('');
    setCategoryId('');
    setEditingTransaction(null);
    setShowAddForm(false);
    setValidationErrors({});
  };

  const handleEditClick = (t: any) => {
    setEditingTransaction(t);
    setAmount(t.amount.toString());
    setType(t.type);
    setCategoryId(t.category_id ? t.category_id.toString() : '');
    setDescription(t.description || '');
    try {
      const isoDate = new Date(t.transaction_date.replace(' ', 'T')).toISOString().substring(0, 16);
      setDate(isoDate);
    } catch {
      setDate(new Date(t.transaction_date).toISOString().substring(0, 16));
    }
    setShowAddForm(true);
    setValidationErrors({});
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setValidationErrors({ amount: ['Jumlah transaksi harus lebih besar dari 0.'] });
      return;
    }

    setIsSaving(true);
    setValidationErrors({});
    try {
      const payload = {
        amount: Number(amount),
        type,
        category_id: categoryId ? Number(categoryId) : null,
        description,
        transaction_date: date.replace('T', ' ') + ':00' // Format: YYYY-MM-DD HH:mm:ss
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload, {
          ...(typeFilter ? { type: typeFilter } : {}),
          ...(catFilter ? { category_id: catFilter } : {}),
          ...(searchTerm ? { search: searchTerm } : {}),
          sort_by: sortBy,
          sort_order: sortOrder,
          page: currentPage,
          per_page: perPage,
        });
      } else {
        await createTransaction(payload, {
          ...(typeFilter ? { type: typeFilter } : {}),
          ...(catFilter ? { category_id: catFilter } : {}),
          ...(searchTerm ? { search: searchTerm } : {}),
          sort_by: sortBy,
          sort_order: sortOrder,
          page: currentPage,
          per_page: perPage,
        });
      }
      // Reset form
      handleCancel();
    } catch (err: any) {
      if (err.errors) {
        setValidationErrors(err.errors);
      } else {
        setValidationErrors({ general: [err.message || 'Gagal menyimpan transaksi'] });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Add Button */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-200">Daftar Transaksi</h3>
        <button
          onClick={() => {
            if (showAddForm) {
              handleCancel();
            } else {
              setShowAddForm(true);
            }
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Catat Transaksi
        </button>
      </div>

      {/* Write transaction form overlay/card */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl space-y-4 max-w-xl">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            {editingTransaction ? 'Ubah Transaksi Finansial' : 'Catat Transaksi Finansial Baru'}
          </h4>
          
          {validationErrors.general && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl">
              {validationErrors.general[0]}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Jumlah (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={isSaving}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                placeholder="100000"
              />
              {validationErrors.amount && (
                <p className="text-rose-400 text-xs mt-1">{validationErrors.amount[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Tipe</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'income' | 'expense')}
                disabled={isSaving}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="expense">Pengeluaran (Keluar)</option>
                <option value="income">Pendapatan (Masuk)</option>
              </select>
              {validationErrors.type && (
                <p className="text-rose-400 text-xs mt-1">{validationErrors.type[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isSaving}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type === 'income' ? 'Masuk' : 'Keluar'})
                  </option>
                ))}
              </select>
              {validationErrors.category_id && (
                <p className="text-rose-400 text-xs mt-1">{validationErrors.category_id[0]}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Tanggal & Waktu</label>
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                disabled={isSaving}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              />
              {validationErrors.transaction_date && (
                <p className="text-rose-400 text-xs mt-1">{validationErrors.transaction_date[0]}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">Deskripsi</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              placeholder="Catatan kecil pengeluaran/pemasukan..."
            />
            {validationErrors.description && (
              <p className="text-rose-400 text-xs mt-1">{validationErrors.description[0]}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end mt-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-transparent hover:bg-gray-800 text-gray-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-[#1e293b] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Menyimpan...' : editingTransaction ? 'Simpan Perubahan' : 'Simpan Transaksi'}
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

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Cari</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Deskripsi atau kategori..."
            className="bg-[#111928] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Urutkan</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#111928] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200"
          >
            <option value="transaction_date">Tanggal</option>
            <option value="amount">Jumlah</option>
            <option value="type">Tipe</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Arah</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="bg-[#111928] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200"
          >
            <option value="desc">Baru ke Lama</option>
            <option value="asc">Lama ke Baru</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Per Halaman</label>
          <select
            value={perPage}
            onChange={(e) => setPerPage(e.target.value)}
            className="bg-[#111928] border border-[#1e293b] rounded-lg px-3 py-1.5 text-xs text-gray-200"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
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
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="text-indigo-400 hover:text-indigo-300 p-1.5 rounded-lg hover:bg-indigo-500/5 border border-transparent hover:border-indigo-500/10 transition-colors"
                        title="Ubah Transaksi"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                            deleteTransaction(t.id, activeFilters);
                          }
                        }}
                        className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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

      {transactionPagination && transactionPagination.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4">
          <div className="text-sm text-gray-400">
            Menampilkan halaman {transactionPagination.current_page} dari {transactionPagination.last_page}, total {transactionPagination.total} transaksi.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-[#1e293b] text-gray-200 bg-[#111928] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={transactionPagination && currentPage >= transactionPagination.last_page}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-[#1e293b] text-gray-200 bg-[#111928] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

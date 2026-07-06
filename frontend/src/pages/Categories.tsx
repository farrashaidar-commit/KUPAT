import { useEffect, useState } from 'react';
import { useFinancialStore } from '../store/useFinancialStore';
import { Plus, Trash2, Tag } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Categories() {
  const { categories, fetchCategories, createCategory, deleteCategory } = useFinancialStore();

  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [color, setColor] = useState('#8b5cf6');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      await createCategory({ name, type, color, icon: 'tag' });
      setName('');
      setShowAddForm(false);
    } catch (e) {
      alert('Gagal menambah kategori');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header and Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col space-y-1">
          <h3 className="text-xl font-semibold text-gray-200">Kategori Catatan</h3>
          <p className="text-xs text-gray-400">Atur kategori pemasukan dan pengeluaran sesuai preferensi Anda.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Kategori Baru
        </button>
      </div>

      {/* Add Category Form Card */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl space-y-4 max-w-xl">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Buat Kategori Kredensial Baru</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Nama Kategori</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                placeholder="Makanan, Transportasi, Gaji, dll"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Tipe Kategori</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(String(val) as 'income' | 'expense')}
                options={[
                  { value: 'expense', label: 'Pengeluaran (Expense)' },
                  { value: 'income', label: 'Pendapatan (Income)' },
                ]}
                placeholder="Tipe Kategori"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Warna Topik</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-[#111928] border border-[#1e293b] rounded-xl px-3 py-2 text-sm text-gray-200 w-24 focus:outline-none focus:border-indigo-500"
                />
              </div>
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
              Simpan Kategori
            </button>
          </div>
        </form>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-[#0d1322] border border-[#1e293b] p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-start">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                style={{ backgroundColor: c.color }}
              >
                <Tag className="w-5 h-5" />
              </div>
              <button
                onClick={() => deleteCategory(c.id)}
                className="text-red-400 hover:bg-red-500/5 hover:text-red-300 p-1 rounded transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <h5 className="font-semibold text-sm text-gray-200 truncate">{c.name}</h5>
              <span className={`text-[10px] uppercase font-semibold tracking-wider ${c.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {c.type === 'income' ? 'Masuk' : 'Keluar'}
              </span>
            </div>
          </div>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full bg-[#0d1322] border border-[#1e293b] py-8 rounded-xl text-center text-gray-400 text-sm">
            Kategori belum didefinisikan. Silakan buat yang baru.
          </div>
        )}
      </div>
    </div>
  );
}

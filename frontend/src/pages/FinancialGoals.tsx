import { useEffect, useMemo, useState } from 'react';
import { Plus, Target, Trash2, Edit3, Eye, CalendarDays } from 'lucide-react';
import { useFinancialStore } from '../store/useFinancialStore';
import CustomSelect from '../components/CustomSelect';

export default function FinancialGoals() {
  const {
    financialGoals,
    fetchFinancialGoals,
    createFinancialGoal,
    updateFinancialGoal,
    deleteFinancialGoal,
    isLoading,
  } = useFinancialStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    deadline: '',
    description: '',
    status: 'active' as 'active' | 'completed',
  });

  useEffect(() => {
    fetchFinancialGoals();
  }, [fetchFinancialGoals]);

  useEffect(() => {
    if (!financialGoals || financialGoals.length === 0) return;
    console.groupCollapsed('FinancialGoals raw deadlines');
    financialGoals.forEach((g: any) => {
      console.log(`goal ${g.id} - ${g.name} - raw deadline:`, g.deadline);
    });
    console.groupEnd();
  }, [financialGoals]);

  const formatGoalDeadline = (deadline: string | null) => {
    if (!deadline) {
      return 'Tanpa deadline';
    }

    const rawValue = String(deadline).trim();

    if (!rawValue) {
      return 'Tanpa deadline';
    }

    const normalizedValue = rawValue.includes('T') ? rawValue.split('T')[0] : rawValue;
    const dateParts = normalizedValue.split(/[-/]/).map((part) => part.trim());

    if (dateParts.length === 3) {
      const [yearPart, monthPart, dayPart] = dateParts;
      const year = Number(yearPart);
      const month = Number(monthPart);
      const day = Number(dayPart);

      if (Number.isInteger(year) && Number.isInteger(month) && Number.isInteger(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${day} ${monthNames[month - 1]} ${year}`;
      }
    }

    return 'Tanggal tidak valid';
  };

  const resetForm = () => {
    setForm({
      name: '',
      target_amount: '',
      current_amount: '',
      deadline: '',
      description: '',
      status: 'active',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: form.name,
      target_amount: Number(form.target_amount),
      current_amount: Number(form.current_amount || 0),
      deadline: form.deadline || null,
      description: form.description || null,
      status: form.status,
    };

    try {
      if (editingId) {
        await updateFinancialGoal(editingId, payload);
      } else {
        await createFinancialGoal(payload);
      }
      resetForm();
    } catch (error) {
      alert('Gagal menyimpan financial goal');
    }
  };

  const stats = useMemo(() => {
    const totalTarget = financialGoals.reduce((sum, goal) => sum + Number(goal.target_amount || 0), 0);
    const totalCurrent = financialGoals.reduce((sum, goal) => sum + Number(goal.current_amount || 0), 0);
    const completed = financialGoals.filter((goal) => goal.status === 'completed').length;

    return {
      totalTarget,
      totalCurrent,
      completed,
      progress: totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0,
    };
  }, [financialGoals]);

  const openEdit = (goal: any) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      deadline: goal.deadline || '',
      description: goal.description || '',
      status: goal.status,
    });
    setShowForm(true);
  };

  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickGoal, setQuickGoal] = useState<any>(null);
  const [quickAmount, setQuickAmount] = useState('');

  const openQuickAddModal = (goal: any) => {
    setQuickGoal(goal);
    setQuickAmount('');
    setShowQuickAddModal(true);
  };

  const closeQuickAddModal = () => {
    setShowQuickAddModal(false);
    setQuickGoal(null);
    setQuickAmount('');
  };

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailGoal, setDetailGoal] = useState<any>(null);

  const openDetail = (goal: any) => {
    setDetailGoal(goal);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailGoal(null);
  };

  const submitQuickAddAmount = async () => {
    if (!quickGoal) return;
    const amount = Number(quickAmount.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Masukkan nominal yang valid.');
      return;
    }

    try {
      await updateFinancialGoal(quickGoal.id, {
        name: quickGoal.name,
        target_amount: Number(quickGoal.target_amount),
        current_amount: Number(quickGoal.current_amount) + amount,
        deadline: quickGoal.deadline || null,
        description: quickGoal.description || null,
        status: quickGoal.status,
      });
      closeQuickAddModal();
    } catch (error) {
      alert('Gagal menambah dana ke goal ini.');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-200">Financial Goals</h3>
          <p className="text-xs text-gray-400">Tetapkan target finansialmu dan pantau progresnya secara teratur.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/10"
        >
          <Plus className="w-4 h-4" />
          Tambah Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">Target Total</p>
          <p className="mt-2 text-xl font-semibold text-white">Rp {stats.totalTarget.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">Terkumpul</p>
          <p className="mt-2 text-xl font-semibold text-white">Rp {stats.totalCurrent.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4">
          <p className="text-xs uppercase tracking-wider text-gray-400">Selesai</p>
          <p className="mt-2 text-xl font-semibold text-white">{stats.completed} Goal</p>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#0d1322] border border-[#1e293b] p-6 rounded-2xl space-y-4 max-w-2xl">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{editingId ? 'Edit Financial Goal' : 'Tambah Financial Goal'}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Nama Goal</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Target Nominal</label>
              <input
                type="number"
                value={form.target_amount}
                onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                required
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Nominal Terkumpul</label>
              <input
                type="number"
                value={form.current_amount}
                onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Deadline</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Status</label>
              <CustomSelect
                value={form.status}
                onChange={(val) => setForm({ ...form, status: String(val) as 'active' | 'completed' })}
                options={[
                  { value: 'active', label: 'Aktif' },
                  { value: 'completed', label: 'Selesai' },
                ]}
                placeholder="Status"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Deskripsi</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={resetForm} className="bg-transparent hover:bg-gray-800 text-gray-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-[#1e293b]">Batal</button>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">Simpan</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {financialGoals.map((goal) => (
          <div key={goal.id} className="bg-[#0d1322] border border-[#1e293b] rounded-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-300">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-200">{goal.name}</h4>
                  <p className="text-xs text-gray-400">{goal.description || 'Tanpa deskripsi'}</p>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${goal.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-indigo-500/15 text-indigo-300'}`}>
                {goal.status === 'completed' ? 'Selesai' : 'Aktif'}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Target: Rp {Number(goal.target_amount).toLocaleString('id-ID')}</span>
                <span>Terkumpul: Rp {Number(goal.current_amount).toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-[#111928] rounded-full h-2.5 overflow-hidden border border-white/5">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: `${Math.min(goal.progress, 100)}%` }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Sisa: Rp {Number(goal.remaining_amount).toLocaleString('id-ID')}</span>
                <span>{goal.progress}%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>{formatGoalDeadline(goal.deadline)}</span>
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#1e293b]">
              <button onClick={() => openDetail(goal)} className="flex items-center gap-1.5 bg-transparent hover:bg-gray-800 text-gray-400 text-sm px-3 py-2 rounded-lg border border-[#1e293b] transition-colors">
                <Eye className="w-4 h-4" />
                Detail
              </button>
              <button onClick={() => openQuickAddModal(goal)} className="flex items-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-sm px-3 py-2 rounded-lg border border-emerald-500/20 transition-colors">
                <Plus className="w-4 h-4" />
                Tambah Dana
              </button>
              <button onClick={() => openEdit(goal)} className="flex items-center gap-1.5 bg-transparent hover:bg-gray-800 text-gray-400 text-sm px-3 py-2 rounded-lg border border-[#1e293b] transition-colors">
                <Edit3 className="w-4 h-4" />
                Edit
              </button>
              <button onClick={() => deleteFinancialGoal(goal.id)} className="flex items-center gap-1.5 bg-transparent hover:bg-red-500/10 text-red-400 text-sm px-3 py-2 rounded-lg border border-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && financialGoals.length === 0 && (
        <div className="bg-[#0d1322] border border-[#1e293b] py-12 rounded-2xl text-center text-gray-400 text-sm">
          Belum ada financial goal. Tambahkan target finansial pertama Anda.
        </div>
      )}

      {showQuickAddModal && quickGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeQuickAddModal} />
          <div className="relative bg-[#0b1220] border border-[#1e293b] rounded-2xl p-6 w-full max-w-md mx-4">
            <h4 className="text-sm font-semibold text-gray-200 mb-4">Tambah Dana untuk "{quickGoal.name}"</h4>
            <div className="space-y-3">
              <label className="text-xs text-gray-400">Nominal</label>
              <input
                type="number"
                inputMode="numeric"
                value={quickAmount}
                onChange={(e) => setQuickAmount(e.target.value)}
                placeholder="Masukkan nominal..."
                className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={closeQuickAddModal} className="bg-transparent hover:bg-gray-800 text-gray-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-[#1e293b]">Batal</button>
              <button onClick={submitQuickAddAmount} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && detailGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={closeDetailModal} />
          <div className="relative bg-[#0b1220] border border-[#1e293b] rounded-2xl p-6 w-full max-w-lg mx-4">
            <h4 className="text-sm font-semibold text-gray-200 mb-2">Detail Goal: {detailGoal.name}</h4>
            <p className="text-xs text-gray-400 mb-4">{detailGoal.description || 'Tanpa deskripsi'}</p>

            <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mb-4">
              <div>
                <p className="text-xs text-gray-400">Target</p>
                <p className="font-semibold">Rp {Number(detailGoal.target_amount).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Terkumpul</p>
                <p className="font-semibold">Rp {Number(detailGoal.current_amount).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Sisa</p>
                <p className="font-semibold">Rp {Number(detailGoal.remaining_amount).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Progress</p>
                <p className="font-semibold">{detailGoal.progress}%</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={closeDetailModal} className="bg-transparent hover:bg-gray-800 text-gray-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-[#1e293b]">Tutup</button>
              <button onClick={() => { closeDetailModal(); openQuickAddModal(detailGoal); }} className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">Tambah Dana</button>
              <button onClick={() => { closeDetailModal(); openEdit(detailGoal); }} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">Edit</button>
              <button onClick={async () => { if (!detailGoal) return; if (!confirm('Hapus goal ini?')) return; await deleteFinancialGoal(detailGoal.id); closeDetailModal(); }} className="bg-transparent hover:bg-red-500/10 text-red-400 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors border border-red-500/10">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

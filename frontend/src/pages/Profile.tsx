import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Profile() {
  const { user, logout, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const joinDate = useMemo(() => {
    if (!user?.created_at) return '-';
    const date = new Date(user.created_at);
    return isNaN(date.getTime())
      ? '-'
      : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }, [user?.created_at]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="rounded-3xl border border-[#1e293b] bg-[#0d1322] p-6 shadow-xl shadow-black/10 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-500 text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="space-y-2">
                <div className="text-sm uppercase tracking-[0.18em] text-gray-400">Profil Pengguna</div>
                <h1 className="text-3xl font-extrabold text-white">{user?.name ?? 'User'}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                  <span>{user?.email ?? '-'}</span>
                  {user?.role && <span className="inline-flex items-center rounded-full border border-[#334155] bg-white/5 px-3 py-1 text-xs text-gray-300">{user.role}</span>}
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-auto">
              <div className="rounded-3xl border border-[#1e293b] bg-[#111827] px-4 py-4 text-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Status Akun</div>
                <div className="mt-2 text-lg font-semibold text-white">Aktif</div>
              </div>
              <div className="rounded-3xl border border-[#1e293b] bg-[#111827] px-4 py-4 text-sm">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Bergabung</div>
                <div className="mt-2 text-lg font-semibold text-white">{joinDate}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-[#1e293b] bg-[#0d1322] p-6 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-400">Informasi Akun</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Detail Profil</h2>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-[#1e293b] bg-[#111827] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Nama Lengkap</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user?.name ?? '-'}</p>
                </div>
                <div className="rounded-3xl border border-[#1e293b] bg-[#111827] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Email</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user?.email ?? '-'}</p>
                </div>
                <div className="rounded-3xl border border-[#1e293b] bg-[#111827] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Role</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user?.role ?? 'Pengguna'}</p>
                </div>
                <div className="rounded-3xl border border-[#1e293b] bg-[#111827] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Tanggal Bergabung</p>
                  <p className="mt-2 text-lg font-semibold text-white">{joinDate}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#1e293b] bg-[#0d1322] p-6 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-400">Keamanan</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Perlindungan Akun</h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-[#1e293b] bg-[#111827] p-5">
                  <div className="text-sm text-gray-400">Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda. Perbarui secara berkala untuk proteksi maksimal.</div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Fitur Ubah Password belum tersedia.')}
                  className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Ubah Password
                </button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-[#1e293b] bg-[#0d1322] p-6 shadow-xl shadow-black/5">
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#1e293b]">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-400">Aksi</p>
                  <h2 className="mt-2 text-xl font-semibold text-white">Kelola Akun</h2>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setSaveError('');
                    setName(user?.name ?? '');
                    setNameError('');
                    setIsEditOpen(true);
                  }}
                  className="w-full rounded-2xl border border-[#1e293b] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500"
                >
                  Edit Profil
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-2xl bg-rose-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-400"
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 sm:px-6">
          <div className="w-full max-w-2xl rounded-3xl border border-[#1e293b] bg-[#0d1322] p-6 shadow-2xl shadow-black/40 sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-white">Edit Profil</h3>
                <p className="mt-1 text-sm text-gray-400">Perbarui nama lengkap Anda. Email dan role tidak dapat diubah.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditOpen(false)}
                className="rounded-full border border-[#1e293b] bg-[#111827] px-4 py-2 text-sm text-gray-300 transition hover:bg-[#172133]"
              >
                Tutup
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-gray-500" htmlFor="profile-name">Nama Lengkap</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-2xl border border-[#1e293b] bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                    placeholder="Masukkan nama lengkap"
                    aria-invalid={!!nameError}
                  />
                  {nameError && <p className="text-sm text-rose-400">{nameError}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-gray-500" htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    type="text"
                    readOnly
                    value={user?.email ?? '-'}
                    className="w-full rounded-2xl border border-[#1e293b] bg-[#111827] px-4 py-3 text-sm text-gray-300 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500" htmlFor="profile-role">Role</label>
                <input
                  id="profile-role"
                  type="text"
                  readOnly
                  value={user?.role ?? 'Pengguna'}
                  className="w-full rounded-2xl border border-[#1e293b] bg-[#111827] px-4 py-3 text-sm text-gray-300 outline-none"
                />
              </div>

              {saveError && <div className="rounded-2xl border border-rose-500 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{saveError}</div>}
              {saveSuccess && <div className="rounded-2xl border border-emerald-500 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{saveSuccess}</div>}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="w-full rounded-2xl border border-[#1e293b] bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:border-indigo-500 sm:w-auto"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const trimmedName = name.trim();
                    setNameError('');
                    setSaveError('');
                    setSaveSuccess('');

                    if (!trimmedName) {
                      setNameError('Nama tidak boleh kosong.');
                      return;
                    }

                    if (trimmedName.length < 3) {
                      setNameError('Nama harus minimal 3 karakter.');
                      return;
                    }

                    if (trimmedName.length > 50) {
                      setNameError('Nama maksimal 50 karakter.');
                      return;
                    }

                    setIsSaving(true);
                    try {
                      await updateProfile({ name: trimmedName });
                      setSaveSuccess('Profil berhasil diperbarui.');
                      setIsEditOpen(false);
                    } catch (error: any) {
                      if (error?.errors?.name?.[0]) {
                        setNameError(error.errors.name[0]);
                      } else {
                        setSaveError(error.message || 'Terjadi kesalahan saat menyimpan.');
                      }
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 sm:w-auto"
                  disabled={isSaving}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

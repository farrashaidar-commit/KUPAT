import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

export default function Register() {
  const { register, error, clearError, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      alert('Kata sandi konfirmasi tidak cocok');
      return;
    }
    try {
      await register({ name, email, password, password_confirmation: passwordConfirmation });
      navigate('/');
    } catch (err) {
      // Handled by store
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#0d1322] border border-[#1e293b] rounded-2xl p-8 space-y-6 shadow-xl"
      >
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center font-bold text-white text-xl mx-auto mb-2">
            K
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Daftar KUPAT
          </h1>
          <p className="text-gray-400 text-sm">Mulai atur pengeluaran Anda dengan pintar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex justify-between items-center">
            <span>{error}</span>
            <button type="button" onClick={clearError} className="hover:text-white font-bold">&times;</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Contoh: John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="nama@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Kata Sandi
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Konfirmasi Kata Sandi
            </label>
            <input
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              className="w-full bg-[#111928] border border-[#1e293b] rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Daftar...' : 'Buat akun Baru'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
            Masuk di sini
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

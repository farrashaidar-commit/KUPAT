import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import KupatLogo from '../components/KupatLogo';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Register() {
  const { register, error, clearError, isLoading, validationErrors } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      const message = 'Konfirmasi password tidak cocok.';
      useAuthStore.setState({ error: message, validationErrors: { password_confirmation: [message] } });
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
          <div className="mx-auto mb-3 flex justify-center">
            <KupatLogo iconClassName="w-24 h-24 sm:w-28 sm:h-28" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Daftar KUPAT
          </h1>
          <p className="text-gray-400 text-sm">Mulai atur pengeluaran Anda dengan pintar</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl flex justify-between items-center gap-3">
            <div className="space-y-1">
              <p>{error}</p>
              {Object.entries(validationErrors).length > 0 && (
                <ul className="list-disc list-inside text-xs text-red-300/90 space-y-0.5">
                  {Object.entries(validationErrors).flatMap(([field, messages]) =>
                    messages.map((message) => (
                      <li key={`${field}-${message}`}>{message}</li>
                    ))
                  )}
                </ul>
              )}
            </div>
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
              className={`w-full bg-[#111928] border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none transition-colors ${validationErrors.name ? 'border-red-500 focus:border-red-500' : 'border-[#1e293b] focus:border-indigo-500'}`}
              placeholder="Contoh: John Doe"
            />
            {validationErrors.name?.map((message) => (
              <p key={message} className="mt-2 text-xs text-red-400">{message}</p>
            ))}
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
              className={`w-full bg-[#111928] border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none transition-colors ${validationErrors.email ? 'border-red-500 focus:border-red-500' : 'border-[#1e293b] focus:border-indigo-500'}`}
              placeholder="nama@email.com"
            />
            {validationErrors.email?.map((message) => (
              <p key={message} className="mt-2 text-xs text-red-400">{message}</p>
            ))}
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
              className={`w-full bg-[#111928] border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none transition-colors ${validationErrors.password ? 'border-red-500 focus:border-red-500' : 'border-[#1e293b] focus:border-indigo-500'}`}
              placeholder="Minimal 8 karakter"
            />
            {validationErrors.password?.map((message) => (
              <p key={message} className="mt-2 text-xs text-red-400">{message}</p>
            ))}
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
              className={`w-full bg-[#111928] border rounded-xl px-4 py-3 text-sm text-gray-200 focus:outline-none transition-colors ${validationErrors.password_confirmation ? 'border-red-500 focus:border-red-500' : 'border-[#1e293b] focus:border-indigo-500'}`}
              placeholder="••••••••"
            />
            {validationErrors.password_confirmation?.map((message) => (
              <p key={message} className="mt-2 text-xs text-red-400">{message}</p>
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Daftar...' : 'Buat akun Baru'}
          </button>
        </form>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-px bg-[#1e293b]" />
          <div className="text-xs text-gray-400">atau</div>
          <div className="flex-1 h-px bg-[#1e293b]" />
        </div>

        <div className="mt-3">
          <GoogleAuthButton label="Lanjut dengan Google" />
        </div>

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


import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Wallet, Landmark, Tags, LogOut } from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: Wallet },
    { name: 'Anggaran', path: '/budgets', icon: Landmark },
    { name: 'Kategori', path: '/categories', icon: Tags },
  ];

  return (
    <div className="flex h-screen bg-[#070b13] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0d1322] border-r border-[#1e293b] flex flex-col justify-between">
        <div>
          {/* Logo / Branding */}
          <div className="h-16 flex items-center px-6 border-b border-[#1e293b] gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white tracking-wider">
              K
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              KUPAT
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-gray-400 hover:bg-[#151f32] hover:text-gray-200 border border-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-[#1e293b] space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 transition-all duration-300 border border-transparent hover:border-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-gray-200">
            {navItems.find((item) => item.path === location.pathname)?.name || 'Halaman'}
          </h2>
          
          {/* User Financial Balance Display */}
          <div className="flex items-center gap-4">
            <div className="bg-[#111928] border border-[#1e293b] px-4 py-1.5 rounded-xl text-sm">
              <span className="text-gray-400 text-xs mr-2">Saldo Aktif:</span>
              <span className={`font-semibold ${user && user.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                Rp {user ? Number(user.balance).toLocaleString('id-ID') : '0'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1 overflow-y-auto bg-[#070b13] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

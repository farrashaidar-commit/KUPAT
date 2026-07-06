import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useFinancialStore } from '../store/useFinancialStore';
import { LayoutDashboard, Wallet, Landmark, Tags, LogOut, Bell, Search, ChevronDown, X, Target } from 'lucide-react';
import KupatLogo from './KupatLogo';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { notifications, searchResults, dashboardData, fetchDashboard, searchTransactions } = useFinancialStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // for mobile drawer
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // for desktop collapse
  const [searchQuery, setSearchQuery] = useState('');

  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  useEffect(() => {
    if (!dashboardData) {
      fetchDashboard();
    }
  }, [dashboardData, fetchDashboard]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchChange = async (value: string) => {
    setSearchQuery(value);
    await searchTransactions(value);
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Transaksi', path: '/transactions', icon: Wallet },
    { name: 'Anggaran', path: '/budgets', icon: Landmark },
    { name: 'Financial Goals', path: '/financial-goals', icon: Target },
    { name: 'Kategori', path: '/categories', icon: Tags },
  ];

  return (
    <div className="flex h-screen bg-[#070b13] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      {/* Mobile overlay/backdrop when drawer open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`bg-[#0d1322] border-r border-[#1e293b] flex flex-col justify-between transform transition-all duration-300 z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shadow-none
          ${isSidebarCollapsed ? 'md:w-20' : 'md:w-64'} w-64 fixed md:relative inset-y-0 left-0`}
      >
        <div>
          {/* Logo / Branding */}
          <div className="h-16 flex items-center px-4 md:px-6 border-b border-[#1e293b] gap-2 justify-between">
            <div className="flex items-center gap-2">
              <div title={isSidebarCollapsed ? 'KUPAT' : undefined}>
                <KupatLogo className="items-center" iconClassName="w-10 h-10" />
              </div>
              <span className={`${isSidebarCollapsed ? 'hidden' : 'block'} text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent`}>KUPAT</span>
            </div>

            {/* Collapse toggle moved into sidebar header */}
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((s) => !s)}
                className="p-2 rounded-xl bg-[#071021] hover:bg-[#0d1726] border border-[#111827] text-gray-300 ml-2 flex-shrink-0"
                title="Toggle sidebar collapse"
                aria-label="Toggle sidebar collapse"
              >
                {isSidebarCollapsed ? '›' : '‹'}
              </button>
            </div>
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
                  onClick={() => setIsSidebarOpen(false)}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-gray-400 hover:bg-[#151f32] hover:text-gray-200 border border-transparent'
                  }`}
                    aria-label={item.name}
                    style={{ justifyContent: isSidebarCollapsed ? 'center' : undefined }}
                >
                  <Icon className="w-5 h-5" />
                  <span className={`${isSidebarCollapsed ? 'hidden' : 'block'}`}>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / User Profile & Logout */}
        <div className="p-4 border-t border-[#1e293b] space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold"
              title={isSidebarCollapsed ? user?.name : undefined}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className={`${isSidebarCollapsed ? 'block md:hidden' : 'block'} flex-1 min-w-0`}>
              <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            type="button"
            title={isSidebarCollapsed ? 'Keluar' : undefined}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/5 transition-all duration-300 border border-transparent hover:border-red-500/10 ${isSidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut className="w-5 h-5" />
            <span className={`${isSidebarCollapsed ? 'block md:hidden' : 'block'}`}>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-6 md:px-8 z-10">
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile to open drawer */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl bg-[#071021] hover:bg-[#0d1726] border border-[#111827] md:hidden"
              type="button"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2zm0 4h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd" />
              </svg>
            </button>

            {/* (Button moved into sidebar header) */}
            <h2 className="text-lg font-semibold text-gray-200 hidden md:block">
              {navItems.find((item) => item.path === location.pathname)?.name || 'Halaman'}
            </h2>
            <div className="flex items-center gap-3 bg-[#071021] border border-[#111827] rounded-xl px-3 py-1 text-sm">
              <span className="text-gray-300 text-sm font-medium">{formattedToday}</span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
              <div className="relative">
              <button
                aria-label="Search"
                type="button"
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  setIsNotificationsOpen(false);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-xl bg-[#071021] hover:bg-[#0d1726] border border-[#111827]"
              >
                <Search className="w-5 h-5 text-gray-300" />
              </button>

              {isSearchOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4 shadow-xl z-50 pointer-events-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Cari Transaksi</span>
                    <button type="button" onClick={() => setIsSearchOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Cari deskripsi atau kategori..."
                    className="w-full bg-[#111928] border border-[#111827] rounded-xl px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="mt-3 max-h-52 overflow-y-auto space-y-2">
                    {searchResults.length > 0 ? (
                      searchResults.slice(0, 5).map((result) => (
                        <button
                          key={result.id}
                          onClick={() => {
                            navigate('/transactions');
                            setIsSearchOpen(false);
                          }}
                          className="w-full text-left p-3 rounded-xl bg-[#111928] hover:bg-[#131f2f] text-gray-200"
                        >
                          <div className="font-semibold text-white">{result.description || 'Transaksi tanpa deskripsi'}</div>
                          <div className="text-xs text-gray-400">{result.category?.name || 'Umum'} • Rp {Number(result.amount).toLocaleString('id-ID')}</div>
                        </button>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">Masukkan kata kunci untuk mencari transaksi.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                aria-label="Notifications"
                type="button"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsSearchOpen(false);
                  setIsProfileOpen(false);
                }}
                className="p-2 rounded-xl bg-[#071021] hover:bg-[#0d1726] border border-[#111827] relative"
              >
                <Bell className="w-5 h-5 text-gray-300" />
                {dashboardData?.header?.unread_notifications ? (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-[#071021]" />
                ) : null}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4 shadow-xl z-50 pointer-events-auto">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Notifikasi</span>
                    <button type="button" onClick={() => setIsNotificationsOpen(false)} className="p-1 rounded-full text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div key={notification.id} className="rounded-2xl bg-[#111928] p-3 border border-[#111827]">
                          <div className="text-sm font-semibold text-white">{notification.title}</div>
                          <div className="text-xs text-gray-400 mt-1">{notification.message}</div>
                          <div className="mt-2 text-[11px] text-gray-500">{new Date(notification.created_at).toLocaleString('id-ID')}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-400">Tidak ada notifikasi terbaru.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsSearchOpen(false);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-3 bg-[#111928] border border-[#1e293b] px-3 py-1.5 rounded-2xl"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-sm text-white font-medium">{user?.name}</div>
                  <div className="text-xs text-gray-400 truncate">{user?.role ? user.role : user?.email}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-300" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#0d1322] border border-[#1e293b] rounded-2xl p-4 shadow-xl z-50 pointer-events-auto">
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/profile');
                        setIsProfileOpen(false);
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-sm text-gray-200 hover:bg-[#111928]"
                    >
                      View Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout().then(() => navigate('/login'));
                      }}
                      className="w-full text-left rounded-xl px-3 py-2 text-sm text-red-400 hover:bg-[#111928]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
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

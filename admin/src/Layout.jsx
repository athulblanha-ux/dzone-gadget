import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBox, FiShoppingCart, FiUsers, FiSettings, FiLogOut, FiMenu, FiMoon, FiSun, FiLayers, FiFileText, FiTrendingUp, FiStar, FiTruck, FiX, FiSliders } from 'react-icons/fi';
import { useAuthStore, useThemeStore } from './store';

const NAV_ITEMS = [
  { icon: FiHome, label: 'Dashboard', path: '/' },
  { icon: FiBox, label: 'Products', path: '/products' },
  { icon: FiSliders, label: 'Arrange Products', path: '/arrange-products' },
  { icon: FiLayers, label: 'Categories', path: '/categories' },
  { icon: FiShoppingCart, label: 'Orders', path: '/orders' },
  { icon: FiUsers, label: 'Customers', path: '/customers' },
  { icon: FiFileText, label: 'CMS', path: '/cms' },
  { icon: FiTrendingUp, label: 'Marketing', path: '/marketing' },
  { icon: FiStar, label: 'Reviews', path: '/reviews' },
  { icon: FiTruck, label: 'Shipping', path: '/shipping' },
  { icon: FiSettings, label: 'Settings', path: '/settings' },
];

const Sidebar = ({ location, user, handleLogout, onLinkClick }) => (
  <div className="flex flex-col h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border w-64 flex-shrink-0 transition-colors">
    <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-dark-border">
      <span className="text-xl font-bold text-primary-600 dark:text-primary-500 flex items-center gap-2">
        <img src="/logo.png" alt="D-STORE" className="h-8 w-auto object-contain rounded-sm" />
        Admin
      </span>
      {onLinkClick && (
        <button onClick={onLinkClick} className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg">
          <FiX size={20} />
        </button>
      )}
    </div>
    <div className="flex-1 py-4 overflow-y-auto">
      <nav className="px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
              location.pathname === item.path
                ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-bg dark:hover:text-gray-200'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
    <div className="p-4 border-t border-gray-200 dark:border-dark-border">
      <div className="flex items-center gap-3 mb-4 px-2">
        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">{user?.name?.[0] || 'A'}</div>
        <div className="flex-1 min-w-0"><p className="text-sm font-medium dark:text-white truncate">{user?.name || 'Admin'}</p><p className="text-xs text-gray-500 truncate">{user?.role || 'user'}</p></div>
      </div>
      <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full px-3 py-2 rounded-lg transition-colors font-medium text-sm">
        <FiLogOut /> Logout
      </button>
    </div>
  </div>
);

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg transition-colors w-full overflow-x-hidden relative">
      <div className="hidden lg:block">
        <Sidebar location={location} user={user} handleLogout={handleLogout} />
      </div>
      
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="h-full w-64 transform transition-transform" onClick={e => e.stopPropagation()}>
            <Sidebar location={location} user={user} handleLogout={handleLogout} onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-4 sm:px-6 transition-colors">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg">
            <FiMenu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <button onClick={toggle} className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg transition-colors">
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

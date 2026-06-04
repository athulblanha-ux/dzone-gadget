import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiSearch, FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useAuthStore, useThemeStore } from '../../store';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { itemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: categoriesData } = useQuery({
    queryKey: ['nav-categories'],
    queryFn: () => api.get('/categories?parentOnly=true').then((r) => r.data.categories),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      setTimeout(() => setMobileOpen(false), 0);
    }
  }, [location.pathname, mobileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Categories', to: '/shop', dropdown: categoriesData?.slice(0, 6) },
    { label: 'Blog', to: '/blog' },
    { label: 'About', to: '/about' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-glass shadow-sm border-b border-gray-200/50 dark:border-[#2c2c2e]/50' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="D-STORE Logo" className="h-12 w-auto object-contain rounded-md shadow-sm" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`font-medium text-sm transition-colors duration-200 hover:text-primary-500 ${
                    location.pathname === link.to
                      ? 'text-primary-500'
                      : 'text-gray-700 dark:text-dark-text'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn-icon text-gray-600 dark:text-dark-muted"
                aria-label="Search"
              >
                <FiSearch size={20} />
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="btn-icon text-gray-600 dark:text-dark-muted"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="btn-icon relative text-gray-600 dark:text-dark-muted">
                <FiHeart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="btn-icon relative text-gray-600 dark:text-dark-muted">
                <FiShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Link>

              {/* User */}
              {isAuthenticated ? (
                <Link to="/profile" className="flex items-center gap-2">
                  {user?.avatar?.url ? (
                    <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </Link>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4 hidden sm:flex">
                  Sign In
                </Link>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden btn-icon text-gray-600 dark:text-dark-muted"
                aria-label="Menu"
              >
                {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-24 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onSubmit={handleSearch}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for toys, brands, categories..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-dark-card dark:text-dark-text"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX size={20} />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 right-0 w-72 bg-white dark:bg-dark-card shadow-2xl z-50 flex flex-col pt-20 px-6 gap-4 overflow-y-auto"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 btn-icon"
            >
              <FiX size={24} />
            </button>

            {isAuthenticated && (
              <div className="flex items-center gap-3 pb-4 mb-2 border-b border-gray-100 dark:border-dark-border">
                {user?.avatar?.url ? (
                  <img src={user.avatar.url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-dark-text truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium py-2 border-b border-gray-100 dark:border-dark-border text-gray-800 dark:text-dark-text hover:text-primary-500 transition-colors"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium py-2 border-b border-gray-100 dark:border-dark-border text-gray-800 dark:text-dark-text hover:text-primary-500 transition-colors"
                >
                  My Profile
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium py-2 border-b border-gray-100 dark:border-dark-border text-gray-800 dark:text-dark-text hover:text-primary-500 transition-colors"
                >
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="text-lg font-medium py-2 border-b border-gray-100 dark:border-dark-border text-gray-800 dark:text-dark-text hover:text-primary-500 transition-colors"
                >
                  Wishlist
                </Link>
                {(user?.role === 'admin' || user?.role === 'moderator') && (
                  <a
                    href="https://admin.dstoreindia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium py-2 border-b border-gray-100 dark:border-dark-border text-gray-800 dark:text-dark-text hover:text-primary-500 transition-colors"
                  >
                    Admin Panel
                  </a>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                  }}
                  className="w-full text-left text-lg font-medium py-2 text-red-500 hover:text-red-600 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-4 text-center">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

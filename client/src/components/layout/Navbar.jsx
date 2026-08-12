import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiSearch, FiSun, FiMoon, FiX, FiMenu } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useAuthStore, useThemeStore } from '../../store';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Sync search input query with URL search parameter when search opens
  useEffect(() => {
    if (searchOpen) {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('search') || '');
    }
  }, [searchOpen, location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/shop');
    }
    setSearchOpen(false);
    setSearchQuery('');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/shop' },
    { label: 'Categories', to: '/shop' },
    { label: 'About Us', to: '/about' },
    { label: 'Contact', to: '/contact' },
    { label: 'Cart', to: '/cart' },
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
              <img src="/logo.png" alt="DZONE GADGET Logo" className="h-12 w-auto object-contain rounded-md shadow-sm" />
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

              {/* Hamburger Menu Icon */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="btn-icon text-gray-600 dark:text-dark-muted lg:hidden"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>

            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Slide-down Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-white/95 dark:bg-dark-card/95 backdrop-blur-md border-b border-gray-200 dark:border-[#2c2c2e]/50 z-40 overflow-hidden shadow-lg"
          >
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-semibold text-base py-2 transition-colors duration-200 hover:text-primary-500 ${
                    location.pathname === link.to
                      ? 'text-primary-500'
                      : 'text-gray-800 dark:text-dark-text'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Auth / Profile Integration */}
              <div className="border-t border-gray-200/50 dark:border-white/5 pt-4 mt-2">
                {isAuthenticated ? (
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 font-semibold text-base py-2 hover:text-primary-500 transition-colors"
                  >
                    {user?.avatar?.url ? (
                      <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-primary-500/20" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user?.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-gray-800 dark:text-dark-text leading-tight">{user?.name}</span>
                      <span className="text-xs text-gray-500 dark:text-dark-muted font-normal">View Profile</span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-sm py-2.5 px-4 w-full text-center block"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="w-full pl-12 pr-12 py-4 text-lg rounded-2xl border-0 shadow-xl focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-dark-card dark:text-dark-text"
                />
                <button
                  type="button"
                  onClick={() => searchQuery ? setSearchQuery('') : setSearchOpen(false)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10 p-1"
                >
                  <FiX size={20} />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

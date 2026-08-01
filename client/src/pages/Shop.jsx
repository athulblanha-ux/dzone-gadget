import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import api from '../lib/api';

const SORTS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'newest', label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];
const AGE_GROUPS = ['0-2', '3-5', '6-8', '9-12', '13+', 'all'];

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState('grid');
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'recommended',
    minPrice: '', maxPrice: '',
    ageGroup: '', inStock: '',
    isFeatured: searchParams.get('isFeatured') || '',
    isTrending: searchParams.get('isTrending') || '',
    isNewArrival: searchParams.get('isNewArrival') || '',
    limit: 'all',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
      return api.get(`/products?${params.toString()}`).then(r => r.data);
    },
    keepPreviousData: true,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data.categories),
  });

  const updateFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ search: '', category: '', sort: 'recommended', minPrice: '', maxPrice: '', ageGroup: '', inStock: '', isFeatured: '', isTrending: '', isNewArrival: '', limit: 'all' });
  const activeCount = [filters.category, filters.minPrice, filters.maxPrice, filters.ageGroup, filters.inStock].filter(Boolean).length;

  return (
    <>
      <Helmet>
        <title>Shop Models & Gear — D-STORE</title>
        <meta name="description" content="Browse premium hobbygrade models and diecast collectibles. Filter by category, price, and age group." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-dark-text">
              {filters.search ? `Results for "${filters.search}"` : 'Shop All Models & Gear'}
            </h1>
            {data?.pagination && <p className="text-gray-500 dark:text-dark-muted mt-1">{data.pagination.total} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="input pr-8 py-2 text-sm appearance-none cursor-pointer">
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            </div>
            <button onClick={() => setFiltersOpen(true)} className="btn-secondary py-2 px-4 text-sm relative">
              <FiFilter size={16} /> Filters
              {activeCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">{activeCount}</span>}
            </button>
            <div className="flex border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-primary-500 text-white' : 'text-gray-500'}`}><FiGrid size={16} /></button>
              <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary-500 text-white' : 'text-gray-500'}`}><FiList size={16} /></button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={`grid gap-4 sm:gap-6 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 max-w-4xl'}`}>
            {Array(8).fill(null).map((_, i) => (
              <div key={i} className={`card overflow-hidden ${view === 'list' ? 'flex flex-col sm:flex-row' : 'block'}`}>
                <div className={`skeleton ${view === 'list' ? 'w-full sm:w-48 aspect-square' : 'aspect-square'}`} />
                <div className="p-4 flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-4 rounded" />
                  <div className="skeleton h-5 w-1/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-primary-500 mb-4 flex justify-center"><FiSearch size={48} /></div>
            <h3 className="text-xl font-semibold dark:text-dark-text mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your filters.</p>
            <button onClick={clearFilters} className="btn-primary mt-6">Clear Filters</button>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 max-w-4xl'}`}>
            {data?.products?.map(p => <ProductCard key={p._id} product={p} view={view} />)}
          </div>
        )}
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50" onClick={() => setFiltersOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 inset-y-0 w-80 bg-white dark:bg-dark-card shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display font-bold text-lg text-gray-900 dark:text-dark-text">Filters</h3>
                  <div className="flex gap-2"><button onClick={clearFilters} className="text-sm text-red-500 hover:underline">Clear all</button><button onClick={() => setFiltersOpen(false)} className="btn-icon"><FiX /></button></div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-dark-text">Category</h4>
                  <div className="space-y-2">
                    {categoriesData?.map(cat => (
                      <label key={cat._id} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="category" checked={filters.category === cat._id} onChange={() => updateFilter('category', cat._id)} className="accent-primary-500" />
                        <span className="text-sm text-gray-600 dark:text-dark-text">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-dark-text">Price Range (₹)</h4>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} className="input text-sm py-2" />
                    <input type="number" placeholder="Max" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} className="input text-sm py-2" />
                  </div>
                </div>
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-gray-800 dark:text-dark-text">Age Group</h4>
                  <div className="flex flex-wrap gap-2">
                    {AGE_GROUPS.map(age => (
                      <button key={age} onClick={() => updateFilter('ageGroup', filters.ageGroup === age ? '' : age)} className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${filters.ageGroup === age ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted'}`}>
                        {age === 'all' ? 'All Ages' : `${age} yrs`}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer mb-6">
                  <input type="checkbox" checked={filters.inStock === 'true'} onChange={e => updateFilter('inStock', e.target.checked ? 'true' : '')} className="accent-primary-500 w-4 h-4" />
                  <span className="font-medium text-gray-700 dark:text-dark-text">In Stock Only</span>
                </label>
                <button onClick={() => setFiltersOpen(false)} className="btn-primary w-full">Apply Filters</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

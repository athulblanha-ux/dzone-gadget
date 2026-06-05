import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiArrowDown, FiSearch, FiImage, FiCheck, FiRefreshCw, FiSliders, FiList } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function ArrangeProducts() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderedProducts, setOrderedProducts] = useState([]);
  
  const queryClient = useQueryClient();

  // Fetch all products (limit=all)
  const { data: productsData, isLoading: productsLoading, refetch } = useQuery({
    queryKey: ['admin-products-all-reorder-page'],
    queryFn: () => api.get('/products?limit=all').then(r => r.data.products),
  });

  // Fetch categories for filtering
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.categories),
  });

  useEffect(() => {
    if (productsData) {
      setOrderedProducts(productsData);
    }
  }, [productsData]);

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: (ids) => api.put('/products/reorder', { productIds: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      queryClient.invalidateQueries(['admin-products-all-reorder-page']);
      toast.success('Product display order saved successfully!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to save display order');
    }
  });

  // Swap/Move handler that works properly with active filters
  const moveItem = (filteredIndex, direction) => {
    const targetFilteredIndex = filteredIndex + direction;
    const filtered = getFilteredList();
    if (targetFilteredIndex < 0 || targetFilteredIndex >= filtered.length) return;

    const p1 = filtered[filteredIndex];
    const p2 = filtered[targetFilteredIndex];

    const newItems = [...orderedProducts];
    const idx1 = newItems.findIndex(p => p._id === p1._id);
    const idx2 = newItems.findIndex(p => p._id === p2._id);

    if (idx1 !== -1 && idx2 !== -1) {
      const temp = newItems[idx1];
      newItems[idx1] = newItems[idx2];
      newItems[idx2] = temp;
      setOrderedProducts(newItems);
    }
  };

  // Rank change handler that works properly with active filters
  const handleRankChange = (filteredIndex, newRankValue) => {
    const targetRank = parseInt(newRankValue);
    const filtered = getFilteredList();
    if (isNaN(targetRank) || targetRank < 1 || targetRank > filtered.length) return;

    const targetFilteredIndex = targetRank - 1;
    if (filteredIndex === targetFilteredIndex) return;

    const pToMove = filtered[filteredIndex];
    const pTarget = filtered[targetFilteredIndex];

    const newItems = [...orderedProducts];
    const idxToMove = newItems.findIndex(p => p._id === pToMove._id);
    const idxTarget = newItems.findIndex(p => p._id === pTarget._id);

    if (idxToMove !== -1 && idxTarget !== -1) {
      const [item] = newItems.splice(idxToMove, 1);
      // Recalculate target position after splice
      const freshIdxTarget = newItems.findIndex(p => p._id === pTarget._id);
      newItems.splice(filteredIndex < targetFilteredIndex ? freshIdxTarget + 1 : freshIdxTarget, 0, item);
      setOrderedProducts(newItems);
    }
  };

  // Get current list based on search and category filters
  const getFilteredList = () => {
    return orderedProducts.filter(prod => {
      const matchesSearch = prod.name.toLowerCase().includes(search.toLowerCase()) || 
                            prod.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
                            prod.sku?.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || prod.category?._id === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredList = getFilteredList();

  const handleSave = () => {
    // Save the global ordered array of product IDs
    const ids = orderedProducts.map(p => p._id);
    reorderMutation.mutate(ids);
  };

  const handleReset = () => {
    if (productsData) {
      setOrderedProducts(productsData);
      toast.success('Order reset to last saved state');
    }
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
            <FiSliders className="text-primary-500" /> Arrange Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Drag, use arrows, or select a rank number to define the order in which products appear on your shop and category pages.
          </p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={handleReset} 
            disabled={isLoading || reorderMutation.isLoading}
            className="btn-secondary flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <FiRefreshCw className={reorderMutation.isLoading ? 'animate-spin' : ''} /> Reset
          </button>
          <button 
            onClick={handleSave}
            disabled={isLoading || reorderMutation.isLoading}
            className="btn-primary flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <FiCheck /> {reorderMutation.isLoading ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      {/* Control Card */}
      <div className="card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by product name, SKU or tags..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="input pl-10 w-full text-sm" 
            />
          </div>

          {/* Categories Tab selector */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-muted mr-1">Category:</span>
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-dark-bg dark:hover:bg-dark-border dark:text-gray-300'
              }`}
            >
              All Categories
            </button>
            {categories?.map(cat => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat._id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedCategory === cat._id
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-dark-bg dark:hover:bg-dark-border dark:text-gray-300'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sorting Container */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading products and categories...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <FiList size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-lg">No products match your criteria</p>
            <p className="text-sm mt-1">Try clearing filters or search to view items.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-dark-border">
            <div className="bg-gray-50 dark:bg-dark-bg/50 px-6 py-3 flex items-center text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-wider">
              <span className="w-16">Rank</span>
              <span className="flex-1">Product Details</span>
              <span className="w-32 text-center">Category</span>
              <span className="w-32 text-right">Quick Move</span>
              <span className="w-24 text-right pr-2">Rank Select</span>
            </div>
            
            <motion.div layout className="divide-y divide-gray-100 dark:divide-dark-border">
              <AnimatePresence initial={false}>
                {filteredList.map((prod, idx) => (
                  <motion.div
                    key={prod._id}
                    layoutId={prod._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 35 }}
                    className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50/80 dark:hover:bg-dark-bg/30 transition-colors"
                  >
                    {/* Rank Indicator */}
                    <div className="w-16 flex items-center">
                      <span className="inline-flex items-center justify-center bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-xs font-bold w-7 h-7 rounded-full border border-gray-200 dark:border-dark-border">
                        {idx + 1}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-dark-bg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-dark-border">
                        {prod.images?.[0]?.url ? (
                          <img src={prod.images[0].url} alt={prod.name} className="w-full h-full object-contain" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiImage size={18} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm sm:text-base">{prod.name}</h3>
                        <div className="flex items-center gap-3 mt-0.5">
                          {prod.sku && <span className="text-xs text-gray-400 font-mono">SKU: {prod.sku}</span>}
                          {prod.price && <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold">₹{prod.price}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Category Column */}
                    <div className="w-32 text-center text-xs sm:text-sm font-medium text-gray-500 dark:text-dark-muted hidden sm:block">
                      <span className="bg-gray-100 dark:bg-dark-bg px-2.5 py-1 rounded-full border border-gray-200 dark:border-dark-border">
                        {prod.category?.name || 'Uncategorized'}
                      </span>
                    </div>

                    {/* Quick Move Buttons */}
                    <div className="w-32 flex justify-end gap-1.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, -1)}
                        className="p-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:hover:text-gray-600 hover:text-primary-500 hover:border-primary-200 transition-all shadow-sm"
                        title="Move Up"
                      >
                        <FiArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === filteredList.length - 1}
                        onClick={() => moveItem(idx, 1)}
                        className="p-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 disabled:hover:text-gray-600 hover:text-primary-500 hover:border-primary-200 transition-all shadow-sm"
                        title="Move Down"
                      >
                        <FiArrowDown size={15} />
                      </button>
                    </div>

                    {/* Dropdown Select Rank */}
                    <div className="w-24 flex justify-end pr-2">
                      <select
                        value={idx + 1}
                        onChange={(e) => handleRankChange(idx, e.target.value)}
                        className="input text-xs w-16 py-1 px-2 cursor-pointer pr-6 font-semibold"
                      >
                        {Array.from({ length: filteredList.length }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

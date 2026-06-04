import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ProductCard({ product, view }) {
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    addItem(product);
    toast.success(`${product.name.substring(0, 20)}... added to cart!`);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    toggle(product._id);
    if (isAuthenticated) {
      try {
        await api.patch(`/users/wishlist/${product._id}`);
      } catch {
        // Silently fail if wishlist sync fails
      }
    }
    toast(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const image = product.images?.[0]?.url;
  const isList = view === 'list';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`group ${isList ? 'w-full' : ''}`}
    >
      <Link
        to={`/product/${product.slug}`}
        className={`card overflow-hidden ${isList ? 'flex flex-col sm:flex-row' : 'block'}`}
      >
        {/* Image */}
        <div className={`relative bg-gray-50 dark:bg-dark-bg flex-shrink-0 overflow-hidden ${
          isList ? 'w-full sm:w-48 aspect-square' : 'aspect-square'
        }`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src="/logo.png" className="w-20 h-20 object-contain opacity-50" alt="logo" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isTrending && (
              <span className="bg-accent-orange text-white text-xs font-bold px-2 py-1 rounded-lg">TRENDING</span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-lg">Out of Stock</span>
            )}
          </div>

          {/* Actions overlay */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-opacity duration-200 ${
            isList ? 'opacity-100 sm:opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-xl shadow-lg flex items-center justify-center transition-colors ${
                inWishlist
                  ? 'bg-primary-500 text-white'
                  : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted hover:text-primary-500'
              }`}
              aria-label="Add to wishlist"
            >
              <FiHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </motion.button>
          </div>

          {/* Quick Add to Cart for Grid View */}
          {!isList && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full py-3 bg-gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                <FiShoppingCart size={16} />
                {product.stock === 0 ? 'Out of Stock' : 'Quick Add'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-xs text-dark-muted mb-1 truncate">{product.category?.name}</p>
            <h3 className="font-semibold text-gray-900 dark:text-dark-text text-sm sm:text-base leading-tight line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
              {product.name}
            </h3>

            {/* Description only in list view */}
            {isList && product.shortDescription && (
              <p className="text-xs sm:text-sm text-gray-500 dark:text-dark-muted mb-3 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <FiStar size={12} className="text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-dark-muted">
                  {product.ratings.average} ({product.ratings.count})
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary-500 text-base sm:text-lg">₹{displayPrice.toLocaleString()}</span>
              {product.isOnSale && product.salePrice && (
                <span className="text-xs sm:text-sm text-gray-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Stock indicator */}
            {product.isLowStock && (
              <p className="text-xs text-orange-500 font-medium mt-1">Only {product.stock} left!</p>
            )}
          </div>

          {/* Quick Add for List View */}
          {isList && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary py-2 px-4 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiShoppingCart size={14} />
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

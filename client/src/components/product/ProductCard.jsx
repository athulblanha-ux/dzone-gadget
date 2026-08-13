import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiStar, FiCreditCard, FiShare2 } from 'react-icons/fi';
import { useCartStore, useWishlistStore, useAuthStore } from '../../store';
import toast from 'react-hot-toast';
import api from '../../lib/api';

export default function ProductCard({ product, view }) {
  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const inWishlist = isInWishlist(product._id);
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.preventDefault();
    if (product.stock === 0) return toast.error('Out of stock');
    addItem(product);
    navigate('/checkout');
  };

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

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productUrl = `${window.location.origin}/product/${product.slug}`;
    const shareData = {
      title: product.name,
      text: product.shortDescription || `Check out ${product.name} on DZONE GADGET!`,
      url: productUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(productUrl);
        toast.success('Product link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  const displayPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const image = product.images?.[0]?.url;
  const isList = view === 'list';

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`group ${isList ? 'w-full' : ''}`}
    >
      <Link
        to={`/product/${product.slug}`}
        className={`card overflow-hidden ${isList ? 'flex flex-col sm:flex-row' : 'block'}`}
      >
        {/* Image */}
        <div className={`relative bg-slate-100/80 dark:bg-[#090d16] flex-shrink-0 overflow-hidden ${
          isList ? 'w-full sm:w-48 aspect-square' : 'aspect-square'
        }`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img src="/logo.png" className="w-20 h-20 object-contain opacity-40" alt="logo" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {product.stock === 0 ? (
              <span className="bg-slate-700/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md">Out of Stock</span>
            ) : (
              <>
                {product.isFlashSale && (
                  <span className="bg-gradient-to-r from-rose-600 to-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">FLASH SALE</span>
                )}
                {product.isOfferSale && (
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">OFFER</span>
                )}
                {product.isClearanceSale && (
                  <span className="bg-gradient-to-r from-purple-600 to-violet-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">CLEARANCE</span>
                )}
                {product.isTrending && !product.isFlashSale && !product.isOfferSale && !product.isClearanceSale && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-md">TRENDING</span>
                )}
              </>
            )}
          </div>

          {/* Actions overlay */}
          <div className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 z-10 ${
            isList ? 'opacity-100 sm:opacity-0 group-hover:opacity-100' : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
          }`}>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-2xl shadow-lg flex items-center justify-center transition-all backdrop-blur-md border ${
                inWishlist
                  ? 'bg-rose-500 text-white border-rose-400'
                  : 'bg-white/90 dark:bg-[#131b2e]/90 text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-white/10 hover:text-rose-500 dark:hover:text-rose-400'
              }`}
              aria-label="Add to wishlist"
            >
              <FiHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="w-9 h-9 rounded-2xl shadow-lg flex items-center justify-center bg-white/90 dark:bg-[#131b2e]/90 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10 hover:text-accent-cyan transition-all backdrop-blur-md"
              aria-label="Share product"
            >
              <FiShare2 size={16} />
            </motion.button>
          </div>

          {/* Buy Now for Grid View */}
          {!isList && (
            <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="w-full py-3 bg-gradient-primary text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all shadow-glow"
              >
                <FiCreditCard size={15} />
                {product.stock === 0 ? 'Out of Stock' : 'Quick Buy'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-1 truncate">{product.category?.name}</p>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-accent-cyan transition-colors">
              {product.name}
            </h3>

            {/* Description only in list view */}
            {isList && product.shortDescription && (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
                {product.shortDescription}
              </p>
            )}

            {/* Rating */}
            {product.ratings?.count > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <FiStar size={13} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {product.ratings.average} <span className="font-normal text-slate-400">({product.ratings.count})</span>
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-extrabold text-primary-600 dark:text-accent-cyan text-base sm:text-lg tracking-tight">₹{displayPrice.toLocaleString()}</span>
              {product.isOnSale && product.salePrice && (
                <span className="text-xs text-slate-400 line-through">₹{product.price.toLocaleString()}</span>
              )}
            </div>

            {/* Stock indicator */}
            {product.isLowStock && (
              <p className="text-[11px] text-amber-500 font-bold mt-1">Only {product.stock} left in stock!</p>
            )}
          </div>

          {/* Quick Add for List View */}
          {isList && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
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

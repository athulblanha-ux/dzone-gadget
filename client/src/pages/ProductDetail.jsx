import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiHeart, FiShoppingCart, FiTruck, FiShield, FiStar, FiMinus, FiPlus, FiCheck, FiChevronDown, FiChevronUp, FiRotateCcw, FiCreditCard, FiShare2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCartStore, useWishlistStore, useAuthStore } from '../store';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [activeVariant, setActiveVariant] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState(null);

  const { addItem } = useCartStore();
  const { toggle, isInWishlist } = useWishlistStore();

  const { data, isLoading } = useQuery({ queryKey: ['product', slug], queryFn: () => api.get(`/products/${slug}`).then(r => r.data.product) });

  const { isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', data?._id],
    queryFn: () => api.get(`/reviews/product/${data._id}`).then(r => r.data),
    enabled: !!data?._id,
  });

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please select a rating');
    if (!reviewComment.trim()) return toast.error('Please enter your review comment');
    try {
      await api.post(`/reviews/product/${data._id}`, { rating, title: reviewTitle, comment: reviewComment });
      toast.success('Review submitted! It will appear once approved by the admin. ✨');
      setRating(5);
      setReviewTitle('');
      setReviewComment('');
      refetchReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
  };

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleBuyNow = () => {
    if (data.stock === 0) return toast.error('Out of stock');
    if (data.variants?.length && !activeVariant) return toast.error('Please select an option');
    addItem(data, qty, activeVariant);
    navigate('/checkout');
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12"><div className="grid md:grid-cols-2 gap-12"><div className="skeleton aspect-square rounded-3xl" /><div className="space-y-6"><div className="skeleton h-10 w-3/4 rounded" /><div className="skeleton h-6 w-1/4 rounded" /><div className="skeleton h-32 w-full rounded" /></div></div></div>;
  if (!data) return <div className="text-center py-32 text-xl font-medium dark:text-dark-text">Product not found.</div>;

  const inWishlist = isInWishlist(data._id);
  const price = data.isOnSale && data.salePrice ? data.salePrice : data.price;

  const handleAdd = () => {
    if (data.stock === 0) return toast.error('Out of stock');
    if (data.variants?.length && !activeVariant) return toast.error('Please select an option');
    addItem(data, qty, activeVariant);
    toast.success('Added to cart! 🛒');
  };

  const handleShare = async () => {
    const shareData = {
      title: data.name,
      text: data.shortDescription || `Check out ${data.name} on DZONE GADGET!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Product link copied to clipboard!');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <>
      <Helmet><title>{`${data.name} — DZONE GADGET`}</title><meta name="description" content={data.shortDescription} /></Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex gap-2 text-sm text-gray-500 mb-8 dark:text-dark-muted">
          <Link to="/" className="hover:text-primary-500">Home</Link> / 
          <Link to={`/category/${data.category?.slug}`} className="hover:text-primary-500">{data.category?.name}</Link> / 
          <span className="text-gray-900 dark:text-dark-text truncate">{data.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 dark:bg-dark-card rounded-3xl overflow-hidden border border-gray-100 dark:border-dark-border relative">
              {showVideo && data.video?.url ? (
                <video src={data.video.url} controls className="w-full h-full object-contain" />
              ) : data.images?.[activeImage]?.url ? (
                <img src={data.images[activeImage].url} alt={data.name} className="w-full h-full object-contain" />
              ) : <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-32 h-32 object-contain opacity-50" alt="logo" /></div>}
            </div>
            {(data.images?.length > 1 || data.video?.url) && (
              <div className="w-full max-w-full overflow-x-auto flex gap-4 hide-scrollbar pb-2">
                {data.video?.url && (
                  <button onClick={() => setShowVideo(true)} className={`w-20 h-20 flex-shrink-0 rounded-2xl border-2 overflow-hidden relative ${showVideo ? 'border-primary-500' : 'border-transparent'}`}>
                    <video src={data.video.url} className="w-full h-full object-contain" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                      <svg fill="currentColor" viewBox="0 0 24 24" className="w-8 h-8"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </button>
                )}
                {data.images?.map((img, i) => (
                  <button key={img._id} onClick={() => { setActiveImage(i); setShowVideo(false); }} className={`w-20 h-20 flex-shrink-0 rounded-2xl border-2 overflow-hidden ${i === activeImage && !showVideo ? 'border-primary-500' : 'border-transparent'}`}>
                    <img src={img.url} className="w-full h-full object-contain" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <h1 className="font-display font-bold text-3xl md:text-4xl dark:text-dark-text mb-4 leading-tight">{data.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                <FiStar className="fill-current" /> <span className="font-semibold text-sm text-yellow-700 dark:text-yellow-500">{data.ratings?.average || '0.0'} ({data.ratings?.count || 0})</span>
              </div>
              {data.stock > 0 ? (
                <span className="text-sm font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg flex items-center gap-1"><FiCheck /> In Stock ({data.stock})</span>
              ) : (
                <span className="text-sm font-semibold text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg">Out of Stock</span>
              )}
              {data.weight && (
                <span className="text-sm font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg flex items-center gap-1">
                  ⚖️ {data.weight >= 1000 ? `${(data.weight / 1000).toFixed(1)} kg` : `${data.weight} g`}
                </span>
              )}
            </div>

            <div className="flex items-end gap-3 mb-8">
              <span className="font-display font-bold text-4xl text-primary-500">₹{price.toLocaleString()}</span>
              {data.isOnSale && <span className="text-xl text-gray-400 line-through mb-1">₹{data.price.toLocaleString()}</span>}
            </div>

            {/* Variants */}
            {data.variants?.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold dark:text-dark-text mb-3">Select {data.variants[0].name}:</h3>
                <div className="flex flex-wrap gap-3">
                  {data.variants.map((v) => (
                    <button key={v._id} onClick={() => setActiveVariant(v)} className={`px-4 py-2 rounded-xl font-medium border-2 transition-all ${activeVariant?._id === v._id ? 'border-primary-500 text-primary-500 bg-primary-50' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {v.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center border-2 border-gray-100 dark:border-dark-border rounded-2xl p-1 bg-white dark:bg-dark-card">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-xl"><FiMinus /></button>
                <span className="w-10 text-center font-bold dark:text-dark-text">{qty}</span>
                <button onClick={() => setQty(Math.min(data.stock, qty + 1))} className="p-3 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-xl"><FiPlus /></button>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleAdd} disabled={data.stock === 0} className="flex-1 btn-primary text-lg disabled:opacity-50">
                <FiShoppingCart /> {data.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggle(data._id)} className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${inWishlist ? 'border-primary-500 text-primary-500 bg-primary-50' : 'border-gray-100 text-gray-400 hover:text-primary-500'}`}>
                <FiHeart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center border-gray-100 text-gray-400 hover:text-primary-500 hover:border-gray-200 transition-all bg-white dark:bg-dark-card" aria-label="Share product">
                <FiShare2 size={24} />
              </motion.button>
            </div>

            {/* Buy Now Button */}
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={handleBuyNow} 
              disabled={data.stock === 0} 
              className="w-full bg-gradient-primary hover:opacity-95 text-white font-display font-semibold text-lg py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 mb-6 shadow-lg shadow-primary-500/20"
            >
              ⚡ Buy It Now
            </motion.button>

            <p className="text-gray-600 dark:text-dark-muted leading-relaxed mb-8">{data.description}</p>

            {/* Policies Accordions */}
            <div className="space-y-3 mb-6">
              {/* Accordion 1: Refund & Return Policy */}
              <div className="border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden bg-white dark:bg-dark-card transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion('refund')}
                  className="w-full flex items-center justify-between p-4 text-left font-display font-semibold text-gray-900 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center">
                      <FiRotateCcw size={20} />
                    </div>
                    <div>
                      <span className="block text-base">Refund & Return Policy</span>
                      <span className="block text-xs font-normal text-gray-500 dark:text-dark-muted">Unboxing video is mandatory</span>
                    </div>
                  </div>
                  {openAccordion === 'refund' ? <FiChevronUp size={20} className="text-gray-400" /> : <FiChevronDown size={20} className="text-gray-400" />}
                </button>
                {openAccordion === 'refund' && (
                  <div className="p-4 border-t border-gray-100 dark:border-dark-border text-sm text-gray-600 dark:text-dark-muted bg-gray-50/50 dark:bg-dark-bg/20 leading-relaxed animate-fade-in">
                    To ensure a smooth return or exchange process, a complete, unedited unboxing video starting from the sealed package is mandatory. In case of damaged or missing items, claims must be reported within 24 hours of delivery with the video proof. Without a valid unboxing video showing the shipping label and contents, claims cannot be processed.
                  </div>
                )}
              </div>

              {/* Accordion 2: Partial COD Available */}
              <div className="border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden bg-white dark:bg-dark-card transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion('cod')}
                  className="w-full flex items-center justify-between p-4 text-left font-display font-semibold text-gray-900 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center">
                      <FiCreditCard size={20} />
                    </div>
                    <div>
                      <span className="block text-base">Partial COD Available</span>
                      <span className="block text-xs font-normal text-gray-500 dark:text-dark-muted">Pay advance, balance on delivery</span>
                    </div>
                  </div>
                  {openAccordion === 'cod' ? <FiChevronUp size={20} className="text-gray-400" /> : <FiChevronDown size={20} className="text-gray-400" />}
                </button>
                {openAccordion === 'cod' && (
                  <div className="p-4 border-t border-gray-100 dark:border-dark-border text-sm text-gray-600 dark:text-dark-muted bg-gray-50/50 dark:bg-dark-bg/20 leading-relaxed animate-fade-in">
                    For Cash on Delivery orders, we require a small advance payment (10% of product price + shipping + COD charge) to confirm your order and protect against fake/undelivered shipments. The remaining balance amount is payable in cash or UPI at the time of delivery. The advance payment is secure and processed via Razorpay.
                  </div>
                )}
              </div>

              {/* Accordion 3: Fast & Reliable Delivery */}
              <div className="border border-gray-100 dark:border-dark-border rounded-2xl overflow-hidden bg-white dark:bg-dark-card transition-all">
                <button
                  type="button"
                  onClick={() => toggleAccordion('delivery')}
                  className="w-full flex items-center justify-between p-4 text-left font-display font-semibold text-gray-900 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-bg/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center">
                      <FiTruck size={20} />
                    </div>
                     <div>
                      <span className="block text-base">Fast & Reliable Delivery</span>
                      <span className="block text-xs font-normal text-gray-500 dark:text-dark-muted">DTDC & ST Courier</span>
                    </div>
                  </div>
                  {openAccordion === 'delivery' ? <FiChevronUp size={20} className="text-gray-400" /> : <FiChevronDown size={20} className="text-gray-400" />}
                </button>
                {openAccordion === 'delivery' && (
                  <div className="p-4 border-t border-gray-100 dark:border-dark-border text-sm text-gray-600 dark:text-dark-muted bg-gray-50/50 dark:bg-dark-bg/20 leading-relaxed animate-fade-in">
                    We ship all orders within 24-48 hours. We partner with reliable delivery companies including DTDC and ST Courier to ensure fast and safe transit. Estimated delivery time is 3-5 business days depending on your location.
                  </div>
                )}
              </div>
            </div>

            {/* Guaranteed Safe Checkout */}
            <div className="border border-gray-100 dark:border-dark-border rounded-2xl p-5 bg-gray-50/30 dark:bg-dark-card/30">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-800 dark:text-dark-text">
                <FiShield className="text-green-500" size={18} />
                <span>Guaranteed Safe Checkout</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-muted mb-4">
                Your payment is processed securely through trusted payment gateways. We do not store your card, UPI, or banking details.
              </p>
              {/* Trust Badges */}
              <div className="flex flex-wrap gap-2.5 items-center">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/30">Razorpay</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-100/50 dark:border-green-900/30">PayU</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/30">Visa</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-100/50 dark:border-red-900/30">Mastercard</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/30">UPI</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-16 border-t border-gray-100 dark:border-dark-border">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Reviews Summary */}
            <div>
              <h2 className="font-display font-bold text-2xl dark:text-dark-text mb-6">Customer Reviews</h2>
              <div className="bg-gray-50/50 dark:bg-dark-card/30 border border-gray-100/50 dark:border-dark-border rounded-3xl p-6 text-center">
                <div className="text-5xl font-bold text-primary-500 mb-2">
                  {data.ratings?.average || '0.0'}
                </div>
                <div className="flex justify-center gap-1 text-yellow-400 mb-2 text-xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FiStar key={star} className={star <= Math.round(data.ratings?.average || 0) ? 'fill-current' : ''} />
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  Based on {data.ratings?.count || 0} reviews
                </p>
              </div>
            </div>

            {/* Reviews List & Write Review */}
            <div className="md:col-span-2 space-y-8">
              {/* Write Review Form or Prompt */}
              <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-3xl p-6">
                <h3 className="font-display font-semibold text-lg dark:text-dark-text mb-4">Write a Review</h3>
                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">Rating</label>
                      <div className="flex gap-2 text-2xl text-yellow-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="hover:scale-110 active:scale-95 transition-all"
                          >
                            <FiStar className={(hoverRating || rating) >= star ? 'fill-current' : ''} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="review-title" className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">Review Title</label>
                      <input
                        id="review-title"
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        placeholder="Summarize your experience (optional)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                      />
                    </div>
                    <div>
                      <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 dark:text-dark-muted mb-2">Review Details</label>
                      <textarea
                        id="review-comment"
                        rows={4}
                        required
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Tell us what you liked or disliked about this toy..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                      />
                    </div>
                    <button type="submit" className="btn-primary py-3 px-6">Submit Review</button>
                  </form>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500 dark:text-dark-muted mb-4">You must be signed in to leave a review.</p>
                    <Link to="/login" className="btn-primary inline-flex py-2 px-6">Sign In</Link>
                  </div>
                )}
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-lg dark:text-dark-text border-b border-gray-100 dark:border-dark-border pb-3">Reviews</h3>
                {reviewsLoading ? (
                  <div className="space-y-4">
                    <div className="skeleton h-24 w-full rounded-2xl" />
                    <div className="skeleton h-24 w-full rounded-2xl" />
                  </div>
                ) : reviewsData?.reviews?.length > 0 ? (
                  <div className="space-y-4">
                    {reviewsData.reviews.map((rev) => (
                      <div key={rev._id} className="border border-gray-100 dark:border-dark-border rounded-2xl p-5 bg-gray-50/10 dark:bg-dark-card/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-yellow-400 text-sm">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar key={star} className={star <= rev.rating ? 'fill-current' : ''} />
                            ))}
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', date: 'numeric' })}
                          </span>
                        </div>
                        {rev.title && <h4 className="font-semibold text-base dark:text-dark-text mb-1">{rev.title}</h4>}
                        <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed mb-3">{rev.comment}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-gray-700 dark:text-dark-text">
                            {rev.user?.name || 'Anonymous User'}
                          </span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded font-semibold">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-500 dark:text-dark-muted">
                    No reviews yet. Be the first to leave a review!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

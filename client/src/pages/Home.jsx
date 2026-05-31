import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiShoppingBag, FiTruck, FiShield, FiClock, FiInstagram } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import api from '../lib/api';

// ─── Hero Banner Carousel ──────────────────────────────────────────────────────
function HeroBanner({ banners }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!banners?.length) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const defaultSlides = [
    {
      title: 'Spark Every Imagination',
      subtitle: 'Premium toys for growing minds — curated with love.',
      ctaText: 'Shop Now',
      ctaLink: '/shop',
      bg: 'from-primary-400 to-accent-yellow',
      emoji: '🎮',
    },
    {
      title: 'New Arrivals This Week',
      subtitle: 'Fresh toys added weekly — be the first to explore!',
      ctaText: 'See New Arrivals',
      ctaLink: '/shop?sort=newest',
      bg: 'from-accent-purple to-accent-blue',
      emoji: '🎉',
    },
    {
      title: 'Festival Offers',
      subtitle: 'Up to 40% off on premium toy collections.',
      ctaText: 'View Offers',
      ctaLink: '/shop?sale=true',
      bg: 'from-accent-orange to-accent-yellow',
      emoji: '🎪',
    },
  ];

  const slides = banners?.length ? banners : defaultSlides;

  return (
    <div className="relative h-[70vh] min-h-[500px] overflow-hidden rounded-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {slides[current]?.image?.url ? (
            <div
              className="w-full h-full bg-cover bg-center relative"
              style={{ backgroundImage: `url(${slides[current].image.url})` }}
            >
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${slides[current]?.bg || 'from-primary-400 to-accent-yellow'} relative overflow-hidden`}>
              {/* Decorative circles */}
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full" />
            </div>
          )}

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 w-full">
              <div className="max-w-xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-6xl mb-4"
                >
                  {slides[current]?.emoji || ''}
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight mb-4"
                >
                  {slides[current]?.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-lg mb-8"
                >
                  {slides[current]?.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to={slides[current]?.ctaLink || '/shop'}
                    className="inline-flex items-center gap-2 bg-white text-primary-500 font-bold px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
                  >
                    {slides[current]?.ctaText || 'Shop Now'}
                    <FiArrowRight />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Features Strip ─────────────────────────────────────────────────────────────
function FeaturesStrip() {
  const features = [
    { icon: FiClock, label: 'Fast Dispatch', sub: 'Orders ship in 24 hours' },
    { icon: FiShoppingBag, label: 'Secure Checkout', sub: 'Razorpay & Stripe secured' },
  ];

  return (
    <section className="section !py-4">
      <div className="bg-gradient-to-r from-accent-purple to-accent-blue rounded-3xl py-8 px-8 text-white shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Icon size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-lg">{label}</p>
                <p className="text-white/80 text-sm mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Category Grid ─────────────────────────────────────────────────────────────
function CategoryGrid({ categories }) {
  if (!categories?.length) return null;

  return (
    <section className="section">
      <div className="text-center mb-10">
        <h2 className="section-title">Shop by Category</h2>
        <p className="text-gray-500 dark:text-dark-muted mt-2">Explore our wide range of toy categories</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {categories.slice(0, 8).map((cat, i) => (
          <motion.div
            key={cat._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/category/${cat.slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-dark-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center group border border-gray-100 dark:border-dark-border"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {cat.icon || ''}
              </div>
              <span className="text-xs font-semibold text-gray-700 dark:text-dark-text leading-tight">
                {cat.name}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Products Section ──────────────────────────────────────────────────────────
function ProductsSection({ title, subtitle, products, viewAllLink }) {
  if (!products?.length) return null;

  return (
    <section className="section">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-gray-500 dark:text-dark-muted mt-1">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-primary-500 font-semibold text-sm hover:gap-2 transition-all"
          >
            View All <FiArrowRight />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 8).map((product, i) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <ProductCard product={product} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Flash Sale Banner ─────────────────────────────────────────────────────────
function FlashSaleBanner({ products }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Set end of day
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 0);

    const update = () => {
      const diff = Math.max(0, endOfDay - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <section className="section !py-0">
      <div className="bg-gradient-to-r from-primary-500 to-accent-yellow rounded-3xl overflow-hidden">
        <div className="px-8 py-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="text-white text-center lg:text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">⚡</span>
              <span className="font-display font-bold text-2xl">Flash Sale!</span>
            </div>
            <p className="text-white/90 mb-4">Limited time deals — don't miss out!</p>
            <div className="flex gap-3 justify-center lg:justify-start">
              {[{ label: 'Hours', value: pad(timeLeft.h) }, { label: 'Mins', value: pad(timeLeft.m) }, { label: 'Secs', value: pad(timeLeft.s) }].map(({ label, value }) => (
                <div key={label} className="bg-white/20 rounded-xl px-4 py-3 text-center min-w-[60px]">
                  <div className="font-display font-bold text-2xl">{value}</div>
                  <div className="text-xs text-white/80">{label}</div>
                </div>
              ))}
            </div>
          </div>
          {products?.length > 0 && (
            <div className="flex gap-4 overflow-x-auto hide-scrollbar">
              {products.slice(0, 4).map((p) => (
                <Link
                  key={p._id}
                  to={`/product/${p.slug}`}
                  className="bg-white rounded-2xl p-3 flex-shrink-0 w-36 hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-50 rounded-xl mb-2 overflow-hidden">
                    {p.images?.[0]?.url ? (
                      <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-12 h-12 object-contain opacity-50" alt="logo" /></div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-800 line-clamp-1">{p.name}</p>
                  <p className="text-primary-500 font-bold text-sm">₹{(p.salePrice || p.price).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          )}
          <Link to="/shop?sale=true" className="flex-shrink-0 bg-white text-primary-500 font-bold px-6 py-3 rounded-2xl hover:shadow-xl transition-all">
            Shop Now
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Instagram Section ─────────────────────────────────────────────────────────
function InstagramSection({ posts }) {
  return (
    <section className="section">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FiInstagram className="text-primary-500" size={24} />
          <h2 className="section-title">Follow @dstore.in</h2>
        </div>
        <p className="text-gray-500 dark:text-dark-muted">Shop directly from our Instagram</p>
        <a
          href="https://www.instagram.com/dstore.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-3 text-primary-500 font-semibold text-sm hover:underline"
        >
          <FiInstagram /> Follow Us on Instagram
        </a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {(posts?.length ? posts : Array(6).fill(null)).map((post, i) => (
          <motion.a
            key={post?.id || i}
            href={post?.permalink || 'https://www.instagram.com/dstore.in/'}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-dark-card"
          >
            {post?.media_url ? (
              post.media_type === 'VIDEO' ? (
                <video src={post.media_url} className="w-full h-full object-cover" muted loop playsInline />
              ) : (
                <img src={post.media_url} alt="Instagram post" className="w-full h-full object-cover" loading="lazy" />
              )
            ) : (
              <div className="w-full h-full bg-gradient-primary opacity-30 flex items-center justify-center">
                <FiInstagram size={24} className="text-white" />
              </div>
            )}
          </motion.a>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
function Testimonials({ testimonials }) {
  if (!testimonials?.length) return null;
  return (
    <section className="section bg-gray-50 dark:bg-dark-card rounded-3xl">
      <div className="text-center mb-10">
        <h2 className="section-title">Happy Little Customers 💕</h2>
        <p className="text-gray-500 dark:text-dark-muted mt-2">What parents say about us</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="card p-6"
          >
            <div className="flex text-yellow-400 mb-3">
              {Array.from({ length: t.rating }).map((_, j) => (
                <span key={j}>⭐</span>
              ))}
            </div>
            <p className="text-gray-600 dark:text-dark-muted text-sm leading-relaxed mb-4">"{t.comment}"</p>
            <div className="flex items-center gap-3">
              {t.avatar?.url ? (
                <img src={t.avatar.url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                  {t.name[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-sm dark:text-dark-text">{t.name}</p>
                <p className="text-xs text-gray-400">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Newsletter Banner ─────────────────────────────────────────────────────────
function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/newsletters/subscribe', { email, source: 'homepage' });
      toast.success('🎉 Subscribed! Enjoy 10% off your first order!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section !py-8">
      <div className="bg-gradient-to-r from-accent-purple to-accent-blue rounded-3xl p-8 sm:p-12 text-center text-white">
        <h2 className="font-display font-bold text-3xl mb-3">Get Exclusive Deals! 🎁</h2>
        <p className="text-white/90 mb-6">Subscribe for 10% off your first order + weekly toy alerts.</p>
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-accent-purple font-bold px-6 py-3 rounded-xl hover:shadow-xl transition-all disabled:opacity-70"
          >
            {loading ? '...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}

// ─── Home Page ─────────────────────────────────────────────────────────────────
import toast from 'react-hot-toast';

export default function Home() {
  const { data: banners } = useQuery({
    queryKey: ['banners-hero'],
    queryFn: () => api.get('/banners?position=hero').then((r) => r.data.banners),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-featured'],
    queryFn: () => api.get('/categories?featured=true').then((r) => r.data.categories),
  });

  const { data: featuredProducts } = useQuery({
    queryKey: ['products-featured'],
    queryFn: () => api.get('/products?isFeatured=true&limit=8').then((r) => r.data.products),
  });

  const { data: trendingProducts } = useQuery({
    queryKey: ['products-trending'],
    queryFn: () => api.get('/products?isTrending=true&limit=8').then((r) => r.data.products),
  });

  const { data: newArrivals } = useQuery({
    queryKey: ['products-new'],
    queryFn: () => api.get('/products?isNewArrival=true&limit=8').then((r) => r.data.products),
  });

  const { data: saleProducts } = useQuery({
    queryKey: ['products-sale'],
    queryFn: () => api.get('/products?sort=popular&limit=4').then((r) => r.data.products),
  });

  const { data: instagramData } = useQuery({
    queryKey: ['instagram-feed'],
    queryFn: () => api.get('/instagram/feed').then((r) => r.data.posts),
    staleTime: 30 * 60 * 1000,
  });

  const { data: testimonials } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => api.get('/testimonials?featured=true').then((r) => r.data.testimonials),
  });

  return (
    <>
      <Helmet>
        <title>D-STORE — Where Play Comes to Life | Premium Toys Online</title>
        <meta name="description" content="Shop premium, safe, and fun toys for kids of all ages. Best prices, fast delivery, and exclusive offers on D-STORE — India's favourite toy store." />
        <meta property="og:title" content="D-STORE — Where Play Comes to Life" />
        <meta property="og:description" content="Premium toys for every child's imagination." />
      </Helmet>

      <HeroBanner banners={banners} />
      <FeaturesStrip />
      <CategoryGrid categories={categoriesData} />
      <ProductsSection
        title="Featured Toys ✨"
        subtitle="Handpicked by our toy experts"
        products={featuredProducts}
        viewAllLink="/shop?isFeatured=true"
      />
      <FlashSaleBanner products={saleProducts} />
      <ProductsSection
        title="Trending Now 🔥"
        subtitle="What kids are loving this week"
        products={trendingProducts}
        viewAllLink="/shop?isTrending=true"
      />
      <ProductsSection
        title="New Arrivals 🆕"
        subtitle="Fresh toys just added to our collection"
        products={newArrivals}
        viewAllLink="/shop?sort=newest"
      />
      <InstagramSection posts={instagramData} />
      <Testimonials testimonials={testimonials} />
      <NewsletterBanner />
    </>
  );
}

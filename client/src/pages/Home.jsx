import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiArrowRight, FiTruck, FiShield, FiInstagram, FiZap, FiBox, FiUsers, FiGrid, FiBookOpen, FiHeart, FiActivity, FiTarget, FiCpu, FiFeather, FiTv, FiSmile, FiTool, FiWind } from 'react-icons/fi';
import ProductCard from '../components/product/ProductCard';
import api from '../lib/api';

const getCategoryIcon = (slug, size = 24) => {
  switch (slug) {
    case 'action-figures': return <FiUsers size={size} />;
    case 'building-blocks': return <FiGrid size={size} />;
    case 'educational-toys': return <FiBookOpen size={size} />;
    case 'dolls-accessories': return <FiHeart size={size} />;
    case 'outdoor-sports': return <FiActivity size={size} />;
    case 'puzzles-games': return <FiTarget size={size} />;
    case 'remote-control': return <FiCpu size={size} />;
    case 'arts-crafts': return <FiFeather size={size} />;
    case 'toys': return <FiSmile size={size} />;
    case 'gadgets': return <FiTv size={size} />;
    case 'hobbygrade': return <FiTool size={size} />;
    case 'diecast': return <FiTruck size={size} />;
    case 'drift-rc': return <FiWind size={size} />;
    default: return <FiBox size={size} />;
  }
};

// ─── Hero Banner Carousel ──────────────────────────────────────────────────────
function HeroBanner({ banners, latestProducts }) {
  const [current, setCurrent] = useState(0);

  const defaultSlides = [
    {
      title: 'Super Motor Brushless 2S',
      subtitle: 'Conquer any terrain with raw brushless power.',
      ctaText: 'Shop RC Cars',
      ctaLink: '/category/remote-control',
      image: { url: '/images/banners/banner2.jpg' },
    },
    {
      title: 'Engineered for Performance',
      subtitle: 'Explore professional hobby-grade RC chassis & build kits.',
      ctaText: 'Explore Kits',
      ctaLink: '/category/hobbygrade',
      image: { url: '/images/banners/banner1.png' },
    },
    {
      title: 'Precision Engineering',
      subtitle: 'Hobby-grade components designed for ultimate control.',
      ctaText: 'View Hobby-Grade',
      ctaLink: '/category/hobbygrade',
      image: { url: '/images/banners/banner3.png' },
    },
    {
      title: 'Where Passion Meets Precision',
      subtitle: 'Premium scale models and detailed diecast collectibles.',
      ctaText: 'Shop Collections',
      ctaLink: '/category/diecast',
      image: { url: '/images/banners/banner4.png' },
    },
  ];

  const slides = banners?.length ? banners : defaultSlides;

  useEffect(() => {
    if (!slides?.length) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const getSlideBg = (index, slide) => {
    if (slide?.image?.url) {
      return (
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${slide.image.url})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
      );
    }

    if (index === 1 && latestProducts?.[0]?.images?.[0]?.url) {
      return (
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${latestProducts[0].images[0].url})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      );
    }

    if (index === 2 && latestProducts?.[1]?.images?.[0]?.url) {
      return (
        <div
          className="w-full h-full bg-cover bg-center relative"
          style={{ backgroundImage: `url(${latestProducts[1].images[0].url})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
      );
    }

    return (
      <div className={`w-full h-full bg-gradient-to-br ${slide?.bg || 'from-primary-400 to-accent-purple'} relative overflow-hidden`}>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full animate-float-1" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-white/10 rounded-full animate-float-2" />
      </div>
    );
  };

  return (
    <div className="relative h-[35vh] sm:h-[50vh] md:h-[60vh] min-h-[250px] sm:min-h-[400px] md:min-h-[500px] overflow-hidden rounded-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {getSlideBg(current, slides[current])}
 
          <div className="absolute inset-0 flex items-center bg-gradient-to-r from-black/60 via-black/40 to-transparent">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full">
              <div className="max-w-xl">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white leading-tight mb-3 tracking-tight drop-shadow-md"
                >
                  {slides[current]?.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-lg leading-relaxed drop-shadow-sm"
                >
                  {slides[current]?.subtitle}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    to={slides[current]?.ctaLink || '/shop'}
                    className="inline-flex items-center gap-2 bg-white text-[#060608] hover:bg-white/90 font-bold px-6 py-3 sm:px-8 sm:py-4 text-xs sm:text-base rounded-2xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {slides[current]?.ctaText || 'Shop Now'}
                    <FiArrowRight size={16} />
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


// ─── Category Grid ─────────────────────────────────────────────────────────────
function CategoryGrid({ categories }) {
  if (!categories?.length) return null;

  return (
    <section className="section">
      <div className="text-center mb-10">
        <h2 className="section-title uppercase tracking-wider">Shop by Category</h2>
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
              className="relative flex flex-col items-center gap-3 p-6 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/[0.06] hover:shadow-framer-shadow-hover hover:-translate-y-1 transition-all duration-300 text-center group overflow-hidden"
            >
              {/* Background Image Layer for Hobbygrade & Drift RC */}
              {(cat.slug === 'hobbygrade' || cat.slug === 'drift-rc') && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${cat.slug === 'hobbygrade' ? '/images/banners/banner3.png' : '/images/banners/drift_rc.png'})` }}
                  />
                  <div className="absolute inset-0 bg-black/65 group-hover:bg-black/55 transition-colors duration-300" />
                </>
              )}

              <div className={`relative z-10 w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                (cat.slug === 'hobbygrade' || cat.slug === 'drift-rc')
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-primary-50 dark:bg-white/5 border-primary-100/50 dark:border-white/[0.08] text-primary-500 dark:text-primary-400'
              }`}>
                {getCategoryIcon(cat.slug)}
              </div>
              <span className={`relative z-10 text-xs font-bold leading-tight uppercase tracking-wider ${
                (cat.slug === 'hobbygrade' || cat.slug === 'drift-rc')
                  ? 'text-white drop-shadow-md'
                  : 'text-gray-900 dark:text-dark-text'
              }`}>
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
      <div className="card px-8 py-10 flex flex-col lg:flex-row items-center gap-8 bg-gray-50 dark:bg-dark-card border-gray-100 dark:border-dark-border">
        <div className="text-gray-900 dark:text-white text-center lg:text-left flex-shrink-0">
          <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
            <FiZap className="text-primary-500 dark:text-primary-400 fill-current animate-pulse-slow text-2xl" />
            <span className="font-display font-bold text-2xl text-gray-900 dark:text-dark-text">Flash Sale!</span>
          </div>
          <p className="text-gray-500 dark:text-dark-muted mb-4">Limited time deals — don't miss out!</p>
          <div className="flex gap-3 justify-center lg:justify-start">
            {[{ label: 'Hours', value: pad(timeLeft.h) }, { label: 'Mins', value: pad(timeLeft.m) }, { label: 'Secs', value: pad(timeLeft.s) }].map(({ label, value }) => (
              <div key={label} className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/[0.06] rounded-xl px-4 py-3 text-center min-w-[60px] shadow-sm dark:shadow-none">
                <div className="font-display font-bold text-2xl text-gray-900 dark:text-dark-text">{value}</div>
                <div className="text-xs text-gray-500 dark:text-dark-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
        {products?.length > 0 && (
          <div className="w-full max-w-full overflow-x-auto flex gap-4 hide-scrollbar py-2">
            {products.slice(0, 4).map((p) => (
              <Link
                key={p._id}
                to={`/product/${p.slug}`}
                className="bg-white dark:bg-[#121217]/50 border border-gray-100 dark:border-white/[0.06] rounded-2xl p-3 flex-shrink-0 w-36 hover:shadow-framer-shadow-hover hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-sm dark:shadow-none"
              >
                <div className="aspect-square bg-gray-50 dark:bg-white/5 rounded-xl mb-2 overflow-hidden border border-gray-100 dark:border-white/[0.03]">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-12 h-12 object-contain opacity-50" alt="logo" /></div>
                  )}
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-dark-text line-clamp-1">{p.name}</p>
                <p className="text-primary-500 dark:text-primary-400 font-bold text-sm">₹{(p.salePrice || p.price).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
        <Link to="/shop?sale=true" className="flex-shrink-0 bg-white hover:bg-white/90 text-[#060608] font-bold px-6 py-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-300">
          Shop Now
        </Link>
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
        <h2 className="section-title">Happy Little Customers</h2>
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



// ─── Home Page ─────────────────────────────────────────────────────────────────
import toast from 'react-hot-toast';

export default function Home() {
  const { data: banners } = useQuery({
    queryKey: ['banners-hero'],
    queryFn: () => api.get('/banners?position=hero').then((r) => r.data.banners),
  });

  const { data: latestProducts } = useQuery({
    queryKey: ['products-latest-hero'],
    queryFn: () => api.get('/products?limit=5').then((r) => r.data.products),
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
        <title>D-STORE — Where Passion Meets Precision | Premium Hobby & Diecast Store</title>
        <meta name="description" content="Shop premium hobbygrade models and diecast collectibles. Best prices, fast delivery, and exclusive offers on D-STORE — India's favourite hobby store." />
        <meta property="og:title" content="D-STORE — Where Passion Meets Precision" />
        <meta property="og:description" content="Premium hobbygrade models and diecast collections." />
      </Helmet>

      <HeroBanner banners={banners} latestProducts={latestProducts} />
      <CategoryGrid categories={categoriesData} />
      <ProductsSection
        title="Trending Now"
        subtitle="What collectors are loving this week"
        products={trendingProducts}
        viewAllLink="/shop?isTrending=true"
      />
      <FlashSaleBanner products={saleProducts} />
      <ProductsSection
        title="Featured Gear"
        subtitle="Handpicked by our hobby experts"
        products={featuredProducts}
        viewAllLink="/shop?isFeatured=true"
      />
      <ProductsSection
        title="New Arrivals"
        subtitle="Fresh additions to our collection"
        products={newArrivals}
        viewAllLink="/shop?sort=newest"
      />
      <InstagramSection posts={instagramData} />
      <Testimonials testimonials={testimonials} />
    </>
  );
}

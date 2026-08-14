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
    case 'hotwheels': return <FiTruck size={size} />;
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
                    className="inline-flex items-center gap-2 bg-gradient-primary text-white font-extrabold px-7 py-3.5 sm:px-9 sm:py-4 text-xs sm:text-base rounded-2xl shadow-glow hover:brightness-110 transition-all duration-300 hover:scale-[1.03] active:scale-95 tracking-wide uppercase"
                  >
                    {slides[current]?.ctaText || 'Shop Collection'}
                    <FiArrowRight size={18} />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-500 ${
              i === current ? 'w-9 bg-accent-cyan shadow-glow-cyan' : 'w-2.5 bg-white/40 hover:bg-white/70'
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

  const categoryBgs = {
    'toys': '/images/banners/toys.jpg',
    'gadgets': '/images/banners/gadgets.jpg',
    'hobbygrade': '/images/banners/banner3.png',
    'diecast': '/images/banners/hotwheels.jpg',
    'hotwheels': '/images/banners/hotwheels.jpg',
    'drift-rc': '/images/banners/drift_rc.png'
  };

  return (
    <section className="section">
      <div className="text-center mb-10">
        <h2 className="section-title tracking-tight">SHOP BY CATEGORY</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Explore high-performance RC models, diecast & gadgets</p>
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
              className="relative flex flex-col items-center gap-3 p-5 rounded-3xl bg-white dark:bg-[#101522] border border-slate-200/80 dark:border-white/[0.08] hover:border-accent-cyan/50 hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-300 text-center group overflow-hidden"
            >
              {/* Background Image Layer */}
              {categoryBgs[cat.slug] && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url(${categoryBgs[cat.slug]})` }}
                  />
                  <div className="absolute inset-0 bg-slate-950/70 group-hover:bg-slate-950/50 transition-colors duration-300 backdrop-blur-[1px]" />
                </>
              )}

              <div className={`relative z-10 w-14 h-14 rounded-2xl border flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                categoryBgs[cat.slug]
                  ? 'bg-white/10 border-white/20 text-accent-cyan backdrop-blur-md shadow-lg'
                  : 'bg-primary-50 dark:bg-white/5 border-primary-100/50 dark:border-white/[0.08] text-primary-600 dark:text-accent-cyan'
              }`}>
                {getCategoryIcon(cat.slug)}
              </div>
              <span className={`relative z-10 text-xs font-extrabold leading-tight uppercase tracking-wider ${
                categoryBgs[cat.slug]
                  ? 'text-white drop-shadow-md'
                  : 'text-slate-800 dark:text-slate-200'
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
function ProductsSection({ title, subtitle, products, viewAllLink, showAll = false }) {
  if (!products?.length) return null;

  const displayProducts = showAll ? products : products.slice(0, 8);

  return (
    <section className="section">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1.5 text-primary-600 dark:text-accent-cyan font-bold text-sm hover:gap-2.5 transition-all"
          >
            Explore All <FiArrowRight />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6">
        {displayProducts.map((product, i) => (
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
      <div className="card px-6 py-8 sm:px-10 sm:py-10 flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-slate-900 via-[#101522] to-slate-900 border border-slate-200/80 dark:border-accent-cyan/30 shadow-card-hover rounded-3xl relative overflow-hidden">
        <div className="text-white text-center lg:text-left flex-shrink-0 z-10">
          <div className="flex items-center justify-center lg:justify-start gap-2.5 mb-2">
            <FiZap className="text-accent-cyan fill-accent-cyan animate-pulse text-2xl" />
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">LIMITED TIME FLASH SALE</span>
          </div>
          <p className="text-slate-400 text-sm mb-5 font-medium">Exclusive deals on top RC models & collectibles — ending soon!</p>
          <div className="flex gap-3 justify-center lg:justify-start">
            {[{ label: 'Hours', value: pad(timeLeft.h) }, { label: 'Mins', value: pad(timeLeft.m) }, { label: 'Secs', value: pad(timeLeft.s) }].map(({ label, value }) => (
              <div key={label} className="bg-white/10 dark:bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-center min-w-[65px] backdrop-blur-md shadow-sm">
                <div className="font-display font-black text-2xl text-accent-cyan">{value}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">{label}</div>
              </div>
            ))}
          </div>
        </div>
        {products?.length > 0 && (
          <div className="w-full max-w-full overflow-x-auto flex gap-4 hide-scrollbar py-2 z-10">
            {products.slice(0, 4).map((p) => (
              <Link
                key={p._id}
                to={`/product/${p.slug}`}
                className="bg-white/10 dark:bg-[#131b2e]/80 border border-white/10 rounded-2xl p-3 flex-shrink-0 w-36 sm:w-40 hover:border-accent-cyan/50 hover:scale-[1.03] active:scale-95 transition-all duration-300 backdrop-blur-md"
              >
                <div className="aspect-square bg-slate-900/60 rounded-xl mb-2.5 overflow-hidden border border-white/5 p-2">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-12 h-12 object-contain opacity-50" alt="logo" /></div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white line-clamp-1 mb-1">{p.name}</p>
                <p className="text-accent-cyan font-black text-sm">₹{(p.salePrice || p.price).toLocaleString()}</p>
              </Link>
            ))}
          </div>
        )}
        <Link to="/shop?sale=true" className="flex-shrink-0 btn-primary px-7 py-3.5 text-xs uppercase tracking-wider z-10">
          Shop Deals
        </Link>
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

  const { data: allProducts } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => api.get('/products?limit=all').then((r) => r.data.products),
  });

  // Client-side filtering for instant high-performance loading
  const latestProducts = allProducts ? allProducts.slice(0, 5) : [];
  const featuredProducts = allProducts ? allProducts.filter(p => p.isFeatured).slice(0, 8) : [];
  const trendingProducts = allProducts ? allProducts.filter(p => p.isTrending).slice(0, 8) : [];
  const newArrivals = allProducts ? allProducts.filter(p => p.isNewArrival).slice(0, 8) : [];
  const flashSaleProducts = allProducts ? allProducts.filter(p => p.isFlashSale) : [];
  const saleProducts = flashSaleProducts.length > 0
    ? flashSaleProducts.slice(0, 4)
    : (allProducts ? [...allProducts].sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0)).slice(0, 4) : []);

  return (
    <>
      <Helmet>
        <title>DZONE GADGET — Where Passion Meets Precision | Premium Hobby & Diecast Store</title>
        <meta name="description" content="Shop premium hobbygrade models and diecast collectibles. Best prices, fast delivery, and exclusive offers on DZONE GADGET — India's favourite hobby store." />
        <meta property="og:title" content="DZONE GADGET — Where Passion Meets Precision" />
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
      <ProductsSection
        title="All Products"
        subtitle="Explore our full collection of premium hobby models"
        products={allProducts}
        showAll={true}
      />
    </>
  );
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimit');

// Route imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes');
const userRoutes = require('./routes/user.routes');
const bannerRoutes = require('./routes/banner.routes');
const reviewRoutes = require('./routes/review.routes');
const couponRoutes = require('./routes/coupon.routes');
const settingRoutes = require('./routes/setting.routes');
const homepageSectionRoutes = require('./routes/homepageSection.routes');
const faqRoutes = require('./routes/faq.routes');
const newsletterRoutes = require('./routes/newsletter.routes');
const uploadRoutes = require('./routes/upload.routes');
const paymentRoutes = require('./routes/payment.routes');
const paymentController = require('./controllers/payment.controller');
const { optionalAuth } = require('./middleware/auth');
const analyticsRoutes = require('./routes/analytics.routes');
const instagramRoutes = require('./routes/instagram.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const shippingRoutes = require('./routes/shipping.routes');

// Connect to database
connectDB();

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss());           // Prevent XSS attacks
app.use(hpp());           // Prevent HTTP parameter pollution

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app subdomain (covers all preview + production deployments)
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    // Allow explicitly configured origins (and their www. equivalents)
    const isAllowed = allowedOrigins.some(allowed => {
      if (origin === allowed) return true;
      // If allowed is http(s)://domain, also check http(s)://www.domain
      const wwwEquivalent = allowed.replace(/^https?:\/\//, '$&www.');
      return origin === wwwEquivalent;
    });

    if (isAllowed) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api', globalLimiter);

// ─── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// ─── Robots.txt & Health Check ──────────────────────────────────────────────────
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /api/products
Allow: /api/categories
Allow: /api/banners
Allow: /api/settings/public
Allow: /api/faqs
Allow: /api/homepage-sections
Allow: /uploads/
Disallow: /api/users
Disallow: /api/orders
Disallow: /api/auth
Disallow: /api/analytics
`);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'DZONE GADGET API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/homepage-sections', homepageSectionRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/payments', paymentRoutes);
app.post('/api/create-order', optionalAuth, paymentController.createRazorpayOrder);
app.post('/api/verify-payment', optionalAuth, paymentController.verifyRazorpayPayment);
app.post('/api/verify', optionalAuth, paymentController.verifyRazorpayPayment);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/shipping', shippingRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 DZONE GADGET server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;

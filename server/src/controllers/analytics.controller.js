const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    totalRevenue,
    totalUsers,
    totalProducts,
    recentOrders,
    topProducts,
    ordersByStatus,
    revenueByDay,
    newUsers,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startDate } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: { $in: ['paid', 'partially_paid'] } } },
      { 
        $group: { 
          _id: null, 
          total: { 
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'partially_paid'] },
                '$advanceAmount',
                '$total'
              ]
            }
          } 
        } 
      },
    ]),
    Order.distinct('shippingAddress.email', { createdAt: { $gte: startDate } }),
    Product.countDocuments({ isActive: true }),

    Order.find({ createdAt: { $gte: startDate } })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: { $in: ['paid', 'partially_paid'] } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.name' }, image: { $first: '$items.image' }, price: { $first: '$items.price' }, totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]),

    Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    Order.aggregate([
      { $match: { createdAt: { $gte: startDate }, paymentStatus: { $in: ['paid', 'partially_paid'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { 
            $sum: {
              $cond: [
                { $eq: ['$paymentStatus', 'partially_paid'] },
                '$advanceAmount',
                '$total'
              ]
            }
          },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    User.countDocuments({ createdAt: { $gte: startDate } }),
    Product.find({ stock: { $lte: 5, $gt: 0 }, isActive: true }).select('name stock').limit(10).lean(),
  ]);

  res.json({
    success: true,
    data: {
      summary: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers: totalUsers.length,
        totalProducts,
        newUsers,
      },
      recentOrders,
      topProducts,
      ordersByStatus,
      revenueByDay,
      lowStockProducts,
    },
  });
});

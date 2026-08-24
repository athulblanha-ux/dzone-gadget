const WhatsAppOrder = require('../models/WhatsAppOrder');
const WhatsAppCustomer = require('../models/WhatsAppCustomer');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// Get all WhatsApp orders with dashboard stats, search, and filters
exports.getWhatsAppOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search = '',
    status = '',
    paymentStatus = '',
    courier = '',
    dateFrom = '',
    dateTo = '',
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const query = {};

  if (status) {
    query.status = status;
  }

  if (paymentStatus) {
    query['paymentDetails.status'] = paymentStatus;
  }

  if (courier) {
    query['shippingInfo.courierCompany'] = new RegExp(courier, 'i');
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query.createdAt.$lte = endDate;
    }
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    query.$or = [
      { orderNumber: searchRegex },
      { customerName: searchRegex },
      { whatsappNumber: searchRegex },
      { 'shippingInfo.trackingNumber': searchRegex },
      { 'shippingInfo.courierCompany': searchRegex },
      { 'items.name': searchRegex },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [orders, totalOrders] = await Promise.all([
    WhatsAppOrder.find(query)
      .populate('customer', 'name whatsappNumber email')
      .populate('items.product', 'name price images SKU')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean(),
    WhatsAppOrder.countDocuments(query),
  ]);

  // Compute Dashboard Summary Counters
  const [
    totalCount,
    newCount,
    confirmedCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    returnedCount,
  ] = await Promise.all([
    WhatsAppOrder.countDocuments(),
    WhatsAppOrder.countDocuments({ status: 'new' }),
    WhatsAppOrder.countDocuments({ status: 'confirmed' }),
    WhatsAppOrder.countDocuments({ status: 'processing' }),
    WhatsAppOrder.countDocuments({ status: 'shipped' }),
    WhatsAppOrder.countDocuments({ status: 'delivered' }),
    WhatsAppOrder.countDocuments({ status: 'cancelled' }),
    WhatsAppOrder.countDocuments({ status: 'returned' }),
  ]);

  const stats = {
    total: totalCount,
    new: newCount,
    confirmed: confirmedCount,
    processing: processingCount,
    shipped: shippedCount,
    delivered: deliveredCount,
    cancelled: cancelledCount,
    returned: returnedCount,
  };

  res.json({
    success: true,
    orders,
    pagination: {
      total: totalOrders,
      page: pageNum,
      pages: Math.ceil(totalOrders / limitNum),
      limit: limitNum,
    },
    stats,
  });
});

// Get single WhatsApp order by ID
exports.getWhatsAppOrderById = asyncHandler(async (req, res) => {
  const order = await WhatsAppOrder.findById(req.params.id)
    .populate('customer')
    .populate('items.product');

  if (!order) {
    return res.status(404).json({ success: false, message: 'WhatsApp order not found.' });
  }

  res.json({ success: true, order });
});

// Create new WhatsApp order
exports.createWhatsAppOrder = asyncHandler(async (req, res) => {
  const {
    customerId,
    customerName,
    whatsappNumber,
    email,
    shippingAddress, // Selected address object to snapshot
    items,
    paymentDetails,
    shippingInfo,
    notes,
  } = req.body;

  if (!customerName || !whatsappNumber) {
    return res.status(400).json({ success: false, message: 'Customer name and WhatsApp number are required.' });
  }

  const addrObj = typeof shippingAddress === 'string'
    ? { houseFlatBuilding: shippingAddress }
    : (shippingAddress || { houseFlatBuilding: 'N/A' });

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one order item is required.' });
  }

  // 1. Find or create WhatsApp customer
  let customer;
  if (customerId) {
    customer = await WhatsAppCustomer.findById(customerId);
  }

  if (!customer) {
    const formattedNumber = whatsappNumber.trim();
    customer = await WhatsAppCustomer.findOne({ whatsappNumber: formattedNumber });
  }

  if (!customer) {
    customer = new WhatsAppCustomer({
      name: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email ? email.trim() : '',
      addresses: [],
    });
  } else {
    // Update name/email if provided
    customer.name = customerName.trim();
    if (email) customer.email = email.trim();
  }

  // Add shipping address to customer's saved addresses if not existing
  const addressAlreadySaved = customer.addresses.some(
    (addr) =>
      addr.houseFlatBuilding?.toLowerCase() === (addrObj.houseFlatBuilding || '').toLowerCase()
  );

  if (!addressAlreadySaved && addrObj.houseFlatBuilding) {
    customer.addresses.push({
      type: addrObj.type || 'Home',
      recipientName: addrObj.recipientName || customerName,
      houseFlatBuilding: addrObj.houseFlatBuilding || 'N/A',
      streetLocality: addrObj.streetLocality || 'N/A',
      landmark: addrObj.landmark || '',
      city: addrObj.city || 'N/A',
      district: addrObj.district || '',
      state: addrObj.state || 'N/A',
      pincode: addrObj.pincode || '000000',
      country: addrObj.country || 'India',
      phone: addrObj.phone || whatsappNumber,
      addressNotes: addrObj.addressNotes || '',
    });
  }
  await customer.save();

  // 2. Save Address Snapshot
  const shippingAddressSnapshot = {
    type: addrObj.type || 'Home',
    recipientName: addrObj.recipientName || customerName,
    houseFlatBuilding: addrObj.houseFlatBuilding || 'N/A',
    streetLocality: addrObj.streetLocality || 'N/A',
    landmark: addrObj.landmark || '',
    city: addrObj.city || 'N/A',
    district: addrObj.district || '',
    state: addrObj.state || 'N/A',
    pincode: addrObj.pincode || '000000',
    country: addrObj.country || 'India',
    phone: addrObj.phone || whatsappNumber,
    addressNotes: addrObj.addressNotes || '',
  };

  // 3. Process items & calculate totals
  let productAmount = 0;
  const processedItems = items.map((item) => {
    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const itemDiscount = Number(item.discount) || 0;
    const lineTotal = Math.max(0, price * qty - itemDiscount);
    productAmount += lineTotal;

    return {
      product: item.product || null,
      name: item.name || 'Custom Product',
      sku: item.sku || '',
      variant: item.variant || '',
      size: item.size || '',
      color: item.color || '',
      quantity: qty,
      unitPrice: price,
      discount: itemDiscount,
      total: lineTotal,
    };
  });

  const overallDiscount = Number(paymentDetails?.discount) || 0;
  const shippingCharge = Number(paymentDetails?.shippingCharge) || Number(shippingInfo?.shippingCharge) || 0;
  const otherCharges = Number(paymentDetails?.otherCharges) || 0;
  const grandTotal = Math.max(0, productAmount - overallDiscount + shippingCharge + otherCharges);

  const orderPaymentDetails = {
    method: paymentDetails?.method || 'COD',
    status: paymentDetails?.status || 'pending',
    productAmount,
    discount: overallDiscount,
    shippingCharge,
    otherCharges,
    grandTotal,
  };

  const orderShippingInfo = {
    courierCompany: shippingInfo?.courierCompany || '',
    trackingNumber: shippingInfo?.trackingNumber || '',
    shippingCharge,
    shipmentDate: shippingInfo?.shipmentDate ? new Date(shippingInfo.shipmentDate) : undefined,
    expectedDeliveryDate: shippingInfo?.expectedDeliveryDate ? new Date(shippingInfo.expectedDeliveryDate) : undefined,
    trackingUrl: shippingInfo?.trackingUrl || '',
    notes: shippingInfo?.notes || '',
  };

  const initialStatus = req.body.status || 'paid';
  const statusHistory = [
    {
      previousStatus: '',
      newStatus: initialStatus,
      message: 'WhatsApp Order created manually by Admin',
      updatedBy: {
        id: req.user?._id,
        name: req.user?.name || 'Admin',
      },
      timestamp: new Date(),
    },
  ];

  const order = new WhatsAppOrder({
    customer: customer._id,
    customerName: customer.name,
    whatsappNumber: customer.whatsappNumber,
    email: customer.email,
    shippingAddressSnapshot,
    items: processedItems,
    paymentDetails: orderPaymentDetails,
    shippingInfo: orderShippingInfo,
    status: initialStatus,
    statusHistory,
    source: 'whatsapp',
    notes: notes || '',
  });

  await order.save();

  res.status(201).json({
    success: true,
    message: 'WhatsApp Order created successfully.',
    order,
  });
});

// Update WhatsApp order details
exports.updateWhatsAppOrder = asyncHandler(async (req, res) => {
  const order = await WhatsAppOrder.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'WhatsApp order not found.' });
  }

  const { items, paymentDetails, shippingInfo, notes } = req.body;

  if (items && Array.isArray(items)) {
    let productAmount = 0;
    order.items = items.map((item) => {
      const qty = Number(item.quantity) || 1;
      const price = Number(item.unitPrice) || 0;
      const itemDiscount = Number(item.discount) || 0;
      const lineTotal = Math.max(0, price * qty - itemDiscount);
      productAmount += lineTotal;

      return {
        product: item.product || null,
        name: item.name || 'Custom Product',
        sku: item.sku || '',
        variant: item.variant || '',
        size: item.size || '',
        color: item.color || '',
        quantity: qty,
        unitPrice: price,
        discount: itemDiscount,
        total: lineTotal,
      };
    });

    const overallDiscount = Number(paymentDetails?.discount) || order.paymentDetails.discount || 0;
    const shippingCharge = Number(paymentDetails?.shippingCharge) || order.paymentDetails.shippingCharge || 0;
    const otherCharges = Number(paymentDetails?.otherCharges) || order.paymentDetails.otherCharges || 0;
    const grandTotal = Math.max(0, productAmount - overallDiscount + shippingCharge + otherCharges);

    order.paymentDetails.productAmount = productAmount;
    order.paymentDetails.discount = overallDiscount;
    order.paymentDetails.shippingCharge = shippingCharge;
    order.paymentDetails.otherCharges = otherCharges;
    order.paymentDetails.grandTotal = grandTotal;
  }

  if (paymentDetails) {
    if (paymentDetails.method) order.paymentDetails.method = paymentDetails.method;
    if (paymentDetails.status) order.paymentDetails.status = paymentDetails.status;
  }

  if (shippingInfo) {
    if (shippingInfo.courierCompany !== undefined) order.shippingInfo.courierCompany = shippingInfo.courierCompany;
    if (shippingInfo.trackingNumber !== undefined) order.shippingInfo.trackingNumber = shippingInfo.trackingNumber;
    if (shippingInfo.shippingCharge !== undefined) order.shippingInfo.shippingCharge = Number(shippingInfo.shippingCharge);
    if (shippingInfo.shipmentDate !== undefined) order.shippingInfo.shipmentDate = shippingInfo.shipmentDate ? new Date(shippingInfo.shipmentDate) : null;
    if (shippingInfo.expectedDeliveryDate !== undefined) order.shippingInfo.expectedDeliveryDate = shippingInfo.expectedDeliveryDate ? new Date(shippingInfo.expectedDeliveryDate) : null;
    if (shippingInfo.trackingUrl !== undefined) order.shippingInfo.trackingUrl = shippingInfo.trackingUrl;
    if (shippingInfo.notes !== undefined) order.shippingInfo.notes = shippingInfo.notes;
  }

  if (notes !== undefined) order.notes = notes;

  await order.save();

  res.json({
    success: true,
    message: 'WhatsApp Order updated successfully.',
    order,
  });
});

// Update WhatsApp order status with audit log history
exports.updateWhatsAppOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus, message, shippingInfo } = req.body;
  const order = await WhatsAppOrder.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'WhatsApp order not found.' });
  }

  const previousStatus = order.status;

  if (status && status !== previousStatus) {
    order.status = status;
    order.statusHistory.push({
      previousStatus,
      newStatus: status,
      message: message || `Status updated to ${status.replace(/_/g, ' ').toUpperCase()}`,
      updatedBy: {
        id: req.user?._id,
        name: req.user?.name || 'Admin',
      },
      timestamp: new Date(),
    });
  }

  if (paymentStatus) {
    order.paymentDetails.status = paymentStatus;
  }

  if (shippingInfo) {
    if (!order.shippingInfo) order.shippingInfo = {};
    if (shippingInfo.courierCompany !== undefined) order.shippingInfo.courierCompany = shippingInfo.courierCompany;
    if (shippingInfo.trackingNumber !== undefined) order.shippingInfo.trackingNumber = shippingInfo.trackingNumber;
    if (shippingInfo.trackingUrl !== undefined) order.shippingInfo.trackingUrl = shippingInfo.trackingUrl;
  }

  await order.save();

  res.json({
    success: true,
    message: 'WhatsApp Order status updated.',
    order,
  });
});

// Delete WhatsApp order
exports.deleteWhatsAppOrder = asyncHandler(async (req, res) => {
  const order = await WhatsAppOrder.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'WhatsApp order not found.' });
  }

  await WhatsAppOrder.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'WhatsApp Order deleted successfully.',
  });
});

// Search WhatsApp Customer by phone number
exports.searchWhatsAppCustomer = asyncHandler(async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone parameter is required.' });
  }

  const cleanPhone = phone.trim();
  const customer = await WhatsAppCustomer.findOne({ whatsappNumber: cleanPhone }).lean();

  if (!customer) {
    return res.json({ success: true, customer: null, found: false });
  }

  // Get total WhatsApp orders count and total value for this customer
  const orders = await WhatsAppOrder.find({ customer: customer._id }).select('grandTotal').lean();
  const totalOrdersCount = orders.length;
  const totalOrderValue = orders.reduce((sum, o) => sum + (o.paymentDetails?.grandTotal || 0), 0);

  res.json({
    success: true,
    found: true,
    customer: {
      ...customer,
      totalOrdersCount,
      totalOrderValue,
    },
  });
});

// Add new address to customer
exports.addCustomerAddress = asyncHandler(async (req, res) => {
  const customer = await WhatsAppCustomer.findById(req.params.customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'WhatsApp customer not found.' });
  }

  customer.addresses.push(req.body);
  await customer.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully.',
    addresses: customer.addresses,
  });
});

// Update customer address
exports.updateCustomerAddress = asyncHandler(async (req, res) => {
  const { customerId, addressId } = req.params;
  const customer = await WhatsAppCustomer.findById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'WhatsApp customer not found.' });
  }

  const addr = customer.addresses.id(addressId);
  if (!addr) {
    return res.status(404).json({ success: false, message: 'Address not found.' });
  }

  Object.assign(addr, req.body);
  await customer.save();

  res.json({
    success: true,
    message: 'Address updated successfully.',
    addresses: customer.addresses,
  });
});

// Delete customer address
exports.deleteCustomerAddress = asyncHandler(async (req, res) => {
  const { customerId, addressId } = req.params;
  const customer = await WhatsAppCustomer.findById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'WhatsApp customer not found.' });
  }

  customer.addresses.pull(addressId);
  await customer.save();

  res.json({
    success: true,
    message: 'Address deleted successfully.',
    addresses: customer.addresses,
  });
});

// Get WhatsApp Customer Stats for Customer Management integration
exports.getCustomerWhatsAppStats = asyncHandler(async (req, res) => {
  const { phone } = req.params;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone is required.' });
  }

  const customer = await WhatsAppCustomer.findOne({ whatsappNumber: phone.trim() }).lean();
  if (!customer) {
    return res.json({
      success: true,
      hasWhatsAppAccount: false,
      whatsappNumber: phone,
      savedAddressesCount: 0,
      totalOrdersCount: 0,
      totalOrderValue: 0,
      recentOrders: [],
    });
  }

  const orders = await WhatsAppOrder.find({ customer: customer._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  const totalOrdersCount = orders.length;
  const totalOrderValue = orders.reduce((sum, o) => sum + (o.paymentDetails?.grandTotal || 0), 0);

  res.json({
    success: true,
    hasWhatsAppAccount: true,
    customer,
    whatsappNumber: customer.whatsappNumber,
    savedAddressesCount: customer.addresses?.length || 0,
    totalOrdersCount,
    totalOrderValue,
    recentOrders: orders,
  });
});

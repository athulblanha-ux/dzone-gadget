import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiSearch,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiEdit,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CreateWhatsAppOrder() {
  const navigate = useNavigate();

  // Customer State
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);

  // Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    type: 'Home',
    recipientName: '',
    houseFlatBuilding: '',
    streetLocality: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    phone: '',
    addressNotes: '',
  });

  // Product Selection State
  const [productQuery, setProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [overallDiscount, setOverallDiscount] = useState(0);
  const [shippingCharge, setShippingCharge] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);

  // Courier State
  const [courierCompany, setCourierCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipmentDate, setShipmentDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [notes, setNotes] = useState('');

  // 1. Search Customer by Phone
  const handleSearchCustomer = async () => {
    if (!whatsappNumber || whatsappNumber.trim().length < 5) {
      toast.error('Please enter a valid WhatsApp number');
      return;
    }

    try {
      setIsSearchingCustomer(true);
      const res = await api.get('/whatsapp-customers/search', {
        params: { phone: whatsappNumber.trim() },
      });

      if (res.data?.found && res.data?.customer) {
        const cust = res.data.customer;
        setSelectedCustomerId(cust._id);
        setCustomerName(cust.name || '');
        setEmail(cust.email || '');
        setSavedAddresses(cust.addresses || []);

        if (cust.addresses && cust.addresses.length > 0) {
          const defaultAddr = cust.addresses.find((a) => a.isDefault) || cust.addresses[0];
          setSelectedAddress(defaultAddr);
        } else {
          setSelectedAddress(null);
        }
        toast.success(`Existing customer "${cust.name}" loaded!`);
      } else {
        setSelectedCustomerId(null);
        setSavedAddresses([]);
        setSelectedAddress(null);
        toast.success('New customer! Fill in name and address below.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error searching customer');
    } finally {
      setIsSearchingCustomer(false);
    }
  };

  // 2. Search Products
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (productQuery.trim().length > 1) {
        try {
          const res = await api.get('/products', {
            params: { search: productQuery.trim(), limit: 8 },
          });
          setSearchResults(res.data.products || res.data || []);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [productQuery]);

  // Add Product to Order Items
  const handleAddProduct = (prod) => {
    const existingIndex = orderItems.findIndex((item) => item.product === prod._id);
    if (existingIndex > -1) {
      const updated = [...orderItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = Math.max(
        0,
        updated[existingIndex].unitPrice * updated[existingIndex].quantity - updated[existingIndex].discount
      );
      setOrderItems(updated);
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          product: prod._id,
          name: prod.name,
          sku: prod.SKU || '',
          variant: '',
          size: '',
          color: '',
          quantity: 1,
          unitPrice: prod.price || 0,
          discount: 0,
          total: prod.price || 0,
        },
      ]);
    }
    setProductQuery('');
    setSearchResults([]);
  };

  // Add Custom Item (non-database)
  const handleAddCustomItem = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        product: null,
        name: 'Custom Product',
        sku: '',
        variant: '',
        size: '',
        color: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  // Update Item field
  const handleUpdateItem = (index, field, value) => {
    const updated = [...orderItems];
    const item = { ...updated[index], [field]: value };

    const qty = Number(item.quantity) || 1;
    const price = Number(item.unitPrice) || 0;
    const disc = Number(item.discount) || 0;

    item.total = Math.max(0, price * qty - disc);
    updated[index] = item;
    setOrderItems(updated);
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const productAmount = orderItems.reduce((sum, item) => sum + (item.total || 0), 0);
  const grandTotal = Math.max(0, productAmount - Number(overallDiscount) + Number(shippingCharge) + Number(otherCharges));

  // Address Save Handler
  const handleSaveAddress = () => {
    if (!addressForm.houseFlatBuilding || !addressForm.city || !addressForm.state || !addressForm.pincode) {
      toast.error('House/Flat, City, State, and Pincode are required for address');
      return;
    }

    const newAddrObj = {
      ...addressForm,
      recipientName: addressForm.recipientName || customerName,
      phone: addressForm.phone || whatsappNumber,
      _id: editingAddressId || `temp_${Date.now()}`,
    };

    if (editingAddressId) {
      setSavedAddresses((prev) => prev.map((a) => (a._id === editingAddressId ? newAddrObj : a)));
    } else {
      setSavedAddresses((prev) => [...prev, newAddrObj]);
    }

    setSelectedAddress(newAddrObj);
    setShowAddressModal(false);
    setEditingAddressId(null);
    toast.success('Address saved!');
  };

  // Submit Order Mutation
  const createMutation = useMutation({
    mutationFn: async (orderPayload) => {
      const res = await api.post('/whatsapp-orders/orders', orderPayload);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success('WhatsApp Order created successfully! 🎉');
      if (data.order?._id) {
        navigate(`/whatsapp-orders/${data.order._id}`);
      } else {
        navigate('/whatsapp-orders');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create WhatsApp Order');
    },
  });

  const handleSubmitOrder = () => {
    if (!customerName.trim() || !whatsappNumber.trim()) {
      toast.error('Customer Name and WhatsApp Number are required');
      return;
    }

    if (!selectedAddress) {
      toast.error('Please select or add a shipping address');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the order');
      return;
    }

    const payload = {
      customerId: selectedCustomerId,
      customerName: customerName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: email.trim(),
      shippingAddress: selectedAddress,
      items: orderItems,
      paymentDetails: {
        method: paymentMethod,
        status: paymentStatus,
        productAmount,
        discount: Number(overallDiscount),
        shippingCharge: Number(shippingCharge),
        otherCharges: Number(otherCharges),
        grandTotal,
      },
      shippingInfo: {
        courierCompany,
        trackingNumber,
        shippingCharge: Number(shippingCharge),
        shipmentDate,
        expectedDeliveryDate,
        trackingUrl,
        notes: shippingNotes,
      },
      notes,
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/whatsapp-orders"
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create WhatsApp Order</h1>
            <p className="text-xs text-gray-500">Manually generate an order received via WhatsApp</p>
          </div>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={createMutation.isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-colors"
        >
          {createMutation.isLoading ? 'Creating Order...' : 'Save & Place Order'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Customer, Address, Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* SECTION 1: Customer Details */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiUser className="text-emerald-500" />
              1. Customer Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  WhatsApp Number *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchCustomer}
                    disabled={isSearchingCustomer}
                    className="px-3 py-2 bg-gray-100 dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold rounded-xl"
                  >
                    {isSearchingCustomer ? 'Searching...' : 'Lookup'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="email"
                    placeholder="e.g. rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Shipping Address & Address Management */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiMapPin className="text-emerald-500" />
                2. Shipping Address Selection
              </h2>

              <button
                type="button"
                onClick={() => {
                  setEditingAddressId(null);
                  setAddressForm({
                    type: 'Home',
                    recipientName: customerName,
                    houseFlatBuilding: '',
                    streetLocality: '',
                    landmark: '',
                    city: '',
                    district: '',
                    state: '',
                    pincode: '',
                    country: 'India',
                    phone: whatsappNumber,
                    addressNotes: '',
                  });
                  setShowAddressModal(true);
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <FiPlus /> Add New Address
              </button>
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr, idx) => {
                  const isSelected = selectedAddress?._id === addr._id;
                  return (
                    <div
                      key={addr._id || idx}
                      onClick={() => setSelectedAddress(addr)}
                      className={`cursor-pointer p-4 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10 ring-2 ring-emerald-500'
                          : 'border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-dark-border text-xs font-semibold dark:text-gray-300">
                          {addr.type || 'Home'}
                        </span>
                        {isSelected && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <FiCheck /> Selected
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{addr.recipientName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {addr.houseFlatBuilding}, {addr.streetLocality}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Ph: {addr.phone}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 dark:bg-dark-bg rounded-xl border border-dashed border-gray-300 dark:border-dark-border text-center space-y-2">
                <p className="text-sm text-gray-500">No saved address selected yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      type: 'Home',
                      recipientName: customerName,
                      houseFlatBuilding: '',
                      streetLocality: '',
                      landmark: '',
                      city: '',
                      district: '',
                      state: '',
                      pincode: '',
                      country: 'India',
                      phone: whatsappNumber,
                      addressNotes: '',
                    });
                    setShowAddressModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
                >
                  + Create Shipping Address
                </button>
              </div>
            )}
          </div>

          {/* SECTION 3: Product Section */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiPackage className="text-emerald-500" />
                3. Products & Line Items
              </h2>

              <button
                type="button"
                onClick={handleAddCustomItem}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                + Add Custom Item
              </button>
            </div>

            {/* Product Search Input */}
            <div className="relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search product from database by name or SKU..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white"
              />

              {/* Product Dropdown Results */}
              {searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
                  {searchResults.map((prod) => (
                    <div
                      key={prod._id}
                      onClick={() => handleAddProduct(prod)}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{prod.name}</p>
                        <p className="text-xs text-gray-500">SKU: {prod.SKU || 'N/A'}</p>
                      </div>
                      <p className="font-bold text-emerald-600 text-sm">₹{prod.price}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Line Items Table */}
            {orderItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-border text-gray-500 font-bold uppercase">
                      <th className="py-2 px-2">Item Name</th>
                      <th className="py-2 px-2 w-20">Variant/Size</th>
                      <th className="py-2 px-2 w-20">Price (₹)</th>
                      <th className="py-2 px-2 w-16">Qty</th>
                      <th className="py-2 px-2 w-20">Discount</th>
                      <th className="py-2 px-2 w-24">Total (₹)</th>
                      <th className="py-2 px-2 text-right">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                            className="w-full p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded text-xs dark:text-white font-medium"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            placeholder="XL/Red"
                            value={item.variant || item.size || ''}
                            onChange={(e) => handleUpdateItem(index, 'variant', e.target.value)}
                            className="w-full p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded text-xs dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                            className="w-full p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded text-xs dark:text-white font-bold"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                            className="w-full p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded text-xs dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) => handleUpdateItem(index, 'discount', e.target.value)}
                            className="w-full p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded text-xs dark:text-white"
                          />
                        </td>
                        <td className="py-2.5 px-2 font-bold text-gray-900 dark:text-white">
                          ₹{item.total}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center py-4">
                No items added yet. Search products above or click "+ Add Custom Item".
              </p>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Payment, Shipping, Summary */}
        <div className="space-y-6">
          {/* SECTION 4: Payment Section */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiCreditCard className="text-emerald-500" />
              4. Payment Section
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="UPI">UPI Direct</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Other">Other Payment Method</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Price Breakdown */}
              <div className="pt-2 border-t border-gray-100 dark:border-dark-border space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Product Amount:</span>
                  <span className="font-bold">₹{productAmount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Overall Discount (₹):</span>
                  <input
                    type="number"
                    value={overallDiscount}
                    onChange={(e) => setOverallDiscount(e.target.value)}
                    className="w-24 text-right p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Shipping Charge (₹):</span>
                  <input
                    type="number"
                    value={shippingCharge}
                    onChange={(e) => setShippingCharge(e.target.value)}
                    className="w-24 text-right p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Other Charges (₹):</span>
                  <input
                    type="number"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    className="w-24 text-right p-1 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-dark-border text-sm font-bold text-gray-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-base">₹{grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Courier / Shipping */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FiTruck className="text-emerald-500" />
              5. Courier / Shipping Info
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Courier Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. India Post, BlueDart, Delhivery"
                  value={courierCompany}
                  onChange={(e) => setCourierCompany(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Tracking Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. XX123456789IN"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-mono dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Tracking URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="https://track.courier.com/..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1">
                  Internal Order Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Customer requested dispatch by Monday..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-lg w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {editingAddressId ? 'Edit Address' : 'Add New Address'}
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 dark:text-gray-300">Address Type</label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 dark:text-gray-300">Recipient Name *</label>
                <input
                  type="text"
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold mb-1 dark:text-gray-300">House / Flat / Building *</label>
                <input
                  type="text"
                  placeholder="Flat 204, ABC Apartments"
                  value={addressForm.houseFlatBuilding}
                  onChange={(e) => setAddressForm({ ...addressForm, houseFlatBuilding: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold mb-1 dark:text-gray-300">Street / Locality</label>
                <input
                  type="text"
                  placeholder="Kakkanad Main Road"
                  value={addressForm.streetLocality}
                  onChange={(e) => setAddressForm({ ...addressForm, streetLocality: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 dark:text-gray-300">City *</label>
                <input
                  type="text"
                  placeholder="Kochi"
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 dark:text-gray-300">State *</label>
                <input
                  type="text"
                  placeholder="Kerala"
                  value={addressForm.state}
                  onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 dark:text-gray-300">PIN Code *</label>
                <input
                  type="text"
                  placeholder="682030"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 dark:text-gray-300">Phone Number</label>
                <input
                  type="text"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow"
              >
                Save & Select Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

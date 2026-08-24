import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiZap,
  FiUser,
  FiPhone,
  FiCreditCard,
  FiTruck,
  FiPackage,
  FiCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CreateWhatsAppOrder() {
  const navigate = useNavigate();

  // SINGLE BIG TEXT BOX STATE (For entering all details in one simple place)
  const [rawText, setRawText] = useState('');

  // Quick Fields (Auto-extracted or manually editable)
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemName, setItemName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [courierCompany, setCourierCompany] = useState('');

  // Smart Parser for the Single Text Box
  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);

    if (!val.trim()) return;

    const lines = val.split('\n').map((l) => l.trim()).filter(Boolean);

    // Extract 10-digit Indian mobile number
    const phoneMatch = val.match(/(?:\+91[\s-]?)?([6-9]\d{9})\b/);
    if (phoneMatch && !whatsappNumber) {
      setWhatsappNumber(phoneMatch[1]);
    }

    // Extract Name
    let foundName = '';
    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (lower.startsWith('name:') || lower.startsWith('customer:')) {
        foundName = line.split(/:(.+)/)[1]?.trim() || '';
      }
    });

    // Name fallback: pick short non-address line or first 30 chars before comma
    if (!foundName && lines.length > 0) {
      const shortCandidate = lines.find(
        (l) =>
          l.length < 35 &&
          !l.includes(',') &&
          !l.match(/\d{5}/) &&
          !l.toLowerCase().includes('road') &&
          !l.toLowerCase().includes('nagar') &&
          !l.toLowerCase().includes('kerala') &&
          !l.toLowerCase().includes('india')
      );
      if (shortCandidate) {
        foundName = shortCandidate;
      } else {
        foundName = lines[0].split(',')[0].trim().slice(0, 30);
      }
    }

    if (foundName) setCustomerName(foundName);

    // Extract Amount (e.g. ₹1999 or Rs 1999 or 1999)
    const priceMatch = val.match(/(?:₹|rs\.?|inr)?\s*(\d{2,6})\b/i);
    if (priceMatch && !itemPrice && Number(priceMatch[1]) > 50) {
      setItemPrice(priceMatch[1]);
    }
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
    let finalName = customerName.trim() || 'WhatsApp Customer';
    if (finalName.includes(',')) finalName = finalName.split(',')[0].trim();
    if (finalName.length > 35) finalName = finalName.slice(0, 35).trim();

    const finalPhone = whatsappNumber.trim() || '9876543210';

    if (!rawText.trim() && !finalName) {
      toast.error('Please enter order details in the box');
      return;
    }

    const priceNum = Number(itemPrice) || 0;
    const finalItemName = itemName.trim() || 'WhatsApp Order Item';

    const payload = {
      customerName: finalName,
      whatsappNumber: finalPhone,
      shippingAddress: {
        type: 'Home',
        recipientName: finalName,
        houseFlatBuilding: rawText.trim() || 'WhatsApp Order Address',
        streetLocality: 'N/A',
        landmark: '',
        city: 'Kochi',
        district: '',
        state: 'Kerala',
        pincode: '682030',
        country: 'India',
        phone: finalPhone,
      },
      items: [
        {
          name: finalItemName,
          sku: 'WA-ITEM',
          quantity: 1,
          unitPrice: priceNum,
          discount: 0,
          total: priceNum,
        },
      ],
      paymentDetails: {
        method: paymentMethod,
        status: 'paid',
        productAmount: priceNum,
        discount: 0,
        shippingCharge: 0,
        otherCharges: 0,
        grandTotal: priceNum,
      },
      status: 'paid',
      shippingInfo: {
        courierCompany,
        trackingNumber: '',
        shippingCharge: 0,
      },
      notes: rawText.trim(),
    };

    createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
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
            <p className="text-xs text-gray-500">Simple single text box entry for WhatsApp orders</p>
          </div>
        </div>

        <button
          onClick={handleSubmitOrder}
          disabled={createMutation.isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-colors flex items-center gap-2"
        >
          <FiCheck size={18} />
          {createMutation.isLoading ? 'Creating...' : 'Save & Place Order'}
        </button>
      </div>

      {/* SINGLE BIG TEXT BOX */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiZap className="text-emerald-500" />
            Enter All Order Details (Paste WhatsApp Message Here)
          </label>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            Paste Customer Name, Phone, Address & Item Details
          </span>
        </div>

        <textarea
          rows={8}
          placeholder="Paste full WhatsApp message or type details here...&#10;&#10;e.g.&#10;Rahul Kumar&#10;9876543210&#10;Flat 204, ABC Apartments, Kakkanad, Kochi, Kerala - 682030&#10;Item: AMG RC Drift Car (Price: ₹1999)&#10;Payment: COD"
          value={rawText}
          onChange={handleTextChange}
          className="w-full p-4 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
        />
      </div>

      {/* QUICK SUMMARY / CONFIRMATION FIELDS */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
          Quick Order Summary (Auto-extracted or edit below)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FiUser /> Customer Name
            </label>
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FiPhone /> WhatsApp Number
            </label>
            <input
              type="text"
              placeholder="10-digit WhatsApp number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FiPackage /> Item Name (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. AMG Drift Car"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              Total Amount (₹)
            </label>
            <input
              type="number"
              placeholder="Total ₹"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-bold dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FiCreditCard /> Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
            >
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="UPI">UPI Direct</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-600 dark:text-gray-300 mb-1 flex items-center gap-1">
              <FiTruck /> Courier (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. India Post, BlueDart"
              value={courierCompany}
              onChange={(e) => setCourierCompany(e.target.value)}
              className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-medium dark:text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-dark-border flex justify-end">
          <button
            onClick={handleSubmitOrder}
            disabled={createMutation.isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <FiCheck size={18} />
            {createMutation.isLoading ? 'Creating Order...' : 'Save & Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

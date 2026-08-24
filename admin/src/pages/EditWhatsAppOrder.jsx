import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiSave, FiTruck, FiCreditCard, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function EditWhatsAppOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-whatsapp-order', id],
    queryFn: async () => {
      const res = await api.get(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
  });

  const order = data?.order;

  // Editable states
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [courierCompany, setCourierCompany] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippingCharge, setShippingCharge] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (order) {
      setPaymentMethod(order.paymentDetails?.method || 'COD');
      setPaymentStatus(order.paymentDetails?.status || 'pending');
      setCourierCompany(order.shippingInfo?.courierCompany || '');
      setTrackingNumber(order.shippingInfo?.trackingNumber || '');
      setTrackingUrl(order.shippingInfo?.trackingUrl || '');
      setShippingCharge(order.shippingInfo?.shippingCharge || order.paymentDetails?.shippingCharge || 0);
      setNotes(order.notes || '');
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/whatsapp-orders/orders/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('WhatsApp Order updated!');
      queryClient.invalidateQueries(['admin-whatsapp-order', id]);
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
      navigate(`/whatsapp-orders/${id}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update order');
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      paymentDetails: {
        method: paymentMethod,
        status: paymentStatus,
        shippingCharge: Number(shippingCharge),
      },
      shippingInfo: {
        courierCompany,
        trackingNumber,
        trackingUrl,
        shippingCharge: Number(shippingCharge),
      },
      notes,
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
        Loading WhatsApp Order...
      </div>
    );
  }

  if (!order) {
    return <div className="p-12 text-center text-red-500 font-bold">Order not found</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/whatsapp-orders/${id}`}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit WhatsApp Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-gray-500">Customer: {order.customerName}</p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={updateMutation.isLoading}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors"
        >
          <FiSave /> {updateMutation.isLoading ? 'Saving...' : 'Save Order'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Settings */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiCreditCard className="text-emerald-500" /> Payment Settings
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <label className="block font-semibold mb-1 dark:text-gray-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
              >
                <option value="COD">Cash on Delivery (COD)</option>
                <option value="UPI">UPI Direct</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Other">Other Payment Method</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1 dark:text-gray-300">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Shipping & Courier Details */}
        <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiTruck className="text-emerald-500" /> Courier & Shipping Info
          </h2>

          <div className="space-y-3 text-sm">
            <div>
              <label className="block font-semibold mb-1 dark:text-gray-300">Courier Company</label>
              <input
                type="text"
                placeholder="e.g. India Post, BlueDart, Delhivery"
                value={courierCompany}
                onChange={(e) => setCourierCompany(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 dark:text-gray-300">Tracking Number</label>
              <input
                type="text"
                placeholder="e.g. XX123456789IN"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl font-mono dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 dark:text-gray-300">Tracking URL</label>
              <input
                type="text"
                placeholder="https://track.courier.com/..."
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 dark:text-gray-300">Shipping Charge (₹)</label>
              <input
                type="number"
                value={shippingCharge}
                onChange={(e) => setShippingCharge(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="md:col-span-2 bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
          <label className="block font-bold text-gray-900 dark:text-white">Internal Order Notes</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white text-sm"
          />
        </div>
      </div>
    </div>
  );
}

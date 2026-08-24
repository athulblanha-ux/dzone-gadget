import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiEdit,
  FiMessageSquare,
  FiPrinter,
  FiTrash2,
  FiExternalLink,
  FiTruck,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STATUS_BADGES = {
  new: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  packed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  in_transit: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  returned: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

export default function WhatsAppOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-whatsapp-order', id],
    queryFn: async () => {
      const res = await api.get(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
  });

  const order = data?.order;

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ status, paymentStatus, message }) => {
      const res = await api.patch(`/whatsapp-orders/orders/${id}/status`, {
        status,
        paymentStatus,
        message,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries(['admin-whatsapp-order', id]);
      setShowStatusModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order deleted');
      navigate('/whatsapp-orders');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    },
  });

  const handleOpenWhatsApp = () => {
    if (!order?.whatsappNumber) return;
    let cleanNumber = order.whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
    const message = encodeURIComponent(
      `Hello ${order.customerName}! Regarding your WhatsApp Order ${order.orderNumber} on DZONE GADGET:`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
        Loading WhatsApp Order Details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-xl font-bold text-red-500">Order Not Found</p>
        <Link to="/whatsapp-orders" className="text-emerald-600 font-bold hover:underline">
          Return to WhatsApp Orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddressSnapshot || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:max-w-none">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/whatsapp-orders"
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                WhatsApp Order #{order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  STATUS_BADGES[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/whatsapp-orders/${order._id}/edit`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-gray-200 hover:bg-gray-200 text-xs font-bold"
          >
            <FiEdit /> Edit Order
          </Link>

          <button
            onClick={() => {
              setNewStatus(order.status);
              setNewPaymentStatus(order.paymentDetails?.status || 'pending');
              setStatusMessage('');
              setShowStatusModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow"
          >
            <FiCheckCircle /> Change Status
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow"
          >
            <FiMessageSquare /> Open WhatsApp
          </button>

          {order.shippingInfo?.trackingUrl && (
            <a
              href={order.shippingInfo.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 text-xs font-bold shadow"
            >
              <FiTruck /> Track Shipment <FiExternalLink size={12} />
            </a>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-900 text-xs font-bold shadow"
          >
            <FiPrinter /> Print Invoice
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Delete WhatsApp Order ${order.orderNumber}?`)) {
                deleteMutation.mutate();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold shadow"
          >
            <FiTrash2 /> Delete Order
          </button>
        </div>
      </div>

      {/* Main Order Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col (2 Cols): Customer & Address Snapshot & Products */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer & Shipping Address Snapshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-2">
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                <FiUser className="text-emerald-500" /> Customer Information
              </h3>
              <p className="text-base font-bold text-gray-900 dark:text-white">{order.customerName}</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <FiMessageSquare size={16} /> {order.whatsappNumber}
              </p>
              {order.email && <p className="text-xs text-gray-500">{order.email}</p>}
            </div>

            {/* Address Snapshot Box */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <FiMapPin className="text-emerald-500" /> Shipping Address
                </h3>
                <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-dark-border text-[10px] font-bold text-gray-600 dark:text-gray-300">
                  {addr.type || 'Snapshot'}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {addr.recipientName || order.customerName}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {addr.houseFlatBuilding}{addr.streetLocality ? `, ${addr.streetLocality}` : ''}
              </p>
              {addr.landmark && <p className="text-xs text-gray-500">Landmark: {addr.landmark}</p>}
              <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-gray-500">Country: {addr.country || 'India'}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Order Items</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border text-xs font-bold text-gray-500 uppercase">
                    <th className="py-3 px-3">Item Description</th>
                    <th className="py-3 px-3">SKU / Variant</th>
                    <th className="py-3 px-3">Price</th>
                    <th className="py-3 px-3">Qty</th>
                    <th className="py-3 px-3">Discount</th>
                    <th className="py-3 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {order.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {item.sku || item.variant || item.size || 'N/A'}
                      </td>
                      <td className="py-3 px-3">₹{item.unitPrice}</td>
                      <td className="py-3 px-3 font-bold">{item.quantity}</td>
                      <td className="py-3 px-3 text-gray-500">₹{item.discount || 0}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900 dark:text-white">
                        ₹{item.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations Breakdown */}
            <div className="border-t border-gray-200 dark:border-dark-border pt-4 max-w-xs ml-auto space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Product Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ₹{order.paymentDetails?.productAmount || 0}
                </span>
              </div>

              {order.paymentDetails?.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span>- ₹{order.paymentDetails.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping Charge:</span>
                <span>₹{order.paymentDetails?.shippingCharge || 0}</span>
              </div>

              {order.paymentDetails?.otherCharges > 0 && (
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Other Charges:</span>
                  <span>₹{order.paymentDetails.otherCharges}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-gray-200 dark:border-dark-border pt-2 text-base font-extrabold text-gray-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{order.paymentDetails?.grandTotal || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col (1 Col): Payment Info, Shipping & Tracking, Timeline */}
        <div className="space-y-6">
          {/* Payment Card */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <FiCreditCard className="text-emerald-500" /> Payment Info
            </h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Method:</span>
              <span className="font-bold text-gray-900 dark:text-white">{order.paymentDetails?.method}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Status:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {order.paymentDetails?.status}
              </span>
            </div>
          </div>

          {/* Courier & Shipping Card */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <FiTruck className="text-emerald-500" /> Courier & Shipping
            </h3>
            <div className="text-sm space-y-1.5">
              <p>
                <span className="text-gray-500">Courier:</span>{' '}
                <strong className="text-gray-900 dark:text-white">
                  {order.shippingInfo?.courierCompany || 'Not set'}
                </strong>
              </p>
              <p>
                <span className="text-gray-500">Tracking #:</span>{' '}
                <strong className="font-mono text-gray-900 dark:text-white">
                  {order.shippingInfo?.trackingNumber || 'N/A'}
                </strong>
              </p>
              {order.shippingInfo?.shipmentDate && (
                <p className="text-xs text-gray-500">
                  Shipment Date: {new Date(order.shippingInfo.shipmentDate).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>

          {/* Order Timeline History */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <FiClock className="text-emerald-500" /> Order Timeline History
            </h3>

            <div className="space-y-4 relative pl-4 border-l-2 border-emerald-500/30">
              {order.statusHistory?.map((h, idx) => (
                <div key={idx} className="relative text-xs space-y-1">
                  <div className="absolute -left-[21px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <p className="font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                    {h.newStatus?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{h.message}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(h.timestamp).toLocaleString('en-IN')} {h.updatedBy?.name ? `• by ${h.updatedBy.name}` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Change Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-md w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Change Status: {order.orderNumber}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                >
                  <option value="new">New</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Timeline Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Package dispatched via India Post"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  statusMutation.mutate({
                    status: newStatus,
                    paymentStatus: newPaymentStatus,
                    message: statusMessage,
                  });
                }}
                disabled={statusMutation.isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium shadow-md"
              >
                {statusMutation.isLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

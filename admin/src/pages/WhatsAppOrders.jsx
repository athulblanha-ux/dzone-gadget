import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw,
  FiPrinter,
  FiHome,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const ORDER_STATUS_LIST = [
  { value: 'new', label: 'NEW' },
  { value: 'confirmed', label: 'CONFIRMED' },
  { value: 'processing', label: 'PROCESSING' },
  { value: 'packed', label: 'PACKED' },
  { value: 'shipped', label: 'SHIPPED' },
  { value: 'in_transit', label: 'IN TRANSIT' },
  { value: 'out_for_delivery', label: 'OUT FOR DELIVERY' },
  { value: 'delivered', label: 'DELIVERED' },
  { value: 'cancelled', label: 'CANCELLED' },
  { value: 'returned', label: 'RETURNED' },
];

const PAYMENT_STATUS_LIST = [
  { value: 'pending', label: 'PENDING' },
  { value: 'paid', label: 'PAID' },
  { value: 'failed', label: 'FAILED' },
  { value: 'refunded', label: 'REFUNDED' },
];

export default function WhatsAppOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Fetch WhatsApp Orders
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-whatsapp-orders', page, search, statusFilter, paymentStatusFilter],
    queryFn: async () => {
      const res = await api.get('/whatsapp-orders/orders', {
        params: {
          page,
          limit: 15,
          search,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.orders || [];
  const stats = data?.stats || {
    total: 0,
    new: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Status Change Mutation (Instant Inline Change)
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, paymentStatus, message }) => {
      const res = await api.patch(`/whatsapp-orders/orders/${id}/status`, {
        status,
        paymentStatus,
        message: message || `Updated status to ${status}`,
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    },
  });

  // Delete Order Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order deleted');
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    },
  });

  // Inline Status Handlers
  const handleInlineStatusChange = (ord, newStatus) => {
    statusMutation.mutate({
      id: ord._id,
      status: newStatus,
      paymentStatus: ord.paymentDetails?.status || 'pending',
      message: `Status manually changed to ${newStatus.toUpperCase()}`,
    });
    toast.success(`Status updated to ${newStatus.toUpperCase()}`);
  };

  const handleInlinePaymentChange = (ord, newPaymentStatus) => {
    statusMutation.mutate({
      id: ord._id,
      status: ord.status,
      paymentStatus: newPaymentStatus,
      message: `Payment status manually changed to ${newPaymentStatus.toUpperCase()}`,
    });
    toast.success(`Payment status updated to ${newPaymentStatus.toUpperCase()}`);
  };

  // Open WhatsApp direct chat
  const handleOpenWhatsApp = (whatsappNumber, orderNumber) => {
    if (!whatsappNumber) return;
    let cleanNumber = whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
    const msg = encodeURIComponent(`Hello! Regarding your WhatsApp Order ${orderNumber}:`);
    window.open(`https://wa.me/${cleanNumber}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            💬 WhatsApp Orders
          </h1>
          <p className="text-xs text-gray-500">Manage orders placed via WhatsApp with instant status controls</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border"
            title="Refresh list"
          >
            <FiRefreshCw size={16} />
          </button>
          <Link
            to="/whatsapp-orders/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <FiPlus size={16} /> + New WhatsApp Order
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div
          onClick={() => { setStatusFilter(''); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === ''
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-2 ring-emerald-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:border-emerald-500/50'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-gray-400">Total</p>
          <p className="text-lg font-black text-gray-900 dark:text-white">{stats.total}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('new'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'new'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 ring-2 ring-yellow-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-yellow-600 dark:text-yellow-400">New</p>
          <p className="text-lg font-black text-yellow-600 dark:text-yellow-400">{stats.new}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('confirmed'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'confirmed'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-2 ring-blue-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">Confirmed</p>
          <p className="text-lg font-black text-blue-600 dark:text-blue-400">{stats.confirmed}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('processing'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'processing'
              ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 ring-2 ring-purple-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">Processing</p>
          <p className="text-lg font-black text-purple-600 dark:text-purple-400">{stats.processing}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('shipped'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'shipped'
              ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-500 ring-2 ring-cyan-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-cyan-600 dark:text-cyan-400">Shipped</p>
          <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">{stats.shipped}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('delivered'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'delivered'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-2 ring-emerald-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Delivered</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{stats.delivered}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('cancelled'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'cancelled'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 ring-2 ring-red-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-red-600 dark:text-red-400">Cancelled</p>
          <p className="text-lg font-black text-red-600 dark:text-red-400">{stats.cancelled}</p>
        </div>

        <div
          onClick={() => { setStatusFilter('returned'); setPage(1); }}
          className={`cursor-pointer p-3 rounded-2xl border transition-all ${
            statusFilter === 'returned'
              ? 'bg-gray-200 dark:bg-gray-800 border-gray-500 ring-2 ring-gray-500'
              : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border'
          }`}
        >
          <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-gray-400">Returned</p>
          <p className="text-lg font-black text-gray-600 dark:text-gray-300">{stats.returned}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer Name, Phone number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-xs dark:text-white font-medium"
        >
          <option value="">All Order Statuses</option>
          {ORDER_STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={paymentStatusFilter}
          onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-xs dark:text-white font-medium"
        >
          <option value="">All Payment Statuses</option>
          <option value="pending">PENDING</option>
          <option value="paid">PAID</option>
          <option value="failed">FAILED</option>
          <option value="refunded">REFUNDED</option>
        </select>
      </div>

      {/* ORDERS TABLE (MATCHING EXACT SCREENSHOT DESIGN) */}
      <div className="bg-white dark:bg-[#121824] rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 font-medium">Loading WhatsApp Orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <p className="text-base font-bold text-gray-800 dark:text-white">No WhatsApp Orders Found</p>
            <Link
              to="/whatsapp-orders/new"
              className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
            >
              + Create WhatsApp Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#182030] text-[11px] font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Total Price</th>
                  <th className="py-3.5 px-4">Payment Info</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 text-xs">
                {orders.map((ord) => {
                  const addrType = ord.shippingAddressSnapshot?.type || 'Home';
                  const grandTotal = ord.paymentDetails?.grandTotal || 0;
                  const isPaid = ord.paymentDetails?.status === 'paid';
                  const paidAmount = isPaid ? grandTotal : 0;

                  return (
                    <tr
                      key={ord._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-[#1a2334] transition-colors"
                    >
                      {/* Order ID + Address Badge */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/whatsapp-orders/${ord._id}`}
                            className="font-bold text-sm text-gray-900 dark:text-white hover:text-emerald-400 font-mono tracking-tight"
                          >
                            {ord.orderNumber}
                          </Link>
                          {ord.shippingAddressSnapshot?.type && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-900/40 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                              <FiHome size={10} />
                              {addrType}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 font-medium">
                        {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* Customer Name & Subtitle */}
                      <td className="py-4 px-4 max-w-[200px]">
                        <p
                          className="font-bold text-sm text-gray-900 dark:text-white truncate"
                          title={ord.customerName}
                        >
                          {ord.customerName && ord.customerName.includes(',')
                            ? ord.customerName.split(',')[0].trim()
                            : ord.customerName}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {ord.whatsappNumber} • Guest
                        </p>
                      </td>

                      {/* Total Price (Blue/Cyan Font) */}
                      <td className="py-4 px-4 font-black text-sm text-blue-600 dark:text-blue-400">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </td>

                      {/* Payment Status Dropdown Selector (Manually make it PAID/PENDING) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={ord.paymentDetails?.status || 'pending'}
                            onChange={(e) => handleInlinePaymentChange(ord, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase border cursor-pointer focus:outline-none transition-all ${
                              isPaid
                                ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50'
                                : 'bg-amber-900/30 text-amber-400 border-amber-500/50'
                            }`}
                          >
                            <option value="pending" className="bg-gray-900 text-amber-400 font-bold">PENDING</option>
                            <option value="paid" className="bg-gray-900 text-emerald-400 font-bold">PAID</option>
                            <option value="failed" className="bg-gray-900 text-red-400 font-bold">FAILED</option>
                            <option value="refunded" className="bg-gray-900 text-gray-400 font-bold">REFUNDED</option>
                          </select>
                          <span className="font-bold text-emerald-400 text-xs">
                            ₹{paidAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>

                      {/* Order Status Dropdown Selector (Manually make it SHIPPED/CONFIRMED/etc) */}
                      <td className="py-4 px-4">
                        <select
                          value={ord.status || 'new'}
                          onChange={(e) => handleInlineStatusChange(ord, e.target.value)}
                          className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border cursor-pointer focus:outline-none transition-all ${
                            ord.status === 'shipped' || ord.status === 'in_transit' || ord.status === 'out_for_delivery'
                              ? 'bg-blue-900/40 text-blue-300 border-blue-500/50'
                              : ord.status === 'delivered'
                              ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                              : ord.status === 'cancelled'
                              ? 'bg-red-900/40 text-red-300 border-red-500/50'
                              : 'bg-indigo-900/40 text-indigo-300 border-indigo-500/50'
                          }`}
                        >
                          {ORDER_STATUS_LIST.map((s) => (
                            <option key={s.value} value={s.value} className="bg-gray-900 text-white font-bold">
                              {s.label} ↕
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/whatsapp-orders/${ord._id}`}
                            className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <FiEye size={16} />
                          </Link>

                          <button
                            onClick={() => handleOpenWhatsApp(ord.whatsappNumber, ord.orderNumber)}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Open WhatsApp Chat"
                          >
                            <FiMessageSquare size={16} />
                          </button>

                          <Link
                            to={`/whatsapp-orders/${ord._id}`}
                            className="p-1.5 text-gray-400 hover:bg-gray-500/10 rounded-lg transition-colors"
                            title="Print Invoice"
                          >
                            <FiPrinter size={16} />
                          </Link>

                          <button
                            onClick={() => {
                              if (window.confirm(`Delete WhatsApp Order ${ord.orderNumber}?`)) {
                                deleteMutation.mutate(ord._id);
                              }
                            }}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Order"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800 text-xs">
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              Page {pagination.page} of {pagination.pages} ({pagination.total} orders)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 font-bold dark:text-white"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 disabled:opacity-40 font-bold dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiEye,
  FiTrash2,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw,
  FiPrinter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const ORDER_STATUS_LIST = [
  { value: 'new', label: 'NEW' },
  { value: 'paid', label: 'PAID' },
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
    let targetPaymentStatus = ord.paymentDetails?.status || 'pending';
    if (newStatus === 'paid') {
      targetPaymentStatus = 'paid';
    }

    statusMutation.mutate({
      id: ord._id,
      status: newStatus,
      paymentStatus: targetPaymentStatus,
      message: `Status manually changed to ${newStatus.toUpperCase()}`,
    });
    toast.success(`Status updated to ${newStatus.toUpperCase()}`);
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
    <div className="space-y-4 pb-12 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
            💬 WhatsApp Orders
          </h1>
          <p className="text-[11px] text-gray-500">Quick WhatsApp order list & status controls</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => refetch()}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border"
            title="Refresh list"
          >
            <FiRefreshCw size={14} />
          </button>
          <Link
            to="/whatsapp-orders/new"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1"
          >
            <FiPlus size={14} /> + New Order
          </Link>
        </div>
      </div>

      {/* Compact Summary Cards Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {[
          { key: '', label: 'Total', count: stats.total, color: 'text-white' },
          { key: 'new', label: 'New', count: stats.new, color: 'text-yellow-400' },
          { key: 'paid', label: 'Paid', count: stats.paid || 0, color: 'text-emerald-400' },
          { key: 'confirmed', label: 'Confirmed', count: stats.confirmed, color: 'text-blue-400' },
          { key: 'processing', label: 'Process', count: stats.processing, color: 'text-purple-400' },
          { key: 'shipped', label: 'Shipped', count: stats.shipped, color: 'text-cyan-400' },
          { key: 'delivered', label: 'Delivered', count: stats.delivered, color: 'text-emerald-400' },
          { key: 'cancelled', label: 'Cancel', count: stats.cancelled, color: 'text-red-400' },
        ].map((item) => (
          <div
            key={item.key}
            onClick={() => { setStatusFilter(item.key); setPage(1); }}
            className={`cursor-pointer p-2 rounded-xl border text-center transition-all ${
              statusFilter === item.key
                ? 'bg-emerald-900/30 border-emerald-500 ring-1 ring-emerald-500'
                : 'bg-white dark:bg-[#121824] border-gray-200 dark:border-gray-800'
            }`}
          >
            <p className="text-[9px] font-bold uppercase text-gray-400 truncate">{item.label}</p>
            <p className={`text-sm font-black ${item.color}`}>{item.count}</p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-[#121824] p-3 rounded-xl border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search Order ID, Customer Name, Phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-lg text-xs dark:text-white"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-gray-800 rounded-lg text-xs dark:text-white font-medium"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUS_LIST.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* MAIN CONTENT CONTAINER: Mobile Cards (sm:hidden) + Desktop Compact Table (hidden sm:block) */}
      <div className="bg-white dark:bg-[#121824] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 space-y-2">
            <p className="text-sm font-bold text-white">No WhatsApp Orders Found</p>
            <Link to="/whatsapp-orders/new" className="inline-block bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs">
              + Create Order
            </Link>
          </div>
        ) : (
          <>
            {/* 1. MOBILE COMPACT CARD VIEW (Visible only on screens < 640px) */}
            <div className="block sm:hidden divide-y divide-gray-100 dark:divide-gray-800">
              {orders.map((ord) => {
                const grandTotal = ord.paymentDetails?.grandTotal || 0;
                const cleanName = ord.customerName && ord.customerName.includes(',')
                  ? ord.customerName.split(',')[0].trim()
                  : ord.customerName;

                return (
                  <div key={ord._id} className="p-3 space-y-2">
                    {/* Top Row: Order # + Date + Total */}
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/whatsapp-orders/${ord._id}`}
                        className="font-extrabold text-sm text-white font-mono tracking-tight"
                      >
                        {ord.orderNumber}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                        </span>
                        <span className="font-black text-sm text-blue-400">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Customer Row */}
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white truncate max-w-[180px]">{cleanName}</p>
                      <span className="text-gray-400 font-mono text-[11px]">{ord.whatsappNumber}</span>
                    </div>

                    {/* Bottom Row: Status Dropdown + Action Icons */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-gray-800/80">
                      <select
                        value={ord.status || 'new'}
                        onChange={(e) => handleInlineStatusChange(ord, e.target.value)}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border cursor-pointer ${
                          ord.status === 'delivered' || ord.status === 'paid'
                            ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                            : ord.status === 'cancelled'
                            ? 'bg-red-900/40 text-red-300 border-red-500/50'
                            : 'bg-blue-900/40 text-blue-300 border-blue-500/50'
                        }`}
                      >
                        {ORDER_STATUS_LIST.map((s) => (
                          <option key={s.value} value={s.value} className="bg-gray-900 text-white font-bold">
                            {s.label} ↕
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-2">
                        <Link to={`/whatsapp-orders/${ord._id}`} className="p-1 text-blue-400 hover:bg-blue-500/10 rounded">
                          <FiEye size={15} />
                        </Link>
                        <button onClick={() => handleOpenWhatsApp(ord.whatsappNumber, ord.orderNumber)} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded">
                          <FiMessageSquare size={15} />
                        </button>
                        <Link to={`/whatsapp-orders/${ord._id}`} className="p-1 text-gray-400 hover:bg-gray-500/10 rounded">
                          <FiPrinter size={15} />
                        </Link>
                        <button onClick={() => { if (window.confirm(`Delete ${ord.orderNumber}?`)) deleteMutation.mutate(ord._id); }} className="p-1 text-red-400 hover:bg-red-500/10 rounded">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP COMPACT TABLE VIEW (Visible on screens >= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#182030] text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Total Price</th>
                    <th className="py-2.5 px-3">Order Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/70 text-xs">
                  {orders.map((ord) => {
                    const grandTotal = ord.paymentDetails?.grandTotal || 0;
                    const cleanName = ord.customerName && ord.customerName.includes(',')
                      ? ord.customerName.split(',')[0].trim()
                      : ord.customerName;

                    return (
                      <tr key={ord._id} className="hover:bg-[#1a2334] transition-colors">
                        {/* Order ID */}
                        <td className="py-2.5 px-3">
                          <Link to={`/whatsapp-orders/${ord._id}`} className="font-extrabold text-xs text-white hover:text-emerald-400 font-mono">
                            {ord.orderNumber}
                          </Link>
                        </td>

                        {/* Date */}
                        <td className="py-2.5 px-3 text-gray-400 font-medium">
                          {new Date(ord.createdAt).toLocaleDateString('en-GB')}
                        </td>

                        {/* Customer */}
                        <td className="py-2.5 px-3 max-w-[180px]">
                          <p className="font-bold text-xs text-white truncate" title={ord.customerName}>
                            {cleanName}
                          </p>
                          <p className="text-[10px] text-gray-400">{ord.whatsappNumber}</p>
                        </td>

                        {/* Total Price */}
                        <td className="py-2.5 px-3 font-black text-xs text-blue-400">
                          ₹{grandTotal.toLocaleString('en-IN')}
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-2.5 px-3">
                          <select
                            value={ord.status || 'new'}
                            onChange={(e) => handleInlineStatusChange(ord, e.target.value)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border cursor-pointer ${
                              ord.status === 'delivered' || ord.status === 'paid'
                                ? 'bg-emerald-900/40 text-emerald-300 border-emerald-500/50'
                                : ord.status === 'cancelled'
                                ? 'bg-red-900/40 text-red-300 border-red-500/50'
                                : 'bg-blue-900/40 text-blue-300 border-blue-500/50'
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
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link to={`/whatsapp-orders/${ord._id}`} className="p-1 text-blue-400 hover:bg-blue-500/10 rounded"><FiEye size={14} /></Link>
                            <button onClick={() => handleOpenWhatsApp(ord.whatsappNumber, ord.orderNumber)} className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"><FiMessageSquare size={14} /></button>
                            <Link to={`/whatsapp-orders/${ord._id}`} className="p-1 text-gray-400 hover:bg-gray-500/10 rounded"><FiPrinter size={14} /></Link>
                            <button onClick={() => { if (window.confirm(`Delete ${ord.orderNumber}?`)) deleteMutation.mutate(ord._id); }} className="p-1 text-red-400 hover:bg-red-500/10 rounded"><FiTrash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-gray-800 text-[11px]">
            <span className="text-gray-400">Page {pagination.page} of {pagination.pages}</span>
            <div className="flex gap-1.5">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2.5 py-1 rounded-lg border border-gray-800 disabled:opacity-30 font-bold text-white">Prev</button>
              <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="px-2.5 py-1 rounded-lg border border-gray-800 disabled:opacity-30 font-bold text-white">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
